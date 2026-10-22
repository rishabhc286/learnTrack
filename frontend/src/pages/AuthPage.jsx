import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle,
  Flame,
  Brain,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

function extractErrorMessage(error) {
  const data = error.response?.data;
  if (data?.fieldErrors) {
    const firstKey = Object.keys(data.fieldErrors)[0];
    return `${data.fieldErrors[firstKey]}`;
  }
  return data?.message || 'Authentication failed. Please verify your credentials.';
}

export default function AuthPage({ mode = 'login' }) {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(form.email.trim(), form.password);
        toast.success('Welcome back to LearnTrack!');
      } else {
        await register(form.name.trim(), form.email.trim(), form.password);
        toast.success('Account created successfully! Welcome aboard!');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDemoLogin() {
    setSubmitting(true);
    const demoEmail = 'demo@learntrack.dev';
    const demoPassword = 'password123';
    try {
      // Try logging in first
      try {
        await login(demoEmail, demoPassword);
      } catch {
        // If not registered yet, register demo user
        await register('Alex Morgan', demoEmail, demoPassword);
      }
      toast.success('Signed in as Demo Student!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Could not sign in as demo user: ' + extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left Column — Branding & Highlights (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-12 flex-col justify-between relative overflow-hidden border-r border-indigo-900/40">
        {/* Glow decoration */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-white">LearnTrack</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v1.0
              </span>
            </div>
          </div>

          <div className="mt-16">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
              BCSJ 0962 • Team No. 36
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
              Master skills with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-300">clarity & consistency.</span>
            </h1>
            <p className="mt-4 text-base text-slate-300 leading-relaxed max-w-lg">
              Organize learning roadmaps, track focused study sessions, build daily streaks, and harness AI-driven skill gap analysis to reach your dream tech role.
            </p>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="relative z-10 my-8 space-y-3.5">
          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-800/60 border border-indigo-500/15 backdrop-blur-sm">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Structured Roadmaps</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Break roles down into Subjects, Topics, and curated Resources with live completion percentages.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-800/60 border border-indigo-500/15 backdrop-blur-sm">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Gamified Consistency</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Track study time, maintain daily streaks, and automatically unlock milestone achievement badges.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-800/60 border border-indigo-500/15 backdrop-blur-sm">
            <div className="p-2 rounded-lg bg-violet-500/20 text-violet-300">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">AI Skill Gap Analysis</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Compare your completed topics against industry roles (Java Backend, Frontend, DevOps) for instant study plans.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-4">
          <span>Spring Boot • PostgreSQL • FastAPI • React</span>
          <span>© 2026 LearnTrack</span>
        </div>
      </div>

      {/* Right Column — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-900">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile branding */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-6">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">LearnTrack</span>
          </div>

          {/* Form Header */}
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {isLogin
                ? 'Sign in with your credentials to access your progress.'
                : 'Start tracking your roadmaps, study sessions, and goals.'}
            </p>
          </div>

          {/* Demo Login Quick Action */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 px-4 py-2.5 text-sm font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4 text-indigo-400" />
            Instant Sign In (Demo Student Account)
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800" />
            <span className="flex-shrink mx-4 text-xs uppercase font-medium text-slate-500">
              or continue with email
            </span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  minLength={2}
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Alex Morgan"
                  className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@university.edu"
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <span className="text-xs text-slate-500">Min 6 characters</span>
              </div>
              <div className="relative">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3.5 py-2.5 pr-10 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all disabled:opacity-50"
            >
              {submitting ? (
                'Processing...'
              ) : isLogin ? (
                <>
                  Sign in to LearnTrack <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login / Register */}
          <div className="pt-2 text-center text-sm text-slate-400">
            {isLogin ? (
              <p>
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                >
                  Create one now
                </Link>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                >
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
