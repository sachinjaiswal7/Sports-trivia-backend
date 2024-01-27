import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    gmail : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    name : {
        type :String,
        required : true
    },
    otherReferral : {
        type : String,
    },
    otp : {
        type : String,
        required : true
    },
    expirationTime : {
        type : Date,
        required : true
    },
    createdAt : {
        type : Date,
        default : Date.now,
    }
})

const OTP  = mongoose.model("OTP",otpSchema);

export default OTP;