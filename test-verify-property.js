require("dotenv").config();

const dns = require("dns");
const https = require("https");
const axios = require("axios");
const TronWeb = require("tronweb");

// =========================================================
// CONFIG
// =========================================================

const NILE_HOST = "nile.trongrid.io";

const NILE_IPS = [
    "16.144.103.81",
    "32.189.30.242",
    "52.33.11.204"
];

// قرارداد جدیدی که در اجرای اخیر استفاده شد
const CONTRACT_ADDRESS =
    "TVWZuPikzADL6SgSTsS1JUQxGQUUEcmJrv";

const PROPERTY_ID = "PROP-001";

const FEE_LIMIT = 300_000_000;

// تعداد retry برای هر درخواست
const REQUEST_RETRIES = 1;

// timeout هر درخواست
const REQUEST_TIMEOUT = 8000;

// فاصله بین تلاش‌های confirmation
const CONFIRMATION_INTERVAL = 2500;

// حداکثر مدت انتظار confirmation
const MAX_CONFIRMATION_ATTEMPTS = 24;

// =========================================================
// FORCE IPv4
// =========================================================

dns.setDefaultResultOrder("ipv4first");

const originalLookup = dns.lookup;

dns.lookup = function (hostname, options, callback) {
    if (hostname === NILE_HOST) {
        if (typeof options === "function") {
            callback = options;
            options = {};
        }

        return callback(
            null,
            NILE_IPS[0],
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
// HTTPS AGENT
// =========================================================

const httpsAgent = new https.Agent({
    keepAlive: false,
    family: 4,

    // TLS باید برای hostname انجام شود
    // نه IP
    servername: NILE_HOST,

    rejectUnauthorized: true
});

// =========================================================
// NILE REQUEST
// =========================================================

async function nileRequest(
    method,
    path,
    data = {}
) {
    let lastError = null;

    for (
        let ipIndex = 0;
        ipIndex < NILE_IPS.length;
        ipIndex++
    ) {
        const ip = NILE_IPS[ipIndex];

        for (
            let retry = 0;
            retry <= REQUEST_RETRIES;
            retry++
        ) {
            try {
                console.log(
                    `[NILE] ${method.toUpperCase()} ${path} via ${ip}` +
                    (retry > 0 ? ` (retry ${retry})` : "")
                );

                const response = await axios({
                    method: method.toLowerCase(),

                    // اتصال مستقیم به IP
                    url: `https://${ip}${path}`,

                    data,

                    timeout: REQUEST_TIMEOUT,

                    httpsAgent,

                    headers: {
                        Host: NILE_HOST,
                        "Content-Type": "application/json",
                        Connection: "close"
                    },

                    validateStatus: () => true
                });

                if (
                    response.status < 200 ||
                    response.status >= 300
                ) {
                    const error = new Error(
                        `Nile HTTP ${response.status}`
                    );

                    error.response = response;

                    throw error;
                }

                return response.data;
            } catch (error) {
                lastError = error;

                console.log(
                    `[NILE] ${ip} failed: ${
                        error?.message || error
                    }`
                );
            }
        }
    }

    throw new Error(
        `All Nile IPv4 endpoints failed.\n` +
        `Last error: ${lastError?.message || lastError}`
    );
}


// =========================================================
// TRONWEB
// =========================================================

const tronWeb = new TronWeb(
    `https://${NILE_HOST}`,
    `https://${NILE_HOST}`,
    `https://${NILE_HOST}`,
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

// =========================================================
// NORMALIZE PROPERTY RESULT
// =========================================================

function normalizeProperty(value) {
    if (value === null || value === undefined) {
        return null;
    }

    // بعض نسخه‌های TronWeb ممکن است
    // tuple را به شکل array برگردانند.
    if (Array.isArray(value)) {
        return {
            propertyId: value[0],
            province: value[1],
            city: value[2],
            district: value[3],
            parcelNumber: value[4],
            area: value[5],
            buildYear: value[6],
            usageType: value[7],
            constructionStatus: value[8],
            latitude: value[9],
            longitude: value[10],
            status: value[11]
        };
    }

    // حالت object
    if (typeof value === "object") {
        return value;
    }

    // اگر قرارداد برای property موجود
    // یک string خالی برگرداند
    if (typeof value === "string") {
        if (value.trim() === "") {
            return null;
        }

        return {
            propertyId: value
        };
    }

    return value;
}

// =========================================================
// CHECK PROPERTY EXISTS
// =========================================================

function propertyExists(value) {
    const normalized = normalizeProperty(value);

    if (!normalized) {
        return false;
    }

    if (
        typeof normalized.propertyId === "string" &&
        normalized.propertyId.trim() === ""
    ) {
        return false;
    }

    return true;
}

// =========================================================
// FORMAT PROPERTY
// =========================================================

function printProperty(label, value) {
    console.log();
    console.log(`${label}:`);

    if (
        value === null ||
        value === undefined
    ) {
        console.log("null");
        return;
    }

    try {
        console.log(
            JSON.stringify(
                value,
                null,
                2
            )
        );
    } catch {
        console.log(value);
    }
}

// =========================================================
// DECODE REVERT REASON
// =========================================================

function decodeRevertReason(txInfo) {
    const contractResult =
        txInfo?.contractResult?.[0];

    if (
        !contractResult ||
        typeof contractResult !== "string"
    ) {
        return null;
    }

    const hex =
        contractResult.startsWith("0x")
            ? contractResult.slice(2)
            : contractResult;

    // Error(string)
    if (
        hex.startsWith("08c379a0") &&
        hex.length >= 8 + 128
    ) {
        try {
            const data = hex.slice(8);

            const offset =
                parseInt(
                    data.slice(0, 64),
                    16
                );

            const lengthPosition =
                offset * 2;

            const length =
                parseInt(
                    data.slice(
                        lengthPosition,
                        lengthPosition + 64
                    ),
                    16
                );

            const stringStart =
                lengthPosition + 64;

            const stringHex =
                data.slice(
                    stringStart,
                    stringStart + length * 2
                );

            return Buffer
                .from(
                    stringHex,
                    "hex"
                )
                .toString("utf8");
        } catch {
            // ignore
        }
    }

    return null;
}

// =========================================================
// WAIT FOR CONFIRMATION
// =========================================================

async function waitForConfirmation(
    txId,
    maxAttempts = MAX_CONFIRMATION_ATTEMPTS
) {
    for (
        let attempt = 1;
        attempt <= maxAttempts;
        attempt++
    ) {
        try {
            const txInfo =
                await tronWeb.trx.getTransactionInfo(
                    txId
                );

            if (
                txInfo &&
                txInfo.receipt &&
                txInfo.receipt.result
            ) {
                const result =
                    txInfo.receipt.result;

                // اگر transaction fail شده،
                // همان لحظه برگردان.
                if (result !== "SUCCESS") {
                    return txInfo;
                }

                return txInfo;
            }

            console.log(
                `Waiting confirmation... ` +
                `${attempt}/${maxAttempts}`
            );
        } catch (error) {
            console.log(
                `Confirmation request failed: ` +
                `${error?.message || error}`
            );

            console.log(
                `Waiting confirmation... ` +
                `${attempt}/${maxAttempts}`
            );
        }

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
            "VERIFY PROPERTY TEST"
        );
        console.log(
            "================================"
        );

        console.log(
            "Contract:",
            CONTRACT_ADDRESS
        );

        console.log(
            "Property:",
            PROPERTY_ID
        );

        console.log(
            "Deployer:",
            tronWeb.defaultAddress.base58
        );

        console.log(
            "Nile Host:",
            NILE_HOST
        );

        console.log(
            "Nile IPs:",
            NILE_IPS.join(", ")
        );

        console.log();

        // =====================================================
        // CHECK ENV
        // =====================================================

        if (!process.env.PRIVATE_KEY) {
            throw new Error(
                "PRIVATE_KEY is missing from .env"
            );
        }

        // =====================================================
        // CHECK NILE
        // =====================================================

        console.log(
            "Checking Nile..."
        );

        const block =
            await nileRequest(
                "post",
                "/wallet/getnowblock",
                {}
            );

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
        // CHECK CONTRACT
        // =====================================================

        console.log(
            "Loading contract..."
        );

        const contractInfo =
            await nileRequest(
                "post",
                "/wallet/getcontract",
                {
                    value: tronWeb.address.toHex(
                        CONTRACT_ADDRESS
                    ).replace(/^0x/, "")
                }
            );

        if (
            !contractInfo ||
            !contractInfo.bytecode
        ) {
            throw new Error(
                "Contract was not found on Nile."
            );
        }

        console.log(
            "Contract loaded."
        );

        console.log();

        // =====================================================
        // CONTRACT OBJECT
        // =====================================================

        const contract =
            await tronWeb.contract().at(
                CONTRACT_ADDRESS
            );

        // =====================================================
        // BEFORE
        // =====================================================

        console.log(
            "Reading property BEFORE..."
        );

        let beforeRaw;

        try {
            beforeRaw =
                await contract
                    .getProperty(PROPERTY_ID)
                    .call();
        } catch (error) {
            throw new Error(
                `Unable to read property ${PROPERTY_ID}: ` +
                `${error?.message || error}`
            );
        }

        const before =
            normalizeProperty(
                beforeRaw
            );

        printProperty(
            "Property BEFORE",
            before
        );

        // =====================================================
        // IMPORTANT PRECHECK
        // =====================================================

        if (!propertyExists(before)) {
            console.error();
            console.error(
                "================================"
            );
            console.error(
                "PROPERTY NOT FOUND"
            );
            console.error(
                "================================"
            );

            console.error(
                `Property ID "${PROPERTY_ID}" does not exist ` +
                `on contract ${CONTRACT_ADDRESS}.`
            );

            console.error();
            console.error(
                "verifyProperty() was NOT sent."
            );

            console.error();
            console.error(
                "Register the property first, then run this test again."
            );

            console.error();

            process.exit(2);
        }

        // =====================================================
        // VERIFY
        // =====================================================

        console.log();
        console.log(
            "Property exists."
        );

        console.log(
            "Sending verifyProperty..."
        );

        const txId =
            await contract
                .verifyProperty(
                    PROPERTY_ID
                )
                .send({
                    feeLimit: FEE_LIMIT
                });

        console.log();

        console.log(
            "Transaction ID:",
            txId
        );

        console.log();

        // =====================================================
        // CONFIRMATION
        // =====================================================

        console.log(
            "Waiting for confirmation..."
        );

        const txInfo =
            await waitForConfirmation(
                txId
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
            const reason =
                decodeRevertReason(
                    txInfo
                );

            console.error();

            console.error(
                "================================"
            );

            console.error(
                "VERIFY FAILED"
            );

            console.error(
                "================================"
            );

            console.error(
                "Transaction:",
                txId
            );

            console.error(
                "Receipt:",
                result
            );

            if (reason) {
                console.error(
                    "Reason:",
                    reason
                );
            }

            console.error();

            console.error(
                "Transaction info:"
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

        let afterRaw;

        try {
            afterRaw =
                await contract
                    .getProperty(PROPERTY_ID)
                    .call();
        } catch (error) {
            throw new Error(
                `Unable to read property after verification: ` +
                `${error?.message || error}`
            );
        }

        const after =
            normalizeProperty(
                afterRaw
            );

        printProperty(
            "Property AFTER",
            after
        );

        // =====================================================
        // COMPARISON
        // =====================================================

        console.log();

        console.log(
            "Property comparison:"
        );

        console.log(
            "BEFORE:",
            JSON.stringify(
                before
            )
        );

        console.log(
            "AFTER:",
            JSON.stringify(
                after
            )
        );

        // =====================================================
        // FINAL SUCCESS
        // =====================================================

        console.log();

        console.log(
            "================================"
        );

        console.log(
            "VERIFY PROPERTY SUCCESS"
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
            txId
        );

        console.log(
            "Contract:",
            CONTRACT_ADDRESS
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
            "VERIFY ERROR"
        );

        console.error(
            "================================"
        );

        if (
            error?.response?.data
        ) {
            console.error(
                JSON.stringify(
                    error.response.data,
                    null,
                    2
                )
            );
        } else {
            console.error(
                error?.message || error
            );
        }

        console.error();

        process.exit(1);
    }
}

// =========================================================
// RUN
// =========================================================

main();
