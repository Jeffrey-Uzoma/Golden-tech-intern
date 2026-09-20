
import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import type { AppUser } from '../lib/types';
import { buildWhatsAppLink } from '../lib/whatsapp';
import { uploadToCloudinary } from '../lib/cloudinary';

export default function CreateTaskForm({
  interns,
  onCreated,
}: {
  interns: AppUser[];
  onCreated: () => void;
}) {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [notifyLink, setNotifyLink] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] ?? null;

    setError(null);
    setAttachment(file);
  }

  function removeAttachment() {
    setAttachment(null);

    const fileInput = document.getElementById(
      'task-attachment'
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = '';
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setNotifyLink(null);

    const intern = interns.find((i) => i.uid === assignedTo);

    if (!intern) {
      setError('Choose an intern to assign this task to.');
      return;
    }

    if (!title.trim()) {
      setError('Enter a task title.');
      return;
    }

    if (!description.trim()) {
      setError('Enter a task description.');
      return;
    }

    const deadlineMs = new Date(deadline).getTime();

    if (
      Number.isNaN(deadlineMs) ||
      deadlineMs <= Date.now()
    ) {
      setError('Pick a deadline that is in the future.');
      return;
    }

    setSubmitting(true);

    try {
      let adminAttachment:
        | {
            fileName: string;
            fileUrl: string;
            publicId?: string;
            resourceType?: string;
          }
        | undefined;

      // Upload the admin file first, if one was selected.
      if (attachment) {
        const uploadedFile = await uploadToCloudinary(
          attachment,
          'golden-technologies/task-resources'
        );

        adminAttachment = {
          fileName: uploadedFile.originalFileName,
          fileUrl: uploadedFile.url,
          publicId: uploadedFile.publicId,
          resourceType: uploadedFile.resourceType,
        };
      }

      // Create the Firestore task document.
      await addDoc(collection(db, 'tasks'), {
        title: title.trim(),
        description: description.trim(),
        deadline: deadlineMs,
        assignedTo: intern.uid,
        assignedToName: intern.name,
        assignedToWhatsapp: intern.whatsapp,
        createdBy: user?.uid ?? null,
        createdAt: Date.now(),
        submission: null,

        // Only save this field when a file was uploaded.
        ...(adminAttachment && {
          adminAttachment,
        }),
      });

      setNotifyLink(
        buildWhatsAppLink(
          intern.whatsapp,
          `Hi ${intern.name}, a new task has been assigned to you: "${title.trim()}". Deadline: ${new Date(
            deadlineMs
          ).toLocaleString()}. Please log in to the intern portal to view details and submit your work.`
        )
      );

      // Reset the form.
      setTitle('');
      setDescription('');
      setDeadline('');
      setAssignedTo('');
      setAttachment(null);

      const fileInput = document.getElementById(
        'task-attachment'
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = '';
      }

      onCreated();
    } catch (submitError) {
      console.error('Task creation error:', submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Could not create the task. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B1220]">
          <span className="text-lg text-[#D4AF37]">▦</span>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9B7A19]">
            Assignment studio
          </p>

          <h3 className="mt-1 text-lg font-semibold text-[#0B1220]">
            Assign a task
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Create an assignment, attach learning materials,
            and set a deadline for an intern.
          </p>
        </div>
      </div>

      {/* Intern select */}
      <div>
        <label
          htmlFor="task-intern"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600"
        >
          Assign to
        </label>

        <select
          id="task-intern"
          required
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[#0B1220] outline-none transition focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10"
        >
          <option value="">Select an intern...</option>

          {interns.map((i) => (
            <option key={i.uid} value={i.uid}>
              {i.name} ({i.whatsapp})
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor="task-title"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600"
        >
          Task title
        </label>

        <input
          id="task-title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Build a responsive landing page"
          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[#0B1220] outline-none transition placeholder:text-slate-400 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="task-description"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600"
        >
          Description
        </label>

        <textarea
          id="task-description"
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explain the task requirements and expected deliverables..."
          className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-[#0B1220] outline-none transition placeholder:text-slate-400 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10"
        />
      </div>

      {/* Deadline */}
      <div>
        <label
          htmlFor="task-deadline"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600"
        >
          Deadline
        </label>

        <input
          id="task-deadline"
          required
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[#0B1220] outline-none transition focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10"
        />

        <p className="mt-2 text-xs text-slate-400">
          Select a future date and time.
        </p>
      </div>

      {/* Admin attachment */}
      <div>
        <div className="mb-2">
          <label
            htmlFor="task-attachment"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600"
          >
            Task resource
            <span className="ml-2 font-normal normal-case tracking-normal text-slate-400">
              (Optional)
            </span>
          </label>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Upload a file the intern needs to complete the
            assignment, such as a PDF, document, image, or ZIP file.
          </p>
        </div>

        <label
          htmlFor="task-attachment"
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#D4AF37]/60 bg-[#F8F6F0] px-5 py-7 text-center transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/5"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B1220]">
            <span className="text-lg text-[#D4AF37]">↑</span>
          </div>

          <p className="mt-3 text-sm font-semibold text-[#0B1220]">
            {attachment
              ? 'Choose a different file'
              : 'Upload task resource'}
          </p>

          <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
            {attachment
              ? attachment.name
              : 'Select a file from your computer'}
          </p>

          <input
            id="task-attachment"
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {attachment && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[#0B1220]">
                {attachment.name}
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                {(attachment.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>

            <button
              type="button"
              onClick={removeAttachment}
              className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-5 text-red-700"
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="group flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-bold text-[#0B1220] shadow-lg shadow-[#D4AF37]/10 transition hover:bg-[#E3C45A] hover:shadow-xl hover:shadow-[#D4AF37]/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0B1220]/30 border-t-[#0B1220]" />
            {attachment
              ? 'Uploading and creating task...'
              : 'Creating task...'}
          </>
        ) : (
          <>
            Create task

            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </>
        )}
      </button>

      {/* WhatsApp notification */}
      {notifyLink && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <span className="text-lg text-emerald-700">✓</span>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-emerald-800">
                Task created successfully
              </p>

              <p className="mt-1 text-xs leading-5 text-emerald-700">
                Notify the assigned intern through WhatsApp.
              </p>

              <a
                href={notifyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center justify-center rounded-xl bg-[#0B1220] px-4 py-2.5 text-xs font-bold text-[#D4AF37] transition hover:bg-[#172337]"
              >
                Open WhatsApp →
              </a>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}