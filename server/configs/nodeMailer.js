import nodemailer from 'nodemailer'

//using SMTP setting create object
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: "process.env.SMTP_USER",
    pass: "process.env.SMTP_PASS",
  },
});


const sendMail=async ({to,subject,body}) => {
    const response= await transporter.sendMail({
        from:process.env.SENDER_MAIL,
        to,
        subject,
        html:body,
    })
    return response
}

export default sendMail;