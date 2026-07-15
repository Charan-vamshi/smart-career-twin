import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { Loader2 } from 'lucide-react';

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError("Authentication failed. No token received.");
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    // Save token to localStorage
    localStorage.setItem('jwt', token);

    // Fetch profile to determine routing
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/profile');
        const profile = response.data;
        
        // If profile is completely empty (no academic data and no skills)
        if (!profile.academic && (!profile.skills || profile.skills.length === 0)) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setError("Failed to load profile data. Please try logging in again.");
        localStorage.removeItem('jwt');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    fetchProfile();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center bg-bg-card/50 backdrop-blur-md p-8 rounded-2xl border border-white/10"
      >
        {error ? (
          <div className="text-red-400">
            <p className="mb-2">{error}</p>
            <p className="text-sm opacity-70">Redirecting...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
            <h2 className="text-xl font-semibold">Authenticating...</h2>
            <p className="text-sm text-gray-400 mt-2">Checking your profile data</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
