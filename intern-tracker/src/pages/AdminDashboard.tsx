
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
import type { AppUser, Task } from '../lib/types';
import CreateInternForm from '../components/CreateInternForm';
import CreateTaskForm from '../components/CreateTaskForm';
import { buildWhatsAppLink } from '../lib/whatsapp';

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [interns, setInterns] = useState<AppUser[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tab, setTab] = useState<'tasks' | 'interns'>('tasks');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const q1 = query(
      collection(db, 'users'),
      where('role', '==', 'intern')
    );

    const unsub1 = onSnapshot(q1, (snap) => {
      setInterns(
        snap.docs.map((d) => d.data() as AppUser)
      );
    });

    const q2 = query(
      collection(db, 'tasks'),
      orderBy('createdAt', 'desc')
    );

    const unsub2 = onSnapshot(q2, (snap) => {
      setTasks(
        snap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Task
        )
      );
    });

    const timer = setInterval(() => setNow(Date.now()), 30_000);

    return () => {
      unsub1();
      unsub2();
      clearInterval(timer);
    };
  }, []);

  const submittedCount = tasks.filter(
    (task) => !!task.submission
  ).length;

  const overdueCount = tasks.filter(
    (task) => !task.submission && now > task.deadline
  ).length;

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#0B1220]">

      {/* Top header */}
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-375 items-center justify-between px-5 py-4 sm:px-8">

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

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-[#0B1220]">
                {user?.name}
              </p>
              <p className="text-[11px] text-slate-400">
                Administrator
              </p>
            </div>

            <button
              onClick={signOut}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#D4AF37] hover:text-[#9B7A19]"
            >
              Log out
            </button>
          </div>

        </div>
      </header>

      <div className="mx-auto flex max-w-375">

        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200/80 bg-white px-4 py-8 lg:block">

          <div className="mb-8 px-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
              Workspace
            </p>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Administration
            </p>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setTab('tasks')}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                tab === 'tasks'
                  ? 'bg-[#0B1220] text-[#D4AF37] shadow-lg shadow-slate-900/10'
                  : 'text-slate-500 hover:bg-[#F8F6F0] hover:text-[#0B1220]'
              }`}
            >
              <span className="text-base">▦</span>
              Task management
            </button>

            <button
              onClick={() => setTab('interns')}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                tab === 'interns'
                  ? 'bg-[#0B1220] text-[#D4AF37] shadow-lg shadow-slate-900/10'
                  : 'text-slate-500 hover:bg-[#F8F6F0] hover:text-[#0B1220]'
              }`}
            >
              <span className="text-base">♙</span>
              Intern management
            </button>
          </nav>

          <div className="mt-12 rounded-2xl bg-[#0B1220] p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              Golden standard
            </p>
            <p className="mt-3 text-sm font-medium leading-6 text-white">
              Keep every task moving forward.
            </p>
            <div className="mt-5 h-1 w-10 rounded-full bg-[#D4AF37]" />
          </div>

        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10">

          <div className="mb-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#9B7A19]">
              Admin workspace
            </p>

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-[#0B1220]">
                  {tab === 'tasks' ? 'Task overview' : 'Intern management'}
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  {tab === 'tasks'
                    ? 'Manage assignments, deadlines, and submissions.'
                    : 'Create and manage your training participants.'}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile navigation */}
          <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden">
            <button
              onClick={() => setTab('tasks')}
              className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                tab === 'tasks'
                  ? 'bg-[#0B1220] text-[#D4AF37]'
                  : 'border border-slate-200 bg-white text-slate-500'
              }`}
            >
              Tasks
            </button>

            <button
              onClick={() => setTab('interns')}
              className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                tab === 'interns'
                  ? 'bg-[#0B1220] text-[#D4AF37]'
                  : 'border border-slate-200 bg-white text-slate-500'
              }`}
            >
              Interns
            </button>
          </div>

          {/* Overview statistics */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
              <p className="text-xs font-semibold text-slate-400">
                Total interns
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-[#0B1220]">
                {interns.length}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Registered participants
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
              <p className="text-xs font-semibold text-slate-400">
                Total tasks
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-[#0B1220]">
                {tasks.length}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                All assignments
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
              <p className="text-xs font-semibold text-slate-400">
                Submissions
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-[#0B1220]">
                {submittedCount}
              </p>
              <p className="mt-2 text-xs text-emerald-600">
                Tasks submitted
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
              <p className="text-xs font-semibold text-slate-400">
                Overdue
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-[#0B1220]">
                {overdueCount}
              </p>
              <p className="mt-2 text-xs text-red-500">
                No submission after deadline
              </p>
            </div>

          </div>

          {tab === 'interns' && (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">

              <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
                <div className="mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9B7A19]">
                    New participant
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-[#0B1220]">
                    Create intern
                  </h2>
                </div>

                <CreateInternForm onCreated={() => {}} />
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
                <div className="mb-6 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9B7A19]">
                      Directory
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-[#0B1220]">
                      Registered interns
                    </h2>
                  </div>

                  <span className="rounded-full bg-[#F8F6F0] px-3 py-1 text-xs font-bold text-[#9B7A19]">
                    {interns.length}
                  </span>
                </div>

                {interns.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                    <p className="text-sm text-slate-500">
                      No interns registered yet.
                    </p>
                  </div>
                )}

                <ul className="space-y-3">
                  {interns.map((i) => (
                    <li
                      key={i.uid}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-[#D4AF37]/50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0B1220] text-sm font-bold text-[#D4AF37]">
                        {i.name?.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#0B1220]">
                          {i.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {i.whatsapp}
                        </p>
                      </div>

                      <span className="ml-auto shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                        Intern
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}

          {tab === 'tasks' && (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">

              {/* Create task */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
                <div className="mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9B7A19]">
                    Assignment studio
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-[#0B1220]">
                    Create a task
                  </h2>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Assign a new task to an intern and set a deadline.
                  </p>
                </div>

                <CreateTaskForm
                  interns={interns}
                  onCreated={() => {}}
                />
              </div>

              {/* Task list */}
              <div className="min-w-0 space-y-4">

                {tasks.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
                    <p className="text-sm text-slate-500">
                      No tasks created yet.
                    </p>
                  </div>
                )}

                {tasks.map((task) => {
                  const isPastDeadline = now > task.deadline;

                  const statusLabel = task.submission
                    ? 'Submitted'
                    : isPastDeadline
                    ? 'Overdue'
                    : 'Awaiting submission';

                  const statusColor = task.submission
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : isPastDeadline
                    ? 'bg-red-50 text-red-700 border-red-100'
                    : 'bg-amber-50 text-amber-700 border-amber-100';

                  return (
                    <div
                      key={task.id}
                      className="rounded-2xl border border-slate-200/80 bg-white p-5 transition hover:border-[#D4AF37]/50 sm:p-6"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        <div className="min-w-0">
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9B7A19]">
                            Assignment
                          </p>

                          <h3 className="text-base font-semibold leading-6 text-[#0B1220]">
                            {task.title}
                          </h3>

                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            Assigned to {task.assignedToName}
                          </p>
                        </div>

                        <span
                          className={`inline-flex w-fit shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-bold ${statusColor}`}
                        >
                          {statusLabel}
                        </span>

                      </div>

                      <div className="mt-4 rounded-xl bg-[#F8F6F0] p-4">
                        <p className="text-xs font-medium leading-6 text-slate-600">
                          {task.description}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-lg border border-slate-100 bg-white px-3 py-2">
                          Due {new Date(task.deadline).toLocaleString()}
                        </span>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">

                        <a
                          href={buildWhatsAppLink(
                            task.assignedToWhatsapp,
                            `Reminder: "${task.title}" is due ${new Date(task.deadline).toLocaleString()}.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl bg-[#0B1220] px-4 py-2.5 text-xs font-bold text-[#D4AF37] transition hover:bg-[#172337]"
                        >
                          Remind on WhatsApp
                        </a>

                        {task.submission && (
                          <a
                            href={task.submission.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-[#D4AF37] hover:text-[#9B7A19]"
                          >
                            View submission
                          </a>
                        )}

                      </div>

                      {task.submission && (
                        <p className="mt-3 truncate text-xs text-slate-400">
                          File: {task.submission.fileName}
                        </p>
                      )}

                    </div>
                  );
                })}

              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}