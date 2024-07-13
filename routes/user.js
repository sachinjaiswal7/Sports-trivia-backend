import express from "express";
import generateCode from "../utils/generateCode.js";
import sendGmail from "../utils/sendGmail.js";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import OTP from "../models/OTP.js";
import CustomError from "../utils/customError.js";
import createToken from "../utils/createToken.js";
import { createTransaction } from "../controllers/transactions.js";
import isAuthenticated from "../utils/isAuthenticated.js";
import { TRANSACTION_STATUS } from "../Constants/Constants.js";

const router = express.Router();

//route to send otp to the user so that the user can be registered in the next step.
router.post("/register", async (req, res, next) => {

    try {
        //taking the important fields from the body.
        let { gmail, name, password, otherReferral } = req.body;

        //checking if the otherReferral already exits in the database or not. 
        if (otherReferral) {
            const exists = await User.findOne({ myReferral: otherReferral });
            if (!exists) {
                return next(new CustomError(400, "The given Referral Code doesn't exist"));
            }
        }

        //turning the gmail into small case because lowercase and uppercase both counts the same in the case of a gmail. 
        gmail = String(gmail).toLowerCase();

        //if any of the field is not provided then send an error 
        if (!gmail || !name || !password) {
            return next(new CustomError(400, "Gmail or name or password is not provided"));
        }

        //finding if already user exists in the database or not 
        const oldUser = await User.findOne({ gmail });

        // if user exists then send an error to the frontend.
        if (oldUser) {
            return next(new CustomError(400, "User already Exists"));
        }

        //otp generated with my own code.
        const otp = generateCode();

        // hashed otp
        const hashedOtp = await bcrypt.hash(otp, 10);
        const oldOtp = await OTP.findOne({ gmail });
        if (oldOtp) {
            await oldOtp.deleteOne();
        }

        //send otp to the gmail given by the user.
        sendGmail(gmail, otp);

        const hashedPassword = await bcrypt.hash(password, 10);

        //saving the otp in the database.
        await OTP.create({ gmail, otp: hashedOtp, name, password: hashedPassword, expirationTime: Date.now() + (1000 * 60 * 5), otherReferral });


        // sending response back to the frontend. 
        res.status(200).json({
            success: true,
            message: "OTP Sent to Gmail successfully",
        })


    } catch (err) {
        next(err);
    }
})

//route to verify the otp creating at the register step of the user.
router.post("/verifyOtp", async (req, res, next) => {
    try {
        // taking the required fields 
        let { gmail, otp } = req.body;

        //checking if any of the required fields is not given.
        if (!gmail || !otp) {
            return next(new CustomError(400, "Gmail or Otp is not given please give all the required field"));
        }

        //turning the gmail into smaller case.
        gmail = String(gmail).toLowerCase();


        //checking if user already exists in the database.
        const oldUser = await User.findOne({ gmail });
        if (oldUser) {
            return next(new CustomError(400, "User already exists"));
        }


        //finding the otpEntry associated with gmail 
        const otpEntry = await OTP.findOne({ gmail });

        //if there is not otpEntry then send an error.
        if (!otpEntry) {
            return next(new CustomError(400, "No Otp has been generated with given gmail"));
        }

        //checking if otp has expired or not 
        if (otpEntry.expirationTime < Date.now()) {
            return next(new CustomError(400, "OTP has expired"));
        }

        //matching the otp with hashedOtp which resides inside our database.
        const isMatched = await bcrypt.compare(otp, otpEntry.otp);
        if (!isMatched) {
            return next(new CustomError(400, "OTP is invalid"));
        }

        //creating a new referral code. 
        let randomReferralCode = null;
        while (true) {
            randomReferralCode = otpEntry.name + Math.floor(Math.random() * process.env.RANDOM_NUMBER_LIMIT + 1);
            const alreadyExists = await User.findOne({ myReferral: randomReferralCode });
            if (!alreadyExists) {
                break;
            }
        }



        //making the actual user in the database.
        const user = await User.create({ gmail, name: otpEntry.name, password: otpEntry.password, myReferral: randomReferralCode });

        if (otpEntry.otherReferral) {
            const referrerAccount = await User.findOne({ myReferral: otpEntry.otherReferral });

            // referral bonus transaction for current created user 
            await createTransaction(`Referral Bonus By ${referrerAccount.myReferral}`, user, process.env.REFERRAL_AMOUNT, true,TRANSACTION_STATUS.SUCCESS);

            // referral bonus transaction for referrer User 
            await createTransaction(`Referred Bonus ${user.myReferral}`, referrerAccount, process.env.REFERRAL_AMOUNT, true,TRANSACTION_STATUS.SUCCESS);
        }

        user.password = null;
        user.transactions = null;
        const token = createToken(user._id);

        res.status(200).json({
            success: true,
            message: "User created successfully",
            user,
            token
        })



    } catch (err) {
        next(err);
    }

})

//route to login the user 
router.post("/login", async (req, res, next) => {
    try {
        // taking the required fields 
        let { gmail, password } = req.body;

        if(!gmail || !password){
            return next(new CustomError(400,"Please provide gmail and password both"));
        }

        gmail = String(gmail).toLowerCase();

        //finding the user assocaited with the gmail.
        const user = await User.findOne({ gmail }).select("+password");

        // if no user associated with gmail then send an error
        if (!user) {
            return next(new CustomError(400, "Either no user exists or password is invalid"));
        }

        // comparing the database password with given password.
        const isMatched = await bcrypt.compare(password, user.password);

        //is password doesn't match then send an error.
        if (!isMatched) {
            return next(new CustomError(400, "Either no user exists or password is invalid"));
        }

        //hiding the password from the frontend.
        user.password = null;
        user.transactions = null;
        const token = createToken(user._id);


        // send response back to the frontend.
        res.status(200).json({
            success: true,
            message: "Login successful",
            user,
            token
        })


    } catch (err) {
        next(err);
    }
})

// route to generate an otp for forgetting the password of a user.
router.post("/forgotPassword", async (req, res, next) => {
    try {
        // taking the gmail field which is a required field 
        const { gmail } = req.body;

        //if gmail is not given or is undefined then send an error.
        if (!gmail) {
            return next(new CustomError(400, "Gmail is a required field"));
        }

        // finding the user in the database.
        const user = await User.findOne({ gmail });

        //checking if the user doesn't exist in the database.
        if (!user) {
            return next(new CustomError(400, "No user exists with this gmail"));
        }

        //updating the forgotPasswordExpiry field of the user 
        user.forgotPasswordExpiry = (Date.now() + (1000 * 60 * 5));
        const otp = generateCode();
        const hashedOtp = await bcrypt.hash(otp, 10);

        //updating the forgotPasswordOtp field of the user
        user.forgotPasswordOtp = hashedOtp;

        //saving the changes made in the field of the user (if this line is not written then, no changes will be inflicted to the field of the user).
        await user.save();

        //sending otp to the gmail of the user.
        sendGmail(gmail, otp);

        //sending response back to the frontend.
        res.status(200).json({
            success: true,
            message: "OTP send successfully to gmail"
        })
    }
    catch (err) {
        next(err);
    }
})

//somethings are required to do in this route.
router.put("/forgotPasswordVerifyOtp", async (req, res, next) => {
    try {
        //taking field from the body.
        const { gmail, otp, newPassword, newPasswordSecond } = req.body;

        //if any of the field is undefined then send an error 
        if (!gmail || !otp) {
            return next(new CustomError(400, "Gmail and OTP are required"));
        }

        //finding the user associated with gmail. 
        const user = await User.findOne({ gmail }).select("+password");

        //if otp has expired then send an error 
        if (user.forgotPasswordExpiry < Date.now()) {
            return next(new CustomError(400, "OTP has expired"));
        }

        // comparing the otp. 
        const isMatched = await bcrypt.compare(otp, user.forgotPasswordOtp);

        // otp doesn't match then send an error.
        if (!isMatched) {
            return next(new CustomError(400, "OTP is invalid"));
        }

        //comparing if given passwords match or not.
        if (newPassword !== newPasswordSecond) {
            return next(new CustomError(400, "The given passwords are not same"));
        }

        //changing password 
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        //saving the changes which have been made.
        await user.save();


        //send the reponse back to the frontend.
        res.status(200).json({
            success: true,
            message: "Password Changed Successfully"
        })






    } catch (err) {
        next(er);
    }

})

router.get("/me",isAuthenticated,async(req,res,next) => {
    try{
        const userAccount = req.user;
        res.status(200).json({
            success : true,
            me : {
                username : userAccount.myReferral,
                gmail : userAccount.gmail,
                name : userAccount.name
            }
        })
    }catch(error){
        next(error);
    }
})

export default router;