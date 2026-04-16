"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ChevronLeft, Camera, Check, 
  GraduationCap, Star, Heart, MapPin, Calendar, X
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import Cropper from 'react-easy-crop';
import { useHomeData } from '../../layout';
import { useFirestore, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const HOROSCOPES = [
  "Aries", "Taurus", "Gemini", "Cancer", 
  "Leo", "Virgo", "Libra", "Scorpio", 
  "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const LOOKING_FOR = [
  "Serious Relationship",
  "Casual Dating",
  "Making Friends",
  "Networking",
  "Just Chatting"
];

const EDUCATION_OPTIONS = [
  "Secondary School",
  "Certificate",
  "Diploma",
  "Undergraduate Degree",
  "Postgraduate Degree",
  "Master's Degree",
  "Doctorate / PhD",
  "Professional Certification",
  "Other"
];

const EAST_AFRICAN_COUNTRIES = [
  "Burundi", "Djibouti", "Eritrea", "Ethiopia", 
  "Kenya", "Rwanda", "Somalia", "South Sudan", 
  "Tanzania", "Uganda"
];

export default function EditProfilePage() {
  const router = useRouter();
  const { profile } = useHomeData();
  const { user } = useUser();
  const db = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    displayName: '',
    statusMessage: '',
    dob: '',
    country: '',
    gender: '',
    education: '',
    horoscope: '',
    lookingFor: '',
    profilePictureUrl: ''
  });

  // Cropping States
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  const maxDate = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear() - 18;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        statusMessage: profile.statusMessage || '',
        dob: profile.dob || '',
        country: profile.country || '',
        gender: profile.gender || '',
        education: profile.education || '',
        horoscope: profile.horoscope || '',
        lookingFor: profile.lookingFor || '',
        profilePictureUrl: profile.profilePictureUrl || ''
      });
    }
  }, [profile]);

  const handleSave = () => {
    if (!db || !user?.uid) return;

    const userRef = doc(db, 'users', user.uid);
    updateDocumentNonBlocking(userRef, formData);

    toast({
      title: "Profile Updated",
      description: "Your changes have been saved successfully.",
    });
    router.back();
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setIsCropOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL('image/jpeg');
  };

  const saveCroppedImage = async () => {
    try {
      if (!imageToCrop || !croppedAreaPixels) return;
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      setFormData(prev => ({ ...prev, profilePictureUrl: croppedImage }));
      setIsCropOpen(false);
      setImageToCrop(null);
      toast({
        title: "Avatar Ready",
        description: "Your new photo has been cropped and applied.",
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Crop failed",
        description: "Could not process the image.",
      });
    }
  };

  if (!profile) return null;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="bg-primary safe-top sticky top-0 z-50 shrink-0">
        <div className="px-4 h-16 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full border border-white/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-sm font-black text-white tracking-[0.2em] uppercase italic">Edit Profile</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSave}
            className="w-10 h-10 bg-white text-primary hover:bg-white/90 rounded-full shadow-lg"
          >
            <Check className="w-6 h-6" />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8 pb-32 space-y-8">
        <div className="flex flex-col items-center">
          <div className="relative group">
            <Avatar className="w-32 h-32 border-4 border-gray-50 shadow-2xl">
              <AvatarImage src={formData.profilePictureUrl} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary font-black text-2xl">
                {formData.displayName?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-3 bg-primary text-white rounded-full border-4 border-white shadow-xl active:scale-90 transition-all"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>
          <p className="mt-4 text-[9px] font-black text-gray-300 uppercase tracking-widest italic">Tap camera to change avatar</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] whitespace-nowrap">Basic Info</h3>
            <div className="h-[1px] w-full bg-gray-50" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Display Name</Label>
            <Input 
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              placeholder="Your name"
              className="h-12 bg-gray-50 border-none rounded-2xl px-4 text-sm font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Bio / About Me</Label>
            <Textarea 
              value={formData.statusMessage}
              onChange={(e) => setFormData(prev => ({ ...prev, statusMessage: e.target.value }))}
              placeholder="Tell us about yourself..."
              className="min-h-[100px] bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Birthday</Label>
              <div className="relative">
                <Input 
                  type="date"
                  max={maxDate}
                  value={formData.dob}
                  onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                  className="h-12 bg-gray-50 border-none rounded-2xl px-4 text-xs font-bold pl-10"
                />
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Region</Label>
              <Select value={formData.country} onValueChange={(val) => setFormData(prev => ({ ...prev, country: val }))}>
                <SelectTrigger className="h-12 bg-gray-50 border-none rounded-2xl px-4 text-xs font-bold">
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 text-primary mr-2" />
                    <SelectValue placeholder="Country" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  {EAST_AFRICAN_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] whitespace-nowrap">Lifestyle & Education</h3>
            <div className="h-[1px] w-full bg-gray-50" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Education</Label>
            <div className="relative">
              <Select value={formData.education} onValueChange={(val) => setFormData(prev => ({ ...prev, education: val }))}>
                <SelectTrigger className="h-12 bg-gray-50 border-none rounded-2xl px-10 text-xs font-bold w-full">
                  <SelectValue placeholder="Select Education Level" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  {EDUCATION_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
              <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40 z-10" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Horoscope</Label>
              <Select value={formData.horoscope} onValueChange={(val) => setFormData(prev => ({ ...prev, horoscope: val }))}>
                <SelectTrigger className="h-12 bg-gray-50 border-none rounded-2xl px-4 text-xs font-bold">
                  <div className="flex items-center">
                    <Star className="w-3 h-3 text-primary mr-2" />
                    <SelectValue placeholder="Sign" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  {HOROSCOPES.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Looking For</Label>
              <Select value={formData.lookingFor} onValueChange={(val) => setFormData(prev => ({ ...prev, lookingFor: val }))}>
                <SelectTrigger className="h-12 bg-gray-50 border-none rounded-2xl px-4 text-xs font-bold">
                  <div className="flex items-center">
                    <Heart className="w-3 h-3 text-primary mr-2" />
                    <SelectValue placeholder="Purpose" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  {LOOKING_FOR.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="h-20" />
      </div>

      <div className="fixed bottom-8 left-6 right-6 z-40">
        <Button 
          onClick={handleSave}
          className="w-full h-16 bg-primary text-white hover:bg-primary/90 font-black rounded-[2rem] text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 active:scale-95 transition-all"
        >
          Save Changes
        </Button>
      </div>

      {/* Crop Dialog */}
      <Dialog open={isCropOpen} onOpenChange={setIsCropOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md bg-black border-none rounded-[3rem] p-0 overflow-hidden h-[80vh] flex flex-col">
          <DialogHeader className="p-6 shrink-0 bg-zinc-950 flex flex-row items-center justify-between">
            <DialogTitle className="text-white font-black uppercase tracking-widest text-xs italic">Crop Avatar</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsCropOpen(false)} className="text-white">
              <X className="w-5 h-5" />
            </Button>
          </DialogHeader>
          
          <div className="flex-1 relative bg-black">
            {imageToCrop && (
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropShape="round"
                showGrid={false}
              />
            )}
          </div>

          <DialogFooter className="p-8 bg-zinc-950 shrink-0 flex flex-col space-y-4">
            <div className="space-y-2">
              <Label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Zoom</Label>
              <input 
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-primary bg-white/10 rounded-lg h-2 appearance-none"
              />
            </div>
            <Button 
              onClick={saveCroppedImage}
              className="w-full h-14 bg-primary text-white font-black rounded-2xl uppercase tracking-[0.2em] text-[10px]"
            >
              Apply Crop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}