import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { Loader2, ArrowRight, Edit3 } from 'lucide-react';

interface Prediction {
  tier1Score: number;
  tier2Score: number;
  tier3Score: number;
  tier1Label: string;
  tier2Label: string;
  tier3Label: string;
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const res = await api.get('/api/predict');
        setPrediction(res.data);
      } catch (err) {
        console.error("Error fetching prediction", err);
        setError("Failed to load your prediction scores.");
      } finally {
        setLoading(false);
      }
    };
    fetchPrediction();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
        <p className="text-gray-400">Analyzing your profile...</p>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-red-900/20 border border-red-500/50 p-8 rounded-2xl">
          <p className="text-red-400 mb-4">{error || "Something went wrong."}</p>
          <button onClick={() => navigate('/onboarding')} className="text-white hover:text-accent underline">
            Go back to profile
          </button>
        </div>
      </div>
    );
  }

  const tiers = [
    { label: prediction.tier1Label, score: prediction.tier1Score, color: 'bg-emerald-500' },
    { label: prediction.tier2Label, score: prediction.tier2Score, color: 'bg-blue-500' },
    { label: prediction.tier3Label, score: prediction.tier3Score, color: 'bg-purple-500' }
  ];

  return (
    <div className="min-h-screen max-w-4xl mx-auto pt-24 px-6 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Your Career Twin</h1>
          <p className="text-gray-400">Based on your current profile, here are your predicted placement chances.</p>
        </div>
        <button 
          onClick={() => navigate('/onboarding')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
        >
          <Edit3 className="w-4 h-4" /> Edit Profile
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {tiers.map((tier, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-bg-card/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl"
          >
            <h3 className="text-lg font-medium text-gray-300 mb-4">{tier.label}</h3>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-5xl font-bold">{Math.round(tier.score * 100)}</span>
              <span className="text-xl text-gray-400 mb-1">%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 mb-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${tier.score * 100}%` }}
                transition={{ duration: 1, delay: 0.5 + (i * 0.1), ease: "easeOut" }}
                className={`h-2.5 rounded-full ${tier.color}`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center bg-gradient-to-r from-accent/20 to-purple-500/20 border border-white/10 p-10 rounded-3xl backdrop-blur-md"
      >
        <h2 className="text-2xl font-bold mb-4">Ready to level up?</h2>
        <p className="text-gray-300 mb-8 max-w-xl mx-auto">
          Our AI can generate a personalized, step-by-step roadmap to improve your chances in your target tier.
        </p>
        <button 
          onClick={() => navigate('/roadmap')}
          className="inline-flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent-hover text-white rounded-full font-bold transition-all hover:scale-105 shadow-lg shadow-accent/20 text-lg"
        >
          Generate AI Roadmap <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
};
