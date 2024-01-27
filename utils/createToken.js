import jwt from "jsonwebtoken";
const createToken = (userId) => {
    const token = jwt.sign({
        userId,
        exp : Date.now() + 5 * 60 * 1000
    },process.env.JWT_SECRET_KEY);
    return token;
}

export default createToken;