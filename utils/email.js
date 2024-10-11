const nodemailer = require('nodemailer')

const sendEmail = options => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    transporter.sendMail({
        from: 'Mridul Mishra <mridulmishra2117@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    })
}

module.exports = sendEmail