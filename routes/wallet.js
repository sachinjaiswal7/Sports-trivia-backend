import express from "express"
import isAuthenticated from "../utils/isAuthenticated.js";
import CustomError from "../utils/customError.js";
import { createTransaction } from "../controllers/transactions.js";
import { ROLE, TRANSACTION_STATUS } from "../Constants/Constants.js";
import Transaction from "../models/transaction.js";

const router = express.Router();

router.get("/walletInfo", isAuthenticated, async (req, res) => {
    try {
        const userAccount = req.user;

        const currenUserTransaction = await Transaction.find({ userId: req.user._id }).sort({ time: -1 });
        return res.status(200).json({
            success: true,
            message: "fetched wallet information successfully",
            name: userAccount.name,
            walletBalance: userAccount.walletBalance,
            transactions: currenUserTransaction
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

router.post("/withdraw", isAuthenticated, async (req, res, next) => {
    try {
        let { withdrawAmount, type, mobileNumber } = req.body;

        if (!withdrawAmount || !type || !mobileNumber) {
            return next(new CustomError(400, "Please provide all the fields"));
        }
        if (typeof withdrawAmount != 'number' || typeof mobileNumber != 'string' || mobileNumber.length != 10) {
            return next(new CustomError(400, "Fields do not match the criteria"));
        }

        withdrawAmount = Math.floor(withdrawAmount);
        //if amount is less than zero then send an error message.
        if (withdrawAmount <= 0) {
            return next(new CustomError(400, "Invalid Money Value"));
        }
        //if type == 1 then it is a referralWinning money
        if (type == 1) {
            //if withdraw amount is more than the available money then just return an error
            if (req.user.walletBalance.referralWinning < withdrawAmount) {
                return next(new CustomError(400, "Not Enough Referral Money"))
            }
            //else create a transaction.
            else {
                const data = {
                    mobileNumber
                }
                await createTransaction("Withdrawn Referral Money", req.user, -withdrawAmount, true, TRANSACTION_STATUS.PENDING, data);
                return res.status(200).json({
                    success: true,
                    message: "Successfully Withdrawn Referral Money"
                })
            }
        }

        //else type != 1 then it is a  matchWinning money 
        else {
            //if withdraw amount is more than the available money then just return an error
            if (req.user.walletBalance.matchWinning < withdrawAmount) {
                return next(new CustomError(400, "Not Enough Winning Money"));
            }
            else {
                //creating the transaction for the current user.
                const data = {
                    mobileNumber
                }
                await createTransaction("Withdrawn matchWinning Money", req.user, -withdrawAmount, false, TRANSACTION_STATUS.PENDING, data);
                return res.status(200).json({
                    success: true,
                    message: "Successfully Withdrawn matchWinning Money"
                })
            }
        }
    } catch (error) {
        next(error);
    }
})

router.get("/all-withdrawals", isAuthenticated, async (req, res, next) => {
    try {
        if (req.user.role != ROLE.ADMIN) {
            return next(new CustomError(400, "You shouldn't be here"));
        }
        const { statusFilter } = req.query;

        //checking if the statusFilter variable is given or not.
        if (!statusFilter) {
            throw new CustomError(400, "Status Filter is required")
        }

        //we are finding all the transactions from the databse which have a particular status.
        const getAllWithdrawals = await Transaction.find({ transactionStatus: statusFilter, mobileNumber: { $nin: [null, '', undefined] } }).sort({ time: 1 });
        return res.status(200).json({
            success: true,
            message: "Found all the withdrawals",
            withdrawals: getAllWithdrawals
        })
    } catch (err) {
        next(err);
    }
})

router.put("/change-withdrawal-status", isAuthenticated, async (req, res, next) => {
    try {
        if (req.user.role != ROLE.ADMIN) {
            return next(new CustomError(400, "You can't perform this action"));
        }
        const { trans_id, change_status } = req.body

        if (!trans_id || !change_status) {
            return next(new CustomError(400, "Transaction Id is required"));
        }
        const findTransaction = await Transaction.findById(trans_id);
        if (!findTransaction) {
            return next(new CustomError(404, "No withdrawal found with this given id"));
        }

        findTransaction.transactionStatus = change_status
        await findTransaction.save();

        return res.status(200).json({
            success: true,
            message: "Changed the status successfully"
        })
    } catch (err) {
        next(err);
    }
})


router.get("/hello-world", async (req, res, next) => {
    try {

        return res.status(200).json({
            success: true,
            message: "Changed the status successfully"
        })
    } catch (err) {
        next(err);
    }
})

export default router;