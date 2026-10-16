
import 'dotenv/config';
import nodemailer from 'nodemailer';

const testEmail = async () => {
    console.log("Testing Email Credentials...");

    // Credentials come from .env - never hardcode real credentials in source files
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        console.error("❌ EMAIL_USER / EMAIL_PASS not set in .env");
        process.exit(1);
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: user,
            pass: pass
        }
    });

    try {
        await transporter.verify();
        console.log("✅ SMTP Connection Successful! Credentials are valid.");

        await transporter.sendMail({
            from: user,
            to: user, // Send to self
            subject: "Agronix Test Email",
            text: "If you see this, your email configuration is working perfectly!"
        });
        console.log("✅ Test Email Sent Successfully!");

    } catch (error: any) {
        console.error("❌ Email Test Failed:");
        console.error(error.message);
        if (error.response) console.error("SMTP Response:", error.response);
    }
};

testEmail();
