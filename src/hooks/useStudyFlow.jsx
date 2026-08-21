import { useState, useEffect, useCallback } from 'react';
import {
  getUser,
  saveUser,
  getEntries,
  calculateStreak,
  calculateMomentum,
  promotePlannedTasks,
  syncFromServer,
  switchProfile,
  createNewProfile,
} from '../utils/storage';

export const useStudyFlow = () => {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [momentum, setMomentum] = useState({ momentum: 0, color: '#EF4444' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      // Sync data from server files → localStorage cache
      await syncFromServer();

      // Run idempotent planned-task promotion on mount (handles day rollover)
      promotePlannedTasks();

      let userData = getUser();

      // Auto-create a default profile on first launch so the UI loads immediately
      if (!userData) {
        const defaultUser = { name: 'User', email: '', dailyGoal: '4' };
        saveUser(defaultUser);
        userData = getUser();
      }

      const entriesData = getEntries();
      setUser(userData);
      setEntries(entriesData);

      if (userData) {
        const streakData = calculateStreak(entriesData);
        setStreak(streakData);
        setMomentum(calculateMomentum(streakData.current));
      }

      setIsLoading(false);
    };

    init();
  }, []);

  const refreshEntries = useCallback(() => {
    const entriesData = getEntries();
    setEntries(entriesData);
    const streakData = calculateStreak(entriesData);
    setStreak(streakData);
    setMomentum(calculateMomentum(streakData.current));
  }, []);

  const registerUser = useCallback(async (userData) => {
    await saveUser(userData);
    const updatedUser = getUser();
    setUser(updatedUser);
  }, []);

  const switchActiveProfile = useCallback(async (profileId) => {
    await switchProfile(profileId);
    const userData = getUser();
    const entriesData = getEntries();
    setUser(userData);
    setEntries(entriesData);
    if (userData) {
      const streakData = calculateStreak(entriesData);
      setStreak(streakData);
      setMomentum(calculateMomentum(streakData.current));
    }
    promotePlannedTasks();
  }, []);

  const clearActiveProfile = useCallback(() => {
    createNewProfile();
    setUser(null);
    setEntries([]);
    setStreak({ current: 0, longest: 0 });
    setMomentum({ momentum: 0, color: '#EF4444' });
  }, []);

  return {
    user,
    entries,
    streak,
    momentum,
    isLoading,
    registerUser,
    refreshEntries,
    switchActiveProfile,
    clearActiveProfile,
  };
};