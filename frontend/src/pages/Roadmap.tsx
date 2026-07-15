import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import api from '../api/axios';
import { Loader2, ArrowLeft, Download } from 'lucide-react';

export const Roadmap = () => {
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coldStart, setColdStart] = useState(false);

  useEffect(() => {
    const coldStartTimer = setTimeout(() => {
      setColdStart(true);
    }, 5000);

    const fetchRoadmap = async () => {
      try {
        const res = await api.post('/api/roadmap');
        setRoadmap(res.data.roadmap);
      } catch (err) {
        console.error("Error fetching roadmap", err);
        setError("Failed to generate your roadmap. Please try again.");
      } finally {
        clearTimeout(coldStartTimer);
        setLoading(false);
      }
    };
    fetchRoadmap();

    return () => clearTimeout(coldStartTimer);
  }, []);

  const handleDownload = () => {
    if (!roadmap) return;
    const blob = new Blob([roadmap], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smart_career_roadmap.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent animate-spin mb-6" />
        <h2 className="text-2xl font-bold mb-2">Generating Your Roadmap</h2>
        <p className="text-gray-400 max-w-md text-center">
          {coldStart 
            ? "The server seems to be waking up from a cold start. This might take up to 50 seconds..."
            : "Our AI is analyzing your profile to build a custom plan. This might take a few seconds..."}
        </p>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-red-900/20 border border-red-500/50 p-8 rounded-2xl max-w-md">
          <p className="text-red-400 mb-6">{error || "Something went wrong."}</p>
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 justify-center w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto pt-24 px-6 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
      >
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg transition-colors border border-accent/20"
        >
          <Download className="w-4 h-4" /> Download Markdown
        </button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-bg-card/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
      >
        <div className="prose prose-invert prose-blue max-w-none prose-headings:font-bold prose-a:text-accent prose-a:no-underline hover:prose-a:underline">
          <ReactMarkdown>{roadmap}</ReactMarkdown>
        </div>
      </motion.div>
    </div>
  );
};
