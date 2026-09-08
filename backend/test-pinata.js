require("dotenv").config({ path: "../.env" });

const { uploadToIPFS } = require("./services/ipfsService");

(async () => {
    try {
        const result = await uploadToIPFS("./pina.pdf");

        console.log("========== PINATA TEST ==========");
        console.log("CID:", result.cid);
        console.log("CID LENGTH:", result.cid?.length);
        console.log("SHA256:", result.hash);
        console.log("=================================");
    } catch (error) {
        console.error("PINATA TEST ERROR:", error.message);
    }
})();