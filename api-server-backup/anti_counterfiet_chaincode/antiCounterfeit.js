'use strict';

const { Contract } = require('fabric-contract-api');

class AntiCounterfeitContract extends Contract {

    // Helper function to get deterministic timestamp
    getTxTimestamp(ctx) {
        const txTimestamp = ctx.stub.getTxTimestamp();
    
        const seconds = txTimestamp.seconds.low || txTimestamp.seconds;
        const nanos = txTimestamp.nanos;
    
        const millis = (seconds * 1000) + Math.floor(nanos / 1000000);
    
        return new Date(millis).toISOString();
    }

    async createProduct(ctx, productId, name, manufacturer, batchNumber, location) {
        const exists = await this.productExists(ctx, productId);
        if (exists) {
            throw new Error(`Product ${productId} already exists`);
        }

        const product = {
            productId,
            name,
            manufacturer,
            batchNumber,
            location,
            owner: manufacturer,
            status: "Manufactured",
            timestamp: this.getTxTimestamp(ctx)  // ✅ FIXED: Deterministic timestamp
        };

        await ctx.stub.putState(productId, Buffer.from(JSON.stringify(product)));
        return JSON.stringify(product);
    }

    async verifyProduct(ctx, productId) {
        const productJSON = await ctx.stub.getState(productId);
        if (!productJSON || productJSON.length === 0) {
            throw new Error(`Product ${productId} does not exist`);
        }
        return productJSON.toString();
    }

    async transferProduct(ctx, productId, newOwner) {
        const productJSON = await ctx.stub.getState(productId);
        if (!productJSON || productJSON.length === 0) {
            throw new Error(`Product ${productId} does not exist`);
        }

        const product = JSON.parse(productJSON.toString());
        product.owner = newOwner;
        product.status = "In Transit";
        product.timestamp = this.getTxTimestamp(ctx);  // ✅ FIXED: Update timestamp

        await ctx.stub.putState(productId, Buffer.from(JSON.stringify(product)));
        return JSON.stringify(product);
    }

    async updateLocation(ctx, productId, newLocation) {
        const productJSON = await ctx.stub.getState(productId);
        if (!productJSON || productJSON.length === 0) {
            throw new Error(`Product ${productId} does not exist`);
        }

        const product = JSON.parse(productJSON.toString());
        product.location = newLocation;
        product.timestamp = this.getTxTimestamp(ctx);  // ✅ FIXED: Update timestamp

        await ctx.stub.putState(productId, Buffer.from(JSON.stringify(product)));
        return JSON.stringify(product);
    }

    async getProductHistory(ctx, productId) {
        const iterator = await ctx.stub.getHistoryForKey(productId);
        const results = [];

        while (true) {
            const res = await iterator.next();

            if (res.value) {
                const record = JSON.parse(res.value.value.toString('utf8'));
                results.push({
                    txId: res.value.txId,
                    timestamp: res.value.timestamp,  // ✅ This is Fabric's timestamp, not your app timestamp
                    data: record
                });
            }

            if (res.done) {
                await iterator.close();
                return JSON.stringify(results);
            }
        }
    }

    async productExists(ctx, productId) {
        const productJSON = await ctx.stub.getState(productId);
        return productJSON && productJSON.length > 0;
    }
}

module.exports = AntiCounterfeitContract;