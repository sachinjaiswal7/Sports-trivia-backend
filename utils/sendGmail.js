import nodemailer from "nodemailer";

const sendGmail = (to,otp) => {
    //creating the transporter.
    const transporter = nodemailer.createTransport({
        service : "Gmail",
        auth : {
            user : process.env.GOOGLE_FROM_GMAIL,
            pass : process.env.GOOGLE_APP_PASSWORD
        }
    })

    // inner deatils of the mail
    const emailDetails = {
        from : process.env.GOOGLE_FROM_GMAIL,
        to : to,
        subject : "One Time Password",
        html : `<html>
        <body>
          <p>Your OTP code is: <strong>${otp}</strong>. It will expire in 5 minutes</p>
        </body>
      </html>`
    }

    // acutally sending the Gmail
    transporter.sendMail(emailDetails , (err,info) => {
        if(err){
            console.log(err);
        }
        else{
            console.log("message sent");
        }
    })
}

export default sendGmail;