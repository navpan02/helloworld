// Seasonal Intelligence — zip→region mapping + recommendation matrix
// Epic #8: Phase 1 uses zip + current month only (no weather API, no account required)

/**
 * Maps a US zip code to a climate grass region.
 * Returns 'cool', 'warm', 'transition', or null (unrecognised).
 */
export function getClimateRegion(zip) {
  if (!zip || !/^\d{5}/.test(zip)) return null;
  const p = parseInt(zip.slice(0, 3), 10);

  // Cool-season grass regions: Midwest, Northeast, PNW, Mountain
  if (
    (p >= 10 && p <= 99)   ||  // New England, NY outer, NJ, PA, DE, MD, DC
    (p >= 100 && p <= 212) ||  // NY, PA, DE, MD, DC, VA (north)
    (p >= 214 && p <= 219) ||  // MD
    (p >= 400 && p <= 499) ||  // KY, OH, IN, MI
    (p >= 500 && p <= 599) ||  // IA, WI, MN, SD, ND, MT
    (p >= 600 && p <= 649) ||  // IL (includes 606 = Chicago, 605 = Naperville)
    (p >= 660 && p <= 693) ||  // KS, NE
    (p >= 800 && p <= 838) ||  // CO, WY, ID
    (p >= 970 && p <= 994)     // OR, WA
  ) return 'cool';

  // Warm-season grass regions: South, Southeast, Southwest
  if (
    (p >= 290 && p <= 399) ||  // SC, GA, FL, AL, MS
    (p >= 700 && p <= 799) ||  // LA, AR, OK, TX
    (p >= 850 && p <= 898)     // AZ, NM, NV
  ) return 'warm';

  // Transition zone: VA (south), NC, TN, MO (south), CA, UT, and others
  return 'transition';
}

/**
 * Returns the current season name based on month (1-12).
 */
function getSeason(month) {
  if (month >= 3 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 8) return 'Summer';
  if (month >= 9 && month <= 11) return 'Fall';
  return 'Winter';
}

/**
 * Recommendation matrix: region × season → treatments + messaging.
 * Each treatment has a label and a route path.
 */
const MATRIX = {
  cool: {
    Spring: {
      heading: "It's spring in your region",
      summary: "Now is the critical window for pre-emergent crabgrass control. Aeration before summer heat sets your lawn up for the season.",
      treatments: [
        { label: 'Pre-Emergent Weed Control', to: '/lawn-care' },
        { label: 'Core Aeration & Overseeding', to: '/CleanLawn/aeration-seeding' },
        { label: 'Spring Fertilization', to: '/lawn-care' },
      ],
    },
    Summer: {
      heading: "Summer lawn care for cool-season grass",
      summary: "Minimize nitrogen in peak heat. Focus on deep, infrequent watering and spot weed control to protect roots through summer stress.",
      treatments: [
        { label: 'Lawn Care Plans', to: '/lawn-care' },
        { label: 'Mowing Service', to: '/CleanLawn/mowing' },
        { label: 'Mulching', to: '/CleanLawn/mulching' },
      ],
    },
    Fall: {
      heading: "Fall is the most important window",
      summary: "Core aeration, overseeding, and a fall fertilizer application now will determine how thick and healthy your lawn is next spring.",
      treatments: [
        { label: 'Core Aeration & Overseeding', to: '/CleanLawn/aeration-seeding' },
        { label: 'Fall Fertilization', to: '/lawn-care' },
        { label: 'Leaf Removal', to: '/CleanLawn/leaf-removal' },
      ],
    },
    Winter: {
      heading: "Plan ahead for spring",
      summary: "Your lawn is dormant — no treatments needed now. This is the right time to plan your spring schedule and lock in your lawn care program.",
      treatments: [
        { label: 'View Lawn Care Plans', to: '/lawn-care' },
        { label: 'Get a Free Quote', to: '/quote' },
      ],
    },
  },

  warm: {
    Spring: {
      heading: "Prime growing season starts now",
      summary: "Warm-season grasses are breaking dormancy. Apply pre-emergent and your first fertilization round as the soil warms up.",
      treatments: [
        { label: 'Lawn Care Plans', to: '/lawn-care' },
        { label: 'Pre-Emergent Weed Control', to: '/lawn-care' },
        { label: 'Core Aeration', to: '/CleanLawn/aeration-seeding' },
      ],
    },
    Summer: {
      heading: "Peak season for warm-season grass",
      summary: "This is your lawn's prime growth window. Fertilize regularly, stay on top of weed control, and keep mowing at the right height.",
      treatments: [
        { label: 'Lawn Care Plans', to: '/lawn-care' },
        { label: 'Mowing Service', to: '/CleanLawn/mowing' },
        { label: 'Weed & Pest Control', to: '/lawn-care' },
      ],
    },
    Fall: {
      heading: "Prepare your warm-season lawn for dormancy",
      summary: "Apply a late-season potassium-rich fertilizer to harden the grass before dormancy. Avoid heavy nitrogen — it weakens roots over winter.",
      treatments: [
        { label: 'Fall Fertilization', to: '/lawn-care' },
        { label: 'Leaf Removal', to: '/CleanLawn/leaf-removal' },
      ],
    },
    Winter: {
      heading: "Your lawn is dormant",
      summary: "Warm-season grass is dormant and doesn't need treatment. Plan your spring program now to get a head start.",
      treatments: [
        { label: 'View Lawn Care Plans', to: '/lawn-care' },
        { label: 'Get a Free Quote', to: '/quote' },
      ],
    },
  },

  transition: {
    Spring: {
      heading: "Transition zone — spring is critical",
      summary: "Both cool- and warm-season grasses grow in your region. Apply pre-emergent weed control now, and time fertilization to your grass type.",
      treatments: [
        { label: 'Pre-Emergent Weed Control', to: '/lawn-care' },
        { label: 'Core Aeration', to: '/CleanLawn/aeration-seeding' },
        { label: 'Lawn Care Plans', to: '/lawn-care' },
      ],
    },
    Summer: {
      heading: "Manage summer stress in your region",
      summary: "Transition zones face unique pressure in summer. Keep cool-season grass mowed high and ensure deep watering during heat spikes.",
      treatments: [
        { label: 'Lawn Care Plans', to: '/lawn-care' },
        { label: 'Mowing Service', to: '/CleanLawn/mowing' },
      ],
    },
    Fall: {
      heading: "Fall is prime time for your lawn",
      summary: "Aeration and overseeding in fall gives cool-season areas the best results. Transition zone lawns also benefit from fall fertilization.",
      treatments: [
        { label: 'Core Aeration & Overseeding', to: '/CleanLawn/aeration-seeding' },
        { label: 'Fall Fertilization', to: '/lawn-care' },
        { label: 'Leaf Removal', to: '/CleanLawn/leaf-removal' },
      ],
    },
    Winter: {
      heading: "Dormant season — plan for spring",
      summary: "Minimal lawn activity in winter. Get your spring schedule in place now so you don't miss the pre-emergent window.",
      treatments: [
        { label: 'View Lawn Care Plans', to: '/lawn-care' },
        { label: 'Get a Free Quote', to: '/quote' },
      ],
    },
  },
};

/**
 * Main entry point.
 * Given a zip code, returns a recommendation object or null.
 *
 * @param {string} zip
 * @param {Date} [now] - optional date override (for testing)
 * @returns {{ season, region, heading, summary, treatments } | null}
 */
export function getSeasonalRecommendation(zip, now = new Date()) {
  const region = getClimateRegion(zip);
  if (!region) return null;

  const month = now.getMonth() + 1; // 1-12
  const season = getSeason(month);
  const rec = MATRIX[region][season];

  return { season, region, ...rec };
}
