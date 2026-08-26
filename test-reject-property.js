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
// TRONWEB
// =========================================================

const tronWeb = new TronWeb(
    `https://${HOST}`,
    `https://${HOST}`,
    `https://${HOST}`,
    process.env.PRIVATE_KEY
);

// =========================================================
// HELPERS
// =========================================================

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForConfirmation(txid, maxAttempts = 30) {
    for (let i = 1; i <= maxAttempts; i++) {
        try {
            const info =
                await tronWeb.trx.getTransactionInfo(txid);

            if (
                info &&
                info.receipt &&
                info.receipt.result
            ) {
                return info;
            }
        } catch (_) {}

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
// MAIN
// =========================================================

async function main() {
    try {
        console.log();
        console.log("================================");
        console.log("REJECT PROPERTY TEST");
        console.log("================================");

        console.log(
            "Contract:",
            CONTRACT
        );

        console.log(
            "Property:",
            PROPERTY_ID
        );

        console.log(
            "Admin:",
            tronWeb.defaultAddress.base58
        );

        console.log(
            "Forced IPv4:",
            NILE_IP
        );

        console.log();

        if (!process.env.PRIVATE_KEY) {
            throw new Error(
                "PRIVATE_KEY missing."
            );
        }

        // =====================================================
        // CHECK NILE
        // =====================================================

        console.log("Checking Nile...");

        const block =
            await tronWeb.trx.getCurrentBlock();

        console.log(
            "Nile block:",
            block.block_header.raw_data.number
        );

        console.log();

        // =====================================================
        // LOAD CONTRACT
        // =====================================================

        const contract =
            await tronWeb
                .contract()
                .at(CONTRACT);

        // =====================================================
        // BEFORE
        // =====================================================

        console.log(
            "Reading property BEFORE..."
        );

        const before =
            await contract
                .getProperty(PROPERTY_ID)
                .call();

        console.log();
        console.log(
            "Property BEFORE:"
        );

        console.log(
            JSON.stringify(
                before,
                null,
                2
            )
        );

        // =====================================================
        // REJECT
        // =====================================================

        console.log();
        console.log(
            "Sending rejectProperty..."
        );

        const txid =
            await contract
                .rejectProperty(PROPERTY_ID)
                .send({
                    feeLimit: 300_000_000
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
            await waitForConfirmation(txid);

        const result =
            txInfo?.receipt?.result;

        console.log();
        console.log(
            "Transaction result:",
            result
        );

        if (result !== "SUCCESS") {
            console.error();
            console.error(
                "================================"
            );
            console.error(
                "REJECT FAILED"
            );
            console.error(
                "================================"
            );

            console.error(
                JSON.stringify(
                    txInfo,
                    null,
                    2
                )
            );

            process.exit(1);
        }

        // =====================================================
        // AFTER
        // =====================================================

        console.log();
        console.log(
            "Reading property AFTER..."
        );

        const after =
            await contract
                .getProperty(PROPERTY_ID)
                .call();

        console.log();
        console.log(
            "Property AFTER:"
        );

        console.log(
            JSON.stringify(
                after,
                null,
                2
            )
        );

        // =====================================================
        // FINAL
        // =====================================================

        console.log();
        console.log(
            "================================"
        );
        console.log(
            "REJECT PROPERTY SUCCESS"
        );
        console.log(
            "================================"
        );

        console.log(
            "Property ID:",
            PROPERTY_ID
        );

        console.log(
            "TX ID:",
            txid
        );

        console.log(
            "Contract:",
            CONTRACT
        );

        console.log(
            "Result:",
            result
        );

        console.log();
    } catch (error) {
        console.error();
        console.error(
            "================================"
        );
        console.error(
            "REJECT ERROR"
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