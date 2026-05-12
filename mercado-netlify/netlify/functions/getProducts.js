const { getAllProducts } = require('./sheets');

exports.handler = async () => {
  try {
    const products = await getAllProducts();
    return { statusCode: 200, body: JSON.stringify({ products: products.filter(p => p.activo) }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
