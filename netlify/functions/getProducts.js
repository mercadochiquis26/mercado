const { getAllRows, mapProduct } = require('./sheets');

exports.handler = async () => {
  try {
    const rows = await getAllRows();
    const products = rows
      .map(mapProduct)
      .filter(item => item.id && item.producto && item.activo);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(products)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
