import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { SpotlightCard } from '../components/SpotlightCard';
import { MagneticButton } from '../components/MagneticButton';
import { Loader2, ArrowRight, Edit3, Sparkles, Trophy, Building2, Briefcase } from 'lucide-react';

interface Prediction {
  tier1Score: number;
  tier2Score: number;
  tier3Score: number;
  tier1Label: string;
  tier2Label: string;
  tier3Label: string;
}

const CircularGauge = ({
  percentage,
  strokeColor,
  delay = 0,
}: {
  percentage: number;
  strokeColor: string;
  delay?: number;
}) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative w-36 h-36 flex items-center justify-center mx-auto my-4">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth="8"
        />
        <motion.circle
          cx="64"
          cy="64"
          r={radius}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.3, delay, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 8px ${strokeColor}55)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold tracking-tight text-zinc-100">
            {Math.round(clamped)}
          </span>
          <span className="text-sm font-medium text-zinc-400 ml-0.5">%</span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mt-0.5">
          Probability
        </span>
      </div>
    </div>
  );
};

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
        console.error('Error fetching prediction', err);
        setError('Failed to load your prediction scores.');
      } finally {
        setLoading(false);
      }
    };
    fetchPrediction();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: '#e5c158' }} />
        <p className="text-sm text-zinc-400 tracking-wide">Synthesizing placement probabilities...</p>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <SpotlightCard className="p-8 max-w-md w-full text-center">
          <p className="text-rose-400 mb-5 text-sm">{error || 'Something went wrong.'}</p>
          <button
            onClick={() => navigate('/onboarding')}
            className="px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider cursor-pointer"
            style={{
              background: 'rgba(229, 193, 88, 0.15)',
              border: '1px solid rgba(229, 193, 88, 0.4)',
              color: '#e5c158',
            }}
          >
            Calibrate Profile
          </button>
        </SpotlightCard>
      </div>
    );
  }

  const getReadinessBadge = (pct: number) => {
    if (pct >= 75) return { text: 'High Readiness', color: '#e5c158', bg: 'rgba(229, 193, 88, 0.12)' };
    if (pct >= 45) return { text: 'Competitive', color: '#d4d4d8', bg: 'rgba(255, 255, 255, 0.07)' };
    return { text: 'Growth Needed', color: '#a1a1aa', bg: 'rgba(255, 255, 255, 0.04)' };
  };

  const tiers = [
    {
      tag: 'TIER 01 / ELITE PRODUCT',
      label: prediction.tier1Label || 'Tier 1 (Product)',
      subtitle: 'FAANG, Top Global Product & High-Growth Unicorns',
      score: prediction.tier1Score * 100,
      stroke: '#e5c158',
      icon: Trophy,
    },
    {
      tag: 'TIER 02 / ENTERPRISE',
      label: prediction.tier2Label || 'Tier 2 (Mid-Market)',
      subtitle: 'Established SaaS, FinTech & Enterprise Tech Leaders',
      score: prediction.tier2Score * 100,
      stroke: '#e4e4e7',
      icon: Building2,
    },
    {
      tag: 'TIER 03 / CORE IT & SERVICE',
      label: prediction.tier3Label || 'Tier 3 (Service / Early)',
      subtitle: 'Global System Integrators, Consulting & Emerging Teams',
      score: prediction.tier3Score * 100,
      stroke: '#a1a1aa',
      icon: Briefcase,
    },
  ];

  return (
    <div className="min-h-screen max-w-5xl mx-auto pt-14 px-6 pb-20">
      {/* Top Bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4 pb-8 border-b border-white/8"
      >
        <div>
          <div className="inline-flex items-center gap-2 mb-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: '#e5c158', boxShadow: '0 0 10px #e5c158' }}
            />
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              LIVE PLACEMENT TELEMETRY
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-100">Career Twin Dashboard</h1>
        </div>

        <button
          onClick={() => navigate('/onboarding')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#fafafa',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(229, 193, 88, 0.45)';
            e.currentTarget.style.background = 'rgba(229, 193, 88, 0.10)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
        >
          <Edit3 className="w-3.5 h-3.5" style={{ color: '#e5c158' }} />
          Recalibrate Profile
        </button>
      </motion.div>

      {/* Circular Gauge Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {tiers.map((tier, i) => {
          const badge = getReadinessBadge(tier.score);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
            >
              <SpotlightCard className="p-7 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono tracking-widest text-zinc-500">
                      {tier.tag}
                    </span>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <tier.icon className="w-4 h-4" style={{ color: tier.stroke }} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-100 tracking-tight">{tier.label}</h3>
                  <p className="text-xs text-zinc-500 mt-1">{tier.subtitle}</p>
                </div>

                <CircularGauge
                  percentage={tier.score}
                  strokeColor={tier.stroke}
                  delay={0.25 + i * 0.15}
                />

                <div className="pt-3 border-t border-white/6 flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Standing</span>
                  <span
                    className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                    style={{
                      color: badge.color,
                      background: badge.bg,
                      border: `1px solid ${badge.color}33`,
                    }}
                  >
                    {badge.text}
                  </span>
                </div>
              </SpotlightCard>
            </motion.div>
          );
        })}
      </div>

      {/* AI Roadmap CTA Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <SpotlightCard
          className="p-10 md:p-12 text-center"
          spotlightColor="rgba(229, 193, 88, 0.16)"
        >
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium uppercase tracking-widest mb-4"
            style={{
              background: 'rgba(229, 193, 88, 0.10)',
              border: '1px solid rgba(229, 193, 88, 0.28)',
              color: '#e5c158',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Gemini Strategy Engine
          </div>

          <h2 className="text-3xl font-bold text-zinc-100 mb-3 tracking-tight">
            Close Your Tier 1 Gap
          </h2>
          <p className="text-sm md:text-base text-zinc-400 mb-8 max-w-xl mx-auto leading-relaxed">
            Generate a personalized, week-by-week engineering roadmap tailored to your exact CGPA,
            skills, and DSA milestones.
          </p>

          <MagneticButton strength={0.3}>
            <button
              onClick={() => navigate('/roadmap')}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-sm tracking-wide transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #F9E498 0%, #E5C158 100%)',
                color: '#09090B',
                boxShadow: '0 0 35px rgba(229, 193, 88, 0.30)',
              }}
            >
              Generate AI Roadmap
              <ArrowRight className="w-4 h-4" />
            </button>
          </MagneticButton>
        </SpotlightCard>
      </motion.div>
    </div>
  );
};
