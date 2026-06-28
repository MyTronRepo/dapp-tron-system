const { v4: uuidv4 } = require("uuid");

const Property = require("../models/Property");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHandler");

const {
    registerPropertyOnBlockchain
} = require("../services/tronService");

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

                await registerPropertyOnBlockchain(
                    property.propertyId,
                    owners[0].walletAddress
                );

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
            await Property.find(query);

        return successResponse(
            res,
            properties,
            "Properties fetched successfully"
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