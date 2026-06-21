const {
    generateFileHash
} = require("../services/hashService");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHandler");

const documents = [];

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
            generateFileHash(file.path);

        const document = {

            propertyId,

            documentHash,

            documentURI:
                file.filename,

            issueDate:
                Date.now(),

            status:
                "Pending"

        };

        documents.push(document);

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

    return successResponse(
        res,
        documents,
        "Documents fetched successfully"
    );

};

const getDocumentByPropertyId = async (
    req,
    res
) => {

    const {
        propertyId
    } = req.params;

    const result =
        documents.filter(
            doc =>
                doc.propertyId === propertyId
        );

    if (result.length === 0) {

        return errorResponse(
            res,
            "Document not found",
            404
        );

    }

    return successResponse(
        res,
        result,
        "Document fetched successfully"
    );

};

const verifyDocument = async (
    req,
    res
) => {

    const {
        propertyId
    } = req.params;

    const document =
        documents.find(
            doc =>
                doc.propertyId === propertyId
        );

    if (!document) {

        return errorResponse(
            res,
            "Document not found",
            404
        );

    }

    document.status = "Valid";

    return successResponse(
        res,
        document,
        "Document verified successfully"
    );

};

const revokeDocument = async (
    req,
    res
) => {

    const {
        propertyId
    } = req.params;

    const document =
        documents.find(
            doc =>
                doc.propertyId === propertyId
        );

    if (!document) {

        return errorResponse(
            res,
            "Document not found",
            404
        );

    }

    document.status = "Revoked";

    return successResponse(
        res,
        document,
        "Document revoked successfully"
    );

};

module.exports = {
    uploadDocument,
    getAllDocuments,
    getDocumentByPropertyId,
    verifyDocument,
    revokeDocument
};