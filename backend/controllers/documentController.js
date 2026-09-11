const { v4: uuidv4 } = require("uuid");

const Document = require("../models/Document");
const Property = require("../models/Property");
const TransactionCost = require("../models/TransactionCost");

const {
    registerDocumentOnBlockchain,
    verifyDocumentOnBlockchain,
    replaceDocumentOnBlockchain,
    getDocumentsFromBlockchain,
    revokeDocumentOnBlockchain,
    getTransactionCost
} = require("../services/tronService");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHandler");

const {
    uploadToIPFS
} = require("../services/ipfsService");

const {
    generateFileHash
} = require("../utils/fileHash");

const fs = require("fs");
const path = require("path");

const {
    createAuditLog
} = require("../utils/auditLogger");


const saveTransactionCost = async (
    txid,
    operation
) => {
    const cost =
        await getTransactionCost(txid);

    console.log(
        "TRANSACTION COST BEFORE MONGO:",
        cost
    );

    return await TransactionCost.findOneAndUpdate(
        { txid: cost.txid },
        {
            txid: cost.txid,
            operation,
            energyUsed: cost.energyUsed,
            energyFee: cost.energyFee,
            bandwidthUsed: cost.bandwidthUsed,
            bandwidthFee: cost.bandwidthFee,
            totalFee: cost.totalFee,
            totalTRX: cost.totalTRX
        },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        }
    );
};

// REGISTER DOCUMENT
const registerDocument = async (req, res) => {

    try {

        const {
            propertyId,
            documentName,
            documentType,
            uploadedBy
        } = req.body;


        if (
            !propertyId ||
            !documentName ||
            !documentType ||
            !uploadedBy
        ) {

            return errorResponse(
                res,
                "Required fields are missing",
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


        const document =
            await Document.create({

                documentId: uuidv4(),

                propertyId,

                documentName,

                documentType,

                uploadedBy

            });


        await createAuditLog({

            action: "REGISTER_DOCUMENT",

            entity: "Document",

            entityId: document.documentId,

            performedBy: uploadedBy,

            role: "Owner",

            ipAddress: req.ip,

            details: {
                propertyId,
                documentName,
                documentType
            }

        });


        return successResponse(
            res,
            document,
            "Document registered successfully"
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



// GET DOCUMENTS
const getDocumentsByProperty = async (req, res) => {

    try {

        const {
            propertyId,
            verified,
            documentType,
            uploadedBy
        } = req.query;


        const query = {};


        if (propertyId)
            query.propertyId = propertyId;


        if (documentType)
            query.documentType = documentType;


        if (uploadedBy)
            query.uploadedBy = uploadedBy;


        const documents =
            await Document.find(query)
                .sort({
                    createdAt: -1
                });


        return successResponse(
            res,
            documents,
            "Documents fetched successfully"
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



// GET DOCUMENT BY ID
const getDocumentById = async (req,res)=>{

    try {

        const {
            documentId
        } = req.params;


        const document =
            await Document.findOne({
                documentId
            });


        if(!document){

            return errorResponse(
                res,
                "Document not found",
                404
            );

        }


        return successResponse(
            res,
            document,
            "Document fetched successfully"
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



// VERIFY DOCUMENT
const verifyDocument = async(req,res)=>{

    try{

        const {
            documentId
        } = req.params;


        const document =
            await Document.findOne({
                documentId
            });


        if(!document){

            return errorResponse(
                res,
                "Document not found",
                404
            );

        }


        if (document.status === "Revoked") {

            return errorResponse(
                res,
                "Document has been revoked and cannot be verified",
                400
            );

        }


        /*
        |--------------------------------------------------------------------------
        | VERIFY ON BLOCKCHAIN
        |--------------------------------------------------------------------------
        */

        const blockchainTx =
            await verifyDocumentOnBlockchain(
                document.propertyId,
                0
            );


        document.status = "Verified";


        document.verifiedBy =
            req.user?.walletAddress || "Admin";


        document.verifiedAt =
            new Date();


        document.blockchainTxId =
            blockchainTx;


        await document.save();


        await saveTransactionCost(
            blockchainTx,
            "VERIFY_DOCUMENT"
        );


        /*
        |--------------------------------------------------------------------------
        | AUDIT LOG
        |--------------------------------------------------------------------------
        */

        await createAuditLog({

            action:"VERIFY_DOCUMENT",

            entity:"Document",

            entityId:document.documentId,

            performedBy:
                req.user?.walletAddress || "Admin",

            role:
                req.user?.role || "Admin",

            ipAddress:req.ip,

            details:{

                propertyId:
                    document.propertyId,

                blockchainTxId:
                    blockchainTx

            }

        });



        return successResponse(
            res,
            {
                document,
                blockchainTx
            },
            "Document verified successfully"
        );

    }
    catch(error){

        console.log(
            "VERIFY DOCUMENT ERROR:",
            error.message
        );


        return errorResponse(
            res,
            error.message,
            500
        );

    }

};



// REJECT DOCUMENT
const rejectDocument = async(req,res)=>{

    try{

        const {
            documentId
        } = req.params;


        const document =
            await Document.findOne({
                documentId
            });


        if(!document){

            return errorResponse(
                res,
                "Document not found",
                404
            );

        }


        document.status = "Rejected";


        await document.save();



        await createAuditLog({

            action:"REJECT_DOCUMENT",

            entity:"Document",

            entityId:document.documentId,

            performedBy:
                req.user?.walletAddress || "Admin",

            role:
                req.user?.role || "Admin",

            ipAddress:req.ip,

            details:{
                propertyId:document.propertyId
            }

        });



        return successResponse(
            res,
            document,
            "Document rejected successfully"
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



// REVOKE DOCUMENT
const revokeDocument = async (req, res) => {
    try {
        const { documentId } = req.params;

        const document = await Document.findOne({
            documentId
        });

        if (!document) {
            return errorResponse(
                res,
                "Document not found",
                404
            );
        }

        const blockchainDocuments =
            await getDocumentsFromBlockchain(
                document.propertyId
            );

        const documentIndex =
            blockchainDocuments.findIndex(
                doc =>
                    String(
                        doc.documentHash
                    ).toLowerCase() ===
                    (
                        "0x" +
                        document.fileHash
                    ).toLowerCase()
            );

        if (documentIndex === -1) {
            return errorResponse(
                res,
                "Document not found on blockchain",
                404
            );
        }

        // Revoke document on blockchain
        const blockchainTx =
            await revokeDocumentOnBlockchain(
                document.propertyId,
                documentIndex
            );

        // Save transaction cost AFTER blockchain transaction
        await saveTransactionCost(
            blockchainTx,
            "REVOKE_DOCUMENT"
        );

        // Update MongoDB document
        document.status = "Revoked";

        document.revokedBy =
            req.user?.walletAddress || "Admin";

        document.revokedAt =
            new Date();

        document.blockchainTxId =
            blockchainTx;

        await document.save();

        // Audit log
        await createAuditLog({
            action: "REVOKE_DOCUMENT",

            entity: "Document",

            entityId:
                document.documentId,

            performedBy:
                req.user?.walletAddress || "Admin",

            role:
                req.user?.role || "Admin",

            ipAddress: req.ip,

            details: {
                propertyId:
                    document.propertyId,

                blockchainTxId:
                    blockchainTx
            }
        });

        return successResponse(
            res,
            {
                document,
                blockchainTx
            },
            "Document revoked successfully"
        );

    } catch (error) {

        console.log(
            "REVOKE DOCUMENT ERROR:",
            error?.message
        );

        return errorResponse(
            res,
            error.message,
            500
        );
    }
};

// UPLOAD DOCUMENT
const uploadDocument = async(req,res)=>{

    try{

        const {
            documentId
        } = req.params;


        const document =
            await Document.findOne({
                documentId
            });


        if(!document){

            return errorResponse(
                res,
                "Document not found",
                404
            );

        }


        if(!req.file){

            return errorResponse(
                res,
                "No file uploaded",
                400
            );

        }


        const allowedExtensions = [
            ".pdf",
            ".jpg",
            ".jpeg",
            ".png"
        ];


        const extension =
            path.extname(
                req.file.originalname
            ).toLowerCase();


        if(
            !allowedExtensions.includes(
                extension
            )
        ){

            fs.unlinkSync(
                req.file.path
            );

            return errorResponse(
                res,
                "Unsupported file type",
                400
            );

        }


        const maxFileSize =
            10 * 1024 * 1024;


        if(
            req.file.size >
            maxFileSize
        ){

            fs.unlinkSync(
                req.file.path
            );

            return errorResponse(
                res,
                "File size exceeds 10MB",
                400
            );

        }


        const hash =
            generateFileHash(
                req.file.path
            );


        const ipfsResult =
            await uploadToIPFS(
                req.file.path
            );


        document.fileHash =
            hash;


        document.documentURI =
            ipfsResult.cid;


        const tx =
            await registerDocumentOnBlockchain(
                document.propertyId,
                hash,
                ipfsResult.cid
            );


        document.blockchainTxId =
            tx;


        await document.save();


        await saveTransactionCost(
            tx,
            "UPLOAD_DOCUMENT"
        );


        await createAuditLog({

            action:"UPLOAD_DOCUMENT",

            entity:"Document",

            entityId:document.documentId,

            performedBy:
                req.user?.walletAddress || "Owner",

            role:
                req.user?.role || "Owner",

            ipAddress:req.ip,

            details:{

                documentURI:
                    ipfsResult.cid,

                documentHash:
                    hash

            }

        });


        fs.unlinkSync(
            req.file.path
        );


        return successResponse(
            res,
            document,
            "File uploaded successfully"
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



// REPLACE DOCUMENT
const replaceDocument = async (req, res) => {

    try {

        const {
            documentId
        } = req.params;


        const oldDocument =
            await Document.findOne({
                documentId
            });


        if (!oldDocument) {

            return errorResponse(
                res,
                "Document not found",
                404
            );

        }


        if (!req.file) {

            return errorResponse(
                res,
                "No file uploaded",
                400
            );

        }


        const allowedExtensions = [
            ".pdf",
            ".jpg",
            ".jpeg",
            ".png"
        ];


        const extension =
            path.extname(
                req.file.originalname
            ).toLowerCase();


        if (
            !allowedExtensions.includes(
                extension
            )
        ) {

            fs.unlinkSync(
                req.file.path
            );

            return errorResponse(
                res,
                "Unsupported file type",
                400
            );

        }


        const maxFileSize =
            10 * 1024 * 1024;


        if (
            req.file.size >
            maxFileSize
        ) {

            fs.unlinkSync(
                req.file.path
            );

            return errorResponse(
                res,
                "File size exceeds 10MB",
                400
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Generate new hash
        |--------------------------------------------------------------------------
        */

        const newHash =
            generateFileHash(
                req.file.path
            );


        /*
        |--------------------------------------------------------------------------
        | Upload new document to IPFS
        |--------------------------------------------------------------------------
        */

        const ipfsResult =
            await uploadToIPFS(
                req.file.path
            );


        /*
        |--------------------------------------------------------------------------
        | Find old document index on blockchain
        |--------------------------------------------------------------------------
        */

        const blockchainDocuments =
            await getDocumentsFromBlockchain(
                oldDocument.propertyId
            );


        const documentIndex =
            blockchainDocuments.findIndex(
                doc =>
                    String(
                        doc.documentHash
                    ).toLowerCase()
                    ===
                    (
                        "0x" +
                        oldDocument.fileHash
                    ).toLowerCase()
            );


        if (documentIndex === -1) {

            fs.unlinkSync(
                req.file.path
            );

            return errorResponse(
                res,
                "Document not found on blockchain",
                404
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Replace document atomically on blockchain
        |--------------------------------------------------------------------------
        */

        const blockchainTx =
            await replaceDocumentOnBlockchain(
                oldDocument.propertyId,
                documentIndex,
                newHash,
                ipfsResult.cid
            );


        await saveTransactionCost(
            blockchainTx,
            "REPLACE_DOCUMENT"
        );


        /*
        |--------------------------------------------------------------------------
        | Update old MongoDB document
        |--------------------------------------------------------------------------
        */

        oldDocument.status =
            "Revoked";


        await oldDocument.save();


        /*
        |--------------------------------------------------------------------------
        | Create new MongoDB document
        |--------------------------------------------------------------------------
        */

        const newDocument =
            await Document.create({

                documentId:
                    uuidv4(),

                propertyId:
                    oldDocument.propertyId,

                documentName:
                    oldDocument.documentName,

                documentType:
                    oldDocument.documentType,

                fileHash:
                    newHash,

                documentURI:
                    ipfsResult.cid,

                uploadedBy:
                    req.user?.walletAddress ||
                    oldDocument.uploadedBy,

                status:
                    "Pending",

                version:
                    Number(
                        oldDocument.version || 1
                    ) + 1,

                replacedDocumentId:
                    oldDocument.documentId,

                blockchainTxId:
                    blockchainTx

            });


        /*
        |--------------------------------------------------------------------------
        | Audit Log
        |--------------------------------------------------------------------------
        */

        await createAuditLog({

            action:
                "REPLACE_DOCUMENT",

            entity:
                "Document",

            entityId:
                newDocument.documentId,

            performedBy:
                req.user?.walletAddress ||
                "Owner",

            role:
                req.user?.role ||
                "Owner",

            ipAddress:
                req.ip,

            details: {

                propertyId:
                    oldDocument.propertyId,

                oldDocumentId:
                    oldDocument.documentId,

                newDocumentId:
                    newDocument.documentId,

                documentHash:
                    newHash,

                documentURI:
                    ipfsResult.cid,

                blockchainTxId:
                    blockchainTx

            }

        });


        fs.unlinkSync(
            req.file.path
        );


        return successResponse(
            res,
            {
                oldDocument,
                newDocument,
                blockchainTx
            },
            "Document replaced successfully"
        );


    }
    catch (error) {

        console.log(
            "REPLACE DOCUMENT ERROR:",
            error?.message
        );


        return errorResponse(
            res,
            error.message,
            500
        );

    }

};



module.exports = {

    registerDocument,

    getDocumentsByProperty,

    getDocumentById,

    verifyDocument,

    rejectDocument,

    uploadDocument,

    replaceDocument,

    revokeDocument

};
