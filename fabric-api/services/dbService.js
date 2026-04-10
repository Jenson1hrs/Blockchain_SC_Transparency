const pool = require('../config/db');

// Save product to PostgreSQL (full version)
async function saveProduct(product) {
    const query = `
        INSERT INTO products 
        (product_id, name, manufacturer, batch_number, current_owner, current_location, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    const values = [
        product.productId,
        product.name,
        product.manufacturer,
        product.batchNumber,
        product.owner,
        product.location,
        product.status
    ];

    await pool.query(query, values);
}

// Get product from PostgreSQL
async function getProductFromDB(productId) {
    const result = await pool.query(
        'SELECT * FROM products WHERE product_id = $1',
        [productId]
    );

    return result.rows[0];
}

async function getProductById(id) {
    const result = await pool.query(
        'SELECT * FROM products WHERE product_id = $1',
        [id]
    );
    return result.rows[0];
}

// Insert product (simplified version)
async function insertProduct(product) {
    const query = `
        INSERT INTO products (product_id, name, manufacturer, batch_number)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;

    const values = [
        product.id,
        product.name,
        product.manufacturer,
        product.batch
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
}

module.exports = {
    saveProduct,
    getProductFromDB,
    insertProduct,
    getProductById
};