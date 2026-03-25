const fabricService = require('../services/fabricService');

exports.createProduct = async (req, res) => {
    try {
        const result = await fabricService.createProduct(req.body);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const result = await fabricService.getProduct(req.params.id);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.transferProduct = async (req, res) => {
    try {
        const { id, newOwner } = req.body;
        const result = await fabricService.transferProduct(id, newOwner);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateLocation = async (req, res) => {
    try {
        const { id, location } = req.body;
        const result = await fabricService.updateLocation(id, location);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const result = await fabricService.getHistory(req.params.id);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};