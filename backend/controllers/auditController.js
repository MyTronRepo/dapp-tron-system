const AuditLog =
    require("../models/AuditLog");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHandler");

// Get All Logs
const getAllLogs = async (req, res) => {

    try {

        const logs =
            await AuditLog.find()
                .sort({
                    createdAt: -1
                });

        return successResponse(
            res,
            logs,
            "Audit logs fetched successfully"
        );

    }

    catch (error) {

        return errorResponse(
            res,
            error.message,
            500
        );

    }

};

// Search Logs
const searchLogs = async (req, res) => {

    try {

        const {

            action,

            entity,

            performedBy

        } = req.query;

        const query = {};

        if (action)
            query.action = action;

        if (entity)
            query.entity = entity;

        if (performedBy)
            query.performedBy = performedBy;

        const logs =
            await AuditLog.find(query)
                .sort({
                    createdAt: -1
                });

        return successResponse(
            res,
            logs,
            "Audit logs fetched successfully"
        );

    }

    catch (error) {

        return errorResponse(
            res,
            error.message,
            500
        );

    }

};

module.exports = {

    getAllLogs,

    searchLogs

};