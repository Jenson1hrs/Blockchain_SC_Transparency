const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

//Connects backend to blockchain
//Reads connection.json file to get connection details
const ccpPath = path.resolve(__dirname, '../connection.json');

async function connectToNetwork() {
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
//Reads wallet (identity)
    const walletPath = path.join(__dirname, '../wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const identity = await wallet.get('Admin@org1.example.com');  // ← Changed to match
    if (!identity) {
        throw new Error('Admin identity not found in wallet');
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: 'Admin@org1.example.com',  // ← This matches now
        discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork('supplychannel');
    const contract = network.getContract('anticounterfeit');

    return { gateway, contract };
}

module.exports = connectToNetwork;