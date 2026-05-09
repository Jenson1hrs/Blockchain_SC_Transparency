const fabricService = require('../services/fabricService');
const postgresService = require('../services/dbService');
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

exports.createProduct = async (req, res) => {
    try {
        const data = req.body;

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

        const created = blockchainResult.blockchain;
        const hash = generateHash(data.id, data.batch);
        // Phones cannot open localhost — set FRONTEND_URL to http://<laptop-LAN-ip>:5173 before demo
        const frontendBase = getFrontendBase();
        const qrData = `${frontendBase}/verify/${encodeURIComponent(data.id)}?batch=${encodeURIComponent(data.batch)}&hash=${encodeURIComponent(hash)}`;
        const qrImage = await QRCode.toDataURL(qrData);

        res.json({
            success: true,
            message: "Product stored successfully",
            data: created,
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

exports.transferProduct = async (req, res) => {
    try {
        const { id, newOwner } = req.body;
        const result = await fabricService.transferProduct(id, newOwner);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateLocation = async (req, res) => {
    try {
        const { id, location } = req.body;
        const result = await fabricService.updateLocation(id, location);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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