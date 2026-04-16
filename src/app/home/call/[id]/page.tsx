
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  PhoneOff, Mic, MicOff, Video, VideoOff, 
  Volume2, VolumeX, Maximize2, Minimize2, AlertCircle
} from "lucide-react";
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function CallPage() {
  const { id: targetUserId } = useParams();
  const searchParams = useSearchParams();
  const callType = searchParams.get('type') || 'video'; // 'video' or 'audio'
  const router = useRouter();
  const db = useFirestore();
  const { user: currentUser } = useUser();

  const [joined, setJoined] = useState(false);
  const [localVideoTrack, setLocalVideoTrack] = useState<any>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<any>(null);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(callType === 'video');
  const [speakerOn, setSpeakerOn] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const agoraClientRef = useRef<any>(null);

  // Get Target User Profile
  const targetUserRef = useMemoFirebase(() => {
    if (!db || !targetUserId) return null;
    return doc(db, 'userProfiles', targetUserId as string);
  }, [db, targetUserId]);
  const { data: profile } = useDoc(targetUserRef);

  useEffect(() => {
    const initAgora = async () => {
      if (typeof window === 'undefined') return;

      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
      
      if (!appId) {
        toast({
          variant: "destructive",
          title: "Agora App ID Missing",
          description: "Please configure NEXT_PUBLIC_AGORA_APP_ID in your environment.",
        });
        return;
      }

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

      try {
        const channelName = [currentUser?.uid, targetUserId].sort().join('_');
        
        let audioTrack;
        let videoTrack;

        try {
          // Request permissions based on call type
          audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
            AEC: true,
            ANS: true,
            AGC: true,
          });
          setLocalAudioTrack(audioTrack);

          if (callType === 'video') {
            videoTrack = await AgoraRTC.createCameraVideoTrack();
            setLocalVideoTrack(videoTrack);
          }
          setHasPermission(true);
        } catch (permError) {
          console.error("Permission error:", permError);
          setHasPermission(false);
          return;
        }

        await agoraClientRef.current.join(appId, channelName, null, currentUser?.uid);

        if (callType === 'video' && videoTrack) {
          await agoraClientRef.current.publish([audioTrack, videoTrack]);
          if (localVideoRef.current) {
            videoTrack.play(localVideoRef.current);
          }
        } else {
          await agoraClientRef.current.publish([audioTrack]);
          // Note: In audio-only calls, browsers typically default to handset routing
        }

        setJoined(true);
      } catch (error: any) {
        console.error("Agora join error:", error);
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: "Could not establish a secure call connection.",
        });
      }
    };

    if (currentUser && targetUserId) {
      initAgora();
    }

    return () => {
      localVideoTrack?.stop();
      localVideoTrack?.close();
      localAudioTrack?.stop();
      localAudioTrack?.close();
      agoraClientRef.current?.leave();
    };
  }, [currentUser, targetUserId, callType]);

  useEffect(() => {
    if (remoteUsers.length > 0 && remoteVideoRef.current) {
      remoteUsers[0].videoTrack?.play(remoteVideoRef.current);
    }
  }, [remoteUsers]);

  const handleEndCall = () => {
    router.back();
  };

  const toggleMic = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!micOn);
      setMicOn(!micOn);
    }
  };

  const toggleCamera = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!cameraOn);
      setCameraOn(!cameraOn);
    }
  };

  const displayName = profile?.displayName || "Contact";
  const initials = displayName.substring(0, 2).toUpperCase();

  if (hasPermission === false) {
    return (
      <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center p-8">
        <Alert variant="destructive" className="bg-zinc-900 border-red-500/50 rounded-[2.5rem] p-8">
          <AlertCircle className="h-6 w-6 mb-4" />
          <AlertTitle className="text-xl font-black uppercase tracking-tight">Permission Required</AlertTitle>
          <AlertDescription className="text-xs font-medium text-white/60 leading-relaxed mt-2">
            NEXO needs access to your {callType === 'video' ? 'camera and microphone' : 'microphone'} to start this call. Please enable them in your browser settings and try again.
          </AlertDescription>
          <Button onClick={() => router.back()} className="mt-8 w-full bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-[0.2em] text-[10px] h-14 rounded-2xl">
            Go Back
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col overflow-hidden">
      {/* Immersive View */}
      <div className="absolute inset-0 z-0">
        {callType === 'video' && remoteUsers.length > 0 ? (
          <div ref={remoteVideoRef} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 premium-gradient">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
              <Avatar className="w-32 h-32 border-4 border-white/10 shadow-2xl scale-110">
                <AvatarImage src={profile?.profilePictureUrl} />
                <AvatarFallback className="bg-primary/20 text-primary text-3xl font-black">{initials}</AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-12 text-center">
              <h2 className="text-2xl font-black text-white tracking-tight mb-2">{displayName}</h2>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] animate-pulse">
                {joined ? 'Secure HD Line' : 'Connecting...'}
              </p>
              {callType === 'audio' && joined && (
                <div className="mt-6 flex flex-col items-center">
                  <p className="text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-5 py-2 rounded-full inline-block border border-primary/20">
                    Handset Mode Active
                  </p>
                  <p className="mt-3 text-[8px] font-medium text-white/30 uppercase tracking-widest">Hold to your ear</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Picture in Picture */}
      {callType === 'video' && cameraOn && (
        <div 
          className={cn(
            "absolute z-20 transition-all duration-500 rounded-[2.5rem] overflow-hidden border-2 border-white/10 shadow-2xl bg-black",
            isMinimized 
              ? "bottom-36 right-6 w-28 h-40" 
              : "top-14 right-6 w-36 h-52"
          )}
          ref={localVideoRef}
          onClick={() => setIsMinimized(!isMinimized)}
        />
      )}

      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 safe-top p-6 z-30 flex items-center justify-between">
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className="w-12 h-12 bg-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
        >
          {isMinimized ? <Maximize2 className="w-5 h-5 text-white" /> : <Minimize2 className="w-5 h-5 text-white" />}
        </button>
        <div className="bg-black/40 backdrop-blur-2xl px-5 py-2.5 rounded-full border border-white/5 flex items-center space-x-2.5 shadow-xl">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">
            {callType === 'video' ? 'Video Encrypted' : 'Voice Secure'}
          </span>
        </div>
        <div className="w-12 h-12" />
      </div>

      {/* Footer Controls */}
      <div className="absolute bottom-0 left-0 right-0 pb-16 pt-16 px-8 z-30 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="flex items-center justify-around max-w-sm mx-auto">
          <button 
            onClick={toggleMic}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center border transition-all active:scale-90 shadow-lg",
              micOn ? "bg-white/10 border-white/20 text-white" : "bg-red-500 border-red-500 text-white shadow-red-500/30"
            )}
          >
            {micOn ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
          </button>

          <button 
            onClick={handleEndCall}
            className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/40 active:scale-95 transition-all border-4 border-black ring-8 ring-red-500/10"
          >
            <PhoneOff className="w-10 h-10 text-white" />
          </button>

          {callType === 'video' ? (
            <button 
              onClick={toggleCamera}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center border transition-all active:scale-90 shadow-lg",
                cameraOn ? "bg-white/10 border-white/20 text-white" : "bg-red-500 border-red-500 text-white shadow-red-500/30"
              )}
            >
              {cameraOn ? <Video className="w-7 h-7" /> : <VideoOff className="w-7 h-7" />}
            </button>
          ) : (
            <button 
              onClick={() => setSpeakerOn(!speakerOn)}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center border transition-all active:scale-90 shadow-lg",
                speakerOn ? "bg-white/10 border-white/20 text-white" : "bg-zinc-800 border-white/5 text-white/50"
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
