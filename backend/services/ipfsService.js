const crypto = require("crypto");
const fs = require("fs");

const uploadToIPFS = async (filePath) => {

    try {

        const fileBuffer = fs.readFileSync(filePath);

        const hash = crypto
            .createHash("sha256")
            .update(fileBuffer)
            .digest("hex");


        // فعلاً Mock CID
        // در مرحله ۸ با IPFS واقعی جایگزین می‌شود

        const cid =
            "QmMock_" + hash.substring(0, 32);


        return {
            cid,
            hash
        };

    } catch (error) {

        throw error;

    }

};


module.exports = {
    uploadToIPFS
};