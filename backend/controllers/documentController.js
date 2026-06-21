const {
    generateFileHash
} = require("../services/hashService");

const {
    successResponse
} = require("../utils/responseHandler");

const uploadDocument = async (
    req,
    res
) => {

    const file = req.file;

    if (!file) {
        return res.status(400).json({
            success: false,
            message: "No file uploaded"
        });
    }

    const hash =
        generateFileHash(file.path);

    return successResponse(
        res,
        {
            fileName: file.filename,
            hash
        },
        "Document uploaded successfully"
    );
};

module.exports = {
    uploadDocument
};