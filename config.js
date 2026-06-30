/* =========================================================
   CONFIG — the only file you ever touch for the data source.

   1. Make a Google Sheet with these exact column headers in row 1:
      ID | Date | Category | Question | OptionA | OptionB | OptionC | OptionD | Answer | Explanation

      - ID: any unique number, e.g. 1, 2, 3...
      - Date: e.g. 2026-06-30
      - Category: e.g. History, Science, Bollywood, Sports...
      - Answer: must be exactly A, B, C, or D (whichever option is correct)
      - Explanation: optional, shown after the user answers

   2. File > Share > Publish to web > select "Entire document" or the
      specific sheet > Comma-separated values (.csv) > Publish.
      Copy the link it gives you and paste it below.

   3. Every day, open the Sheet and add new rows. That's it —
      no code, no GitHub, no re-deploying. The website re-reads
      the sheet every time someone visits.
   ========================================================= */

const SHEET_CSV_URL = "PASTE_YOUR_PUBLISHED_GOOGLE_SHEET_CSV_LINK_HERE";

/* Visit counter — free, no signup needed.
   Just keep this as-is; it auto-generates a unique badge per site. */
const VISIT_COUNTER_ID = "dailydosequiz"; // change to something unique to you
