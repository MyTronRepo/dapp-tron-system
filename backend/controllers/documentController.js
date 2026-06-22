const Document =
    require("../models/Document");

const {
    generateFileHash
} = require("../services/hashService");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHandler");

const uploadDocument = async (
    req,
    res
) => {

    try {

        const file = req.file;

        const {
            propertyId
        } = req.body;

        if (!file) {

            return errorResponse(
                res,
                "No file uploaded",
                400
            );

        }

        if (!propertyId) {

            return errorResponse(
                res,
                "Property ID is required",
                400
            );

        }

        const documentHash =
            generateFileHash(
                file.path
            );

        const document =
            await Document.create({

                propertyId,

                documentHash,

                documentURI:
                    file.filename,

                issueDate:
                    Date.now(),

                status:
                    "Pending"

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

const getAllDocuments = async (
    req,
    res
) => {

    try {

        const documents =
            await Document.find();

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

const getDocumentByPropertyId = async (
    req,
    res
) => {

    try {

        const {
            propertyId
        } = req.params;

        const documents =
            await Document.find({
                propertyId
            });

        if (
            documents.length === 0
        ) {

            return errorResponse(
                res,
                "Document not found",
                404
            );

        }

        return successResponse(
            res,
            documents,
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

const verifyDocument = async (
    req,
    res
) => {

    try {

        const {
            propertyId
        } = req.params;

        const document =
            await Document.findOne({
                propertyId
            });

        if (!document) {

            return errorResponse(
                res,
                "Document not found",
                404
            );

        }

        document.status =
            "Valid";

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

const revokeDocument = async (
    req,
    res
) => {

    try {

        const {
            propertyId
        } = req.params;

        const document =
            await Document.findOne({
                propertyId
            });

        if (!document) {

            return errorResponse(
                res,
                "Document not found",
                404
            );

        }

        document.status =
            "Revoked";

        await document.save();

        return successResponse(
            res,
            document,
            "Document revoked successfully"
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

    uploadDocument,

    getAllDocuments,

    getDocumentByPropertyId,

    verifyDocument,

    revokeDocument

};