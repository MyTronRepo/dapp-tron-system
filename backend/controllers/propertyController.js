const { v4: uuidv4 } = require("uuid");

const Property = require("../models/Property");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHandler");

const {
    registerPropertyOnBlockchain
} = require("../services/tronService");

const {
    createAuditLog
} = require("../utils/auditLogger");

const {

    isValidTronAddress,

    isValidLatitude,

    isValidLongitude,

    isValidBuildYear

} = require("../utils/validators");

// HEALTH CHECK
const healthCheck = async (req, res) => {
    return res.json({
        success: true,
        message: "Property service is running"
    });
};

// REGISTER PROPERTY
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
            longitude,
            owners
        } = req.body;

        if (!owners || !Array.isArray(owners) || owners.length === 0) {

            return errorResponse(
                res,
                "Owners are required",
                400
            );

        }

        if (!isValidBuildYear(buildYear)) {

    return errorResponse(
        res,
        "Invalid build year",
        400
    );

}

if (!isValidLatitude(Number(latitude))) {

    return errorResponse(
        res,
        "Invalid latitude",
        400
    );

}

if (!isValidLongitude(Number(longitude))) {

    return errorResponse(
        res,
        "Invalid longitude",
        400
    );

}

for (const owner of owners) {

    if (!isValidTronAddress(owner.walletAddress)) {

        return errorResponse(
            res,
            `Invalid wallet address: ${owner.walletAddress}`,
            400
        );

    }

    if (owner.share <= 0) {

        return errorResponse(
            res,
            "Owner share must be greater than zero",
            400
        );

    }

}

        const totalShare =
            owners.reduce(
                (sum, owner) =>
                    sum + Number(owner.share),
                0
            );

        if (totalShare !== 100) {

            return errorResponse(
                res,
                "Total ownership share must equal 100 percent",
                400
            );

        }

        const existingProperty =
            await Property.findOne({
                parcelNumber
            });

        if (existingProperty) {

            return errorResponse(
                res,
                "Property already exists",
                409
            );

        }

        const property = await Property.create({

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
            owners,

            status: "Pending",

            exists: true

        });

        try {

            if (owners?.[0]?.walletAddress) {

                const txId =
                    await registerPropertyOnBlockchain(
                        property.propertyId,
                        owners[0].walletAddress
                    );

                console.log("Blockchain TX:", txId);

            }

        } catch (err) {

            console.log("Blockchain Error:", err.message);

        }

        return successResponse(
            res,
            property,
            "Property registered successfully"
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

// SEARCH PROPERTIES
const searchProperties = async (req, res) => {

    try {

        const {
            province,
            city,
            district,
            usageType,
            status,
            ownerWalletAddress
        } = req.query;

        const query = {};

        if (province)
            query.province = province;

        if (city)
            query.city = city;

        if (district)
            query.district = district;

        if (usageType)
            query.usageType = usageType;

        if (status)
            query.status = status;

        if (ownerWalletAddress) {

            query.owners = {
                $elemMatch: {
                    walletAddress: ownerWalletAddress
                }
            };

        }

        const properties =
    await Property.find(query)
        .sort({
            createdAt: -1
        });

return successResponse(
    res,
    properties,
    "Properties fetched successfully"
);

await createAuditLog({

    action: "REGISTER_PROPERTY",

    entity: "Property",

    entityId: property.propertyId,

    performedBy:
        owners[0].walletAddress,

    role: "Owner",

    ipAddress: req.ip,

    details: {

        parcelNumber,

        city,

        province

    }

});

return successResponse(

    res,

    property,

    "Property registered successfully"

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

// GET PROPERTY
const getPropertyById = async (req, res) => {

    try {

        const { propertyId } = req.params;

        const property =
            await Property.findOne({
                propertyId
            });

        if (!property) {

            return errorResponse(
                res,
                "Property not found",
                404
            );

        }

        return successResponse(
            res,
            property,
            "Property fetched successfully"
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

// UPDATE STATUS
const updatePropertyStatus = async (req, res) => {

    try {

        const { propertyId } = req.params;

        const { status } = req.body;

        const allowedStatus = [
    "Pending",
    "Verified",
    "Rejected"
];

if (!allowedStatus.includes(status)) {

    return errorResponse(
        res,
        "Invalid property status",
        400
    );

}

        const property =
            await Property.findOne({
                propertyId
            });

        if (!property) {

            return errorResponse(
                res,
                "Property not found",
                404
            );

        }

        property.status = status;

        await property.save();

        await createAuditLog({

    action: "UPDATE_PROPERTY_STATUS",

    entity: "Property",

    entityId: property.propertyId,

    performedBy:
        req.user?.walletAddress || "System",

    role:
        req.user?.role || "System",

    ipAddress: req.ip,

    details: {

        status

    }

});

        return successResponse(
            res,
            property,
            "Property status updated successfully"
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

    healthCheck,

    registerProperty,

    searchProperties,

    getPropertyById,

    updatePropertyStatus

};