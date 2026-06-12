# Pre-Registration Apps Script

Routes pre-registration form submissions into a Google Sheet, saving uploaded files to Drive.

## One-time setup
1. Create (or open) the destination Google Spreadsheet.
2. **Extensions → Apps Script**. Replace `Code.gs` contents with this folder's `Code.gs`. Save.
3. **Deploy → New deployment → Web app.** Execute as: **Me**. Who has access: **Anyone**. Deploy and authorize.
4. Copy the **Web app `/exec` URL**.
5. Set it as the build env var `PUBLIC_PREREG_SCRIPT_URL` (GitHub Actions / local `.env`), then redeploy the site.

## Notes
- Files arrive base64-encoded inside the POST (≤20MB/file, ≤35MB total, enforced client-side) and are saved to a Drive folder named `Pre-Registration Uploads`; the sheet stores shareable links.
- The first submission writes the header row automatically.
- `SHEET_COLUMNS` here MUST match `src/lib/pre-registration/sheet-columns.ts` (a build test enforces this).
- After editing `Code.gs`, create a **new deployment version** for changes to take effect.
