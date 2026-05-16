const fabricService = require('../services/fabricService');
const postgresService = require('../services/dbService');
const userService = require('../services/userService');
const ownershipService = require('../services/ownershipService');
const QRCode = require('qrcode');
const crypto = require('crypto');

const SECRET = "mySuperSecretKey"; // Change this to a secure key in production

function generateHash(productId, batchNumber) {
    return crypto
        .createHash('sha256')
        .update(productId + batchNumber + SECRET)
        .digest('hex');
}

function verifyQR(productId, batchNumber, hash) {
    const expectedHash = generateHash(productId, batchNumber);
    return expectedHash === hash;
}

function getFrontendBase() {
    const frontendBase = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    if (/localhost|127\.0\.0\.1/i.test(frontendBase)) {
        console.warn('[qr] FRONTEND_URL uses localhost. External scanners/phones cannot open this URL.');
    }
    return frontendBase;
}

async function applyManufacturerOwnership(data, reqUser) {
    if (!reqUser) return data;
    if (reqUser.role === 'manufacturer') {
        const userRow = await userService.findUserById(reqUser.id);
        const companyName = userService.getManufacturerDisplayName(userRow);
        return {
            ...data,
            manufacturer: companyName,
            manufacturerUserId: reqUser.id,
            manufacturerCompanyName: companyName,
        };
    }
    if (reqUser.role === 'admin' && data.manufacturer) {
        return {
            ...data,
            manufacturerCompanyName: data.manufacturer,
            /** Admin/regulator/registry may create unassigned catalogue rows — do not inherit spoofed IDs from body */
            manufacturerUserId: null,
        };
    }
    return data;
}

exports.createProduct = async (req, res) => {
    try {
        let data = await applyManufacturerOwnership({ ...req.body }, req.user);
        data = await ownershipService.applyCreateOwnership(data, req.user);
        if (!data.manufacturer || String(data.manufacturer).trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Manufacturer is required',
            });
        }
        data.batch = data.batch ?? data.batchNumber;

        // Check if already exists in blockchain
        let existsOnBlockchain = false;

        try {
            await fabricService.getProduct(data.id);
            existsOnBlockchain = true;
        } catch (err) {
            existsOnBlockchain = false;
        }

        if (existsOnBlockchain) {
            return res.status(400).json({
                success: false,
                message: "Product already exists on blockchain"
            });
        }

        // Write to blockchain
        const blockchainResult = await fabricService.createProduct(data);

        // Check if exists in DB
        const existingDB = await postgresService.getProductById(data.id);

        let dbResult;

        if (!existingDB) {
            dbResult = await postgresService.insertProduct(data);
        } else {
            dbResult = existingDB;
        }

        const apiProduct = postgresService.mapProductToApi(dbResult);
        const hash = generateHash(data.id, data.batch);
        // Phones cannot open localhost — set FRONTEND_URL to http://<laptop-LAN-ip>:5173 before demo
        const frontendBase = getFrontendBase();
        const qrData = `${frontendBase}/verify/${encodeURIComponent(data.id)}?batch=${encodeURIComponent(data.batch)}&hash=${encodeURIComponent(hash)}`;
        const qrImage = await QRCode.toDataURL(qrData);

        res.json({
            success: true,
            message: "Product stored successfully",
            data: apiProduct,
            database: dbResult,
            qrCode: qrImage,
            qrRaw: qrData
        });

    } catch (error) {
        console.error("❌ Dual-write error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getProductQr = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ success: false, message: 'Missing product id' });
        }

        const product = await fabricService.getProduct(id);
        const batchNumber = product.batchNumber || product.batch_number;
        if (!batchNumber) {
            return res.status(500).json({ success: false, message: 'Product batch number missing' });
        }

        const hash = generateHash(product.productId || id, batchNumber);
        const frontendBase = getFrontendBase();
        const qrUrl = `${frontendBase}/verify/${encodeURIComponent(product.productId || id)}?batch=${encodeURIComponent(batchNumber)}&hash=${encodeURIComponent(hash)}`;
        const qrCode = await QRCode.toDataURL(qrUrl);

        res.json({
            success: true,
            qrCode,
            qrUrl,
            qrRaw: qrUrl
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.searchProducts = async (req, res) => {
    try {
        const q = req.query.q != null ? String(req.query.q).trim() : '';
        if (!q) {
            return res.status(400).json({ success: false, message: 'Query parameter q is required' });
        }
        const limit = req.query.limit;
        const rows = await postgresService.searchProducts(q, limit);
        return res.json({ success: true, data: rows, count: rows.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const result = await fabricService.getProduct(req.params.id);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getExpiringProducts = async (req, res) => {
    try {
        const days = Number(req.query.days || 7);
        const safeDays = Number.isFinite(days) && days > 0 ? Math.min(days, 30) : 7;
        const rows = await postgresService.getExpiringProducts(safeDays);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.listAssignedProducts = async (req, res) => {
    try {
        const role = req.user?.role;
        if (!['manufacturer', 'distributor', 'retailer'].includes(role)) {
            return res.status(403).json({ success: false, message: 'Unsupported role for assigned products' });
        }
        const limit = req.query.limit;
        const rows = await ownershipService.listAssignedProducts(req.user.id, role, { limit });
        const data = rows.map((row) => postgresService.mapProductToApi(row));
        return res.json({ success: true, data, count: data.length });
    } catch (error) {
        console.error('listAssignedProducts', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.transferProduct = async (req, res) => {
    try {
        const { id, newOwnerUserId, newOwner } = req.body;
        if (!id) {
            return res.status(400).json({ success: false, message: 'Product id is required' });
        }

        await ownershipService.assertCanTransfer(req.user, id);

        let recipientUserId = newOwnerUserId != null ? Number(newOwnerUserId) : null;
        let chainOwnerName = newOwner != null ? String(newOwner).trim() : '';

        if (recipientUserId) {
            const recipient = await ownershipService.getOwnerDisplayForUser(recipientUserId);
            if (!recipient) {
                return res.status(400).json({ success: false, message: 'Recipient user not found' });
            }
            if (!ownershipService.TRANSFERABLE_ROLES.includes(recipient.role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Recipient must be a manufacturer, distributor, or retailer',
                });
            }
            chainOwnerName = recipient.displayName;
        } else if (!chainOwnerName) {
            return res.status(400).json({
                success: false,
                message: 'newOwnerUserId or newOwner is required',
            });
        }

        const chainResult = await fabricService.transferProduct(id, chainOwnerName);

        if (recipientUserId) {
            await ownershipService.syncOwnershipAfterTransfer(
                id,
                recipientUserId,
                chainResult.owner || chainOwnerName
            );
        }

        const dbRow = await postgresService.getProductFromDB(id);
        const data = dbRow ? postgresService.mapProductToApi(dbRow) : chainResult;
        return res.json({ success: true, data });
    } catch (error) {
        const status = error.statusCode || 500;
        if (status >= 500) console.error('transferProduct', error);
        return res.status(status).json({ success: false, message: error.message });
    }
};

exports.updateLocation = async (req, res) => {
    try {
        const { id, location } = req.body;
        if (!id || location == null || String(location).trim() === '') {
            return res.status(400).json({ success: false, message: 'Product id and location are required' });
        }

        await ownershipService.assertCanUpdateLocation(req.user, id);

        const result = await fabricService.updateLocation(id, String(location).trim());
        const dbRow = await postgresService.getProductFromDB(id);
        const data = dbRow ? postgresService.mapProductToApi(dbRow) : result;
        return res.json({ success: true, data });
    } catch (error) {
        const status = error.statusCode || 500;
        if (status >= 500) console.error('updateLocation', error);
        return res.status(status).json({ success: false, message: error.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const result = await fabricService.getHistory(req.params.id);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyQR = async (req, res) => {
    try {
        const { productId, batchNumber, hash } = req.body;

        if (!productId || !batchNumber || !hash) {
            return res.status(400).json({
                success: false,
                verificationStatus: 'invalid_request',
                message: "Missing required fields: productId, batchNumber, hash"
            });
        }

        const isValid = verifyQR(productId, batchNumber, hash);

        if (!isValid) {
            return res.json({
                success: false,
                verificationStatus: 'fake',
                message: "Invalid QR Code - Possible counterfeit"
            });
        }

        try {
            const product = await fabricService.getProduct(productId);
            return res.json({
                success: true,
                verificationStatus: 'authentic',
                message: "QR Code verified successfully",
                data: product
            });
        } catch (fetchErr) {
            const msg = fetchErr.message || '';
            if (msg.includes('does not exist')) {
                return res.json({
                    success: false,
                    verificationStatus: 'not_found',
                    message: "Product not found on blockchain"
                });
            }
            throw fetchErr;
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            verificationStatus: 'error',
            message: err.message
        });
    }
};