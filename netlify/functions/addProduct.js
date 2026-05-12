const { appendProduct } = require('./sheets');

const MARKETS = ['Ribasmith', 'Organica', 'Rey', 'Krume', 'Otros'];

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    if (!body.producto) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Producto requerido' }) };
    }

    const mercado = MARKETS.includes(body.mercado) ? body.mercado : 'Otros';
    const now = new Date().toISOString();
    const product = {
      id: `p_${Date.now()}`,
      producto: String(body.producto).trim(),
      categoria: String(body.categoria || '').trim(),
      mercado,
      cantidad_sugerida: body.cantidad_sugerida ?? body.cantidad ?? 1,
      falta_esta_semana: true,
      activo: true,
      creado_por: body.creado_por || 'empleada',
      updated_at: now
    };

    await appendProduct(product);
    return { statusCode: 200, body: JSON.stringify({ ok: true, product }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
