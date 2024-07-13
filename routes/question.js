import express from "express";
import Question from "../models/question.js";
import isAuthenticated from "../utils/isAuthenticated.js";
import CustomError from "../utils/customError.js";
import Match from "../models/match.js";
import UserSelectedQuestions from "../models/userSelectedQuestions.js";
import { ROLE } from "../Constants/Constants.js";

const router = express.Router();

// route to add questions for a particular match with its matchId
router.post("/add", isAuthenticated, async (req, res, next) => {

    try {

        // checking if the user is admin or not 
        if (req.user.role !== ROLE.ADMIN) {
            return res.status(400).json({
                success: false,
                message: "You are not authorized to make request to this route"
            })
        }

        // takig all the required fields from the request.body object 
        const { matchId, twoPointer, fourPointer, sixPointer, validTill, half } = req.body;

        // checking if any of the field is undefined or null
        if (!matchId || !twoPointer || !fourPointer || !sixPointer || !validTill || !half) {
            return res.status(400).json({
                success: false,
                message: "All fields are necessary"
            })
        }

        //finding the match to which these questions relate 
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(400).json({
                success: false,
                message: "No match available with given matchId"
            })
        }


        // finding if questions already exists for the given matchId
        const oldQuestion = await Question.findOne({ matchId, half });

        // deleting the previous questions for this matchId
        if (oldQuestion) {
            return next(new CustomError(400, "questions already exists for this matchid and half"));
        }

        // adding the questions to the database.
        const questions = await Question.create({ matchId, twoPointer, fourPointer, sixPointer, validTill, half });

        //sending the response
        res.status(200).json({
            success: true,
            message: "Questions added for this match successully",
            questions
        })
    } catch (err) {
        res.status(400).json({
            success: false,
            err
        })
    }

})

//route to get all the questions related to one particular matchId
router.get("/get/:matchId", isAuthenticated, async (req, res, next) => {
    try {

        const matchId = req.params.matchId;
        const currentDateTime = new Date();
        //finding the questions selected by the user.
        const userAlreadySelected = await UserSelectedQuestions.findOne({ matchId, userId: req.user._id });
        //selecting the questions which are currently opened.
        const questions = await Question.findOne({ matchId, validTill: { $gte: currentDateTime } });
        if (userAlreadySelected && questions && userAlreadySelected.choosenQuestion.length >= questions.half) {
            return res.status(400).json({
                success: false,
                message: "You have made predictions",
                made: true,
                time: false
            })
        }
        if (!questions) {
            return res.status(400).json({
                success: false,
                message: "Predictions closed",
                made: false,
                time: true,
            })
        }

        res.status(200).json({
            success: true,
            questions
        })
    }
    catch (err) {
        next(new CustomError(500, err.message, true));
    }

})


// route to delete a questionList with the help of matchId 
router.delete("/delete/:questionId", isAuthenticated, async (req, res, next) => {
    try {
        // checking for the admin
        if (req.user.role !== "admin") {
            return res.status(400).json({
                success: false,
                message: "You are not authorized to make request to this route"
            })
        }

        //taking the matchId
        const { questionId } = req.params;

        //finding the question associated with matchId
        const question = await Question.findById(questionId);

        //deleting the question associated with matchId
        if (question) {
            await question.deleteOne();
        }

        //sending the response back to the frontend
        res.status(200).json({
            success: true,
            message: "Question for the given questionId deleted successfully"
        })
    } catch (err) {
        res.status(400).json({
            success: false,
            err
        })
    }
})

export default router;