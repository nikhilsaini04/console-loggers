# The Console Loggers — club website

A static website for the NIU coding club. It runs on **GitHub Pages** (free hosting) and uses **Firebase** (free Spark plan) for student login and saved progress. There's no server to manage and no build step.

| Page | File | What it does |
|---|---|---|
| Home | `index.html` | About the club, weekly routine, batches, rules, FAQ |
| DSA Sheet | `dsa.html` | 21-step DSA sheet with tick boxes, stars and notes |
| Practice | `practice.html` | 38 tracked sheets: 13 languages, OS, DBMS, networks, cloud, Java stack, domains, aptitude (with answers), OOPs, HR and system design |
| Tech Map | `tech.html` | Technologies by area, in learning order |
| Interview Guide | `interview.html` | Rounds, techniques, body language, dress code, checklist |
| Instructor | `instructor.html` | Your profile |
| Log in | `login.html` | Log in, create an account with the join code, reset password |
| Dashboard | `dashboard.html` | Students see their own progress and the leaderboard. You see every student. |

Until you connect Firebase the site runs in **demo mode**. Accounts are then saved only in the visitor's own browser, and a yellow banner says so. This lets you check everything before going live.

---

## Step 1 — Create the Firebase project (about 10 minutes)

1. Go to https://console.firebase.google.com and sign in with your Google account.
2. Click **Create a project**. Name it `console-loggers`. You can turn Google Analytics off. Click **Create**.
3. **Turn on login:** go to **Build → Authentication → Get started → Sign-in method**, choose **Email/Password**, switch on the first toggle, then click **Save**.
   - On the same page click **Add new provider → Google**, switch it on, pick your email as the *support email*, and click **Save**. This turns on the **Continue with Google** button.
   - Optional: under **Authentication → Templates → Email address verification**, set the sender name to `The Console Loggers` so the verification email looks official. Do the same for **Password reset**.

   Students who sign up with email and password get a verification link and can't save progress until they click it. Google accounts are already verified, so they skip that step. Students who use Google still enter their roll number, year and the join code once.
4. **Create the database:** go to **Build → Firestore Database → Create database**. Pick the location **asia-south1 (Mumbai)** and start in **production mode**.
5. **Add the security rules:** open the **Rules** tab and replace everything with the contents of `firestore.rules`. Before publishing, change two things:
   - the email inside `isInstructor()` → your email
   - `CHANGE-THIS-CODE` → the join code you'll give selected students (for example `CL-2026-JAVA`)

   Then click **Publish**.
6. **Get the web config:** go to **Project settings** (gear icon) → **Your apps** → click the **</>** (Web) icon, name it `website`, and click **Register app**. Copy the `firebaseConfig` values it shows.
7. Open `assets/js/config.js`:
   - paste the values into `FIREBASE_CONFIG`
   - put your email in `INSTRUCTOR_EMAILS`

The Firebase web config is not a secret. It's meant to be public. The security rules are what protect the data.

## Step 2 — Put the site on GitHub Pages

1. Create a free account at https://github.com if you don't have one.
2. Click **New repository**, name it `console-loggers`, set it to **Public**, and click **Create**.
3. Click **uploading an existing file**, then drag in **everything inside this folder**: the `.html` files, the `assets` folder, `firestore.rules` and this README. Click **Commit changes**.
4. Go to **Settings → Pages**. Under *Build and deployment*, set **Source: Deploy from a branch**, **Branch: main**, **Folder: / (root)**, and click **Save**.
5. After a minute or two the site is live at `https://YOUR-USERNAME.github.io/console-loggers/`.
6. In Firebase, go to **Authentication → Settings → Authorized domains → Add domain** and add `YOUR-USERNAME.github.io`. Login won't work on your site until you do this.

To update the site later, edit the file on GitHub (pencil icon) or upload the new version. Pages redeploys on its own.

## Step 3 — Create your instructor account

1. Open the live site and go to **Log in → Create account**.
2. Click **Continue with Google** with the **same email** you put in `config.js` and `firestore.rules` (or sign up with that email and click the verification link). Enter the join code; you can put anything for roll number. The instructor view only opens once the email is verified, so nobody else can claim your address.
3. Your dashboard now shows the instructor view, with every student's progress, filters by year, sorting and a CSV download.

## Step 4 — Onboard students

Share the site link and the join code with selected students. Each student:
1. opens the site → **Log in**, then either clicks **Continue with Google** or chooses **Create account**
2. enters name, roll number, year and the join code (plus email and password if not using Google)
3. if they used email and password, clicks the verification link sent to their inbox
4. starts ticking problems on the DSA Sheet and practice sheets. Progress saves on its own and follows them to any device they log in from.

If a student signs up without the right code, the account is rejected and nothing is saved.

---

## Common edits

| To change… | Edit |
|---|---|
| Club text, rules, FAQ | `index.html` |
| Your profile, photo, LinkedIn | `instructor.html` (instructions are in comments at the top) |
| DSA problems | `assets/js/data-dsa.js` |
| Practice exercises and links | `assets/js/data-practice.js`, `data-lang-more.js`, `data-stack.js`, `data-domains.js`, `data-aptitude.js` and `data-cs.js` |
| Colors and fonts | `:root` at the top of `assets/css/site.css` |
| Join code | `firestore.rules` in the Firebase console (then click Publish) |

**Keep the real join code out of GitHub.** A public repository can be read by anyone, so only type the real code in the Firebase console's Rules tab. Leave `CHANGE-THIS-CODE` in the copy of `firestore.rules` you upload, or don't upload that file at all.
| Instructor emails | `assets/js/config.js` **and** `firestore.rules` |

Renaming a problem or exercise resets its tick for everyone, because ticks are stored by ID. Adding new items is safe.

## Testing on your own computer

The pages use JavaScript modules, so double-clicking an `.html` file won't work. In VS Code, install the **Live Server** extension, right-click `index.html`, and choose **Open with Live Server**. Then add `127.0.0.1` to Firebase's authorized domains if you want to test login locally.

## Free limits

Firebase's free plan allows 50,000 document reads and 20,000 writes per day. A club of 100–200 students uses a small fraction of this, because progress is saved at most about once a second while a student is ticking. GitHub Pages is free for public repositories.

## Other free hosts

The same folder works without changes on **Netlify** (drag the folder onto https://app.netlify.com/drop) or **Cloudflare Pages**. Add the new domain to Firebase's authorized domains. Overleaf is for LaTeX documents and can't host websites.

## Coding profiles (LeetCode, CodeChef, GeeksforGeeks, Codeforces)

Students link their usernames on the dashboard, and their solved counts show there and in the instructor view.

| Platform | How the count is read |
|---|---|
| Codeforces | Official public API (automatic, includes rating and rank) |
| LeetCode | Community-run API (`alfa-leetcode-api.onrender.com`), not run by LeetCode |
| GeeksforGeeks | Community-run API (`geekforgeekapi.onrender.com`), not run by GeeksforGeeks |
| CodeChef | Typed by the student (no reliable public API) |

Community APIs run on free hosting, so they can be slow on the first request or occasionally offline. When a lookup fails, the student can type their count, and it's labelled "Self-reported". You can check any count by opening the student's profile link.

If you set up Firestore before this feature was added, paste the updated `firestore.rules` again and click **Publish**. The rules now allow the `coding` field.
