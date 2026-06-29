const { v4: uuidv4 } = require("uuid");

const Transfer =
    require("../models/Transfer");

const Property =
    require("../models/Property");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHandler");

const {
    createAuditLog
} = require("../utils/auditLogger");

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

        // Prevent self transfer
        if (seller === buyer) {

            return errorResponse(
                res,
                "Seller and buyer cannot be the same",
                400
            );

        }

        // Prevent self transfer
        if (seller === buyer) {

            return errorResponse(
                res,
                "Seller and buyer cannot be the same",
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

        const sellerOwner =
            property.owners.find(
                owner =>
                    owner.walletAddress === seller
            );

        if (!sellerOwner) {

            return errorResponse(
                res,
                "Seller is not an owner of this property",
                400
            );

        }

        if (
            sellerOwner.share <
            Number(transferredShare)
        ) {

            return errorResponse(
                res,
                "Seller ownership share is insufficient",
                400
            );

        }

        const existingTransfer = await Transfer.findOne({

    propertyId,

    seller,

    buyer,

    status: {

        $in: [

            "PendingBuyer",

            "PendingAdmin"

        ]

    }

});

if (existingTransfer) {

    return errorResponse(

        res,

        "There is already an active transfer request between these users",

        409

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

                blockchainTxId: "",

                completed: false,

                timestamp: Date.now(),

                expireAt:
                    Date.now() +
                    (7 * 24 * 60 * 60 * 1000),

                status: "PendingBuyer"

            });

            await createAuditLog({

    action: "CREATE_TRANSFER_REQUEST",

    entity: "Transfer",

    entityId: transfer.transferId,

    performedBy: seller,

    role: "Owner",

    ipAddress: req.ip,

    details: {

        propertyId,

        buyer,

        transferredShare

    }

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

        const {

            propertyId,

            seller,

            buyer,

            status,

            completed

        } = req.query;

        const query = {};

        if (propertyId)
            query.propertyId = propertyId;

        if (seller)
            query.seller = seller;

        if (buyer)
            query.buyer = buyer;

        if (status)
            query.status = status;

        if (completed !== undefined)
            query.completed = completed === "true";

        const transfers =
            await Transfer.find(query);

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

        if (Date.now() > transfer.expireAt) {

     transfer.status = "Expired";

    await transfer.save();

    return errorResponse(
        res,
        "Transfer request has expired",
        400
    );

}

        transfer.buyerApproved = true;

        transfer.status =
            "PendingAdmin";

        await transfer.save();

        await createAuditLog({

    action: "BUYER_APPROVED_TRANSFER",

    entity: "Transfer",

    entityId: transfer.transferId,

    performedBy: transfer.buyer,

    role: "Buyer",

    ipAddress: req.ip,

    details: {

        propertyId:
            transfer.propertyId

    }

});

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

        if (Date.now() > transfer.expireAt) {

    transfer.status = "Expired";

    await transfer.save();

    return errorResponse(
        res,
        "Transfer request has expired",
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

        if (seller.share === 0) {

            property.owners =
                property.owners.filter(

                    owner =>

                        owner.walletAddress !==

                        transfer.seller

                );

        }

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

        await createAuditLog({

    action: "ADMIN_APPROVED_TRANSFER",

    entity: "Transfer",

    entityId: transfer.transferId,

    performedBy:
        req.user?.walletAddress || "Admin",

    role:
        req.user?.role || "Admin",

    ipAddress: req.ip,

    details: {

        propertyId:
            transfer.propertyId,

        seller:
            transfer.seller,

        buyer:
            transfer.buyer,

        transferredShare:
            transfer.transferredShare

    }

});

        transfer.adminApproved = true;

        transfer.completed = true;

        transfer.blockchainTxId = "";

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