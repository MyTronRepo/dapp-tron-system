require("dotenv").config();

const fs = require("fs");
const TronWeb = require("tronweb");

const tronWeb = new TronWeb({
    fullHost: process.env.TRON_FULL_HOST,
    privateKey: process.env.PRIVATE_KEY
});

async function deploy() {
    try {
        const abi = JSON.parse(
            fs.readFileSync("contract-abi.json", "utf8")
        );

        const bytecode = fs
            .readFileSync("contract-bytecode.txt", "utf8")
            .trim();

        const deployer = tronWeb.defaultAddress.base58;

        console.log("Network:", process.env.TRON_FULL_HOST);
        console.log("Deployer:", deployer);

        const balance = await tronWeb.trx.getBalance(deployer);

        console.log("Balance:", balance / 1e6, "TRX");
        console.log("Deploying contract...");

        const contract = await tronWeb.contract().new({
            abi,
            bytecode,
            feeLimit: 1000000000,
            callValue: 0,
            userFeePercentage: 100,
            originEnergyLimit: 10000000
        });

        console.log("\n================================");
        console.log("DEPLOY SUCCESS");
        console.log("Contract Address:", contract.address);
        console.log("================================\n");

        fs.writeFileSync(
            "deployed-contract-address.txt",
            contract.address
        );

    } catch (error) {
        console.error("\nDEPLOY ERROR:");
        console.error(error.message || error);
        process.exit(1);
    }
}

deploy();