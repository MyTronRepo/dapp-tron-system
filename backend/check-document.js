require("dotenv").config({ path: "../.env" });

const mongoose = require("mongoose");
const Document = require("./models/Document");

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const docs = await Document.find({
            fileHash:
                "40c5b733d0e21c53a9e40fa6eb9df01bb6898b842f5f13bd42db5624c2a97dd0"
        }).lean();

        console.log("========== DOCUMENT CHECK ==========");
        console.log(JSON.stringify(docs, null, 2));
        console.log("====================================");

        await mongoose.disconnect();
    } catch (error) {
        console.error("CHECK ERROR:", error.message);
    }
})();