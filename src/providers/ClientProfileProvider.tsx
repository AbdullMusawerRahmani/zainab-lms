'use client';

import { useEffect } from 'react';
import useProfileStore from '@/stores/profileStore';
import { Preloaded, usePreloadedQuery } from 'convex/react';
import { api } from '../lib/convexApi';
import { Profile } from '../types/profile';


interface ClientProfileProviderProps {
  preloadedProfile: Preloaded<typeof api.profiles.queries.getProfile>;
  children: React.ReactNode;
}

export function ClientProfileProvider({ preloadedProfile, children }: ClientProfileProviderProps) {
  const profile = usePreloadedQuery(preloadedProfile);
  const setProfile = useProfileStore(state => state.setProfile);
  useEffect(() => {
    if (profile) {
      setProfile(profile as Profile);
    }
  }, [profile, setProfile]);
  return <>{children}</>;
} 