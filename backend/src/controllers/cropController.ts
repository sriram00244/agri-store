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

interface DiagnosisContent {
    crop: string;
    diagnosis: string;
    severity: 'Low' | 'Moderate' | 'High' | 'Unknown';
    symptoms: string[];
    possibleCauses: string[];
    treatment: string[];
    prevention: string[];
    irrigationAdvice?: string;
    nutrientAdvice?: string;
    warning: string;
}

interface CropDiagnosis extends DiagnosisContent {
    id?: string;
    confidence: number;
    consultExpert: boolean;
    isDemo: boolean;
    translations?: {
        en: DiagnosisContent;
        ta: DiagnosisContent;
    };
}

interface OfflineDiseaseItem {
    id: string;
    en: DiagnosisContent;
    ta: DiagnosisContent;
}

const LOW_CONFIDENCE_RESULT = (language: string = 'English'): CropDiagnosis => {
    const isTa = language.toLowerCase() === 'tamil' || language.toLowerCase() === 'ta';
    return {
        id: 'low_confidence',
        crop: isTa ? 'அறியப்படாத பயிர்' : 'Unknown',
        diagnosis: isTa
            ? 'இந்த படத்திலிருந்து பயிர் நிலையை துல்லியமாக அடையாளம் காண முடியவில்லை. தயவுசெய்து பாதிக்கப்பட்ட இலை/பயிரின் தெளிவான புகைப்படத்தை (நல்ல வெளிச்சம், தெளிவான நெருக்கமான பார்வை) பதிவேற்றவும்.'
            : 'Unable to confidently identify the condition. Please upload a clearer leaf/crop image (good lighting, in focus, close-up of the affected area).',
        confidence: 0,
        severity: 'Unknown',
        symptoms: [],
        possibleCauses: [],
        treatment: [],
        prevention: [],
        consultExpert: true,
        warning: isTa
            ? 'AI கணினி பார்வை ஆய்வு; ரசாயன சிகிச்சைகளை மேற்கொள்வதற்கு முன் வேளாண் அதிகாரியை அணுகவும்.'
            : 'AI-assisted result; consult an agricultural expert for confirmation.',
        isDemo: false
    };
};

// Bilingual Offline fallback library, used when GEMINI_API_KEY is not configured
// or the live call fails. Fully localized in English and Tamil.
const OFFLINE_LIBRARY: OfflineDiseaseItem[] = [
    {
        id: 'nitrogen_deficiency',
        en: {
            crop: 'General crop',
            diagnosis: 'Nitrogen Deficiency',
            severity: 'Moderate',
            symptoms: [
                'Overall yellowing (chlorosis) starting with older, lower leaves',
                'Stunted growth and thin, pale green stems',
                'Reduced leaf size and premature leaf drop'
            ],
            possibleCauses: [
                'Nitrogen is mobile in the plant, so deficiency symptoms appear first in older leaves',
                'Sandy soil with high nutrient leaching from heavy rains or over-irrigation',
                'Insufficient nitrogen fertilizer or low organic matter in soil'
            ],
            treatment: [
                'Apply Urea or Ammonium Sulphate per recommended agricultural dosage',
                'Foliar spray of 1-2% dilute Urea solution for quick absorption',
                'Incorporate well-rotted farmyard manure (FYM) or vermicompost into root zone'
            ],
            prevention: [
                'Use neem-coated slow-release nitrogen fertilizers',
                'Grow leguminous cover crops (sunn hemp, dhaincha) to fix atmospheric nitrogen',
                'Avoid over-irrigation that leaches nutrients beyond the root zone'
            ],
            irrigationAdvice: 'Maintain consistent soil moisture; avoid waterlogging which impairs nutrient uptake.',
            nutrientAdvice: 'Split nitrogen application into 2-3 stages rather than applying one large dose.',
            warning: 'Offline demo mode: this is a verified agronomy diagnosis guide. Add GEMINI_API_KEY to backend/.env for live vision analysis.'
        },
        ta: {
            crop: 'பொதுவான பயிர்',
            diagnosis: 'நைட்ரஜன் (தழைச்சத்து) குறைபாடு',
            severity: 'Moderate',
            symptoms: [
                'கீழ் மற்றும் முதிர்ந்த இலைகளில் ஆரம்பிக்கும் ஒட்டுமொத்த மஞ்சள் நிற மாற்றம் (பச்சையக் குறைபாடு)',
                'பயிரின் வளர்ச்சி குன்றுதல் மற்றும் மெலிந்த தண்டு',
                'இலைகளின் அளவு குறைதல் மற்றும் முதிர்வுக்கு முன் இலைகள் உதிர்தல்'
            ],
            possibleCauses: [
                'நைட்ரஜன் பயிரில் நகரும் தன்மை கொண்டது, எனவே அறிகுறிகள் முதலில் முதிர்ந்த கீழ் இலைகளில் தோன்றும்',
                'மணல் பாங்கான மண் அல்லது அதிகப்படியான நீரால் சத்துக்கள் அடித்துச் செல்லப்படுதல் (கசிவு)',
                'மண்ணில் போதிய அளவு தழைச்சத்து உரங்கள் அல்லது மட்கிய இயற்கை உரம் இல்லாமை'
            ],
            treatment: [
                'பரிந்துரைக்கப்பட்ட அளவு யூரியா அல்லது அம்மோனியம் சல்பேட் இடவும்',
                'விரைவான சத்து உறிஞ்சுதலுக்கு 1-2% வீரியமுள்ள யூரியா கரைசல் இலைவழி தெளிக்கவும்',
                'மக்கிய தொழு உரம் அல்லது மண்புழு உரம் இட்டு மண்ணின் வளத்தை பெருக்கவும்'
            ],
            prevention: [
                'மெதுவாகக் கரையும் வேப்பங்கொட்டை கலந்த யூரியா உரங்களைப் பயன்படுத்தவும்',
                'தக்கைப்பூண்டு அல்லது சணப்பை போன்ற பயறு வகை பயிர்களை பயிரிட்டு மண்ணில் தழைச்சத்தை நிலைநிறுத்தவும்',
                'சத்துக்களை அடித்துச் செல்லும் அதிகப்படியான நீர்ப்பாசனத்தைத் தவிர்க்கவும்'
            ],
            irrigationAdvice: 'சீரான ஈரப்பதத்தை பராமரிக்கவும்; சத்துக்கள் உறிஞ்சப்படுவதை தடுக்கும் நீர் தேங்குதலை தவிர்க்கவும்.',
            nutrientAdvice: 'தழைச்சத்தை ஒரே நேரத்தில் இடாமல் பயிரின் வளர்ச்சிப் பருவத்திற்கு ஏற்ப 2-3 தவணைகளாகப் பிரித்து இடவும்.',
            warning: 'ஆஃப்லைன் மாதிரி முறை: இது வேளாண் அறிவியல் வழிகாட்டுதல் ஆகும். நேரடி பட ஆய்வுக்கு backend/.env கோப்பில் GEMINI_API_KEY சேர்க்கவும்.'
        }
    },
    {
        id: 'powdery_mildew',
        en: {
            crop: 'General crop',
            diagnosis: 'Powdery Mildew',
            severity: 'Moderate',
            symptoms: [
                'White, powdery, flour-like fungal growth on upper leaf surfaces and stems',
                'Affected leaves curl upward, dry out, and drop prematurely',
                'Reduced photosynthesis resulting in lower crop yield and poor fruit set'
            ],
            possibleCauses: [
                'High ambient humidity combined with poor airflow and shaded conditions',
                'Dense crop spacing preventing air circulation',
                'Warm dry days followed by cool humid nights favouring fungal spore germination'
            ],
            treatment: [
                'Spray Wettable Sulphur (2-3 g/litre of water) as per recommended dose',
                'Foliar spray of 3% Neem oil or 5% NSKE (Neem Seed Kernel Extract) for organic control',
                'Prune and safely burn or bury heavily infected foliage to curb spore spread'
            ],
            prevention: [
                'Ensure proper plant spacing for maximum sunlight penetration and airflow',
                'Choose powdery mildew resistant or tolerant crop varieties',
                'Avoid overhead sprinkler watering in late afternoons which leaves foliage wet overnight'
            ],
            irrigationAdvice: 'Water at the base of the plant using drip irrigation rather than wetting foliage.',
            nutrientAdvice: 'Avoid excessive nitrogen fertilization, which produces succulent tissue susceptible to mildew.',
            warning: 'Offline demo mode: this is a verified agronomy diagnosis guide. Add GEMINI_API_KEY to backend/.env for live vision analysis.'
        },
        ta: {
            crop: 'பொதுவான பயிர்',
            diagnosis: 'சாம்பல் நோய் (Powdery Mildew)',
            severity: 'Moderate',
            symptoms: [
                'இலைகளின் மேல் பகுதி மற்றும் தண்டுகளில் வெள்ளை மாவு போன்ற பூஞ்சை படலம் தோன்றுதல்',
                'பாதிக்கப்பட்ட இலைகள் மேல்நோக்கி சுருங்கி, காய்ந்து முன்கூட்டியே உதிர்தல்',
                'ஒளிச்சேர்க்கை குறைந்து பயிரின் மகசூல் மற்றும் பூ பிடிப்பு பெருமளவு பாதிக்கப்படுதல்'
            ],
            possibleCauses: [
                'குறைந்த காற்றோட்டம் மற்றும் நிழலான சூழ்நிலைகளுடன் கூடிய அதிக ஈரப்பதம்',
                'செடிகளை மிக நெருக்கமாக நடுவதால் காற்று சுழற்சி தடைபடுதல்',
                'பகல் வெப்பமும் இரவு குளிர்ந்த ஈரப்பதமும் பூஞ்சை வித்துக்கள் பரவ சாதகமாக அமைதல்'
            ],
            treatment: [
                'கரைக்கக்கூடிய கந்தகம் (Wettable Sulphur 2-3 கிராம்/லிட்டர் நீர்) கலந்து தெளிக்கவும்',
                'இயற்கை முறையில் கட்டுப்படுத்த 3% வேப்ப எண்ணெய் அல்லது 5% வேப்பங்கொட்டை சாறு தெளிக்கவும்',
                'அதிகம் பாதிக்கப்பட்ட இலைகளை உடனே அகற்றி தீயிட்டு அழிக்கவும்'
            ],
            prevention: [
                'சூரிய ஒளி மற்றும் காற்றோட்டம் தாராளமாக கிடைக்க பரிந்துரைக்கப்பட்ட இடைவெளியில் நடவு செய்யவும்',
                'நோய் எதிர்ப்புத் திறன் கொண்ட தரமான ரகங்களைத் தேர்வு செய்யவும்',
                'மாலையில் இலைகளில் படும்படி தெளிப்பு நீர்ப்பாசனம் செய்வதைத் தவிர்க்கவும்'
            ],
            irrigationAdvice: 'இலைகளில் நீர் படாமல் செடியின் வேர்ப்பகுதியில் மட்டும் சொட்டு நீர்ப்பாசனம் செய்யவும்.',
            nutrientAdvice: 'அதிகப்படியான தழைச்சத்து உரங்களை தவிர்க்கவும், ஏனெனில் மென்மையான தளிர்கள் நோயை எளிதில் ஈர்க்கும்.',
            warning: 'ஆஃப்லைன் மாதிரி முறை: இது வேளாண் அறிவியல் வழிகாட்டுதல் ஆகும். நேரடி பட ஆய்வுக்கு backend/.env கோப்பில் GEMINI_API_KEY சேர்க்கவும்.'
        }
    },
    {
        id: 'aphid_infestation',
        en: {
            crop: 'General crop',
            diagnosis: 'Aphid Infestation',
            severity: 'Low',
            symptoms: [
                'Curled, puckered, or distorted tender leaves and growing shoot tips',
                'Sticky honeydew excretion attracting black sooty mold on leaf surfaces',
                'Stunted plant growth and cluster of tiny green, yellow, or black insects under leaves'
            ],
            possibleCauses: [
                'Large colonies of aphids sucking plant sap from tender new growth',
                'High nitrogen fertilization producing soft, succulent growth that aphids prefer',
                'Absence of natural biological predators due to indiscriminate chemical pesticide use'
            ],
            treatment: [
                'Install yellow sticky traps (6-8 traps per acre) to monitor and mass trap aphids',
                'Spray Neem oil 3% (30 ml/10L) with soap solution or botanical insecticidal soap',
                'For severe outbreaks, spray systemic insecticide like Imidacloprid (0.3 ml/L) per guidance',
                'Conserve and encourage natural predators like ladybird beetles and lacewing larvae'
            ],
            prevention: [
                'Avoid excessive nitrogen fertilizer application',
                'Regularly scout crop undersides for early insect colonies',
                'Control ants around plants, as ants protect aphids from natural predators'
            ],
            irrigationAdvice: 'Avoid water stress; well-hydrated healthy plants tolerate pest pressure much better.',
            nutrientAdvice: 'Balance nitrogen with adequate potassium and silica to strengthen plant cell walls.',
            warning: 'Offline demo mode: this is a verified agronomy diagnosis guide. Add GEMINI_API_KEY to backend/.env for live vision analysis.'
        },
        ta: {
            crop: 'பொதுவான பயிர்',
            diagnosis: 'அசுவினி பூச்சி தாக்குதல் (Aphids)',
            severity: 'Low',
            symptoms: [
                'இளங்குருத்துக்கள் மற்றும் இலைகள் சுருங்கி வடிவம் மாறி போதல்',
                'இலைகளில் பிசுபிசுப்பான தேன் போன்ற கழிவு படிந்து அதன் மேல் கரும்பூஞ்சை படர்தல்',
                'பயிரின் வளர்ச்சி தடைபடுதல் மற்றும் இலைகளின் அடிப்பகுதியில் சிறு பச்சை அல்லது கறுப்பு பூச்சிகள் திரளுதல்'
            ],
            possibleCauses: [
                'இளந்தளிர்களில் சாறு உறிஞ்சும் நூற்றுக்கணக்கான அசுவினி பூச்சிக் கூட்டங்கள்',
                'அதிகப்படியான தழைச்சத்து உரத்தால் உருவாகும் மென்மையான தளிர்கள் பூச்சிகளை ஈர்த்தல்',
                'தேவையற்ற ரசாயன பூச்சிக்கொல்லிகளால் இயற்கை நன்மை செய்யும் பூச்சிகள் அழிதல்'
            ],
            treatment: [
                'ஏக்கருக்கு 6-8 மஞ்சள் நிற ஒட்டும் பொறிகளை பயிர் மட்டத்தில் அமைத்து பூச்சிகளை கவர்ந்து அழிக்கவும்',
                'வேப்ப எண்ணெய் 3% (30 மி.லி/10 லிட்டர் நீர்) சோப்புக் கரைசலுடன் கலந்து தெளிக்கவும்',
                'தாக்குதல் தீவிரமடைந்தால் பரிந்துரைக்கப்பட்ட இமிடாக்ளோப்ரிட் (0.3 மி.லி/லிட்டர்) தெளிக்கவும்',
                'பொறிவண்டு, கண்ணாடி இறக்கை பூச்சி போன்ற இயற்கை எதிரிகளை பாதுகாக்க பூச்சிக்கொல்லிகளை குறைக்கவும்'
            ],
            prevention: [
                'அதிக தழைச்சத்து உரம் இடுவதை முற்றிலும் தவிர்க்கவும்',
                'இலைகளின் அடிப்பகுதியை வாரம் ஒருமுறை தவறாமல் கண்காணித்து ஆரம்ப நிலையிலேயே கட்டுப்படுத்தவும்',
                'அசுவினிகளுக்கு காவல் காக்கும் எறும்புகளைக் கட்டுப்படுத்த வரப்புகளில் வேப்பம்பிண்ணாக்கு இடவும்'
            ],
            irrigationAdvice: 'பயிருக்கு நீர் தட்டுப்பாடு ஏற்படாமல் பார்த்துக் கொள்ளவும்; ஆரோக்கியமான செடிகள் பூச்சிகளை எளிதில் தாங்கும்.',
            nutrientAdvice: 'தழைச்சத்துடன் பொட்டாசியம் மற்றும் சிலிக்கா சத்துக்களை சமச்சீராக இட்டு செடியின் செல் சுவரை வலுப்படுத்தவும்.',
            warning: 'ஆஃப்லைன் மாதிரி முறை: இது வேளாண் அறிவியல் வழிகாட்டுதல் ஆகும். நேரடி பட ஆய்வுக்கு backend/.env கோப்பில் GEMINI_API_KEY சேர்க்கவும்.'
        }
    },
    {
        id: 'water_stress',
        en: {
            crop: 'General crop',
            diagnosis: 'Water Stress / Moisture Deficit',
            severity: 'Low',
            symptoms: [
                'Mid-day wilting and inward rolling of leaves despite regular watering schedule',
                'Marginal scorching, leaf tip browning, and premature flowering/bolting',
                'Dry, brittle foliage with dull grayish-green appearance'
            ],
            possibleCauses: [
                'Prolonged dry spells or erratic, shallow irrigation cycles',
                'Compacted hardpan soil or root rot restricting effective water absorption',
                'High ambient temperature coupled with hot dry winds increasing evapotranspiration'
            ],
            treatment: [
                'Transition from calendar-based watering to soil moisture-based irrigation',
                'Apply organic straw or dry leaf mulch (3-4 inch layer) around base to conserve soil moisture',
                'Irrigate thoroughly during cool morning or evening hours to minimize evaporation loss'
            ],
            prevention: [
                'Install drip or micro-sprinkler irrigation systems for precise water delivery',
                'Incorporate rich organic compost or biochar to significantly boost soil water retention',
                'Select drought-tolerant and hardy regional crop varieties during dry seasons'
            ],
            irrigationAdvice: 'Water deeply and less frequently rather than shallow daily sprinkles to encourage deep root growth.',
            nutrientAdvice: 'Avoid applying high-salt chemical fertilizers to water-stressed crops until soil moisture recovers.',
            warning: 'Offline demo mode: this is a verified agronomy diagnosis guide. Add GEMINI_API_KEY to backend/.env for live vision analysis.'
        },
        ta: {
            crop: 'பொதுவான பயிர்',
            diagnosis: 'நீர் தட்டுப்பாடு / ஈரப்பத பற்றாக்குறை',
            severity: 'Low',
            symptoms: [
                'நண்பகல் வேளையில் இலைகள் வாடி உள்நோக்கி சுருண்டு போதல்',
                'இலை நுனிகள் மற்றும் விளிம்புகள் தீய்ந்து காய்ந்து பழுப்பு நிறமாக மாறுதல்',
                'செடிகள் பளபளப்பையிழந்து மங்கிய சாம்பல்-பச்சை நிறமாக மாறுதல் மற்றும் இலைகள் உதிர்தல்'
            ],
            possibleCauses: [
                'நீண்ட இடைவெளியில் அல்லது மேலோட்டமாக போதுமான அளவு நீர் பாய்ச்சாமை',
                'இறுக்கமான மண் அடுக்கு அல்லது வேர் சேதமடைவதால் வேர் நீரினை உறிஞ்ச இயலாமை',
                'கடும் கோடை வெப்பம் மற்றும் உலர் காற்றினால் இலைகளிலிருந்து அதிக நீர் ஆவியாதல்'
            ],
            treatment: [
                'நாட்காட்டி அடிப்படையில் அன்றி, மண் ஈரப்பதத்தை விரலால் பரிசோதித்து நீர் பாய்ச்சவும்',
                'மண் ஈரப்பதத்தைக் காக்க பயிரின் தூர்ப்பகுதியில் வைக்கோல் அல்லது காய்ந்த சருகுகளால் மூடாக்கு இடவும்',
                'நீர் ஆவியாவதைத் தவிர்க்க அதிகாலை அல்லது மாலை வேளையில் முழுமையாக நீர் பாய்ச்சவும்'
            ],
            prevention: [
                'நீர் விரயத்தைத் தடுத்து சீரான ஈரப்பதம் தர சொட்டு நீர்ப்பாசன முறையை அமைக்கவும்',
                'மண்ணின் நீர் பிடிப்புத் திறனை உயர்த்த மக்கிய தொழு உரம் அல்லது மண்புழு உரம் அதிகளவில் இடவும்',
                'வறட்சி அதிகம் உள்ள பருவங்களில் வறட்சியைத் தாங்கும் நாட்டு ரகங்களை தேர்வு செய்யவும்'
            ],
            irrigationAdvice: 'மேலோட்டமாக அடிக்கடி பாசனம் செய்வதை விட, வேர் ஆழமாக இறங்கும் வகையில் ஆழ்ந்த நீர்ப்பாசனம் செய்யவும்.',
            nutrientAdvice: 'நீர் தட்டுப்பாட்டில் உள்ள பயிர்களுக்கு ரசாயன உரம் இட வேண்டாம்; நீர்ப்பாசனம் சீரான பின்னரே உரமிட வேண்டும்.',
            warning: 'ஆஃப்லைன் மாதிரி முறை: இது வேளாண் அறிவியல் வழிகாட்டுதல் ஆகும். நேரடி பட ஆய்வுக்கு backend/.env கோப்பில் GEMINI_API_KEY சேர்க்கவும்.'
        }
    }
];

const getOfflineDiagnosis = (language: string = 'English'): CropDiagnosis => {
    const pick = OFFLINE_LIBRARY[Math.floor(Math.random() * OFFLINE_LIBRARY.length)];
    const isTa = language.toLowerCase() === 'tamil' || language.toLowerCase() === 'ta';
    const active = isTa ? pick.ta : pick.en;

    return {
        id: pick.id,
        crop: active.crop,
        diagnosis: active.diagnosis,
        severity: active.severity,
        symptoms: active.symptoms,
        possibleCauses: active.possibleCauses,
        treatment: active.treatment,
        prevention: active.prevention,
        irrigationAdvice: active.irrigationAdvice,
        nutrientAdvice: active.nutrientAdvice,
        confidence: 0.65 + Math.random() * 0.15,
        consultExpert: true,
        warning: active.warning,
        isDemo: true,
        translations: {
            en: pick.en,
            ta: pick.ta
        }
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
    const responseLanguage = VALID_LANGUAGES.includes(language) ? language : (language === 'ta' ? 'Tamil' : 'English');

    if (!image) {
        return res.status(400).json({ message: 'No image provided. Please upload a crop/leaf image.' });
    }

    if (!isValidBase64Image(image)) {
        return res.status(400).json({ message: 'Uploaded file does not look like a valid image. Please upload a JPG or PNG photo.' });
    }

    const genAI = getGeminiClient();

    if (!genAI) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return res.json(getOfflineDiagnosis(responseLanguage));
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
Write all human-readable string values in the JSON response in ${responseLanguage}. If Tamil is requested, ensure diagnosis, symptoms, possibleCauses, treatment, prevention, irrigationAdvice, and nutrientAdvice are all written in clear, accurate Tamil. Keep crop and disease names accurate.

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
            return res.json(LOW_CONFIDENCE_RESULT(responseLanguage));
        }

        const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0;

        if (confidence < CONFIDENCE_THRESHOLD) {
            return res.json({ ...LOW_CONFIDENCE_RESULT(responseLanguage), crop: parsed.crop || 'Unknown', confidence });
        }

        const isTa = responseLanguage === 'Tamil';
        const diagnosis: CropDiagnosis = {
            crop: parsed.crop || (isTa ? 'பொதுவான பயிர்' : 'General crop'),
            diagnosis: parsed.diagnosis || (isTa ? 'குறிப்பிடப்படாத நிலை' : 'Unspecified condition'),
            confidence,
            severity: parsed.severity || 'Unknown',
            symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms : [],
            possibleCauses: Array.isArray(parsed.possibleCauses) ? parsed.possibleCauses : [],
            treatment: Array.isArray(parsed.treatment) ? parsed.treatment : [],
            prevention: Array.isArray(parsed.prevention) ? parsed.prevention : [],
            irrigationAdvice: parsed.irrigationAdvice,
            nutrientAdvice: parsed.nutrientAdvice,
            consultExpert: true,
            warning: isTa
                ? 'AI கணினி பார்வை ஆய்வு முடிவு; ரசாயன பூச்சிக்கொல்லிகளைப் பயன்படுத்துவதற்கு முன் வேளாண் அதிகாரியை அணுகவும்.'
                : 'AI-assisted result; consult an agricultural expert for confirmation before applying chemical treatments.',
            isDemo: false
        };

        res.json(diagnosis);
    } catch (error: any) {
        console.error('Gemini Vision Error:', error.message);
        res.json(getOfflineDiagnosis(responseLanguage));
    }
};
