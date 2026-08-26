const { v4: uuidv4 } = require("uuid");

const Property = require("../models/Property");
const Ownership = require("../models/Ownership");

const tronWeb = require("../services/tronService").tronWeb;

const {
    successResponse,
    errorResponse
} = require("../utils/responseHandler");

const {
    registerPropertyOnBlockchain,
    getPropertyFromBlockchain
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



        let blockchainTxId = null;



        try {


            blockchainTxId =
                await registerPropertyOnBlockchain({

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

                    longitude

                });


        }
        catch(error){


            console.log(
                "Blockchain registration failed:",
                error.message
            );


            return errorResponse(
                res,
                "Blockchain registration failed",
                500
            );

        }





        const property =
            await Property.create({

                propertyId,

                blockchainTxId,

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





        const owners =
            await Ownership.find({

                propertyId:
                    property.propertyId

            });





        let blockchainData = null;

        let blockchainVerified = false;




        try{


            blockchainData =
                await getPropertyFromBlockchain(

                    property.propertyId

                );


            blockchainVerified = true;


        }
        catch(error){


            console.log(

                "Blockchain read failed:",

                error.message

            );

        }





        return successResponse(

            res,

            {

                property,

                owners,

               blockchain:{

    verified:
        blockchainVerified,

    data:
        blockchainData,

    contractAddress:
        process.env.CONTRACT_ADDRESS,

    transactionHash:
        property.blockchainTxId

}

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





        await Property.updateOne(

            {

                propertyId:
                    req.params.propertyId

            },

            {

                status

            }

        );


        const updatedProperty =
    await Property.findOne({

        propertyId:
            req.params.propertyId

    });
     




        try {

    const contract =
        await tronWeb
        .contract()
        .at(process.env.CONTRACT_ADDRESS);


    if(status === "Verified"){

        await contract
        .verifyProperty(
            property.propertyId
        )
        .send({
            feeLimit:100000000
        });

    }


    if(status === "Rejected"){

        await contract
        .rejectProperty(
            property.propertyId
        )
        .send({
            feeLimit:100000000
        });

    }


    if(status === "Suspended"){

        await contract
        .suspendProperty(
            property.propertyId
        )
        .send({
            feeLimit:100000000
        });

    }


}
catch(error){

    console.log(
        "Blockchain status update failed:",
        error.message
    );

}





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
    updatedProperty,
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