import express from "express";
import Match from "../models/match.js";
import isAuthenticated from "../utils/isAuthenticated.js";
import CustomError from "../utils/customError.js";
import { MATCH_STATUS, ROLE } from "../Constants/Constants.js";
const router = express.Router();


// add a match to the list. this route will only be used by the admins so need to worry about the security. 
router.post("/add", isAuthenticated, async (req, res) => {

    //if the user is not admin then send an error.
    if (req.user.role !== ROLE.ADMIN) {
        return res.status(400).json({
            success: false,
            message: "You are not authorized to make request to this route"
        })
    }

    try {
        //home team name and away team name. 
        const { homeTeamId, awayTeamId, time } = req.body;

        if (!homeTeamId || !awayTeamId || !time) {
            return res.status(400).json({
                success: false,
                message: "All fields are necessary"
            })
        }

        // if both the teams are same then throw an error.
        if (homeTeamId == awayTeamId) {
            throw new CustomError(400, "Both the teams can't be same")
        }

        const match = await Match.create({
            homeTeam: homeTeamId,
            awayTeam: awayTeamId,
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
// this route will mostly not be used.
router.delete("/delete/:id", isAuthenticated, async (req, res, next) => {
    if (req.user.role !== ROLE.ADMIN) {
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
    if (req.user.role !== ROLE.ADMIN) {
        return res.status(400).json({
            success: false,
            message: "You are not authorized to make request to this route"
        })
    }

    try {
        // updating the status of all those  match which are in upcoming state but they have started. 
        await updateMatchStatus(MATCH_STATUS.LIVE);
        const allMatches = await Match.find({}).populate('homeTeam').populate('awayTeam');
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
        const { matchStatus } = req.params;
        // updating the status of all those  match which are in upcoming state but they have started. 
        await updateMatchStatus(MATCH_STATUS.LIVE);
        const allMatches = await Match.find({ status: matchStatus }).populate('homeTeam').populate('awayTeam')
        allMatches.sort((a, b) => (a.time.getTime() - b.time.getTime()))
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
        if (req.user.role != ROLE.ADMIN) {
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
        const matchInfo = await Match.findById(id).populate('homeTeam').populate('awayTeam');

        // updating the status of all those  match which are in upcoming state but they have started. 
        await updateMatchStatus(MATCH_STATUS.LIVE);
        if (!matchInfo) {
            return next(new CustomError(400, "No match found with given id", true))
        }
        res.status(200).json({
            success: true,
            message: "Match information fetched successfully",
            matchInfo
        })

    } catch (err) {
        next(new CustomError(500, err.message, true));
    }
})


const updateMatchStatus = async (status) => {
    const allMatches = await Match.updateMany(
        {
            $and: [
                { time: { $lte: new Date() } },
                { status: MATCH_STATUS.UPCOMING }
            ]
        },
        { $set: { status: status } }
    )
    return allMatches;
}






export default router;