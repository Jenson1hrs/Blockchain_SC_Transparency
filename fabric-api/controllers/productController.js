const fabricService = require('../services/fabricService');
const postgresService = require('../services/dbService');
const userService = require('../services/userService');
const ownershipService = require('../services/ownershipService');
const productStatusService = require('../services/productStatusService');
const transferRequestService = require('../services/transferRequestService');
const notificationTriggers = require('../services/notificationTriggers');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { buildVerifyQrUrl } = require('../utils/frontendUrl');
const { getQrSecret } = require('../utils/qrSecret');
const productMetadataService = require('../services/productMetadataService');

function generateHash(productId, batchNumber) {
    return crypto
        .createHash('sha256')
        .update(productId + batchNumber + getQrSecret())
        .digest('hex');
}

function verifyQR(productId, batchNumber, hash) {
    const expectedHash = generateHash(productId, batchNumber);
    return expectedHash === hash;
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
        const qrData = buildVerifyQrUrl(data.id, data.batch, hash);
        const qrImage = await QRCode.toDataURL(qrData);

        const mfgUserId = data.manufacturerUserId ?? req.user?.id;
        if (mfgUserId && req.user?.role === 'manufacturer') {
            void notificationTriggers.onProductCreated(mfgUserId, data.id).catch(() => {});
            void notificationTriggers.onQrReady(mfgUserId, data.id).catch(() => {});
        } else if (mfgUserId) {
            void notificationTriggers.onProductCreated(mfgUserId, data.id).catch(() => {});
            void notificationTriggers.onQrReady(mfgUserId, data.id).catch(() => {});
        }

        res.json({
            success: true,
            message: "Product stored successfully",
            data: apiProduct,
            qrCode: qrImage,
            qrUrl: qrData,
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
        const qrUrl = buildVerifyQrUrl(product.productId || id, batchNumber, hash);
        const qrCode = await QRCode.toDataURL(qrUrl);

        const dbRow = await postgresService.getProductFromDB(id);
        const mfgUserId = dbRow?.manufacturer_user_id;
        if (mfgUserId) {
            void notificationTriggers.onQrReady(mfgUserId, product.productId || id).catch(() => {});
        }

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
        const userService = require('../services/userService');
        const notificationSyncService = require('../services/notificationSyncService');
        const expiringService = require('../services/expiringService');
        const userRow = await userService.findUserById(req.user.id);
        await notificationSyncService.syncDerivedNotifications(req.user.id, userRow);
        const days = Number(req.query.days || 7);
        const includeExpired =
            req.query.includeExpired === '1' ||
            req.query.includeExpired === 'true';
        const { products, meta } = await expiringService.getExpiringForUser(
            req.user.role,
            req.user.id,
            { days, includeExpired }
        );
        res.json({ success: true, data: products, meta });
    } catch (error) {
        const status = error.statusCode || 500;
        if (status >= 500) console.error('getExpiringProducts', error);
        res.status(status).json({ success: false, message: error.message });
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
        if (req.user.role === 'retailer') {
          await productStatusService.updateProductStatus(id, productStatusService.STATUSES.RETAIL_READY);
        }
        const dbRow = await postgresService.getProductFromDB(id);
        const data = dbRow ? postgresService.mapProductToApi(dbRow) : result;
        if (dbRow?.current_owner_user_id) {
            void notificationTriggers
                .onLocationUpdated(dbRow.current_owner_user_id, id)
                .catch(() => {});
        }
        return res.json({ success: true, data });
    } catch (error) {
        const status = error.statusCode || 500;
        if (status >= 500) console.error('updateLocation', error);
        return res.status(status).json({ success: false, message: error.message });
    }
};

exports.updateManufacturerMetadata = async (req, res) => {
    try {
        if (req.user?.role !== 'manufacturer') {
            return res.status(403).json({ success: false, message: 'Only manufacturers can update product metadata' });
        }
        const productId = req.params.id;
        const data = await productMetadataService.updateManufacturerProductMetadata(
            req.user.id,
            productId,
            req.body
        );
        return res.json({ success: true, data, message: 'Product metadata updated' });
    } catch (error) {
        const status = error.statusCode || 500;
        if (status >= 500) console.error('updateManufacturerMetadata', error);
        return res.status(status).json({ success: false, message: error.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const productId = req.params.id;
        const { timeline, chain } = await transferRequestService.getCombinedProductTimeline(productId);
        res.json({
            success: true,
            data: timeline,
            timeline,
            chain,
        });
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
            void notificationTriggers.onFakeQrDetected(productId).catch(() => {});
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