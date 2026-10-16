import nodemailer from 'nodemailer';

const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const sendEmailAlert = async (to: string, subject: string, text: string) => {
    console.log("📧 Email Service checking credentials...");

    // Check credentials fresh every time to avoid stale state
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        console.error('❌ Missing Email Credentials in .env');
        return { success: false, type: 'config_error', message: 'Email service not configured' };
    }

    if (!validateEmail(to)) {
        return { success: false, type: 'invalid_email', message: 'Invalid email address format' };
    }

    try {
        console.log(`📧 Creating Transport for: ${user}`);
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: user,
                pass: pass
            }
        });

        // Verify connection
        await transporter.verify();
        console.log("✅ SMTP Connection Verified");

        // Send
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            text: text
        });

        console.log('✅ Email sent:', info.messageId);
        return { success: true, type: 'real', messageId: info.messageId };

    } catch (error: any) {
        console.error('❌ Email send error:', error);
        return {
            success: false,
            type: 'provider_error',
            message: error.message || 'Email Provider Error'
        };
    }
};

// No simulated mock logic. Only real.
const initializeEmail = () => { return true; }; // dummy export if needed elsewhere
