import { Gateway, Wallets, Contract } from "fabric-network";
import path from "path";
import fs from "fs";

export async function connectToFabric(): Promise<Contract> {

    // Path to connection profile
    const ccpPath = path.resolve(
        __dirname,
        "../../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json"
    );

    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    // Wallet path
    const walletPath = path.join(__dirname, "../wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Create gateway
    const gateway = new Gateway();

    await gateway.connect(ccp, {
        wallet,
        identity: "appUser",
        discovery: { enabled: true, asLocalhost: true }
    });

    // Connect to channel
    const network = await gateway.getNetwork("supplychannel");

    // Get smart contract
    const contract = network.getContract("anticounterfeit");

    return contract;
}