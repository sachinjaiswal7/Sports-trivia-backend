import jwt from "jsonwebtoken";
import User from "../models/user.js";
const isAuthenticated = async(req,res,next) => {
    try{
    let token = req.headers['authorization'];
    if(!token){
        return res.status(400).json({
            success : false,
            message : "Token is required"
        })
    }

    token = token.split(" ")[1];

    const decode = jwt.verify(token,process.env.JWT_SECRET_KEY);
    const user = await User.findById(decode.userId);

    if(!user){
        return res.status(400).json({
            success : false,
            message : "You are not authorized to access this route"
        })
    }
   
    req.user = user;
    next();
}catch(err){
    console.log(err);
    res.status(400).json({
        success : false,
        err,
    })

}
}


export default isAuthenticated;