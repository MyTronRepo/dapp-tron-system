require("dotenv").config({
    path: "../.env"
});

const {
    getPropertyFromBlockchain
} = require("./services/tronService");

const propertyId =
    "9909cd22-4b6e-4701-b0d7-a257a0675fa6";

(async () => {
    try {

        console.log("CONTRACT:");
        console.log(process.env.CONTRACT_ADDRESS);

        console.log("\nPROPERTY:");
        console.log(propertyId);

        const property =
            await getPropertyFromBlockchain(propertyId);

        console.log("\nBLOCKCHAIN PROPERTY:");
        console.log(JSON.stringify(property, null, 2));

    } catch (error) {

        console.error("\nTEST ERROR:");
        console.error(error?.message || error);

    }
})();