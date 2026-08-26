require("dotenv").config();

const fs = require("fs");
const dns = require("dns");
const TronWeb = require("tronweb");

// =========================================================
// CONFIG
// =========================================================

const HOST = "nile.trongrid.io";
const NILE_IP = "32.189.30.242";
const NILE_URL = `https://${HOST}`;

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
// ENV
// =========================================================

if (!process.env.PRIVATE_KEY) {
    throw new Error(
        "PRIVATE_KEY missing from .env"
    );
}

// =========================================================
// TRONWEB
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

function stringify(value) {
    return JSON.stringify(
        value,
        (_, item) => {
            if (typeof item === "bigint") {
                return item.toString();
            }

            return item;
        },
        2
    );
}

function normalizeAddress(value) {
    if (!value) {
        return null;
    }

    if (typeof value === "string") {
        if (value.startsWith("T")) {
            return value;
        }

        if (
            value.startsWith("41") &&
            value.length === 42
        ) {
            try {
                return tronWeb.address.fromHex(
                    value
                );
            } catch (_) {
                return value;
            }
        }

        return value;
    }

    if (
        typeof value === "object"
    ) {
        if (value.base58) {
            return value.base58;
        }

        if (value.hex) {
            return normalizeAddress(
                value.hex
            );
        }

        if (value._hex) {
            return normalizeAddress(
                value._hex
            );
        }
    }

    return value;
}

// =========================================================
// NORMALIZE OWNERSHIP RESULT
// =========================================================

function normalizeOwner(owner, index) {
    if (owner === null || owner === undefined) {
        return {
            index,
            raw: owner
        };
    }

    // -----------------------------------------
    // Array returned by TronWeb
    // -----------------------------------------

    if (Array.isArray(owner)) {
        return {
            index,

            walletAddress:
                normalizeAddress(
                    owner[0]
                ),

            nationalIdHash:
                owner[1] ?? null,

            share:
                owner[2] !== undefined
                    ? String(owner[2])
                    : null,

            raw: owner
        };
    }

    // -----------------------------------------
    // Object returned by TronWeb
    // -----------------------------------------

    if (
        typeof owner === "object"
    ) {
        const wallet =
            owner.walletAddress ??
            owner.ownerAddress ??
            owner.owner ??
            owner.account ??
            owner.address ??
            owner[0];

        const nationalIdHash =
            owner.nationalIdHash ??
            owner.nationalIDHash ??
            owner.nationalId ??
            owner[1];

        const share =
            owner.share ??
            owner[2];

        return {
            index,

            walletAddress:
                normalizeAddress(
                    wallet
                ),

            nationalIdHash:
                nationalIdHash ?? null,

            share:
                share !== undefined &&
                share !== null
                    ? String(share)
                    : null,

            raw: owner
        };
    }

    return {
        index,
        raw: owner
    };
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
            "READ OWNERSHIP TEST"
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

        console.log(
            "Wallet:",
            tronWeb.defaultAddress.base58
        );

        console.log(
            "Forced IPv4:",
            NILE_IP
        );

        console.log();

        // =====================================================
        // LOAD ABI
        // =====================================================

        console.log(
            "Loading ABI..."
        );

        const abi =
            JSON.parse(
                fs.readFileSync(
                    "contract-abi.json",
                    "utf8"
                )
            );

        console.log(
            "ABI loaded."
        );

        // =====================================================
        // CHECK NILE
        // =====================================================

        console.log();
        console.log(
            "Checking Nile..."
        );

        const block =
            await tronWeb.trx.getCurrentBlock();

        console.log(
            "Nile block:",
            block
                .block_header
                .raw_data
                .number
        );

        // =====================================================
        // LOAD CONTRACT
        // =====================================================

        console.log();
        console.log(
            "Loading contract..."
        );

        const contract =
            await tronWeb.contract(
                abi,
                CONTRACT
            );

        console.log(
            "Contract loaded."
        );

        // =====================================================
        // READ PROPERTY
        // =====================================================

        console.log();
        console.log(
            "Reading property..."
        );

        let property;

        try {
            property =
                await contract
                    .getProperty(
                        PROPERTY_ID
                    )
                    .call();
        } catch (error) {
            console.log(
                "getProperty() failed:"
            );

            console.log(
                error?.message ||
                error
            );
        }

        console.log();
        console.log(
            "Property:"
        );

        console.log(
            stringify(property)
        );

        // =====================================================
        // READ OWNERS
        // =====================================================

        console.log();
        console.log(
            "Reading getOwners()..."
        );

        const rawOwners =
            await contract
                .getOwners(
                    PROPERTY_ID
                )
                .call();

        // =====================================================
        // RAW RESULT
        // =====================================================

        console.log();
        console.log(
            "Raw getOwners() result:"
        );

        console.log(
            stringify(rawOwners)
        );

        // =====================================================
        // NORMALIZED RESULT
        // =====================================================

        let owners;

        if (Array.isArray(rawOwners)) {
            owners =
                rawOwners.map(
                    (owner, index) =>
                        normalizeOwner(
                            owner,
                            index
                        )
                );
        } else {
            owners = [
                normalizeOwner(
                    rawOwners,
                    0
                )
            ];
        }

        console.log();
        console.log(
            "Normalized owners:"
        );

        console.log(
            stringify(owners)
        );

        // =====================================================
        // ANALYZE SHARE
        // =====================================================

        let totalShare = 0;

        for (
            const owner of owners
        ) {
            const share =
                Number(
                    owner.share
                );

            if (
                Number.isFinite(
                    share
                )
            ) {
                totalShare += share;
            }
        }

        console.log();
        console.log(
            "================================"
        );

        console.log(
            "OWNERSHIP SUMMARY"
        );

        console.log(
            "================================"
        );

        console.log(
            "Owner entries:",
            owners.length
        );

        console.log(
            "Total share:",
            totalShare
        );

        console.log(
            "Remaining share:",
            100 - totalShare
        );

        // =====================================================
        // SEARCH FOR OWNER 2
        // =====================================================

        const owner2PrivateKey =
            process.env.OWNER2_PRIVATE_KEY;

        if (
            owner2PrivateKey &&
            owner2PrivateKey !==
                "کلید_خصوصی_والت_دوم" &&
            owner2PrivateKey !==
                "YOUR_OWNER2_PRIVATE_KEY"
        ) {
            try {
                const owner2TronWeb =
                    new TronWeb(
                        NILE_URL,
                        NILE_URL,
                        NILE_URL,
                        owner2PrivateKey
                    );

                const owner2Address =
                    owner2TronWeb
                        .defaultAddress
                        .base58;

                console.log();
                console.log(
                    "Owner 2 address:"
                );

                console.log(
                    owner2Address
                );

                const foundOwner2 =
                    owners.find(
                        owner =>
                            owner.walletAddress ===
                            owner2Address
                    );

                console.log();
                console.log(
                    "Owner 2 found:"
                );

                console.log(
                    foundOwner2
                        ? "YES"
                        : "NO"
                );

                if (foundOwner2) {
                    console.log(
                        "Owner 2 share:",
                        foundOwner2.share
                    );
                }
            } catch (error) {
                console.log();
                console.log(
                    "Owner 2 check skipped:"
                );

                console.log(
                    error?.message ||
                    error
                );
            }
        } else {
            console.log();
            console.log(
                "OWNER2_PRIVATE_KEY not configured."
            );
        }

        // =====================================================
        // FINAL
        // =====================================================

        console.log();
        console.log(
            "================================"
        );
        console.log(
            "READ OWNERSHIP COMPLETE"
        );
        console.log(
            "================================"
        );

        console.log(
            "Property ID:",
            PROPERTY_ID
        );

        console.log(
            "Contract:",
            CONTRACT
        );

        console.log(
            "Total share:",
            totalShare
        );

        console.log();

    } catch (error) {
        console.error();
        console.error(
            "================================"
        );
        console.error(
            "READ OWNERSHIP ERROR"
        );
        console.error(
            "================================"
        );

        console.error(
            error?.response?.data ||
            error?.message ||
            error
        );

        console.error();

        process.exit(1);
    }
}

main();