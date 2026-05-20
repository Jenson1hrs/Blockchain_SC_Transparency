/**
 * Sync fabric-api/wallet admin identity from the running test-network crypto.
 * Run after ./network.sh down/up or createChannel when you get "access denied"
 * but docker ps shows healthy peers and chaincode.
 *
 * Usage: node refreshAdminWallet.js
 */
const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const MSP_BASE = path.resolve(
  __dirname,
  '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp'
);

async function main() {
  if (!fs.existsSync(MSP_BASE)) {
    console.error('MSP not found:', MSP_BASE);
    console.error('Start Fabric test-network first (createChannel).');
    process.exit(1);
  }

  const signcertsDir = path.join(MSP_BASE, 'signcerts');
  const certName = fs.readdirSync(signcertsDir).find((f) => f.endsWith('.pem'));
  if (!certName) {
    console.error('No cert in', signcertsDir);
    process.exit(1);
  }

  const keystoreDir = path.join(MSP_BASE, 'keystore');
  const keyName = fs.readdirSync(keystoreDir)[0];
  const certificate = fs.readFileSync(path.join(signcertsDir, certName), 'utf8');
  const privateKey = fs.readFileSync(path.join(keystoreDir, keyName), 'utf8');

  const walletPath = path.join(__dirname, 'wallet');
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  await wallet.put('admin', {
    credentials: { certificate, privateKey },
    mspId: 'Org1MSP',
    type: 'X.509',
  });

  console.log('Wallet identity "admin" synced from current test-network.');
  console.log('Restart the API: npm start');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
