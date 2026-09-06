const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const PINATA_UPLOAD_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";

const uploadToIPFS = async (filePath) => {



    try {
        if (!process.env.PINATA_JWT) {
            console.log(
    "PINATA JWT START:",
    process.env.PINATA_JWT.substring(0, 20)
);
            throw new Error("PINATA_JWT is missing in .env");
        }

        const fileBuffer = fs.readFileSync(filePath);

        const hash = crypto
            .createHash("sha256")
            .update(fileBuffer)
            .digest("hex");

        const formData = new FormData();

        formData.append("file", fileBuffer, {
            filename: path.basename(filePath),
            contentType: "application/pdf",
        });

        formData.append(
            "network",
            JSON.stringify("public")
        );

        const response = await axios.post(
            PINATA_UPLOAD_URL,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PINATA_JWT}`,
                    ...formData.getHeaders(),
                },
                maxBodyLength: Infinity,
            }
        );

        const cid = response.data.IpfsHash;

        if (!cid) {
            throw new Error("CID was not returned from Pinata.");
        }

        return {
            cid,
            hash,
        };
    } catch (error) {
        if (error.response) {
            console.error("Pinata Error:", error.response.data);
        }

        throw new Error(error.message);
    }
};

const getFileFromIPFS = async (cid) => {
    if (!cid) {
        throw new Error("CID is required");
    }

    const gatewayUrl =
        `https://gateway.pinata.cloud/ipfs/${cid}`;

    const response = await axios.get(
        gatewayUrl,
        {
            responseType: "arraybuffer",
        }
    );

    return {
        buffer: Buffer.from(response.data),
        contentType:
            response.headers["content-type"] ||
            "application/octet-stream",
    };
};

module.exports = {
    uploadToIPFS,
    getFileFromIPFS,
};