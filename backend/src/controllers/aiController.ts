import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 'gemini-pro' (previously used here) has been retired by Google. 'gemini-flash-latest'
// is a stable alias that always points at Google's current recommended Flash model.
const MODEL_NAME = 'gemini-1.5-flash';

const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_key') {
        return null;
    }
    return new GoogleGenerativeAI(apiKey);
};

// Offline fallback answers, used when GEMINI_API_KEY is not configured or the live call fails.
// Keep these topic-matched (crop/topic keyword -> canned expert answer) rather than a single
// generic reply, so demo mode still feels useful without a key.
const getOfflineReply = (message: string): string => {
    const msg = message.toLowerCase();
    const disclaimer = "\n\n(Offline demo answer - general guidance, not verified against your specific field conditions. Add GEMINI_API_KEY to backend/.env for live AI answers.)";

    if (msg.includes('rice') || msg.includes('paddy')) {
        if (msg.includes('disease') || msg.includes('blast')) {
            return "Rice Blast (caused by Magnaporthe oryzae) shows as spindle-shaped grey-green lesions with dark borders, worsened by high humidity and excess nitrogen.\n\nGeneral approach:\n- Treat seed with a recommended fungicide before sowing.\n- Apply nitrogen in split doses rather than all at once.\n- Remove weed hosts and maintain field sanitation.\n- If lesions are spreading, a locally-registered fungicide spray is typically used - check with your local Krishi Vigyan Kendra (KVK) or agriculture extension office for the current recommended product and dose in your area." + disclaimer;
        }
        if (msg.includes('fertilizer')) {
            return "Rice generally needs Nitrogen, Phosphorus and Potassium in a roughly 4:2:1 ratio, adjusted for your soil test.\n\nGeneral approach:\n- Apply Nitrogen in 3 splits: basal at transplanting, active tillering, and panicle initiation.\n- Apply full Phosphorus as basal.\n- Apply Potassium as basal or split basal + panicle initiation.\n- Get a soil test done if possible - exact doses depend heavily on your soil's existing nutrient levels." + disclaimer;
        }
        return "Rice cultivation basics: use certified seed suited to your season (Kharif/Rabi), raise seedlings in a nursery for 21-25 days before transplanting, maintain a thin water film rather than continuous deep flooding, and control weeds early with a pre-emergence herbicide if needed." + disclaimer;
    }
    if (msg.includes('wheat')) {
        return "Wheat (Rabi season) does best sown in the first half of November in North India. Typical irrigation is needed at crown root initiation, tillering, jointing, flowering, milk and dough stages. Standard NPK guidance is roughly 120:60:40 kg/ha, but confirm with a local soil test." + disclaimer;
    }
    if (msg.includes('tomato')) {
        return "Tomato needs well-drained loam soil, pH 6-7, and warm sunny weather. Stake or trellis plants to reduce fruit rot and improve airflow. Blossom end rot is usually a calcium/irrigation-consistency issue rather than a disease - keep watering even, not alternating dry/flood cycles." + disclaimer;
    }
    if (msg.includes('scheme') || msg.includes('subsidy') || msg.includes('government') || msg.includes('yojana')) {
        return "India has several central and state farmer-support schemes, such as PM-KISAN (income support), PMFBY (crop insurance), Kisan Credit Card (KCC) for affordable credit, and soil health card programs. Availability, eligibility, and amounts vary by state and change over time, so please verify current details on the official pmkisan.gov.in or your state agriculture department site, or at your local Common Service Centre (CSC), rather than relying solely on this answer." + disclaimer;
    }
    if (msg.includes('pest') || msg.includes('insect')) {
        return "For general pest management: use yellow sticky traps for aphids/whiteflies and blue traps for thrips, encourage natural predators, and only spray at the Economic Threshold Level rather than on a fixed schedule. Rotate chemical classes if you do need to spray, to avoid resistance." + disclaimer;
    }
    if (msg.includes('soil')) {
        return "Get a soil test every 2-3 years for NPK, pH and organic carbon. Most Indian soils benefit from added organic matter (farmyard manure or vermicompost). Green manuring with a legume like Sesbania before the main crop is a low-cost way to add nitrogen and organic carbon." + disclaimer;
    }
    if (msg.includes('weather') || msg.includes('rain')) {
        return "Check the Weather tab for your location's forecast before planning irrigation or spraying. Avoid spraying in high wind (drift risk) and ensure drainage is clear before expected heavy rain." + disclaimer;
    }
    if (msg.includes('price') || msg.includes('market')) {
        return "Mandi prices vary daily and by market - check the Market Prices tab for current figures for your commodity/district, since prices generally drop during peak harvest glut and rise in the off-season. e-NAM (National Agriculture Market) can help access wider buyer networks." + disclaimer;
    }
    if (msg.includes('irrigat') || msg.includes('water')) {
        return "General irrigation guidance depends heavily on crop stage, soil type, and weather - as a rule of thumb, water deeply and less frequently to encourage deep roots rather than frequent shallow watering, and check soil moisture at root depth (not just the surface) before deciding to irrigate." + disclaimer;
    }
    if (msg.includes('yellow')) {
        return "Yellowing leaves can come from several different causes - nitrogen deficiency (older leaves first, whole leaf), iron deficiency (young leaves, veins stay green), overwatering/root stress, or certain diseases. Which leaves are yellowing (old vs new) and the pattern (whole leaf vs between veins) narrows it down. If you can, try the Crop Doctor tool with a clear close-up photo for a more specific assessment." + disclaimer;
    }

    return "I can help with crops, soil, irrigation, fertilizer, pests, weather, market prices, and government schemes. Could you tell me which crop and what specific issue you're seeing (e.g. 'yellow leaves on tomato, older leaves first')? That will help me give more targeted guidance." + disclaimer;
};

export const chatAssistant = async (req: Request, res: Response) => {
    const { message, context, language } = req.body;
    const VALID_LANGUAGES = ['Tamil', 'Hindi', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Gujarati', 'Bengali', 'Punjabi', 'English'];
    const responseLanguage = VALID_LANGUAGES.includes(language) ? language : 'English';

    if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ message: 'Please enter a question.' });
    }

    const genAI = getGeminiClient();

    if (!genAI) {
        await new Promise(resolve => setTimeout(resolve, 600));
        return res.json({ reply: getOfflineReply(message), isDemo: true });
    }

    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const systemPrompt = `You are the Agrostores AI Assistant, helping Indian farmers with practical questions about:
crops, farming practices, irrigation, fertilizer/nutrients, soil, weather, crop diseases, pest
management, harvesting, market prices, and government agricultural schemes.

Rules:
- Respond entirely in ${responseLanguage}, including headings and disclaimers.
- Give concise, practical, farmer-friendly answers (roughly 5-10 lines, using short points where useful).
- If the question is ambiguous or you need more detail to give a good answer (e.g. which crop, which
  symptom pattern, which region), ask a brief clarifying question instead of guessing.
- You are NOT a certified agronomist, doctor, or government official. Do not present yourself as one.
- Do not fabricate specific current market prices, weather conditions, or scheme amounts/eligibility -
  those change frequently; point the user to the Market Prices / Weather tabs or the relevant official
  source (e.g. pmkisan.gov.in) instead of inventing numbers.
- For chemical pesticide/fertilizer recommendations, give general product categories and standard
  practice, not precise dosages beyond common label guidance, and suggest confirming with a local
  agricultural extension office (KVK) before applying anything unfamiliar.
- Be clear when something is a general estimate/rule of thumb versus well-established practice.

Context provided by the app (may be empty): ${JSON.stringify(context || {})}`;

        const result = await model.generateContent(`${systemPrompt}\n\nFarmer's question: ${message}`);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text, isDemo: false });
    } catch (error: any) {
        console.error('AI Chat Error:', error.message);
        // Live call failed - fall back to offline mode rather than a bare error, but say so.
        res.json({ reply: getOfflineReply(message), isDemo: true });
    }
};
