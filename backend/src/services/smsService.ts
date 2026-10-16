import twilio from 'twilio';

let client: any = null;

const initializeTwilio = () => {
    const accountSid = process.env.TWILIO_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (accountSid && accountSid.startsWith('AC') && authToken) {
        try {
            client = twilio(accountSid, authToken);
            return true;
        } catch (error) {
            console.error('Twilio initialization failed:', error);
            return false;
        }
    }
    return false;
};

// Initialize on load
initializeTwilio();

const validatePhoneNumber = (phone: string): boolean => {
    // E.164 format: +[1-15 digits]
    const re = /^\+[1-9]\d{1,14}$/;
    return re.test(phone);
};

export const sendSMSAlert = async (to: string, body: string) => {
    if (!client && !initializeTwilio()) {
        console.error('Data Delivery Failed: Missing Twilio Credentials');
        return { success: false, type: 'config_error', message: 'SMS service not configured' };
    }

    if (!validatePhoneNumber(to)) {
        return { success: false, type: 'invalid_number', message: 'Invalid phone number format. Use E.164 (e.g. +919876543210).' };
    }

    try {
        const message = await client.messages.create({
            body: body,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to
        });
        console.log('SMS sent:', message.sid);
        if (message.status === 'failed' || message.status === 'undelivered') {
            return {
                success: false,
                type: 'provider_error',
                message: `SMS Failed: ${message.validityPeriod}`
            };
        }
        return { success: true, type: 'real', sid: message.sid };
    } catch (error: any) {
        console.error('SMS send error:', error);
        return {
            success: false,
            type: 'provider_error',
            message: error.message || 'SMS Provider Error'
        };
    }
};

export const sendWhatsAppAlert = async (to: string, body: string) => {
    if (!client && !initializeTwilio()) {
        console.error('Data Delivery Failed: Missing Twilio Credentials');
        return { success: false, type: 'config_error', message: 'SMS service not configured' };
    }

    if (!validatePhoneNumber(to)) {
        return { success: false, type: 'invalid_number', message: 'Invalid phone number format. Use E.164 (e.g. +919876543210).' };
    }

    try {
        // Twilio Sandbox for WhatsApp requires 'whatsapp:' prefix
        const message = await client.messages.create({
            body: body,
            from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
            to: `whatsapp:${to}`
        });
        console.log('WhatsApp sent:', message.sid);
        return { success: true, type: 'real', sid: message.sid };
    } catch (error: any) {
        console.error('WhatsApp send error:', error);
        return {
            success: false,
            type: 'provider_error',
            message: error.message || 'WhatsApp Provider Error'
        };
    }
};
