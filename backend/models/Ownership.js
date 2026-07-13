const mongoose = require("mongoose");


const ownershipSchema = new mongoose.Schema(
{

    propertyId: {
        type: String,
        required: true
    },

    walletAddress: {
        type: String,
        required: true
    },

    nationalIdHash: {
        type: String,
        required: true
    },

    share: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    }

},
{
    timestamps: true
});


module.exports = mongoose.model(
    "Ownership",
    ownershipSchema
);