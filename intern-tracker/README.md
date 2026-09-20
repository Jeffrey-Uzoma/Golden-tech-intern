# Golden Technologies — Intern Portal

A React + Vite + TypeScript app using Firebase (Auth + Firestore) for login
and data, and Cloudinary for file uploads, deployed as a static site on
Vercel — same overall setup as the Golden Premium Ventures site.

- You (admin) log in with your own email/password.
- You create intern accounts (name, WhatsApp number, password).
- You assign tasks with a deadline, and get a one-tap WhatsApp link to notify
  the intern (opens WhatsApp with the message pre-filled — you still hit send).
- The intern logs in with their WhatsApp number + password, sees their tasks,
  and uploads a file to submit. The upload button disappears once the
  deadline passes — enforced both in the UI and in Firestore's rules, so it's
  not just hidden, it's actually blocked.

## 1. Create the Firebase project

1. Go to https://console.firebase.google.com → **Add project**.
2. Once created, go to **Authentication → Get started → Sign-in method** and
   enable **Email/Password**. (If you can't find "Authentication" in the
   sidebar, use this direct link once your project exists:
   `https://console.firebase.google.com/project/YOUR_PROJECT_ID/authentication/users`)
3. Go to **Firestore Database → Create database** (production mode, any
   region close to you). Direct link:
   `https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore`
4. Go to **Project settings → General → Your apps → Add app → Web**, register
   it, and copy the `firebaseConfig` values.

This project does **not** use Firebase Storage — since 2024/2026, Firebase
Storage requires the paid Blaze plan even for tiny usage. File uploads go
through Cloudinary instead (next step), which has a free tier and needs no
billing details at all.

## 2. Create a Cloudinary account for file uploads

1. Sign up free at https://cloudinary.com — or use your existing Golden
   Premium Ventures account; this app keeps its uploads in their own
   `submissions/...` folder, so nothing will mix together.
2. Your **Cloud name** is shown right on the dashboard home page.
3. Go to **Settings → Upload → Upload presets → Add upload preset**.
   - Set **Signing Mode** to **Unsigned**. This is what lets the intern's
     browser upload a file directly to Cloudinary with no backend server and
     no secret key exposed in the code.
   - Save, and copy the preset's name.

## 3. Configure environment variables

Copy `.env.example` to `.env` and fill in the Firebase values from step 1
and the two Cloudinary values from step 2:

```
cp .env.example .env
```

## 4. Publish the Firestore security rules

This is what actually enforces "only the admin creates users" and "no
submission after the deadline" — not just the app's UI, which someone could
bypass by editing the page's code in their browser.

1. In the Firebase console, open **Firestore Database → Rules** tab.
2. Select everything currently there and delete it.
3. Paste in the full contents of `firestore.rules` from this project.
4. Click **Publish**.

## 5. Create your own admin account (one-time, manual)

Because the very first admin account can't be created by an app that
requires an admin to already exist, do this once by hand:

1. Firebase Console → **Authentication → Users → Add user** — use your real
   email and a password.
2. Copy the new user's **UID** from that same screen.
3. Firebase Console → **Firestore Database → Data** tab → **Start
   collection** → collection ID `users` → **Document ID** = paste the UID
   you just copied (not "Auto-ID" — it has to match exactly). Add these
   fields:
   - `uid` (string) = the same UID, pasted again
   - `name` (string) = your name
   - `whatsapp` (string) = your number (not used for admin login, but keep it filled)
   - `role` (string) = `admin`
   - `createdAt` (number) = any number, e.g. `0`

That's it — you can now log in with that email/password and you'll land on
the admin dashboard, where you create every intern account from then on.

## 6. Run it locally

```
npm install
npm run dev
```

## 7. Deploy to Vercel

1. Push this project to a GitHub repo.
2. In Vercel: **New Project → Import** that repo. Framework preset: Vite.
3. Add the same environment variables from your `.env` file under
   **Project Settings → Environment Variables** (all the `VITE_...` ones).
4. Deploy. `vercel.json` is already set up so all routes fall back to
   `index.html` (needed for React Router to work on refresh).

## Notes and limits worth knowing

- **WhatsApp sending is one tap, not automatic.** True automatic sending
  needs a WhatsApp Business API account (e.g. via Twilio) with server-side
  credentials — a backend, in other words. The `wa.me` link approach here
  needs zero setup and no ongoing cost, but you (or whoever's logged in as
  admin) still taps "Send" in WhatsApp yourself.
- **Passwords**: you set a temporary password when creating an intern account
  — there's no "forgot password" flow built in. If an intern forgets theirs,
  delete their Firebase Auth user and Firestore doc and recreate the account.
- **File uploads**: go to Cloudinary, not Firebase, so Firestore only ever
  stores the file's name and its Cloudinary URL — not the file itself.
