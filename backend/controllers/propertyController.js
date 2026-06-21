const { v4: uuidv4 } = require("uuid");
const {
    successResponse,
    errorResponse
} = require("../utils/responseHandler");

const properties = [];

const healthCheck = async (req, res) => {
    return successResponse(
        res,
        {
            service: "DApp TRON Backend"
        },
        "Backend is running"
    );
};

const registerProperty = async (req, res) => {
    try {
        const {
            province,
            city,
            district,
            parcelNumber,
            area,
            buildYear,
            usageType,
            constructionStatus,
            latitude,
            longitude
        } = req.body;

        if (
            !province ||
            !city ||
            !district ||
            !parcelNumber
        ) {
            return errorResponse(
                res,
                "Required fields are missing",
                400
            );
        }

        const property = {
            propertyId: uuidv4(),
            province,
            city,
            district,
            parcelNumber,
            area,
            buildYear,
            usageType,
            constructionStatus,
            latitude,
            longitude,
            status: "Pending",
            exists: true
        };

        properties.push(property);

        return successResponse(
            res,
            property,
            "Property registered successfully"
        );

    } catch (error) {

        return errorResponse(
            res,
            error.message,
            500
        );

    }
};

module.exports = {
    healthCheck,
    registerProperty
};