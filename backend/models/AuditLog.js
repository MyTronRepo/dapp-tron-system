const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({

    action: {
        type: String,
        required: true
    },

    performedBy: {
        type: String,
        required: true
    },

    targetId: {
        type: String,
        default: ""
    },

    targetType: {
        type: String,
        default: ""
    },

    description: {
        type: String,
        default: ""
    }

}, {

    timestamps: true

});

module.exports =
    mongoose.model(
        "AuditLog",
        auditLogSchema
    );