const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({

    documentId: {
        type: String,
        required: true,
        unique: true
    },

    propertyId: {
        type: String,
        required: true
    },

    documentName: {
        type: String,
        required: true
    },

    documentType: {
        type: String,
        required: true
    },

    // SHA256 hash of uploaded file
    fileHash: {
        type: String,
        default: ""
    },

    // IPFS CID
    documentURI: {
        type: String,
        default: ""
    },

    uploadedBy: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: [
            "Pending",
            "Verified",
            "Rejected",
            "Revoked"
        ],
        default: "Pending"
    },

    version: {
        type: Number,
        default: 1
    },

    replacedDocumentId: {
        type: String,
        default: ""
    },

    verifiedBy: {
        type: String,
        default: ""
    },

    verifiedAt: {
        type: Date,
        default: null
    },

    revokedBy: {
        type: String,
        default: ""
    },

    revokedAt: {
        type: Date,
        default: null
    }

}, {
    timestamps: true
});


module.exports = mongoose.model(
    "Document",
    documentSchema
);