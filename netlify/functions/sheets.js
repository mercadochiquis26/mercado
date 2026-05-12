const { google } = require('googleapis');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = process.env.GOOGLE_SHEET_TAB || 'productos';
const RANGE = `${SHEET_NAME}!A1:Z101`;

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

async function getAllRows() {
  const sheets = await getSheets();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE
  });

  const values = response.data.values || [];
  if (!values.length) return [];

  const headers = values[0].map(h => String(h).trim());
  const rows = values.slice(1);

  return rows
    .filter(row => row.some(cell => String(cell || '').trim() !== ''))
    .map((row, index) => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i] ?? '';
      });
      obj._rowNumber = index + 2;
      return obj;
    });
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
    _rowNumber: row._rowNumber
  };
}

module.exports = {
  getSheets,
  getAllRows,
  mapProduct,
  SHEET_ID,
  SHEET_NAME,
  RANGE
};
