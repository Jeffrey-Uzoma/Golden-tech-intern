
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, whatsappToEmail } from '../lib/firebase';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const trimmedIdentifier = identifier.trim();
      const looksLikeEmail = trimmedIdentifier.includes('@');
      const email = looksLikeEmail
        ? trimmedIdentifier
        : whatsappToEmail(trimmedIdentifier);

      const cred = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const profileSnap = await getDoc(
        doc(db, 'users', cred.user.uid)
      );

      if (!profileSnap.exists()) {
        setError(
          'No profile found for this account. Contact the admin.'
        );
        return;
      }

      const role = profileSnap.data().role;

      navigate(role === 'admin' ? '/admin' : '/intern', {
        replace: true,
      });
    } catch (err) {
      setError(
        'Login failed. Check your number/email and password, then try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#0B1220]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">

        {/* Brand panel */}
        <section className="relative hidden overflow-hidden bg-[#0B1220] lg:flex lg:flex-col lg:justify-between p-12 xl:p-16">

          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-[#D4AF37]/20" />
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-[#D4AF37]/10" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#D4AF37]/4 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10">
                <span className="text-lg font-bold text-[#D4AF37]">
                  G
                </span>
              </div>

              <div>
                <p className="text-sm font-bold tracking-[0.18em] text-white">
                  GOLDEN
                </p>
                <p className="text-[10px] font-medium tracking-[0.28em] text-[#D4AF37]">
                  TECHNOLOGIES
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 max-w-lg">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
              The learning experience
            </p>

            <h1 className="text-4xl font-semibold leading-[1.12] tracking-tight text-white xl:text-6xl">
              Where your
              <span className="block text-[#D4AF37]">
                potential
              </span>
              becomes progress.
            </h1>

            <p className="mt-7 max-w-md text-sm leading-7 text-slate-400">
              Access your training tasks, track your progress,
              and build the skills that shape your future in technology.
            </p>

            <div className="mt-10 flex items-center gap-3">
              <div className="h-px w-12 bg-[#D4AF37]" />
              <span className="text-xs text-slate-500">
                Learn. Create. Advance.
              </span>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-slate-500">
            <span>© {new Date().getFullYear()} Golden Technologies</span>
            <span className="text-[#D4AF37]/70">
              Built for growth
            </span>
          </div>
        </section>

        {/* Login panel */}
        <section className="flex min-h-screen flex-col justify-between px-6 py-8 sm:px-12 lg:min-h-0 lg:px-16 xl:px-24">

          <div className="flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B1220]">
                <span className="font-bold text-[#D4AF37]">G</span>
              </div>
              <div>
                <p className="text-sm font-bold tracking-wider">
                  GOLDEN
                </p>
                <p className="text-[9px] tracking-[0.25em] text-[#9B7A19]">
                  TECHNOLOGIES
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">

            <div className="mb-10">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#9B7A19]">
                Welcome back
              </p>

              <h2 className="text-3xl font-semibold tracking-tight text-[#0B1220] sm:text-4xl">
                Sign in to your
                <span className="block">workspace.</span>
              </h2>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                Enter your credentials to continue to the Golden
                Technologies intern portal.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              <div>
                <label
                  htmlFor="identifier"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600"
                >
                  Email or WhatsApp number
                </label>

                <input
                  id="identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="username"
                  className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[#0B1220] outline-none transition placeholder:text-slate-400 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Admins use email. Interns can use WhatsApp number.
                </p>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 pr-16 text-sm text-[#0B1220] outline-none transition focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 transition hover:text-[#9B7A19]"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-5 text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="group flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#D4AF37] px-5 text-sm font-bold text-[#0B1220] shadow-lg shadow-[#D4AF37]/10 transition hover:bg-[#E3C45A] hover:shadow-xl hover:shadow-[#D4AF37]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0B1220]/30 border-t-[#0B1220]" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in to workspace
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>

            </form>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
              Secure authentication powered by Firebase
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 lg:text-left">
            Golden Technologies · Intern Portal
          </p>

        </section>
      </div>
    </div>
  );
}