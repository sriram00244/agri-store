import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calculator,
    IndianRupee,
    TrendingUp,
    TrendingDown,
    Save,
    RotateCcw,
    Sprout,
    CheckCircle2,
    Calendar,
    Trash2,
    ArrowUpRight,
    FileSpreadsheet,
    Sparkles,
    Layers,
    Download
} from 'lucide-react';

import * as XLSX from 'xlsx';
import axios from 'axios';
import Layout from '../components/Layout';
import { useTranslation } from 'react-i18next';
import { API_BASE } from '../config';

interface CalculationReport {
    _id?: string;
    farmerName: string;
    cropName: string;
    landArea: number;
    seedsCost: number;
    fertilizerCost: number;
    labourCost: number;
    irrigationCost: number;
    pesticideCost: number;
    machineryCost: number;
    otherExpenses: number;
    totalCost: number;
    costPerAcre: number;
    expectedYield: number;
    expectedPrice: number;
    expectedRevenue: number;
    estimatedProfit: number;
    notes?: string;
    createdAt?: string | Date;
}

interface CropPreset {
    name: string;
    nameTa: string;
    defaultYield: number; // per acre
    unit: string;
    unitTa: string;
    defaultPrice: number;
    // Standard per-acre cultivation benchmark costs (TNAU / Tamil Nadu agronomy standards)
    expensesPerAcre: {
        seeds: number;
        fertilizer: number;
        labour: number;
        irrigation: number;
        pesticide: number;
        machinery: number;
        other: number;
    };
}

const COMMON_CROPS: CropPreset[] = [
    {
        name: 'Paddy (Rice)',
        nameTa: 'நெல் (பொன்னி / ஐ.ஆர்)',
        defaultYield: 24, // 24 bags/acre -> 48 bags for 2 acres
        unit: 'bags (60kg)',
        unitTa: 'மூட்டை (60கிகி)',
        defaultPrice: 1450,
        expensesPerAcre: {
            seeds: 1750,
            fertilizer: 3400,
            labour: 7250,
            irrigation: 1600,
            pesticide: 1300,
            machinery: 3500,
            other: 700
        }
    },
    {
        name: 'Tomato',
        nameTa: 'தக்காளி',
        defaultYield: 110, // 110 crates/acre -> 220 crates for 2 acres
        unit: 'crates (15kg)',
        unitTa: 'கூடை (15கிகி)',
        defaultPrice: 380,
        expensesPerAcre: {
            seeds: 2500,
            fertilizer: 5500,
            labour: 12000,
            irrigation: 2500,
            pesticide: 3800,
            machinery: 4000,
            other: 1200
        }
    },
    {
        name: 'Sugarcane',
        nameTa: 'கரும்பு',
        defaultYield: 40,
        unit: 'tonnes',
        unitTa: 'டன்கள்',
        defaultPrice: 3100,
        expensesPerAcre: {
            seeds: 6000,
            fertilizer: 8000,
            labour: 14000,
            irrigation: 4500,
            pesticide: 2000,
            machinery: 7500,
            other: 1500
        }
    },
    {
        name: 'Cotton',
        nameTa: 'பருத்தி',
        defaultYield: 12,
        unit: 'quintals',
        unitTa: 'குவிண்டால்',
        defaultPrice: 6500,
        expensesPerAcre: {
            seeds: 1600,
            fertilizer: 4200,
            labour: 8500,
            irrigation: 2200,
            pesticide: 3200,
            machinery: 3000,
            other: 1000
        }
    },
    {
        name: 'Small Onion',
        nameTa: 'சின்ன வெங்காயம்',
        defaultYield: 60,
        unit: 'quintals',
        unitTa: 'குவிண்டால்',
        defaultPrice: 4800,
        expensesPerAcre: {
            seeds: 12000,
            fertilizer: 6000,
            labour: 10500,
            irrigation: 3000,
            pesticide: 2800,
            machinery: 3500,
            other: 1200
        }
    },
    {
        name: 'Groundnut',
        nameTa: 'நிலக்கடலை',
        defaultYield: 18,
        unit: 'bags (40kg)',
        unitTa: 'மூட்டை (40கிகி)',
        defaultPrice: 2800,
        expensesPerAcre: {
            seeds: 4500,
            fertilizer: 3000,
            labour: 6500,
            irrigation: 1800,
            pesticide: 1500,
            machinery: 2800,
            other: 800
        }
    },
    {
        name: 'Banana',
        nameTa: 'வாழைப்பழம்',
        defaultYield: 1200,
        unit: 'bunches',
        unitTa: 'தார்கள்',
        defaultPrice: 220,
        expensesPerAcre: {
            seeds: 9000,
            fertilizer: 11000,
            labour: 16000,
            irrigation: 5000,
            pesticide: 3500,
            machinery: 8000,
            other: 2500
        }
    },
    {
        name: 'Turmeric',
        nameTa: 'மஞ்சள்',
        defaultYield: 25,
        unit: 'quintals',
        unitTa: 'குவிண்டால்',
        defaultPrice: 8200,
        expensesPerAcre: {
            seeds: 14000,
            fertilizer: 7500,
            labour: 12000,
            irrigation: 3800,
            pesticide: 2500,
            machinery: 5000,
            other: 2000
        }
    },
    {
        name: 'Maize (Corn)',
        nameTa: 'மக்காச்சோளம்',
        defaultYield: 30,
        unit: 'quintals',
        unitTa: 'குவிண்டால்',
        defaultPrice: 2150,
        expensesPerAcre: {
            seeds: 1500,
            fertilizer: 3200,
            labour: 5000,
            irrigation: 1800,
            pesticide: 1400,
            machinery: 3000,
            other: 800
        }
    },
    {
        name: 'Black Gram',
        nameTa: 'உளுந்து',
        defaultYield: 6,
        unit: 'quintals',
        unitTa: 'குவிண்டால்',
        defaultPrice: 6400,
        expensesPerAcre: {
            seeds: 1200,
            fertilizer: 1800,
            labour: 3500,
            irrigation: 1000,
            pesticide: 1100,
            machinery: 1800,
            other: 500
        }
    }
];

const LOCAL_STORAGE_KEY = 'agronix_saved_cultivation_reports';

const CultivationCostCalculator: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isTamil = i18n.language.startsWith('ta');

    // Input States
    const [cropName, setCropName] = useState<string>('Paddy (Rice)');
    const [customCrop, setCustomCrop] = useState<string>('');
    const [landArea, setLandArea] = useState<number | ''>(2);

    // 7 Cultivation Expenses
    const [seedsCost, setSeedsCost] = useState<number | ''>(3500);
    const [fertilizerCost, setFertilizerCost] = useState<number | ''>(6800);
    const [labourCost, setLabourCost] = useState<number | ''>(14500);
    const [irrigationCost, setIrrigationCost] = useState<number | ''>(3200);
    const [pesticideCost, setPesticideCost] = useState<number | ''>(2600);
    const [machineryCost, setMachineryCost] = useState<number | ''>(7000);
    const [otherExpenses, setOtherExpenses] = useState<number | ''>(1400);

    // Harvest & Selling Inputs
    const [expectedYield, setExpectedYield] = useState<number | ''>(48);
    const [expectedPrice, setExpectedPrice] = useState<number | ''>(1450);

    // Calculated Results
    const [totalCost, setTotalCost] = useState<number>(39000);
    const [costPerAcre, setCostPerAcre] = useState<number>(19500);
    const [expectedRevenue, setExpectedRevenue] = useState<number>(69600);
    const [estimatedProfit, setEstimatedProfit] = useState<number>(30600);
    const [profitMargin, setProfitMargin] = useState<number>(44);

    // UI & Reports State
    const [savedReports, setSavedReports] = useState<CalculationReport[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
    const [calcFeedbackMessage, setCalcFeedbackMessage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'calculator' | 'history'>('calculator');

    const activeCropDisplayName = cropName === 'Other' ? (customCrop || (isTamil ? 'வேறு பயிர்' : 'Custom Crop')) : cropName;

    // Helper: Bundle current calculation inputs into a report object
    const getCurrentReportData = (): CalculationReport => ({
        farmerName: JSON.parse(localStorage.getItem('userInfo') || '{}').name || 'Farmer',
        cropName: activeCropDisplayName,
        landArea: Number(landArea) || 1,
        seedsCost: Number(seedsCost) || 0,
        fertilizerCost: Number(fertilizerCost) || 0,
        labourCost: Number(labourCost) || 0,
        irrigationCost: Number(irrigationCost) || 0,
        pesticideCost: Number(pesticideCost) || 0,
        machineryCost: Number(machineryCost) || 0,
        otherExpenses: Number(otherExpenses) || 0,
        totalCost,
        costPerAcre,
        expectedYield: Number(expectedYield) || 0,
        expectedPrice: Number(expectedPrice) || 0,
        expectedRevenue,
        estimatedProfit,
        notes: `Calculated on ${new Date().toLocaleDateString()}`,
        createdAt: new Date().toISOString()
    });

    // Automatic calculation whenever any input changes
    const runCalculation = () => {
        const area = Number(landArea) > 0 ? Number(landArea) : 1;
        const s = Number(seedsCost) || 0;
        const f = Number(fertilizerCost) || 0;
        const l = Number(labourCost) || 0;
        const i = Number(irrigationCost) || 0;
        const p = Number(pesticideCost) || 0;
        const m = Number(machineryCost) || 0;
        const o = Number(otherExpenses) || 0;

        const sumExpenses = s + f + l + i + p + m + o;
        const perAcre = sumExpenses / area;

        const y = Number(expectedYield) || 0;
        const pr = Number(expectedPrice) || 0;
        const revenue = y * pr;
        const profit = revenue - sumExpenses;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

        setTotalCost(sumExpenses);
        setCostPerAcre(Math.round(perAcre));
        setExpectedRevenue(revenue);
        setEstimatedProfit(profit);
        setProfitMargin(Math.round(margin * 10) / 10);

        return { sumExpenses, profit, revenue };
    };

    useEffect(() => {
        runCalculation();
    }, [
        landArea,
        seedsCost,
        fertilizerCost,
        labourCost,
        irrigationCost,
        pesticideCost,
        machineryCost,
        otherExpenses,
        expectedYield,
        expectedPrice
    ]);

    // Explicit manual calculate trigger with smooth feedback
    const handleManualCalculate = () => {
        const { sumExpenses, profit } = runCalculation();
        setCalcFeedbackMessage(
            isTamil
                ? `✅ சாகுபடி செலவு கணக்கிடப்பட்டது! மொத்த செலவு: ₹${sumExpenses.toLocaleString()} | மதிப்பிடப்பட்ட லாபம்: ₹${profit.toLocaleString()}`
                : `✅ Cultivation cost calculated! Total Cost: ₹${sumExpenses.toLocaleString()} | Estimated Profit: ₹${profit.toLocaleString()}`
        );
        setTimeout(() => {
            setCalcFeedbackMessage(null);
        }, 5000);

        // Smooth scroll to results on small screens
        const resultsEl = document.getElementById('results-section');
        if (resultsEl) {
            resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    };

    // Helper to apply benchmark costs for a given crop and land area
    const applyCropExpenses = (selectedCrop: string, areaAcres: number) => {
        const match = COMMON_CROPS.find(c => c.name === selectedCrop);
        if (match) {
            const area = areaAcres > 0 ? areaAcres : 1;
            setSeedsCost(match.expensesPerAcre.seeds * area);
            setFertilizerCost(match.expensesPerAcre.fertilizer * area);
            setLabourCost(match.expensesPerAcre.labour * area);
            setIrrigationCost(match.expensesPerAcre.irrigation * area);
            setPesticideCost(match.expensesPerAcre.pesticide * area);
            setMachineryCost(match.expensesPerAcre.machinery * area);
            setOtherExpenses(match.expensesPerAcre.other * area);
            setExpectedYield(match.defaultYield * area);
            setExpectedPrice(match.defaultPrice);
        }
    };

    // Handle Quick Crop Selection
    const handleCropSelect = (selected: string) => {
        setCropName(selected);
        const area = Number(landArea) || 1;
        applyCropExpenses(selected, area);
    };

    // Handle Land Area Change
    const handleLandAreaChange = (val: string) => {
        if (val === '') {
            setLandArea('');
            return;
        }
        const num = Math.max(0.1, Number(val));
        setLandArea(num);

        const match = COMMON_CROPS.find(c => c.name === cropName);
        if (match) {
            setExpectedYield(match.defaultYield * num);
        }
    };

    // Load saved calculations on mount from backend and localStorage
    const fetchSavedReports = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            let fetchedFromApi: CalculationReport[] = [];
            try {
                const { data } = await axios.get(`${API_BASE}/api/cultivation-reports`, { headers });
                if (data && data.reports) {
                    fetchedFromApi = data.reports;
                }
            } catch (apiErr) {
                console.warn('Backend calculation reports fetch failed, falling back to local storage', apiErr);
            }

            const localSaved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
            const merged = [...fetchedFromApi];

            // Add any local items not present in backend
            localSaved.forEach((localItem: CalculationReport) => {
                if (!merged.some(m => m.totalCost === localItem.totalCost && m.cropName === localItem.cropName && m.createdAt === localItem.createdAt)) {
                    merged.push(localItem);
                }
            });

            setSavedReports(merged);
        } catch (err) {
            console.error('Error fetching reports:', err);
        }
    };

    useEffect(() => {
        fetchSavedReports();
    }, []);

    // Save calculation report into Database & LocalStorage
    const handleSaveReport = async (): Promise<CalculationReport> => {
        setIsSaving(true);
        setSaveSuccessMessage(null);

        const reportData = getCurrentReportData();

        try {
            const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            try {
                const { data } = await axios.post(`${API_BASE}/api/cultivation-reports`, reportData, { headers });
                if (data && data.report) {
                    reportData._id = data.report._id;
                }
            } catch (err) {
                console.warn('Backend save failed, saved locally', err);
            }

            // Always save to localStorage for instant offline persistence
            const localSaved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
            const updatedLocal = [reportData, ...localSaved];
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedLocal));

            setSavedReports(prev => [reportData, ...prev]);
            setSaveSuccessMessage(
                isTamil
                    ? '✅ சாகுபடி செலவு அறிக்கை வெற்றிகரமாக சேமிக்கப்பட்டது! முந்தைய கணக்கீடுகளில் காணலாம்.'
                    : '✅ Cultivation report stored successfully! You can view or download it anytime.'
            );

            setTimeout(() => {
                setSaveSuccessMessage(null);
            }, 5000);

            return reportData;
        } catch (error) {
            console.error('Error saving report:', error);
            return reportData;
        } finally {
            setIsSaving(false);
        }
    };

    // ==========================================
    // EXCEL EXPORT FUNCTIONS (.xlsx and .csv)
    // ==========================================

    // 1. Export single calculation report to Excel (.xlsx)
    const exportSingleReportToExcel = (report: CalculationReport) => {
        const rows = [
            ['AGRONIX FARM LINKAGE - CULTIVATION COST REPORT', ''],
            ['விவசாய சாகுபடி செலவு கணக்கீட்டு அறிக்கை', ''],
            ['', ''],
            ['Date / தேதி', report.createdAt ? new Date(report.createdAt).toLocaleString() : new Date().toLocaleString()],
            ['Farmer Name / விவசாயி பெயர்', report.farmerName || 'Farmer'],
            ['Crop Name / பயிரின் பெயர்', report.cropName],
            ['Land Area / நிலப் பரப்பு', `${report.landArea} Acres (ஏக்கர்)`],
            ['', ''],
            ['CULTIVATION EXPENSES / சாகுபடி செலவுகள்', 'AMOUNT / தொகை (₹)'],
            ['1. Seeds Cost / விதைச் செலவு', report.seedsCost],
            ['2. Fertilizer Cost / உரச் செலவு', report.fertilizerCost],
            ['3. Labour Cost / ஆட்கள் கூலி', report.labourCost],
            ['4. Water & Irrigation Cost / பாசனச் செலவு', report.irrigationCost],
            ['5. Pesticide & Spray Cost / பூச்சிக்கொல்லி', report.pesticideCost],
            ['6. Machinery & Transport Cost / இயந்திரம்', report.machineryCost],
            ['7. Other Expenses / இதர செலவுகள்', report.otherExpenses],
            ['----------------------------------------', '----------------'],
            ['TOTAL CULTIVATION COST / மொத்த சாகுபடி செலவு (₹)', report.totalCost],
            ['COST PER ACRE / ஏக்கருக்கான செலவு (₹/acre)', report.costPerAcre],
            ['', ''],
            ['HARVEST YIELD & REVENUE / மகசூல் & வருவாய்', ''],
            ['Expected Harvest Yield / எதிர்பார்க்கப்படும் மகசூல்', report.expectedYield],
            ['Expected Selling Price (₹) / விற்பனை விலை', report.expectedPrice],
            ['TOTAL EXPECTED REVENUE / விற்பனை வருவாய் (₹)', report.expectedRevenue],
            ['', ''],
            ['PROFIT & LOSS SUMMARY / லாப நஷ்ட அறிக்கை', ''],
            ['ESTIMATED NET PROFIT / மதிப்பிடப்பட்ட லாபம் (₹)', report.estimatedProfit],
            ['Financial Status / முடிவு', report.estimatedProfit >= 0 ? 'PROFIT (லாபம்)' : 'LOSS (நஷ்டம்)'],
            ['Profit Margin / லாப சதவீதம் (%)', report.expectedRevenue > 0 ? `${Math.round(((report.estimatedProfit / report.expectedRevenue) * 100) * 10) / 10}%` : '0%']
        ];

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [{ wch: 45 }, { wch: 25 }];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Cultivation_Cost');

        const cleanCrop = (report.cropName || 'Crop').replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `Agronix_${cleanCrop}_${report.landArea}Acres_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, filename);

        setCalcFeedbackMessage(
            isTamil
                ? `📊 Excel கோப்பு "${filename}" வெற்றிகரமாக பதிவிறக்கப்பட்டது!`
                : `📊 Excel workbook "${filename}" downloaded successfully!`
        );
        setTimeout(() => setCalcFeedbackMessage(null), 5000);
    };

    // 2. Export all saved calculation records to Excel (.xlsx)
    const exportAllReportsToExcel = () => {
        if (savedReports.length === 0) {
            alert(isTamil ? 'சேமிக்கப்பட்ட பதிவுகள் எதுவும் இல்லை!' : 'No saved records to export!');
            return;
        }

        const rows = savedReports.map((r, i) => ({
            'S.No / எண்': i + 1,
            'Date / தேதி': r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent',
            'Farmer / விவசாயி': r.farmerName || 'Farmer',
            'Crop / பயிர்': r.cropName,
            'Land Area (Acres) / பரப்பு': r.landArea,
            'Seeds Cost / விதை (₹)': r.seedsCost,
            'Fertilizer / உரம் (₹)': r.fertilizerCost,
            'Labour / கூலி (₹)': r.labourCost,
            'Irrigation / பாசனம் (₹)': r.irrigationCost,
            'Pesticides / மருந்து (₹)': r.pesticideCost,
            'Machinery / இயந்திரம் (₹)': r.machineryCost,
            'Other Expenses / இதர (₹)': r.otherExpenses,
            'Total Cost / மொத்த செலவு (₹)': r.totalCost,
            'Cost/Acre / ஏக்கர் செலவு (₹)': r.costPerAcre,
            'Yield / மகசூல்': r.expectedYield,
            'Unit Price / விலை (₹)': r.expectedPrice,
            'Revenue / வருவாய் (₹)': r.expectedRevenue,
            'Estimated Profit / லாபம் (₹)': r.estimatedProfit,
            'Result / நிலை': r.estimatedProfit >= 0 ? 'Profit (லாபம்)' : 'Loss (நஷ்டம்)'
        }));

        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [
            { wch: 10 }, { wch: 14 }, { wch: 16 }, { wch: 20 }, { wch: 18 },
            { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 16 },
            { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 14 },
            { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 14 }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'All_Calculations');

        const filename = `Agronix_Cultivation_History_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, filename);

        setCalcFeedbackMessage(
            isTamil
                ? `📊 அனைத்து (${savedReports.length}) சாகுபடி பதிவுகளும் Excel கோப்பாக பதிவிறக்கப்பட்டது!`
                : `📊 All (${savedReports.length}) records exported to Excel workbook successfully!`
        );
        setTimeout(() => setCalcFeedbackMessage(null), 5000);
    };

    // 3. Quick CSV Download
    const exportSingleReportToCSV = (report: CalculationReport) => {
        const csvContent = "\uFEFF" + [
            ['Parameter', 'Value'],
            ['Farmer Name', report.farmerName || 'Farmer'],
            ['Date', report.createdAt ? new Date(report.createdAt).toLocaleString() : new Date().toLocaleString()],
            ['Crop Name', report.cropName],
            ['Land Area (Acres)', report.landArea],
            ['Seeds Cost (₹)', report.seedsCost],
            ['Fertilizer Cost (₹)', report.fertilizerCost],
            ['Labour Cost (₹)', report.labourCost],
            ['Water & Irrigation Cost (₹)', report.irrigationCost],
            ['Pesticide & Spray Cost (₹)', report.pesticideCost],
            ['Machinery & Transport Cost (₹)', report.machineryCost],
            ['Other Expenses (₹)', report.otherExpenses],
            ['Total Cultivation Cost (₹)', report.totalCost],
            ['Cost Per Acre (₹/acre)', report.costPerAcre],
            ['Expected Harvest Yield', report.expectedYield],
            ['Expected Selling Price (₹)', report.expectedPrice],
            ['Total Expected Revenue (₹)', report.expectedRevenue],
            ['Estimated Net Profit (₹)', report.estimatedProfit]
        ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        const cleanCrop = (report.cropName || 'Crop').replace(/[^a-zA-Z0-9]/g, '_');
        link.setAttribute('download', `Agronix_${cleanCrop}_${report.landArea}Acres.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Load past report back into form
    const loadReportIntoForm = (report: CalculationReport) => {
        setCropName(report.cropName);
        setLandArea(report.landArea);
        setSeedsCost(report.seedsCost);
        setFertilizerCost(report.fertilizerCost);
        setLabourCost(report.labourCost);
        setIrrigationCost(report.irrigationCost);
        setPesticideCost(report.pesticideCost);
        setMachineryCost(report.machineryCost);
        setOtherExpenses(report.otherExpenses);
        setExpectedYield(report.expectedYield);
        setExpectedPrice(report.expectedPrice);
        setActiveTab('calculator');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Delete saved report
    const handleDeleteReport = async (report: CalculationReport, index: number) => {
        try {
            if (report._id) {
                const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                await axios.delete(`${API_BASE}/api/cultivation-reports/${report._id}`, { headers });
            }
        } catch (err) {
            console.warn('API delete error:', err);
        }

        const localSaved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
        const filtered = localSaved.filter((_: any, i: number) => i !== index);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));

        setSavedReports(prev => prev.filter((_, i) => i !== index));
    };

    // Reset Form
    const handleReset = () => {
        setLandArea(1);
        setSeedsCost(0);
        setFertilizerCost(0);
        setLabourCost(0);
        setIrrigationCost(0);
        setPesticideCost(0);
        setMachineryCost(0);
        setOtherExpenses(0);
        setExpectedYield(0);
        setExpectedPrice(0);
    };

    return (
        <Layout title={t('cultivationCost')} subtitle={t('cultivationCostSubtitle')}>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Hero Header Banner */}
                <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-900 via-teal-900 to-amber-950 p-6 md:p-8 text-white shadow-xl">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-300/40 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner shrink-0">
                                <Calculator size={32} />
                            </div>
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-200 text-xs font-semibold mb-1">
                                    <Sparkles size={12} className="text-amber-300" />
                                    <span>{t('formulaReference')}</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display text-white">
                                    {isTamil ? 'சாகுபடி செலவு கணக்கீட்டுக் கருவி' : 'Cultivation Cost Calculator'}
                                </h1>
                                <p className="text-xs md:text-sm text-emerald-100/90 max-w-xl mt-1">
                                    {isTamil
                                        ? 'விதை, உரம், ஆட்கள் கூலி, பாசனம் முதல் மகசூல் வரை துல்லியமாக கணக்கிட்டு உங்கள் நிகர லாபத்தை அறியவும்.'
                                        : 'Calculate exact farming expenses, cost per acre, expected harvest revenue and estimated net profit.'}
                                </p>
                            </div>
                        </div>

                        {/* Top Controls: Direct On-Page Language Switcher & Tab Switcher */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                            {/* On-Page Language Switcher */}
                            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/20 backdrop-blur-md">
                                <button
                                    type="button"
                                    onClick={() => i18n.changeLanguage('en')}
                                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        !isTamil
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-extrabold'
                                            : 'text-slate-200 hover:text-white'
                                    }`}
                                >
                                    English
                                </button>
                                <button
                                    type="button"
                                    onClick={() => i18n.changeLanguage('ta')}
                                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        isTamil
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-extrabold'
                                            : 'text-slate-200 hover:text-white'
                                    }`}
                                >
                                    தமிழ் (Tamil)
                                </button>
                            </div>

                            {/* Tabs Switcher */}
                            <div className="flex items-center bg-black/40 border border-white/20 p-1 rounded-2xl backdrop-blur-md">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('calculator')}
                                    className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        activeTab === 'calculator'
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-extrabold'
                                            : 'text-slate-200 hover:text-white'
                                    }`}
                                >
                                    <Calculator size={14} />
                                    <span>{isTamil ? 'கணக்கீடு' : 'Calculator'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('history')}
                                    className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        activeTab === 'history'
                                            ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 shadow-md font-extrabold'
                                            : 'text-slate-200 hover:text-white'
                                    }`}
                                >
                                    <FileSpreadsheet size={14} />
                                    <span>{isTamil ? 'சேமிக்கப்பட்டவை' : 'Saved'}</span>
                                    {savedReports.length > 0 && (
                                        <span className="bg-amber-400/30 text-amber-200 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                                            {savedReports.length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Formula reference bar */}
                    <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-emerald-100/90 font-medium">
                        <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/5">
                            <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                            <span>{t('formulaTotalCost')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/5">
                            <span className="h-2 w-2 rounded-full bg-yellow-300 shrink-0" />
                            <span>{t('formulaCostPerAcre')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/5">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                            <span>{t('formulaRevenue')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/5">
                            <span className="h-2 w-2 rounded-full bg-teal-300 shrink-0" />
                            <span>{t('formulaProfit')}</span>
                        </div>
                    </div>
                </div>

                {/* Calculation Feedback Toast / Notification */}
                <AnimatePresence>
                    {calcFeedbackMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 px-5 flex items-center justify-between shadow-xl border border-emerald-400/40"
                        >
                            <div className="flex items-center gap-3">
                                <CheckCircle2 size={22} className="text-emerald-200 shrink-0" />
                                <span className="text-sm font-bold">{calcFeedbackMessage}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCalcFeedbackMessage(null)}
                                className="text-xs font-extrabold underline text-emerald-100 hover:text-white ml-2 shrink-0"
                            >
                                {isTamil ? 'மூடு' : 'Dismiss'}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Save Success Notification */}
                <AnimatePresence>
                    {saveSuccessMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="rounded-2xl bg-emerald-500/20 border border-emerald-500/40 p-4 px-5 text-emerald-900 dark:text-emerald-200 flex items-center justify-between shadow-lg backdrop-blur-md"
                        >
                            <div className="flex items-center gap-3">
                                <CheckCircle2 size={22} className="text-emerald-500 shrink-0" />
                                <span className="text-sm font-bold">{saveSuccessMessage}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveTab('history')}
                                className="text-xs font-bold underline hover:text-emerald-600 dark:hover:text-emerald-100 shrink-0"
                            >
                                {t('previousCalculations')} →
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {activeTab === 'calculator' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Column: Input Form (7 cols) */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="rounded-3xl border border-emerald-500/20 dark:border-white/10 bg-white/85 dark:bg-slate-900/85 p-6 md:p-7 shadow-xl backdrop-blur-xl">
                                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/5 mb-5">
                                    <div className="flex items-center gap-2">
                                        <Sprout size={20} className="text-emerald-600 dark:text-emerald-400" />
                                        <h2 className="text-base font-bold text-gray-900 dark:text-white">
                                            {isTamil ? 'பயிர் விவரம் & நிலப் பரப்பு' : 'Crop & Land Details'}
                                        </h2>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => applyCropExpenses(cropName, Number(landArea) || 1)}
                                            className="text-xs text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1 font-bold transition-colors cursor-pointer"
                                            title="Auto-fill recommended expenses for this crop"
                                        >
                                            <Sparkles size={13} className="text-amber-500" />
                                            <span>{isTamil ? 'பரிந்துரை செலவு' : 'Auto-Fill Costs'}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleReset}
                                            className="text-xs text-gray-500 dark:text-gray-400 hover:text-rose-500 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                                        >
                                            <RotateCcw size={13} />
                                            <span>{isTamil ? 'அழிக்க' : 'Reset'}</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Crop Selection */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                                {isTamil ? 'பயிரின் பெயர் (Crop Name) *' : 'Crop Name (பயிரின் பெயர்) *'}
                                            </label>
                                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                                {isTamil ? 'தேர்வு செய்தால் செலவுகள் தானாக நிரப்பப்படும்' : 'Select to auto-fill costs'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2.5">
                                            {COMMON_CROPS.slice(0, 6).map((c) => (
                                                <button
                                                    key={c.name}
                                                    type="button"
                                                    onClick={() => handleCropSelect(c.name)}
                                                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                                                        cropName === c.name
                                                            ? 'border-emerald-500 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 font-extrabold shadow-sm ring-1 ring-emerald-500'
                                                            : 'border-gray-200 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/60 text-gray-700 dark:text-gray-300 hover:border-emerald-400'
                                                    }`}
                                                >
                                                    <span className="block truncate font-bold">{isTamil ? c.nameTa : c.name}</span>
                                                    <span className="text-[10px] text-gray-400 block truncate font-normal">
                                                        {isTamil ? c.name : c.nameTa}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="flex gap-2">
                                            <select
                                                value={cropName}
                                                onChange={(e) => handleCropSelect(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/80 text-gray-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                                            >
                                                {COMMON_CROPS.map((c) => (
                                                    <option key={c.name} value={c.name}>
                                                        {isTamil ? `${c.nameTa} (${c.name})` : `${c.name} - ${c.nameTa}`}
                                                    </option>
                                                ))}
                                                <option value="Other">{isTamil ? 'வேறு பயிர் (Other Crop)' : 'Other Crop / வேறு பயிர்'}</option>
                                            </select>
                                        </div>

                                        {cropName === 'Other' && (
                                            <input
                                                type="text"
                                                value={customCrop}
                                                onChange={(e) => setCustomCrop(e.target.value)}
                                                placeholder={isTamil ? 'பயிரின் பெயரை உள்ளிடவும் (e.g. உளுந்து, நிலக்கடலை)' : 'Enter crop name (e.g. Groundnut, Millets)'}
                                                className="mt-2 w-full px-4 py-2.5 rounded-xl border border-emerald-400 bg-emerald-50/40 dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                            />
                                        )}
                                    </div>

                                    {/* Land Area */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                                {isTamil ? 'நிலப் பரப்பு (Land Area) *' : 'Land Area (நிலப் பரப்பு) *'}
                                            </label>
                                            <div className="flex items-center gap-1.5">
                                                {[1, 2, 3, 5].map((preset) => (
                                                    <button
                                                        key={preset}
                                                        type="button"
                                                        onClick={() => {
                                                            setLandArea(preset);
                                                            applyCropExpenses(cropName, preset);
                                                        }}
                                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                                                            landArea === preset
                                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {preset} {isTamil ? 'ஏக்' : 'Ac'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0.1"
                                                value={landArea}
                                                onFocus={(e) => e.target.select()}
                                                onChange={(e) => handleLandAreaChange(e.target.value)}
                                                className="w-full pl-4 pr-24 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/80 text-gray-900 dark:text-white font-extrabold text-sm focus:ring-2 focus:ring-emerald-500 outline-none shadow-inner"
                                                placeholder="e.g. 2.0"
                                            />
                                            <span className="absolute right-3.5 top-2.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 pointer-events-none select-none">
                                                {isTamil ? 'ஏக்கர் (ACRES)' : 'ACRES'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Expense Inputs Grid */}
                                <div className="mt-6 pt-5 border-t border-gray-100 dark:border-white/5 space-y-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                                            <IndianRupee size={17} className="text-amber-500" />
                                            <span>
                                                {isTamil ? 'விவசாயச் செலவுகள் (Cultivation Expenses)' : 'Cultivation Expenses (விவசாயச் செலவுகள்)'}
                                            </span>
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs px-2.5 py-1 rounded-full font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                                {isTamil ? 'மொத்த செலவு' : 'Total'}: ₹ {totalCost.toLocaleString()}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => applyCropExpenses(cropName, Number(landArea) || 1)}
                                                className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all flex items-center gap-1 cursor-pointer"
                                                title={isTamil ? 'பரிந்துரைக்கப்பட்ட செலவுகளை மீண்டும் நிரப்பு' : 'Auto-fill benchmark expenses for this crop'}
                                            >
                                                <Sparkles size={11} className="text-amber-500" />
                                                <span>{isTamil ? 'பரிந்துரை செலவு' : 'Auto-Fill'}</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* 1. Seeds Cost */}
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                                    {isTamil ? 'விதைச் செலவு / Seeds Cost (₹)' : 'Seeds Cost (விதைச் செலவு) (₹)'}
                                                </label>
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm font-bold pointer-events-none select-none">₹</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={seedsCost}
                                                    onFocus={(e) => e.target.select()}
                                                    onChange={(e) => setSeedsCost(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                                                    className="w-full pl-8 pr-14 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-800/70 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-inner"
                                                    placeholder="0"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setSeedsCost(prev => (Number(prev) || 0) + 500)}
                                                    className="absolute right-2 top-2 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-gray-200 dark:bg-slate-700 hover:bg-emerald-500 hover:text-white text-gray-600 dark:text-gray-300 transition-colors"
                                                    title="+₹500"
                                                >
                                                    +500
                                                </button>
                                            </div>
                                        </div>

                                        {/* 2. Fertilizer Cost */}
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                                    {isTamil ? 'உரச் செலவு / Fertilizer Cost (₹)' : 'Fertilizer Cost (உரச் செலவு) (₹)'}
                                                </label>
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm font-bold pointer-events-none select-none">₹</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={fertilizerCost}
                                                    onFocus={(e) => e.target.select()}
                                                    onChange={(e) => setFertilizerCost(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                                                    className="w-full pl-8 pr-14 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-800/70 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-inner"
                                                    placeholder="0"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setFertilizerCost(prev => (Number(prev) || 0) + 500)}
                                                    className="absolute right-2 top-2 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-gray-200 dark:bg-slate-700 hover:bg-emerald-500 hover:text-white text-gray-600 dark:text-gray-300 transition-colors"
                                                    title="+₹500"
                                                >
                                                    +500
                                                </button>
                                            </div>
                                        </div>

                                        {/* 3. Labour Cost */}
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                                    {isTamil ? 'ஆட்கள் கூலி / Labour Cost (₹)' : 'Labour Cost (ஆட்கள் கூலி) (₹)'}
                                                </label>
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm font-bold pointer-events-none select-none">₹</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={labourCost}
                                                    onFocus={(e) => e.target.select()}
                                                    onChange={(e) => setLabourCost(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                                                    className="w-full pl-8 pr-14 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-800/70 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-inner"
                                                    placeholder="0"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setLabourCost(prev => (Number(prev) || 0) + 1000)}
                                                    className="absolute right-2 top-2 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-gray-200 dark:bg-slate-700 hover:bg-emerald-500 hover:text-white text-gray-600 dark:text-gray-300 transition-colors"
                                                    title="+₹1000"
                                                >
                                                    +1k
                                                </button>
                                            </div>
                                        </div>

                                        {/* 4. Water & Irrigation Cost */}
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                                    {isTamil ? 'பாசனச் செலவு / Water & Irrigation Cost (₹)' : 'Water & Irrigation Cost (பாசனச் செலவு) (₹)'}
                                                </label>
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm font-bold pointer-events-none select-none">₹</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={irrigationCost}
                                                    onFocus={(e) => e.target.select()}
                                                    onChange={(e) => setIrrigationCost(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                                                    className="w-full pl-8 pr-14 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-800/70 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-inner"
                                                    placeholder="0"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setIrrigationCost(prev => (Number(prev) || 0) + 500)}
                                                    className="absolute right-2 top-2 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-gray-200 dark:bg-slate-700 hover:bg-emerald-500 hover:text-white text-gray-600 dark:text-gray-300 transition-colors"
                                                    title="+₹500"
                                                >
                                                    +500
                                                </button>
                                            </div>
                                        </div>

                                        {/* 5. Pesticide & Spray Cost */}
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                                    {isTamil ? 'பூச்சிக்கொல்லி / Pesticide & Spray Cost (₹)' : 'Pesticide & Spray Cost (பூச்சிக்கொல்லி) (₹)'}
                                                </label>
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm font-bold pointer-events-none select-none">₹</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={pesticideCost}
                                                    onFocus={(e) => e.target.select()}
                                                    onChange={(e) => setPesticideCost(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                                                    className="w-full pl-8 pr-14 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-800/70 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-inner"
                                                    placeholder="0"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setPesticideCost(prev => (Number(prev) || 0) + 500)}
                                                    className="absolute right-2 top-2 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-gray-200 dark:bg-slate-700 hover:bg-emerald-500 hover:text-white text-gray-600 dark:text-gray-300 transition-colors"
                                                    title="+₹500"
                                                >
                                                    +500
                                                </button>
                                            </div>
                                        </div>

                                        {/* 6. Machinery & Transportation Cost */}
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                                    {isTamil ? 'இயந்திரம் & போக்குவரத்து / Machinery & Transport (₹)' : 'Machinery & Transport (இயந்திரம்) (₹)'}
                                                </label>
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm font-bold pointer-events-none select-none">₹</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={machineryCost}
                                                    onFocus={(e) => e.target.select()}
                                                    onChange={(e) => setMachineryCost(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                                                    className="w-full pl-8 pr-14 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-800/70 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-inner"
                                                    placeholder="0"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setMachineryCost(prev => (Number(prev) || 0) + 500)}
                                                    className="absolute right-2 top-2 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-gray-200 dark:bg-slate-700 hover:bg-emerald-500 hover:text-white text-gray-600 dark:text-gray-300 transition-colors"
                                                    title="+₹500"
                                                >
                                                    +500
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 7. Other Expenses */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                                {isTamil ? 'இதர சாகுபடி செலவுகள் / Other Expenses (₹)' : 'Other Expenses (இதர செலவுகள்) (₹)'}
                                            </label>
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm font-bold pointer-events-none select-none">₹</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={otherExpenses}
                                                onFocus={(e) => e.target.select()}
                                                onChange={(e) => setOtherExpenses(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                                                className="w-full pl-8 pr-14 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-800/70 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-inner"
                                                placeholder="0"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setOtherExpenses(prev => (Number(prev) || 0) + 500)}
                                                className="absolute right-2 top-2 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-gray-200 dark:bg-slate-700 hover:bg-emerald-500 hover:text-white text-gray-600 dark:text-gray-300 transition-colors"
                                                title="+₹500"
                                            >
                                                +500
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Expected Yield and Selling Price */}
                                <div className="mt-6 pt-5 border-t border-gray-100 dark:border-white/5 space-y-4">
                                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                                        <TrendingUp size={17} className="text-emerald-500" />
                                        <span>
                                            {isTamil ? 'மகசூல் & விற்பனை விலை (Harvest Yield & Expected Price)' : 'Harvest Yield & Expected Price (மகசூல் & விற்பனை விலை)'}
                                        </span>
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">
                                                {isTamil ? 'எதிர்பார்க்கப்படும் மகசூல் அளவு' : 'Expected Harvest Yield'}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={expectedYield}
                                                    onFocus={(e) => e.target.select()}
                                                    onChange={(e) => setExpectedYield(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-800/70 text-sm font-extrabold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-inner"
                                                    placeholder="e.g. 50"
                                                />
                                            </div>
                                            <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 block">
                                                {isTamil ? 'அளவு (குவிண்டால் / மூட்டை / கூடை)' : 'Units: Quintals / Bags / Crates'}
                                            </span>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">
                                                {isTamil ? 'எதிர்பார்க்கப்படும் விற்பனை விலை (₹)' : 'Expected Selling Price (₹)'}
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm font-bold pointer-events-none select-none">₹</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={expectedPrice}
                                                    onFocus={(e) => e.target.select()}
                                                    onChange={(e) => setExpectedPrice(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                                                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-800/70 text-sm font-extrabold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-inner"
                                                    placeholder="e.g. 1500"
                                                />
                                            </div>
                                            <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 block">
                                                {isTamil ? 'ஒரு யூனிட்டின் சராசரி சந்தை விலை' : 'Expected price per unit / bag'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Action Buttons: Calculate, Export Excel, Reset */}
                                <div className="mt-7 pt-5 border-t border-gray-100 dark:border-white/5 flex flex-wrap gap-2.5">
                                    <button
                                        type="button"
                                        onClick={handleManualCalculate}
                                        className="flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-700/25 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                                    >
                                        <Calculator size={18} className="text-amber-300" />
                                        <span>{isTamil ? '🧮 சாகுபடி செலவை கணக்கிடுக' : '🧮 Calculate Cultivation Cost'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => exportSingleReportToExcel(getCurrentReportData())}
                                        className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-500/30 font-extrabold text-xs transition-all cursor-pointer shadow-sm"
                                        title={isTamil ? 'Excel கோப்பாக பதிவிறக்குக' : 'Download this calculation as Excel'}
                                    >
                                        <FileSpreadsheet size={16} className="text-emerald-600 dark:text-emerald-400" />
                                        <span>{isTamil ? 'Excel பதிவிறக்கு' : 'Download Excel'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="py-3.5 px-4 rounded-2xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                    >
                                        <RotateCcw size={14} />
                                        <span>{isTamil ? 'மீட்டமைக்க' : 'Reset'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Results & Store / Excel Export (5 cols) */}
                        <div id="results-section" className="lg:col-span-5 space-y-5">
                            {/* Card 1: Estimated Profit / Loss Card (Dynamic Glow) */}
                            <motion.div
                                initial={{ scale: 0.96, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`rounded-3xl p-6 md:p-7 text-white shadow-xl relative overflow-hidden border ${
                                    estimatedProfit >= 0
                                        ? 'bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 border-emerald-400/40 shadow-emerald-900/30'
                                        : 'bg-gradient-to-br from-rose-600 via-rose-700 to-amber-900 border-rose-400/40 shadow-rose-950/30'
                                }`}
                            >
                                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-100">
                                            {isTamil ? 'மதிப்பிடப்பட்ட லாபம் / நஷ்டம்' : t('estimatedProfitOrLoss')}
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-white/20 backdrop-blur-md">
                                            {activeCropDisplayName}
                                        </span>
                                    </div>

                                    <div className="flex items-baseline gap-2 mt-1">
                                        <IndianRupee size={32} className="text-white/90" />
                                        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight font-display">
                                            {Math.abs(estimatedProfit).toLocaleString()}
                                        </h2>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 backdrop-blur-md text-xs font-bold">
                                            {estimatedProfit >= 0 ? (
                                                <>
                                                    <TrendingUp size={15} className="text-emerald-300" />
                                                    <span>{isTamil ? 'நிகர லாபம்' : t('estimatedProfit')} (+{profitMargin}%)</span>
                                                </>
                                            ) : (
                                                <>
                                                    <TrendingDown size={15} className="text-rose-200" />
                                                    <span>{isTamil ? 'நஷ்டம்' : t('estimatedLoss')} ({profitMargin}%)</span>
                                                </>
                                            )}
                                        </div>

                                        <span className="text-xs text-white/80 font-medium">
                                            {landArea} {isTamil ? 'ஏக்கர்' : t('landAreaAcres')}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Card 2: Total Cultivation Cost (Attractive Warm Yellow / Gold Card) */}
                            <motion.div
                                initial={{ y: 15, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="rounded-3xl p-6 bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 text-amber-950 shadow-xl border border-amber-300/40 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/20 rounded-full blur-xl pointer-events-none" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs uppercase font-extrabold tracking-wider text-amber-950/80">
                                            {isTamil ? 'மொத்த சாகுபடி செலவு' : t('totalCultivationCost')}
                                        </span>
                                        <div className="w-9 h-9 rounded-xl bg-amber-950/15 flex items-center justify-center font-bold">
                                            <Calculator size={18} className="text-amber-950" />
                                        </div>
                                    </div>

                                    <div className="flex items-baseline gap-1.5 mt-2">
                                        <span className="text-2xl font-bold">₹</span>
                                        <span className="text-3xl md:text-4xl font-extrabold tracking-tight">
                                            {totalCost.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-amber-950/15 flex items-center justify-between text-xs font-bold text-amber-950/90">
                                        <span>{isTamil ? 'ஏக்கருக்கான செலவு' : t('costPerAcre')}:</span>
                                        <span className="text-sm font-extrabold">₹ {costPerAcre.toLocaleString()} / {isTamil ? 'ஏக்கர்' : 'acre'}</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Card 3: Expected Selling Revenue (Crisp Emerald Green Card) */}
                            <motion.div
                                initial={{ y: 15, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="rounded-3xl p-6 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl border border-emerald-400/40 relative overflow-hidden"
                            >
                                <div className="absolute bottom-0 right-0 -mr-6 -mb-6 w-32 h-32 bg-teal-300/20 rounded-full blur-xl pointer-events-none" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-100">
                                            {isTamil ? 'எதிர்பார்க்கப்படும் விற்பனை வருவாய்' : t('expectedRevenue')}
                                        </span>
                                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                                            <IndianRupee size={18} />
                                        </div>
                                    </div>

                                    <div className="flex items-baseline gap-1.5 mt-2">
                                        <span className="text-2xl font-bold">₹</span>
                                        <span className="text-3xl md:text-4xl font-extrabold tracking-tight">
                                            {expectedRevenue.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-medium text-emerald-100">
                                        <span>{expectedYield} {isTamil ? 'யூனிட்' : 'units'} × ₹{expectedPrice}</span>
                                        <span className="font-bold">{activeCropDisplayName}</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Expense Breakdown Progress */}
                            <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 p-5 shadow-md space-y-3">
                                <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                    <Layers size={14} className="text-emerald-500" />
                                    <span>{isTamil ? 'செலவுப் பங்கீடு (Expense Distribution)' : 'Expense Distribution'}</span>
                                </h4>
                                <div className="space-y-2.5 text-xs">
                                    {[
                                        { label: isTamil ? 'ஆட்கள் கூலி (Labour)' : t('labourCost'), val: Number(labourCost) || 0, color: 'bg-emerald-500' },
                                        { label: isTamil ? 'உரச் செலவு (Fertilizer)' : t('fertilizerCost'), val: Number(fertilizerCost) || 0, color: 'bg-amber-500' },
                                        { label: isTamil ? 'இயந்திரம் (Machinery)' : t('machineryCost'), val: Number(machineryCost) || 0, color: 'bg-teal-500' },
                                        { label: isTamil ? 'விதைச் செலவு (Seeds)' : t('seedsCost'), val: Number(seedsCost) || 0, color: 'bg-yellow-400' },
                                        { label: isTamil ? 'பாசனம் (Irrigation)' : t('irrigationCost'), val: Number(irrigationCost) || 0, color: 'bg-cyan-500' },
                                        { label: isTamil ? 'பூச்சிக்கொல்லி (Pesticide)' : t('pesticideCost'), val: Number(pesticideCost) || 0, color: 'bg-rose-500' },
                                        { label: isTamil ? 'இதர செலவுகள் (Other)' : t('otherExpenses'), val: Number(otherExpenses) || 0, color: 'bg-purple-500' }
                                    ].map((item, idx) => {
                                        const pct = totalCost > 0 ? Math.round((item.val / totalCost) * 100) : 0;
                                        return (
                                            <div key={idx} className="space-y-1">
                                                <div className="flex justify-between text-gray-700 dark:text-gray-300 font-semibold text-[11px]">
                                                    <span>{item.label}</span>
                                                    <span>₹{item.val.toLocaleString()} ({pct}%)</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${item.color} transition-all duration-300`} style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Store Values & Download Excel Section */}
                            <div className="space-y-2.5 pt-1">
                                {/* Button 1: Store / Save Calculation */}
                                <button
                                    type="button"
                                    onClick={handleSaveReport}
                                    disabled={isSaving || totalCost === 0}
                                    className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-700/25 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                                >
                                    <Save size={18} className="text-emerald-200" />
                                    <span>
                                        {isSaving
                                            ? (isTamil ? 'மதிப்புகள் சேமிக்கப்படுகிறது...' : 'Storing...')
                                            : (isTamil ? '💾 மதிப்புகளைச் சேமி (Store Calculation)' : '💾 Store / Save Calculation')}
                                    </span>
                                </button>

                                {/* Buttons 2 & 3: Download Excel and Store & Download */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => exportSingleReportToExcel(getCurrentReportData())}
                                        disabled={totalCost === 0}
                                        className="flex items-center justify-center gap-2 py-3 px-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 via-green-700 to-emerald-900 hover:from-emerald-700 hover:to-green-600 text-white font-extrabold text-xs shadow-md transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 cursor-pointer border border-emerald-400/30"
                                    >
                                        <FileSpreadsheet size={16} className="text-emerald-300" />
                                        <span>{isTamil ? '📊 Excel (.xlsx) பதிவிறக்கு' : '📊 Download Excel (.xlsx)'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={async () => {
                                            const saved = await handleSaveReport();
                                            exportSingleReportToExcel(saved);
                                        }}
                                        disabled={isSaving || totalCost === 0}
                                        className="flex items-center justify-center gap-2 py-3 px-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-extrabold text-xs shadow-md transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 cursor-pointer border border-amber-300/40"
                                    >
                                        <Download size={16} />
                                        <span>{isTamil ? '💾+📊 சேமி & Excel' : '💾+📊 Store & Download'}</span>
                                    </button>
                                </div>

                                {/* Quick CSV Export Link */}
                                <div className="text-center pt-1">
                                    <button
                                        type="button"
                                        onClick={() => exportSingleReportToCSV(getCurrentReportData())}
                                        className="text-[11px] font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 underline transition-colors cursor-pointer"
                                    >
                                        {isTamil ? '📄 CSV கோப்பாகவும் பதிவிறக்கலாம் (Download as CSV)' : '📄 Or download as CSV spreadsheet'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Previous Calculations Tab */
                    <div className="space-y-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FileSpreadsheet className="text-emerald-500" />
                                <span>{isTamil ? 'முந்தைய கணக்கீடுகள்' : t('previousCalculations')}</span>
                                {savedReports.length > 0 && (
                                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                                        {savedReports.length} {isTamil ? 'பதிவுகள்' : 'records'}
                                    </span>
                                )}
                            </h2>

                            <div className="flex items-center gap-2">
                                {savedReports.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={exportAllReportsToExcel}
                                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02] cursor-pointer"
                                    >
                                        <Download size={14} />
                                        <span>{isTamil ? '📊 அனைத்தையும் Excel-ல் பதிவிறக்கு' : '📊 Export All to Excel (.xlsx)'}</span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('calculator')}
                                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer px-2 py-1"
                                >
                                    <Calculator size={14} />
                                    <span>{isTamil ? '+ புதிய கணக்கீடு' : '+ New Calculation'}</span>
                                </button>
                            </div>
                        </div>

                        {savedReports.length === 0 ? (
                            <div className="text-center py-16 rounded-3xl border border-dashed border-gray-300 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 p-8">
                                <Calculator size={48} className="mx-auto text-emerald-500/40 mb-3" />
                                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
                                    {isTamil
                                        ? 'இதுவரை கணக்கீடுகள் எதுவும் சேமிக்கப்படவில்லை. மேலே விவரங்களை பூர்த்தி செய்து "மதிப்புகளைச் சேமி" பொத்தானை அழுத்தவும்.'
                                        : t('noCalculationsYet')}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('calculator')}
                                    className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all shadow-md cursor-pointer"
                                >
                                    {isTamil ? 'சாகுபடி செலவை கணக்கிடு' : t('calculateCostBtn')}
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {savedReports.map((report, idx) => (
                                    <motion.div
                                        key={report._id || idx}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="rounded-3xl border border-emerald-500/15 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 p-5 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                                                    {report.cropName}
                                                </span>
                                                <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Recent'}
                                                </span>
                                            </div>

                                            <div className="space-y-2 mb-4 text-xs">
                                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                                    <span>{isTamil ? 'நிலப் பரப்பு' : t('landAreaAcres')}:</span>
                                                    <span className="font-bold text-gray-900 dark:text-white">{report.landArea} {isTamil ? 'ஏக்கர்' : 'acres'}</span>
                                                </div>
                                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                                    <span>{isTamil ? 'மொத்த செலவு' : t('totalCultivationCost')}:</span>
                                                    <span className="font-bold text-amber-600 dark:text-amber-400">₹{report.totalCost?.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                                    <span>{isTamil ? 'ஏக்கருக்கான செலவு' : t('costPerAcre')}:</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">₹{report.costPerAcre?.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                                    <span>{isTamil ? 'விற்பனை வருவாய்' : t('expectedRevenue')}:</span>
                                                    <span className="font-medium text-teal-600 dark:text-teal-400">₹{report.expectedRevenue?.toLocaleString()}</span>
                                                </div>
                                                <div className="pt-2 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
                                                    <span className="font-bold text-gray-700 dark:text-gray-300">{isTamil ? 'லாபம் / நஷ்டம்' : t('estimatedProfitOrLoss')}:</span>
                                                    <span className={`font-extrabold text-sm ${report.estimatedProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                                        {report.estimatedProfit >= 0 ? '+' : ''}₹{report.estimatedProfit?.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-white/5">
                                            <button
                                                type="button"
                                                onClick={() => loadReportIntoForm(report)}
                                                className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                            >
                                                <ArrowUpRight size={14} />
                                                <span>{isTamil ? 'ஏற்று' : t('loadIntoForm')}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => exportSingleReportToExcel(report)}
                                                className="py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all flex items-center gap-1 border border-emerald-500/20 cursor-pointer"
                                                title={isTamil ? 'இந்த அறிக்கையை Excel-ல் பதிவிறக்குக' : 'Download this report as Excel'}
                                            >
                                                <Download size={13} />
                                                <span>Excel</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteReport(report, idx)}
                                                className="p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                                                title={isTamil ? 'நீக்கு' : t('deleteReport')}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default CultivationCostCalculator;
