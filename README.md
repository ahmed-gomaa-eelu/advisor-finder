# Academic Advisor Finder

A fully client-side, responsive website that lets students look up their academic advisor by entering their Student ID. No backend required — works on GitHub Pages or any static host.

## Folder Structure

```
advisor-finder/
├── index.html       # Main page (structure/markup)
├── style.css        # All styling (responsive, mobile-first)
├── script.js        # App logic (loads & searches students.xlsx)
└── students.xlsx     # Excel data source (sample data included)
```

## How It Works

1. When the page loads, `script.js` fetches `students.xlsx` from the same folder and parses it in the browser using the SheetJS (xlsx.js) library (loaded via CDN in `index.html`).
2. The student enters their Student ID and clicks **Search**.
3. The script searches the in-memory data for a matching ID (case-insensitive, trimmed).
4. If found, a result card displays Student ID, Student Name, Academic Advisor, and Advisor Email.
5. If not found, a friendly "No Record Found" message is shown.
6. If `students.xlsx` itself fails to load, a clear data-error message is shown instead of breaking the page.

## Replacing the Excel File with Your Own Data

1. Open `students.xlsx` in Excel, Google Sheets, or LibreOffice Calc.
2. Keep these four column headers in the first row (exact wording recommended, but the script also tolerates minor variations like "StudentID" or "Advisor"):
   - `Student ID`
   - `Student Name`
   - `Academic Advisor`
   - `Advisor Email`
3. Add one row per student below the header row.
4. Save the file as `students.xlsx` (must keep this exact filename, or update the filename inside `script.js` in the `fetch('students.xlsx')` line).
5. Replace the old `students.xlsx` in the project folder with your updated file.
6. Refresh the website — no code changes needed.

**Tips:**
- Make sure Student IDs don't have extra leading/trailing spaces (the script trims spaces automatically, but clean data is best).
- Avoid duplicate Student IDs — the search returns the first match found.
- Keep the file as `.xlsx` format (not `.xls` or `.csv`) since the app expects an Excel workbook.

## Replacing the Logo

In `index.html`, find this block inside the header:

```html
<div class="logo-placeholder" aria-hidden="true">🎓</div>
```

Replace it with your institution's logo image, for example:

```html
<img src="logo.png" alt="University Logo" class="logo-placeholder" />
```

Then add your `logo.png` file to the project folder and adjust sizing in `style.css` (`.logo-placeholder`) if needed.

## Running Locally

Because the app uses `fetch()` to load `students.xlsx`, opening `index.html` directly by double-clicking it (`file://...`) may be blocked by the browser's security rules in some browsers. To test locally, serve the folder with a simple local server, for example:

```bash
# Python 3
cd advisor-finder
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Deploying to GitHub Pages

1. Create a new GitHub repository (or use an existing one).
2. Push the contents of the `advisor-finder/` folder to the repository root (or to a `/docs` folder, depending on your Pages settings).
3. In your repository settings, go to **Settings → Pages**.
4. Set the source branch (e.g. `main`) and folder (e.g. `/root` or `/docs`).
5. Save — GitHub will give you a live URL like `https://yourusername.github.io/your-repo/`.
6. Visit the URL; the site will load `students.xlsx` directly from the repo and work entirely client-side.

No server, database, or build step is required — it's a 100% static site.

## Browser Support

Works in all modern browsers (Chrome, Firefox, Edge, Safari) that support ES6+ JavaScript and the Fetch API.
