# A Daily Dose of Quiz — Setup Guide (no coding required)

This is a free quiz blog. You add new MCQs **through a website (Google Sheets)**,
not by editing code. The site automatically reads your sheet and builds the
category pages and quizzes. Visitors can never edit anything — they can only read.

## What's in this folder
- `index.html` — homepage
- `category.html` — list of quizzes in one category
- `quiz.html` — the actual quiz player
- `about.html`, `privacy-policy.html` — required static pages for AdSense
- `style.css`, `script.js`, `config.js` — the site's design and logic (don't need to touch these except `config.js` once)

---

## Step 1 — Create your quiz spreadsheet (this is where you add MCQs daily)

1. Go to **sheets.google.com** and create a new blank sheet.
2. In row 1, type these exact column headers (one per cell, left to right):

   `ID | Date | Category | Question | OptionA | OptionB | OptionC | OptionD | Answer | Explanation`

3. From row 2 onward, add one quiz per row, for example:

   | ID | Date | Category | Question | OptionA | OptionB | OptionC | OptionD | Answer | Explanation |
   |----|------|----------|----------|---------|---------|---------|---------|--------|--------------|
   | 1 | 2026-06-30 | History | Who was the first President of the USA? | George Washington | Abraham Lincoln | Thomas Jefferson | John Adams | A | Washington served 1789–1797. |

   - **Answer** must be exactly `A`, `B`, `C`, or `D`.
   - **ID** must be unique for every row (1, 2, 3, 4...). Easiest: just increase by 1 each time.
   - **Category** is what groups quizzes (e.g. History, Science, Bollywood, Sports, Geography...). Use the same spelling each time you reuse a category.

4. To add your daily 100 questions, just keep adding rows. No code, no GitHub — just type into the sheet from your phone or laptop.

## Step 2 — Publish the sheet so the website can read it

1. In Google Sheets: **File → Share → Publish to web**.
2. Choose the sheet tab, and format **Comma-separated values (.csv)**.
3. Click **Publish**, confirm, then copy the link it gives you.

## Step 3 — Connect the site to your sheet

1. Open `config.js` in this folder (on GitHub, click the file → pencil/edit icon).
2. Paste your copied link as the value of `SHEET_CSV_URL`.
3. Save / commit the change. This is the **only** code file you ever need to edit, and only once.

From now on, every day you just add rows to the Google Sheet — the website updates itself automatically, no re-uploading needed.

---

## Step 4 — Put the site on GitHub Pages (free hosting)

1. Create a new **public** GitHub repository, e.g. `daily-dose-of-quiz`.
2. Upload all the files in this folder to that repository (GitHub website → **Add file → Upload files** → drag all files in → Commit).
3. Go to repository **Settings → Pages**.
4. Under "Build and deployment", set **Source: Deploy from a branch**, branch **main**, folder **/(root)**, then Save.
5. After a minute, GitHub gives you a live link like `https://yourusername.github.io/daily-dose-of-quiz/`. That's your free website.

---

## Step 5 — Set up Google AdSense

1. Apply at **adsense.google.com** with your live GitHub Pages link.
2. Once approved, AdSense gives you a **Publisher ID** like `ca-pub-1234567890123456`.
3. In every HTML file (`index.html`, `category.html`, `quiz.html`), replace every occurrence of `ca-pub-XXXXXXXXXXXXXXXX` with your real Publisher ID (use GitHub's "Edit" pencil icon, then Ctrl+H find & replace if available, or replace manually — there are 2 occurrences per page).
4. For each `data-ad-slot="0000000000"`, replace with the ad unit slot ID AdSense gives you when you create an ad unit (optional — auto ads also work without per-slot IDs).
5. Approval can take a few days to a few weeks; AdSense usually wants to see some real content first (you already have that, since you're adding quizzes daily).

## Step 6 — Visit counter

Already wired up — it uses a free badge service (hits.sh) with no signup. It automatically counts visits to your live domain once published. If you'd like a different counter style, you can swap the image URL inside `script.js` (`initVisitCounter` function) for another free counter such as `https://www.freevisitorcounters.com` or `https://visitorbadge.io`.

## Step 7 — Update About & Privacy Policy

Open `about.html` and `privacy-policy.html` and replace `your-email@example.com` with your real contact email. AdSense reviewers check that the Privacy Policy page is real and reachable, so don't delete it.

---

## Daily routine going forward
1. Open your Google Sheet.
2. Add today's 100 rows (Date, Category, Question, 4 options, Answer, Explanation).
3. Done — refresh the live site and your new quizzes are already there.

No GitHub edits, no code, ever needed again for daily content.
