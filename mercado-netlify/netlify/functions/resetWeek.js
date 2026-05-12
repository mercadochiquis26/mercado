const { getAllProducts, updateRow, toRow } = require('./sheets');

exports.handler = async () => {
  try {
    const products = await getAllProducts();
    const now = new Date().toISOString();
    for (const product of products.filter(p => p.activo && p.falta_esta_semana)) {
      product.falta_esta_semana = false;
      product.updated_at = now;
      await updateRow(product.rowIndex, toRow(product));
    }
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
