const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function importAdmin() {
    const walletPath = path.join(__dirname, 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    
    // Path to admin MSP folder
    const adminMspPath = path.join(__dirname, 'wallet/Admin@org1.example.com');
    
    // Check if folder exists
    if (!fs.existsSync(adminMspPath)) {
        console.error('❌ Admin MSP folder not found at:', adminMspPath);
        return;
    }
    
    // Read certificate (directly in the folder)
    const certPath = path.join(adminMspPath, 'cert.pem');
    const cert = fs.readFileSync(certPath).toString();
    
    // Read private key (directly in the folder)
    const keyPath = path.join(adminMspPath, 'priv_sk');
    const key = fs.readFileSync(keyPath).toString();
    
    // Create identity object
    const identity = {
        credentials: {
            certificate: cert,
            privateKey: key,
        },
        mspId: 'Org1MSP',
        type: 'X.509',
    };
    
    // Store identity in wallet
    await wallet.put('Admin@org1.example.com', identity);
    console.log('✅ Admin identity imported successfully');
    
    // Verify
    const exists = await wallet.get('Admin@org1.example.com');
    if (exists) {
        console.log('✅ Identity verified in wallet');
    }
}

importAdmin().catch(console.error);
