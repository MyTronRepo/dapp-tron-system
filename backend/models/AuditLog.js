const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({

    logId: {
        type: String,
        required: true,
        unique: true
    },

    action: {
        type: String,
        required: true
    },

    entity: {
        type: String,
        required: true
    },

    entityId: {
        type: String,
        required: true
    },

    performedBy: {
        type: String,
        required: true
    },

    role: {
        type: String,
        default: ""
    },

    ipAddress: {
        type: String,
        default: ""
    },

    details: {
        type: Object,
        default: {}
    }

}, {

    timestamps: true

});

module.exports =
    mongoose.model(
        "AuditLog",
        auditLogSchema
    );