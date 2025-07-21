const nodemailer = require('nodemailer')
const MailGen = require('mailgen')




const sendEmail = async(subject, send_to,template, reply_to, cc)=>{
    //create an email transporter 
    const transporter = nodemailer.createTransport({
        service:'gmail',
        host:process.env.EMAIL_HOST,
        port:587,
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASS
        }

    });
    const mailGenerator = new MailGen({
        theme:'salted',
        product:{
            name:'Regno Hospital',
            link:'https://regno-hospital-app.vercel.app'
        }
    });

    const emailTemplate = mailGenerator.generate(template)

    // Options for sending an email
    const options ={
        from:process.env.EMAIL_USER,
        to:send_to,
        replyTo:reply_to,
        subject,
        html:emailTemplate,
        cc

    };
    try{
    const info = await transporter.sendMail(options)
    console.log(`${info}`)

    }catch(error){
        console.log(error)
        throw new Error(`failed to send email`)
       
    }
}

module.exports = sendEmail;