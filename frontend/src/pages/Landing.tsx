import { motion } from 'framer-motion';
import { MagneticButton } from '../components/MagneticButton';
import { SpotlightCard } from '../components/SpotlightCard';
import { ArrowRight, BrainCircuit, BarChart3, Compass, Sparkles, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    tag: '01 / ANALYTICS',
    title: 'Precision Tier Scoring',
    desc: 'Evaluates your CGPA, DSA depth, project complexity, and GitHub velocity against real hiring benchmarks.',
  },
  {
    icon: BrainCircuit,
    tag: '02 / INTELLIGENCE',
    title: 'Gemini AI Roadmaps',
    desc: 'Synthesizes your exact skill gaps into a structured, week-by-week execution plan tailored to your target tier.',
  },
  {
    icon: Compass,
    tag: '03 / CLARITY',
    title: 'Zero-Guesswork Strategy',
    desc: 'Know where you stand across Product, Mid-Market, and Service tiers with actionable milestones.',
  },
];

export const Landing = () => {
  const handleLogin = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    window.location.href = `${baseUrl}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-6 pt-6 pb-16">
      {/* Floating Monochromatic Glass Header */}
      <motion.header
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl mx-auto flex items-center justify-between px-5 py-3 rounded-full"
        style={{
          background: 'rgba(14, 14, 17, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background: '#e5c158',
              boxShadow: '0 0 12px rgba(229, 193, 88, 0.8)',
            }}
          />
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-200">
            Smart Career Twin
          </span>
        </div>

        <button
          onClick={handleLogin}
          className="text-xs font-medium px-4 py-1.5 rounded-full transition-all duration-200 cursor-pointer"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fafafa',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(229, 193, 88, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(229, 193, 88, 0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          Sign In
        </button>
      </motion.header>

      {/* Main Hero Centerpiece */}
      <main className="flex flex-col items-center justify-center my-auto pt-16 pb-12">
        {/* Eyebrow Pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase"
          style={{
            background: 'rgba(229, 193, 88, 0.08)',
            border: '1px solid rgba(229, 193, 88, 0.28)',
            color: '#e5c158',
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Placement Intelligence
        </motion.div>

        {/* Monochromatic + Warm Champagne Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-7xl lg:text-8xl font-bold text-center max-w-4xl leading-[1.04] tracking-tight mb-6"
        >
          <span
            style={{
              background: 'linear-gradient(180deg, #FFFFFF 0%, #A1A1AA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Your Career,
          </span>{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #F9E498 0%, #E5C158 50%, #B38728 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Architected.
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base md:text-lg text-center max-w-2xl leading-relaxed mb-10 text-zinc-400"
        >
          Analyze your academics, technical stack, projects, and coding velocity.
          Uncover your real placement probability and generate a bespoke AI execution roadmap.
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <MagneticButton strength={0.35}>
            <button
              onClick={handleLogin}
              className="group relative inline-flex items-center gap-3 px-9 py-4 rounded-full font-semibold text-sm tracking-wide transition-all duration-300 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #FAFAFA 0%, #D4D4D8 100%)',
                color: '#09090B',
                boxShadow: '0 0 35px rgba(229, 193, 88, 0.22), 0 10px 30px rgba(0, 0, 0, 0.6)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow =
                  '0 0 50px rgba(229, 193, 88, 0.45), 0 12px 35px rgba(0, 0, 0, 0.7)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow =
                  '0 0 35px rgba(229, 193, 88, 0.22), 0 10px 30px rgba(0, 0, 0, 0.6)';
              }}
            >
              Continue with Google
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </MagneticButton>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>Instant OAuth2 access · Powered by Gemini</span>
          </div>
        </motion.div>

        {/* Interactive Spotlight Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl w-full"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <SpotlightCard className="p-7 h-full">
                <div className="flex items-center justify-between mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'rgba(229, 193, 88, 0.10)',
                      border: '1px solid rgba(229, 193, 88, 0.25)',
                    }}
                  >
                    <f.icon className="w-5 h-5" style={{ color: '#e5c158' }} />
                  </div>
                  <span className="text-[11px] font-mono tracking-widest text-zinc-500">
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-2 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-400">{f.desc}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Subtle Footer */}
      <footer className="w-full max-w-5xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 gap-2">
        <span>Smart Career Twin · Placement Intelligence Engine</span>
        <span>Move cursor to interact with constellation</span>
      </footer>
    </div>
  );
};
