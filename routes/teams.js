import express from "express";
import isAuthenticated from "../utils/isAuthenticated.js";
import Teams from "../models/teams.js";
import { ROLE } from "../Constants/Constants.js";

const router = express.Router();

//api to add a new team in the database. 
router.post("/add", isAuthenticated, async (req, res,) => {
    try {
        if (req.user.role != ROLE.ADMIN) {
            return res.status(400).json({
                success: false,
                message: "You can't access this api"
            })
        }

        const { teamName, teamUrl, shortName } = req.body;
        if (!teamName || !teamUrl) {
            return res.status(400).json({
                success: false,
                message: "Please provide the full information"
            })
        }

        const data = await Teams.create({ teamName, teamUrl, shortName });

        return res.status(201).json({
            success: true,
            message: "Team added successfully",
            teamInfo: data
        })
    } catch (err) {

    }
})

router.delete("/delete/:teamId", isAuthenticated, async (req, res) => {
    try {
        if (req.user.role != "admin") {
            return res.status(400).json({
                success: false,
                message: "You can't access this api"
            })
        }
        const { teamId } = req.params;
        const team = await Teams.findById(teamId);
        if(team){
            await team.deleteOne();
            await team.save();
        }

        return res.status(200).json({
            success : true,
            message : "Team deleted successfully"
        })

    } catch (err) {

    }
})

router.get("/getAll",isAuthenticated, async(req,res) => {
    try{
        if (req.user.role != ROLE.ADMIN) {
            return res.status(400).json({
                success: false,
                message: "You can't access this api"
            })
        }

        const allTeams = await Teams.find({});
        return res.status(200).json({
            success: true,
            message: "Found all the teams",
            data: allTeams
        })

    }catch(err){

    }
})

export default router;