
"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProfile {
  name: string;
  avatar: string;
  nexoId: string;
}

interface AuthState {
  isAuthenticated: boolean;
  profile: UserProfile | null;
  login: (email: string) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  logout: () => void;
}

// Simple Zustand store (using manual implementation if zustand isn't installed, 
// but since I can't install packages, I'll use a standard React context approach for reliability)
// Actually, I'll use a persistent custom hook for simplicity in a scaffold.

export const generateNexoId = () => {
  return Math.floor(Math.random() * 900000000) + 100000000 + "";
};
