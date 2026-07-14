const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    walletAddress: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    nationalIdHash:{
    type:String,
    required:false,
    trim:true
},
    

    fullName: {
        type: String,
        required: true,
        trim: true
    },

    role: {
        type: String,
        enum: [
            "owner",
            "buyer",
            "admin",
            "observer"
        ],
        default: "owner",
        lowercase: true
    },

    status: {
        type: String,
        enum: [
            "active",
            "blocked"
        ],
        default: "active"
    }

},
{
    timestamps: true
}
);


module.exports = mongoose.model(
    "User",
    userSchema
);