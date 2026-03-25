const connectToNetwork = require('../config/fabric');

async function createProduct(data) {
    const { gateway, contract } = await connectToNetwork();

    try {
        const result = await contract.submitTransaction(
            'createProduct',
            data.id,
            data.name,
            data.manufacturer,
            data.batch,
            data.location
        );

        return JSON.parse(result.toString());
    } finally {
        gateway.disconnect();
    }
}

async function getProduct(id) {
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