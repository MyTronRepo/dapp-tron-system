const mongoose = require("mongoose");


const propertySchema = new mongoose.Schema(
{
    propertyId: {
        type: String,
        required: true,
        unique: true
    },

    province: {
        type: String,
        required: true
    },

    city: {
        type: String,
        required: true
    },

    district: {
        type: String,
        required: true
    },

    parcelNumber: {
        type: String,
        required: true,
        unique: true
    },

    area: {
        type: Number,
        required: true
    },

    buildYear: {
        type: Number,
        required: true
    },

    usageType: {
        type: String,
        required: true
    },

    constructionStatus: {
        type: String,
        required: true
    },

    latitude: {
        type: Number
    },

    longitude: {
        type: Number
    },

    createdBy: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: [
            "Pending",
            "Verified",
            "Rejected",
            "Suspended"
        ],
        default: "Pending"
    },

    exists: {
        type: Boolean,
        default: true
    }

},
{
    timestamps: true
});


module.exports = mongoose.model(
    "Property",
    propertySchema
);