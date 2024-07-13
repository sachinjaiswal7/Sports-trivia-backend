import mongoose from "mongoose";

const transacitonSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    description : {
        type : String,
        required : true
     },
     time : {
        type : Date,
        default : Date.now
     },
     amount : {
        type : Number,
        required : true
     },
     transactionStatus : {
        type : String,
        enum : ["PENDING","SUCCESS","FAILED"],
        default : "PENDING"
     },
     mobileNumber : {
        type : String
     }
})


const Transaction = mongoose.model("Transaction",transacitonSchema);

export default Transaction;