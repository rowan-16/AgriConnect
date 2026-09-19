import { AIRecommendation, AIRecommendationRequest } from '../types';
import { SAMPLE_AI_RECOMMENDATIONS } from './mockData';

interface CropProfile {
  id: string;
  name: string;
  image: string;
  preferredSoils: Array<'Alluvial' | 'Black' | 'Red & Yellow' | 'Laterite' | 'Clayey' | 'Sandy Loam'>;
  preferredSeasons: Array<'Kharif (Monsoon)' | 'Rabi (Winter)' | 'Zaid (Summer)' | 'Year Round'>;
  optimalTemp: { min: number; opt: number; max: number };
  optimalRainfall: { min: number; opt: number; max: number };
  optimalPh: { min: number; max: number };
  growingPeriod: string;
  expectedYield: string;
  marketDemand: 'High' | 'Very High' | 'Moderate';
  waterRequirement: 'Low' | 'Medium' | 'High';
  profitPotential: '₹45,000 - ₹75,000 / acre' | '₹60,000 - ₹95,000 / acre' | '₹80,000 - ₹1,40,000 / acre' | '₹30,000 - ₹50,000 / acre';
  reasonTemplate: (input: AIRecommendationRequest) => string;
  actionAdvice: string;
  companions: string[];
}

const CROP_DATABASE: CropProfile[] = [
  {
    id: 'crop_wheat_sharbati',
    name: 'Certified Sharbati & Durum Wheat (HI 8627)',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600',
    preferredSoils: ['Alluvial', 'Black', 'Clayey'],
    preferredSeasons: ['Rabi (Winter)', 'Year Round'],
    optimalTemp: { min: 12, opt: 22, max: 28 },
    optimalRainfall: { min: 300, opt: 500, max: 850 },
    optimalPh: { min: 6.0, max: 7.8 },
    growingPeriod: '115 - 125 Days',
    expectedYield: '22 - 26 Quintals / Acre',
    marketDemand: 'Very High',
    waterRequirement: 'Medium',
    profitPotential: '₹60,000 - ₹95,000 / acre',
    reasonTemplate: (i) => `Winter temperature (${i.temperatureC}°C) in ${i.location} provides optimal vernalization for high-protein grain filling in ${i.soilType} soil.`,
    actionAdvice: 'Apply 120kg N, 60kg P2O5 at crown root initiation stage; run 4 critical irrigation cycles.',
    companions: ['Mustard', 'Gram', 'Fenugreek'],
  },
  {
    id: 'crop_basmati_paddy',
    name: 'Export Superfine Basmati Rice (Pusa 1121)',
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&q=80&w=600',
    preferredSoils: ['Clayey', 'Alluvial', 'Black'],
    preferredSeasons: ['Kharif (Monsoon)', 'Year Round'],
    optimalTemp: { min: 22, opt: 30, max: 38 },
    optimalRainfall: { min: 700, opt: 1100, max: 2000 },
    optimalPh: { min: 5.5, max: 7.5 },
    growingPeriod: '135 - 145 Days',
    expectedYield: '18 - 22 Quintals / Acre',
    marketDemand: 'Very High',
    waterRequirement: 'High',
    profitPotential: '₹80,000 - ₹1,40,000 / acre',
    reasonTemplate: (i) => `Heavy moisture retentive ${i.soilType} soil coupled with ${i.humidityPercent}% humidity accelerates tillering and long-grain aroma synthesis.`,
    actionAdvice: 'Maintain 3-5cm standing water during panicle emergence; treat with Pseudomonas fluorescens bio-fungicide.',
    companions: ['Sesbania (Dhaincha)', 'Azolla bio-fertilizer'],
  },
  {
    id: 'crop_bt_cotton',
    name: 'Long-Staple Hybrid Cotton (Bollgard II)',
    image: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&q=80&w=600',
    preferredSoils: ['Black', 'Alluvial', 'Clayey'],
    preferredSeasons: ['Kharif (Monsoon)', 'Year Round'],
    optimalTemp: { min: 24, opt: 32, max: 40 },
    optimalRainfall: { min: 500, opt: 750, max: 1200 },
    optimalPh: { min: 6.5, max: 8.2 },
    growingPeriod: '160 - 180 Days',
    expectedYield: '12 - 16 Quintals / Acre',
    marketDemand: 'Very High',
    waterRequirement: 'Medium',
    profitPotential: '₹80,000 - ₹1,40,000 / acre',
    reasonTemplate: (i) => `${i.soilType} soil in ${i.location} ensures sustained moisture for boll development under current ${i.temperatureC}°C conditions.`,
    actionAdvice: 'Plant pigeon pea border rows as a refuge crop and install yellow sticky traps for whitefly management.',
    companions: ['Pigeon Pea (Arhar)', 'Cowpea'],
  },
  {
    id: 'crop_guntur_chilli',
    name: 'Guntur S4 & Teja Red Hot Chillies',
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80&w=600',
    preferredSoils: ['Black', 'Red & Yellow', 'Alluvial'],
    preferredSeasons: ['Kharif (Monsoon)', 'Rabi (Winter)', 'Year Round'],
    optimalTemp: { min: 20, opt: 28, max: 36 },
    optimalRainfall: { min: 450, opt: 700, max: 1100 },
    optimalPh: { min: 6.0, max: 7.5 },
    growingPeriod: '150 - 180 Days',
    expectedYield: '25 - 32 Quintals (Dry) / Acre',
    marketDemand: 'Very High',
    waterRequirement: 'Medium',
    profitPotential: '₹80,000 - ₹1,40,000 / acre',
    reasonTemplate: (i) => `Current ambient heat (${i.temperatureC}°C) and ${i.soilType} soil enhance capsaicin concentration and deep red color grading.`,
    actionAdvice: 'Incorporate neem cake (250 kg/acre) during land preparation to protect from root-knot nematodes.',
    companions: ['Onion', 'Garlic', 'Marigold border'],
  },
  {
    id: 'crop_nashik_onion',
    name: 'Export Grade Red Onion (AgriFound Light Red)',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=600',
    preferredSoils: ['Alluvial', 'Sandy Loam', 'Black'],
    preferredSeasons: ['Rabi (Winter)', 'Kharif (Monsoon)', 'Zaid (Summer)'],
    optimalTemp: { min: 16, opt: 24, max: 32 },
    optimalRainfall: { min: 350, opt: 600, max: 900 },
    optimalPh: { min: 6.0, max: 7.2 },
    growingPeriod: '90 - 110 Days',
    expectedYield: '100 - 140 Quintals / Acre',
    marketDemand: 'High',
    waterRequirement: 'Medium',
    profitPotential: '₹80,000 - ₹1,40,000 / acre',
    reasonTemplate: (i) => `Loose friable ${i.soilType} structure allows unimpeded underground bulb expansion with high dry matter content.`,
    actionAdvice: 'Stop irrigation 10 days before harvesting to harden onion necks and prevent fungal storage rot.',
    companions: ['Beetroot', 'Cabbage', 'Carrot'],
  },
  {
    id: 'crop_sweet_corn',
    name: 'Golden Sweet Corn (Hybrid Syngenta Sugar-75)',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=600',
    preferredSoils: ['Alluvial', 'Sandy Loam', 'Red & Yellow'],
    preferredSeasons: ['Kharif (Monsoon)', 'Zaid (Summer)', 'Year Round'],
    optimalTemp: { min: 18, opt: 26, max: 35 },
    optimalRainfall: { min: 400, opt: 650, max: 1000 },
    optimalPh: { min: 6.0, max: 7.5 },
    growingPeriod: '80 - 90 Days',
    expectedYield: '75 - 90 Quintals / Acre',
    marketDemand: 'Very High',
    waterRequirement: 'Medium',
    profitPotential: '₹80,000 - ₹1,40,000 / acre',
    reasonTemplate: (i) => `Fast 80-day growth cycle in ${i.season} allows rapid multi-crop rotations with strong wholesale urban retail demand.`,
    actionAdvice: 'Side-dress with Urea at knee-high and tasseling stages; ensure drip fertigation at 8-day intervals.',
    companions: ['French Beans', 'Cowpeas', 'Pumpkin'],
  },
  {
    id: 'crop_turmeric_curcumin',
    name: 'Organic Turmeric (Prathibha High Curcumin 5.8%)',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600',
    preferredSoils: ['Laterite', 'Red & Yellow', 'Alluvial'],
    preferredSeasons: ['Kharif (Monsoon)', 'Year Round'],
    optimalTemp: { min: 22, opt: 29, max: 36 },
    optimalRainfall: { min: 800, opt: 1200, max: 1800 },
    optimalPh: { min: 5.5, max: 7.0 },
    growingPeriod: '210 - 240 Days',
    expectedYield: '8 - 11 Tons / Acre',
    marketDemand: 'High',
    waterRequirement: 'Medium',
    profitPotential: '₹80,000 - ₹1,40,000 / acre',
    reasonTemplate: (i) => `Iron-rich porous ${i.soilType} soil prevents rhizome rot while accelerating active curcumin concentration.`,
    actionAdvice: 'Apply organic farmyard manure (10 tons/acre) and spray micronutrient mixture (Zn, Fe, B) at 60 and 90 DAP.',
    companions: ['Ginger', 'Colocasia', 'Elephant Foot Yam'],
  },
  {
    id: 'crop_mustard_pusa',
    name: 'High-Oil Mustard / Sarson (Pusa Mustard 30)',
    image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&q=80&w=600',
    preferredSoils: ['Sandy Loam', 'Alluvial', 'Red & Yellow'],
    preferredSeasons: ['Rabi (Winter)', 'Year Round'],
    optimalTemp: { min: 10, opt: 20, max: 27 },
    optimalRainfall: { min: 200, opt: 400, max: 650 },
    optimalPh: { min: 6.0, max: 7.8 },
    growingPeriod: '100 - 115 Days',
    expectedYield: '10 - 13 Quintals / Acre',
    marketDemand: 'High',
    waterRequirement: 'Low',
    profitPotential: '₹45,000 - ₹75,000 / acre',
    reasonTemplate: (i) => `Low water requirement makes this an ideal Rabi cash crop for ${i.location} requiring only 2-3 light irrigations.`,
    actionAdvice: 'Sow in rows spaced 30cm apart; spray 0.2% Dimethoate if aphid colonies appear on flower buds.',
    companions: ['Wheat', 'Chickpea', 'Barley'],
  },
  {
    id: 'crop_soybean_js',
    name: 'High-Yield Soybeans (JS 335 / NRC 37)',
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=600',
    preferredSoils: ['Black', 'Clayey', 'Alluvial'],
    preferredSeasons: ['Kharif (Monsoon)', 'Year Round'],
    optimalTemp: { min: 22, opt: 28, max: 35 },
    optimalRainfall: { min: 550, opt: 800, max: 1200 },
    optimalPh: { min: 6.5, max: 7.5 },
    growingPeriod: '95 - 105 Days',
    expectedYield: '12 - 15 Quintals / Acre',
    marketDemand: 'High',
    waterRequirement: 'Low',
    profitPotential: '₹45,000 - ₹75,000 / acre',
    reasonTemplate: (i) => `Symbiotic nitrogen fixation enriches the ${i.soilType} soil matrix while fetching instant mandi cash settlements.`,
    actionAdvice: 'Inoculate seed batches with Bradyrhizobium japonicum bio-culture prior to broad-bed planting.',
    companions: ['Maize', 'Sorghum (Jowar)', 'Pigeon Pea'],
  },
  {
    id: 'crop_pomegranate_bhagwa',
    name: 'Export Table Pomegranate (Bhagwa Arid Cultivar)',
    image: 'https://images.unsplash.com/photo-1541344999736-83eca872f241?auto=format&fit=crop&q=80&w=600',
    preferredSoils: ['Sandy Loam', 'Alluvial', 'Red & Yellow', 'Laterite'],
    preferredSeasons: ['Year Round', 'Zaid (Summer)', 'Kharif (Monsoon)'],
    optimalTemp: { min: 20, opt: 32, max: 42 },
    optimalRainfall: { min: 300, opt: 500, max: 800 },
    optimalPh: { min: 6.5, max: 8.0 },
    growingPeriod: 'Perennial Orchard (Yield Seasonally)',
    expectedYield: '6 - 8 Tons / Acre',
    marketDemand: 'Very High',
    waterRequirement: 'Low',
    profitPotential: '₹80,000 - ₹1,40,000 / acre',
    reasonTemplate: (i) => `Arid heat tolerance and low water footprint in ${i.soilType} deliver deep ruby arils with premium export grading.`,
    actionAdvice: 'Prune for Hasth Bahar flowering; apply bio-fungicide sprays to prevent bacterial blight (Telya).',
    companions: ['Gram', 'Cowpea cover crop'],
  },
];

export const aiRecommendationService = {
  getDefaultRecommendations(): AIRecommendation[] {
    return SAMPLE_AI_RECOMMENDATIONS;
  },

  calculateRecommendations(input: AIRecommendationRequest): AIRecommendation[] {
    const scoredCrops = CROP_DATABASE.map((crop) => {
      let score = 70;

      // 1. Soil compatibility (+15 or -15)
      if (crop.preferredSoils.includes(input.soilType)) {
        score += 15;
      } else {
        score -= 15;
      }

      // 2. Season compatibility (+10 or -10)
      if (crop.preferredSeasons.includes(input.season) || crop.preferredSeasons.includes('Year Round')) {
        score += 10;
      } else {
        score -= 8;
      }

      // 3. Temperature curve matching (Up to +10, or penalty based on deviation)
      const tempDiff = Math.abs(input.temperatureC - crop.optimalTemp.opt);
      if (tempDiff <= 3) {
        score += 10;
      } else if (tempDiff <= 7) {
        score += 5;
      } else {
        score -= Math.min(15, Math.round(tempDiff * 1.5));
      }

      // 4. Rainfall compatibility
      if (input.rainfallMm >= crop.optimalRainfall.min && input.rainfallMm <= crop.optimalRainfall.max) {
        score += 5;
      } else {
        score -= 5;
      }

      // 5. pH compatibility
      if (input.soilPh) {
        if (input.soilPh >= crop.optimalPh.min && input.soilPh <= crop.optimalPh.max) {
          score += 4;
        } else {
          score -= 6;
        }
      }

      // Clamp between 55 and 98
      const finalScore = Math.min(98, Math.max(58, score));

      return {
        id: `rec_${crop.id}_${Date.now()}`,
        cropName: crop.name,
        cropImage: crop.image,
        suitabilityScore: finalScore,
        expectedGrowingPeriod: crop.growingPeriod,
        expectedYield: crop.expectedYield,
        marketDemand: crop.marketDemand,
        waterRequirement: crop.waterRequirement,
        profitPotential: crop.profitPotential,
        reason: crop.reasonTemplate(input),
        suggestedAction: crop.actionAdvice,
        companionCrops: crop.companions,
      };
    });

    // Sort descending by match score and return top 4
    scoredCrops.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
    return scoredCrops.slice(0, 4);
  }
};
