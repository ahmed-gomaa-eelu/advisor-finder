/* =========================================================
   ACADEMIC ADVISOR FINDER - APPLICATION LOGIC
   Uses SheetJS (xlsx.js) to read students.xlsx client-side.
   No backend server required - fully static / GitHub Pages ready.
   ========================================================= */

// ---------------------------------------------------------
// 1. GRAB DOM ELEMENTS
// ---------------------------------------------------------
const searchForm        = document.getElementById('searchForm');
const studentIdInput     = document.getElementById('studentId');
const searchBtn          = document.getElementById('searchBtn');
const inputError         = document.getElementById('inputError');

const resultCard         = document.getElementById('resultCard');
const notFoundCard       = document.getElementById('notFoundCard');
const dataErrorCard      = document.getElementById('dataErrorCard');

const resStudentId       = document.getElementById('resStudentId');
const resStudentName     = document.getElementById('resStudentName');
const resAdvisorName     = document.getElementById('resAdvisorName');
const resAdvisorEmail    = document.getElementById('resAdvisorEmail');

const newSearchBtnResult   = document.getElementById('newSearchBtnResult');
const newSearchBtnNotFound = document.getElementById('newSearchBtnNotFound');

// This will hold the parsed student records once students.xlsx is loaded.
// Each item looks like: { id: "2023001234", name: "...", advisor: "...", email: "..." }
let studentRecords = [];

// Tracks whether the data file has finished loading successfully,
// so we don't let the user search before data is ready.
let dataReady = false;

// Set the current year in the footer automatically.
document.getElementById('year').textContent = new Date().getFullYear();

// ---------------------------------------------------------
// 2. HELPER: SHOW/HIDE SECTIONS
//    Keeps only one "state" card visible at a time
//    (loading / result / not-found / data-error)
// ---------------------------------------------------------
function showSection(section) {
  // Hide all state sections first
  resultCard.hidden = true;
  notFoundCard.hidden = true;
  dataErrorCard.hidden = true;

  // Then reveal only the requested one (if any)
  if (section) {
    section.hidden = false;
  }
}

// ---------------------------------------------------------
// 3. HELPER: NORMALIZE COLUMN NAMES
//    Excel files can have slightly different header casing/spacing
//    (e.g. "Student ID", "student id", "StudentID"). This function
//    converts a row object into a predictable shape regardless of
//    exact header formatting, by matching against expected keys.
// ---------------------------------------------------------
function normalizeRow(row) {
  // Build a lookup of lowercased, space-stripped header -> original key
  const keyMap = {};
  Object.keys(row).forEach((originalKey) => {
    const cleanKey = originalKey.toLowerCase().replace(/[^a-z]/g, '');
    keyMap[cleanKey] = originalKey;
  });

  // Try a few likely variants for each expected field
  const idKey      = keyMap['studentid'] || keyMap['id'];
  const nameKey     = keyMap['studentname'] || keyMap['name'];
  const advisorKey  = keyMap['academicadvisor'] || keyMap['advisor'] || keyMap['advisorname'];
  const emailKey    = keyMap['advisoremail'] || keyMap['email'] || keyMap['advisoremailaddress'];

  return {
    id:      idKey     ? String(row[idKey]).trim()     : '',
    name:    nameKey    ? String(row[nameKey]).trim()    : '',
    advisor: advisorKey ? String(row[advisorKey]).trim() : '',
    email:   emailKey   ? String(row[emailKey]).trim()   : ''
  };
}

// ---------------------------------------------------------
// 4. LOAD students.xlsx ON PAGE LOAD
//    This fetches the Excel file from the same folder as the
//    website, reads the first sheet, and converts rows to JSON.
// ---------------------------------------------------------
async function loadStudentData() {
  searchBtn.disabled = true;

  try {
    // Fetch the raw Excel file as binary data
    const response = await fetch('students.xlsx');

    if (!response.ok) {
      throw new Error(`Failed to fetch students.xlsx (status ${response.status})`);
    }

    const arrayBuffer = await response.arrayBuffer();

    // Parse the workbook using SheetJS
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Use the first sheet in the workbook
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert the sheet into an array of row objects, e.g.
    // [{ "Student ID": "123", "Student Name": "Jane", ... }, ...]
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    // Normalize each row into a consistent shape and filter out blank rows
    studentRecords = rawRows
      .map(normalizeRow)
      .filter((r) => r.id !== '');

    dataReady = true;
    searchBtn.disabled = false;
    showSection(null); // hide loading indicator, show nothing until user searches

  } catch (error) {
    // If the file is missing, malformed, or fetch fails (e.g. opening
    // index.html directly via file:// without a local server), show
    // a friendly error message instead of breaking the page.
    console.error('Error loading students.xlsx:', error);
    dataReady = false;
    searchBtn.disabled = true;
    showSection(dataErrorCard);
  }
}

// ---------------------------------------------------------
// 5. SEARCH LOGIC
// ---------------------------------------------------------
function findStudentById(query) {
  const normalizedQuery = query.trim().toLowerCase();
  return studentRecords.find(
    (record) => record.id.toLowerCase() === normalizedQuery
  );
}

function displayResult(record) {
  resStudentId.textContent    = record.id || '—';
  resStudentName.textContent  = record.name || '—';
  resAdvisorName.textContent  = record.advisor || '—';
  resAdvisorEmail.textContent = record.email || '—';
  showSection(resultCard);
}

function handleSearch(event) {
  event.preventDefault();

  const rawValue = studentIdInput.value;
  const trimmedValue = rawValue.trim();

  // --- Validation: empty input ---
  if (trimmedValue === '') {
    inputError.textContent = 'Please enter your Student ID before searching.';
    studentIdInput.focus();
    showSection(null);
    return;
  }

  // --- Validation: data not ready yet ---
  if (!dataReady) {
    inputError.textContent = 'Student data is still loading. Please wait a moment and try again.';
    return;
  }

  // Clear any previous inline validation error
  inputError.textContent = '';

  // The lookup is instant (in-memory), so we search immediately without
  // showing the loading spinner — that spinner is reserved for the initial
  // students.xlsx file load only.
  const match = findStudentById(trimmedValue);

  if (match) {
    displayResult(match);
  } else {
    showSection(notFoundCard);
  }
}

// ---------------------------------------------------------
// 6b. "NEW SEARCH" BUTTON HANDLER
//     Clears the current result/not-found view and lets the
//     student start a fresh search.
// ---------------------------------------------------------
function resetSearch() {
  studentIdInput.value = '';
  inputError.textContent = '';
  showSection(null); // hide all state cards
  studentIdInput.focus();
}

// ---------------------------------------------------------
// 6. EVENT LISTENERS
// ---------------------------------------------------------
searchForm.addEventListener('submit', handleSearch);

// "New Search" buttons inside the result and not-found cards
newSearchBtnResult.addEventListener('click', resetSearch);
newSearchBtnNotFound.addEventListener('click', resetSearch);

// Clear inline error as soon as the user starts typing again
studentIdInput.addEventListener('input', () => {
  if (inputError.textContent) {
    inputError.textContent = '';
  }
});

// ---------------------------------------------------------
// 7. KICK OFF DATA LOAD WHEN PAGE OPENS
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', loadStudentData);
