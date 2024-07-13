import Transaction from "../models/transaction.js";

export const createTransaction = async(description, user,amount,isReferral,status,resOfData = {}) => {
    const newTransaction = {
        userId : user._id,
        description,
        amount,
        transactionStatus : status,
        ...resOfData
    }
    await Transaction.create(newTransaction);

    //if the type of money to increase of decrease is referral then do it for that.
    if(isReferral){
        user.walletBalance.referralWinning += (Number)(amount);
    }
    else{
        user.walletBalance.matchWinning += (Number)(amount);
    }
    await user.save();
}

