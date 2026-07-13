const { v4: uuidv4 } = require("uuid");

const Property = require("../models/Property");
const Ownership = require("../models/Ownership");

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


        const totalShare = owners.reduce(
            (sum, owner) =>
                sum + Number(owner.share),
            0
        );


        if (totalShare !== 100) {

            return errorResponse(
                res,
                "Total ownership share must equal 100",
                400
            );

        }


        const exists =
            await Property.findOne({
                parcelNumber
            });


        if (exists) {

            return errorResponse(
                res,
                "Property already exists",
                409
            );

        }



        const propertyId = uuidv4();



        const property =
            await Property.create({

                propertyId,

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

                createdBy:
                    req.user.walletAddress,

                status:
                    "Pending"

            });



        await Ownership.insertMany(

            owners.map(owner => ({

                propertyId,

                walletAddress:
                    owner.walletAddress,

                nationalIdHash:
                    owner.nationalIdHash,

                share:
                    owner.share

            }))

        );



        try {

            await registerPropertyOnBlockchain(
                propertyId
            );

        }
        catch(error){

            console.log(
                "Blockchain skipped:",
                error.message
            );

        }



        await createAuditLog({

            action:
                "REGISTER_PROPERTY",

            entity:
                "Property",

            entityId:
                propertyId,

            performedBy:
                req.user.walletAddress,

            role:
                req.user.role,

            ipAddress:
                req.ip,

            details:{
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
    catch(error){

        return errorResponse(
            res,
            error.message,
            500
        );

    }

};



// GET PROPERTY

const getPropertyById = async(req,res)=>{

    try{

        const property =
            await Property.findOne({
                propertyId:req.params.propertyId
            });


        if(!property){

            return errorResponse(
                res,
                "Property not found",
                404
            );

        }


        const owners =
            await Ownership.find({
                propertyId:
                    property.propertyId
            });


        return successResponse(
            res,
            {
                property,
                owners
            },
            "Property fetched successfully"
        );


    }
    catch(error){

        return errorResponse(
            res,
            error.message,
            500
        );

    }

};



// SEARCH

const searchProperties = async(req,res)=>{

    try{

        const properties =
            await Property.find(req.query)
            .sort({
                createdAt:-1
            });


        return successResponse(
            res,
            properties,
            "Properties fetched successfully"
        );


    }
    catch(error){

        return errorResponse(
            res,
            error.message,
            500
        );

    }

};



// VERIFY / REJECT PROPERTY

const updatePropertyStatus = async(req,res)=>{

    try{

        const {
            status
        } = req.body;


        const allowed = [
            "Verified",
            "Rejected",
            "Suspended"
        ];


        if(!allowed.includes(status)){

            return errorResponse(
                res,
                "Invalid status",
                400
            );

        }


        const property =
            await Property.findOne({
                propertyId:
                    req.params.propertyId
            });


        if(!property){

            return errorResponse(
                res,
                "Property not found",
                404
            );

        }


        property.status = status;

        await property.save();



        await createAuditLog({

            action:
                "UPDATE_PROPERTY_STATUS",

            entity:
                "Property",

            entityId:
                property.propertyId,

            performedBy:
                req.user.walletAddress,

            role:
                req.user.role,

            ipAddress:
                req.ip,

            details:{
                status
            }

        });



        return successResponse(
            res,
            property,
            "Property status updated"
        );


    }
    catch(error){

        return errorResponse(
            res,
            error.message,
            500
        );

    }

};



module.exports = {

    registerProperty,

    getPropertyById,

    searchProperties,

    updatePropertyStatus

};