import UserSelectedQuestions from "../models/userSelectedQuestions.js";
import express from "express";
import isAuthenticated from "../utils/isAuthenticated.js";
import CustomError from "../utils/customError.js";
import Question from "../models/question.js";
import Match from "../models/match.js";



const router = express.Router();


router.route("/selectedQuestions")
    //route to save the question selection of the user in the database 
    .post(isAuthenticated, async (req, res, next) => {
        //taking all required fields 
        try {
            // // stopping the execution for 4 seconds
            // await new Promise((r) => setTimeout(r, 4000));

            const { matchId, twoPointer, fourPointer, sixPointer, half } = req.body;

            // checking if any of the required fields are not given then send an error 
            if (!matchId || !twoPointer || !fourPointer || !sixPointer || !half) {
                return next(new CustomError(400, "Some required fields are not found"));
            }

            const questions = await Question.findOne({ matchId, half, validTill: { $gte: new Date() } });
            if (!questions) {
                return next(new CustomError(400, "Prediction has been Closed"));
            }

            if(!Array.isArray(twoPointer) || !Array.isArray(fourPointer) || !Array.isArray(sixPointer)){
                return next(new CustomError(400,"Pointers should be in array format"));
            }

            // database pointser list.
            const selectedTwoPointer = questions.twoPointer;
            const selectedFourPointer = questions.fourPointer;
            const selectedSixPointer = questions.sixPointer;

            //checking in two pointer 
            for (let i = 0; i < twoPointer.length; i++) {
               const filteredArray =  selectedTwoPointer.filter((item) => {
                    if(String(item._id) == String(twoPointer[i])){
                        return true;
                    }
                    else return false;
                })
                if(filteredArray.length == 0){
                    return next(new CustomError(400, "One of the selected questions doesn't exists in the database"));
                }
            }

            //checking in four pointer
            for (let i = 0; i < fourPointer.length; i++) {
                const filteredArray =  selectedFourPointer.filter((item) => {
                     if(String(item._id) == String(fourPointer[i])){
                         return true;
                     }
                     else return false;
                 })
                 if(filteredArray.length == 0){
                     return next(new CustomError(400, "One of the selected questions doesn't exists in the database"));
                 }
             }

             //checking in six pointer 
             for (let i = 0; i < sixPointer.length; i++) {
                const filteredArray =  selectedSixPointer.filter((item) => {
                     if(String(item._id) == String(sixPointer[i])){
                         return true;
                     }
                     else return false;
                 })
                 if(filteredArray.length == 0){
                     return next(new CustomError(400, "One of the selected questions doesn't exists in the database"));
                 }
             }

             const obj = {
                twoPointer,
                fourPointer,
                sixPointer
             }

             let  selectedQuestion = null;
             if(half == 1){
                selectedQuestion = await UserSelectedQuestions.create({matchId, userId : req.user._id, choosenQuestion : [obj]});
             }
             else{
                const alreadySelectedQuestions = await UserSelectedQuestions.findOne({matchId, userId : req.user._id});
                await alreadySelectedQuestions.choosenQuestion.push(obj);
               selectedQuestion =  await alreadySelectedQuestions.save();
             }


             return res.status(201).json({
                success : true,
                message : "Prediction made successfully",
                selectedQuestion
             })
        } catch (err) {
            next(err);
        }
    })

    // route to find all the selected questions of the user.
    router.get("/selectedQuestions/:matchId",isAuthenticated, async (req, res, next) => {

        //taking the matchId from the body which is a required field 
        const { matchId } = req.params;

        if (!matchId) {
            return next(new CustomError(400, "matchId is a required field"));
        }

        try {
            //finding current users selected questions 
            const mySelectedQuestions = await UserSelectedQuestions.findOne({ matchId, userId: req.user._id });

            if (!mySelectedQuestions) {
                return next(new CustomError(400, "No Questions has been selected by the current user"));
            }

            //finding the matches all questions 
            const matchQuestions = await Question.find({ matchId });

            if (!matchQuestions) {
                return next(new CustomError(400, "No match found with the given matchId"));
            }

            const twoPointer = [];
            const fourPointer = [];
            const sixPointer = [];

            for(let i = 0;i < matchQuestions.length;i++){
                let half = matchQuestions[i].half - 1;

                // getting two pointer selection of the current user 
                for(let j = 0;j < matchQuestions[i].twoPointer.length;j++){
                    for(let t = 0; t < mySelectedQuestions.choosenQuestion[half].twoPointer.length;t++){
                        if(matchQuestions[i].twoPointer[j]._id == mySelectedQuestions.choosenQuestion[half].twoPointer[t]){
                            const data = matchQuestions[i].twoPointer[j];
                            twoPointer.push( {
                                description : data.description,
                                status : data.status,
                                _id : data._id,
                                half : half + 1
                            })
                        }
                    }
                }

                // getting four pointer selection of the current user 
                for(let j = 0;j < matchQuestions[i].fourPointer.length;j++){
                    for(let t = 0; t < mySelectedQuestions.choosenQuestion[half].fourPointer.length;t++){
                        if(matchQuestions[i].fourPointer[j]._id == mySelectedQuestions.choosenQuestion[half].fourPointer[t]){
                            const data = matchQuestions[i].fourPointer[j];
                            fourPointer.push( {
                                description : data.description,
                                status : data.status,
                                _id : data._id,
                                half : half + 1
                            })
                        }
                    }
                }

                //getting six pointer selection of the current user.
                for(let j = 0;j < matchQuestions[i].sixPointer.length;j++){
                    for(let t = 0; t < mySelectedQuestions.choosenQuestion[half].sixPointer.length;t++){
                        if(matchQuestions[i].sixPointer[j]._id == mySelectedQuestions.choosenQuestion[half].sixPointer[t]){
                            const data = matchQuestions[i].sixPointer[j];
                            sixPointer.push(
                                {
                                    description : data.description,
                                    status : data.status,
                                    _id : data._id,
                                    half : half + 1
                                }
                            )
                        }
                    }
                }

            }


            //sending response back to the frontend.
            res.status(200).json({
                success: true,
                twoPointer,
                fourPointer,
                sixPointer
            })



        } catch (err) {
            next(new CustomError(500,err.message, true));
        }
    })

router.get("/hasUserSelectedAnyQuestion", async (req, res, next) => {
    try {
        const { matchId } = req.query;
        const selectedQuestion = await UserSelectedQuestions.findOne({ matchId, userId: req.user._id });
        if (!selectedQuestion) {
            return res.status(200).json({
                success: true,
                message: "The user hasn't selected question for the given match",
                data: false
            })
        }
        else {
            return res.status(200).json({
                success: true,
                message: "The user has selected question for the given match",
                data: true
            })
        }
    } catch (err) {
        next(err);
    }
})





export default router;