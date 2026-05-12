const { google } = require('googleapis');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = process.env.GOOGLE_SHEET_TAB || 'productos';
const RANGE = `${SHEET_NAME}!A1:Z101`;
const HEADERS = ['id', 'producto', 'categoria', 'mercado', 'cantidad_sugerida', 'falta_esta_semana', 'activo', 'creado_por', 'updated_at'];

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
}

async function getSheets() {
  const auth = getAuth();
  await auth.authorize();
  return google.sheets({ version: 'v4', auth });
}

function normalizeBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return false;
}

function normalizeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function rowToObject(headers, row, index) {
  const obj = {};
  headers.forEach((header, i) => {
    obj[header] = row[i] ?? '';
  });
  obj.rowIndex = index + 2;
  obj._rowNumber = index + 2;
  return obj;
}

async function getRawValues() {
  const sheets = await getSheets();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE
  });
  return response.data.values || [];
}

async function getAllRows() {
  const values = await getRawValues();
  if (!values.length) return [];
  const headers = values[0].map(h => String(h).trim());
  return values.slice(1)
    .filter(row => row.some(cell => String(cell || '').trim() !== ''))
    .map((row, index) => rowToObject(headers, row, index));
}

async function getAllProducts() {
  return getAllRows();
}

function mapProduct(row) {
  return {
    id: row.id,
    producto: row.producto || '',
    categoria: row.categoria || '',
    mercado: row.mercado || 'Otros',
    cantidad_sugerida: normalizeNumber(row.cantidad_sugerida),
    falta_esta_semana: normalizeBoolean(row.falta_esta_semana),
    activo: normalizeBoolean(row.activo),
    creado_por: row.creado_por || '',
    updated_at: row.updated_at || '',
    rowIndex: row.rowIndex || row._rowNumber,
    _rowNumber: row._rowNumber || row.rowIndex
  };
}

function toRow(product = {}) {
  return HEADERS.map((key) => {
    if (key === 'cantidad_sugerida') return String(normalizeNumber(product[key]));
    if (key === 'falta_esta_semana' || key === 'activo') return normalizeBoolean(product[key]) ? 'TRUE' : 'FALSE';
    return product[key] ?? '';
  });
}

async function updateRow(rowIndex, rowValues) {
  if (!rowIndex) throw new Error('rowIndex requerido');
  const sheets = await getSheets();
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A${rowIndex}:I${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [rowValues] }
  });
}

async function appendProduct(product) {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:I`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [toRow(product)] }
  });
}

function nowIso() {
  return new Date().toISOString();
}

module.exports = {
  getSheets,
  getAllRows,
  getAllProducts,
  mapProduct,
  toRow,
  updateRow,
  appendProduct,
  nowIso,
  HEADERS,
  SHEET_ID,
  SHEET_NAME,
  RANGE
};
