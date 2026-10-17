import { useState, useMemo } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Upload, Activity, Languages, Droplets, Sprout, AlertCircle, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_BASE } from '../config';

// Bilingual translations dictionary for seamless client-side translation
// even if a diagnosis was already fetched in the other language.
const EN_TO_TA_MAP: Record<string, string> = {
    // Diagnoses
    'Nitrogen Deficiency': 'நைட்ரஜன் (தழைச்சத்து) குறைபாடு',
    'Powdery Mildew': 'சாம்பல் நோய் (Powdery Mildew)',
    'Aphid Infestation': 'அசுவினி பூச்சி தாக்குதல் (Aphids)',
    'Water Stress': 'நீர் தட்டுப்பாடு / ஈரப்பத பற்றாக்குறை',
    'Water Stress / Moisture Deficit': 'நீர் தட்டுப்பாடு / ஈரப்பத பற்றாக்குறை',
    'General crop': 'பொதுவான பயிர்',
    'Unknown': 'அறியப்படாத பயிர்',
    'Unspecified condition': 'குறிப்பிடப்படாத பயிர் நிலை',
    'Low': 'குறைந்த தீவிரம்',
    'Moderate': 'மிதமான தீவிரம்',
    'High': 'அதிக தீவிரம்',

    // Symptoms
    'Overall yellowing (chlorosis) starting with older, lower leaves': 'கீழ் மற்றும் முதிர்ந்த இலைகளில் ஆரம்பிக்கும் ஒட்டுமொத்த மஞ்சள் நிற மாற்றம் (பச்சையக் குறைபாடு)',
    'Stunted growth': 'பயிரின் வளர்ச்சி குன்றுதல் மற்றும் மெலிந்த தண்டு',
    'Stunted growth and thin, pale green stems': 'பயிரின் வளர்ச்சி குன்றுதல் மற்றும் மெலிந்த தண்டு',
    'Reduced leaf size and premature leaf drop': 'இலைகளின் அளவு குறைதல் மற்றும் முதிர்வுக்கு முன் இலைகள் உதிர்தல்',
    'White, powdery, flour-like fungal growth on upper leaf surfaces and stems': 'இலைகளின் மேல் பகுதி மற்றும் தண்டுகளில் வெள்ளை மாவு போன்ற பூஞ்சை படலம் தோன்றுதல்',
    'White, powdery, flour-like growth on the upper leaf surface and stems': 'இலைகளின் மேல் பகுதி மற்றும் தண்டுகளில் வெள்ளை மாவு போன்ற பூஞ்சை படலம் தோன்றுதல்',
    'Affected leaves curl upward, dry out, and drop prematurely': 'பாதிக்கப்பட்ட இலைகள் மேல்நோக்கி சுருங்கி, காய்ந்து முன்கூட்டியே உதிர்தல்',
    'Reduced photosynthesis resulting in lower crop yield and poor fruit set': 'ஒளிச்சேர்க்கை குறைந்து பயிரின் மகசூல் மற்றும் பூ பிடிப்பு பெருமளவு பாதிக்கப்படுதல்',
    'Curled, puckered, or distorted tender leaves and growing shoot tips': 'இளங்குருத்துக்கள் மற்றும் இலைகள் சுருங்கி வடிவம் மாறி போதல்',
    'Curled or puckered leaves': 'இளங்குருத்துக்கள் மற்றும் இலைகள் சுருங்கி வடிவம் மாறி போதல்',
    'Sticky honeydew excretion attracting black sooty mold on leaf surfaces': 'இலைகளில் பிசுபிசுப்பான தேன் போன்ற கழிவு படிந்து அதன் மேல் கரும்பூஞ்சை படர்தல்',
    'Sticky honeydew residue': 'இலைகளில் பிசுபிசுப்பான தேன் போன்ற கழிவு படிந்து அதன் மேல் கரும்பூஞ்சை படர்தல்',
    'Black sooty mold on leaf surfaces': 'இலைகளின் மேற்பரப்பில் கரும்பூஞ்சை படர்தல்',
    'Stunted plant growth and cluster of tiny green, yellow, or black insects under leaves': 'பயிரின் வளர்ச்சி தடைபடுதல் மற்றும் இலைகளின் அடிப்பகுதியில் சிறு பச்சை அல்லது கறுப்பு பூச்சிகள் திரளுதல்',
    'Mid-day wilting and inward rolling of leaves despite regular watering schedule': 'நண்பகல் வேளையில் இலைகள் வாடி உள்நோக்கி சுருண்டு போதல்',
    'Wilting or leaf rolling despite normal watering schedule': 'நண்பகல் வேளையில் இலைகள் வாடி உள்நோக்கி சுருண்டு போதல்',
    'Marginal scorching, leaf tip browning, and premature flowering/bolting': 'இலை நுனிகள் மற்றும் விளிம்புகள் தீய்ந்து காய்ந்து பழுப்பு நிறமாக மாறுதல்',
    'Leaf tip/margin browning': 'இலை நுனிகள் மற்றும் விளிம்புகள் தீய்ந்து காய்ந்து பழுப்பு நிறமாக மாறுதல்',
    'Dry, brittle foliage with dull grayish-green appearance': 'செடிகள் பளபளப்பையிழந்து மங்கிய சாம்பல்-பச்சை நிறமாக மாறுதல் மற்றும் இலைகள் உதிர்தல்',

    // Causes
    'Nitrogen is mobile in the plant, so deficiency symptoms appear first in older leaves': 'நைட்ரஜன் பயிரில் நகரும் தன்மை கொண்டது, எனவே அறிகுறிகள் முதலில் முதிர்ந்த கீழ் இலைகளில் தோன்றும்',
    'Sandy soil / leaching': 'மணல் பாங்கான மண் அல்லது அதிகப்படியான நீரால் சத்துக்கள் அடித்துச் செல்லப்படுதல் (கசிவு)',
    'Sandy soil with high nutrient leaching from heavy rains or over-irrigation': 'மணல் பாங்கான மண் அல்லது அதிகப்படியான நீரால் சத்துக்கள் அடித்துச் செல்லப்படுதல் (கசிவு)',
    'Insufficient fertilization': 'மண்ணில் போதிய அளவு தழைச்சத்து உரங்கள் அல்லது மட்கிய இயற்கை உரம் இல்லாமை',
    'Insufficient nitrogen fertilizer or low organic matter in soil': 'மண்ணில் போதிய அளவு தழைச்சத்து உரங்கள் அல்லது மட்கிய இயற்கை உரம் இல்லாமை',
    'High humidity with poor air circulation': 'குறைந்த காற்றோட்டம் மற்றும் நிழலான சூழ்நிலைகளுடன் கூடிய அதிக ஈரப்பதம்',
    'High ambient humidity combined with poor airflow and shaded conditions': 'குறைந்த காற்றோட்டம் மற்றும் நிழலான சூழ்நிலைகளுடன் கூடிய அதிக ஈரப்பதம்',
    'Overcrowded planting': 'செடிகளை மிக நெருக்கமாக நடுவதால் காற்று சுழற்சி தடைபடுதல்',
    'Dense crop spacing preventing air circulation': 'செடிகளை மிக நெருக்கமாக நடுவதால் காற்று சுழற்சி தடைபடுதல்',
    'Shaded, low-airflow conditions': 'நிழலான மற்றும் குறைந்த காற்றோட்டமுள்ள சூழ்நிலைகள்',
    'Warm dry days followed by cool humid nights favouring fungal spore germination': 'பகல் வெப்பமும் இரவு குளிர்ந்த ஈரப்பதமும் பூஞ்சை வித்துக்கள் பரவ சாதகமாக அமைதல்',
    'Aphid colonies feeding on new growth': 'இளந்தளிர்களில் சாறு உறிஞ்சும் நூற்றுக்கணக்கான அசுவினி பூச்சிக் கூட்டங்கள்',
    'Large colonies of aphids sucking plant sap from tender new growth': 'இளந்தளிர்களில் சாறு உறிஞ்சும் நூற்றுக்கணக்கான அசுவினி பூச்சிக் கூட்டங்கள்',
    'Excess nitrogen encouraging tender growth aphids prefer': 'அதிகப்படியான தழைச்சத்து உரத்தால் உருவாகும் மென்மையான தளிர்கள் பூச்சிகளை ஈர்த்தல்',
    'High nitrogen fertilization producing soft, succulent growth that aphids prefer': 'அதிகப்படியான தழைச்சத்து உரத்தால் உருவாகும் மென்மையான தளிர்கள் பூச்சிகளை ஈர்த்தல்',
    'Absence of natural biological predators due to indiscriminate chemical pesticide use': 'தேவையற்ற ரசாயன பூச்சிக்கொல்லிகளால் இயற்கை நன்மை செய்யும் பூச்சிகள் அழிதல்',
    'Underwatering or inconsistent irrigation': 'நீண்ட இடைவெளியில் அல்லது மேலோட்டமாக போதுமான அளவு நீர் பாய்ச்சாமை',
    'Prolonged dry spells or erratic, shallow irrigation cycles': 'நீண்ட இடைவெளியில் அல்லது மேலோட்டமாக போதுமான அளவு நீர் பாய்ச்சாமை',
    'Root damage or compacted soil restricting water uptake': 'இறுக்கமான மண் அடுக்கு அல்லது வேர் சேதமடைவதால் வேர் நீரினை உறிஞ்ச இயலாமை',
    'Compacted hardpan soil or root rot restricting effective water absorption': 'இறுக்கமான மண் அடுக்கு அல்லது வேர் சேதமடைவதால் வேர் நீரினை உறிஞ்ச இயலாமை',
    'Excessive heat': 'கடும் கோடை வெப்பம் மற்றும் உலர் காற்றினால் இலைகளிலிருந்து அதிக நீர் ஆவியாதல்',
    'High ambient temperature coupled with hot dry winds increasing evapotranspiration': 'கடும் கோடை வெப்பம் மற்றும் உலர் காற்றினால் இலைகளிலிருந்து அதிக நீர் ஆவியாதல்',

    // Treatments
    'Apply Urea or Ammonium Sulphate per local agronomy guidance': 'பரிந்துரைக்கப்பட்ட அளவு யூரியா அல்லது அம்மோனியம் சல்பேட் இடவும்',
    'Apply Urea or Ammonium Sulphate per recommended agricultural dosage': 'பரிந்துரைக்கப்பட்ட அளவு யூரியா அல்லது அம்மோனியம் சல்பேட் இடவும்',
    'Foliar spray of dilute Urea solution': 'விரைவான சத்து உறிஞ்சுதலுக்கு 1-2% வீரியமுள்ள யூரியா கரைசல் இலைவழி தெளிக்கவும்',
    'Foliar spray of 1-2% dilute Urea solution for quick absorption': 'விரைவான சத்து உறிஞ்சுதலுக்கு 1-2% வீரியமுள்ள யூரியா கரைசல் இலைவழி தெளிக்கவும்',
    'Add organic compost': 'மக்கிய தொழு உரம் அல்லது மண்புழு உரம் இட்டு மண்ணின் வளத்தை பெருக்கவும்',
    'Incorporate well-rotted farmyard manure (FYM) or vermicompost into root zone': 'மக்கிய தொழு உரம் அல்லது மண்புழு உரம் இட்டு மண்ணின் வளத்தை பெருக்கவும்',
    'Wettable sulfur spray per label instructions': 'கரைக்கக்கூடிய கந்தகம் (Wettable Sulphur 2-3 கிராம்/லிட்டர் நீர்) கலந்து தெளிக்கவும்',
    'Spray Wettable Sulphur (2-3 g/litre of water) as per recommended dose': 'கரைக்கக்கூடிய கந்தகம் (Wettable Sulphur 2-3 கிராம்/லிட்டர் நீர்) கலந்து தெளிக்கவும்',
    'Neem oil spray': 'இயற்கை முறையில் கட்டுப்படுத்த 3% வேப்ப எண்ணெய் அல்லது 5% வேப்பங்கொட்டை சாறு தெளிக்கவும்',
    'Foliar spray of 3% Neem oil or 5% NSKE (Neem Seed Kernel Extract) for organic control': 'இயற்கை முறையில் கட்டுப்படுத்த 3% வேப்ப எண்ணெய் அல்லது 5% வேப்பங்கொட்டை சாறு தெளிக்கவும்',
    'Remove and destroy heavily affected leaves': 'அதிகம் பாதிக்கப்பட்ட இலைகளை உடனே அகற்றி தீயிட்டு அழிக்கவும்',
    'Prune and safely burn or bury heavily infected foliage to curb spore spread': 'அதிகம் பாதிக்கப்பட்ட இலைகளை உடனே அகற்றி தீயிட்டு அழிக்கவும்',
    'Yellow sticky traps to monitor/reduce population': 'ஏக்கருக்கு 6-8 மஞ்சள் நிற ஒட்டும் பொறிகளை பயிர் மட்டத்தில் அமைத்து பூச்சிகளை கவர்ந்து அழிக்கவும்',
    'Install yellow sticky traps (6-8 traps per acre) to monitor and mass trap aphids': 'ஏக்கருக்கு 6-8 மஞ்சள் நிற ஒட்டும் பொறிகளை பயிர் மட்டத்தில் அமைத்து பூச்சிகளை கவர்ந்து அழிக்கவும்',
    'Insecticidal soap or neem oil spray': 'வேப்ப எண்ணெய் 3% (30 மி.லி/10 லிட்டர் நீர்) சோப்புக் கரைசலுடன் கலந்து தெளிக்கவும்',
    'Spray Neem oil 3% (30 ml/10L) with soap solution or botanical insecticidal soap': 'வேப்ப எண்ணெய் 3% (30 மி.லி/10 லிட்டர் நீர்) சோப்புக் கரைசலுடன் கலந்து தெளிக்கவும்',
    'Encourage natural predators (ladybird beetles)': 'பொறிவண்டு, கண்ணாடி இறக்கை பூச்சி போன்ற இயற்கை எதிரிகளை பாதுகாக்க பூச்சிக்கொல்லிகளை குறைக்கவும்',
    'Conserve and encourage natural predators like ladybird beetles and lacewing larvae': 'பொறிவண்டு, கண்ணாடி இறக்கை பூச்சி போன்ற இயற்கை எதிரிகளை பாதுகாக்க பூச்சிக்கொல்லிகளை குறைக்கவும்',
    'Adjust irrigation schedule to match soil moisture readings, not a fixed calendar': 'நாட்காட்டி அடிப்படையில் அன்றி, மண் ஈரப்பதத்தை விரலால் பரிசோதித்து நீர் பாய்ச்சவும்',
    'Transition from calendar-based watering to soil moisture-based irrigation': 'நாட்காட்டி அடிப்படையில் அன்றி, மண் ஈரப்பதத்தை விரலால் பரிசோதித்து நீர் பாய்ச்சவும்',
    'Mulch to retain soil moisture': 'மண் ஈரப்பதத்தைக் காக்க பயிரின் தூர்ப்பகுதியில் வைக்கோல் அல்லது காய்ந்த சருகுகளால் மூடாக்கு இடவும்',
    'Apply organic straw or dry leaf mulch (3-4 inch layer) around base to conserve soil moisture': 'மண் ஈரப்பதத்தைக் காக்க பயிரின் தூர்ப்பகுதியில் வைக்கோல் அல்லது காய்ந்த சருகுகளால் மூடாக்கு இடவும்',
    'Check for root damage or waterlogging': 'நீர் ஆவியாவதைத் தவிர்க்க அதிகாலை அல்லது மாலை வேளையில் முழுமையாக நீர் பாய்ச்சவும்',
    'Irrigate thoroughly during cool morning or evening hours to minimize evaporation loss': 'நீர் ஆவியாவதைத் தவிர்க்க அதிகாலை அல்லது மாலை வேளையில் முழுமையாக நீர் பாய்ச்சவும்',

    // Prevention
    'Use slow-release nitrogen fertilizers': 'மெதுவாகக் கரையும் வேப்பங்கொட்டை கலந்த யூரியா உரங்களைப் பயன்படுத்தவும்',
    'Use neem-coated slow-release nitrogen fertilizers': 'மெதுவாகக் கரையும் வேப்பங்கொட்டை கலந்த யூரியா உரங்களைப் பயன்படுத்தவும்',
    'Grow leguminous cover crops': 'தக்கைப்பூண்டு அல்லது சணப்பை போன்ற பயறு வகை பயிர்களை பயிரிட்டு மண்ணில் தழைச்சத்தை நிலைநிறுத்தவும்',
    'Grow leguminous cover crops (sunn hemp, dhaincha) to fix atmospheric nitrogen': 'தக்கைப்பூண்டு அல்லது சணப்பை போன்ற பயறு வகை பயிர்களை பயிரிட்டு மண்ணில் தழைச்சத்தை நிலைநிறுத்தவும்',
    'Avoid over-irrigation': 'சத்துக்களை அடித்துச் செல்லும் அதிகப்படியான நீர்ப்பாசனத்தைத் தவிர்க்கவும்',
    'Avoid over-irrigation that leaches nutrients beyond the root zone': 'சத்துக்களை அடித்துச் செல்லும் அதிகப்படியான நீர்ப்பாசனத்தைத் தவிர்க்கவும்',
    'Prune for better sunlight and airflow': 'சூரிய ஒளி மற்றும் காற்றோட்டம் தாராளமாக கிடைக்க பரிந்துரைக்கப்பட்ட இடைவெளியில் நடவு செய்யவும்',
    'Ensure proper plant spacing for maximum sunlight penetration and airflow': 'சூரிய ஒளி மற்றும் காற்றோட்டம் தாராளமாக கிடைக்க பரிந்துரைக்கப்பட்ட இடைவெளியில் நடவு செய்யவும்',
    'Choose resistant varieties where available': 'நோய் எதிர்ப்புத் திறன் கொண்ட தரமான ரகங்களைத் தேர்வு செய்யவும்',
    'Choose powdery mildew resistant or tolerant crop varieties': 'நோய் எதிர்ப்புத் திறன் கொண்ட தரமான ரகங்களைத் தேர்வு செய்யவும்',
    'Avoid overhead watering late in the day': 'மாலையில் இலைகளில் படும்படி தெளிப்பு நீர்ப்பாசனம் செய்வதைத் தவிர்க்கவும்',
    'Avoid overhead sprinkler watering in late afternoons which leaves foliage wet overnight': 'மாலையில் இலைகளில் படும்படி தெளிப்பு நீர்ப்பாசனம் செய்வதைத் தவிர்க்கவும்',
    'Avoid excess nitrogen fertilization': 'அதிக தழைச்சத்து உரம் இடுவதை முற்றிலும் தவிர்க்கவும்',
    'Monitor new growth regularly': 'இலைகளின் அடிப்பகுதியை வாரம் ஒருமுறை தவறாமல் கண்காணித்து ஆரம்ப நிலையிலேயே கட்டுப்படுத்தவும்',
    'Regularly scout crop undersides for early insect colonies': 'இலைகளின் அடிப்பகுதியை வாரம் ஒருமுறை தவறாமல் கண்காணித்து ஆரம்ப நிலையிலேயே கட்டுப்படுத்தவும்',
    'Control ants, which protect aphid colonies': 'அசுவினிகளுக்கு காவல் காக்கும் எறும்புகளைக் கட்டுப்படுத்த வரப்புகளில் வேப்பம்பிண்ணாக்கு இடவும்',
    'Control ants around plants, as ants protect aphids from natural predators': 'அசுவினிகளுக்கு காவல் காக்கும் எறும்புகளைக் கட்டுப்படுத்த வரப்புகளில் வேப்பம்பிண்ணாக்கு இடவும்',
    'Use drip irrigation for consistent moisture': 'நீர் விரயத்தைத் தடுத்து சீரான ஈரப்பதம் தர சொட்டு நீர்ப்பாசன முறையை அமைக்கவும்',
    'Install drip or micro-sprinkler irrigation systems for precise water delivery': 'நீர் விரயத்தைத் தடுத்து சீரான ஈரப்பதம் தர சொட்டு நீர்ப்பாசன முறையை அமைக்கவும்',
    'Add organic matter to improve water retention': 'மண்ணின் நீர் பிடிப்புத் திறனை உயர்த்த மக்கிய தொழு உரம் அல்லது மண்புழு உரம் அதிகளவில் இடவும்',
    'Incorporate rich organic compost or biochar to significantly boost soil water retention': 'மண்ணின் நீர் பிடிப்புத் திறனை உயர்த்த மக்கிய தொழு உரம் அல்லது மண்புழு உரம் அதிகளவில் இடவும்',
    'Choose drought-tolerant varieties for dry regions': 'வறட்சி அதிகம் உள்ள பருவங்களில் வறட்சியைத் தாங்கும் நாட்டு ரகங்களை தேர்வு செய்யவும்',
    'Select drought-tolerant and hardy regional crop varieties during dry seasons': 'வறட்சி அதிகம் உள்ள பருவங்களில் வறட்சியைத் தாங்கும் நாட்டு ரகங்களை தேர்வு செய்யவும்',

    // Advice
    'Maintain consistent moisture; avoid waterlogging which worsens nutrient uptake.': 'சீரான ஈரப்பதத்தை பராமரிக்கவும்; சத்துக்கள் உறிஞ்சப்படுவதை தடுக்கும் நீர் தேங்குதலை தவிர்க்கவும்.',
    'Maintain consistent soil moisture; avoid waterlogging which impairs nutrient uptake.': 'சீரான ஈரப்பதத்தை பராமரிக்கவும்; சத்துக்கள் உறிஞ்சப்படுவதை தடுக்கும் நீர் தேங்குதலை தவிர்க்கவும்.',
    'Split nitrogen application across the growing season rather than one large dose.': 'தழைச்சத்தை ஒரே நேரத்தில் இடாமல் பயிரின் வளர்ச்சிப் பருவத்திற்கு ஏற்ப 2-3 தவணைகளாகப் பிரித்து இடவும்.',
    'Split nitrogen application into 2-3 stages rather than applying one large dose.': 'தழைச்சத்தை ஒரே நேரத்தில் இடாமல் பயிரின் வளர்ச்சிப் பருவத்திற்கு ஏற்ப 2-3 தவணைகளாகப் பிரித்து இடவும்.',
    'Water at the base of the plant rather than the leaves to reduce surface humidity.': 'இலைகளில் நீர் படாமல் செடியின் வேர்ப்பகுதியில் மட்டும் சொட்டு நீர்ப்பாசனம் செய்யவும்.',
    'Water at the base of the plant using drip irrigation rather than wetting foliage.': 'இலைகளில் நீர் படாமல் செடியின் வேர்ப்பகுதியில் மட்டும் சொட்டு நீர்ப்பாசனம் செய்யவும்.',
    'Avoid excess nitrogen, which promotes soft, susceptible new growth.': 'அதிகப்படியான தழைச்சத்து உரங்களை தவிர்க்கவும், ஏனெனில் மென்மையான தளிர்கள் நோயை எளிதில் ஈர்க்கும்.',
    'Avoid excessive nitrogen fertilization, which produces succulent tissue susceptible to mildew.': 'அதிகப்படியான தழைச்சத்து உரங்களை தவிர்க்கவும், ஏனெனில் மென்மையான தளிர்கள் நோயை எளிதில் ஈர்க்கும்.',
    'No direct irrigation link, but avoid plant stress which increases susceptibility.': 'பயிருக்கு நீர் தட்டுப்பாடு ஏற்படாமல் பார்த்துக் கொள்ளவும்; ஆரோக்கியமான செடிகள் பூச்சிகளை எளிதில் தாங்கும்.',
    'Avoid water stress; well-hydrated healthy plants tolerate pest pressure much better.': 'பயிருக்கு நீர் தட்டுப்பாடு ஏற்படாமல் பார்த்துக் கொள்ளவும்; ஆரோக்கியமான செடிகள் பூச்சிகளை எளிதில் தாங்கும்.',
    'Balance nitrogen with phosphorus/potassium rather than heavy nitrogen alone.': 'தழைச்சத்துடன் பொட்டாசியம் மற்றும் சிலிக்கா சத்துக்களை சமச்சீராக இட்டு செடியின் செல் சுவரை வலுப்படுத்தவும்.',
    'Balance nitrogen with adequate potassium and silica to strengthen plant cell walls.': 'தழைச்சத்துடன் பொட்டாசியம் மற்றும் சிலிக்கா சத்துக்களை சமச்சீராக இட்டு செடியின் செல் சுவரை வலுப்படுத்தவும்.',
    'Water deeply and less frequently rather than shallow, frequent watering to encourage deep roots.': 'மேலோட்டமாக அடிக்கடி பாசனம் செய்வதை விட, வேர் ஆழமாக இறங்கும் வகையில் ஆழ்ந்த நீர்ப்பாசனம் செய்யவும்.',
    'Water deeply and less frequently rather than shallow daily sprinkles to encourage deep root growth.': 'மேலோட்டமாக அடிக்கடி பாசனம் செய்வதை விட, வேர் ஆழமாக இறங்கும் வகையில் ஆழ்ந்த நீர்ப்பாசனம் செய்யவும்.',
    'Stressed plants absorb nutrients poorly; correct the water issue before adding more fertilizer.': 'நீர் தட்டுப்பாட்டில் உள்ள பயிர்களுக்கு ரசாயன உரம் இட வேண்டாம்; நீர்ப்பாசனம் சீரான பின்னரே உரமிட வேண்டும்.',
    'Avoid applying high-salt chemical fertilizers to water-stressed crops until soil moisture recovers.': 'நீர் தட்டுப்பாட்டில் உள்ள பயிர்களுக்கு ரசாயன உரம் இட வேண்டாம்; நீர்ப்பாசனம் சீரான பின்னரே உரமிட வேண்டும்.'
};

// Create reverse Tamil -> English map
const TA_TO_EN_MAP: Record<string, string> = Object.entries(EN_TO_TA_MAP).reduce((acc, [en, ta]) => {
    acc[ta] = en;
    return acc;
}, {} as Record<string, string>);

const CropDoctor = () => {
    const { t, i18n } = useTranslation();
    const [image, setImage] = useState<string | null>(null);
    const [rawDiagnosis, setRawDiagnosis] = useState<any>(null);
    const [diagnoseError, setDiagnoseError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const currentLang = i18n.resolvedLanguage || i18n.language || 'en';
    const isTamil = currentLang.startsWith('ta');
    const isEnglish = currentLang.startsWith('en');

    const handleLanguageSwitch = (code: string) => {
        i18n.changeLanguage(code);
        if (typeof window !== 'undefined') {
            localStorage.setItem('agronix_language', code);
            document.documentElement.lang = code;
        }
    };

    const handleImageUpload = (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
            setDiagnoseError(t('uploadImageFormatError'));
            return;
        }
        if (file.size > 8 * 1024 * 1024) {
            setDiagnoseError(t('imageTooLarge'));
            return;
        }

        setDiagnoseError('');
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleDiagnose = async () => {
        if (!image) return;
        setLoading(true);
        setRawDiagnosis(null);
        setDiagnoseError('');
        try {
            const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
            const requestedLang = isTamil ? 'Tamil' : 'English';
            const { data } = await axios.post(
                `${API_BASE}/api/crop-doctor/diagnose`,
                { image, language: requestedLang },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRawDiagnosis(data);
        } catch (error: any) {
            console.error(error);
            setDiagnoseError(error.response?.data?.message || error.message || t('diagnosisError'));
        } finally {
            setLoading(false);
        }
    };

    // Dynamically localize diagnosis whenever the user toggles between English and Tamil
    const displayDiagnosis = useMemo(() => {
        if (!rawDiagnosis) return null;

        // 1. If backend attached structured translations, pick directly
        if (rawDiagnosis.translations) {
            const chosen = isTamil ? rawDiagnosis.translations.ta : rawDiagnosis.translations.en;
            if (chosen) {
                return {
                    ...rawDiagnosis,
                    ...chosen
                };
            }
        }

        // 2. Helper to translate single string
        const translateStr = (text: string | undefined): string => {
            if (!text) return '';
            if (isTamil) {
                return EN_TO_TA_MAP[text] || text;
            } else {
                return TA_TO_EN_MAP[text] || text;
            }
        };

        // 3. Helper to translate string arrays
        const translateArray = (arr: any[] | undefined): string[] => {
            if (!Array.isArray(arr)) return [];
            return arr.map((item) => (typeof item === 'string' ? translateStr(item) : String(item)));
        };

        return {
            ...rawDiagnosis,
            crop: translateStr(rawDiagnosis.crop) || (isTamil ? 'பொதுவான பயிர்' : 'General crop'),
            diagnosis: translateStr(rawDiagnosis.diagnosis) || rawDiagnosis.diagnosis,
            symptoms: translateArray(rawDiagnosis.symptoms),
            possibleCauses: translateArray(rawDiagnosis.possibleCauses),
            treatment: translateArray(rawDiagnosis.treatment),
            prevention: translateArray(rawDiagnosis.prevention),
            irrigationAdvice: translateStr(rawDiagnosis.irrigationAdvice),
            nutrientAdvice: translateStr(rawDiagnosis.nutrientAdvice),
            warning: isTamil
                ? (rawDiagnosis.isDemo
                    ? 'ஆஃப்லைன் செயல்முறை மாதிரி: இது சரிபார்க்கப்பட்ட விவசாய வழிகாட்டுதல் ஆகும். நேரடி பட ஆய்வுக்கு GEMINI_API_KEY சேர்க்கவும்.'
                    : 'AI கணினி பார்வை ஆய்வு முடிவு; ரசாயன சிகிச்சைகளை மேற்கொள்வதற்கு முன் வேளாண் அதிகாரியை அணுகவும்.')
                : (rawDiagnosis.isDemo
                    ? 'Offline demo mode: this is a verified agronomy diagnosis guide. Add GEMINI_API_KEY for live vision analysis.'
                    : 'AI-assisted result; consult an agricultural expert for confirmation before applying chemical treatments.')
        };
    }, [rawDiagnosis, isTamil]);

    return (
        <Layout
            title={t('cropDoctor')}
            subtitle={t('cropDoctorSubtitle')}
        >
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Dedicated Bilingual Language Switcher Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-emerald-500/20 dark:border-white/10 shadow-sm backdrop-blur-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
                            <Languages size={18} />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span>{isTamil ? 'மொழி தேர்வு' : 'Language Selection'}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">
                                    {isTamil ? 'தமிழ் நேரலை' : 'English Active'}
                                </span>
                            </h4>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                                {isTamil
                                    ? 'ஆங்கிலம் மற்றும் தமிழ் இடையே உடனடியாக மாற்றலாம். நோயறிதல் தகவல்களும் மாறும்.'
                                    : 'Toggle freely between English and Tamil. Diagnosis details translate instantly.'}
                            </p>
                        </div>
                    </div>

                    <div className="inline-flex items-center rounded-2xl bg-emerald-950/10 dark:bg-slate-800/80 p-1 border border-emerald-500/20 shadow-xs">
                        <button
                            type="button"
                            onClick={() => handleLanguageSwitch('en')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                isEnglish
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md font-extrabold scale-105'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            English
                        </button>
                        <button
                            type="button"
                            onClick={() => handleLanguageSwitch('ta')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                isTamil
                                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-md font-extrabold scale-105'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            தமிழ் (Tamil)
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Upload Card */}
                    <div className="rounded-3xl border border-emerald-500/15 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-6 sm:p-8 shadow-md backdrop-blur-xl transition-all">
                        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white font-display flex items-center gap-2">
                            <Upload size={20} className="text-emerald-500" />
                            {t('uploadImageTitle')}
                        </h2>
                        <div className="border-2 border-dashed border-emerald-500/30 dark:border-white/15 rounded-2xl p-8 text-center bg-emerald-500/5 dark:bg-slate-800/40 hover:bg-emerald-500/10 dark:hover:bg-slate-800/70 transition-colors">
                            {image ? (
                                <div className="space-y-4">
                                    <img src={image} alt={t('crop')} className="max-h-60 mx-auto rounded-xl shadow-md object-cover" />
                                    <button
                                        onClick={() => setImage(null)}
                                        className="text-xs font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 py-1.5 px-3 rounded-lg border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
                                    >
                                        {t('removeImage')}
                                    </button>
                                </div>
                            ) : (
                                <label className="cursor-pointer space-y-3 block">
                                    <div className="h-12 w-12 mx-auto rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                                        <Upload size={24} />
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                                        {t('clickUploadDragDrop')}<br />
                                        <span className="text-[11px] text-gray-400 dark:text-gray-500">{t('jpgPngSupported')}</span>
                                    </p>
                                    <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            )}
                        </div>
                        <button
                            onClick={handleDiagnose}
                            disabled={!image || loading}
                            className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? t('analyzing') : t('diagnoseDisease')}
                        </button>
                    </div>

                    {/* Results Card */}
                    <div className="rounded-3xl border border-emerald-500/15 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-6 sm:p-8 shadow-md backdrop-blur-xl transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white font-display flex items-center gap-2">
                                <Activity size={20} className="text-emerald-500" />
                                {t('diagnosisResult')}
                            </h2>
                            {displayDiagnosis && (
                                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/20">
                                    {isTamil ? 'தமிழ் வடிவம்' : 'English Format'}
                                </span>
                            )}
                        </div>

                        {diagnoseError && (
                            <div className="bg-rose-500/15 text-rose-700 dark:text-rose-300 p-4 rounded-2xl border border-rose-500/30 mb-4 text-xs font-semibold flex items-center gap-2">
                                <AlertCircle size={16} className="shrink-0" />
                                <span>{diagnoseError}</span>
                            </div>
                        )}

                        {displayDiagnosis ? (
                            <div className="space-y-4">
                                {displayDiagnosis.confidence < 0.5 ? (
                                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 p-4 rounded-2xl text-xs font-medium">
                                        {displayDiagnosis.diagnosis}
                                    </div>
                                ) : (
                                    <>
                                        {/* Diagnosis Header Block */}
                                        <div className="bg-rose-500/10 dark:bg-rose-950/30 p-4 rounded-2xl border border-rose-500/20 flex justify-between items-start gap-3">
                                            <div>
                                                <h3 className="font-bold text-rose-600 dark:text-rose-400 text-xs uppercase tracking-wider">
                                                    {displayDiagnosis.crop}
                                                </h3>
                                                <p className="text-xl font-extrabold text-rose-900 dark:text-rose-100 font-display mt-0.5 leading-snug">
                                                    {displayDiagnosis.diagnosis}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">{t('confidenceLabel')}</span>
                                                <span className="font-bold text-gray-900 dark:text-white text-base">
                                                    {Math.round((displayDiagnosis.confidence || 0) * 100)}%
                                                </span>
                                                <span className={`block text-[11px] font-bold mt-1 px-2.5 py-0.5 rounded-full ${
                                                    displayDiagnosis.severity === 'High'
                                                        ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                                        : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                                }`}>
                                                    {isTamil
                                                        ? (displayDiagnosis.severity === 'High' ? 'அதிக தீவிரம்' : displayDiagnosis.severity === 'Low' ? 'குறைந்த தீவிரம்' : 'மிதமான தீவிரம்')
                                                        : (displayDiagnosis.severity || 'Moderate')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Symptoms */}
                                        {displayDiagnosis.symptoms?.length > 0 && (
                                            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                                                <h3 className="font-bold text-amber-800 dark:text-amber-300 text-xs mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                                    <AlertCircle size={14} />
                                                    {t('symptoms')}
                                                </h3>
                                                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1.5 text-xs leading-relaxed">
                                                    {displayDiagnosis.symptoms.map((s: string, i: number) => (
                                                        <li key={i}>{s}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Possible Causes */}
                                        {displayDiagnosis.possibleCauses?.length > 0 && (
                                            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
                                                <h3 className="font-bold text-purple-800 dark:text-purple-300 text-xs mb-2 uppercase tracking-wider">
                                                    {t('possibleCauses')}
                                                </h3>
                                                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1.5 text-xs leading-relaxed">
                                                    {displayDiagnosis.possibleCauses.map((s: string, i: number) => (
                                                        <li key={i}>{s}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Treatment */}
                                        {displayDiagnosis.treatment?.length > 0 && (
                                            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                                                <h3 className="font-bold text-emerald-800 dark:text-emerald-300 text-xs mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                                    <ShieldCheck size={14} />
                                                    {t('treatment')}
                                                </h3>
                                                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1.5 text-xs leading-relaxed">
                                                    {displayDiagnosis.treatment.map((s: string, i: number) => (
                                                        <li key={i}>{s}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Prevention */}
                                        {displayDiagnosis.prevention?.length > 0 && (
                                            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                                                <h3 className="font-bold text-cyan-800 dark:text-cyan-300 text-xs mb-2 uppercase tracking-wider">
                                                    {t('prevention')}
                                                </h3>
                                                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1.5 text-xs leading-relaxed">
                                                    {displayDiagnosis.prevention.map((s: string, i: number) => (
                                                        <li key={i}>{s}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Irrigation Advice */}
                                        {displayDiagnosis.irrigationAdvice && (
                                            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
                                                <h3 className="font-bold text-sky-800 dark:text-sky-300 text-xs mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                                                    <Droplets size={14} className="text-sky-600 dark:text-sky-400" />
                                                    {t('irrigationAdvice')}
                                                </h3>
                                                <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                                                    {displayDiagnosis.irrigationAdvice}
                                                </p>
                                            </div>
                                        )}

                                        {/* Nutrient Advice */}
                                        {displayDiagnosis.nutrientAdvice && (
                                            <div className="rounded-2xl border border-teal-500/20 bg-teal-500/10 p-4">
                                                <h3 className="font-bold text-teal-800 dark:text-teal-300 text-xs mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                                                    <Sprout size={14} className="text-teal-600 dark:text-teal-400" />
                                                    {t('nutrientAdvice')}
                                                </h3>
                                                <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                                                    {displayDiagnosis.nutrientAdvice}
                                                </p>
                                            </div>
                                        )}

                                        {/* Advisory Notice */}
                                        {displayDiagnosis.warning && (
                                            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-2">
                                                <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                                                <span className="leading-relaxed">{displayDiagnosis.warning}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-gray-400 dark:text-gray-500">
                                <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500 mb-3">
                                    <Activity size={32} />
                                </div>
                                <p className="text-xs font-medium max-w-xs leading-relaxed">
                                    {t('cropDoctorEmptyState')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CropDoctor;
