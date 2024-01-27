import express from "express"
import isAuthenticated from "../utils/isAuthenticated.js";

const router = express.Router();

router.get("/walletInfo",isAuthenticated,async(req,res) => {
    try{
        const userAccount = req.user;
        return res.status(200).json({
            success : true,
            message : "fetched wallet information successfully",
            name : userAccount.name,
            walletBalance : userAccount.walletBalance,
            transactions : userAccount.transactions
        })
    }catch(error){
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
})


export default router;