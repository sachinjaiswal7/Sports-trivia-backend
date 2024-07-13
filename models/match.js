import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
    homeTeam : {
        type : mongoose.Schema.Types.ObjectId,
        ref  : "Team"
    },
    awayTeam : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Team"
    },
    time : {
        type : Date,
        required : true
    },
    status : {
        type : String,
        enum : ["upcoming","live","ended"],
        default : "upcoming"
    },
    createdAt : {
        type : Date,
        default : Date.now
    }

})

const Match = mongoose.model("Match",matchSchema);

export default Match;