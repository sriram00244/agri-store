import { Request, Response } from 'express';
import SmallFarmerListing from '../models/SmallFarmerListing';

// Curated verified buyers for small-scale farmers in Tamil Nadu
const NEARBY_BUYERS = [
    {
        id: 'buyer-1',
        name: 'Kongu Organic Farmers Producer Co.',
        nameTa: 'கொங்கு இயற்கை உழவர் உற்பத்தியாளர் நிறுவனம்',
        type: 'FPO Aggregator',
        typeTa: 'உழவர் உற்பத்தியாளர் கூட்டமைப்பு',
        location: 'Coimbatore & Pollachi',
        locationTa: 'கோயம்புத்தூர் & பொள்ளாச்சி',
        contact: '0422-2978144',
        minQuantity: '10 kg',
        acceptedCrops: ['Tomato', 'Brinjal', 'Coconut', 'Turmeric', 'Green Chilli'],
        acceptedCropsTa: ['தக்காளி', 'கத்தரிக்காய்', 'தேங்காய்', 'மஞ்சள்', 'பச்சை மிளகாய்'],
        buyingPriceStatus: 'Premium +15% over Mandi',
        paymentTerm: 'Same-day UPI / Cash on delivery',
        paymentTermTa: 'அன்றைய தினமே UPI / ரொக்கப் பணப்பட்டுவாடா',
        verified: true
    },
    {
        id: 'buyer-2',
        name: 'Cauvery Delta Rice Procurement Centre',
        nameTa: 'காவிரி டெல்டா நெல் கொள்முதல் மையம்',
        type: 'Direct Grain Cooperative',
        typeTa: 'நேரடி நெல் கொள்முதல் கூட்டுறவு',
        location: 'Thanjavur & Tiruvarur',
        locationTa: 'தஞ்சாவூர் & திருவாரூர்',
        contact: '04362-278210',
        minQuantity: '1 Bag (60 kg)',
        acceptedCrops: ['Paddy (Ponni)', 'Paddy (CR1009)', 'Black Gram', 'Green Gram'],
        acceptedCropsTa: ['பொன்னி நெல்', 'சி.ஆர்.1009 நெல்', 'உளுந்து', 'பச்சைப்பயறு'],
        buyingPriceStatus: 'Government MSP Guaranteed',
        paymentTerm: 'Direct Bank Transfer within 24h',
        paymentTermTa: '24 மணி நேரத்திற்குள் நேரடி வங்கி பரிமாற்றம்',
        verified: true
    },
    {
        id: 'buyer-3',
        name: 'Madurai Fresh Veg Direct Retailers Network',
        nameTa: 'மதுரை காய்கறி நேரடி விற்பனை கூட்டமைப்பு',
        type: 'Local Retailer Collective',
        typeTa: 'உள்ளூர் சில்லறை வணிகர் கூட்டமைப்பு',
        location: 'Madurai & Dindigul',
        locationTa: 'மதுரை & திண்டுக்கல்',
        contact: '0452-2489031',
        minQuantity: '15 kg',
        acceptedCrops: ['Tomato', 'Small Onion', 'Lady Finger', 'Banana'],
        acceptedCropsTa: ['தக்காளி', 'சின்ன வெங்காயம்', 'வெண்டைக்காய்', 'வாழைப்பழம்'],
        buyingPriceStatus: 'Fair Wholesale Market Rate',
        paymentTerm: 'Spot Cash at Pickup',
        paymentTermTa: 'பொருட்கள் எடுக்கும்போதே நேரடி ரொக்கம்',
        verified: true
    },
    {
        id: 'buyer-4',
        name: 'Salem Uzhavar Santhai Direct Hub',
        nameTa: 'சேலம் உழவர் சந்தை நேரடி ஒருங்கிணைப்பு மையம்',
        type: 'Government Farmer Market Hub',
        typeTa: 'அரசு உழவர் சந்தை மையம்',
        location: 'Salem & Namakkal',
        locationTa: 'சேலம் & நாமக்கல்',
        contact: '0427-2311492',
        minQuantity: '5 kg (No minimum limit)',
        acceptedCrops: ['All Vegetables & Fruits'],
        acceptedCropsTa: ['அனைத்து காய்கறிகள் & பழங்கள்'],
        buyingPriceStatus: '100% Direct to Consumer, 0% Middleman Commission',
        paymentTerm: 'Direct Consumer Sales',
        paymentTermTa: 'நுகர்வோரிடமிருந்து நேரடி வருவாய்',
        verified: true
    }
];

// Comprehensive government schemes for small & marginal farmers
const GOVERNMENT_SCHEMES = [
    {
        id: 'pm-kisan',
        title: 'PM-KISAN Samman Nidhi',
        titleTa: 'பிரதம மந்திரி கிசான் சம்மான் நிதி (PM-KISAN)',
        category: 'Financial Assistance',
        categoryTa: 'நேரடி நிதி உதவி',
        benefit: '₹6,000 per year in 3 equal installments of ₹2,000 directly to bank account.',
        benefitTa: 'ஆண்டுக்கு ₹6,000 (மூன்று தவணைகளில் தலா ₹2,000) நேரடியாக வங்கி கணக்கில் செலுத்தப்படுகிறது.',
        eligibility: 'All small and marginal landholding farmer families holding cultivable land up to 2 hectares (5 acres).',
        eligibilityTa: '2 ஹெக்டேர் (5 ஏக்கர்) வரை சாகுபடி நிலம் வைத்துள்ள அனைத்து சிறு, குறு விவசாய குடும்பங்கள்.',
        documents: ['Aadhaar Card', 'Land Patta / Chitta copy', 'Active Bank Passbook'],
        documentsTa: ['ஆதார் அட்டை', 'பட்டா / சிட்டா நகல்', 'வங்கி கணக்குப் புத்தகம்'],
        officialLink: 'https://pmkisan.gov.in',
        helpline: '155261 / 1800-11-5526'
    },
    {
        id: 'kalaignar-scheme',
        title: 'Kalaignar All Village Integrated Agriculture Development Programme',
        titleTa: 'கலைஞரின் அனைத்து கிராம ஒருங்கிணைந்த வேளாண் வளர்ச்சி திட்டம்',
        category: 'State Scheme (Tamil Nadu)',
        categoryTa: 'தமிழ்நாடு அரசு திட்டம்',
        benefit: 'Free distribution of coconut saplings, vegetable seed kits, horticultural plants, micro-irrigation kits, and dryland cluster support.',
        benefitTa: 'இலவச தென்னங்கன்றுகள், காய்கறி விதை தளைகள், தோட்டக்கலை செடிகள், நுண்ணீர்ப்பாசன கருவிகள் மற்றும் மானிய உதவிகள்.',
        eligibility: 'Village panchayat farmers with special priority for marginal farmers, women farmers, and SC/ST farmers.',
        eligibilityTa: 'கிராம பஞ்சாயத்து விவசாயிகள்; சிறு, குறு, பெண் விவசாயிகள் மற்றும் ஆதிதிராவிட விவசாயிகளுக்கு முன்னுரிமை.',
        documents: ['Aadhaar Card', 'Uzhavan App Registration / Ration Card', 'Land Ownership document'],
        documentsTa: ['ஆதார் அட்டை', 'உழவன் செயலி பதிவு / குடும்ப அட்டை', 'நில ஆவணம்'],
        officialLink: 'https://www.tn.gov.in/department/1',
        helpline: '1800-180-1551 / 155304'
    },
    {
        id: 'micro-irrigation',
        title: 'Tamil Nadu Micro-Irrigation Scheme (Drip & Sprinkler)',
        titleTa: 'தமிழ்நாடு நுண்ணீர்ப்பாசன திட்டம் (சொட்டு நீர் & தெளிப்பு நீர்)',
        category: 'Irrigation Subsidy',
        categoryTa: 'பாசன மானியம்',
        benefit: '100% full subsidy for Small & Marginal Farmers (up to 5 acres); 75% subsidy for other farmers.',
        benefitTa: 'சிறு & குறு விவசாயிகளுக்கு (5 ஏக்கர் வரை) 100% முழு மானியம்; இதர விவசாயிகளுக்கு 75% மானியம்.',
        eligibility: 'Farmers having assured water source (open well, borewell, or canal) and valid land records.',
        eligibilityTa: 'நிலத்தடி நீர் ஆதாரம் (கிணறு, ஆழ்துளை கிணறு) உள்ள அனைத்து விவசாயிகளும் பயன்பெறலாம்.',
        documents: ['Patta / Chitta', 'FMB Sketch', 'Soil & Water Test Report', 'Aadhaar Card'],
        documentsTa: ['பட்டா / சிட்டா', 'எப்.எம்.பி வரைபடம்', 'மண் மற்றும் நீர் பரிசோதனை அறிக்கை', 'ஆதார் அட்டை'],
        officialLink: 'https://tnhorticulture.tn.gov.in',
        helpline: '044-28583322'
    },
    {
        id: 'pmfby-insurance',
        title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        titleTa: 'பிரதம மந்திரி பயிர் காப்பீட்டுத் திட்டம் (PMFBY)',
        category: 'Crop Insurance',
        categoryTa: 'பயிர் காப்பீடு',
        benefit: 'Comprehensive risk insurance against drought, floods, pest attack, and unseasonal rainfall with nominal farmer premium of only 1.5% to 2%.',
        benefitTa: 'வறட்சி, வெள்ளம், பூச்சித் தாக்குதல் போன்ற இயற்கை இடர்பாடுகளுக்கு வெறும் 1.5% - 2% பிரிமியத்தில் முழு இழப்பீட்டுப் பாதுகாப்பு.',
        eligibility: 'All farmers cultivating notified crops in notified areas (both loanee and non-loanee farmers).',
        eligibilityTa: 'அறிவிக்கப்பட்ட பயிர்களை சாகுபடி செய்யும் அனைத்து சிறு, குறு விவசாயிகள் (கடன் பெற்றோர் & பெறாதோர்).',
        documents: ['Adangal / Crop Sowing Certificate from VAO', 'Aadhaar Card', 'Bank Passbook copy'],
        documentsTa: ['வி.ஏ.ஓ வழங்கிய அடங்கல் / பயிர் சாகுபடி சான்று', 'ஆதார் அட்டை', 'வங்கி கணக்கு நகல்'],
        officialLink: 'https://pmfby.gov.in',
        helpline: '1800-180-1551'
    },
    {
        id: 'soil-health-card',
        title: 'Soil Health Card Scheme',
        titleTa: 'மண் வள அட்டை திட்டம்',
        category: 'Soil Testing & Fertility',
        categoryTa: 'மண் பரிசோதனை & வளம்',
        benefit: 'Free testing of 12 critical soil nutrient parameters (N, P, K, micro-nutrients, pH, EC) and customized fertilizer dosage recommendations to cut input costs.',
        benefitTa: '12 வகையான மண் சத்துக்களை இலவசமாக ஆய்வு செய்து, உரச் செலவை குறைக்க பரிந்துரைகள் அடங்கிய மண் வள அட்டை இலவசம்.',
        eligibility: 'All farmers across Tamil Nadu.',
        eligibilityTa: 'தமிழ்நாட்டின் அனைத்து விவசாயிகளும்.',
        documents: ['Soil Sample', 'Farmer Name & Survey Number'],
        documentsTa: ['மண் மாதிரி', 'விவசாயி பெயர் மற்றும் புல எண் (சர்வே எண்)'],
        officialLink: 'https://soilhealth.dac.gov.in',
        helpline: '1800-180-1551'
    }
];

// Active Farmer Producer Organizations (FPOs) and Cooperatives
const FARMER_GROUPS = [
    {
        name: 'Thanjavur Delta Organic Farmers Producer Company Ltd',
        nameTa: 'தஞ்சாவூர் டெல்டா இயற்கை உழவர் உற்பத்தியாளர் நிறுவனம்',
        location: 'Thanjavur, Tamil Nadu',
        locationTa: 'தஞ்சாவூர், தமிழ்நாடு',
        members: '1,250+ Small Farmers',
        membersTa: '1,250+ சிறு விவசாயிகள்',
        services: ['Bulk seed & bio-fertilizer procurement (20% off)', 'Shared tractor & harvester hiring', 'Direct collective export & milling'],
        servicesTa: ['மொத்த விதை & இயற்கை உர கொள்முதல் (20% தள்ளுபடி)', 'குறைந்த வாடகையில் டிராக்டர் & அறுவடை இயந்திரம்', 'கூட்டு நெல் அரைவை & நேரடி விற்பனை'],
        contact: '04362-255140'
    },
    {
        name: 'Annamalai Western Ghats Horticulture FPO',
        nameTa: 'ஆனைமலை மேற்கு தொடர்ச்சி மலை தோட்டக்கலை FPO',
        location: 'Pollachi, Coimbatore',
        locationTa: 'பொள்ளாச்சி, கோயம்புத்தூர்',
        members: '980+ Small Farmers',
        membersTa: '980+ சிறு விவசாயிகள்',
        services: ['Cold storage access for small batches', 'Coconut & Banana value-addition units', 'Direct weekly farmer markets in Chennai'],
        servicesTa: ['சிறு அளவிலான உற்பத்திக்கும் குளிர்சாதன கிடங்கு வசதி', 'தேங்காய் & வாழை மதிப்புக்கூட்டு தயாரிப்பு', 'சென்னையில் வாராந்திர நேரடி சந்தை'],
        contact: '04259-223401'
    },
    {
        name: 'Madurai District Vegetable Growers Cooperative',
        nameTa: 'மதுரை மாவட்ட காய்கறி உற்பத்தியாளர்கள் கூட்டுறவு சங்கம்',
        location: 'Madurai, Tamil Nadu',
        locationTa: 'மதுரை, தமிழ்நாடு',
        members: '840+ Marginal Farmers',
        membersTa: '840+ குறு விவசாயிகள்',
        services: ['Pooled refrigerated transport to wholesale hubs', 'Direct supplies to restaurants & hostels', 'Zero middleman commission'],
        servicesTa: ['குறைந்த கட்டணத்தில் குளிரூட்டப்பட்ட வாகன வசதி', 'விடுதிகள் & உணவகங்களுக்கு நேரடி சப்ளை', 'இடைத்தரகர் கமிஷன் முற்றிலும் இல்லை'],
        contact: '0452-2580199'
    }
];

// Price comparison engine: Wholesale Mandi vs Retail vs MSP vs Small Farmer Direct
const MARKET_COMPARISONS = [
    {
        crop: 'Tomato',
        cropTa: 'தக்காளி',
        unit: 'kg',
        mandiPrice: 18,
        retailPrice: 35,
        mspPrice: 22,
        farmerDirectPrice: 28,
        benefitText: 'Direct sale gives farmer +₹10/kg more than Mandi!',
        benefitTextTa: 'நேரடி விற்பனையில் மண்டி விலையை விட கிலோவுக்கு ₹10 கூடுதல் லாபம்!'
    },
    {
        crop: 'Paddy (Ponni)',
        cropTa: 'பொன்னி நெல்',
        unit: 'kg',
        mandiPrice: 21,
        retailPrice: 52,
        mspPrice: 23.5,
        farmerDirectPrice: 26,
        benefitText: 'Govt Direct Purchase Centre (DPC) gives ₹23.50/kg MSP guarantee.',
        benefitTextTa: 'அரசு நேரடி கொள்முதல் நிலையத்தில் கிலோவுக்கு ₹23.50 குறைந்தபட்ச ஆதரவு விலை நிச்சயம்.'
    },
    {
        crop: 'Small Onion (Shallots)',
        cropTa: 'சின்ன வெங்காயம் (சாம்பார்)',
        unit: 'kg',
        mandiPrice: 42,
        retailPrice: 70,
        mspPrice: 50,
        farmerDirectPrice: 58,
        benefitText: 'Selling via FPO saves ₹16/kg lost to middlemen commission.',
        benefitTextTa: 'உழவர் உற்பத்தியாளர் குழு மூலம் விற்கும்போது இடைத்தரகர் கமிஷன் இன்றி ₹58 கிடைக்கும்.'
    },
    {
        crop: 'Brinjal',
        cropTa: 'கத்தரிக்காய்',
        unit: 'kg',
        mandiPrice: 22,
        retailPrice: 45,
        mspPrice: 25,
        farmerDirectPrice: 34,
        benefitText: 'Direct neighborhood supply yields +54% higher profit.',
        benefitTextTa: 'உள்ளூர் நேரடி விநியோகம் மூலம் 54% கூடுதல் லாபம் பெறலாம்.'
    },
    {
        crop: 'Banana (Poovan)',
        cropTa: 'பூவன் வாழைப்பழம்',
        unit: 'dozen',
        mandiPrice: 35,
        retailPrice: 65,
        mspPrice: 40,
        farmerDirectPrice: 50,
        benefitText: 'Direct consumer sale eliminates spoilage and middleman cuts.',
        benefitTextTa: 'நேரடி நுகர்வோர் விற்பனையில் கழிவு குறைந்து நியாயமான விலை கிடைக்கும்.'
    }
];

// Get small farmer listings
export const getSmallFarmerListings = async (req: Request, res: Response) => {
    try {
        let listings = await SmallFarmerListing.find().sort({ createdAt: -1 });

        // If no listings yet in database, seed realistic starter listings for small farmers
        if (listings.length === 0) {
            const initialListings = [
                {
                    farmerName: 'Murugesan K.',
                    mobileNumber: '9842109871',
                    district: 'Coimbatore',
                    village: 'Thondamuthur',
                    landAreaAcres: 1.5,
                    cropName: 'Tomato',
                    variety: 'Hybrid Shivam',
                    quantity: 45,
                    unit: 'kg',
                    pricePerUnit: 25,
                    harvestDate: 'Today (Fresh Plucked)',
                    description: 'Naturally grown farm fresh tomatoes. Harvested this morning. Available in 15kg crates.',
                    isOrganic: true,
                    status: 'Available'
                },
                {
                    farmerName: 'Selvi Anbarasan',
                    mobileNumber: '9443876512',
                    district: 'Thanjavur',
                    village: 'Budalur',
                    landAreaAcres: 1.0,
                    cropName: 'Black Gram (Urad Dal)',
                    variety: 'VBN-8',
                    quantity: 3,
                    unit: 'bag',
                    pricePerUnit: 4200,
                    harvestDate: 'Past 3 days',
                    description: 'Cleaned, sun-dried organic black gram directly from field. Rich protein quality.',
                    isOrganic: true,
                    status: 'Available'
                },
                {
                    farmerName: 'Palanisamy V.',
                    mobileNumber: '9789456123',
                    district: 'Salem',
                    village: 'Omalur',
                    landAreaAcres: 0.75,
                    cropName: 'Small Onion',
                    variety: 'Country Native',
                    quantity: 60,
                    unit: 'kg',
                    pricePerUnit: 52,
                    harvestDate: 'Fresh harvested',
                    description: 'Pungent native shallots with good shelf life. Direct from small family farm.',
                    isOrganic: false,
                    status: 'Available'
                },
                {
                    farmerName: 'Karthikeyan M.',
                    mobileNumber: '9629147820',
                    district: 'Madurai',
                    village: 'Alanganallur',
                    landAreaAcres: 2.0,
                    cropName: 'Brinjal (Kathirikai)',
                    variety: 'Uthiramerur Green',
                    quantity: 25,
                    unit: 'kg',
                    pricePerUnit: 30,
                    harvestDate: 'Today morning',
                    description: 'Fresh green brinjal without chemical sprays. Ready for pickup or delivery.',
                    isOrganic: true,
                    status: 'Available'
                }
            ];

            const created = await SmallFarmerListing.insertMany(initialListings);
            listings = created as any;
        }

        res.json({ success: true, count: listings.length, listings });
    } catch (error: any) {
        console.error('Error fetching small farmer listings:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch listings' });
    }
};

// Create small farmer listing
export const createSmallFarmerListing = async (req: Request, res: Response) => {
    try {
        const {
            farmerName,
            mobileNumber,
            district,
            village,
            landAreaAcres,
            cropName,
            variety,
            quantity,
            unit,
            pricePerUnit,
            harvestDate,
            description,
            isOrganic
        } = req.body;

        if (!farmerName || !mobileNumber || !district || !village || !cropName || !quantity || !pricePerUnit) {
            return res.status(400).json({ message: 'Farmer name, mobile, district, village, crop, quantity and price are required' });
        }

        const listing = new SmallFarmerListing({
            farmerName: farmerName.trim(),
            mobileNumber: mobileNumber.toString().trim(),
            district: district.trim(),
            village: village.trim(),
            landAreaAcres: Number(landAreaAcres) || 1,
            cropName: cropName.trim(),
            variety: variety || 'Standard',
            quantity: Number(quantity),
            unit: unit || 'kg',
            pricePerUnit: Number(pricePerUnit),
            harvestDate: harvestDate || 'Ready for sale',
            description: description || '',
            isOrganic: Boolean(isOrganic),
            status: 'Available'
        });

        const savedListing = await listing.save();
        res.status(201).json({
            success: true,
            message: 'Your small-quantity product has been listed successfully!',
            listing: savedListing
        });
    } catch (error: any) {
        console.error('Error creating small farmer listing:', error);
        res.status(500).json({ message: error.message || 'Failed to list product' });
    }
};

// Get nearby buyers
export const getNearbyBuyers = async (req: Request, res: Response) => {
    res.json({ success: true, count: NEARBY_BUYERS.length, buyers: NEARBY_BUYERS });
};

// Get government schemes
export const getGovernmentSchemes = async (req: Request, res: Response) => {
    res.json({ success: true, count: GOVERNMENT_SCHEMES.length, schemes: GOVERNMENT_SCHEMES });
};

// Get farmer groups & cooperatives
export const getFarmerGroups = async (req: Request, res: Response) => {
    res.json({ success: true, count: FARMER_GROUPS.length, groups: FARMER_GROUPS });
};

// Get price comparisons
export const getPriceComparisons = async (req: Request, res: Response) => {
    res.json({ success: true, count: MARKET_COMPARISONS.length, comparisons: MARKET_COMPARISONS });
};
