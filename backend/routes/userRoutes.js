const express = require("express");

const router = express.Router();

const User = require("../models/User");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");



// GET ALL USERS (ADMIN ONLY)

router.get(
    "/",
    authenticate,
    authorize("admin"),
    async (req, res) => {

        try {

            const users = await User.find();


            res.status(200).json({

                success: true,

                data: users

            });


        } catch (error) {

            res.status(500).json({

                success:false,

                message:error.message

            });

        }

    }
);




// UPDATE USER ROLE (ADMIN ONLY)

router.patch(
    "/:id/role",
    authenticate,
    authorize("admin"),
    async (req,res)=>{


        try {


            const {
                role
            } = req.body;



            const user =
                await User.findById(
                    req.params.id
                );



            if(!user){

                return res.status(404).json({

                    success:false,

                    message:"User not found"

                });

            }



            user.role = role;



            await user.save();



            res.status(200).json({

                success:true,

                data:user,

                message:
                    "User role updated successfully"

            });



        }
        catch(error){


            res.status(500).json({

                success:false,

                message:error.message

            });


        }


    }
);






// UPDATE USER STATUS (ADMIN ONLY)

router.patch(
    "/:id/status",
    authenticate,
    authorize("admin"),
    async(req,res)=>{


        try{


            const {
                status
            } = req.body;



            const user =
                await User.findById(
                    req.params.id
                );



            if(!user){

                return res.status(404).json({

                    success:false,

                    message:"User not found"

                });

            }



            user.status = status;



            await user.save();



            res.status(200).json({

                success:true,

                data:user,

                message:
                    "User status updated successfully"

            });



        }
        catch(error){


            res.status(500).json({

                success:false,

                message:error.message

            });


        }


    }
);




module.exports = router;