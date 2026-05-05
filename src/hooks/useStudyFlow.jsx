import { useState, useEffect, useCallback } from 'react';
import { getUser, saveUser, getEntries, calculateStreak, calculateMomentum } from '../utils/storage';

export const useStudyFlow = () => {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [momentum, setMomentum] = useState({ momentum: 0, color: '#EF4444' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = getUser();
    const entriesData = getEntries();
    
    setUser(userData);
    setEntries(entriesData);
    
    if (userData) {
      const streakData = calculateStreak(entriesData);
      setStreak(streakData);
      setMomentum(calculateMomentum(streakData.current));
    }
    
    setIsLoading(false);
  }, []);

  const refreshEntries = useCallback(() => {
    const entriesData = getEntries();
    setEntries(entriesData);
    const streakData = calculateStreak(entriesData);
    setStreak(streakData);
    setMomentum(calculateMomentum(streakData.current));
  }, []);

  const registerUser = useCallback((userData) => {
    saveUser(userData);
    setUser(userData);
  }, []);

  return {
    user,
    entries,
    streak,
    momentum,
    isLoading,
    registerUser,
    refreshEntries,
  };
};