const fabricService = require('../services/fabricService');
const postgresService = require('../services/dbService');

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

        res.json({
            success: true,
            message: "Product stored successfully",
            blockchain: blockchainResult,
            database: dbResult
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