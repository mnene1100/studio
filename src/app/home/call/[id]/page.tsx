
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  PhoneOff, Mic, MicOff, Video, VideoOff, 
  Volume2, VolumeX, Maximize2, Minimize2, AlertCircle
} from "lucide-react";
import { useFirestore, useDoc, useMemoFirebase, useUser, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc, updateDoc, increment, getDoc, onSnapshot } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { getAgoraToken } from '@/app/actions/agora';
import { useHomeData } from '../../layout';

export default function CallPage() {
  const { id: targetUserId } = useParams();
  const searchParams = useSearchParams();
  const callType = searchParams.get('type') || 'video';
  const router = useRouter();
  const db = useFirestore();
  const { user: currentUser } = useUser();
  const { profile: currentUserProfile } = useHomeData();

  const [joined, setJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(callType === 'video');
  const [speakerOn, setSpeakerOn] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Calling...');

  const localVideoRef = useRef<HTMLDivElement>(null);
  const agoraClientRef = useRef<any>(null);
  const callIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const initializationStartedRef = useRef(false);
  const billingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectedRef = useRef(false);
  const lastBilledSecondRef = useRef<number>(-1);
  
  const localAudioTrackRef = useRef<any>(null);
  const localVideoTrackRef = useRef<any>(null);

  const targetUserRef = useMemoFirebase(() => {
    if (!db || !targetUserId) return null;
    return doc(db, 'users', targetUserId as string);
  }, [db, targetUserId]);
  const { data: targetProfile } = useDoc(targetUserRef);

  const handleEndCall = (finalStatus?: string) => {
    const isConnected = isConnectedRef.current;
    const status = finalStatus || (isConnected ? 'ended' : 'cancelled');
    const endTime = Date.now();
    let durationSeconds = 0;
    
    if (startTimeRef.current && isConnected) {
      durationSeconds = Math.floor((endTime - startTimeRef.current) / 1000);
    }
    
    if (callIdRef.current && db) {
      updateDocumentNonBlocking(doc(db, 'calls', callIdRef.current), {
        status: status,
        endTime: new Date(endTime).toISOString(),
        durationSeconds: durationSeconds
      });
    }
    router.back();
  };

  useEffect(() => {
    if (!db || !callIdRef.current) return;
    
    const unsubscribe = onSnapshot(doc(db, 'calls', callIdRef.current), (snapshot) => {
      const data = snapshot.data();
      if (data?.status === 'rejected') {
        toast({
          variant: "destructive",
          title: "Call Rejected",
          description: "The other user declined the call.",
        });
        handleEndCall('rejected');
      }
    });

    return () => unsubscribe();
  }, [db, callIdRef.current]);

  useEffect(() => {
    const isCallConnected = remoteUsers.length > 0;
    
    if (isCallConnected && !isConnectedRef.current) {
      isConnectedRef.current = true;
      startTimeRef.current = Date.now();
      setStatusMessage('Connected');
    }

    if (!isCallConnected || !currentUser || !db || billingIntervalRef.current) return;

    const costPerMin = callType === 'video' ? 160 : 80;
    
    const deductCoins = async () => {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      const latestData = userSnap.data();
      const latestBalance = latestData?.balance ?? 0;
      
      // Exemption for Admin, CoinSeller, Support
      if (latestData?.isAdmin || latestData?.isCoinSeller || latestData?.isSupport) {
        return true;
      }

      if (latestBalance < costPerMin) {
        toast({
          variant: "destructive",
          title: "Insufficient Balance",
          description: "Call ended due to low balance.",
        });
        handleEndCall('insufficient_balance');
        return false;
      }

      try {
        await updateDoc(userRef, { balance: increment(-costPerMin) });
        
        const billingId = `bill_${Date.now()}_${currentUser.uid}`;
        setDocumentNonBlocking(doc(db, 'transactions', billingId), {
          id: billingId,
          userId: currentUser.uid,
          type: 'call_billing',
          coins: costPerMin,
          description: `${callType === 'video' ? 'Video' : 'Voice'} Call Session`,
          createdAt: new Date().toISOString(),
          status: 'completed'
        }, { merge: true });

        return true;
      } catch (e) {
        handleEndCall('billing_error');
        return false;
      }
    };

    // Billing Timer Monitor
    billingIntervalRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      // Prevent multiple deductions within the same second tick
      if (elapsedSeconds === lastBilledSecondRef.current) return;

      // RULE: First 10 seconds free. Deduct first minute at 11th second.
      if (elapsedSeconds === 11) {
        deductCoins();
        lastBilledSecondRef.current = elapsedSeconds;
      }

      // RULE: Subsequent minutes deduct at the start of the minute (60, 120, 180...)
      if (elapsedSeconds >= 60 && elapsedSeconds % 60 === 0) {
        deductCoins();
        lastBilledSecondRef.current = elapsedSeconds;
      }
    }, 1000);

    return () => {
      if (billingIntervalRef.current) {
        clearInterval(billingIntervalRef.current);
        billingIntervalRef.current = null;
      }
    };
  }, [remoteUsers.length, currentUser?.uid, db, callType]);

  useEffect(() => {
    if (initializationStartedRef.current || !currentUser || !targetUserId || !db || !currentUserProfile) return;
    initializationStartedRef.current = true;

    const initAgora = async () => {
      if (typeof window === 'undefined') return;

      try {
        const costPerMin = callType === 'video' ? 160 : 80;
        const currentBalance = currentUserProfile?.balance ?? 0;
        const isPrivileged = currentUserProfile?.isAdmin || currentUserProfile?.isCoinSeller || currentUserProfile?.isSupport;

        if (!isPrivileged && currentBalance < costPerMin) {
          toast({
            variant: 'destructive',
            title: 'Insufficient Balance',
            description: `You need at least ${costPerMin} coins to start a call.`,
          });
          handleEndCall('insufficient_balance');
          return;
        }

        const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
        if (!appId) {
          setErrorMessage('AGORA_CONFIGURATION_MISSING');
          return;
        }

        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
        agoraClientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

        agoraClientRef.current.on("user-published", async (user: any, mediaType: string) => {
          await agoraClientRef.current.subscribe(user, mediaType);
          setRemoteUsers((prev) => {
            if (prev.find(u => u.uid === user.uid)) return prev;
            return [...prev, user];
          });
          if (mediaType === "audio") user.audioTrack.play();
        });

        agoraClientRef.current.on("user-unpublished", (user: any) => {
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
        });

        const channelName = [currentUser.uid, targetUserId].sort().join('_');
        
        try {
          const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({ AEC: true, ANS: true, AGC: true });
          localAudioTrackRef.current = audioTrack;
          if (callType === 'video') {
            localVideoTrackRef.current = await AgoraRTC.createCameraVideoTrack();
          }
          setHasPermission(true);
        } catch (permError) {
          setHasPermission(false);
          return;
        }

        const result = await getAgoraToken(channelName, currentUser.uid);
        if (result.error || !result.token) {
          setErrorMessage(result.error || 'TOKEN_NOT_RECEIVED');
          return;
        }

        await agoraClientRef.current.join(appId, channelName, result.token, currentUser.uid);

        const now = new Date().toISOString();
        const callId = `${currentUser.uid}_${targetUserId}_${Date.now()}`;
        callIdRef.current = callId;

        // 1. Create Call Document
        setDocumentNonBlocking(doc(db, 'calls', callId), {
          id: callId,
          callerId: currentUser.uid,
          participantIds: [currentUser.uid, targetUserId],
          chatRoomId: channelName,
          type: callType,
          startTime: now,
          status: 'ongoing'
        }, { merge: true });

        // 2. Update Chat Room to show activity in list
        const chatRef = doc(db, 'chatRooms', channelName);
        setDocumentNonBlocking(chatRef, {
          id: channelName,
          type: 'private',
          participantIds: [currentUser.uid, targetUserId as string],
          updatedAt: now,
          lastMessageSentAt: now,
          lastMessageContent: callType === 'video' ? 'Video Call initiated' : 'Voice Call initiated',
          hiddenBy: {}
        }, { merge: true });

        const tracks = [];
        if (localAudioTrackRef.current) {
          await localAudioTrackRef.current.setEnabled(true);
          tracks.push(localAudioTrackRef.current);
        }
        if (callType === 'video' && localVideoTrackRef.current) {
          await localVideoTrackRef.current.setEnabled(true);
          tracks.push(localVideoTrackRef.current);
          
          setTimeout(() => {
            if (localVideoRef.current && localVideoTrackRef.current) {
              localVideoTrackRef.current.play(localVideoRef.current);
            }
          }, 200);
        }

        if (tracks.length > 0) {
          await agoraClientRef.current.publish(tracks);
        }
        setJoined(true);
      } catch (error: any) {
        console.error("Agora Init Error:", error);
        setErrorMessage(error.message || 'CONNECTION_FAILED');
      }
    };

    initAgora();

    return () => {
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.stop();
        localVideoTrackRef.current.close();
      }
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
      }
      if (agoraClientRef.current) {
        agoraClientRef.current.leave();
      }
      if (billingIntervalRef.current) {
        clearInterval(billingIntervalRef.current);
      }
    };
  }, [currentUser?.uid, targetUserId, callType, db]);

  const toggleMic = async () => {
    if (localAudioTrackRef.current) {
      await localAudioTrackRef.current.setEnabled(!micOn);
      setMicOn(!micOn);
    }
  };

  const toggleCamera = async () => {
    if (localVideoTrackRef.current) {
      const newState = !cameraOn;
      await localVideoTrackRef.current.setEnabled(newState);
      setCameraOn(newState);
      if (newState && localVideoRef.current) {
        localVideoTrackRef.current.play(localVideoRef.current);
      }
    }
  };

  const displayName = targetProfile?.displayName || "Contact";
  const initials = displayName.substring(0, 2).toUpperCase();

  if (errorMessage) {
    return (
      <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center p-8 text-center">
        <div className="bg-zinc-900 border border-red-500/50 rounded-[2.5rem] p-8 shadow-2xl max-w-xs w-full">
          <AlertCircle className="h-8 w-8 mb-4 text-red-500 mx-auto" />
          <h2 className="text-xl font-black uppercase tracking-tight text-white">Call Error</h2>
          <p className="text-[10px] font-medium text-white/50 leading-relaxed mt-2 uppercase tracking-widest">
            {errorMessage}
          </p>
          <Button onClick={() => handleEndCall('error')} className="mt-8 w-full bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-[0.2em] text-[10px] h-14 rounded-full">
            Exit Session
          </Button>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center p-8">
        <div className="bg-zinc-900 border border-red-500/50 rounded-[2.5rem] p-8 shadow-2xl text-center max-w-xs w-full">
          <AlertCircle className="h-8 w-8 mb-4 text-red-500 mx-auto" />
          <h2 className="text-xl font-black uppercase tracking-tight text-white">Access Denied</h2>
          <p className="text-[10px] font-medium text-white/50 leading-relaxed mt-2 uppercase tracking-widest">
            NEXO requires {callType === 'video' ? 'Camera & Mic' : 'Microphone'} access.
          </p>
          <Button onClick={() => handleEndCall('permission_denied')} className="mt-8 w-full bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-[0.2em] text-[10px] h-14 rounded-full">
            Exit Session
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col overflow-hidden">
      <div className="absolute inset-0 z-0">
        {callType === 'video' && remoteUsers.length > 0 ? (
          <div 
            ref={(node) => {
              if (node && remoteUsers[0]?.videoTrack) {
                remoteUsers[0].videoTrack.play(node);
              }
            }} 
            className="w-full h-full object-cover animate-in fade-in duration-700" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 premium-gradient">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-30" />
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse blur-3xl" />
              <Avatar className="w-40 h-40 border-8 border-white/5 shadow-[0_0_80px_rgba(40,180,164,0.3)] relative z-10 rounded-full overflow-hidden">
                <AvatarImage src={targetProfile?.profilePictureUrl} className="object-cover rounded-full" />
                <AvatarFallback className="bg-primary/10 text-primary text-4xl font-black rounded-full">{initials}</AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-16 text-center z-10">
              <h2 className="text-3xl font-black text-white tracking-tighter mb-3 drop-shadow-2xl">{displayName}</h2>
              <div className="flex flex-col items-center space-y-4">
                <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em] animate-pulse">
                  {statusMessage}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {callType === 'video' && (
        <div 
          className={cn(
            "fixed z-40 transition-all duration-500 rounded-3xl overflow-hidden shadow-2xl bg-black aspect-[3/4] top-24 right-6 w-24",
            !cameraOn ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
          ref={localVideoRef}
        />
      )}

      <div className="absolute top-0 left-0 right-0 safe-top p-6 z-50 flex items-center justify-between">
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className="w-12 h-12 bg-white/5 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shadow-2xl"
        >
          {isMinimized ? <Maximize2 className="w-5 h-5 text-white" /> : <Minimize2 className="w-5 h-5 text-white" />}
        </button>
        <div className="bg-black/40 backdrop-blur-3xl px-6 py-3 rounded-full border border-white/10 flex items-center space-x-3 shadow-2xl">
          <div className={cn(
            "w-2 h-2 rounded-full shadow-[0_0_15px]",
            remoteUsers.length > 0 ? "bg-green-500 shadow-green-500/50 animate-pulse" : "bg-orange-500 shadow-orange-500/50"
          )} />
          <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">
            {remoteUsers.length > 0 ? (callType === 'video' ? 'Live Encrypted' : 'Voice Secure') : 'Calling...'}
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 pb-20 pt-20 px-10 z-50 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="flex items-center justify-around max-w-sm mx-auto">
          <button 
            onClick={toggleMic}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center border transition-all active:scale-90 shadow-2xl",
              micOn ? "bg-white/5 border-white/10 text-white" : "bg-red-500 border-red-500 text-white shadow-red-500/40"
            )}
          >
            {micOn ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
          </button>

          <button 
            onClick={() => handleEndCall()}
            className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center shadow-[0_20px_60px_rgba(239,68,68,0.4)] active:scale-95 transition-all border-4 border-black ring-1 ring-white/10"
          >
            <PhoneOff className="w-10 h-10 text-white" />
          </button>

          {callType === 'video' ? (
            <button 
              onClick={toggleCamera}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center border transition-all active:scale-90 shadow-2xl",
                cameraOn ? "bg-white/5 border-white/10 text-white" : "bg-red-500 border-red-500 text-white shadow-red-500/40"
              )}
            >
              {cameraOn ? <Video className="w-7 h-7" /> : <VideoOff className="w-7 h-7" />}
            </button>
          ) : (
            <button 
              onClick={() => setSpeakerOn(!speakerOn)}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center border transition-all active:scale-90 shadow-2xl",
                speakerOn ? "bg-primary border-primary text-white shadow-primary/30" : "bg-white/5 border-white/10 text-white/40"
              )}
            >
              {speakerOn ? <Volume2 className="w-7 h-7" /> : <VolumeX className="w-7 h-7" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
