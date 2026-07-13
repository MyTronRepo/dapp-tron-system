const mongoose = require("mongoose");


const transferSchema =
new mongoose.Schema({

    transferId:{
        type:String,
        required:true,
        unique:true
    },


    propertyId:{
        type:String,
        required:true
    },


    seller:{
        type:String,
        required:true
    },


    buyer:{
        type:String,
        required:true
    },


    transferredShare:{
        type:Number,
        required:true,
        min:1,
        max:100
    },


    buyerApproved:{
        type:Boolean,
        default:false
    },


    adminApproved:{
        type:Boolean,
        default:false
    },


    blockchainTxId:{
        type:String,
        default:""
    },


    completed:{
        type:Boolean,
        default:false
    },


    expireAt:{
        type:Number,
        required:true
    },


    status:{
        type:String,
        enum:[
            "PendingSeller",
            "PendingBuyer",
            "PendingAdmin",
            "Completed",
            "Rejected",
            "Expired"
        ],
        default:"PendingBuyer"
    }


},
{
    timestamps:true
});


module.exports =
mongoose.model(
    "Transfer",
    transferSchema
);