//method for checking the custom role
export const customRole = (...role) => {
    // it returns the reference to a function it self.
    return (req, res,next) => {
        if(role.includes(req.user.role)){
            next();
        }
        else{
            next(new customError("You are not allowed to proceed further",403));
        }
    }
}