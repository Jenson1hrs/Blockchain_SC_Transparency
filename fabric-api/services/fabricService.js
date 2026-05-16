const connectToNetwork = require('../config/fabric');
const dbService = require('./dbService');
const pool = require('../config/db');

async function syncProductToDb(product, data) {
    await dbService.ensureProductColumns();
    await pool.query(
        `INSERT INTO products
         (product_id, name, manufacturer, batch_number, location, owner, status, timestamp,
          expiry_date, image_url, ingredients, allergy_info, halal_status, usage_instructions,
          manufacturer_user_id, manufacturer_company_name)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
         ON CONFLICT (product_id) DO UPDATE SET
           name = EXCLUDED.name,
           manufacturer = EXCLUDED.manufacturer,
           batch_number = EXCLUDED.batch_number,
           location = EXCLUDED.location,
           owner = EXCLUDED.owner,
           status = EXCLUDED.status,
           timestamp = EXCLUDED.timestamp,
           expiry_date = COALESCE(EXCLUDED.expiry_date, products.expiry_date),
           image_url = COALESCE(EXCLUDED.image_url, products.image_url),
           ingredients = COALESCE(EXCLUDED.ingredients, products.ingredients),
           allergy_info = COALESCE(EXCLUDED.allergy_info, products.allergy_info),
           halal_status = COALESCE(EXCLUDED.halal_status, products.halal_status),
           usage_instructions = COALESCE(EXCLUDED.usage_instructions, products.usage_instructions),
           manufacturer_user_id = COALESCE(EXCLUDED.manufacturer_user_id, products.manufacturer_user_id),
           manufacturer_company_name = COALESCE(EXCLUDED.manufacturer_company_name, products.manufacturer_company_name)`,
        [
            product.productId,
            product.name,
            product.manufacturer,
            product.batchNumber,
            product.location,
            product.owner,
            product.status,
            product.timestamp,
            data.expiryDate || null,
            data.imageUrl || null,
            data.ingredients || null,
            data.allergyInfo || null,
            data.halalStatus || null,
            data.usageInstructions || null,
            data.manufacturerUserId ?? null,
            data.manufacturerCompanyName ?? product.manufacturer ?? null,
        ]
    );
}

// ===============================
// VALIDATION FUNCTION
// ===============================
function validateProductData(data) {
    if (!data.id || typeof data.id !== 'string' || data.id.trim() === '') {
        throw new Error("Invalid or missing product ID");
    }

    if (!data.name || typeof data.name !== 'string') {
        throw new Error("Invalid or missing product name");
    }

    if (!data.manufacturer || typeof data.manufacturer !== 'string') {
        throw new Error("Invalid or missing manufacturer");
    }

    if (!data.batch || typeof data.batch !== 'string') {
        throw new Error("Invalid or missing batch");
    }

    if (!data.location || typeof data.location !== 'string') {
        throw new Error("Invalid or missing location");
    }

    if (data.expiryDate) {
        const d = new Date(data.expiryDate);
        if (Number.isNaN(d.getTime())) {
            throw new Error("Invalid expiryDate format (expected YYYY-MM-DD)");
        }
    }

    if (data.imageUrl && typeof data.imageUrl !== 'string') {
        throw new Error("Invalid imageUrl");
    }
    if (data.ingredients && typeof data.ingredients !== 'string') {
        throw new Error("Invalid ingredients");
    }
    if (data.allergyInfo && typeof data.allergyInfo !== 'string') {
        throw new Error("Invalid allergyInfo");
    }
    if (data.halalStatus && typeof data.halalStatus !== 'string') {
        throw new Error("Invalid halalStatus");
    }
    if (data.usageInstructions && typeof data.usageInstructions !== 'string') {
        throw new Error("Invalid usageInstructions");
    }
}

// ===============================
// CREATE PRODUCT
// ===============================
async function createProduct(data) {

    // 🔴 STEP 1: VALIDATE INPUT
    validateProductData(data);

    const { gateway, contract } = await connectToNetwork();

    try {
        // 🔴 STEP 2: CHECK blockchain (SOURCE OF TRUTH)
        try {
            const existing = await contract.evaluateTransaction('verifyProduct', data.id);
            if (existing && existing.length > 0) {
                throw new Error(`Product ${data.id} already exists on blockchain`);
            }
        } catch (err) {
            // OK if not found
        }

        // 🔴 STEP 3: WRITE TO BLOCKCHAIN FIRST
        await contract.submitTransaction(
            'createProduct',
            data.id,
            data.name,
            data.manufacturer,
            data.batch,
            data.location
        );

        // 🔴 STEP 4: READ BACK FROM BLOCKCHAIN
        const result = await contract.evaluateTransaction('verifyProduct', data.id);
        const product = JSON.parse(result.toString());

        // 🔴 STEP 5: SYNC TO DATABASE (NOT SOURCE OF TRUTH)
        try {
            await syncProductToDb(product, data);
        } catch (dbError) {
            console.error("⚠️ DB sync failed (non-critical):", dbError.message);
        }

        return {
            message: "Product stored successfully",
            blockchain: product
        };

    } finally {
        gateway.disconnect();
    }
}

// ===============================
// GET PRODUCT
// ===============================
async function getProduct(id) {

    // 🔴 ALWAYS TRY DB FIRST (FAST CACHE)
    const dbProduct = await dbService.getProductFromDB(id);
    if (dbProduct) return dbService.mapProductToApi(dbProduct);

    // 🔴 FALLBACK TO BLOCKCHAIN
    const { gateway, contract } = await connectToNetwork();

    try {
        const result = await contract.evaluateTransaction('verifyProduct', id);
        const chain = JSON.parse(result.toString());
        return {
            productId: chain.productId,
            name: chain.name,
            manufacturer: chain.manufacturer,
            manufacturerUserId: null,
            manufacturerCompanyName: chain.manufacturer,
            currentOwnerUserId: null,
            currentOwnerRole: null,
            currentOwnerName: chain.owner,
            batchNumber: chain.batchNumber,
            location: chain.location,
            owner: chain.owner,
            status: chain.status,
            timestamp: chain.timestamp,
            metadataComplete: null,
            metadataCompletionPercent: null,
        };
    } finally {
        gateway.disconnect();
    }
}

// ===============================
// TRANSFER PRODUCT
// ===============================
async function transferProduct(id, newOwner) {

    if (!id || !newOwner) {
        throw new Error("Missing transfer parameters");
    }

    const { gateway, contract } = await connectToNetwork();

    try {
        const result = await contract.submitTransaction('transferProduct', id, newOwner);
        const product = JSON.parse(result.toString());

        // 🔴 SYNC DB
        try {
            await pool.query(
                `UPDATE products 
                 SET owner = $1, status = $2, timestamp = $3 
                 WHERE product_id = $4`,
                [product.owner, product.status, product.timestamp, id]
            );
        } catch (dbError) {
            console.error("⚠️ DB sync failed:", dbError.message);
        }

        return product;

    } finally {
        gateway.disconnect();
    }
}

// ===============================
// UPDATE LOCATION
// ===============================
async function updateLocation(id, location) {

    if (!id || !location) {
        throw new Error("Missing update parameters");
    }

    const { gateway, contract } = await connectToNetwork();

    try {
        const result = await contract.submitTransaction('updateLocation', id, location);
        const product = JSON.parse(result.toString());

        // 🔴 SYNC DB
        try {
            await pool.query(
                `UPDATE products 
                 SET location = $1, timestamp = $2 
                 WHERE product_id = $3`,
                [product.location, product.timestamp, id]
            );
        } catch (dbError) {
            console.error("⚠️ DB sync failed:", dbError.message);
        }

        return product;

    } finally {
        gateway.disconnect();
    }
}

// ===============================
// GET HISTORY
// ===============================
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