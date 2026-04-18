const pool = require('../config/db');

// Get product from PostgreSQL
async function getProductFromDB(productId) {
    const result = await pool.query(
        'SELECT * FROM products WHERE product_id = $1',
        [productId]
    );
    return result.rows[0];
}

// Alias (important for compatibility)
async function getProductById(id) {
    return getProductFromDB(id);
}

module.exports = {
    getProductFromDB,
    getProductById
};