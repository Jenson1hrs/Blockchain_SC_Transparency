const connectToNetwork = require('../config/fabric');
const dbService = require('./dbService');
const pool = require('../config/db');  // ← ADD THIS LINE

//Talks to blockchain to execute logic
async function createProduct(data) {
    const { gateway, contract } = await connectToNetwork();

    try {
        // 1️⃣ CHECK if exists in Blockchain
        try {
            const existing = await contract.evaluateTransaction('verifyProduct', data.id);
            if (existing && existing.length > 0) {
                throw new Error(`Product ${data.id} already exists in blockchain`);
            }
        } catch (err) {
            // OK if not found
        }

        // 2️⃣ CHECK if exists in PostgreSQL
        const dbCheck = await pool.query(
            'SELECT * FROM products WHERE product_id = $1',
            [data.id]
        );

        if (dbCheck.rows.length > 0) {
            throw new Error(`Product ${data.id} already exists in database`);
        }

        // 3️⃣ WRITE to Blockchain FIRST (source of truth)
        await contract.submitTransaction(
            'createProduct',
            data.id,
            data.name,
            data.manufacturer,
            data.batch,
            data.location
        );

        // 4️⃣ WRITE to PostgreSQL
        await pool.query(
            `INSERT INTO products 
            (product_id, name, manufacturer, batch_number, current_location, status)
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [data.id, data.name, data.manufacturer, data.batch, data.location, 'Manufactured']
        );

        return { message: "Product created successfully" };

    } finally {
        gateway.disconnect();
    }
}

async function getProduct(id) {
    // 1. Try PostgreSQL first (fast)
    const dbProduct = await dbService.getProductFromDB(id);
    if (dbProduct) return dbProduct;

    // 2. Fallback to blockchain
    const { gateway, contract } = await connectToNetwork();

    try {
        const result = await contract.evaluateTransaction('verifyProduct', id);
        return JSON.parse(result.toString());
    } finally {
        gateway.disconnect();
    }
}

async function transferProduct(id, newOwner) {
    const { gateway, contract } = await connectToNetwork();

    try {
        const result = await contract.submitTransaction('transferProduct', id, newOwner);
        return JSON.parse(result.toString());
    } finally {
        gateway.disconnect();
    }
}

async function updateLocation(id, location) {
    const { gateway, contract } = await connectToNetwork();

    try {
        const result = await contract.submitTransaction('updateLocation', id, location);
        return JSON.parse(result.toString());
    } finally {
        gateway.disconnect();
    }
}

async function getHistory(id) {
    const { gateway, contract } = await connectToNetwork();

    try {
        const result = await contract.evaluateTransaction('getProductHistory', id);
        return JSON.parse(result.toString());
    } finally {
        gateway.disconnect();
    }
}

module.exports = {
    createProduct,
    getProduct,
    transferProduct,
    updateLocation,
    getHistory
};