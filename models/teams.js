import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
    teamName : {
        type : String,
        required : true
    },
    teamUrl : {
        type : String,
        required : true
    },
    shortName : {
        type : String,
        required : true
    }
})


const Teams = mongoose.model("Team",teamSchema);

export default Teams;