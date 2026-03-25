const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '../connection.json');

async function connectToNetwork() {
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    const walletPath = path.join(__dirname, '../wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const identity = await wallet.get('admin');
    if (!identity) {
        throw new Error('Admin identity not found in wallet');
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: 'admin',
        discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork('supplychannel');
    const contract = network.getContract('anticounterfeit');

    return { gateway, contract };
}

module.exports = connectToNetwork;