const { getAllProducts, updateRow, toRow } = require('./sheets');

const FIELDS = ['producto', 'cantidad_sugerida', 'mercado', 'categoria'];

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const products = await getAllProducts();
    const product = products.find(p => p.id === body.id);
    if (!product) return { statusCode: 404, body: JSON.stringify({ error: 'Producto no encontrado' }) };
    for (const field of FIELDS) {
      if (body[field] !== undefined) product[field] = String(body[field]).trim();
    }
    product.updated_at = new Date().toISOString();
    await updateRow(product.rowIndex, toRow(product));
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
