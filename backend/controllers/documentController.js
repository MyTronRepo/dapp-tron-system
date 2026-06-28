const { v4: uuidv4 } = require("uuid");

const Document =
    require("../models/Document");

const Property =
    require("../models/Property");

const {

    successResponse,

    errorResponse

} = require("../utils/responseHandler");

const {

    uploadToIPFS

} = require("../services/ipfsService");

const fs = require("fs");

// REGISTER
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

                documentId:
                    uuidv4(),

                propertyId,

                documentName,

                documentType,

                uploadedBy

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

// SEARCH DOCUMENTS
const getDocumentsByProperty = async (req, res) => {

    try {

        const {

            propertyId,

            verified,

            documentType

        } = req.query;

        const query = {};

        if (propertyId)
            query.propertyId = propertyId;

        if (documentType)
            query.documentType = documentType;

        if (verified !== undefined)
            query.verified = verified === "true";

        const documents =
            await Document.find(query);

        return successResponse(

            res,

            documents,

            "Documents fetched successfully"

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

// GET DOCUMENT
const getDocumentById = async (req, res) => {

    try {

        const { documentId } = req.params;

        const document =
            await Document.findOne({

                documentId

            });

        if (!document) {

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

    catch (error) {

        return errorResponse(

            res,

            error.message,

            500

        );

    }

};

// VERIFY
const verifyDocument = async (req, res) => {

    try {

        const { documentId } = req.params;

        const document =
            await Document.findOne({

                documentId

            });

        if (!document) {

            return errorResponse(

                res,

                "Document not found",

                404

            );

        }

        document.verified = true;

        await document.save();

        return successResponse(

            res,

            document,

            "Document verified successfully"

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

// UPLOAD
const uploadDocument = async (req, res) => {

    try {

        const { documentId } = req.params;

        const document =
            await Document.findOne({

                documentId

            });

        if (!document) {

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

        const cid =
            await uploadToIPFS(

                req.file.path

            );

        document.documentURI = cid;

        await document.save();

        fs.unlinkSync(

            req.file.path

        );

        return successResponse(

            res,

            document,

            "File uploaded to IPFS successfully"

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

    registerDocument,

    getDocumentsByProperty,

    getDocumentById,

    verifyDocument,

    uploadDocument

};