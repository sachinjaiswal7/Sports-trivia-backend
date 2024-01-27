import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Match",
        required: true
    },
    twoPointer: [
        {
            description: {
                type: String,
                required: true
            },
            status: {
                type: String,
                enum: ["neutral", "correct", "wrong"],
                default: "neutral"
            }

        }
    ],
    fourPointer: [
        {
            description: {
                type: String,
                required: true
            },
            status: {
                type: String,
                enum: ["neutral", "correct", "wrong"],
                default: "neutral"
            }

        }
    ],
    sixPointer: [
        {
            description: {
                type: String,
                required: true
            },
            status: {
                type: String,
                enum: ["neutral", "correct", "wrong"],
                default: "neutral"
            }

        }
    ],
    validTill : {
        type : Date,
        required : true,
    },
    half : {
        type : Number,
        required : true,
        unique : true
    }
})


const Question = mongoose.model("Question", questionSchema);

export default Question;