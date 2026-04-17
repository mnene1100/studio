"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, BadgeCheck, 
  UserCheck, Loader2, Sparkles, Check,
  Camera, X, AlertCircle
} from "lucide-react";
import { useHomeData } from '../../layout';
import { useFirestore, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { verifyProfilePhoto } from '@/ai/flows/verify-profile-photo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function VerifyProfilePage() {
  const router = useRouter();
  const { profile } = useHomeData();
  const { user } = useUser();
  const db = useFirestore();

  const [isVerifying, setIsVerifying] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (showCamera) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to verify your identity.',
          });
        }
      };
      getCameraPermission();
    } else {
      // Stop stream when camera is closed
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [showCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUri = canvasRef.current.toDataURL('image/jpeg');
        setCapturedPhoto(dataUri);
        setShowCamera(false);
      }
    }
  };

  const handleVerify = async () => {
    if (!db || !user?.uid || !profile?.profilePictureUrl || !capturedPhoto) return;

    setIsVerifying(true);
    try {
      const result = await verifyProfilePhoto({
        profilePhotoDataUri: profile.profilePictureUrl,
        livePhotoDataUri: capturedPhoto
      });

      if (result.isMatch) {
        const userRef = doc(db, 'users', user.uid);
        updateDocumentNonBlocking(userRef, {
          isVerified: true
        });

        toast({
          title: "Verification Successful",
          description: "Your identity has been confirmed! Enjoy your Official Badge.",
        });
        router.back();
      } else {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: result.reasoning || "The live photo does not match your profile picture. Please try again with a clearer photo.",
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "System Error",
        description: "An error occurred during AI analysis. Please try again later.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (!profile) return null;

  if (showCamera) {
    return (
      <div className="fixed inset-0 bg-black z-[100] flex flex-col">
        <header className="safe-top p-6 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setShowCamera(false)} className="text-white bg-white/10 rounded-full">
            <X className="w-6 h-6" />
          </Button>
          <h2 className="text-sm font-black text-white uppercase tracking-widest italic">Live Identity Check</h2>
          <div className="w-10 h-10" />
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="relative w-full aspect-[3/4] max-w-sm rounded-[3rem] overflow-hidden bg-zinc-900 border-4 border-white/10 shadow-2xl">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40 flex items-center justify-center">
               <div className="w-full h-full border-2 border-primary/50 rounded-full opacity-30 animate-pulse" />
            </div>
            {hasCameraPermission === false && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/80">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-white font-bold text-sm uppercase tracking-widest">Camera access required to verify your identity</p>
                <Button variant="outline" onClick={() => setShowCamera(false)} className="mt-6 border-white/20 text-white rounded-full uppercase tracking-widest text-[10px]">Go Back</Button>
              </div>
            )}
          </div>
          <p className="mt-8 text-[10px] font-black text-white/50 uppercase tracking-[0.3em] text-center px-10">
            Position your face inside the circle and tap capture
          </p>
        </div>

        <div className="p-12 flex justify-center pb-20">
          <button 
            onClick={handleCapture}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all border-[6px] border-primary/20"
          >
            <div className="w-14 h-14 bg-white border-4 border-black/10 rounded-full" />
          </button>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-primary safe-top sticky top-0 z-50 shrink-0">
        <div className="px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-sm font-black text-white tracking-[0.2em] uppercase italic">Verification</h1>
          <div className="w-10 h-10" />
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center space-y-10 py-10">
        <div className="relative">
          <div className="w-32 h-32 bg-primary/10 rounded-[3.5rem] flex items-center justify-center border-4 border-primary/20 relative shadow-2xl">
            {capturedPhoto ? (
              <img src={capturedPhoto} alt="Live Capture" className="w-full h-full object-cover rounded-[3rem]" />
            ) : (
              <UserCheck className="w-16 h-16 text-primary" />
            )}
            {profile.isVerified && (
              <div className="absolute -top-4 -right-4 bg-green-500 p-2 rounded-full border-4 border-card shadow-xl">
                <Check className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
          <Sparkles className="absolute -top-2 -left-2 w-8 h-8 text-primary animate-pulse" />
        </div>

        <div className="space-y-4 max-w-xs">
          <h2 className="text-2xl font-black text-foreground tracking-tight uppercase italic">
            {profile.isVerified ? "Already Verified" : (capturedPhoto ? "Confirm Snapshot" : "Identity Check")}
          </h2>
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">
            {profile.isVerified 
              ? "You have a confirmed identity badge. Changing your avatar will revoke this status." 
              : "We will compare a live snapshot with your profile picture using secure AI analysis."}
          </p>
        </div>

        {!profile.isVerified && (
          <div className="w-full space-y-4">
            {!profile.profilePictureUrl && (
              <Alert variant="destructive" className="rounded-[2rem] bg-red-50 border-red-100">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-[10px] font-black uppercase tracking-tight">Avatar Required</AlertTitle>
                <AlertDescription className="text-[9px] font-bold uppercase">
                  Please upload a clear profile photo in settings first.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center space-x-4 p-5 bg-card rounded-[2rem] border border-border shadow-sm">
              <div className="w-10 h-10 bg-background rounded-xl shadow-sm flex items-center justify-center shrink-0">
                <BadgeCheck className="w-6 h-6 text-primary fill-primary/10" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-black text-foreground uppercase">Trust Badge</p>
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Confirmed Real Profile</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {!profile.isVerified && (
        <div className="fixed bottom-10 left-8 right-8 z-40 flex flex-col space-y-3">
          {capturedPhoto ? (
            <>
              <Button 
                onClick={handleVerify}
                disabled={isVerifying}
                className="w-full h-16 bg-primary text-white font-black rounded-[2rem] text-[11px] uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all"
              >
                {isVerifying ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify Comparison"}
              </Button>
              <Button 
                variant="ghost"
                onClick={() => setCapturedPhoto(null)}
                disabled={isVerifying}
                className="w-full h-12 text-muted-foreground font-black rounded-full text-[10px] uppercase tracking-widest"
              >
                Retake Snapshot
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setShowCamera(true)}
              disabled={!profile.profilePictureUrl}
              className="w-full h-16 bg-primary text-white font-black rounded-[2rem] text-[11px] uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all disabled:opacity-50"
            >
              <Camera className="mr-3 w-5 h-5" /> Take Live Photo
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
