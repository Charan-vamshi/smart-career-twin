import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { ChipSelect } from '../components/ChipSelect';
import { SKILL_OPTIONS, TECH_STACK_OPTIONS } from '../api/options';
import { MagneticButton } from '../components/MagneticButton';
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
  { id: 1, label: 'Academic', icon: GraduationCap, desc: 'Your CGPA and academic trend' },
  { id: 2, label: 'Skills', icon: Wrench, desc: 'Programming languages and concepts' },
  { id: 3, label: 'Projects', icon: FolderKanban, desc: 'Projects you have built' },
  { id: 4, label: 'Stats', icon: BarChart3, desc: 'Coding platform and GitHub activity' },
];

const inputClass = "w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all";
const inputStyle = {
  background: '#0d0d0d',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#fff',
};

const selectStyle = {
  background: '#0d0d0d',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#fff',
};

const labelStyle = { color: '#666', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.4rem', display: 'block' };

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

  // Sync selectedSkillNames → skills array
  const handleSkillNamesChange = (names: string[]) => {
    setSelectedSkillNames(names);
    // Remove deleted
    const toDelete = skills.filter(s => !names.includes(s.skillName));
    const newDeleted = toDelete.filter(s => s.id).map(s => s.id!);
    setDeletedSkills(prev => [...new Set([...prev, ...newDeleted])]);
    // Keep existing + add new
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
        // Only POST new skills (no id) — existing ones are already in DB
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
      <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#3b82f6' }} />
    </div>
  );


  return (
    <div className="min-h-screen flex" style={{ background: 'transparent' }}>
      {/* Left Panel */}
      <div
        className="hidden md:flex flex-col justify-between w-80 shrink-0 p-10"
        style={{
          background: 'rgba(10,10,10,0.85)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        <div>
          {/* Logo */}
          <div className="mb-14">
            <h2 className="text-base font-bold tracking-widest uppercase" style={{ color: '#3b82f6', letterSpacing: '0.15em' }}>
              Smart Career Twin
            </h2>
            <p className="text-xs mt-1" style={{ color: '#444' }}>Build your career profile</p>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            {STEPS.map((s) => {
              const isActive = s.id === step;
              const isDone = s.id < step;
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 cursor-default"
                  style={{
                    background: isActive ? 'rgba(59,130,246,0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
                  }}
                >
                  {/* Step circle */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                    style={{
                      background: isDone ? '#3b82f6' : isActive ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                      border: isActive ? '1px solid rgba(59,130,246,0.5)' : isDone ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {isDone ? (
                      <Check className="w-4 h-4" style={{ color: '#fff' }} />
                    ) : (
                      <s.icon className="w-4 h-4" style={{ color: isActive ? '#3b82f6' : '#444' }} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: isActive ? '#fff' : isDone ? '#aaa' : '#444' }}>
                      {s.label}
                    </p>
                    <p className="text-xs" style={{ color: '#333' }}>{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs mb-2" style={{ color: '#444' }}>
            <span>Progress</span>
            <span>{Math.round(((step - 1) / 4) * 100)}%</span>
          </div>
          <div className="w-full h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <motion.div
              className="h-1 rounded-full"
              style={{ background: 'linear-gradient(90deg, #2563eb, #3b82f6)' }}
              animate={{ width: `${((step - 1) / 4) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <div className="flex-1 max-w-2xl w-full mx-auto px-6 md:px-10 py-16">
          <AnimatePresence mode="wait">
            {/* STEP 1: Academic */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                <div className="mb-10">
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#3b82f6' }}>Step 1 of 4</p>
                  <h1 className="text-4xl font-bold mb-3" style={{ color: '#fff' }}>Academic Profile</h1>
                  <p className="text-sm" style={{ color: '#555' }}>Enter your CGPA and trend. All values are on a 10-point scale.</p>
                </div>
                <div className="space-y-6">
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
                    <p className="mt-1.5 text-xs" style={{ color: '#444' }}>
                      If your university uses a 4-point scale, multiply by 2.5 to convert.
                    </p>
                  </div>
                  <div>
                    <label style={labelStyle}>CGPA Trend</label>
                    <select
                      value={cgpaTrend}
                      onChange={e => setCgpaTrend(e.target.value as any)}
                      className={inputClass}
                      style={selectStyle}
                    >
                      <option value="IMPROVING">📈 Improving — my grades are going up</option>
                      <option value="STABLE">➡️ Stable — my grades are consistent</option>
                      <option value="DECLINING">📉 Declining — my grades have dropped</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Skills */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                <div className="mb-10">
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#3b82f6' }}>Step 2 of 4</p>
                  <h1 className="text-4xl font-bold mb-3" style={{ color: '#fff' }}>Skills</h1>
                  <p className="text-sm" style={{ color: '#555' }}>Search and select your skills. Then set a proficiency level for each one.</p>
                </div>
                <div className="space-y-6">
                  <ChipSelect
                    label="Your Skills"
                    selected={selectedSkillNames}
                    options={SKILL_OPTIONS}
                    onChange={handleSkillNamesChange}
                    placeholder="Search skills (e.g. Java, Python, React...)"
                  />
                  {/* Proficiency per skill */}
                  {skills.length > 0 && (
                    <div className="space-y-3">
                      <label style={labelStyle}>Set Proficiency Level</label>
                      {skills.map((skill, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl"
                          style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <span className="text-sm font-medium" style={{ color: '#fff' }}>{skill.skillName}</span>
                          <select
                            value={skill.proficiency}
                            onChange={e => {
                              const s = [...skills];
                              s[i].proficiency = e.target.value as any;
                              setSkills(s);
                            }}
                            className="text-sm rounded-lg px-3 py-1.5"
                            style={{ ...selectStyle, width: 'auto', minWidth: '160px' }}
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
                </div>
              </motion.div>
            )}

            {/* STEP 3: Projects */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                <div className="mb-10">
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#3b82f6' }}>Step 3 of 4</p>
                  <h1 className="text-4xl font-bold mb-3" style={{ color: '#fff' }}>Projects</h1>
                  <p className="text-sm" style={{ color: '#555' }}>Add the projects you have built. The more detail, the better the prediction.</p>
                </div>
                <div className="space-y-6">
                  {projects.map((proj, i) => (
                    <div
                      key={i}
                      className="rounded-2xl p-6 space-y-4 relative"
                      style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <button
                        onClick={() => removeProject(i)}
                        className="absolute top-4 right-4 p-1.5 rounded-lg transition-all"
                        style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <p className="font-semibold text-sm" style={{ color: '#3b82f6' }}>Project {i + 1}</p>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label style={labelStyle}>Category</label>
                          <select value={proj.category} onChange={e => updateProject(i, 'category', e.target.value)} className={inputClass} style={selectStyle}>
                            <option value="WEB">Web App</option>
                            <option value="MOBILE">Mobile</option>
                            <option value="AI_ML">AI / ML</option>
                            <option value="IOT">IoT</option>
                            <option value="SYSTEMS">Systems</option>
                            <option value="DATA">Data</option>
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Complexity</label>
                          <select value={proj.complexity} onChange={e => updateProject(i, 'complexity', e.target.value)} className={inputClass} style={selectStyle}>
                            <option value="CRUD_BASIC">Basic (CRUD / Simple)</option>
                            <option value="INTEGRATED_MULTI_SERVICE">Intermediate (Multi-service)</option>
                            <option value="DEPLOYED_SCALED">Advanced (Deployed & Scaled)</option>
                            <option value="RESEARCH_GRADE">Research Grade</option>
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Deployment</label>
                          <select value={proj.deploymentStatus} onChange={e => updateProject(i, 'deploymentStatus', e.target.value)} className={inputClass} style={selectStyle}>
                            <option value="LOCAL">Local Only</option>
                            <option value="HOSTED">Hosted / Deployed</option>
                            <option value="PRODUCTION_USERS">Production with Users</option>
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Team Size</label>
                          <select value={proj.teamSize} onChange={e => updateProject(i, 'teamSize', e.target.value)} className={inputClass} style={selectStyle}>
                            <option value="SOLO">Solo</option>
                            <option value="TEAM">Team</option>
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Duration (weeks)</label>
                          <input type="number" value={proj.durationWeeks} onChange={e => updateProject(i, 'durationWeeks', parseInt(e.target.value))} className={inputClass} style={inputStyle} placeholder="e.g. 8" />
                        </div>
                        <div>
                          <label style={labelStyle}>Your Role</label>
                          <input type="text" value={proj.role} onChange={e => updateProject(i, 'role', e.target.value)} className={inputClass} style={inputStyle} placeholder="e.g. Backend Dev" />
                        </div>
                      </div>

                      {/* Tech Stack chip select */}
                      <ChipSelect
                        label="Tech Stack"
                        selected={proj.techStack ? proj.techStack.split(',').map(s => s.trim()).filter(Boolean) : []}
                        options={TECH_STACK_OPTIONS}
                        onChange={vals => updateProject(i, 'techStack', vals.join(', '))}
                        placeholder="Search frameworks, tools..."
                      />

                      <div>
                        <label style={labelStyle}>Outcome / What you achieved</label>
                        <textarea
                          value={proj.outcome}
                          onChange={e => updateProject(i, 'outcome', e.target.value)}
                          rows={2}
                          className={inputClass}
                          style={{ ...inputStyle, resize: 'vertical' }}
                          placeholder="e.g. Reduced load time by 40%, 500+ users"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addProject}
                    className="w-full py-4 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
                    style={{
                      border: '2px dashed rgba(255,255,255,0.08)',
                      color: '#444',
                      background: 'transparent',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.4)';
                      (e.currentTarget as HTMLElement).style.color = '#3b82f6';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                      (e.currentTarget as HTMLElement).style.color = '#444';
                    }}
                  >
                    <Plus className="w-4 h-4" /> Add Project
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Stats */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                <div className="mb-10">
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#3b82f6' }}>Step 4 of 4</p>
                  <h1 className="text-4xl font-bold mb-3" style={{ color: '#fff' }}>Coding & GitHub Stats</h1>
                  <p className="text-sm" style={{ color: '#555' }}>Your activity across competitive coding platforms and GitHub.</p>
                </div>
                <div className="space-y-8">
                  {/* Coding Stats */}
                  <div className="rounded-2xl p-6 space-y-4" style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h3 className="text-sm font-semibold" style={{ color: '#3b82f6' }}>Competitive Coding (LeetCode / GFG / etc.)</h3>
                    <div>
                      <label style={labelStyle}>Total Problems Solved *</label>
                      <input
                        type="number"
                        required
                        value={stats.totalSolved}
                        onChange={e => setStats({ ...stats, totalSolved: parseInt(e.target.value) || '' })}
                        className={inputClass}
                        style={{ ...inputStyle, border: '1px solid rgba(59,130,246,0.3)' }}
                        placeholder="e.g. 300"
                      />
                      <p className="mt-1.5 text-xs" style={{ color: '#444' }}>Required — combined total across all platforms.</p>
                    </div>
                    <div>
                      <label style={labelStyle}>Difficulty Breakdown (optional)</label>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs mb-1 block" style={{ color: '#22c55e' }}>Easy</label>
                          <input type="number" value={stats.easy} onChange={e => setStats({ ...stats, easy: parseInt(e.target.value) || '' })} className={inputClass} style={inputStyle} placeholder="0" />
                        </div>
                        <div>
                          <label className="text-xs mb-1 block" style={{ color: '#eab308' }}>Medium</label>
                          <input type="number" value={stats.medium} onChange={e => setStats({ ...stats, medium: parseInt(e.target.value) || '' })} className={inputClass} style={inputStyle} placeholder="0" />
                        </div>
                        <div>
                          <label className="text-xs mb-1 block" style={{ color: '#ef4444' }}>Hard</label>
                          <input type="number" value={stats.hard} onChange={e => setStats({ ...stats, hard: parseInt(e.target.value) || '' })} className={inputClass} style={inputStyle} placeholder="0" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* GitHub Stats */}
                  <div className="rounded-2xl p-6 space-y-4" style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h3 className="text-sm font-semibold" style={{ color: '#3b82f6' }}>GitHub Activity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label style={labelStyle}>Public Repos</label>
                        <input type="number" value={stats.repoCount} onChange={e => setStats({ ...stats, repoCount: parseInt(e.target.value) || '' })} className={inputClass} style={inputStyle} placeholder="e.g. 20" />
                      </div>
                      <div>
                        <label style={labelStyle}>Active Months</label>
                        <input type="number" value={stats.activeMonths} onChange={e => setStats({ ...stats, activeMonths: parseInt(e.target.value) || '' })} className={inputClass} style={inputStyle} placeholder="e.g. 12" />
                      </div>
                      <div>
                        <label style={labelStyle}>Total Stars</label>
                        <input type="number" value={stats.stars} onChange={e => setStats({ ...stats, stars: parseInt(e.target.value) || '' })} className={inputClass} style={inputStyle} placeholder="e.g. 50" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12">
            <button
              onClick={() => setStep(s => Math.max(s - 1, 1))}
              disabled={step === 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: step === 1 ? 'transparent' : 'rgba(255,255,255,0.05)',
                color: step === 1 ? 'transparent' : '#aaa',
                border: step === 1 ? 'none' : '1px solid rgba(255,255,255,0.08)',
                cursor: step === 1 ? 'default' : 'pointer',
              }}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < 4 ? (
              <MagneticButton strength={0.25}>
                <button
                  onClick={() => setStep(s => Math.min(s + 1, 4))}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                    color: '#fff',
                    boxShadow: '0 0 20px rgba(59,130,246,0.2)',
                  }}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </MagneticButton>
            ) : (
              <MagneticButton strength={0.25}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: saving ? '#1a1a1a' : 'linear-gradient(135deg, #2563eb, #3b82f6)',
                    color: saving ? '#555' : '#fff',
                    boxShadow: saving ? 'none' : '0 0 25px rgba(59,130,246,0.3)',
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Finish & View Dashboard'}
                </button>
              </MagneticButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
