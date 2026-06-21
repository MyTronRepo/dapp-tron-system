const { successResponse } = require("../utils/responseHandler");

const healthCheck = async (req, res) => {
    return successResponse(
        res,
        {
            service: "DApp TRON Backend"
        },
        "Backend is running"
    );
};

module.exports = {
    healthCheck
};