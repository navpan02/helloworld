// Seasonal Intelligence — region mapping + recommendation matrix
// Epic #8: Phase 1 uses location (zip or state from Nominatim) + current month.
// No weather API, no account required.

/**
 * State name → climate grass region.
 * Source: USDA hardiness zone data + turfgrass science literature.
 * Cool = Kentucky bluegrass / fescue / ryegrass territory
 * Warm = Bermuda / zoysia / St. Augustine territory
 * Transition = mixed or either, depending on microclimate
 */
const STATE_REGIONS = {
  // Cool-season states
  Alaska:             'cool',
  Connecticut:        'cool',
  Colorado:           'cool',
  Delaware:           'cool',
  Idaho:              'cool',
  Illinois:           'cool',
  Indiana:            'cool',
  Iowa:               'cool',
  Kansas:             'cool',
  Maine:              'cool',
  Maryland:           'cool',
  Massachusetts:      'cool',
  Michigan:           'cool',
  Minnesota:          'cool',
  Montana:            'cool',
  Nebraska:           'cool',
  'New Hampshire':    'cool',
  'New Jersey':       'cool',
  'New York':         'cool',
  'North Dakota':     'cool',
  Ohio:               'cool',
  Oregon:             'cool',
  Pennsylvania:       'cool',
  'Rhode Island':     'cool',
  'South Dakota':     'cool',
  Vermont:            'cool',
  Washington:         'cool',
  Wisconsin:          'cool',
  Wyoming:            'cool',
  'District of Columbia': 'cool',

  // Warm-season states
  Alabama:            'warm',
  Arizona:            'warm',
  Arkansas:           'warm',
  Florida:            'warm',
  Georgia:            'warm',
  Hawaii:             'warm',
  Louisiana:          'warm',
  Mississippi:        'warm',
  Nevada:             'warm',
  'New Mexico':       'warm',
  Oklahoma:           'warm',
  'South Carolina':   'warm',
  Texas:              'warm',

  // Transition zone
  California:         'transition',
  Kentucky:           'transition',
  Missouri:           'transition',
  'North Carolina':   'transition',
  Tennessee:          'transition',
  Utah:               'transition',
  Virginia:           'transition',
  'West Virginia':    'transition',
};

/**
 * Maps a US zip code to a climate grass region.
 * Returns 'cool', 'warm', 'transition', or null (unrecognised).
 */
export function getClimateRegion(zip) {
  if (!zip || !/^\d{5}/.test(zip)) return null;
  const p = parseInt(zip.slice(0, 3), 10);

  // Cool-season grass regions: Midwest, Northeast, PNW, Mountain, Alaska
  if (
    (p >= 10 && p <= 99)   ||  // New England, NY, NJ, PA, DE, MD, DC
    (p >= 100 && p <= 212) ||  // NY, PA, DE, MD, DC, VA (north)
    (p >= 214 && p <= 219) ||  // MD
    (p >= 400 && p <= 499) ||  // KY, OH, IN, MI
    (p >= 500 && p <= 599) ||  // IA, WI, MN, SD, ND, MT
    (p >= 600 && p <= 649) ||  // IL
    (p >= 660 && p <= 693) ||  // KS, NE
    (p >= 800 && p <= 838) ||  // CO, WY, ID
    (p >= 970 && p <= 999)     // OR, WA, AK
  ) return 'cool';

  // Warm-season grass regions: South, Southeast, Southwest
  if (
    (p >= 290 && p <= 399) ||  // SC, GA, FL, AL, MS
    (p >= 700 && p <= 799) ||  // LA, AR, OK, TX
    (p >= 850 && p <= 898)     // AZ, NM, NV
  ) return 'warm';

  // Transition zone: VA south, NC, TN, MO south, CA, UT, KY, WV
  return 'transition';
}

/**
 * Derives a climate region from a Nominatim address object.
 * Nominatim reliably returns `state` for all result types (city, street, POI).
 * `postcode` is only present for specific addresses — so state takes priority.
 *
 * @param {{ state?: string, postcode?: string }} address
 * @returns {'cool'|'warm'|'transition'|null}
 */
export function getClimateRegionFromAddress(address) {
  if (!address) return null;

  // Try state name first — always present and unambiguous
  if (address.state) {
    const byState = STATE_REGIONS[address.state];
    if (byState) return byState;
  }

  // Fall back to postcode if state lookup failed (e.g. territories, unusual state names)
  if (address.postcode) {
    return getClimateRegion(address.postcode.split('-')[0]);
  }

  return null;
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
      heading: "Your warm-season lawn is dormant",
      summary: "Warm-season grass doesn't need treatment now. Plan your spring program and lock in your schedule before the rush.",
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
 *
 * @param {string | { state?: string, postcode?: string }} input
 *   - string: a 5-digit US zip code (used by Landing, Order, GetQuote)
 *   - object: a Nominatim address object (used by BuyNow — state is more reliable than postcode)
 * @param {Date} [now] - optional date override (for testing)
 * @returns {{ season, region, heading, summary, treatments } | null}
 */
export function getSeasonalRecommendation(input, now = (() => {
  // Dev override: set localStorage.nplawn_date_override = 'YYYY-MM-DD' in the browser console
  // to simulate any time of year. Ignored in production if not set.
  const override = localStorage.getItem('nplawn_date_override');
  return override ? new Date(override) : new Date();
})()) {
  const region = typeof input === 'string'
    ? getClimateRegion(input)
    : getClimateRegionFromAddress(input);

  if (!region) return null;

  const month = now.getMonth() + 1; // 1-12
  const season = getSeason(month);
  const rec = MATRIX[region][season];

  return { season, region, ...rec };
}
