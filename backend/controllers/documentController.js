const { v4: uuidv4 } = require("uuid");

const Document =
    require("../models/Document");

const Property =
    require("../models/Property");

const {

    successResponse,

    errorResponse

} = require("../utils/responseHandler");

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

const getDocumentsByProperty = async (req, res) => {

    try {

        const { propertyId } = req.params;

        const documents =
            await Document.find({

                propertyId

            });

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

module.exports = {

    registerDocument,

    getDocumentsByProperty,

    getDocumentById

};