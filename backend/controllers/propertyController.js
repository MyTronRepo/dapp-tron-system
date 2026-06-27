const { v4: uuidv4 } = require("uuid");

const Property = require("../models/Property");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHandler");

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

            longitude,

            owners

        } = req.body;

        if (
            !province ||
            !city ||
            !district ||
            !parcelNumber
        ) {

            return errorResponse(
                res,
                "Required property fields are missing",
                400
            );

        }

        if (
            !owners ||
            !Array.isArray(owners) ||
            owners.length === 0
        ) {

            return errorResponse(
                res,
                "At least one owner is required",
                400
            );

        }

        let totalShare = 0;

        for (const owner of owners) {

            if (
                !owner.walletAddress ||
                !owner.nationalIdHash ||
                owner.share === undefined
            ) {

                return errorResponse(
                    res,
                    "Invalid owner information",
                    400
                );

            }

            totalShare += Number(owner.share);

        }

        if (totalShare !== 100) {

            return errorResponse(
                res,
                "Total ownership share must equal 100",
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

const searchProperties = async (req, res) => {

    try {

        const {

            province,

            city,

            district,

            usageType,

            status

        } = req.query;

        const filter = {};

        if (province) filter.province = province;

        if (city) filter.city = city;

        if (district) filter.district = district;

        if (usageType) filter.usageType = usageType;

        if (status) filter.status = status;

        const properties = await Property.find(filter);

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

module.exports = {

    healthCheck,

    registerProperty,

    searchProperties

};