import express from "express";
import dotenv from "dotenv";
import userRouter from "./routes/user.js";
import mongoose from "mongoose";
import matchRouter from "./routes/match.js";
import questionRouter from "./routes/question.js";
import userSelectedQuestionsRouter from "./routes/userSelectedQuestions.js";
import leaderboardRouter from "./routes/leaderboard.js";
import walletRouter from "./routes/wallet.js";
import teamsRouter from "./routes/teams.js";

import cors from "cors";
dotenv.config();

//connecting the database
mongoose.connect(process.env.DB_URI,{
    dbName : "sports-trivia"
}).then(() => {
    console.log("Database connected");
}).catch((err) => {
    console.log(err);
})


const app = express();

//middlewares are used here 
app.use(express.json());
app.use(express.urlencoded({extended : true}))


//cors configuration 
app.use(cors())

app.get("/",(req,res) => {
    res.json({
        message :`Everything is working fine on the port ${process.env.PORT}`
    })
})



app.use("/user",userRouter);
app.use("/match",matchRouter);
app.use("/question",questionRouter);
app.use("/userSelectedQuestions",userSelectedQuestionsRouter);
app.use("/wallet",walletRouter);
app.use('/leaderboard',leaderboardRouter);
app.use("/teams",teamsRouter);


// error function 
app.use((err,req,res,next) => {
    if(!err.message)err.message = "Internal Server Error"
    if(!err.statusCode)err.statusCode = 500;
    
    res.status(err.statusCode).json({
        success : false,
        message : err.message,
        redirection : (err.redirection)
    })
})


app.listen(4000,() => {
    console.log(`listening on the port ${process.env.PORT}`);
})