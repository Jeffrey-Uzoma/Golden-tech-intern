
import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import {
  db,
  getSecondaryAuth,
  whatsappToEmail,
} from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

export default function CreateInternForm({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);

    const { auth: secondaryAuth, cleanup } =
      await getSecondaryAuth();

    try {
      const email = whatsappToEmail(whatsapp);

      const cred = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        password
      );

      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        name: name.trim(),
        whatsapp: whatsapp.trim(),
        role: 'intern',
        createdAt: Date.now(),
        createdBy: user?.uid ?? null,
      });

      await signOut(secondaryAuth);

      setSuccess(
        `Intern account for ${name.trim()} was created successfully.`
      );

      setName('');
      setWhatsapp('');
      setPassword('');

      onCreated();
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        setError(
          'An intern with this WhatsApp number already has an account.'
        );
      } else if (err?.code === 'auth/invalid-email') {
        setError(
          'That WhatsApp number produced an invalid login. Use digits only with country code.'
        );
      } else {
        setError(
          'Could not create the account. Please try again.'
        );
      }
    } finally {
      await cleanup();
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Form header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B1220]">
          <span className="text-lg text-[#D4AF37]">♙</span>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9B7A19]">
            Intern management
          </p>
          <h3 className="mt-1 text-lg font-semibold text-[#0B1220]">
            Add a new intern
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Create login credentials for a new training participant.
          </p>
        </div>
      </div>

      {/* Full name */}
      <div>
        <label
          htmlFor="intern-name"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600"
        >
          Full name
        </label>

        <input
          id="intern-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter intern's full name"
          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[#0B1220] outline-none transition placeholder:text-slate-400 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10"
        />
      </div>

      {/* WhatsApp */}
      <div>
        <label
          htmlFor="intern-whatsapp"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600"
        >
          WhatsApp number
        </label>

        <input
          id="intern-whatsapp"
          type="tel"
          required
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="2348012345678"
          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[#0B1220] outline-none transition placeholder:text-slate-400 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10"
        />

        <p className="mt-2 text-xs leading-5 text-slate-400">
          Use digits only, including the country code.
        </p>
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="intern-password"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600"
        >
          Temporary password
        </label>

        <div className="relative">
          <input
            id="intern-password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a temporary password"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-16 text-sm text-[#0B1220] outline-none transition placeholder:text-slate-400 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-[#9B7A19]"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <p className="mt-2 text-xs leading-5 text-slate-400">
          Minimum of 6 characters. Share credentials securely.
        </p>
      </div>

      {/* Feedback */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-5 text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"
        >
          <p className="text-sm font-semibold text-emerald-800">
            Account created successfully
          </p>
          <p className="mt-1 text-xs leading-5 text-emerald-700">
            {success} Share the login details with the intern securely.
          </p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="group flex h-13 w-full items-center justify-center gap-3 rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-bold text-[#0B1220] shadow-lg shadow-[#D4AF37]/10 transition hover:bg-[#E3C45A] hover:shadow-xl hover:shadow-[#D4AF37]/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0B1220]/30 border-t-[#0B1220]" />
            Creating account...
          </>
        ) : (
          <>
            Create intern account
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </>
        )}
      </button>
    </form>
  );
}