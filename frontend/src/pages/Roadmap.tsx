import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import api from '../api/axios';
import { SpotlightCard } from '../components/SpotlightCard';
import { Loader2, ArrowLeft, Download, Copy, Check, Sparkles, RefreshCw } from 'lucide-react';

export const Roadmap = () => {
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coldStart, setColdStart] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchRoadmap = async () => {
    setLoading(true);
    setError(null);
    const coldStartTimer = setTimeout(() => {
      setColdStart(true);
    }, 5000);

    try {
      const res = await api.post('/api/roadmap');
      setRoadmap(res.data.roadmap);
    } catch (err) {
      console.error('Error fetching roadmap', err);
      setError('Failed to generate your roadmap. Please try again.');
    } finally {
      clearTimeout(coldStartTimer);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
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

  const handleCopy = () => {
    if (!roadmap) return;
    navigator.clipboard.writeText(roadmap);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <Loader2 className="w-10 h-10 animate-spin mb-5" style={{ color: '#e5c158' }} />
        <h2 className="text-2xl font-bold mb-2 text-zinc-100 tracking-tight">
          Architecting Your Blueprint
        </h2>
        <p className="text-sm text-zinc-400 max-w-md text-center leading-relaxed">
          {coldStart
            ? 'Waking up the AI engine. This may take a few moments...'
            : 'Gemini AI is analyzing your academic trajectory, skills, and DSA metrics to build your execution plan...'}
        </p>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <SpotlightCard className="p-8 max-w-md w-full text-center">
          <p className="text-rose-400 mb-6 text-sm">{error || 'Something went wrong.'}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fafafa',
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </button>
            <button
              onClick={fetchRoadmap}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider cursor-pointer"
              style={{
                background: 'rgba(229, 193, 88, 0.15)',
                border: '1px solid rgba(229, 193, 88, 0.4)',
                color: '#e5c158',
              }}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        </SpotlightCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto pt-14 px-6 pb-20">
      {/* Top Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 pb-6 border-b border-white/8"
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" style={{ color: '#e5c158' }} />
          Return to Dashboard
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#d4d4d8',
            }}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Text'}
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer"
            style={{
              background: 'rgba(229, 193, 88, 0.14)',
              border: '1px solid rgba(229, 193, 88, 0.38)',
              color: '#e5c158',
            }}
          >
            <Download className="w-3.5 h-3.5" /> Export .MD
          </button>
        </div>
      </motion.div>

      {/* Blueprint Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-widest mb-3"
          style={{
            background: 'rgba(229, 193, 88, 0.08)',
            border: '1px solid rgba(229, 193, 88, 0.25)',
            color: '#e5c158',
          }}
        >
          <Sparkles className="w-3 h-3" /> Personalized Execution Plan
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 tracking-tight">
          Strategic Career Roadmap
        </h1>
      </motion.div>

      {/* Main Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <SpotlightCard className="p-8 md:p-12">
          <div className="prose-luxury max-w-none">
            <ReactMarkdown>{roadmap}</ReactMarkdown>
          </div>
        </SpotlightCard>
      </motion.div>
    </div>
  );
};
