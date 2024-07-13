import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    gmail : {
        type : String,
        required : true,
        unique : true
    },
    name : {
        type : String,
        required : true
    },
    password : {
        type : String,
        select : false,
        required : true
    },
    role : {
        type : String,
        default : "user"
    },
    walletBalance : {
        referralWinning :{
            type: Number,
            default : 0
        },
        matchWinning : {
            type : Number,
            default : 0
        }
    },
    otherReferral : {
        type : String,
    },
    myReferral : {
        type : String,
        required : true
    },
    forgotPasswordExpiry : {
        type : Date,
    },
    forgotPasswordOtp : {
        type : String,
    },
    createdAt : {
        type : Date,
        default : Date.now
    }
})

const User = mongoose.model("User",userSchema);

export default User;