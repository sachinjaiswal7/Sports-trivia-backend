import express from "express";
import Match from "../models/match.js";
import isAuthenticated from "../utils/isAuthenticated.js";
import CustomError from "../utils/customError.js";
const router = express.Router();


// add a match to the list 
router.post("/add", isAuthenticated, async (req, res) => {

    if (req.user.role !== 'admin') {
        return res.status(400).json({
            success: false,
            message: "You are not authorized to make requset to this route"
        })
    }

    try {
        const { homeTeamName, awayTeamName, time } = req.body;

        if (!homeTeamName || !awayTeamName || !time) {
            return res.status(400).json({
                success: false,
                message: "All fields are necessary"
            })
        }

        const match = await Match.create({
            homeTeam: {
                teamName: homeTeamName
            },
            awayTeam: {
                teamName: awayTeamName
            },
            time
        })

        res.status(200).json({
            success: true,
            message: "Match Created Successfully",
            match
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            success: false,
            err
        })
    }
})

//route to delete a match with its id
router.delete("/delete/:id", isAuthenticated, async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(400).json({
            success: false,
            message: "You are not authorized to make request to this route"
        })
    }

    try {
        const match = await Match.findById(req.params.id);
        if (match) {
            await match.deleteOne();
        }

        res.status(200).json({
            success: true,
            message: "Match deleted successfully"
        })
    }
    catch (err) {
        res.status(400).json({
            success: false,
            err
        })
    }
})


// route to get all the available matches 
router.get("/all", isAuthenticated, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(400).json({
            success: false,
            message: "You are not authorized to make request to this route"
        })
    }

    try {
        const allMatches = await Match.find({});
        res.status(200).json({
            success: true,
            matches: allMatches
        })
    } catch (err) {
        res.status(400).json({
            success: false,
            err
        })
    }
})

// route to get all the upcoming matches
router.get("/:matchStatus", isAuthenticated, async (req, res, next) => {

    try {
        const { matchStatus } =  req.params;
        const allMatches = await Match.find({ status: matchStatus })
        allMatches.sort((a,b) => (a.time.getTime() - b.time.getTime()))
        res.status(200).json({
            success: true,
            matches: allMatches
        })
    } catch (err) {
        res.status(400).json({
            success: false,
            err
        })
    }
})

//
router.put("/update/:id", isAuthenticated, async (req, res, next) => {

    try {
        if (req.user.role != "admin") {
            return res.status(401).json({
                success: false,
                message: "You can't update the information"
            })
        }
        const { id } = req.params;
        const { homeTeam, awayTeam, time, status, createdAt } = req.body;
        if (!homeTeam || !awayTeam || !time || !status || !createdAt) {
            return next(new CustomError(400, "format for updating the data is not right"));
        }
        await Match.findByIdAndUpdate(id, {
            homeTeam,
            awayTeam,
            time,
            status,
            createdAt
        })

        return res.status(200).json({
            success: true,
            message: "updated successfully"
        })
    } catch (err) {
        next(err);
    }

})

//get single match information 
router.get("/get/:id", isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        const matchInfo = await Match.findById(id);
        if(!matchInfo){
           return next(new CustomError(400,"No match found with given id",true))
        }
        res.status(200).json({
            success : true,
            message : "Match information fetched successfully",
            matchInfo
        })

    } catch (err) {
        next(new CustomError(500,err.message,true));
    }
})









export default router;