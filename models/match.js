import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
    homeTeam : {
        teamName : {
            type : String,
            required : true
        },
        imageUrl : {
            type : String,
        }
    },
    awayTeam : {
        teamName : {
            type : String,
            required : true
        },
        imageUrl : {
            type : String
        }
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