/* ═══════════════════════════════════════════════════════════════════════════
   PETSY — Smart Autocomplete Engine v1.0
   Context-aware suggestions for breeds, vaccines, medicines, foods & more
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

// ─── Breed Databases ──────────────────────────────────────────────────────────
const DOG_BREEDS = [
  'Affenpinscher','Afghan Hound','Airedale Terrier','Akita','Alaskan Malamute',
  'American Bulldog','American Eskimo Dog','American Foxhound','American Pit Bull Terrier',
  'American Staffordshire Terrier','Anatolian Shepherd','Australian Cattle Dog',
  'Australian Shepherd','Australian Terrier','Basenji','Basset Hound','Beagle',
  'Bearded Collie','Bedlington Terrier','Belgian Malinois','Belgian Sheepdog',
  'Belgian Tervuren','Bernese Mountain Dog','Bichon Frise','Black and Tan Coonhound',
  'Bloodhound','Border Collie','Border Terrier','Borzoi','Boston Terrier',
  'Bouvier des Flandres','Boxer','Boykin Spaniel','Briard','Brittany',
  'Brussels Griffon','Bull Terrier','Bulldog','Bullmastiff','Cairn Terrier',
  'Canaan Dog','Cardigan Welsh Corgi','Cavalier King Charles Spaniel','Chesapeake Bay Retriever',
  'Chihuahua','Chinese Crested','Chinese Shar-Pei','Chow Chow','Clumber Spaniel',
  'Cocker Spaniel','Collie','Dachshund','Dalmatian','Doberman Pinscher',
  'English Setter','English Springer Spaniel','Field Spaniel','Finnish Spitz',
  'Flat-Coated Retriever','French Bulldog','German Pinscher','German Shepherd',
  'German Shorthaired Pointer','Giant Schnauzer','Golden Retriever','Gordon Setter',
  'Great Dane','Great Pyrenees','Greyhound','Harrier','Havanese',
  'Ibizan Hound','Irish Red and White Setter','Irish Setter','Irish Terrier',
  'Irish Water Spaniel','Irish Wolfhound','Italian Greyhound','Jack Russell Terrier',
  'Japanese Chin','Keeshond','Kerry Blue Terrier','Komondor','Kuvasz',
  'Labrador Retriever','Lakeland Terrier','Leonberger','Lhasa Apso',
  'Lowchen','Maltese','Manchester Terrier','Mastiff','Miniature Bull Terrier',
  'Miniature Pinscher','Miniature Schnauzer','Mudhol Hound','Neapolitan Mastiff',
  'Newfoundland','Norfolk Terrier','Norwegian Elkhound','Norwich Terrier',
  'Old English Sheepdog','Otterhound','Papillon','Parson Russell Terrier',
  'Pekingese','Pembroke Welsh Corgi','Pharaoh Hound','Plott','Pointer',
  'Polish Lowland Sheepdog','Pomeranian','Poodle (Miniature)','Poodle (Standard)',
  'Poodle (Toy)','Portuguese Water Dog','Pug','Puli','Rajapalayam',
  'Rhodesian Ridgeback','Rottweiler','Saint Bernard','Saluki','Samoyed',
  'Schipperke','Scottish Deerhound','Scottish Terrier','Sealyham Terrier',
  'Shetland Sheepdog','Shiba Inu','Shih Tzu','Siberian Husky','Silky Terrier',
  'Skye Terrier','Smooth Fox Terrier','Soft Coated Wheaten Terrier',
  'Staffordshire Bull Terrier','Standard Schnauzer','Sussex Spaniel',
  'Tibetan Mastiff','Tibetan Spaniel','Tibetan Terrier','Toy Fox Terrier',
  'Vizsla','Weimaraner','Welsh Springer Spaniel','Welsh Terrier',
  'West Highland White Terrier','Whippet','Wire Fox Terrier','Wirehaired Pointing Griffon',
  'Xoloitzcuintli','Yorkshire Terrier','Kombai','Chippiparai','Kanni',
  'Indian Pariah Dog','Spitz (Indian)','Bully Kutta',
];

const CAT_BREEDS = [
  'Abyssinian','American Bobtail','American Curl','American Shorthair',
  'American Wirehair','Balinese','Bengal','Birman','Bombay','British Longhair',
  'British Shorthair','Burmese','Burmilla','California Spangled','Chartreux',
  'Chausie','Cornish Rex','Cymric','Devon Rex','Domestic Longhair',
  'Domestic Shorthair','Egyptian Mau','European Shorthair','Exotic Shorthair',
  'Havana Brown','Himalayan','Japanese Bobtail','Javanese','Khao Manee',
  'Korat','LaPerm','Maine Coon','Manx','Munchkin','Norwegian Forest Cat',
  'Ocicat','Oriental','Persian','Peterbald','Pixiebob','Ragamuffin','Ragdoll',
  'Russian Blue','Savannah','Scottish Fold','Selkirk Rex','Siamese','Siberian',
  'Singapura','Snowshoe','Somali','Sphynx','Thai','Tonkinese','Toyger',
  'Traditional Persian','Turkish Angora','Turkish Van','York Chocolate',
];

// ─── Vaccine Databases ────────────────────────────────────────────────────────
const DOG_VACCINES = [
  'Rabies (1-year)','Rabies (3-year)','Distemper','Parvovirus','Adenovirus',
  'DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)',
  'DA2PP (Distemper, Adenovirus, Parvovirus, Parainfluenza)',
  'Bordetella (Kennel Cough)','Leptospirosis','Lyme Disease',
  'Canine Influenza H3N8','Canine Influenza H3N2','Bivalent Canine Influenza',
  'Rattlesnake Vaccine','Coronavirus','Parainfluenza',
];

const CAT_VACCINES = [
  'Rabies (1-year)','Rabies (3-year)','FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)',
  'Feline Herpesvirus','Feline Calicivirus','Feline Panleukopenia',
  'Feline Leukemia Virus (FeLV)','Feline Immunodeficiency Virus (FIV)',
  'Feline Infectious Peritonitis (FIP)','Chlamydophila felis','Bordetella',
];

// ─── Medicine Databases ───────────────────────────────────────────────────────
const PET_MEDICINES = [
  // Dewormers
  'Albendazole','Fenbendazole (Panacur)','Ivermectin','Mebendazole',
  'Milbemycin oxime (Interceptor)','Praziquantel','Pyrantel pamoate',
  // Flea/Tick
  'Afoxolaner (NexGard)','Bravecto (Fluralaner)','Fipronil (Frontline)',
  'Imidacloprid (Advantage)','Lufenuron (Program)','Selamectin (Revolution)',
  'Sarolaner (Simparica)','Spinosad (Comfortis)',
  // Antibiotics
  'Amoxicillin','Amoxicillin-Clavulanate (Clavamox)','Azithromycin',
  'Cephalexin','Ciprofloxacin','Clindamycin','Doxycycline','Enrofloxacin (Baytril)',
  'Metronidazole (Flagyl)','Trimethoprim-Sulfonamide',
  // Anti-inflammatories
  'Carprofen (Rimadyl)','Deracoxib (Deramaxx)','Grapiprant (Galliprant)',
  'Meloxicam (Metacam)','Robenacoxib (Onsior)','Prednisolone','Prednisone',
  // GI
  'Cerenia (Maropitant)','Famotidine','Metoclopramide','Ondansetron',
  'Omeprazole','Sucralfate',
  // Supplements
  'Cosequin (Glucosamine)','Fish Oil (Omega-3)','Probiotics',
  'Vitamin B12','Vitamin E','Zinc',
  // Common brand names India
  'Ivomec','Caniverm','Drontal','Milbemax','Heartgard Plus',
  'Nexgard Spectra','Bravecto Spot-On',
];

// ─── Food/Ingredient Databases ────────────────────────────────────────────────
const PET_SAFE_INGREDIENTS = [
  // Proteins
  'Chicken (boiled, boneless)','Chicken Liver (cooked)','Chicken Breast',
  'Mutton (boiled)','Beef (cooked)','Egg (boiled)','Egg White','Fish (Rohu)',
  'Fish (Catla)','Sardines (cooked)','Tuna (in water)','Paneer (unsalted)',
  'Cottage Cheese (low fat)',
  // Carbs/Grains
  'Brown Rice (cooked)','White Rice (cooked)','Oats (cooked, plain)',
  'Barley (cooked)','Sweet Potato (boiled)','Potato (boiled, plain)',
  'Tapioca (boiled)','Ragi (cooked)',
  // Vegetables
  'Carrot (raw/cooked)','Pumpkin (cooked, plain)','Spinach (cooked)',
  'Green Beans (cooked)','Peas (cooked)','Beetroot (cooked)','Broccoli (cooked)',
  'Bottle Gourd (cooked)','Ridge Gourd (cooked)','Zucchini (cooked)',
  // Fruits (dog-safe)
  'Apple (no seeds)','Banana','Blueberry','Mango (no seed)','Papaya',
  'Watermelon (no rind/seeds)','Coconut (fresh, small amount)',
  // Supplements/Toppers
  'Flaxseed (ground)','Coconut Oil (small amount)','Turmeric (small amount)',
  'Curd/Yoghurt (plain, unsweetened)','Ghee (small amount)',
];

const TOXIC_FOODS = [
  'Chocolate','Grapes','Raisins','Onion','Garlic','Xylitol','Avocado',
  'Macadamia Nuts','Alcohol','Caffeine','Coffee','Tea','Nutmeg','Salt (excess)',
  'Sugar (excess)','Cooked Bones','Raw Dough','Mushrooms (wild)','Cherries',
  'Chives','Leeks','Green Tomatoes','Fruit Seeds/Pits',
];

// ─── Activities ───────────────────────────────────────────────────────────────
const PET_ACTIVITIES = [
  'Morning Walk','Evening Walk','Off-Leash Play','Fetch','Tug of War',
  'Swimming','Agility Training','Obedience Training','Socialisation Walk',
  'Frisbee','Hiking','Running/Jogging','Puppy Playtime','Cat Tower Play',
  'Laser Pointer Play','Feather Wand Play','Puzzle Feeder','Hide and Seek',
  'Nose Work / Scent Training','Doggy Daycare','Dog Park Visit',
  'Interactive Toy Session','Massage/Brushing','Grooming Session',
];

// ─── Vet/Clinic Fields ────────────────────────────────────────────────────────
const VET_SPECIALTIES = [
  'General Practice','Dermatology','Dentistry','Ophthalmology','Oncology',
  'Orthopaedics','Cardiology','Neurology','Surgery','Emergency & Critical Care',
  'Internal Medicine','Behaviour','Exotic Animals','Avian Medicine',
];

// ─── Context-to-dataset map ───────────────────────────────────────────────────
const AUTOCOMPLETE_CONTEXTS = {
  breed_dog: DOG_BREEDS,
  breed_cat: CAT_BREEDS,
  breed: [...DOG_BREEDS, ...CAT_BREEDS],
  vaccine_dog: DOG_VACCINES,
  vaccine_cat: CAT_VACCINES,
  vaccine: [...DOG_VACCINES, ...CAT_VACCINES],
  medicine: PET_MEDICINES,
  ingredient: PET_SAFE_INGREDIENTS,
  activity: PET_ACTIVITIES,
  vet_specialty: VET_SPECIALTIES,
};

// ─── Core Autocomplete Engine ─────────────────────────────────────────────────
let _acDropdown = null;
let _acActive   = null;

function acSearch(query, dataset, maxResults = 10) {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase();
  const starts = dataset.filter(d => d.toLowerCase().startsWith(q));
  const contains = dataset.filter(d => !d.toLowerCase().startsWith(q) && d.toLowerCase().includes(q));
  return [...starts, ...contains].slice(0, maxResults);
}

function createDropdown() {
  const el = document.createElement('ul');
  el.className = 'ac-dropdown';
  el.id = 'ac-dropdown';
  document.body.appendChild(el);
  _acDropdown = el;
  return el;
}

function positionDropdown(input) {
  const rect = input.getBoundingClientRect();
  _acDropdown.style.left   = `${rect.left + window.scrollX}px`;
  _acDropdown.style.top    = `${rect.bottom + window.scrollY + 2}px`;
  _acDropdown.style.width  = `${rect.width}px`;
}

function closeDropdown() {
  if (_acDropdown) {
    _acDropdown.remove();
    _acDropdown = null;
  }
  _acActive = null;
}

function attachAutocomplete(input, contextKey, customDataset) {
  if (!input) return;
  const dataset = customDataset || AUTOCOMPLETE_CONTEXTS[contextKey] || [];
  if (!dataset.length) return;

  input.setAttribute('autocomplete', 'off');

  input.addEventListener('input', function() {
    const query = this.value.trim();
    const results = acSearch(query, dataset);
    showDropdown(this, results);
  });

  input.addEventListener('focus', function() {
    const query = this.value.trim();
    if (query) {
      const results = acSearch(query, dataset);
      showDropdown(this, results);
    }
  });

  input.addEventListener('keydown', function(e) {
    if (!_acDropdown) return;
    const items = [..._acDropdown.querySelectorAll('li')];
    const idx = items.findIndex(li => li.classList.contains('ac-selected'));
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = idx < items.length - 1 ? idx + 1 : 0;
      items.forEach(li => li.classList.remove('ac-selected'));
      items[next]?.classList.add('ac-selected');
      items[next]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = idx > 0 ? idx - 1 : items.length - 1;
      items.forEach(li => li.classList.remove('ac-selected'));
      items[prev]?.classList.add('ac-selected');
      items[prev]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      const sel = _acDropdown.querySelector('.ac-selected');
      if (sel) {
        e.preventDefault();
        input.value = sel.textContent;
        closeDropdown();
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  });

  // Close when clicking outside
  document.addEventListener('click', function outsideClick(e) {
    if (e.target !== input && !_acDropdown?.contains(e.target)) {
      closeDropdown();
      document.removeEventListener('click', outsideClick);
    }
  });
}

function showDropdown(input, results) {
  if (_acActive !== input) {
    closeDropdown();
    _acActive = input;
  }
  if (!results.length) { closeDropdown(); return; }
  if (!_acDropdown) createDropdown();
  positionDropdown(input);

  _acDropdown.innerHTML = '';
  results.forEach(r => {
    const li = document.createElement('li');
    li.className = 'ac-item';
    // Bold matching portion
    const q = input.value.trim();
    const idx = r.toLowerCase().indexOf(q.toLowerCase());
    if (idx >= 0) {
      li.innerHTML = r.slice(0, idx) +
        `<strong>${r.slice(idx, idx + q.length)}</strong>` +
        r.slice(idx + q.length);
    } else {
      li.textContent = r;
    }
    li.addEventListener('mousedown', (e) => {
      e.preventDefault();
      input.value = r;
      closeDropdown();
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.focus();
    });
    _acDropdown.appendChild(li);
  });
}

// ─── Toxic Warning System ─────────────────────────────────────────────────────
function checkToxicIngredient(value) {
  const val = (value || '').toLowerCase();
  const found = TOXIC_FOODS.find(t => val.includes(t.toLowerCase()));
  return found || null;
}

// ─── Breed Autocomplete with Species Awareness ────────────────────────────────
function attachBreedAutocomplete(input, speciesSelectId) {
  if (!input) return;
  const getDataset = () => {
    const species = document.getElementById(speciesSelectId)?.value?.toLowerCase() || '';
    if (species.includes('dog')) return DOG_BREEDS;
    if (species.includes('cat')) return CAT_BREEDS;
    return [...DOG_BREEDS, ...CAT_BREEDS];
  };

  input.setAttribute('autocomplete', 'off');

  input.addEventListener('input', function() {
    const results = acSearch(this.value.trim(), getDataset());
    showDropdown(this, results);
  });

  input.addEventListener('focus', function() {
    const query = this.value.trim();
    if (query) showDropdown(this, acSearch(query, getDataset()));
  });

  input.addEventListener('keydown', function(e) {
    if (!_acDropdown) return;
    const items = [..._acDropdown.querySelectorAll('li')];
    const idx = items.findIndex(li => li.classList.contains('ac-selected'));
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = idx < items.length - 1 ? idx + 1 : 0;
      items.forEach(li => li.classList.remove('ac-selected'));
      items[next]?.classList.add('ac-selected');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = idx > 0 ? idx - 1 : items.length - 1;
      items.forEach(li => li.classList.remove('ac-selected'));
      items[prev]?.classList.add('ac-selected');
    } else if (e.key === 'Enter') {
      const sel = _acDropdown.querySelector('.ac-selected');
      if (sel) {
        e.preventDefault();
        input.value = sel.textContent;
        closeDropdown();
      }
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  });

  document.addEventListener('click', function(e) {
    if (e.target !== input && !_acDropdown?.contains(e.target)) closeDropdown();
  });
}

// ─── Expose Globally ──────────────────────────────────────────────────────────
window.AC = {
  attach: attachAutocomplete,
  attachBreed: attachBreedAutocomplete,
  checkToxic: checkToxicIngredient,
  close: closeDropdown,
  DOG_BREEDS,
  CAT_BREEDS,
  DOG_VACCINES,
  CAT_VACCINES,
  PET_MEDICINES,
  PET_SAFE_INGREDIENTS,
  PET_ACTIVITIES,
  TOXIC_FOODS,
};
