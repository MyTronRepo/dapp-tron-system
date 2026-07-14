const { v4: uuidv4 } = require("uuid");

const Transfer = require("../models/Transfer");
const Ownership = require("../models/Ownership");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHandler");

const {
    createAuditLog
} = require("../utils/auditLogger");


// =========================
// Create Transfer Request
// =========================

const createTransferRequest = async (req, res) => {

    try {

        const {
            propertyId,
            buyer,
            transferredShare
        } = req.body;


        const seller =
            req.user.walletAddress;


        if (
            !propertyId ||
            !buyer ||
            !transferredShare
        ) {

            return errorResponse(
                res,
                "Required fields are missing",
                400
            );

        }


        if (seller === buyer) {

            return errorResponse(
                res,
                "Seller and buyer cannot be the same",
                400
            );

        }


        if (Number(transferredShare) < 1) {

            return errorResponse(
                res,
                "Minimum transferable share is 1 percent",
                400
            );

        }


        const sellerOwnership =
            await Ownership.findOne({

                propertyId,

                walletAddress: seller

            });


        if (!sellerOwnership) {

            return errorResponse(
                res,
                "Seller is not an owner of this property",
                400
            );

        }


        if (
            sellerOwnership.share <
            Number(transferredShare)
        ) {

            return errorResponse(
                res,
                "Seller ownership share is insufficient",
                400
            );

        }


        const existingTransfer =
            await Transfer.findOne({

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
                "Active transfer already exists",
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

            action:
                "CREATE_TRANSFER_REQUEST",

            entity:
                "Transfer",

            entityId:
                transfer.transferId,

            performedBy:
                seller,

            role:
                "Owner",

            ipAddress:
                req.ip,

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
    catch(error) {

        return errorResponse(
            res,
            error.message,
            500
        );

    }

};



// =========================
// Get Transfers
// =========================

const getAllTransfers = async (req, res) => {

    try {

        const {
            propertyId,
            seller,
            buyer,
            status,
            completed
        } = req.query;


        const query = {};


        if(propertyId)
            query.propertyId = propertyId;


        if(seller)
            query.seller = seller;


        if(buyer)
            query.buyer = buyer;


        if(status)
            query.status = status;


        if(completed !== undefined)
            query.completed =
                completed === "true";


        const transfers =
            await Transfer.find(query);


        return successResponse(
            res,
            transfers,
            "Transfers fetched successfully"
        );


    }
    catch(error) {

        return errorResponse(
            res,
            error.message,
            500
        );

    }

};



// =========================
// Transfer History
// =========================

const getTransferHistory = async (req,res)=>{

    try {

        const history =
            await Transfer.find({

                status:"Completed"

            });


        return successResponse(
            res,
            history,
            "Transfer history fetched successfully"
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



// =========================
// Buyer Approve
// =========================

const approveTransferByBuyer = async(req,res)=>{

    try {

        const transfer =
            await Transfer.findOne({

                transferId:
                    req.params.transferId

            });


        if(!transfer){

            return errorResponse(
                res,
                "Transfer not found",
                404
            );

        }


        if(transfer.status !== "PendingBuyer"){

            return errorResponse(
                res,
                "Transfer cannot be approved",
                400
            );

        }


        if(Date.now() > transfer.expireAt){

            transfer.status="Expired";

            await transfer.save();


            return errorResponse(
                res,
                "Transfer request expired",
                400
            );

        }


        transfer.buyerApproved=true;

        transfer.status="PendingAdmin";


        await transfer.save();


        await createAuditLog({

            action:
                "BUYER_APPROVED_TRANSFER",

            entity:
                "Transfer",

            entityId:
                transfer.transferId,

            performedBy:
                transfer.buyer,

            role:
                "Buyer",

            ipAddress:
                req.ip

        });


        return successResponse(
            res,
            transfer,
            "Transfer approved by buyer"
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



// =========================
// Admin Approve
// =========================

const approveTransferByAdmin = async(req,res)=>{

    try {

        const transfer =
            await Transfer.findOne({

                transferId:
                    req.params.transferId

            });


        if(!transfer){

            return errorResponse(
                res,
                "Transfer not found",
                404
            );

        }


        if(transfer.status !== "PendingAdmin"){

            return errorResponse(
                res,
                "Buyer approval required first",
                400
            );

        }


        if(Date.now() > transfer.expireAt){

            transfer.status="Expired";

            await transfer.save();


            return errorResponse(
                res,
                "Transfer request expired",
                400
            );

        }



        const sellerOwnership =
            await Ownership.findOne({

                propertyId:
                    transfer.propertyId,

                walletAddress:
                    transfer.seller

            });



        if(!sellerOwnership){

            return errorResponse(
                res,
                "Seller ownership not found",
                404
            );

        }



        if(
            sellerOwnership.share <
            transfer.transferredShare
        ){

            return errorResponse(
                res,
                "Insufficient ownership share",
                400
            );

        }



        sellerOwnership.share -=
            Number(
                transfer.transferredShare
            );



        if(sellerOwnership.share === 0){

            await Ownership.deleteOne({

                _id:
                    sellerOwnership._id

            });

        }
        else {

            await sellerOwnership.save();

        }



        let buyerOwnership =
            await Ownership.findOne({

                propertyId:
                    transfer.propertyId,

                walletAddress:
                    transfer.buyer

            });



        if(buyerOwnership){

            buyerOwnership.share +=
                Number(
                    transfer.transferredShare
                );

            await buyerOwnership.save();

        }
        else {

            await Ownership.create({

                propertyId:
                    transfer.propertyId,

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



        transfer.adminApproved=true;

        transfer.completed=true;

        transfer.status="Completed";


        await transfer.save();



        await createAuditLog({

            action:
                "ADMIN_APPROVED_TRANSFER",

            entity:
                "Transfer",

            entityId:
                transfer.transferId,

            performedBy:
                req.user.walletAddress,

            role:
                "Admin",

            ipAddress:
                req.ip,

            details:{

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



        return successResponse(
            res,
            transfer,
            "Transfer approved by admin"
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

    createTransferRequest,

    getAllTransfers,

    getTransferHistory,

    approveTransferByBuyer,

    approveTransferByAdmin

};