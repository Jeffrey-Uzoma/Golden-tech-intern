
import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { uploadToCloudinary } from '../lib/cloudinary';
import type { Task } from '../lib/types';

export default function InternTaskCard({
  task,
  now,
  internUid,
}: {
  task: Task;
  now: number;
  internUid: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPastDeadline = now > task.deadline;
  const canSubmit = !isPastDeadline;

  function removeSelectedFile() {
    setFile(null);

    const fileInput = document.getElementById(
      `file-${task.id}`
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = '';
    }
  }

  async function handleUpload() {
    if (!file) {
      setError('Choose a file first.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const { url, originalFileName } =
        await uploadToCloudinary(
          file,
          `submissions/${internUid}/${task.id}`
        );

      await updateDoc(doc(db, 'tasks', task.id), {
        submission: {
          fileName: originalFileName,
          fileUrl: url,
          submittedAt: Date.now(),
        },
      });

      removeSelectedFile();
    } catch (uploadError) {
      console.error('Submission upload error:', uploadError);

      setError(
        'Upload failed. The deadline may have just passed, or check your connection.'
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl bg-white">
      {/* Top accent */}
      <div className="h-1 w-full bg-linear-to-r from-[#D4AF37] via-[#E3C45A] to-transparent" />

      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9B7A19]">
              Assigned task
            </p>

            <h3 className="text-lg font-semibold leading-7 text-[#0B1220]">
              {task.title}
            </h3>

            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <span className="text-[#9B7A19]">◷</span>

              <span>
                Due {new Date(task.deadline).toLocaleString()}
              </span>
            </div>
          </div>

          {isPastDeadline && !task.submission && (
            <span className="inline-flex w-fit shrink-0 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-[10px] font-bold text-red-700">
              Deadline passed
            </span>
          )}

          {task.submission && (
            <span className="inline-flex w-fit shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700">
              ✓ Submitted
            </span>
          )}

          {!isPastDeadline && !task.submission && (
            <span className="inline-flex w-fit shrink-0 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-700">
              In progress
            </span>
          )}
        </div>

        {/* Description */}
        <div className="mt-5 rounded-xl bg-[#F8F6F0] p-4">
          <p className="text-sm leading-7 text-slate-600">
            {task.description}
          </p>
        </div>

        {/* Admin resource */}
        {task.adminAttachment && (
          <div className="mt-5 rounded-2xl border border-[#D4AF37]/30 bg-[#F8F6F0] p-5">
            <div className="flex items-start gap-3">
              {/* Resource icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B1220]">
                <span className="text-sm font-bold text-[#D4AF37]">
                  ↓
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9B7A19]">
                  Admin resource
                </p>

                <h4 className="mt-1 text-sm font-semibold text-[#0B1220]">
                  Learning material
                </h4>

                <p className="mt-1 wrap-break-words text-xs leading-5 text-slate-500">
                  {task.adminAttachment.fileName}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {/* Open file */}
                  <a
                    href={task.adminAttachment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-[#0B1220] px-4 py-2.5 text-xs font-bold text-[#D4AF37] transition hover:bg-[#172337]"
                  >
                    Open file
                  </a>

                  {/* Download file */}
                  <a
                    href={task.adminAttachment.fileUrl}
                    download={task.adminAttachment.fileName}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-[#D4AF37] hover:text-[#9B7A19]"
                  >
                    Download
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Existing submission */}
        {task.submission && (
          <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                ✓
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-emerald-800">
                  Your submission
                </p>

                <p className="mt-1 wrap-break-words text-xs leading-5 text-emerald-700">
                  {task.submission.fileName}
                </p>

                <p className="mt-1 text-xs text-emerald-600">
                  Submitted on{' '}
                  {new Date(
                    task.submission.submittedAt
                  ).toLocaleString()}
                </p>

                {canSubmit && (
                  <p className="mt-2 text-xs leading-5 text-emerald-700">
                    You can replace your submission before the deadline.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Upload section */}
        {canSubmit ? (
          <div className="mt-6">
            <div className="mb-3">
              <p className="text-sm font-semibold text-[#0B1220]">
                {task.submission
                  ? 'Replace your submission'
                  : 'Submit your work'}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Select a file from your device and upload it to this task.
              </p>
            </div>

            <label
              htmlFor={`file-${task.id}`}
              className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#D4AF37]/60 bg-[#F8F6F0]/50 px-5 py-8 text-center transition hover:border-[#D4AF37] hover:bg-[#F8F6F0]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B1220] text-xl text-[#D4AF37] transition group-hover:scale-105">
                ↑
              </div>

              <p className="mt-4 text-sm font-semibold text-[#0B1220]">
                {file ? 'File selected' : 'Choose your file'}
              </p>

              <p className="mt-1 wrap-break-words text-xs text-slate-500">
                {file
                  ? file.name
                  : 'Click to browse files on your device'}
              </p>

              <span className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                Browse files
              </span>

              <input
                id={`file-${task.id}`}
                type="file"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setError(null);
                }}
                className="sr-only"
              />
            </label>

            {/* Selected file */}
            {file && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#0B1220]">
                    {file.name}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={removeSelectedFile}
                  className="shrink-0 text-xs font-semibold text-slate-400 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Upload error */}
            {error && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700"
              >
                {error}
              </div>
            )}

            {/* Upload button */}
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || !file}
              className="mt-4 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#D4AF37] px-5 text-sm font-bold text-[#0B1220] shadow-lg shadow-[#D4AF37]/10 transition hover:bg-[#E3C45A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0B1220]/30 border-t-[#0B1220]" />
                  Uploading...
                </>
              ) : (
                <>
                  {task.submission
                    ? 'Replace submission'
                    : 'Submit work'}

                  <span>→</span>
                </>
              )}
            </button>
          </div>
        ) : (
          !task.submission && (
            <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">
                Submission closed
              </p>

              <p className="mt-1 text-xs leading-5 text-red-700">
                The deadline has passed and no submission was uploaded in time.
              </p>
            </div>
          )
        )}
      </div>
    </article>
  );
}