const Ownership = require("../models/Ownership");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHandler");



// GET OWNERSHIP BY WALLET

const getOwnershipByWallet = async (req, res) => {

    try {

        const {
            walletAddress
        } = req.params;


        const ownerships =
            await Ownership.find({
                walletAddress
            });


        return successResponse(
            res,
            ownerships,
            "Ownership fetched successfully"
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





// GET OWNERSHIP BY PROPERTY

const getOwnershipByProperty = async (req, res) => {

    try {

        const {
            propertyId
        } = req.params;


        const ownerships =
            await Ownership.find({
                propertyId
            });


        return successResponse(
            res,
            ownerships,
            "Ownership fetched successfully"
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

    getOwnershipByWallet,

    getOwnershipByProperty

};