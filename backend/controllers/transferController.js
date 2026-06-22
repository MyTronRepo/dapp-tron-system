const { v4: uuidv4 } = require("uuid");

const Transfer =
    require("../models/Transfer");

const Property =
    require("../models/Property");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHandler");

const createTransferRequest = async (
    req,
    res
) => {

    try {

        const {
            propertyId,
            seller,
            buyer,
            transferredShare
        } = req.body;

        if (
            !propertyId ||
            !seller ||
            !buyer ||
            !transferredShare
        ) {

            return errorResponse(
                res,
                "Required fields are missing",
                400
            );

        }

        if (
            Number(transferredShare) < 1
        ) {

            return errorResponse(
                res,
                "Minimum transferable share is 1 percent",
                400
            );

        }

        const transfer =
            await Transfer.create({

                transferId: uuidv4(),

                propertyId,

                seller,

                buyer,

                transferredShare,

                buyerApproved: false,

                adminApproved: false,

                timestamp: Date.now(),

                expireAt:
                    Date.now() +
                    (7 * 24 * 60 * 60 * 1000),

                status: "PendingBuyer"

            });

        return successResponse(
            res,
            transfer,
            "Transfer request created successfully"
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

const getAllTransfers = async (
    req,
    res
) => {

    try {

        const transfers =
            await Transfer.find();

        return successResponse(
            res,
            transfers,
            "Transfers fetched successfully"
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

const getTransferHistory = async (
    req,
    res
) => {

    try {

        const history =
            await Transfer.find({
                status: "Approved"
            });

        return successResponse(
            res,
            history,
            "Transfer history fetched successfully"
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

const approveTransferByBuyer = async (
    req,
    res
) => {

    try {

        const {
            transferId
        } = req.params;

        const transfer =
            await Transfer.findOne({
                transferId
            });

        if (!transfer) {

            return errorResponse(
                res,
                "Transfer not found",
                404
            );

        }

        if (
            transfer.status !==
            "PendingBuyer"
        ) {

            return errorResponse(
                res,
                "Transfer cannot be approved by buyer",
                400
            );

        }

        transfer.buyerApproved = true;

        transfer.status =
            "PendingAdmin";

        await transfer.save();

        return successResponse(
            res,
            transfer,
            "Transfer approved by buyer"
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

const approveTransferByAdmin = async (
    req,
    res
) => {

    try {

        const {
            transferId
        } = req.params;

        const transfer =
            await Transfer.findOne({
                transferId
            });

        if (!transfer) {

            return errorResponse(
                res,
                "Transfer not found",
                404
            );

        }

        if (
            transfer.status !==
            "PendingAdmin"
        ) {

            return errorResponse(
                res,
                "Transfer must be approved by buyer first",
                400
            );

        }

        const property =
            await Property.findOne({
                propertyId:
                    transfer.propertyId
            });

        if (!property) {

            return errorResponse(
                res,
                "Property not found",
                404
            );

        }

        const seller =
            property.owners.find(
                owner =>
                    owner.walletAddress ===
                    transfer.seller
            );

        if (!seller) {

            return errorResponse(
                res,
                "Seller not found",
                404
            );

        }

        if (
            seller.share <
            transfer.transferredShare
        ) {

            return errorResponse(
                res,
                "Seller share is insufficient",
                400
            );

        }

        seller.share -=
            Number(
                transfer.transferredShare
            );

        let buyer =
            property.owners.find(
                owner =>
                    owner.walletAddress ===
                    transfer.buyer
            );

        if (buyer) {

            buyer.share +=
                Number(
                    transfer.transferredShare
                );

        } else {

            property.owners.push({

                walletAddress:
                    transfer.buyer,

                nationalIdHash:
                    "NEW_OWNER",

                share:
                    Number(
                        transfer.transferredShare
                    )

            });

        }

        await property.save();

        transfer.adminApproved = true;

        transfer.status = "Approved";

        await transfer.save();

        return successResponse(
            res,
            {
                transfer,
                owners:
                    property.owners
            },
            "Transfer approved by admin"
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

    createTransferRequest,

    getAllTransfers,

    getTransferHistory,

    approveTransferByBuyer,

    approveTransferByAdmin

};