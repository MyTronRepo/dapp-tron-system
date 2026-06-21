const crypto = require("crypto");
const fs = require("fs");

const generateFileHash = (filePath) => {
    const fileBuffer =
        fs.readFileSync(filePath);

    return crypto
        .createHash("sha256")
        .update(fileBuffer)
        .digest("hex");
};

module.exports = {
    generateFileHash
};