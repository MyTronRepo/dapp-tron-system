require("dotenv").config();

const dns = require("dns");
const TronWeb = require("tronweb");

// =========================================================
// CONFIG
// =========================================================

const HOST = "nile.trongrid.io";
const NILE_IP = "32.189.30.242";

const CONTRACT =
    "TVWZuPikzADL6SgSTsS1JUQxGQUUEcmJrv";

const PROPERTY_ID = "PROP-001";

const SHARE = 50;

const NATIONAL_ID_HASH =
    "0x1111111111111111111111111111111111111111111111111111111111111111";

const FEE_LIMIT = 300_000_000;

const MAX_CONFIRMATION_ATTEMPTS = 30;

const CONFIRMATION_INTERVAL = 3000;

// =========================================================
// FORCE IPv4
// =========================================================

dns.setDefaultResultOrder("ipv4first");

const originalLookup = dns.lookup;

dns.lookup = function (hostname, options, callback) {
    if (hostname === HOST) {
        if (typeof options === "function") {
            callback = options;
            options = {};
        }

        return callback(null, NILE_IP, 4);
    }

    return originalLookup.call(
        dns,
        hostname,
        options,
        callback
    );
};

// =========================================================
// ENV CHECK
// =========================================================

if (!process.env.PRIVATE_KEY) {
    throw new Error(
        "PRIVATE_KEY missing from .env"
    );
}

if (!process.env.OWNER2_PRIVATE_KEY) {
    throw new Error(
        "OWNER2_PRIVATE_KEY missing from .env"
    );
}

// =========================================================
// ADMIN / MAIN WALLET
// =========================================================

const adminTronWeb = new TronWeb(
    `https://${HOST}`,
    `https://${HOST}`,
    `https://${HOST}`,
    process.env.PRIVATE_KEY
);

// =========================================================
// OWNER 2 WALLET
// =========================================================

const owner2TronWeb = new TronWeb(
    `https://${HOST}`,
    `https://${HOST}`,
    `https://${HOST}`,
    process.env.OWNER2_PRIVATE_KEY
);

// =========================================================
// HELPERS
// =========================================================

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

function safeJson(value) {
    return JSON.stringify(
        value,
        (_, item) => {
            if (
                item &&
                typeof item === "object" &&
                item.type === "BigNumber"
            ) {
                return item.hex || item.toString();
            }

            if (typeof item === "bigint") {
                return item.toString();
            }

            return item;
        },
        2
    );
}

// =========================================================
// WAIT CONFIRMATION
// =========================================================

async function waitForConfirmation(
    txid,
    maxAttempts = MAX_CONFIRMATION_ATTEMPTS
) {
    for (
        let attempt = 1;
        attempt <= maxAttempts;
        attempt++
    ) {
        try {
            const info =
                await adminTronWeb.trx.getTransactionInfo(
                    txid
                );

            if (
                info &&
                info.receipt &&
                info.receipt.result
            ) {
                return info;
            }
        } catch (_) {}

        console.log(
            `Waiting confirmation... ${attempt}/${maxAttempts}`
        );

        await sleep(
            CONFIRMATION_INTERVAL
        );
    }

    throw new Error(
        "Transaction confirmation timeout."
    );
}

// =========================================================
// MAIN
// =========================================================

async function main() {
    try {
        console.log();
        console.log(
            "================================"
        );
        console.log(
            "OWNERSHIP TEST - ADMIN ADDS OWNER 2"
        );
        console.log(
            "================================"
        );

        console.log(
            "Contract:",
            CONTRACT
        );

        console.log(
            "Property:",
            PROPERTY_ID
        );

        const adminAddress =
            adminTronWeb.defaultAddress.base58;

        const owner2Address =
            owner2TronWeb.defaultAddress.base58;

        console.log(
            "Admin:",
            adminAddress
        );

        console.log(
            "Owner 2:",
            owner2Address
        );

        console.log(
            "Share:",
            SHARE
        );

        console.log();

        // =====================================================
        // CHECK NILE
        // =====================================================

        console.log(
            "Checking Nile..."
        );

        const block =
            await adminTronWeb.trx.getCurrentBlock();

        const blockNumber =
            block?.block_header?.raw_data?.number;

        if (!blockNumber) {
            throw new Error(
                "Invalid Nile block response."
            );
        }

        console.log(
            "Nile block:",
            blockNumber
        );

        console.log();

        // =====================================================
        // LOAD CONTRACT WITH ADMIN
        // =====================================================

        console.log(
            "Loading contract..."
        );

        const adminContract =
            await adminTronWeb
                .contract()
                .at(CONTRACT);

        console.log(
            "Contract loaded."
        );

        // =====================================================
        // READ BEFORE
        // =====================================================

        console.log();
        console.log(
            "Reading owners BEFORE..."
        );

        const before =
            await adminContract
                .getOwners(PROPERTY_ID)
                .call();

        console.log();

        console.log(
            "Owners BEFORE:"
        );

        console.log(
            safeJson(before)
        );

        // =====================================================
        // ADD OWNER 2
        // IMPORTANT:
        // This transaction is sent by ADMIN
        // =====================================================

        console.log();
        console.log(
            "Sending addOwner from ADMIN..."
        );

        console.log(
            "Owner 2 address:",
            owner2Address
        );

        console.log(
            "Share:",
            SHARE
        );

        const txid =
            await adminContract
                .addOwner(
                    PROPERTY_ID,
                    owner2Address,
                    NATIONAL_ID_HASH,
                    SHARE
                )
                .send({
                    feeLimit: FEE_LIMIT
                });

        console.log();

        console.log(
            "Transaction ID:",
            txid
        );

        // =====================================================
        // CONFIRMATION
        // =====================================================

        console.log();
        console.log(
            "Waiting for confirmation..."
        );

        const txInfo =
            await waitForConfirmation(
                txid
            );

        const result =
            txInfo?.receipt?.result;

        console.log();

        console.log(
            "Transaction result:",
            result
        );

        // =====================================================
        // TRANSACTION FAILED
        // =====================================================

        if (result !== "SUCCESS") {
            console.error();

            console.error(
                "================================"
            );

            console.error(
                "OWNERSHIP FAILED"
            );

            console.error(
                "================================"
            );

            console.error(
                safeJson(txInfo)
            );

            process.exit(1);
        }

        // =====================================================
        // READ AFTER
        // =====================================================

        console.log();
        console.log(
            "Reading owners AFTER..."
        );

        const after =
            await adminContract
                .getOwners(PROPERTY_ID)
                .call();

        console.log();

        console.log(
            "Owners AFTER:"
        );

        console.log(
            safeJson(after)
        );

        // =====================================================
        // SUCCESS
        // =====================================================

        console.log();

        console.log(
            "================================"
        );

        console.log(
            "OWNERSHIP TEST SUCCESS"
        );

        console.log(
            "================================"
        );

        console.log(
            "Property ID:",
            PROPERTY_ID
        );

        console.log(
            "Admin:",
            adminAddress
        );

        console.log(
            "Owner 2:",
            owner2Address
        );

        console.log(
            "Share:",
            SHARE
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

    } catch (error) {
        console.error();

        console.error(
            "================================"
        );

        console.error(
            "OWNERSHIP ERROR"
        );

        console.error(
            "================================"
        );

        console.error(
            error?.message || error
        );

        console.error();

        process.exit(1);
    }
}

main();