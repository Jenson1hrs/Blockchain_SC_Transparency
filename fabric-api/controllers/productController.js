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

        // Generate QR code
        const hash = generateHash(data.id, data.batch);
        const qrData = `http://192.168.1.4:5173/verify/${data.id}?batch=${data.batch}&hash=${hash}`;
        const qrImage = await QRCode.toDataURL(qrData);

        res.json({
            success: true,
            message: "Product stored successfully",
            blockchain: blockchainResult,
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

exports.getProduct = async (req, res) => {
    try {
        const result = await fabricService.getProduct(req.params.id);
        res.json({ success: true, data: result });
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
                message: "Missing required fields: productId, batchNumber, hash"
            });
        }

        const isValid = verifyQR(productId, batchNumber, hash);

        if (!isValid) {
            return res.json({
                success: false,
                message: "Invalid QR Code - Possible counterfeit"
            });
        }

        const product = await fabricService.getProduct(productId);

        res.json({
            success: true,
            message: "QR Code verified successfully",
            data: product
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};