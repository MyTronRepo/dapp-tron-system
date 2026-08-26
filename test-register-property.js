require("dotenv").config();

const fs = require("fs");
const dns = require("dns");
const TronWeb = require("tronweb");

// =========================================================
// NILE CONFIG
// =========================================================

const HOST = "nile.trongrid.io";
const NILE_IP = "32.189.30.242";
const NILE_URL = `https://${HOST}`;

const CONTRACT =
    "TVWZuPikzADL6SgSTsS1JUQxGQUUEcmJrv";
    
// =========================================================
// FORCE NILE DNS → WORKING IPv4
// =========================================================

dns.setDefaultResultOrder("ipv4first");

const originalLookup = dns.lookup;

dns.lookup = function (hostname, options, callback) {

    if (hostname === HOST) {

        if (typeof options === "function") {
            callback = options;
            options = {};
        }

        return callback(
            null,
            NILE_IP,
            4
        );
    }

    return originalLookup.call(
        dns,
        hostname,
        options,
        callback
    );
};

// =========================================================
// TRONWEB
// IMPORTANT:
// TronWeb 5.3.5 expects valid node URLs here.
// Do NOT pass custom provider objects.
// =========================================================

const tronWeb = new TronWeb(
    NILE_URL,
    NILE_URL,
    NILE_URL,
    process.env.PRIVATE_KEY
);

// =========================================================
// HELPERS
// =========================================================

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

async function waitForConfirmation(
    txid,
    maxAttempts = 30
) {

    for (
        let i = 1;
        i <= maxAttempts;
        i++
    ) {

        try {

            const info =
                await tronWeb.trx.getTransactionInfo(
                    txid
                );

            if (
                info &&
                info.receipt &&
                info.receipt.result
            ) {
                return info;
            }

        } catch (_) {
            // retry
        }

        console.log(
            `Waiting confirmation... ${i}/${maxAttempts}`
        );

        await sleep(3000);
    }

    throw new Error(
        "Transaction confirmation timeout."
    );
}

// =========================================================
// TEST DATA
// =========================================================

const property = {

    propertyId: "PROP-001",

    province: "Tehran",

    city: "Tehran",

    district: "District-1",

    parcelNumber: "PARCEL-001",

    area: 150,

    buildYear: 2024,

    usageType: "Residential",

    constructionStatus: "Completed",

    latitude: 35500000,

    longitude: 51200000
};

// =========================================================
// MAIN
// =========================================================

async function main() {

    console.log();
    console.log(
        "================================"
    );
    console.log(
        "REGISTER PROPERTY TEST"
    );
    console.log(
        "================================"
    );

    if (!process.env.PRIVATE_KEY) {
        throw new Error(
            "PRIVATE_KEY missing."
        );
    }

    // -----------------------------------------------------
    // LOAD ABI
    // -----------------------------------------------------

    const abi = JSON.parse(
        fs.readFileSync(
            "contract-abi.json",
            "utf8"
        )
    );

    // -----------------------------------------------------
    // DEPLOYER
    // -----------------------------------------------------

    const deployer =
        tronWeb.defaultAddress.base58;

    console.log(
        "Contract:",
        CONTRACT
    );

    console.log(
        "Deployer:",
        deployer
    );

    console.log(
        "Forced IPv4:",
        NILE_IP
    );

    console.log();

    // -----------------------------------------------------
    // CONNECTION TEST
    // -----------------------------------------------------

    console.log(
        "Checking Nile..."
    );

    const block =
        await tronWeb.trx.getCurrentBlock();

    console.log(
        "Nile block:",
        block.block_header.raw_data.number
    );

    console.log();

    // -----------------------------------------------------
    // CONTRACT
    // -----------------------------------------------------

    const contract =
        await tronWeb.contract(
            abi,
            CONTRACT
        );

    // -----------------------------------------------------
    // BEFORE
    // -----------------------------------------------------

    const before =
        await contract
            .propertyCounter()
            .call();

    console.log(
        "Property counter BEFORE:",
        String(before)
    );

    console.log();

    // -----------------------------------------------------
    // BUILD + SEND
    // -----------------------------------------------------

    console.log(
        "Sending registerProperty..."
    );

    const txid =
        await contract
            .registerProperty(
                property.propertyId,
                property.province,
                property.city,
                property.district,
                property.parcelNumber,
                property.area,
                property.buildYear,
                property.usageType,
                property.constructionStatus,
                property.latitude,
                property.longitude
            )
            .send({
                feeLimit: 300_000_000
            });

    console.log();

    console.log(
        "Transaction ID:",
        txid
    );

    // -----------------------------------------------------
    // CONFIRM
    // -----------------------------------------------------

    console.log();

    console.log(
        "Waiting for confirmation..."
    );

    const info =
        await waitForConfirmation(
            txid
        );

    console.log();

    console.log(
        "Transaction result:",
        info.receipt.result
    );

    if (
        info.receipt.result !==
        "SUCCESS"
    ) {

        throw new Error(
            `Transaction failed: ${info.receipt.result}`
        );
    }

    // -----------------------------------------------------
    // AFTER
    // -----------------------------------------------------

    const after =
        await contract
            .propertyCounter()
            .call();

    console.log();

    console.log(
        "Property counter AFTER:",
        String(after)
    );

    // -----------------------------------------------------
    // READ BACK
    // -----------------------------------------------------

    console.log();

    console.log(
        "Reading property..."
    );

    const saved =
        await contract
            .getProperty(
                property.propertyId
            )
            .call();

    console.log();

    console.log(
        "Property read-back:"
    );

    console.log(
        JSON.stringify(
            saved,
            (_, value) =>
                typeof value === "bigint"
                    ? value.toString()
                    : value,
            2
        )
    );

    // -----------------------------------------------------
    // SUCCESS
    // -----------------------------------------------------

    console.log();

    console.log(
        "================================"
    );

    console.log(
        "REGISTER PROPERTY SUCCESS"
    );

    console.log(
        "================================"
    );

    console.log(
        "Property ID:",
        property.propertyId
    );

    console.log(
        "TX ID:",
        txid
    );

    console.log(
        "Contract:",
        CONTRACT
    );

    console.log();
}

// =========================================================
// ERROR
// =========================================================

main().catch(error => {

    console.error();

    console.error(
        "================================"
    );

    console.error(
        "REGISTER PROPERTY ERROR"
    );

    console.error(
        "================================"
    );

    console.error(
        error?.response?.data ||
        error?.message ||
        error
    );

    process.exit(1);
});
