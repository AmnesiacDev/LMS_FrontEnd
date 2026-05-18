/**
 * Avatar utility
 *
 * Uses DiceBear "notionists" style — clean, modern illustrated portraits
 * that look professional and brand-appropriate.
 *
 * Gender detection covers common Arabic and English names.
 */

/* ── Common female name fragments (Arabic + English) ── */
const FEMALE_FRAGMENTS = [
  // Arabic female names / endings
  'noha', 'nour', 'noor', 'sara', 'sarah', 'mariam', 'maryam', 'fatima',
  'fatime', 'aya', 'ayah', 'hana', 'hana', 'heba', 'hiba', 'dina', 'dena',
  'rania', 'ranya', 'rana', 'reem', 'rim', 'layla', 'leila', 'lina', 'lena',
  'nadia', 'nadya', 'yasmin', 'jasmin', 'jasmine', 'amira', 'amira', 'salma',
  'samira', 'samira', 'mona', 'muna', 'hala', 'halla', 'eman', 'iman',
  'asmaa', 'asma', 'doaa', 'dua', 'ghada', 'hadeer', 'hadyr', 'mai', 'may',
  'manar', 'menna', 'mina', 'mirna', 'nada', 'nahla', 'nesma', 'nessma',
  'nihal', 'randa', 'rasha', 'rawda', 'rehab', 'riham', 'ruba', 'ruqaya',
  'sahar', 'sana', 'shaimaa', 'shaima', 'shimaa', 'shirin', 'soha', 'suha',
  'wafaa', 'wafa', 'yara', 'zainab', 'zaynab', 'zeina', 'zina',
  // English female names
  'emma', 'olivia', 'sophia', 'isabella', 'mia', 'charlotte', 'amelia',
  'harper', 'evelyn', 'abigail', 'emily', 'elizabeth', 'sofia', 'avery',
  'ella', 'scarlett', 'grace', 'chloe', 'victoria', 'riley', 'aria',
  'lily', 'aurora', 'zoey', 'penelope', 'layla', 'nora', 'luna', 'ellie',
  'hannah', 'lillian', 'natalie', 'addison', 'aubrey', 'eleanor', 'anna',
  'stella', 'zoe', 'leah', 'hazel', 'violet', 'aurora', 'savannah',
  'audrey', 'brooklyn', 'bella', 'claire', 'skylar', 'lucy', 'paisley',
  'everly', 'anna', 'caroline', 'nova', 'genesis', 'emilia', 'kennedy',
  'samantha', 'maya', 'willow', 'kinsley', 'naomi', 'aaliyah', 'elena',
  'kate', 'katherine', 'alice', 'jessica', 'jennifer', 'ashley', 'amanda',
  'melissa', 'stephanie', 'nicole', 'rachel', 'megan', 'brittany', 'amber',
];

/**
 * Detect gender from a full name string.
 * Returns 'female' | 'male'
 */
export const detectGender = (fullName = '') => {
  if (!fullName) return 'male';
  const first = fullName.trim().split(/\s+/)[0].toLowerCase();
  // Check exact match or if the first name starts with a known female fragment
  for (const frag of FEMALE_FRAGMENTS) {
    if (first === frag || first.startsWith(frag)) return 'female';
  }
  return 'male';
};

/**
 * Build a DiceBear avatar URL.
 *
 * Style: "notionists" — clean illustrated portraits, gender-aware
 *
 * @param {string} seed   — stable unique string (user._id preferred)
 * @param {string} name   — full name used for gender detection
 * @param {number} size   — pixel size (default 128)
 */
export const getAvatarUrl = (seed, name = '', size = 128) => {
  const gender = detectGender(name);

  // notionists has separate male/female styles via the `gender` option
  const params = new URLSearchParams({
    seed: seed || name || 'user',
    size: String(size),
    // Restrict hair/body options to the detected gender
    ...(gender === 'female'
      ? {
          // Softer background palette for female
          backgroundColor: 'ffd5dc,ffdfbf,d1fae5,e0e7ff,fce7f3',
        }
      : {
          // Cooler palette for male
          backgroundColor: 'dbeafe,e0e7ff,d1fae5,fef3c7,f3f4f6',
        }),
    backgroundType: 'solid',
    radius: '50',
  });

  return `https://api.dicebear.com/9.x/notionists/svg?${params.toString()}`;
};
