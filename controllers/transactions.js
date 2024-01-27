
export const createTransaction = async(description, user,amount,isReferral) => {
    const newTransaction = {
        description,
        amount
    }
    user.transactions.push(newTransaction);

    //if the type of money to increase of decrease is referral then do it for that.
    if(isReferral){
        user.walletBalance.referralWinning += (Number)(amount);
    }
    else{
        user.walletBalance.matchWinning += (Number)(amount);
    }
    await user.save();
}

