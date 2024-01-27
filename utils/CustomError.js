class CustomError extends Error {
    constructor(statusCode,message,redirection){
        super(message);
        this.statusCode = statusCode;
        this.redirection = redirection;
    }
}

export default CustomError;