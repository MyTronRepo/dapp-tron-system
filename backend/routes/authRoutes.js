const express = require("express");

const router = express.Router();

const {

    register,

    login

} = require("../controllers/authController");


const validate =
    require("../middleware/validationMiddleware");


const {

    registerValidation,

    loginValidation

} = require("../../validators/authValidator");



/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and wallet based access
 */


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *               - role
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 example: TXxxxxxxxxxxxxxxxx
 *               role:
 *                 type: string
 *                 example: Owner
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post(

    "/register",

    registerValidation,

    validate,

    register

);



/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user with wallet address
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 example: TXxxxxxxxxxxxxxxxx
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 */
router.post(

    "/login",

    loginValidation,

    validate,

    login

);



module.exports = router;