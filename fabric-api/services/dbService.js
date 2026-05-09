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

async function insertProduct(data) {
    await pool.query(
        `ALTER TABLE products
         ADD COLUMN IF NOT EXISTS expiry_date DATE,
         ADD COLUMN IF NOT EXISTS image_url TEXT,
         ADD COLUMN IF NOT EXISTS ingredients TEXT,
         ADD COLUMN IF NOT EXISTS allergy_info TEXT,
         ADD COLUMN IF NOT EXISTS halal_status TEXT,
         ADD COLUMN IF NOT EXISTS usage_instructions TEXT`
    );
    const result = await pool.query(
        `INSERT INTO products
         (product_id, name, manufacturer, batch_number, location, owner, status, timestamp, expiry_date, image_url, ingredients, allergy_info, halal_status, usage_instructions)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (product_id) DO UPDATE SET
           name = EXCLUDED.name,
           manufacturer = EXCLUDED.manufacturer,
           batch_number = EXCLUDED.batch_number,
           location = EXCLUDED.location,
           expiry_date = EXCLUDED.expiry_date,
           image_url = EXCLUDED.image_url,
           ingredients = EXCLUDED.ingredients,
           allergy_info = EXCLUDED.allergy_info,
           halal_status = EXCLUDED.halal_status,
           usage_instructions = EXCLUDED.usage_instructions
         RETURNING *`,
        [
            data.id,
            data.name,
            data.manufacturer,
            data.batch,
            data.location,
            data.manufacturer,
            'Manufactured',
            new Date().toISOString(),
            data.expiryDate || null,
            data.imageUrl || null,
            data.ingredients || null,
            data.allergyInfo || null,
            data.halalStatus || null,
            data.usageInstructions || null,
        ]
    );
    return result.rows[0];
}

async function getExpiringProducts(days = 7) {
    await pool.query(
        `ALTER TABLE products
         ADD COLUMN IF NOT EXISTS expiry_date DATE`
    );
    const result = await pool.query(
        `SELECT *
         FROM products
         WHERE expiry_date IS NOT NULL
           AND expiry_date >= CURRENT_DATE
           AND expiry_date <= (CURRENT_DATE + ($1 * INTERVAL '1 day'))
         ORDER BY expiry_date ASC`,
        [days]
    );
    return result.rows;
}

module.exports = {
    getProductFromDB,
    getProductById,
    insertProduct,
    getExpiringProducts
};