/* ═══════════════════════════════════════════════════════════════════════════
   PETSY — Comprehensive Nutrition & Food System v1.0
   South India focused · Dogs & Cats · Weight Management
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

const esc = window.esc || ((str) => String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'));

// ─── NUTRITIONAL DATABASE — Commercial Brands (India) ─────────────────────────
const MARKET_FOODS = {
  dog: [
    {
      id: 'mfd1',
      brand: 'Royal Canin',
      name: 'Maxi Adult (Dry)',
      type: 'Dry Food',
      petAge: 'Adult (15 months – 5 years)',
      weightGoal: 'maintenance',
      calories: 350,
      protein: 26,
      fat: 14,
      carbs: 41,
      serving: '265–410 g/day (26–44 kg dog)',
      price_inr: 4500,
      pack: '10 kg',
      notes: 'Large breed adult dogs. Supports healthy weight.',
      rating: 4.5,
    },
    {
      id: 'mfd2',
      brand: 'Pedigree',
      name: 'Adult Chicken & Vegetables (Dry)',
      type: 'Dry Food',
      petAge: 'Adult (1+ year)',
      weightGoal: 'maintenance',
      calories: 316,
      protein: 22,
      fat: 10,
      carbs: 47,
      serving: '200–250 g/day (10–20 kg dog)',
      price_inr: 680,
      pack: '3 kg',
      notes: 'Affordable, widely available across India.',
      rating: 4.0,
    },
    {
      id: 'mfd3',
      brand: 'Drools',
      name: 'Optimum Adult (Dry)',
      type: 'Dry Food',
      petAge: 'Adult (1+ year)',
      weightGoal: 'maintenance',
      calories: 310,
      protein: 25,
      fat: 11,
      carbs: 46,
      serving: '180–250 g/day',
      price_inr: 560,
      pack: '3 kg',
      notes: 'Indian brand, good value. With chicken and egg.',
      rating: 4.1,
    },
    {
      id: 'mfd4',
      brand: 'Royal Canin',
      name: 'Puppy (Dry)',
      type: 'Dry Food',
      petAge: 'Puppy (up to 12 months)',
      weightGoal: 'gain',
      calories: 382,
      protein: 30,
      fat: 20,
      carbs: 34,
      serving: '110–280 g/day based on expected adult weight',
      price_inr: 3200,
      pack: '8 kg',
      notes: 'DHA for brain development. Highly digestible.',
      rating: 4.7,
    },
    {
      id: 'mfd5',
      brand: 'Hills Science Diet',
      name: 'Perfect Weight Adult (Dry)',
      type: 'Dry Food',
      petAge: 'Adult (1–6 years)',
      weightGoal: 'loss',
      calories: 278,
      protein: 25,
      fat: 9.5,
      carbs: 43,
      serving: '170–225 g/day (10–25 kg dog)',
      price_inr: 5200,
      pack: '7.03 kg',
      notes: 'Clinically proven weight loss. Lower calorie density.',
      rating: 4.6,
    },
    {
      id: 'mfd6',
      brand: 'Acana',
      name: 'Pacifica (Grain Free)',
      type: 'Dry Food',
      petAge: 'All Life Stages',
      weightGoal: 'gain',
      calories: 394,
      protein: 34,
      fat: 17,
      carbs: 20,
      serving: '200–300 g/day',
      price_inr: 9500,
      pack: '6 kg',
      notes: 'High-protein, grain-free. Good for active dogs.',
      rating: 4.8,
    },
    {
      id: 'mfd7',
      brand: 'Drools',
      name: 'Focus Senior (Dry)',
      type: 'Dry Food',
      petAge: 'Senior (7+ years)',
      weightGoal: 'maintenance',
      calories: 295,
      protein: 24,
      fat: 9,
      carbs: 45,
      serving: '160–220 g/day',
      price_inr: 730,
      pack: '3 kg',
      notes: 'Added glucosamine for joint support.',
      rating: 4.2,
    },
    {
      id: 'mfd8',
      brand: 'Pedigree',
      name: 'Puppy Starter Milk Replacer',
      type: 'Wet Food',
      petAge: 'Puppy (0–8 weeks)',
      weightGoal: 'gain',
      calories: 142,
      protein: 6.8,
      fat: 7.4,
      carbs: 12,
      serving: 'Per feeding chart',
      price_inr: 340,
      pack: '400 g powder',
      notes: 'Orphaned or supplementary feeding for puppies.',
      rating: 4.3,
    },
    {
      id: 'mfd9',
      brand: 'Me-O',
      name: 'Adult Chicken & Rice',
      type: 'Dry Food',
      petAge: 'Adult Dog 1+ year',
      weightGoal: 'maintenance',
      calories: 302,
      protein: 20,
      fat: 8,
      carbs: 50,
      serving: '180–240 g/day',
      price_inr: 430,
      pack: '3 kg',
      notes: 'Budget-friendly option. Chicken as primary protein.',
      rating: 3.8,
    },
    {
      id: 'mfd10',
      brand: 'Farmina',
      name: 'N&D Grain Free Chicken & Pomegranate',
      type: 'Dry Food',
      petAge: 'Adult',
      weightGoal: 'maintenance',
      calories: 380,
      protein: 32,
      fat: 18,
      carbs: 16,
      serving: '190–310 g/day',
      price_inr: 7200,
      pack: '7 kg',
      notes: 'Italian brand. Premium, grain-free, low glycaemic.',
      rating: 4.9,
    },
  ],
  cat: [
    {
      id: 'mfc1',
      brand: 'Royal Canin',
      name: 'Indoor Adult (Dry)',
      type: 'Dry Food',
      petAge: 'Adult (1–7 years)',
      weightGoal: 'maintenance',
      calories: 341,
      protein: 29,
      fat: 12,
      carbs: 38,
      serving: '40–55 g/day',
      price_inr: 1800,
      pack: '2 kg',
      notes: 'Reduces hairballs, low calories for indoor cats.',
      rating: 4.6,
    },
    {
      id: 'mfc2',
      brand: 'Whiskas',
      name: 'Adult Tuna in Jelly (Wet)',
      type: 'Wet Food',
      petAge: 'Adult (1+ year)',
      weightGoal: 'maintenance',
      calories: 72,
      protein: 9,
      fat: 3.5,
      carbs: 2.5,
      serving: '1–1.5 pouches/day (85 g each)',
      price_inr: 50,
      pack: '85 g pouch',
      notes: 'High moisture helps urinary health.',
      rating: 4.0,
    },
    {
      id: 'mfc3',
      brand: 'Me-O',
      name: 'Adult Chicken & Tuna (Dry)',
      type: 'Dry Food',
      petAge: 'Adult (1+ year)',
      weightGoal: 'maintenance',
      calories: 320,
      protein: 26,
      fat: 10,
      carbs: 44,
      serving: '40–55 g/day',
      price_inr: 390,
      pack: '1.5 kg',
      notes: 'Popular and budget-friendly in India.',
      rating: 4.0,
    },
    {
      id: 'mfc4',
      brand: 'Royal Canin',
      name: 'Kitten (Dry)',
      type: 'Dry Food',
      petAge: 'Kitten (4–12 months)',
      weightGoal: 'gain',
      calories: 380,
      protein: 34,
      fat: 18,
      carbs: 30,
      serving: '35–55 g/day',
      price_inr: 1700,
      pack: '2 kg',
      notes: 'Supports immune system, brain and muscle development.',
      rating: 4.7,
    },
    {
      id: 'mfc5',
      brand: 'Hills Science Diet',
      name: 'Indoor Weight & Hairball Control (Dry)',
      type: 'Dry Food',
      petAge: 'Adult (1–6 years)',
      weightGoal: 'loss',
      calories: 295,
      protein: 29,
      fat: 8.5,
      carbs: 41,
      serving: '38–50 g/day',
      price_inr: 2800,
      pack: '3.17 kg',
      notes: 'Designed for overweight indoor cats.',
      rating: 4.5,
    },
    {
      id: 'mfc6',
      brand: 'Sheba',
      name: 'Fine Flakes Tuna & Shrimp (Wet)',
      type: 'Wet Food',
      petAge: 'Adult (1+ year)',
      weightGoal: 'maintenance',
      calories: 68,
      protein: 10,
      fat: 2.8,
      carbs: 1.2,
      serving: '2 trays/day',
      price_inr: 80,
      pack: '70 g tray',
      notes: 'Premium wet food, grain-free. High moisture.',
      rating: 4.4,
    },
  ],
};

// ─── HOMEMADE RECIPES DATABASE ────────────────────────────────────────────────
const RECIPES = {
  dog: [
    {
      id: 'r1',
      name: 'Chicken & Rice Bowl',
      category: 'Main Meals',
      weightGoal: 'maintenance',
      petType: 'dog',
      cookTime: '30 min',
      servings: '1 meal for 10 kg dog',
      disclaimer: '⚠️ This is a supplementary recipe. Consult a vet before replacing commercial food entirely.',
      isMealComplete: false,
      ingredients: [
        { name: 'Chicken Breast (boneless)', qty: '100 g', raw: true, kcal: 165, protein: 31, fat: 3.6 },
        { name: 'Brown Rice (dry)', qty: '50 g', raw: true, kcal: 178, protein: 3.7, fat: 1.3 },
        { name: 'Carrot', qty: '50 g', raw: true, kcal: 21, protein: 0.5, fat: 0.1 },
        { name: 'Peas (frozen)', qty: '30 g', raw: true, kcal: 26, protein: 2, fat: 0.1 },
      ],
      totalKcal: 390,
      totalProtein: 37.2,
      totalFat: 5.1,
      per100g: { kcal: 106, protein: 10.1 },
      prep: [
        'Boil chicken breast until fully cooked. Shred into small pieces.',
        'Cook rice in plain water until soft. Drain excess water.',
        'Boil or steam carrots and peas until soft.',
        'Mix all ingredients together. Cool completely before serving.',
        'Store leftovers in fridge for up to 2 days.',
      ],
    },
    {
      id: 'r2',
      name: 'Egg & Oats Breakfast',
      category: 'Main Meals',
      weightGoal: 'maintenance',
      petType: 'dog',
      cookTime: '15 min',
      servings: '1 meal for 5–10 kg dog',
      disclaimer: '⚠️ Supplementary recipe only. Not a complete diet.',
      isMealComplete: false,
      ingredients: [
        { name: 'Egg (boiled)', qty: '2 eggs (100 g)', raw: false, kcal: 155, protein: 13, fat: 11 },
        { name: 'Oats (cooked plain)', qty: '60 g dry', raw: true, kcal: 234, protein: 8.7, fat: 4.2 },
        { name: 'Banana (small)', qty: '50 g', raw: true, kcal: 45, protein: 0.5, fat: 0.1 },
      ],
      totalKcal: 434,
      totalProtein: 22.2,
      totalFat: 15.3,
      per100g: { kcal: 120, protein: 6.1 },
      prep: [
        'Boil eggs for 10 minutes. Cool and chop into pieces.',
        'Cook oats in water with no salt or sugar.',
        'Mash banana into oats.',
        'Mix all together and serve at room temperature.',
      ],
    },
    {
      id: 'r3',
      name: 'Pumpkin & Fish Dinner',
      category: 'Main Meals',
      weightGoal: 'loss',
      petType: 'dog',
      cookTime: '25 min',
      servings: '1 meal for 10 kg dog',
      disclaimer: '⚠️ Weight-loss recipe. Consult vet for calorie targets.',
      isMealComplete: false,
      ingredients: [
        { name: 'Rohu Fish (boiled, boneless)', qty: '120 g', raw: false, kcal: 151, protein: 27, fat: 4.3 },
        { name: 'Pumpkin (boiled)', qty: '100 g', raw: false, kcal: 26, protein: 1, fat: 0.1 },
        { name: 'Spinach (boiled)', qty: '50 g', raw: false, kcal: 18, protein: 2.1, fat: 0.2 },
        { name: 'Brown Rice (cooked)', qty: '40 g dry', raw: true, kcal: 142, protein: 3, fat: 1 },
      ],
      totalKcal: 337,
      totalProtein: 33.1,
      totalFat: 5.6,
      per100g: { kcal: 87, protein: 8.5 },
      prep: [
        'Boil fish until cooked. Remove all bones carefully.',
        'Steam pumpkin and spinach until soft. Mash pumpkin.',
        'Cook rice in plain water.',
        'Combine all, cool before serving.',
      ],
    },
    {
      id: 'r4',
      name: 'High-Protein Chicken Liver Mix',
      category: 'High-Protein Meals',
      weightGoal: 'gain',
      petType: 'dog',
      cookTime: '20 min',
      servings: '1 meal for 15 kg dog',
      disclaimer: '⚠️ Liver is high in Vitamin A. Limit to max 3x/week.',
      isMealComplete: false,
      ingredients: [
        { name: 'Chicken Liver (cooked)', qty: '80 g', raw: false, kcal: 119, protein: 17, fat: 4.4 },
        { name: 'Chicken Breast (boiled)', qty: '120 g', raw: false, kcal: 198, protein: 37.2, fat: 4.3 },
        { name: 'Sweet Potato (boiled)', qty: '80 g', raw: false, kcal: 86, protein: 1.6, fat: 0.1 },
        { name: 'Curd (plain, unsalted)', qty: '50 g', raw: false, kcal: 30, protein: 1.8, fat: 1.6 },
      ],
      totalKcal: 433,
      totalProtein: 57.6,
      totalFat: 10.4,
      per100g: { kcal: 131, protein: 17.5 },
      prep: [
        'Cook chicken liver and breast in plain water (no spices).',
        'Boil sweet potato, mash slightly.',
        'Combine all ingredients. Add curd after cooling.',
        'Serve at room temperature.',
      ],
    },
    {
      id: 'r5',
      name: 'Puppy Growth Blend',
      category: 'Puppy Food',
      weightGoal: 'gain',
      petType: 'dog',
      cookTime: '30 min',
      servings: '1 meal for 3 kg puppy',
      disclaimer: '⚠️ Puppies have specific nutritional needs. Vet-approved commercial puppy food recommended as primary diet.',
      isMealComplete: false,
      ingredients: [
        { name: 'Chicken Breast (boiled, minced)', qty: '60 g', raw: false, kcal: 99, protein: 18.6, fat: 2.2 },
        { name: 'Egg Yolk (cooked)', qty: '1 yolk (17 g)', raw: false, kcal: 55, protein: 2.7, fat: 4.5 },
        { name: 'White Rice (cooked)', qty: '40 g dry', raw: true, kcal: 145, protein: 2.7, fat: 0.3 },
        { name: 'Carrot (boiled, mashed)', qty: '30 g', raw: false, kcal: 12, protein: 0.3, fat: 0.1 },
      ],
      totalKcal: 311,
      totalProtein: 24.3,
      totalFat: 7.1,
      per100g: { kcal: 132, protein: 10.3 },
      prep: [
        'Boil and finely mince or blend chicken for easy eating.',
        'Cook egg until hard. Use only the yolk for puppies.',
        'Cook rice until very soft.',
        'Mash all together to a semi-solid consistency suitable for age.',
      ],
    },
    {
      id: 'r6',
      name: 'Carrot & Apple Training Treats',
      category: 'Training Treats',
      weightGoal: 'maintenance',
      petType: 'dog',
      cookTime: '35 min',
      servings: '~20 small treats',
      disclaimer: 'Treats only. Limit to <10% of daily calories.',
      isMealComplete: false,
      ingredients: [
        { name: 'Carrot (grated)', qty: '100 g', raw: true, kcal: 41, protein: 0.9, fat: 0.2 },
        { name: 'Apple (grated, no seeds)', qty: '80 g', raw: true, kcal: 42, protein: 0.2, fat: 0.1 },
        { name: 'Oat Flour', qty: '120 g', raw: false, kcal: 468, protein: 17.3, fat: 8.4 },
        { name: 'Egg', qty: '1 egg (50 g)', raw: false, kcal: 77, protein: 6.3, fat: 5.3 },
      ],
      totalKcal: 628,
      totalProtein: 24.7,
      totalFat: 14,
      per100g: { kcal: 178, protein: 7 },
      prep: [
        'Preheat oven to 175°C.',
        'Mix grated carrot, apple, oat flour and egg to form dough.',
        'Roll out and cut into small bite-sized pieces.',
        'Bake 20–25 minutes until golden and firm.',
        'Cool completely before giving to dog. Store in airtight container for 1 week.',
      ],
    },
    {
      id: 'r7',
      name: 'Senior Dog Soft Dinner',
      category: 'Senior Pet Food',
      weightGoal: 'maintenance',
      petType: 'dog',
      cookTime: '30 min',
      servings: '1 meal for 15 kg senior dog',
      disclaimer: '⚠️ Senior dogs may have kidney or dental issues. Always consult vet.',
      isMealComplete: false,
      ingredients: [
        { name: 'Chicken Thigh (boneless, cooked)', qty: '100 g', raw: false, kcal: 209, protein: 21, fat: 13 },
        { name: 'Sweet Potato (boiled, mashed)', qty: '100 g', raw: false, kcal: 86, protein: 1.6, fat: 0.1 },
        { name: 'Green Beans (boiled)', qty: '60 g', raw: false, kcal: 18, protein: 1.2, fat: 0.1 },
        { name: 'Pumpkin (boiled, mashed)', qty: '80 g', raw: false, kcal: 21, protein: 0.8, fat: 0.1 },
        { name: 'Fish Oil', qty: '1 tsp (5 ml)', raw: false, kcal: 41, protein: 0, fat: 4.5 },
      ],
      totalKcal: 375,
      totalProtein: 24.6,
      totalFat: 17.8,
      per100g: { kcal: 108, protein: 7.1 },
      prep: [
        'Cook chicken thoroughly. Remove all bones.',
        'Boil and mash sweet potato and pumpkin.',
        'Steam green beans.',
        'Mix all together, add fish oil after cooling.',
        'Serve soft/mashed — ideal for dogs with dental issues.',
      ],
    },
  ],
  cat: [
    {
      id: 'rc1',
      name: 'Tuna & Rice Bowl',
      category: 'Main Meals',
      weightGoal: 'maintenance',
      petType: 'cat',
      cookTime: '20 min',
      servings: '1 meal for 4 kg cat',
      disclaimer: '⚠️ Supplementary recipe. Cats are obligate carnivores — they need taurine. Feed commercial food as primary.',
      isMealComplete: false,
      ingredients: [
        { name: 'Tuna (cooked, no salt)', qty: '80 g', raw: false, kcal: 116, protein: 25.4, fat: 0.8 },
        { name: 'White Rice (cooked)', qty: '20 g dry', raw: true, kcal: 73, protein: 1.3, fat: 0.1 },
        { name: 'Carrot (boiled)', qty: '20 g', raw: false, kcal: 8, protein: 0.2, fat: 0 },
      ],
      totalKcal: 197,
      totalProtein: 26.9,
      totalFat: 0.9,
      per100g: { kcal: 163, protein: 22.3 },
      prep: [
        'Cook tuna in plain water. No oil, no seasoning.',
        'Cook rice in plain water.',
        'Mix together with boiled carrots.',
        'Serve at room temperature.',
      ],
    },
    {
      id: 'rc2',
      name: 'Chicken & Egg Kitten Blend',
      category: 'Puppy/Kitten Food',
      weightGoal: 'gain',
      petType: 'cat',
      cookTime: '20 min',
      servings: '1 meal for 1.5 kg kitten',
      disclaimer: '⚠️ Kittens need taurine from meat. Vet-approved kitten food as primary diet.',
      isMealComplete: false,
      ingredients: [
        { name: 'Chicken Breast (boiled, minced)', qty: '60 g', raw: false, kcal: 99, protein: 18.6, fat: 2.2 },
        { name: 'Egg White (cooked)', qty: '1 white (30 g)', raw: false, kcal: 17, protein: 3.6, fat: 0 },
        { name: 'Curd (plain, unsalted)', qty: '20 g', raw: false, kcal: 12, protein: 0.7, fat: 0.6 },
      ],
      totalKcal: 128,
      totalProtein: 22.9,
      totalFat: 2.8,
      per100g: { kcal: 117, protein: 20.9 },
      prep: [
        'Boil chicken, mince finely for kittens.',
        'Hard-boil egg, use only the white.',
        'Mix with a small amount of plain curd.',
        'Serve at room temperature in small portions.',
      ],
    },
    {
      id: 'rc3',
      name: 'Low-Calorie Fish & Pumpkin',
      category: 'Weight-Loss Meals',
      weightGoal: 'loss',
      petType: 'cat',
      cookTime: '25 min',
      servings: '1 meal for 4 kg cat',
      disclaimer: '⚠️ Weight-loss diet must be vet-supervised. Do not starve cats.',
      isMealComplete: false,
      ingredients: [
        { name: 'Rohu Fish (boiled, boneless)', qty: '80 g', raw: false, kcal: 101, protein: 18, fat: 2.9 },
        { name: 'Pumpkin (boiled, mashed)', qty: '80 g', raw: false, kcal: 21, protein: 0.8, fat: 0.1 },
        { name: 'Spinach (boiled)', qty: '30 g', raw: false, kcal: 11, protein: 1.3, fat: 0.1 },
      ],
      totalKcal: 133,
      totalProtein: 20.1,
      totalFat: 3.1,
      per100g: { kcal: 70, protein: 10.6 },
      prep: [
        'Boil fish thoroughly. Remove ALL bones.',
        'Steam pumpkin and spinach, mash pumpkin.',
        'Mix together. Serve at room temperature.',
      ],
    },
  ],
};

// ─── Calorie Requirements (Resting Energy Requirement) ────────────────────────
function calcRER(weightKg) {
  // NRC formula: RER = 70 × (body weight in kg)^0.75
  return Math.round(70 * Math.pow(weightKg, 0.75));
}

function calcDailyCalories(pet) {
  const w = parseFloat(pet.weight) || 5;
  const rer = calcRER(w);

  // Life-stage multipliers
  const age = (pet.age || '').toLowerCase();
  const isNeutered = true; // assume neutered if not specified
  let multiplier = 1.6; // default adult neutered

  if (age.includes('puppy') || age.includes('kitten') ||
      (age.match(/(\d+)\s*mo/)?.[1] && parseInt(age) < 12)) {
    multiplier = 3.0;
  } else if (age.includes('senior') || age.match(/(\d+)\s*yr/)?.[1] && parseInt(age) > 7) {
    multiplier = 1.4;
  } else if (isNeutered) {
    multiplier = 1.6;
  }

  return Math.round(rer * multiplier);
}

// ─── Weight Goal Recommendations ─────────────────────────────────────────────
function getWeightGoal(pet) {
  const weight = parseFloat(pet.weight) || 0;
  // Simple BCS estimation (no ideal weight data available → guidance only)
  return 'maintenance'; // Default; user can override
}

// ─── Page Render ──────────────────────────────────────────────────────────────
let nutritionTab = 'market';
let nutritionWeightFilter = 'all';
let nutritionSearch = '';

function renderNutrition() {
  const container = document.getElementById('page-nutrition');
  if (!container) return;
  const pet = window.getActivePet ? getActivePet() : null;

  container.innerHTML = `
    <div class="page-header">
      <div class="page-eyebrow">Health & Feeding</div>
      <h1 class="page-title">Nutrition 🥗</h1>
      <div class="page-subtitle">Food recommendations tailored for your pet · South India focus</div>
    </div>`;

  // Pet switcher
  if (window.renderPetSwitcher) renderPetSwitcher(container);

  // Calorie Calculator Card
  if (pet) {
    const dailyKcal = calcDailyCalories(pet);
    const calcCard = document.createElement('div');
    calcCard.className = 'card reveal';
    calcCard.style.cssText = 'background:linear-gradient(135deg,var(--primary-tint),var(--teal-tint));border:1px solid var(--primary-soft);';
    calcCard.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;padding:4px 0 12px">
        <div style="width:50px;height:50px;border-radius:14px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0">🔥</div>
        <div style="flex:1">
          <div style="font-weight:800;font-size:15px;color:var(--ink)">${esc(pet.name)}'s Daily Calorie Needs</div>
          <div style="font-size:12px;color:var(--ink-soft)">Based on weight, age & life stage · Estimated</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:28px;font-weight:900;color:var(--primary)">${dailyKcal}</div>
          <div style="font-size:11px;color:var(--ink-muted)">kcal/day</div>
        </div>
      </div>
      <div class="nutr-calc-grid">
        <div class="nutr-calc-item">
          <div class="nutr-calc-val">${Math.round(dailyKcal * 0.25 / 4)} g</div>
          <div class="nutr-calc-lbl">~Protein/day</div>
        </div>
        <div class="nutr-calc-item">
          <div class="nutr-calc-val">${Math.round(dailyKcal * 0.12 / 9)} g</div>
          <div class="nutr-calc-lbl">~Fat/day</div>
        </div>
        <div class="nutr-calc-item">
          <div class="nutr-calc-val">${pet.weight || '?'} ${pet.weightUnit || 'kg'}</div>
          <div class="nutr-calc-lbl">Current Weight</div>
        </div>
      </div>
      <div style="font-size:11px;color:var(--ink-muted);margin-top:10px;padding-top:10px;border-top:1px solid rgba(0,0,0,0.06)">
        ⚕️ <em>These are estimates only. Consult your veterinarian for personalised dietary advice.</em>
      </div>`;
    container.appendChild(calcCard);
  }

  // Food Safety Warning Box
  const safetyCard = document.createElement('div');
  safetyCard.className = 'card reveal';
  safetyCard.style.cssText = 'background:var(--danger-tint);border:1px solid rgba(231,74,74,0.3);';
  safetyCard.innerHTML = `
    <div style="display:flex;gap:12px;align-items:flex-start">
      <span style="font-size:22px">⚠️</span>
      <div>
        <div style="font-weight:700;font-size:13px;color:var(--danger);margin-bottom:4px">NEVER Feed These to Your Pet</div>
        <div style="display:flex;flex-wrap:wrap;gap:5px">
          ${window.AC?.TOXIC_FOODS?.map(f => `<span style="background:rgba(231,74,74,0.15);color:var(--danger);padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600">${f}</span>`).join('') || ''}
        </div>
      </div>
    </div>`;
  container.appendChild(safetyCard);

  // Main Tabs
  const tabs = document.createElement('div');
  tabs.className = 'tab-bar';
  [
    { key: 'market', label: '🏪 Market Foods' },
    { key: 'recipes', label: '🍳 Recipes' },
    { key: 'weight', label: '⚖️ Weight Plan' },
  ].forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (nutritionTab === t.key ? ' active' : '');
    btn.textContent = t.label;
    btn.onclick = () => { nutritionTab = t.key; renderNutrition(); };
    tabs.appendChild(btn);
  });
  container.appendChild(tabs);

  // Weight filter chips
  const weightChips = document.createElement('div');
  weightChips.className = 'chip-select';
  [
    { k: 'all', l: 'All Goals' },
    { k: 'maintenance', l: '✅ Maintenance' },
    { k: 'loss', l: '⬇️ Weight Loss' },
    { k: 'gain', l: '⬆️ Weight Gain' },
  ].forEach(({ k, l }) => {
    const chip = document.createElement('button');
    chip.className = 'chip' + (nutritionWeightFilter === k ? ' active' : '');
    chip.textContent = l;
    chip.onclick = () => { nutritionWeightFilter = k; renderNutrition(); };
    weightChips.appendChild(chip);
  });
  container.appendChild(weightChips);

  // Search Bar
  const searchBar = document.createElement('div');
  searchBar.className = 'search-bar';
  searchBar.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
    <input class="search-input" id="nutr-search" placeholder="Search foods, brands, ingredients…"
      value="${esc(nutritionSearch)}" oninput="nutritionSearch=this.value;renderNutrition()" />`;
  container.appendChild(searchBar);

  const petSpecies = pet?.species?.toLowerCase() || 'dog';
  const speciesKey = petSpecies.includes('cat') ? 'cat' : 'dog';

  if (nutritionTab === 'market') {
    renderMarketFoods(container, speciesKey);
  } else if (nutritionTab === 'recipes') {
    renderRecipes(container, speciesKey);
  } else {
    renderWeightPlan(container, pet, speciesKey);
  }
}

function renderMarketFoods(container, speciesKey) {
  let foods = MARKET_FOODS[speciesKey] || [];
  if (nutritionWeightFilter !== 'all') {
    foods = foods.filter(f => f.weightGoal === nutritionWeightFilter);
  }
  if (nutritionSearch.trim()) {
    const q = nutritionSearch.toLowerCase();
    foods = foods.filter(f =>
      f.brand.toLowerCase().includes(q) ||
      f.name.toLowerCase().includes(q) ||
      f.type.toLowerCase().includes(q) ||
      f.petAge.toLowerCase().includes(q)
    );
  }

  const grid = document.createElement('div');
  grid.className = 'nutr-grid';

  if (!foods.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🥗</div><div class="empty-title">No results</div><div class="empty-desc">Try a different search or filter.</div></div>`;
  } else {
    foods.forEach(f => {
      const card = document.createElement('div');
      card.className = 'nutr-card reveal';
      const goalColors = { maintenance: 'var(--primary)', loss: 'var(--danger)', gain: 'var(--gold)' };
      const goalLabels = { maintenance: '⚖️ Maintenance', loss: '⬇️ Weight Loss', gain: '⬆️ Weight Gain' };
      const stars = '★'.repeat(Math.floor(f.rating)) + (f.rating % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(f.rating));
      card.innerHTML = `
        <div class="nutr-card-header">
          <div>
            <div class="nutr-brand">${esc(f.brand)}</div>
            <div class="nutr-name">${esc(f.name)}</div>
            <div class="nutr-type-badge">${esc(f.type)}</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:13px;font-weight:800;color:var(--ink)">₹${f.price_inr?.toLocaleString('en-IN')}</div>
            <div style="font-size:11px;color:var(--ink-muted)">${esc(f.pack)}</div>
            <div style="font-size:11px;color:var(--gold);letter-spacing:1px" title="${f.rating}/5">${stars}</div>
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 8px">
          <span class="nutr-goal-badge" style="background:${goalColors[f.weightGoal] || 'var(--primary)'}20;color:${goalColors[f.weightGoal] || 'var(--primary)'};">${goalLabels[f.weightGoal] || ''}</span>
          <span class="nutr-goal-badge" style="background:var(--gold-tint);color:#8A5A10">${esc(f.petAge)}</span>
        </div>
        <div class="nutr-macros">
          <div class="nutr-macro"><div class="nutr-macro-val">${f.calories}</div><div class="nutr-macro-lbl">kcal/100g</div></div>
          <div class="nutr-macro"><div class="nutr-macro-val">${f.protein}g</div><div class="nutr-macro-lbl">Protein</div></div>
          <div class="nutr-macro"><div class="nutr-macro-val">${f.fat}g</div><div class="nutr-macro-lbl">Fat</div></div>
          <div class="nutr-macro"><div class="nutr-macro-val">${f.carbs}g</div><div class="nutr-macro-lbl">Carbs</div></div>
        </div>
        <div style="font-size:12px;color:var(--ink-soft);margin-top:8px">📏 <strong>Serving:</strong> ${esc(f.serving)}</div>
        ${f.notes ? `<div style="font-size:11.5px;color:var(--ink-muted);margin-top:6px;font-style:italic">💡 ${esc(f.notes)}</div>` : ''}`;
      grid.appendChild(card);
    });
  }
  container.appendChild(grid);
}

function renderRecipes(container, speciesKey) {
  let recipes = RECIPES[speciesKey] || [];
  if (nutritionWeightFilter !== 'all') {
    recipes = recipes.filter(r => r.weightGoal === nutritionWeightFilter);
  }
  if (nutritionSearch.trim()) {
    const q = nutritionSearch.toLowerCase();
    recipes = recipes.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.ingredients.some(i => i.name.toLowerCase().includes(q))
    );
  }

  if (!recipes.length) {
    container.innerHTML += `<div class="empty-state"><div class="empty-icon">🍳</div><div class="empty-title">No recipes found</div><div class="empty-desc">Try a different filter.</div></div>`;
    return;
  }

  recipes.forEach(r => {
    const card = document.createElement('div');
    card.className = 'recipe-card reveal';
    const goalColors = { maintenance: 'var(--primary)', loss: 'var(--danger)', gain: 'var(--gold)' };
    const categoryEmojis = {
      'Main Meals': '🍽️', 'Training Treats': '🎯', 'High-Protein Meals': '💪',
      'Weight-Loss Meals': '⬇️', 'Weight-Gain Meals': '⬆️',
      'Puppy Food': '🐶', 'Kitten Food': '🐱', 'Puppy/Kitten Food': '🐾',
      'Senior Pet Food': '👴', 'Healthy Snacks': '🥕',
    };
    const catEmoji = categoryEmojis[r.category] || '🍳';

    card.innerHTML = `
      <div class="recipe-header">
        <div>
          <div style="font-size:11px;color:var(--ink-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px">
            ${catEmoji} ${esc(r.category)}
          </div>
          <div class="recipe-name">${esc(r.name)}</div>
          <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">
            <span style="font-size:11px;background:${goalColors[r.weightGoal] || 'var(--primary)'}20;color:${goalColors[r.weightGoal] || 'var(--primary)'};padding:2px 8px;border-radius:8px;font-weight:600">
              ${r.weightGoal === 'loss' ? '⬇️ Loss' : r.weightGoal === 'gain' ? '⬆️ Gain' : '⚖️ Maintenance'}
            </span>
            <span style="font-size:11px;background:var(--gold-tint);color:#8A5A10;padding:2px 8px;border-radius:8px;font-weight:600">⏱ ${esc(r.cookTime)}</span>
          </div>
        </div>
        <div class="recipe-kcal-badge">
          <div style="font-size:20px;font-weight:900;color:var(--primary)">${r.totalKcal}</div>
          <div style="font-size:10px;color:var(--ink-muted)">kcal total</div>
        </div>
      </div>

      <div class="nutr-macros" style="margin:12px 0 10px">
        <div class="nutr-macro"><div class="nutr-macro-val">${r.per100g.kcal}</div><div class="nutr-macro-lbl">kcal/100g</div></div>
        <div class="nutr-macro"><div class="nutr-macro-val">${r.totalProtein}g</div><div class="nutr-macro-lbl">Protein</div></div>
        <div class="nutr-macro"><div class="nutr-macro-val">${r.totalFat}g</div><div class="nutr-macro-lbl">Fat</div></div>
        <div class="nutr-macro"><div class="nutr-macro-val">${esc(r.servings)}</div><div class="nutr-macro-lbl">Serves</div></div>
      </div>

      <div class="recipe-section-title">📦 Ingredients</div>
      <div class="recipe-ingredients">
        ${r.ingredients.map(ing => `
          <div class="recipe-ing-row">
            <span class="recipe-ing-name">${esc(ing.name)}</span>
            <span class="recipe-ing-qty">${esc(ing.qty)}</span>
            <span class="recipe-ing-kcal">${ing.kcal} kcal</span>
          </div>
        `).join('')}
      </div>

      <div class="recipe-section-title" style="margin-top:12px">👨‍🍳 Instructions</div>
      <ol class="recipe-steps">
        ${r.prep.map(step => `<li>${esc(step)}</li>`).join('')}
      </ol>

      <div class="recipe-disclaimer">${r.disclaimer}</div>`;

    container.appendChild(card);
  });
}

function renderWeightPlan(container, pet, speciesKey) {
  const card = document.createElement('div');
  card.className = 'card reveal';

  if (!pet) {
    card.innerHTML = `<div class="empty-state"><div class="empty-icon">⚖️</div><div class="empty-title">No pet selected</div><div class="empty-desc">Add a pet to see weight management recommendations.</div></div>`;
    container.appendChild(card);
    return;
  }

  const weight = parseFloat(pet.weight) || 0;
  const dailyKcal = calcDailyCalories(pet);

  card.innerHTML = `
    <div style="font-weight:800;font-size:16px;color:var(--ink);margin-bottom:14px">
      ⚖️ Weight Plan for ${esc(pet.name)}
    </div>

    <div class="nutr-weight-grid">
      <div class="nutr-weight-item" style="border:2px solid var(--danger)">
        <div style="font-size:22px;margin-bottom:6px">⬇️</div>
        <div style="font-weight:800;font-size:14px;color:var(--danger)">Weight Loss</div>
        <div style="font-size:12px;color:var(--ink-soft);margin-top:4px">
          <strong>${Math.round(dailyKcal * 0.8)} kcal/day</strong><br>
          Reduce by 20% of daily needs<br>
          High protein · Low fat<br>
          3–4 small meals/day
        </div>
      </div>
      <div class="nutr-weight-item" style="border:2px solid var(--primary)">
        <div style="font-size:22px;margin-bottom:6px">✅</div>
        <div style="font-weight:800;font-size:14px;color:var(--primary)">Maintenance</div>
        <div style="font-size:12px;color:var(--ink-soft);margin-top:4px">
          <strong>${dailyKcal} kcal/day</strong><br>
          Estimated daily requirement<br>
          Balanced macros<br>
          2 meals/day
        </div>
      </div>
      <div class="nutr-weight-item" style="border:2px solid var(--gold)">
        <div style="font-size:22px;margin-bottom:6px">⬆️</div>
        <div style="font-weight:800;font-size:14px;color:var(--gold)">Weight Gain</div>
        <div style="font-size:12px;color:var(--ink-soft);margin-top:4px">
          <strong>${Math.round(dailyKcal * 1.25)} kcal/day</strong><br>
          Increase by 25% of daily needs<br>
          High protein · Calorie-dense<br>
          3 meals/day
        </div>
      </div>
    </div>

    <div style="font-size:12px;color:var(--ink-soft);margin-top:16px;padding:12px;background:var(--gold-tint);border-radius:10px">
      <strong>📋 Tips for ${esc(pet.species === 'Cat' ? 'Cats' : 'Dogs')}:</strong><br>
      ${speciesKey === 'cat'
        ? '• Cats should never fast — even 1–2 days without eating can cause hepatic lipidosis.<br>• Increase protein gradually.<br>• Wet food helps maintain hydration.'
        : '• Introduce new foods gradually over 7–10 days.<br>• Always have fresh water available.<br>• Avoid exercising immediately after meals.'
      }
    </div>

    <div style="font-size:11px;color:var(--ink-muted);margin-top:12px;font-style:italic">
      ⚕️ These are general guidelines. Always consult your veterinarian before making major dietary changes.
    </div>`;

  container.appendChild(card);
}

// ─── Expose Globals ───────────────────────────────────────────────────────────
window.renderNutrition = renderNutrition;
window.nutritionTab = nutritionTab;
window.nutritionWeightFilter = nutritionWeightFilter;
window.nutritionSearch = nutritionSearch;
window.calcDailyCalories = calcDailyCalories;
window.MARKET_FOODS = MARKET_FOODS;
window.RECIPES = RECIPES;
