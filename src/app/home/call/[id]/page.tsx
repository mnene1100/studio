
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

  // 1. Get Target User Profile
  const targetUserRef = useMemoFirebase(() => {
    if (!db || !targetUserId) return null;
    return doc(db, 'userProfiles', targetUserId as string);
  }, [db, targetUserId]);
  const { data: profile } = useDoc(targetUserRef);

  // Agora Initialization
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

      // Event handlers
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

      // Join Channel and Request Permissions
      try {
        const channelName = [currentUser?.uid, targetUserId].sort().join('_');
        
        // Request Permissions based on call type
        let audioTrack;
        let videoTrack;

        try {
          audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
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

        // Publish Tracks
        if (callType === 'video' && videoTrack) {
          await agoraClientRef.current.publish([audioTrack, videoTrack]);
          if (localVideoRef.current) {
            videoTrack.play(localVideoRef.current);
          }
        } else {
          await agoraClientRef.current.publish([audioTrack]);
        }

        setJoined(true);
      } catch (error: any) {
        console.error("Agora join error:", error);
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: "Could not establish a call connection.",
        });
      }
    };

    if (currentUser && targetUserId) {
      initAgora();
    }

    return () => {
      // Cleanup
      localVideoTrack?.stop();
      localVideoTrack?.close();
      localAudioTrack?.stop();
      localAudioTrack?.close();
      agoraClientRef.current?.leave();
    };
  }, [currentUser, targetUserId, callType]);

  // Handle Remote Video Rendering
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
        <Alert variant="destructive" className="bg-zinc-900 border-red-500/50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Permission Denied</AlertTitle>
          <AlertDescription>
            NEXO needs access to your {callType === 'video' ? 'camera and microphone' : 'microphone'} to start the call. Please enable them in your browser settings.
          </AlertDescription>
          <Button onClick={() => router.back()} className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[10px]">
            Back to Chat
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col overflow-hidden">
      {/* Background/Remote Video View */}
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
                <p className="text-[9px] font-bold text-primary mt-4 uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full inline-block">
                  Handset Mode Active
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Local Video Overlay (PIP) */}
      {callType === 'video' && cameraOn && (
        <div 
          className={cn(
            "absolute z-20 transition-all duration-500 rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-2xl bg-black",
            isMinimized 
              ? "bottom-32 right-6 w-24 h-36" 
              : "top-12 right-6 w-32 h-48"
          )}
          ref={localVideoRef}
          onClick={() => setIsMinimized(!isMinimized)}
        />
      )}

      {/* Top Header Controls */}
      <div className="absolute top-0 left-0 right-0 safe-top p-6 z-30 flex items-center justify-between">
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10"
        >
          {isMinimized ? <Maximize2 className="w-5 h-5 text-white" /> : <Minimize2 className="w-5 h-5 text-white" />}
        </button>
        <div className="bg-black/20 backdrop-blur-xl px-4 py-2 rounded-full border border-white/5 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-black text-white uppercase tracking-widest">
            {callType === 'video' ? 'Video Encrypted' : 'Voice Encrypted'}
          </span>
        </div>
        <div className="w-10 h-10" /> {/* Spacer */}
      </div>

      {/* Bottom Main Controls */}
      <div className="absolute bottom-0 left-0 right-0 pb-16 pt-12 px-8 z-30 bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="flex items-center justify-around max-w-sm mx-auto">
          {/* Mic Toggle */}
          <button 
            onClick={toggleMic}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center border transition-all active:scale-90",
              micOn ? "bg-white/10 border-white/20 text-white" : "bg-red-500 border-red-500 text-white"
            )}
          >
            {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>

          {/* End Call (Center Piece) */}
          <button 
            onClick={handleEndCall}
            className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/40 active:scale-90 transition-all border-4 border-black ring-4 ring-red-500/20"
          >
            <PhoneOff className="w-8 h-8 text-white" />
          </button>

          {/* Camera/Speaker Toggle */}
          {callType === 'video' ? (
            <button 
              onClick={toggleCamera}
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center border transition-all active:scale-90",
                cameraOn ? "bg-white/10 border-white/20 text-white" : "bg-red-500 border-red-500 text-white"
              )}
            >
              {cameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>
          ) : (
            <button 
              onClick={() => setSpeakerOn(!speakerOn)}
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center border transition-all active:scale-90",
                speakerOn ? "bg-white/10 border-white/20 text-white" : "bg-zinc-800 border-white/5 text-white/50"
              )}
            >
              {speakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
