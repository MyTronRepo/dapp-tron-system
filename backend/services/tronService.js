const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

require("dotenv").config();

const TronWeb = require("tronweb");


const tronWeb = new TronWeb({

    fullNode: "https://api.nileex.io",

    solidityNode: "https://api.nileex.io",

    eventServer: "https://api.nileex.io",

    privateKey: process.env.PRIVATE_KEY

});



// REGISTER PROPERTY ON BLOCKCHAIN

const registerPropertyOnBlockchain = async ({

    propertyId,

    province,

    city,

    district,

    parcelNumber,

    area,

    buildYear,

    usageType,

    constructionStatus,

    latitude,

    longitude

}) => {


    console.log(
        "BLOCKCHAIN HOST:",
        "https://api.nileex.io"
    );


    console.log(
        "BLOCKCHAIN CONTRACT:",
        process.env.CONTRACT_ADDRESS
    );


    try {


        console.log(
            "TRON ADDRESS:",
            tronWeb.defaultAddress.base58
        );



        const contract =
            await tronWeb
            .contract()
            .at(process.env.CONTRACT_ADDRESS);



        const tx =
            await contract
            .registerProperty(

                propertyId,

                province,

                city,

                district,

                parcelNumber,

                Number(area),

                Number(buildYear),

                usageType,

                constructionStatus,

                Math.round(
                    Number(latitude) * 1000000
                ),

                Math.round(
                    Number(longitude) * 1000000
                )

            )
            .send({

                feeLimit: 100000000

            });



        console.log(
            "PROPERTY REGISTERED TX:",
            tx
        );


        return tx;



    } catch(error) {


        console.log(
            "BLOCKCHAIN ERROR:",
            error.message
        );


        throw error;

    }

};





// GET PROPERTY FROM BLOCKCHAIN

const getPropertyFromBlockchain = async(propertyId)=>{

    try{

        const contract =
            await tronWeb
            .contract()
            .at(process.env.CONTRACT_ADDRESS);


        const result =
            await contract
            .getPropertyData(propertyId)
            .call();


        return {

            propertyId: result[0],

            province: result[1],

            city: result[2],

            district: result[3],

            parcelNumber: result[4],

            area: Number(result[5]),

            buildYear: Number(result[6]),

            usageType: result[7],

            constructionStatus: result[8],

            latitude: Number(result[9]) / 1000000,

            longitude: Number(result[10]) / 1000000,

            status: Number(result[11]),

            exists: result[12]

        };


    }catch(error){

        console.log(
            "BLOCKCHAIN READ ERROR:",
            error.message
        );

        throw error;

    }

};





module.exports = {

    tronWeb,

    registerPropertyOnBlockchain,

    getPropertyFromBlockchain

};