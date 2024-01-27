import express from "express";
import isAuthenticated from "../utils/isAuthenticated.js";
import CustomError from "../utils/customError.js";
import UserSelectedQuestions from "../models/userSelectedQuestions.js";
import Question from "../models/question.js";
import User from "../models/user.js";
import { QUESTION } from "../Constants/Constants.js";

const router = express.Router();

//route to fetch the leaderboard of a particular match
router.get("/showLeaderboard/:matchId", isAuthenticated, async (req, res, next) => {
    const { matchId } = req.params;
    if (!matchId) {
        return next(new CustomError(400, "matchId is required"));
    }

    try {
        //finding the selection of questions for all the user for the given matchId
        const allUserSelectedQuestions = await UserSelectedQuestions.find({ matchId });
        if (!allUserSelectedQuestions) {
            return next(new CustomError(400, "No questions found with this matchId"));
        }

        //finding the wrong and correct questions of the current match which is associated with the given matchId
        const questionsOfMatch = await Question.find({ matchId });

        //all users information 
        const allUser = await User.find();


        if (!questionsOfMatch) {
            return next(new CustomError(400, "No questions found for the given matchId"));
        }
        let you = null;
        const userLeaderboard = [];
        for (let i = 0; i < allUserSelectedQuestions.length; i++) { // iterating through all the users who have made any predictions 
            let currentUserScore = 0;
            for (let t = 0; t < questionsOfMatch.length; t++) {// iterating through all the questions given for each half 

                // two pointer calculation 
                for (let j = 0; j < allUserSelectedQuestions[i].choosenQuestion[questionsOfMatch[t].half - 1].twoPointer.length; j++) {
                    questionsOfMatch[t].twoPointer.map((item) => {
                        if(item.status != QUESTION.CORRECT)return;
                        if (String(item._id) == allUserSelectedQuestions[i].choosenQuestion[questionsOfMatch[t].half - 1].twoPointer[j]) {
                            currentUserScore += 2;
                        }
                    })
                }
                // four poitner calculation
                for (let j = 0; j < allUserSelectedQuestions[i].choosenQuestion[questionsOfMatch[t].half - 1].fourPointer.length; j++) {
                    questionsOfMatch[t].fourPointer.map((item) => {
                        if(item.status != QUESTION.CORRECT)return;
                        if (String(item._id) == allUserSelectedQuestions[i].choosenQuestion[questionsOfMatch[t].half - 1].fourPointer[j]) {
                            currentUserScore += 4;
                        }
                    })
                }
                //sixpointer calculation 
                for (let j = 0; j < allUserSelectedQuestions[i].choosenQuestion[questionsOfMatch[t].half - 1].sixPointer.length; j++) {
                    questionsOfMatch[t].sixPointer.map((item) => {
                        if(item.status != QUESTION.CORRECT)return;
                        if (String(item._id) == allUserSelectedQuestions[i].choosenQuestion[questionsOfMatch[t].half - 1].sixPointer[j]) {
                            currentUserScore += 6;
                        }
                    })
                }
            }
            for(let j = 0;j < allUser.length;j++){
                if(allUser[j].id == allUserSelectedQuestions[i].userId){
                    userLeaderboard.push({
                        id : allUser[j].id,
                        name : allUser[j].name,
                        score : currentUserScore
                    })
                }
            }
        }
        userLeaderboard.sort((a,b) => (a.score - b.score));
        let currentStanding = 1;
        for(let j = 0;j < userLeaderboard.length;j++){
            if(j > 0 && (userLeaderboard[j].score != userLeaderboard[j - 1].score))currentStanding++;
            userLeaderboard[j] = {
                ...userLeaderboard[j],
                position  : currentStanding
            }
            if(String(userLeaderboard[j].id) == String(req.user._id)){
                you = userLeaderboard[j];
                break;
            }
        }
        // sending the response back to the frontend with leaderboard
        res.status(200).json({
            success: true,
            message: "Leaderboard fetched successfully",
            leaderboard: userLeaderboard,
            you
        })





    } catch (err) {
        next(new CustomError(500,err.message,true));
    }

})

export default router;