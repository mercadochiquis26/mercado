const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SHEET_NAME = process.env.GOOGLE_SHEET_TAB || 'productos';
const HEADER = ['id', 'producto', 'categoria', 'mercado', 'cantidad_sugerida', 'falta_esta_semana', 'activo', 'creado_por', 'updated_at'];

function getPrivateKey() {
  return (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
}

async function getSheetsClient() {
  const auth = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    getPrivateKey(),
    SCOPES
  );
  await auth.authorize();
  return google.sheets({ version: 'v4', auth });
}

async function ensureHeader(sheets, spreadsheetId) {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${SHEET_NAME}!A1:I2` });
  const rows = res.data.values || [];
  if (!rows.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_NAME}!A1:I1`,
      valueInputOption: 'RAW',
      requestBody: { values: [HEADER] }
    });
  }
}

function mapRow(row, rowIndex) {
  return {
    rowIndex,
    id: row[0] || '',
    producto: row[1] || '',
    categoria: row[2] || '',
    mercado: row[3] || 'Otros',
    cantidad_sugerida: row[4] || '',
    falta_esta_semana: String(row[5]).toLowerCase() === 'true',
    activo: row[6] === undefined ? true : String(row[6]).toLowerCase() !== 'false',
    creado_por: row[7] || 'admin',
    updated_at: row[8] || ''
  };
}

async function getAllProducts() {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  await ensureHeader(sheets, spreadsheetId);
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${SHEET_NAME}!A2:I` });
  const values = res.data.values || [];
  return values.map((row, idx) => mapRow(row, idx + 2));
}

async function appendProduct(product) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${SHEET_NAME}!A:I`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [[
        product.id,
        product.producto,
        product.categoria,
        product.mercado,
        product.cantidad_sugerida,
        String(product.falta_esta_semana),
        String(product.activo),
        product.creado_por,
        product.updated_at
      ]]
    }
  });
}

async function updateRow(rowIndex, rowValues) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_NAME}!A${rowIndex}:I${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [rowValues] }
  });
}

async function deleteRow(rowIndex) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = sheetMeta.data.sheets.find(s => s.properties.title === SHEET_NAME);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: sheet.properties.sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex - 1,
            endIndex: rowIndex
          }
        }
      }]
    }
  });
}

function toRow(product) {
  return [
    product.id,
    product.producto,
    product.categoria,
    product.mercado,
    product.cantidad_sugerida,
    String(product.falta_esta_semana),
    String(product.activo),
    product.creado_por,
    product.updated_at
  ];
}

module.exports = { getAllProducts, appendProduct, updateRow, deleteRow, toRow };
