import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, text: string) {
    
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "jonathanrios601@gmail.com",
            pass: "usnz gwrp ruag mokm"
        }
    });

    await transporter.sendMail({
        from: '"Soporte" <jonathanrios601@gmail.com>',
        to,
        subject,
        text
    });
}