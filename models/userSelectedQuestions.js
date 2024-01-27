import mongoose from "mongoose";

const userSelectedQuestionsSchema = new mongoose.Schema({
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Match",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    choosenQuestion: [{
        twoPointer: [String],
        fourPointer: [String],
        sixPointer: [String],
    }
    ]

})


const UserSelectedQuestions = mongoose.model("UserSelectedQuestions", userSelectedQuestionsSchema);

export default UserSelectedQuestions;