const AuditLog =
    require("../models/AuditLog");

const createAuditLog = async (

    action,

    performedBy,

    targetId,

    targetType,

    description

) => {

    return await AuditLog.create({

        action,

        performedBy,

        targetId,

        targetType,

        description

    });

};

module.exports = {

    createAuditLog

};