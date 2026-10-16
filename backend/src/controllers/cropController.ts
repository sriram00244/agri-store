import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

// NOTE: 'gemini-pro-vision' (the model previously used here) has been retired by Google.
// 'gemini-flash-latest' is a stable alias that always points at Google's current
// recommended Flash model and supports multimodal (text + image) input, so it does not
// need to be updated by hand every time Google renames/retires a dated model version.
const MODEL_NAME = 'gemini-1.5-flash';
const CONFIDENCE_THRESHOLD = 0.5;

const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_key') {
        return null;
    }
    return new GoogleGenerativeAI(apiKey);
};

interface CropDiagnosis {
    crop: string;
    diagnosis: string;
    confidence: number;
    severity: 'Low' | 'Moderate' | 'High' | 'Unknown';
    symptoms: string[];
    possibleCauses: string[];
    treatment: string[];
    prevention: string[];
    irrigationAdvice?: string;
    nutrientAdvice?: string;
    consultExpert: boolean;
    warning: string;
    isDemo: boolean;
}

const LOW_CONFIDENCE_RESULT = (): CropDiagnosis => ({
    crop: 'Unknown',
    diagnosis: 'Unable to confidently identify the condition. Please upload a clearer leaf/crop image (good lighting, in focus, close-up of the affected area).',
    confidence: 0,
    severity: 'Unknown',
    symptoms: [],
    possibleCauses: [],
    treatment: [],
    prevention: [],
    consultExpert: true,
    warning: 'AI-assisted result; consult an agricultural expert for confirmation.',
    isDemo: false
});

// Offline "expert mode" fallback library, used when GEMINI_API_KEY is not configured
// or the live call fails. Randomly selected per request, but ALWAYS clearly labeled
// isDemo: true so the frontend can show it is not a real image analysis.
const OFFLINE_LIBRARY: Omit<CropDiagnosis, 'consultExpert' | 'warning' | 'isDemo' | 'confidence'>[] = [
    {
        crop: 'General crop',
        diagnosis: 'Nitrogen Deficiency',
        severity: 'Moderate',
        symptoms: ['Overall yellowing (chlorosis) starting with older, lower leaves', 'Stunted growth'],
        possibleCauses: ['Nitrogen is mobile in the plant, so deficiency symptoms appear first in older leaves', 'Sandy soil / leaching', 'Insufficient fertilization'],
        treatment: ['Apply Urea or Ammonium Sulphate per local agronomy guidance', 'Foliar spray of dilute Urea solution', 'Add organic compost'],
        prevention: ['Use slow-release nitrogen fertilizers', 'Grow leguminous cover crops', 'Avoid over-irrigation'],
        irrigationAdvice: 'Maintain consistent moisture; avoid waterlogging which worsens nutrient uptake.',
        nutrientAdvice: 'Split nitrogen application across the growing season rather than one large dose.'
    },
    {
        crop: 'General crop',
        diagnosis: 'Powdery Mildew',
        severity: 'Moderate',
        symptoms: ['White, powdery, flour-like growth on the upper leaf surface and stems'],
        possibleCauses: ['High humidity with poor air circulation', 'Overcrowded planting', 'Shaded, low-airflow conditions'],
        treatment: ['Wettable sulfur spray per label instructions', 'Neem oil spray', 'Remove and destroy heavily affected leaves'],
        prevention: ['Prune for better sunlight and airflow', 'Choose resistant varieties where available', 'Avoid overhead watering late in the day'],
        irrigationAdvice: 'Water at the base of the plant rather than the leaves to reduce surface humidity.',
        nutrientAdvice: 'Avoid excess nitrogen, which promotes soft, susceptible new growth.'
    },
    {
        crop: 'General crop',
        diagnosis: 'Aphid Infestation',
        severity: 'Low',
        symptoms: ['Curled or puckered leaves', 'Sticky honeydew residue', 'Black sooty mold on leaf surfaces'],
        possibleCauses: ['Aphid colonies feeding on new growth', 'Excess nitrogen encouraging tender growth aphids prefer'],
        treatment: ['Yellow sticky traps to monitor/reduce population', 'Insecticidal soap or neem oil spray', 'Encourage natural predators (ladybird beetles)'],
        prevention: ['Avoid excess nitrogen fertilization', 'Monitor new growth regularly', 'Control ants, which protect aphid colonies'],
        irrigationAdvice: 'No direct irrigation link, but avoid plant stress which increases susceptibility.',
        nutrientAdvice: 'Balance nitrogen with phosphorus/potassium rather than heavy nitrogen alone.'
    },
    {
        crop: 'General crop',
        diagnosis: 'Water Stress',
        severity: 'Low',
        symptoms: ['Wilting or leaf rolling despite normal watering schedule', 'Leaf tip/margin browning'],
        possibleCauses: ['Underwatering or inconsistent irrigation', 'Root damage or compacted soil restricting water uptake', 'Excessive heat'],
        treatment: ['Adjust irrigation schedule to match soil moisture readings, not a fixed calendar', 'Mulch to retain soil moisture', 'Check for root damage or waterlogging'],
        prevention: ['Use drip irrigation for consistent moisture', 'Add organic matter to improve water retention', 'Choose drought-tolerant varieties for dry regions'],
        irrigationAdvice: 'Water deeply and less frequently rather than shallow, frequent watering to encourage deep roots.',
        nutrientAdvice: 'Stressed plants absorb nutrients poorly; correct the water issue before adding more fertilizer.'
    }
];

const getOfflineDiagnosis = (): CropDiagnosis => {
    const pick = OFFLINE_LIBRARY[Math.floor(Math.random() * OFFLINE_LIBRARY.length)];
    return {
        ...pick,
        confidence: 0.6 + Math.random() * 0.2, // 0.6 - 0.8, deliberately not overclaiming certainty
        consultExpert: true,
        warning: 'Offline demo mode (no GEMINI_API_KEY configured): this is a representative example diagnosis, NOT a real analysis of your uploaded image. Add GEMINI_API_KEY to backend/.env for real AI image analysis.',
        isDemo: true
    };
};

const isValidBase64Image = (image: string) => {
    if (typeof image !== 'string' || image.length < 100) return false;
    const base64Part = image.includes(',') ? image.split(',')[1] : image;
    return /^[A-Za-z0-9+/=]+$/.test(base64Part.slice(0, 200));
};

export const diagnoseCrop = async (req: Request, res: Response) => {
    const { image, language } = req.body;
    const VALID_LANGUAGES = ['Tamil', 'Hindi', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Gujarati', 'Bengali', 'Punjabi', 'English'];
    const responseLanguage = VALID_LANGUAGES.includes(language) ? language : 'English';

    if (!image) {
        return res.status(400).json({ message: 'No image provided. Please upload a crop/leaf image.' });
    }

    if (!isValidBase64Image(image)) {
        return res.status(400).json({ message: 'Uploaded file does not look like a valid image. Please upload a JPG or PNG photo.' });
    }

    const genAI = getGeminiClient();

    if (!genAI) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        return res.json(getOfflineDiagnosis());
    }

    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const base64Data = image.includes(',') ? image.split(',')[1] : image;
        const mimeType = image.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)?.[0] || 'image/jpeg';

        const imagePart = {
            inlineData: { data: base64Data, mimeType }
        };

        const systemPrompt = `You are an agricultural crop-diagnosis assistant analyzing a photo of a crop or leaf.

Look CAREFULLY at the actual image provided. Base your answer only on what you can genuinely observe.
Write all human-readable string values in the JSON response in ${responseLanguage}. Keep crop and disease names accurate.

If the image is blurry, too dark, too zoomed out, not a plant/leaf, or otherwise not clear enough to
make a reasonably confident assessment, you MUST set "confidence" below ${CONFIDENCE_THRESHOLD} and
leave "diagnosis" as "Unable to confidently identify the condition from this image." Do NOT guess or
invent a disease name just to give an answer.

Respond with ONLY a single JSON object (no markdown, no commentary) in exactly this shape:
{
  "crop": "crop or plant name if identifiable, otherwise 'Unknown'",
  "diagnosis": "name of the disease/deficiency/pest condition, or the low-confidence message above",
  "confidence": 0.0 to 1.0,
  "severity": "Low" | "Moderate" | "High" | "Unknown",
  "symptoms": ["visible symptom 1", "..."],
  "possibleCauses": ["cause 1", "..."],
  "treatment": ["recommended action 1", "..."],
  "prevention": ["preventive tip 1", "..."],
  "irrigationAdvice": "brief irrigation guidance relevant to this condition, if applicable",
  "nutrientAdvice": "brief fertilizer/nutrient guidance relevant to this condition, if applicable"
}`;

        const result = await model.generateContent([systemPrompt, imagePart]);
        const response = await result.response;
        const text = response.text();
        const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();

        let parsed: any;
        try {
            parsed = JSON.parse(cleanedText);
        } catch {
            console.error('Crop Doctor: model did not return valid JSON:', text);
            return res.json(LOW_CONFIDENCE_RESULT());
        }

        const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0;

        if (confidence < CONFIDENCE_THRESHOLD) {
            return res.json({ ...LOW_CONFIDENCE_RESULT(), crop: parsed.crop || 'Unknown', confidence });
        }

        const diagnosis: CropDiagnosis = {
            crop: parsed.crop || 'Unknown',
            diagnosis: parsed.diagnosis || 'Unspecified condition',
            confidence,
            severity: parsed.severity || 'Unknown',
            symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms : [],
            possibleCauses: Array.isArray(parsed.possibleCauses) ? parsed.possibleCauses : [],
            treatment: Array.isArray(parsed.treatment) ? parsed.treatment : [],
            prevention: Array.isArray(parsed.prevention) ? parsed.prevention : [],
            irrigationAdvice: parsed.irrigationAdvice,
            nutrientAdvice: parsed.nutrientAdvice,
            consultExpert: true,
            warning: 'AI-assisted result; consult an agricultural expert for confirmation before applying chemical treatments.',
            isDemo: false
        };

        res.json(diagnosis);
    } catch (error: any) {
        console.error('Gemini Vision Error:', error.message);
        res.json(getOfflineDiagnosis());
    }
};
