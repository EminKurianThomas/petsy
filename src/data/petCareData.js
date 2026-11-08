/**
 * Comprehensive Veterinary Care, Nutrition & Fitness Guidelines
 * Distinct data for Dogs and Cats with health-condition weight evaluation.
 */

export const VACCINATIONS_DATA = {
  Dog: [
    {
      name: 'DHPP (5-in-1 Core Vaccine)',
      type: 'Core',
      schedule: '6–8, 10–12, and 14–16 weeks; booster at 1 year, then every 3 years',
      protectsAgainst: 'Distemper, Hepatitis, Parvovirus, Parainfluenza',
      importance: 'Essential for all dogs. Parvo and distemper are potentially fatal and highly contagious viral infections.',
      icon: '🛡️',
    },
    {
      name: 'Rabies Vaccine',
      type: 'Core (Legally Required)',
      schedule: 'Initial dose at 12–16 weeks; booster at 1 year, then every 1–3 years',
      protectsAgainst: 'Rabies virus (fatal neurological disease)',
      importance: '100% fatal once symptoms appear and transmissible to humans. Mandatory by law in almost all regions.',
      icon: '💉',
    },
    {
      name: 'Bordetella (Kennel Cough)',
      type: 'Lifestyle / Non-Core',
      schedule: 'Every 6–12 months for dogs visiting parks, groomers, or boarding facilities',
      protectsAgainst: 'Infectious Tracheobronchitis (severe respiratory coughing)',
      importance: 'Crucial for social dogs who interact with other dogs at daycare or groomers.',
      icon: '🐕',
    },
    {
      name: 'Leptospirosis',
      type: 'Lifestyle / Non-Core',
      schedule: '2 doses 2–4 weeks apart starting at 12 weeks; booster annually',
      protectsAgainst: 'Bacterial infection spread via wildlife urine and standing water',
      importance: 'Can cause acute kidney or liver failure and can spread from dogs to people (zoonotic).',
      icon: '💧',
    },
    {
      name: 'Lyme Disease',
      type: 'Lifestyle / Non-Core',
      schedule: '2 initial doses starting at 9–12 weeks; booster annually',
      protectsAgainst: 'Tick-borne Borrelia burgdorferi bacteria',
      importance: 'Recommended for dogs living in or visiting wooded, tick-prevalent grassy areas.',
      icon: '🌲',
    },
  ],
  Cat: [
    {
      name: 'FVRCP (Feline 3-in-1 Core)',
      type: 'Core',
      schedule: '6–8, 10–12, and 14–16 weeks; booster at 1 year, then every 3 years',
      protectsAgainst: 'Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia (Feline Distemper)',
      importance: 'Essential for all indoor and outdoor cats against life-threatening upper respiratory and digestive viruses.',
      icon: '🛡️',
    },
    {
      name: 'Rabies Vaccine',
      type: 'Core',
      schedule: 'Initial dose at 12–16 weeks; booster annually or every 3 years',
      protectsAgainst: 'Rabies virus',
      importance: 'Mandatory in most areas; protects both indoor and outdoor cats from fatal rabies infection.',
      icon: '💉',
    },
    {
      name: 'FeLV (Feline Leukemia Virus)',
      type: 'Core for Kittens & Outdoor Cats',
      schedule: '2 doses 3–4 weeks apart at 8–12 weeks; booster annually for outdoor cats',
      protectsAgainst: 'Feline Leukemia Virus',
      importance: 'Leading viral killer of outdoor cats spread through saliva, grooming, and fighting.',
      icon: '🐾',
    },
  ],
};

export const FOOD_RECIPES_DATA = {
  Dog: [
    {
      id: 'd1',
      title: 'Harvest Turkey & Sweet Potato Stew',
      tag: 'Lean Protein & Digestion',
      suitableFor: ['ideal', 'overweight'],
      prepTime: '25 min',
      calories: 'Low / Moderate',
      image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80',
      ingredients: [
        '500g Lean ground turkey (93% lean)',
        '1 large sweet potato (steamed & cubed)',
        '1 cup green beans (steamed & chopped)',
        '1/2 cup cooked brown rice or quinoa',
        '1 tbsp salmon oil or flaxseed oil',
      ],
      instructions:
        'Brown the lean ground turkey over medium heat until fully cooked. Drain excess fat. Steam the sweet potato and green beans until fork-tender. Mix all ingredients with cooked rice and salmon oil. Cool completely before serving.',
      benefits: 'High in lean protein, gentle on sensitive stomachs, and rich in fiber to promote healthy satiety without excess calories.',
    },
    {
      id: 'd2',
      title: 'Wholesome Salmon & Quinoa Super-Bowl',
      tag: 'Omega-3 & Coat Health',
      suitableFor: ['ideal', 'underweight'],
      prepTime: '20 min',
      calories: 'Nutrient-Dense',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
      ingredients: [
        '400g Fresh wild salmon (boneless, cooked)',
        '1 cup cooked quinoa',
        '1 cup steamed baby spinach and chopped carrots',
        '1/2 cup pure pumpkin puree (100% pure, unseasoned)',
        '1 tsp crushed eggshell powder (for natural calcium)',
      ],
      instructions:
        'Steam or bake boneless salmon until flaked. Cook quinoa in plain water. Steam chopped carrots and spinach. Gently fold together with pure pumpkin puree and eggshell calcium. Let cool to room temperature.',
      benefits: 'Packed with anti-inflammatory Omega-3 fatty acids for a glossy coat, healthy skin, and joint vitality.',
    },
    {
      id: 'd3',
      title: 'Lean Beef & Garden Veggie Skillet',
      tag: 'Muscle Maintenance',
      suitableFor: ['ideal', 'underweight'],
      prepTime: '30 min',
      calories: 'High Protein',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      ingredients: [
        '500g Extra-lean ground beef (90%+)',
        '1 cup grated zucchini and carrots',
        '1/2 cup cooked rolled oats',
        '1/4 cup chopped blueberries (antioxidants)',
        '1 tbsp virgin coconut oil',
      ],
      instructions:
        'Simmer ground beef in a skillet until browned, pouring off grease. Add grated zucchini and carrots for the final 5 minutes of simmering. Stir in cooked oats and blueberries. Allow to cool completely.',
      benefits: 'Provides bioavailable iron and amino acids to support strong lean muscles, energy, and immune defense.',
    },
    {
      id: 'd4',
      title: 'Slim & Trim Chicken & Pumpkin Mash',
      tag: 'Weight Loss Specialist',
      suitableFor: ['overweight'],
      prepTime: '15 min',
      calories: 'Low Calorie / High Fiber',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80',
      ingredients: [
        '400g Skinless, boneless boiled chicken breast',
        '1.5 cups steamed French green beans',
        '1/2 cup pure plain pumpkin puree',
        '1/4 cup unsalted bone broth',
      ],
      instructions:
        'Shred plain boiled chicken breast. Puree green beans with plain pumpkin and a splash of bone broth. Fold shredded chicken into the veggie mash. Serve in portion-controlled bowls.',
      benefits: 'High volume, low caloric density. Green beans and pumpkin provide dietary bulk so your dog feels completely full while safely trimming weight.',
    },
  ],
  Cat: [
    {
      id: 'c1',
      title: 'Savory Chicken & Pumpkin Hydration Puree',
      tag: 'Taurine & Hairball Control',
      suitableFor: ['ideal', 'overweight'],
      prepTime: '20 min',
      calories: 'Moisture-Rich',
      image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
      ingredients: [
        '300g Plain boiled chicken breast & chicken hearts (rich in taurine)',
        '2 tbsp pure canned pumpkin puree (unspiced)',
        '1/2 cup natural chicken poaching broth (no salt/onions)',
        '1/4 tsp feline multivitamin/taurine supplement',
      ],
      instructions:
        'Boil chicken breast and organ meat in plain water until cooked through. Transfer meat with warm poaching broth and pumpkin to a blender. Blend into a smooth, velvety paste cats love to lap up.',
      benefits: 'Excellent source of essential feline taurine and moisture to safeguard kidney and bladder health while helping prevent hairballs.',
    },
    {
      id: 'c2',
      title: 'Flaked Tuna & Steamed Carrot Medley',
      tag: 'High Palatability',
      suitableFor: ['ideal', 'underweight'],
      prepTime: '15 min',
      calories: 'Protein Boost',
      image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&auto=format&fit=crop&q=80',
      ingredients: [
        '200g Fresh tuna or salmon (steamed, boneless)',
        '1 hardboiled egg yolk (nutrient dense)',
        '1 tbsp finely steamed mashed baby carrots',
        '1/2 tsp wild salmon oil',
      ],
      instructions:
        'Steam fresh fish until flaky. Mash egg yolk with fish flakes and steamed carrots. Drizzle salmon oil on top to stimulate appetite.',
      benefits: 'High protein and healthy fats to encourage cats needing gentle weight gain or recovering appetite.',
    },
    {
      id: 'c3',
      title: 'Delicate Turkey & Bone Broth Gravy',
      tag: 'Gentle Digestion & Urinary Health',
      suitableFor: ['ideal', 'overweight', 'underweight'],
      prepTime: '20 min',
      calories: 'Hydration Specialist',
      image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&auto=format&fit=crop&q=80',
      ingredients: [
        '250g Ground lean turkey breast',
        '1 cup unsalted homemade bone broth',
        '1 pinch dried cat grass or parsley (finely chopped)',
      ],
      instructions:
        'Lightly poach lean turkey in bone broth until fully cooked. Flake into tiny bites with plenty of warm aromatic broth. Serve warm.',
      benefits: 'Superior moisture content helps prevent FLUTD (feline urinary tract disease) and supports senior cats.',
    },
  ],
};

export const SAFE_AND_TOXIC_FOODS = {
  Dog: {
    safe: ['Blueberries', 'Carrots', 'Green beans', 'Apples (no seeds)', 'Cucumbers', 'Cooked eggs', 'Plain pumpkin'],
    toxic: ['Chocolate', 'Grapes & Raisins', 'Onions & Garlic', 'Xylitol (sweetener)', 'Avocado pits', 'Macadamia nuts', 'Cooked bones'],
  },
  Cat: {
    safe: ['Cooked chicken/turkey', 'Canned tuna in water (occasional)', 'Steamed pumpkin', 'Cooked eggs', 'Cat grass'],
    toxic: ['Lilies (extremely toxic!)', 'Onions & Chives', 'Garlic', 'Cow’s milk/dairy (causes diarrhea)', 'Raw bread dough', 'Chocolate'],
  },
};

export const EXERCISE_PLANS = {
  Dog: {
    dailyTarget: '45–90 minutes daily (varies by breed & size)',
    routines: [
      {
        title: 'Structured Paced Walking',
        duration: '30–45 mins',
        intensity: 'Moderate',
        desc: 'Consistent rhythmic walking keeps cardiovascular system strong and maintains healthy joint lubrication.',
      },
      {
        title: 'Sniffari (Scent Exploration)',
        duration: '15–20 mins',
        intensity: 'Mental Fitness',
        desc: 'Allowing your dog to freely sniff grass and trees lowers cortisol, releases dopamine, and burns mental energy.',
      },
      {
        title: 'Interval Fetch & Retrieve',
        duration: '15 mins',
        intensity: 'High Intensity',
        desc: 'Short explosive sprints build muscle tone. Avoid over-exercising on concrete or under direct noon heat.',
      },
    ],
    tips: 'Always carry fresh water. If the pavement is too hot for your bare hand for 7 seconds, it is too hot for your dog’s paws!',
  },
  Cat: {
    dailyTarget: '20–30 minutes daily (in 10–15 min play bursts)',
    routines: [
      {
        title: 'Predatory Wand & Feather Stalking',
        duration: '10–15 mins, 2x daily',
        intensity: 'High Burst',
        desc: 'Mimics bird and rodent movement. Allow your cat to periodically "catch" the toy to satisfy hunting instinct.',
      },
      {
        title: 'Vertical Climbing & Tree Navigation',
        duration: 'Throughout the day',
        intensity: 'Moderate',
        desc: 'Scratching posts and multi-level cat trees strengthen feline shoulder muscles and spine flexibility.',
      },
      {
        title: 'Foraging Puzzle Toys & Treat Rollers',
        duration: '10 mins',
        intensity: 'Mental Fitness',
        desc: 'Slow-feeder balls and hide-and-seek kibble satisfy the feline instinct to work for their nourishment.',
      },
    ],
    tips: 'Cats are natural sprinters, not endurance runners. Stop play when your cat rests or breathes heavily.',
  },
};

export const BREED_WEIGHT_BENCHMARKS = {
  // Dogs (kg)
  'golden retriever': { min: 25.0, max: 34.0 },
  'labrador': { min: 25.0, max: 36.0 },
  'labrador retriever': { min: 25.0, max: 36.0 },
  'german shepherd': { min: 26.0, max: 40.0 },
  'french bulldog': { min: 8.0, max: 13.5 },
  'bulldog': { min: 18.0, max: 25.0 },
  'beagle': { min: 9.0, max: 14.0 },
  'poodle': { min: 20.0, max: 32.0 },
  'chihuahua': { min: 1.5, max: 3.2 },
  'pug': { min: 6.0, max: 9.0 },
  'husky': { min: 16.0, max: 27.0 },
  'siberian husky': { min: 16.0, max: 27.0 },
  'rottweiler': { min: 36.0, max: 54.0 },
  'boxer': { min: 25.0, max: 32.0 },
  'shih tzu': { min: 4.0, max: 7.5 },
  'dachshund': { min: 5.0, max: 12.0 },
  'corgi': { min: 10.0, max: 14.0 },

  // Cats (kg)
  'persian': { min: 3.2, max: 5.0 },
  'siamese': { min: 3.0, max: 4.8 },
  'maine coon': { min: 5.0, max: 8.5 },
  'ragdoll': { min: 4.0, max: 8.0 },
  'bengal': { min: 3.5, max: 6.5 },
  'british shorthair': { min: 4.0, max: 7.0 },
  'domestic shorthair': { min: 3.5, max: 5.0 },
};

/**
 * Evaluates whether a pet is Underweight, Ideal, or Overweight
 * based on breed, species, and current weight.
 */
export function getWeightEvaluation(species = 'Dog', breed = '', currentWeight = 0, unit = 'kg') {
  const normWeight = Number(currentWeight) || 0;
  const isCat = (species || '').toLowerCase().includes('cat');
  const breedKey = (breed || '').trim().toLowerCase();

  let benchmark = BREED_WEIGHT_BENCHMARKS[breedKey];

  if (!benchmark) {
    // Sensible defaults if breed is mixed or unspecified
    if (isCat) {
      benchmark = { min: 3.5, max: 5.2 };
    } else {
      // Default dog estimate based on approximate size
      if (normWeight > 22) benchmark = { min: 24.0, max: 34.0 };
      else if (normWeight > 10) benchmark = { min: 10.0, max: 18.0 };
      else benchmark = { min: 4.0, max: 9.0 };
    }
  }

  let status = 'ideal';
  let diff = 0;
  let statusLabel = 'Ideal / Healthy Weight';
  let badgeColor = '#1F5C4A';
  let summaryText = '';
  let dietSuggestion = '';
  let exerciseSuggestion = '';

  if (normWeight > benchmark.max) {
    status = 'overweight';
    diff = +(normWeight - benchmark.max).toFixed(1);
    statusLabel = `Overweight (+${diff} ${unit})`;
    badgeColor = '#FF7A50';
    summaryText = `Weight is approximately ${diff} ${unit} above the recommended healthy range (${benchmark.min}–${benchmark.max} ${unit}) for a ${breed || species}.`;
    dietSuggestion = isCat
      ? 'Reduce daily dry kibble by 15%. Transition to high-protein canned wet food or pumpkin puree to increase satiety with fewer calories. Avoid all table snacks.'
      : 'Reduce meal portions by 10–15%. Replace 1/3 of kibble with steamed green beans or pumpkin to keep them feeling full. Cut out high-calorie treats.';
    exerciseSuggestion = isCat
      ? 'Introduce two 15-minute interactive predatory play sessions daily using feather wands or slow-roll laser toys.'
      : 'Prioritize joint-friendly, low-impact exercise like swimming or longer, steady-paced walks (45–60 mins). Avoid high-impact jumps.';
  } else if (normWeight < benchmark.min) {
    status = 'underweight';
    diff = +(benchmark.min - normWeight).toFixed(1);
    statusLabel = `Underweight (-${diff} ${unit})`;
    badgeColor = '#F2A93B';
    summaryText = `Weight is approximately ${diff} ${unit} below the recommended healthy range (${benchmark.min}–${benchmark.max} ${unit}) for a ${breed || species}.`;
    dietSuggestion = isCat
      ? 'Feed nutrient-dense kitten or recovery wet food with extra animal protein (chicken hearts, egg yolk). Offer small meals 3–4 times daily.'
      : 'Increase calorie density with lean beef, cooked salmon, or an extra half-portion of high-protein food. Check for parasites or dental issues.';
    exerciseSuggestion = isCat
      ? 'Keep exercise to gentle, non-strenuous play to prevent excess caloric burn until optimal weight is restored.'
      : 'Focus on short 20-minute gentle walks and muscle-building games rather than exhaustive endurance running.';
  } else {
    status = 'ideal';
    diff = 0;
    statusLabel = `Healthy Weight (${benchmark.min}–${benchmark.max} ${unit})`;
    badgeColor = '#1F5C4A';
    summaryText = `Weight is right in the prime healthy range (${benchmark.min}–${benchmark.max} ${unit}) for a ${breed || species}. Keep up the great care!`;
    dietSuggestion = 'Maintain current balanced daily caloric portions. Provide high-quality protein and fresh clean water daily.';
    exerciseSuggestion = isCat
      ? 'Continue daily interactive play (15–20 mins) to maintain muscle tone and mental stimulation.'
      : 'Continue regular daily walking and play routine (45–60 mins) to keep heart and joints fit.';
  }

  return {
    status,
    statusLabel,
    diff,
    idealMin: benchmark.min,
    idealMax: benchmark.max,
    summaryText,
    dietSuggestion,
    exerciseSuggestion,
    badgeColor,
  };
}
