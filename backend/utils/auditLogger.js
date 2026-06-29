const { v4: uuidv4 } = require("uuid");

const AuditLog =
    require("../models/AuditLog");

const createAuditLog = async ({

    action,

    entity,

    entityId,

    performedBy,

    role,

    ipAddress,

    details = {}

}) => {

    try {

        await AuditLog.create({

            logId: uuidv4(),

            action,

            entity,

            entityId,

            performedBy,

            role,

            ipAddress,

            details

        });

    }

    catch (error) {

        console.log(
            "Audit Log Error:",
            error.message
        );

    }

};

module.exports = {

    createAuditLog

};