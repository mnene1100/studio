
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  PhoneOff, Mic, MicOff, Video, VideoOff, 
  Volume2, VolumeX, Maximize2, Minimize2, AlertCircle, Loader2
} from "lucide-react";
import { useFirestore, useDoc, useMemoFirebase, useUser, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAgoraToken } from '@/app/actions/agora';

export default function CallPage() {
  const { id: targetUserId } = useParams();
  const searchParams = useSearchParams();
  const callType = searchParams.get('type') || 'video';
  const router = useRouter();
  const db = useFirestore();
  const { user: currentUser } = useUser();

  const [joined, setJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(callType === 'video');
  const [speakerOn, setSpeakerOn] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [configMissing, setConfigMissing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Initializing Secure Line...');

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const agoraClientRef = useRef<any>(null);
  const callIdRef = useRef<string | null>(null);
  
  const localAudioTrackRef = useRef<any>(null);
  const localVideoTrackRef = useRef<any>(null);

  const targetUserRef = useMemoFirebase(() => {
    if (!db || !targetUserId) return null;
    return doc(db, 'users', targetUserId as string);
  }, [db, targetUserId]);
  const { data: profile } = useDoc(targetUserRef);

  useEffect(() => {
    const initAgora = async () => {
      if (typeof window === 'undefined') return;

      try {
        const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
        
        if (!appId) {
          setConfigMissing(true);
          return;
        }

        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
        agoraClientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

        agoraClientRef.current.on("user-published", async (user: any, mediaType: string) => {
          await agoraClientRef.current.subscribe(user, mediaType);
          if (mediaType === "video") {
            setRemoteUsers((prev) => [...prev, user]);
          }
          if (mediaType === "audio") {
            user.audioTrack.play();
          }
        });

        agoraClientRef.current.on("user-unpublished", (user: any) => {
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
        });

        const channelName = [currentUser?.uid, targetUserId].sort().join('_');
        
        setStatusMessage('Requesting Permissions...');
        
        try {
          const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
            AEC: true,
            ANS: true,
            AGC: true,
          });
          localAudioTrackRef.current = audioTrack;

          if (callType === 'video') {
            const videoTrack = await AgoraRTC.createCameraVideoTrack();
            localVideoTrackRef.current = videoTrack;
          }
          setHasPermission(true);
        } catch (permError) {
          console.error("Permissions failed:", permError);
          setHasPermission(false);
          return;
        }

        setStatusMessage('Authenticating Session...');
        const result = await getAgoraToken(channelName, currentUser?.uid as string);
        
        if (result.error === 'AGORA_CONFIGURATION_MISSING') {
          setConfigMissing(true);
          return;
        }

        if (result.error || !result.token) {
          throw new Error(result.error || 'Token generation failed');
        }

        setStatusMessage('Joining Channel...');
        await agoraClientRef.current.join(appId, channelName, result.token, currentUser?.uid);

        const callId = `${currentUser?.uid}_${targetUserId}_${Date.now()}`;
        callIdRef.current = callId;
        const callRef = doc(db!, 'calls', callId);
        setDocumentNonBlocking(callRef, {
          id: callId,
          callerId: currentUser?.uid,
          participantIds: [currentUser?.uid, targetUserId],
          type: callType,
          startTime: new Date().toISOString(),
          status: 'ongoing'
        }, { merge: true });

        const tracksToPublish = [];
        if (localAudioTrackRef.current) tracksToPublish.push(localAudioTrackRef.current);
        if (callType === 'video' && localVideoTrackRef.current) {
          tracksToPublish.push(localVideoTrackRef.current);
          if (localVideoRef.current) {
            localVideoTrackRef.current.play(localVideoRef.current);
          }
        }

        if (tracksToPublish.length > 0) {
          await agoraClientRef.current.publish(tracksToPublish);
        }

        setJoined(true);
        setStatusMessage('Connected');
      } catch (error: any) {
        console.error("Call initialization failed:", error);
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: error.message || "Failed to establish a secure call. Please try again later.",
        });
        router.back();
      }
    };

    if (currentUser && targetUserId && db) {
      initAgora();
    }

    return () => {
      if (callIdRef.current && db) {
        const callRef = doc(db, 'calls', callIdRef.current);
        updateDocumentNonBlocking(callRef, {
          status: 'ended',
          endTime: new Date().toISOString()
        });
      }
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.stop();
        localVideoTrackRef.current.close();
        localVideoTrackRef.current = null;
      }
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }
      if (agoraClientRef.current) {
        agoraClientRef.current.leave();
      }
    };
  }, [currentUser, targetUserId, callType, router, db]);

  useEffect(() => {
    if (remoteUsers.length > 0 && remoteVideoRef.current) {
      remoteUsers[0].videoTrack?.play(remoteVideoRef.current);
    }
  }, [remoteUsers]);

  const handleEndCall = () => {
    router.back();
  };

  const toggleMic = async () => {
    if (localAudioTrackRef.current) {
      await localAudioTrackRef.current.setEnabled(!micOn);
      setMicOn(!micOn);
    }
  };

  const toggleCamera = async () => {
    if (localVideoTrackRef.current) {
      await localVideoTrackRef.current.setEnabled(!cameraOn);
      setCameraOn(!cameraOn);
    }
  };

  const displayName = profile?.displayName || "Contact";
  const initials = displayName.substring(0, 2).toUpperCase();

  if (configMissing) {
    return (
      <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center p-8">
        <Alert variant="destructive" className="bg-zinc-900 border-red-500/50 rounded-[2rem] p-8 shadow-2xl">
          <AlertCircle className="h-6 w-6 mb-4 text-red-500" />
          <AlertTitle className="text-xl font-black uppercase tracking-tight text-white">Agora ID Missing</AlertTitle>
          <AlertDescription className="text-[10px] font-medium text-white/50 leading-relaxed mt-2 uppercase tracking-widest">
            The calling engine has not been configured. Please add NEXT_PUBLIC_AGORA_APP_ID and AGORA_APP_CERTIFICATE to your environment variables. 
          </AlertDescription>
          <Button onClick={() => router.back()} className="mt-8 w-full bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-[0.2em] text-[10px] h-14 rounded-full">
            Exit
          </Button>
        </Alert>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center p-8">
        <Alert variant="destructive" className="bg-zinc-900 border-red-500/50 rounded-[2rem] p-8 shadow-2xl">
          <AlertCircle className="h-6 w-6 mb-4 text-red-500" />
          <AlertTitle className="text-xl font-black uppercase tracking-tight text-white">Access Denied</AlertTitle>
          <AlertDescription className="text-[10px] font-medium text-white/50 leading-relaxed mt-2 uppercase tracking-widest">
            NEXO requires {callType === 'video' ? 'Camera & Mic' : 'Microphone'} access. Please check your browser settings.
          </AlertDescription>
          <Button onClick={() => router.back()} className="mt-8 w-full bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-[0.2em] text-[10px] h-14 rounded-full">
            Exit Session
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col overflow-hidden">
      <div className="absolute inset-0 z-0">
        {callType === 'video' && remoteUsers.length > 0 ? (
          <div ref={remoteVideoRef} className="w-full h-full object-cover animate-in fade-in duration-700" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 premium-gradient">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-30" />
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse blur-3xl" />
              <Avatar className="w-40 h-40 border-8 border-white/5 shadow-[0_0_80px_rgba(40,180,164,0.3)] relative z-10 rounded-full">
                <AvatarImage src={profile?.profilePictureUrl} className="object-cover rounded-full" />
                <AvatarFallback className="bg-primary/10 text-primary text-4xl font-black rounded-full">{initials}</AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-16 text-center z-10">
              <h2 className="text-3xl font-black text-white tracking-tighter mb-3 drop-shadow-2xl">{displayName}</h2>
              <div className="flex flex-col items-center space-y-4">
                <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em] animate-pulse">
                  {statusMessage}
                </p>
                {callType === 'audio' && joined && (
                  <div className="flex flex-col items-center animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center space-x-2 bg-primary/10 px-5 py-2.5 rounded-full border border-primary/20 shadow-lg">
                      <Volume2 className="w-3 h-3 text-primary animate-bounce" />
                      <span className="text-[9px] font-black text-white uppercase tracking-widest">Handset Mode</span>
                    </div>
                  </div>
                )}
                {!joined && !configMissing && <Loader2 className="w-6 h-6 text-white/20 animate-spin mt-4" />}
              </div>
            </div>
          </div>
        )}
      </div>

      {callType === 'video' && cameraOn && (
        <div 
          className={cn(
            "absolute z-40 transition-all duration-500 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl bg-black ring-4 ring-black/50",
            isMinimized 
              ? "bottom-40 right-6 w-24 h-24" 
              : "top-20 right-6 w-32 h-32"
          )}
          ref={localVideoRef}
          onClick={() => setIsMinimized(!isMinimized)}
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
            joined ? "bg-green-500 shadow-green-500/50 animate-pulse" : "bg-orange-500 shadow-orange-500/50"
          )} />
          <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">
            {joined ? (callType === 'video' ? 'Live Encrypted' : 'Voice Secure') : 'Connecting...'}
          </span>
        </div>
        <div className="w-12 h-12" />
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
            onClick={handleEndCall}
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
