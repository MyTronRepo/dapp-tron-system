const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const PINATA_UPLOAD_URL = "https://uploads.pinata.cloud/v3/files";

const uploadToIPFS = async (filePath) => {
    try {
        if (!process.env.PINATA_JWT) {
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

        const cid = response.data.data.cid;

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

module.exports = {
    uploadToIPFS,
};