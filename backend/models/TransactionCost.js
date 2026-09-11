const mongoose = require("mongoose");

const transactionCostSchema = new mongoose.Schema(
    {
        txid: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        operation: {
            type: String,
            required: true
        },

        energyUsed: {
            type: Number,
            default: 0
        },

        energyFee: {
            type: Number,
            default: 0
        },

        bandwidthUsed: {
            type: Number,
            default: 0
        },

        bandwidthFee: {
            type: Number,
            default: 0
        },

        totalFee: {
            type: Number,
            default: 0
        },

        totalTRX: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "TransactionCost",
    transactionCostSchema
);