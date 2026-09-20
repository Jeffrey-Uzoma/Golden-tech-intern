
import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import type { Task } from '../lib/types';
import InternTaskCard from '../components/InternTaskCard';

export default function InternDashboard() {
  const { user, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'tasks'),
      where('assignedTo', '==', user.uid),
      orderBy('deadline', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setTasks(
        snap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Task
        )
      );
    });

    const timer = setInterval(() => setNow(Date.now()), 15_000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, [user]);

  const submittedCount = tasks.filter(
    (task) => !!task.submission
  ).length;

  const pendingCount = tasks.filter(
    (task) => !task.submission && now <= task.deadline
  ).length;

  const overdueCount = tasks.filter(
    (task) => !task.submission && now > task.deadline
  ).length;

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#0B1220]">

      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-300 items-center justify-between px-5 py-4 sm:px-8">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B1220]">
              <span className="font-bold text-[#D4AF37]">G</span>
            </div>

            <div>
              <p className="text-sm font-bold tracking-wider text-[#0B1220]">
                GOLDEN
              </p>
              <p className="text-[9px] font-medium tracking-[0.25em] text-[#9B7A19]">
                TECHNOLOGIES
              </p>
            </div>
          </div>

          <button
            onClick={signOut}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#D4AF37] hover:text-[#9B7A19]"
          >
            Log out
          </button>

        </div>
      </header>

      <main className="mx-auto max-w-300 px-5 py-8 sm:px-8 lg:py-12">

        {/* Welcome section */}
        <section className="relative overflow-hidden rounded-3xl bg-[#0B1220] p-7 sm:p-10">

          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border border-[#D4AF37]/15" />
          <div className="absolute -right-8 -top-12 h-48 w-48 rounded-full border border-[#D4AF37]/10" />

          <div className="relative z-10 max-w-xl">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
              Your learning workspace
            </p>

            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
              Welcome back,
              <span className="block text-[#D4AF37]">
                {user?.name || 'Intern'}.
              </span>
            </h1>

            <p className="mt-5 max-w-md text-sm leading-6 text-slate-400">
              Stay consistent, complete your assignments, and
              keep building your technology skills.
            </p>
          </div>

          <div className="relative z-10 mt-8 flex items-center gap-3">
            <div className="h-1 w-12 rounded-full bg-[#D4AF37]" />
            <div className="h-1 w-4 rounded-full bg-[#D4AF37]/30" />
            <div className="h-1 w-4 rounded-full bg-[#D4AF37]/30" />
          </div>

        </section>

        {/* Summary */}
        <section className="mt-6 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
            <p className="text-xs font-semibold text-slate-400">
              Total assignments
            </p>
            <p className="mt-3 text-3xl font-semibold text-[#0B1220]">
              {tasks.length}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Assigned to you
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
            <p className="text-xs font-semibold text-slate-400">
              Submitted
            </p>
            <p className="mt-3 text-3xl font-semibold text-[#0B1220]">
              {submittedCount}
            </p>
            <p className="mt-2 text-xs text-emerald-600">
              Completed submissions
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
            <p className="text-xs font-semibold text-slate-400">
              Awaiting submission
            </p>
            <p className="mt-3 text-3xl font-semibold text-[#0B1220]">
              {pendingCount}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {overdueCount > 0
                ? `${overdueCount} overdue`
                : 'Within deadline'}
            </p>
          </div>

        </section>

        {/* Task list */}
        <section className="mt-10">

          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#9B7A19]">
                Your assignments
              </p>

              <h2 className="text-2xl font-semibold tracking-tight text-[#0B1220]">
                Keep moving forward
              </h2>
            </div>

            <span className="hidden rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 sm:inline-flex">
              {tasks.length} tasks
            </span>
          </div>

          {tasks.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <p className="text-sm font-semibold text-[#0B1220]">
                No tasks assigned yet
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Your assignments will appear here when they are created.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-1 transition hover:border-[#D4AF37]/50"
              >
                <InternTaskCard
                  task={task}
                  now={now}
                  internUid={user!.uid}
                />
              </div>
            ))}
          </div>

        </section>

        <footer className="mt-12 border-t border-slate-200/80 pt-6 text-center text-xs text-slate-400">
          Golden Technologies · Keep learning, keep building.
        </footer>

      </main>
    </div>
  );
}