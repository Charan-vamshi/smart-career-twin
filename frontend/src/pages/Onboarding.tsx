import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { ChipSelect } from '../components/ChipSelect';
import { SKILL_OPTIONS, TECH_STACK_OPTIONS } from '../api/options';
import { MagneticButton } from '../components/MagneticButton';
import { SpotlightCard } from '../components/SpotlightCard';
import {
  Loader2, Plus, Trash2, ChevronRight, ChevronLeft, Check,
  GraduationCap, Wrench, FolderKanban, BarChart3
} from 'lucide-react';

interface Skill {
  id?: number;
  skillName: string;
  proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PRODUCTION_USED';
}

interface Project {
  id?: number;
  category: 'WEB' | 'MOBILE' | 'AI_ML' | 'IOT' | 'SYSTEMS' | 'DATA';
  techStack: string;
  complexity: 'CRUD_BASIC' | 'INTEGRATED_MULTI_SERVICE' | 'DEPLOYED_SCALED' | 'RESEARCH_GRADE';
  deploymentStatus: 'LOCAL' | 'HOSTED' | 'PRODUCTION_USERS';
  durationWeeks: number | '';
  teamSize: 'SOLO' | 'TEAM';
  role: string;
  outcome: string;
}

interface Stats {
  totalSolved: number | '';
  easy: number | '';
  medium: number | '';
  hard: number | '';
  repoCount: number | '';
  activeMonths: number | '';
  stars: number | '';
}

const STEPS = [
  { id: 1, label: 'Academic', icon: GraduationCap, desc: 'CGPA & academic trajectory' },
  { id: 2, label: 'Skills', icon: Wrench, desc: 'Languages & core concepts' },
  { id: 3, label: 'Projects', icon: FolderKanban, desc: 'Engineering portfolio' },
  { id: 4, label: 'Stats', icon: BarChart3, desc: 'DSA & GitHub velocity' },
];

const inputClass = "w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all";
const inputStyle = {
  background: 'rgba(14, 14, 17, 0.85)',
  border: '1px solid rgba(255, 255, 255, 0.09)',
  color: '#fafafa',
};

const selectStyle = {
  background: '#0e0e11',
  border: '1px solid rgba(255, 255, 255, 0.09)',
  color: '#fafafa',
};

const labelStyle = {
  color: '#a1a1aa',
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.05em',
  textTransform: 'uppercase' as const,
  marginBottom: '0.45rem',
  display: 'block',
};

export const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Academic
  const [cgpa, setCgpa] = useState<number | ''>('');
  const [cgpaTrend, setCgpaTrend] = useState<'IMPROVING' | 'STABLE' | 'DECLINING'>('STABLE');

  // Skills
  const [skills, setSkills] = useState<Skill[]>([]);
  const [deletedSkills, setDeletedSkills] = useState<number[]>([]);
  const [selectedSkillNames, setSelectedSkillNames] = useState<string[]>([]);

  // Projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [deletedProjects, setDeletedProjects] = useState<number[]>([]);

  // Stats
  const [stats, setStats] = useState<Stats>({
    totalSolved: '', easy: '', medium: '', hard: '',
    repoCount: '', activeMonths: '', stars: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/profile');
        const data = res.data;
        if (data.academic) {
          setCgpa(data.academic.cgpa ?? '');
          setCgpaTrend(data.academic.cgpaTrend ?? 'STABLE');
        }
        if (data.skills && data.skills.length > 0) {
          setSkills(data.skills);
          setSelectedSkillNames(data.skills.map((s: Skill) => s.skillName));
        }
        if (data.projects) setProjects(data.projects);
        const newStats = { ...stats };
        if (data.codingStats) {
          newStats.totalSolved = data.codingStats.totalSolved ?? '';
          newStats.easy = data.codingStats.easy ?? '';
          newStats.medium = data.codingStats.medium ?? '';
          newStats.hard = data.codingStats.hard ?? '';
        }
        if (data.githubStats) {
          newStats.repoCount = data.githubStats.repoCount ?? '';
          newStats.activeMonths = data.githubStats.activeMonths ?? '';
          newStats.stars = data.githubStats.stars ?? '';
        }
        setStats(newStats);
      } catch (err) {
        console.error('Error fetching profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSkillNamesChange = (names: string[]) => {
    setSelectedSkillNames(names);
    const toDelete = skills.filter(s => !names.includes(s.skillName));
    const newDeleted = toDelete.filter(s => s.id).map(s => s.id!);
    setDeletedSkills(prev => [...new Set([...prev, ...newDeleted])]);
    const existing = skills.filter(s => names.includes(s.skillName));
    const existingNames = existing.map(s => s.skillName);
    const newOnes = names.filter(n => !existingNames.includes(n)).map(n => ({ skillName: n, proficiency: 'INTERMEDIATE' as const }));
    setSkills([...existing, ...newOnes]);
  };

  const handleSave = async () => {
    if (!stats.totalSolved && stats.totalSolved !== 0) {
      alert('Total Solved on coding platforms is required.');
      return;
    }
    setSaving(true);
    try {
      const cleanCgpa = cgpa === '' || isNaN(cgpa as number) ? null : Math.min(10, Math.max(0, cgpa as number));
      await api.put('/api/profile/academic', { cgpa: cleanCgpa, cgpaTrend });

      for (const id of deletedSkills) await api.delete(`/api/profile/skills/${id}`);
      for (const skill of skills) {
        if (!skill.id) {
          await api.post('/api/profile/skills', { skillName: skill.skillName, proficiency: skill.proficiency });
        }
      }

      for (const id of deletedProjects) await api.delete(`/api/profile/projects/${id}`);
      for (const proj of projects) {
        const { ...projectData } = proj;
        delete (projectData as any).id;
        await api.post('/api/profile/projects', projectData);
      }

      await api.put('/api/profile/coding-stats', {
        totalSolved: Number(stats.totalSolved) || 0,
        easy: Number(stats.easy) || 0,
        medium: Number(stats.medium) || 0,
        hard: Number(stats.hard) || 0,
      });
      await api.put('/api/profile/github-stats', {
        repoCount: Number(stats.repoCount) || 0,
        activeMonths: Number(stats.activeMonths) || 0,
        stars: Number(stats.stars) || 0,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving profile', err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const removeProject = (index: number) => {
    const proj = projects[index];
    if (proj.id) setDeletedProjects(prev => [...prev, proj.id!]);
    setProjects(projects.filter((_, i) => i !== index));
  };

  const addProject = () => setProjects([...projects, {
    category: 'WEB', techStack: '', complexity: 'CRUD_BASIC',
    deploymentStatus: 'LOCAL', durationWeeks: 4, teamSize: 'SOLO', role: '', outcome: ''
  }]);

  const updateProject = (index: number, field: keyof Project, value: any) => {
    const p = [...projects];
    (p[index] as any)[field] = value;
    setProjects(p);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#e5c158' }} />
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: 'transparent' }}>
      {/* Left Sidebar Panel */}
      <div
        className="hidden md:flex flex-col justify-between w-80 shrink-0 p-10"
        style={{
          background: 'rgba(10, 10, 12, 0.78)',
          borderRight: '1px solid rgba(255, 255, 255, 0.07)',
          backdropFilter: 'blur(24px)',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        <div>
          {/* Brand Header */}
          <div className="mb-14 flex items-center gap-2.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background: '#e5c158',
                boxShadow: '0 0 12px rgba(229, 193, 88, 0.8)',
              }}
            />
            <div>
              <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-100">
                Smart Career Twin
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">Profile Calibration</p>
            </div>
          </div>

          {/* Steps Navigation */}
          <div className="space-y-2.5">
            {STEPS.map((s) => {
              const isActive = s.id === step;
              const isDone = s.id < step;
              return (
                <div
                  key={s.id}
                  onClick={() => setStep(s.id)}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 cursor-pointer"
                  style={{
                    background: isActive ? 'rgba(229, 193, 88, 0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(229, 193, 88, 0.28)' : '1px solid transparent',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                    style={{
                      background: isDone
                        ? '#e5c158'
                        : isActive
                        ? 'rgba(229, 193, 88, 0.16)'
                        : 'rgba(255, 255, 255, 0.04)',
                      border: isActive
                        ? '1px solid rgba(229, 193, 88, 0.5)'
                        : isDone
                        ? 'none'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    {isDone ? (
                      <Check className="w-4 h-4 text-zinc-950" />
                    ) : (
                      <s.icon className="w-4 h-4" style={{ color: isActive ? '#e5c158' : '#52525b' }} />
                    )}
                  </div>
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: isActive ? '#fafafa' : isDone ? '#d4d4d8' : '#71717a' }}
                    >
                      {s.label}
                    </p>
                    <p className="text-xs text-zinc-500">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs mb-2 text-zinc-400 font-medium">
            <span>Completion</span>
            <span style={{ color: '#e5c158' }}>{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #e5c158, #f9e498)' }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <div className="flex-1 max-w-2xl w-full mx-auto px-6 md:px-10 py-16">
          <AnimatePresence mode="wait">
            {/* STEP 1: Academic */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-8">
                  <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: '#e5c158' }}>
                    01 / STEP ONE OF FOUR
                  </p>
                  <h1 className="text-4xl font-bold mb-2 text-zinc-100 tracking-tight">Academic Profile</h1>
                  <p className="text-sm text-zinc-400">
                    Enter your current CGPA and trajectory on a 10-point scale.
                  </p>
                </div>

                <SpotlightCard className="p-7 space-y-6">
                  <div>
                    <label style={labelStyle}>CGPA (out of 10) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={cgpa}
                      onChange={e => {
                        const val = parseFloat(e.target.value);
                        setCgpa(isNaN(val) ? '' : Math.min(10, Math.max(0, val)));
                      }}
                      className={inputClass}
                      style={inputStyle}
                      placeholder="e.g. 8.5"
                    />
                    <p className="mt-2 text-xs text-zinc-500">
                      Using a 4.0 scale? Multiply by 2.5 to convert.
                    </p>
                  </div>
                  <div>
                    <label style={labelStyle}>CGPA Trajectory</label>
                    <select
                      value={cgpaTrend}
                      onChange={e => setCgpaTrend(e.target.value as any)}
                      className={inputClass}
                      style={selectStyle}
                    >
                      <option value="IMPROVING">📈 Improving — grades are trending upward</option>
                      <option value="STABLE">➡️ Stable — grades are consistent</option>
                      <option value="DECLINING">📉 Declining — grades have dipped recently</option>
                    </select>
                  </div>
                </SpotlightCard>
              </motion.div>
            )}

            {/* STEP 2: Skills */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-8">
                  <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: '#e5c158' }}>
                    02 / STEP TWO OF FOUR
                  </p>
                  <h1 className="text-4xl font-bold mb-2 text-zinc-100 tracking-tight">Technical Arsenal</h1>
                  <p className="text-sm text-zinc-400">
                    Select your programming languages, frameworks, and core computer science skills.
                  </p>
                </div>

                <SpotlightCard className="p-7 space-y-6">
                  <ChipSelect
                    label="Search & Select Skills"
                    selected={selectedSkillNames}
                    options={SKILL_OPTIONS}
                    onChange={handleSkillNamesChange}
                    placeholder="Type Java, Python, React, System Design..."
                  />

                  {skills.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <label style={labelStyle}>Proficiency Calibration</label>
                      {skills.map((skill, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl"
                          style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.07)',
                          }}
                        >
                          <span className="text-sm font-medium text-zinc-200">{skill.skillName}</span>
                          <select
                            value={skill.proficiency}
                            onChange={e => {
                              const s = [...skills];
                              s[i].proficiency = e.target.value as any;
                              setSkills(s);
                            }}
                            className="text-xs rounded-lg px-3 py-1.5 font-medium"
                            style={{ ...selectStyle, width: 'auto', minWidth: '155px' }}
                          >
                            <option value="BEGINNER">Beginner</option>
                            <option value="INTERMEDIATE">Intermediate</option>
                            <option value="ADVANCED">Advanced</option>
                            <option value="PRODUCTION_USED">Production Used</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </SpotlightCard>
              </motion.div>
            )}

            {/* STEP 3: Projects */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-8">
                  <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: '#e5c158' }}>
                    03 / STEP THREE OF FOUR
                  </p>
                  <h1 className="text-4xl font-bold mb-2 text-zinc-100 tracking-tight">Engineering Projects</h1>
                  <p className="text-sm text-zinc-400">
                    Detail the systems and applications you have built and deployed.
                  </p>
                </div>

                <div className="space-y-6">
                  {projects.map((proj, i) => (
                    <SpotlightCard key={i} className="p-6 space-y-5 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#e5c158' }}>
                          Project 0{i + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeProject(i)}
                          className="p-1.5 rounded-lg transition-all cursor-pointer"
                          style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)' }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label style={labelStyle}>Domain</label>
                          <select value={proj.category} onChange={e => updateProject(i, 'category', e.target.value)} className={inputClass} style={selectStyle}>
                            <option value="WEB">Web Application</option>
                            <option value="MOBILE">Mobile App</option>
                            <option value="AI_ML">AI / Machine Learning</option>
                            <option value="IOT">IoT / Hardware</option>
                            <option value="SYSTEMS">Systems / Infra</option>
                            <option value="DATA">Data Engineering</option>
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Architecture Complexity</label>
                          <select value={proj.complexity} onChange={e => updateProject(i, 'complexity', e.target.value)} className={inputClass} style={selectStyle}>
                            <option value="CRUD_BASIC">Basic (CRUD / Standard)</option>
                            <option value="INTEGRATED_MULTI_SERVICE">Intermediate (Multi-service)</option>
                            <option value="DEPLOYED_SCALED">Advanced (Deployed & Scaled)</option>
                            <option value="RESEARCH_GRADE">Research Grade</option>
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Deployment Status</label>
                          <select value={proj.deploymentStatus} onChange={e => updateProject(i, 'deploymentStatus', e.target.value)} className={inputClass} style={selectStyle}>
                            <option value="LOCAL">Local Repository Only</option>
                            <option value="HOSTED">Live Cloud Hosted</option>
                            <option value="PRODUCTION_USERS">Production with Active Users</option>
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Team Structure</label>
                          <select value={proj.teamSize} onChange={e => updateProject(i, 'teamSize', e.target.value)} className={inputClass} style={selectStyle}>
                            <option value="SOLO">Solo Builder</option>
                            <option value="TEAM">Team Collaboration</option>
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Duration (Weeks)</label>
                          <input type="number" value={proj.durationWeeks} onChange={e => updateProject(i, 'durationWeeks', parseInt(e.target.value))} className={inputClass} style={inputStyle} placeholder="e.g. 6" />
                        </div>
                        <div>
                          <label style={labelStyle}>Your Role</label>
                          <input type="text" value={proj.role} onChange={e => updateProject(i, 'role', e.target.value)} className={inputClass} style={inputStyle} placeholder="e.g. Full-Stack Lead" />
                        </div>
                      </div>

                      <ChipSelect
                        label="Tech Stack Used"
                        selected={proj.techStack ? proj.techStack.split(',').map(s => s.trim()).filter(Boolean) : []}
                        options={TECH_STACK_OPTIONS}
                        onChange={vals => updateProject(i, 'techStack', vals.join(', '))}
                        placeholder="Search frameworks, databases, cloud..."
                      />

                      <div>
                        <label style={labelStyle}>Key Engineering Outcome</label>
                        <textarea
                          value={proj.outcome}
                          onChange={e => updateProject(i, 'outcome', e.target.value)}
                          rows={2}
                          className={inputClass}
                          style={{ ...inputStyle, resize: 'vertical' }}
                          placeholder="e.g. Automated workflow reducing latency by 45%"
                        />
                      </div>
                    </SpotlightCard>
                  ))}

                  <button
                    type="button"
                    onClick={addProject}
                    className="w-full py-4 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                    style={{
                      border: '1px dashed rgba(229, 193, 88, 0.3)',
                      color: '#e5c158',
                      background: 'rgba(229, 193, 88, 0.04)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(229, 193, 88, 0.10)';
                      e.currentTarget.style.borderColor = 'rgba(229, 193, 88, 0.55)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(229, 193, 88, 0.04)';
                      e.currentTarget.style.borderColor = 'rgba(229, 193, 88, 0.3)';
                    }}
                  >
                    <Plus className="w-4 h-4" /> Add Engineering Project
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Stats */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-8">
                  <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: '#e5c158' }}>
                    04 / STEP FOUR OF FOUR
                  </p>
                  <h1 className="text-4xl font-bold mb-2 text-zinc-100 tracking-tight">Coding & GitHub Velocity</h1>
                  <p className="text-sm text-zinc-400">
                    Your problem-solving consistency across LeetCode, GeeksforGeeks, and GitHub.
                  </p>
                </div>

                <div className="space-y-6">
                  <SpotlightCard className="p-7 space-y-5">
                    <h3 className="text-xs font-mono uppercase tracking-widest" style={{ color: '#e5c158' }}>
                      Competitive Programming & DSA
                    </h3>
                    <div>
                      <label style={labelStyle}>Total Problems Solved *</label>
                      <input
                        type="number"
                        required
                        value={stats.totalSolved}
                        onChange={e => setStats({ ...stats, totalSolved: parseInt(e.target.value) || '' })}
                        className={inputClass}
                        style={{ ...inputStyle, border: '1px solid rgba(229, 193, 88, 0.35)' }}
                        placeholder="e.g. 250"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Difficulty Split (Optional)</label>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs mb-1.5 block text-emerald-400 font-medium">Easy</label>
                          <input type="number" value={stats.easy} onChange={e => setStats({ ...stats, easy: parseInt(e.target.value) || '' })} className={inputClass} style={inputStyle} placeholder="0" />
                        </div>
                        <div>
                          <label className="text-xs mb-1.5 block text-amber-400 font-medium">Medium</label>
                          <input type="number" value={stats.medium} onChange={e => setStats({ ...stats, medium: parseInt(e.target.value) || '' })} className={inputClass} style={inputStyle} placeholder="0" />
                        </div>
                        <div>
                          <label className="text-xs mb-1.5 block text-rose-400 font-medium">Hard</label>
                          <input type="number" value={stats.hard} onChange={e => setStats({ ...stats, hard: parseInt(e.target.value) || '' })} className={inputClass} style={inputStyle} placeholder="0" />
                        </div>
                      </div>
                    </div>
                  </SpotlightCard>

                  <SpotlightCard className="p-7 space-y-5">
                    <h3 className="text-xs font-mono uppercase tracking-widest" style={{ color: '#e5c158' }}>
                      GitHub Open-Source & Repositories
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label style={labelStyle}>Public Repos</label>
                        <input type="number" value={stats.repoCount} onChange={e => setStats({ ...stats, repoCount: parseInt(e.target.value) || '' })} className={inputClass} style={inputStyle} placeholder="e.g. 15" />
                      </div>
                      <div>
                        <label style={labelStyle}>Active Months</label>
                        <input type="number" value={stats.activeMonths} onChange={e => setStats({ ...stats, activeMonths: parseInt(e.target.value) || '' })} className={inputClass} style={inputStyle} placeholder="e.g. 10" />
                      </div>
                      <div>
                        <label style={labelStyle}>Total Stars</label>
                        <input type="number" value={stats.stars} onChange={e => setStats({ ...stats, stars: parseInt(e.target.value) || '' })} className={inputClass} style={inputStyle} placeholder="e.g. 25" />
                      </div>
                    </div>
                  </SpotlightCard>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Step Controls */}
          <div className="flex items-center justify-between mt-10">
            <button
              type="button"
              onClick={() => setStep(s => Math.max(s - 1, 1))}
              disabled={step === 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: step === 1 ? 'transparent' : 'rgba(255, 255, 255, 0.05)',
                color: step === 1 ? 'transparent' : '#d4d4d8',
                border: step === 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                cursor: step === 1 ? 'default' : 'pointer',
              }}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {step < 4 ? (
              <MagneticButton strength={0.25}>
                <button
                  type="button"
                  onClick={() => setStep(s => Math.min(s + 1, 4))}
                  className="flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    color: '#fafafa',
                    border: '1px solid rgba(255,255,255,0.18)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 1px 0 0 rgba(255,255,255,0.1) inset, 0 8px 24px rgba(0,0,0,0.45)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
                  }}
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </MagneticButton>
            ) : (
              <MagneticButton strength={0.25}>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold transition-all duration-300"
                  style={{
                    background: saving ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)',
                    color: saving ? '#71717a' : '#fafafa',
                    border: `1px solid ${saving ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.18)'}`,
                    backdropFilter: 'blur(12px)',
                    boxShadow: saving ? 'none' : '0 1px 0 0 rgba(255,255,255,0.1) inset, 0 8px 24px rgba(0,0,0,0.45)',
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={e => {
                    if (!saving) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!saving) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
                    }
                  }}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {saving ? 'Calibrating Twin...' : 'Complete & Launch Dashboard'}
                </button>
              </MagneticButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
