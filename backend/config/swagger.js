const swaggerJSDoc = require("swagger-jsdoc");


const swaggerDefinition = {

    openapi: "3.0.0",

    info: {

        title: "DApp TRON Real Estate API",

        version: "1.0.0",

        description:
            "Backend API for decentralized real estate system using TRON blockchain"

    },


    servers: [

        {

            url: "http://localhost:5000",

            description: "Local server"

        }

    ]

};



const options = {

    swaggerDefinition,


    apis: [

        "./backend/routes/*.js"

    ]

};



const swaggerSpec = swaggerJSDoc(options);


module.exports = swaggerSpec;