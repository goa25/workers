// TerraLedger Carbon Impact Platform — Core Pledge Set (11 pledges)
// Source: "TerraLedger Recommended Core Pledge Set" — prepared for technical review
// Emission factors: India CEA v21.0 (0.710 kg CO2/kWh), WRI India, IPCC AR6,
//                   Poore & Nemecek 2018 (food), UK Environment Agency (plastics)
// TerraLedger Initiative
//
// IMPORTANT: `apiId` and every field `key` below MUST stay in sync with the backend
// carbon engine (backend/utils/carbonEngine.js) and the Pledges table.

export const INDIA_GRID_FACTOR = 0.710;

export const EMISSION_FACTORS = {
  // Mobility (kg CO2/km)
  car_petrol: 0.127,     // petrol hatchback <1000cc — WRI India
  car_diesel: 0.141,     // diesel car — WRI India
  two_wheeler: 0.0358,   // motorcycle <100cc — WRI India
  auto_rickshaw: 0.090,  // CNG three-wheeler — WRI India
  // Public transport (kg CO2/passenger-km)
  metro: 0.031,
  train: 0.031,
  bus: 0.039,
  e_bus: 0.010,
  // Electricity
  grid: 0.710,           // India CEA CO2 Baseline Database v21.0 (FY2024-25)
  // Food (kg CO2e per meal)
  beef: 7.26, mutton: 5.00, pork: 2.90, chicken: 1.73, plant: 0.50,
  // Single-use plastic lifecycle (kg CO2e per item)
  bottle: 0.161, bag: 0.033, cup: 0.055, straw: 0.010, cutlery: 0.040,
};

export type PledgeCategory = 'Mobility' | 'Energy' | 'Food' | 'Materials';
export type PledgeDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface PledgeField {
  key: string;                                    // MUST match backend input key
  label: string;
  type: 'number' | 'text' | 'select';
  unit?: string;
  placeholder?: string;
  min?: number;
  options?: { value: string; label: string }[];
  showIf?: { key: string; equals: string };       // conditional field
  default?: string | number;
}

export interface Pledge {
  id: string;              // UI slug
  apiId: number;           // backend Pledges.id (1-11)
  formulaType: string;     // backend formula_type
  title: string;
  officialTitle: string;       // official campaign wording
  category: PledgeCategory;
  description: string;
  longDescription: string;
  impact: string;
  co2Savings: string;
  co2Factor: number;
  co2FactorUnit: string;
  co2Methodology: string;
  formula: string;         // plain-language formula shown in the form
  evidence: string;        // required evidence per campaign spec
  note?: string;           // scope caveat surfaced wherever the pledge is shown
  difficulty: PledgeDifficulty;
  timeCommitment: string;
  sdgGoals: number[];
  icon: string;            // lucide icon name
  gradient: string;
  iconBg: string;
  color: string;
  bgColor: string;
  badgeColor: string;
  fields: PledgeField[];
}

/**
 * Public-facing assurance line. The underlying formulas and emission factors are
 * intentionally NOT surfaced in the UI — they remain in this file for the engine
 * and for technical review only.
 */
export const METHODOLOGY_NOTE =
  'Carbon savings are calculated using internationally recognised, industry-standard emission factors, reviewed and approved by the TerraLedger review team.';

export const METHODOLOGY_NOTE_SHORT =
  'Calculated using industry-standard emission factors, approved by the TerraLedger review team.';

const VEHICLE_OPTIONS = [
  { value: 'car_petrol', label: 'Petrol car' },
  { value: 'car_diesel', label: 'Diesel car' },
  { value: 'two_wheeler', label: 'Petrol two-wheeler' },
  { value: 'auto_rickshaw', label: 'Auto-rickshaw / CNG' },
];

export const PLEDGES: Pledge[] = [
  // ─────────────────────────────────────────────── 1. Public Transport
  {
    id: 'public-transport',
    apiId: 1,
    formulaType: 'public_transport',
    title: 'Use Public Transport',
    officialTitle: 'Use Public Transport Instead of a Personal Vehicle',
    category: 'Mobility',
    description: 'Replace personal vehicle trips with bus, metro, or train travel.',
    longDescription:
      'Shifting passenger-km from a personal vehicle to public transport is one of the highest-impact individual actions available. Indian metros and buses emit 3-5x less CO₂ per passenger-km than a private car. Only trips that genuinely replace a personal-vehicle journey are eligible.',
    impact: 'Up to 1.8 tonnes CO₂e/year',
    co2Savings: 'Passenger-km shifted × (baseline vehicle EF − transit EF)',
    co2Factor: 0.096,
    co2FactorUnit: 'kg CO₂e per km (petrol car → metro)',
    co2Methodology:
      'WRI India / IEA: passenger-km shifted × difference between the approved baseline-vehicle and public-transport emission factors. Round trips counted as 2 × one-way distance.',
    formula: '(Baseline vehicle EF − Transit EF) × One-way distance × Trips × 2',
    evidence: 'Ticket, travel-card or QR record, route history, or approved mobility data.',
    difficulty: 'Medium',
    timeCommitment: 'Daily',
    sdgGoals: [11, 13],
    icon: 'Bus',
    gradient: 'from-blue-600 to-blue-400',
    iconBg: 'bg-blue-700/40',
    color: 'text-blue-600', bgColor: 'bg-blue-50', badgeColor: 'bg-blue-100 text-blue-700',
    fields: [
      { key: 'vehicle_type', label: 'Usual vehicle you replaced', type: 'select', options: VEHICLE_OPTIONS, default: 'car_petrol' },
      { key: 'transit_mode', label: 'Public transport mode used', type: 'select', options: [
        { value: 'metro', label: 'Metro / Rapid Rail' },
        { value: 'bus', label: 'City Bus' },
        { value: 'train', label: 'Indian Railways' },
        { value: 'e_bus', label: 'Electric Bus' },
      ], default: 'metro' },
      { key: 'distance_km', label: 'One-way distance', type: 'number', unit: 'km', min: 0.1, placeholder: 'e.g. 15' },
      { key: 'num_trips', label: 'Eligible trips this month', type: 'number', unit: 'trips', min: 1, placeholder: 'e.g. 22' },
    ],
  },

  // ─────────────────────────────────────────────── 2. Carpooling
  {
    id: 'carpooling',
    apiId: 2,
    formulaType: 'carpooling',
    title: 'Carpool Instead of Driving Alone',
    officialTitle: 'Carpool Instead of Driving Alone',
    category: 'Mobility',
    description: 'Share car journeys with verified co-passengers to cut per-person emissions.',
    longDescription:
      'Carpooling with one other person halves your per-passenger transport emissions. With three occupants the reduction reaches 67%. Occupancy must be verifiable; the same journey cannot be claimed by more than one participant.',
    impact: 'Up to 0.9 tonnes CO₂e/year',
    co2Savings: 'Distance × trips × vehicle EF × (1 − 1/occupancy)',
    co2Factor: 0.064,
    co2FactorUnit: 'kg CO₂e per km (petrol car, 2 occupants)',
    co2Methodology:
      'GHG Protocol: distance × trips × approved vehicle factor × (1 − 1/verified occupancy). Occupancy must be evidenced by shared-journey record or passenger confirmation.',
    formula: 'Vehicle EF × Distance × Trips × (1 − 1 / Occupants)',
    evidence:
      'A dated photograph taken inside the vehicle showing all occupants present for the journey, ' +
      'together with a location-history record for each verified passenger covering the reported trips ' +
      '(Google Maps Timeline, Apple Significant Locations, or an equivalent trip log). ' +
      'A shared-journey QR code, carpooling application record, or GPS route may be submitted in support.',
    difficulty: 'Easy',
    timeCommitment: 'Daily commute',
    sdgGoals: [11, 13],
    icon: 'Car',
    gradient: 'from-sky-600 to-cyan-400',
    iconBg: 'bg-sky-700/40',
    color: 'text-indigo-600', bgColor: 'bg-indigo-50', badgeColor: 'bg-indigo-100 text-indigo-700',
    fields: [
      { key: 'vehicle_type', label: 'Vehicle used', type: 'select', options: VEHICLE_OPTIONS, default: 'car_petrol' },
      { key: 'distance_km', label: 'Journey distance (one-way)', type: 'number', unit: 'km', min: 0.1, placeholder: 'e.g. 20' },
      { key: 'num_trips', label: 'Eligible trips this month', type: 'number', unit: 'trips', min: 1, placeholder: 'e.g. 18' },
      { key: 'num_occupants', label: 'Total verified occupants (incl. driver)', type: 'number', unit: 'people', min: 2, placeholder: 'e.g. 3' },
    ],
  },

  // ─────────────────────────────────────────────── 3. Walk or Cycle
  {
    id: 'walk-cycle',
    apiId: 3,
    formulaType: 'walk_cycle',
    title: 'Walk or Cycle',
    officialTitle: 'Walk or Cycle Instead of a Motorised Trip',
    category: 'Mobility',
    description: 'Replace short motorised trips with walking or cycling.',
    longDescription:
      'Replacing a motorised trip with walking or cycling avoids the full operational emissions of the displaced vehicle. Only trips that genuinely replace a motorised journey are eligible; recreational walks and rides are not counted.',
    impact: 'Up to 0.127 kg CO₂e per km replaced',
    co2Savings: 'Distance × trips × displaced-mode EF',
    co2Factor: 0.127,
    co2FactorUnit: 'kg CO₂e per km (petrol car displaced)',
    co2Methodology:
      'WRI India: distance × trips × approved emission factor of the displaced motorised mode. Petrol hatchback <1000cc 0.127 kg CO₂/km; motorcycle <100cc 0.0358 kg CO₂/km.',
    formula: 'Displaced mode EF × Distance × Trips',
    evidence:
      'A location-history record covering the reported trips (Google Maps Timeline, Apple Significant Locations, ' +
      'or an equivalent trip log), or an activity record from a fitness application such as Google Fit, Apple Health, ' +
      'Strava or Fitbit. A dated GPS route screenshot showing the distance walked or cycled is also accepted.',
    difficulty: 'Easy',
    timeCommitment: 'Daily',
    sdgGoals: [3, 11, 13],
    icon: 'Bike',
    gradient: 'from-cyan-600 to-teal-400',
    iconBg: 'bg-cyan-700/40',
    color: 'text-cyan-600', bgColor: 'bg-cyan-50', badgeColor: 'bg-cyan-100 text-cyan-700',
    fields: [
      { key: 'displaced_mode', label: 'Motorised mode you replaced', type: 'select', options: VEHICLE_OPTIONS, default: 'two_wheeler' },
      { key: 'distance_km', label: 'Distance per trip', type: 'number', unit: 'km', min: 0.1, placeholder: 'e.g. 4' },
      { key: 'num_trips', label: 'Eligible replacement trips this month', type: 'number', unit: 'trips', min: 1, placeholder: 'e.g. 20' },
    ],
  },

  // ─────────────────────────────────────────────── 4. AC Optimisation
  {
    id: 'ac-optimisation',
    apiId: 4,
    formulaType: 'ac_optimise',
    title: 'Optimise Air-Conditioner Use',
    officialTitle: 'Optimise Air-Conditioner Temperature and Usage',
    category: 'Energy',
    description: 'Raise the AC set-point and cut runtime to reduce cooling electricity.',
    longDescription:
      'Every 1°C increase in AC set-point reduces cooling energy by roughly 6%. BEE India recommends 24°C as the default setting. Measured before/after electricity is strongly preferred; a conservative model is used as a fallback.',
    impact: 'Up to 26 kg CO₂e/month per AC unit',
    co2Savings: 'Electricity saved (kWh) × 0.710 kg CO₂e/kWh',
    co2Factor: 0.710,
    co2FactorUnit: 'kg CO₂e per kWh saved',
    co2Methodology:
      'BEE India + India CEA v21.0. Preferred: measured electricity before/after × grid factor. Fallback: 6% energy reduction per °C × AC capacity × operating hours × eligible days × 0.710.',
    formula: 'Measured: kWh saved × 0.710  |  Modelled: 0.06 × ΔT × Capacity(kW) × Hours × Days × 0.710',
    evidence:
      'Smart AC application history or AC-level electricity measurement is preferred. ' +
      'Alternatively, submit periodic in-app photographs showing the AC temperature setting, ' +
      'supported by an electricity bill where available.',
    difficulty: 'Easy',
    timeCommitment: 'Ongoing',
    sdgGoals: [7, 13],
    icon: 'Thermometer',
    gradient: 'from-orange-500 to-amber-400',
    iconBg: 'bg-orange-700/40',
    color: 'text-orange-600', bgColor: 'bg-orange-50', badgeColor: 'bg-orange-100 text-orange-700',
    fields: [
      { key: 'method', label: 'Reporting method', type: 'select', options: [
        { value: 'measured', label: 'Measured: I have smart meter / plug data (preferred)' },
        { value: 'modelled', label: 'Modelled: estimate from AC settings' },
      ], default: 'modelled' },
      { key: 'kwh_saved', label: 'Measured electricity saved', type: 'number', unit: 'kWh', min: 0.1, placeholder: 'e.g. 42', showIf: { key: 'method', equals: 'measured' } },
      { key: 'ac_capacity_kw', label: 'AC capacity', type: 'number', unit: 'kW', min: 0.1, placeholder: 'e.g. 1.5', showIf: { key: 'method', equals: 'modelled' } },
      { key: 'delta_setpoint', label: 'Set-point raised by', type: 'number', unit: '°C', min: 0.5, placeholder: 'e.g. 2', showIf: { key: 'method', equals: 'modelled' } },
      { key: 'daily_hours', label: 'Operating hours per day', type: 'number', unit: 'hrs', min: 0.5, placeholder: 'e.g. 6', showIf: { key: 'method', equals: 'modelled' } },
      { key: 'days', label: 'Eligible days this month', type: 'number', unit: 'days', min: 1, placeholder: 'e.g. 30', showIf: { key: 'method', equals: 'modelled' } },
    ],
  },

  // ─────────────────────────────────────────────── 5. LED Lighting
  {
    id: 'led-lighting',
    apiId: 5,
    formulaType: 'led_lighting',
    title: 'Replace Lighting with LED',
    officialTitle: 'Replace Inefficient Lighting with LED Lighting',
    category: 'Energy',
    description: 'Swap incandescent or CFL bulbs for energy-efficient LEDs.',
    longDescription:
      'LED bulbs use 75-80% less electricity than incandescent bulbs for the same light output. On the Indian grid (0.710 kg CO₂e/kWh), replacing a 60W incandescent with a 9W LED running 6 hours a day saves roughly 6.5 kg CO₂e per month.',
    impact: 'Up to 36 kg CO₂e/year per bulb',
    co2Savings: 'Lamps × wattage reduction × operating hours × 0.710',
    co2Factor: 0.710,
    co2FactorUnit: 'kg CO₂e per kWh saved',
    co2Methodology:
      'India CEA v21.0: lamp count × (old W − new W)/1000 × daily operating hours × 30 days × 0.710 kg CO₂e/kWh. Verify with old and new product labels.',
    formula: 'Lamps × (Old W − New W)/1000 × Hours/day × 30 days × 0.710',
    evidence: 'Old and new product labels, dated photographs, and purchase invoice.',
    difficulty: 'Easy',
    timeCommitment: 'One-time',
    sdgGoals: [7, 13],
    icon: 'Lightbulb',
    gradient: 'from-amber-500 to-yellow-300',
    iconBg: 'bg-amber-700/40',
    color: 'text-yellow-600', bgColor: 'bg-yellow-50', badgeColor: 'bg-yellow-100 text-yellow-700',
    fields: [
      { key: 'num_lamps', label: 'Number of lamps replaced', type: 'number', unit: 'lamps', min: 1, placeholder: 'e.g. 8' },
      { key: 'old_wattage', label: 'Old bulb wattage', type: 'number', unit: 'W', min: 1, placeholder: 'e.g. 60' },
      { key: 'new_wattage', label: 'New LED wattage', type: 'number', unit: 'W', min: 1, placeholder: 'e.g. 9' },
      { key: 'daily_hours', label: 'Average daily operating hours', type: 'number', unit: 'hrs', min: 0.5, placeholder: 'e.g. 6' },
    ],
  },

  // ─────────────────────────────────────────────── 6. BLDC Fans
  {
    id: 'bldc-fans',
    apiId: 6,
    formulaType: 'bldc_fans',
    title: 'Upgrade to BLDC Ceiling Fans',
    officialTitle: 'Upgrade to BEE-Rated BLDC Ceiling Fans',
    category: 'Energy',
    description: 'Replace conventional ceiling fans with BEE-rated BLDC models.',
    longDescription:
      'BLDC (brushless DC) ceiling fans draw roughly half the power of conventional induction fans, typically 28-35W versus 70-80W. Every verified 1 kWh saved corresponds to 0.710 kg CO₂ avoided under the current India grid factor.',
    impact: 'Up to 7.7 kg CO₂e/month per fan',
    co2Savings: 'Fans × wattage reduction × operating hours × 0.710',
    co2Factor: 0.710,
    co2FactorUnit: 'kg CO₂e per kWh saved',
    co2Methodology:
      'India CEA v21.0: fan count × (old W − new W)/1000 × hours/day × eligible days × 0.710. Use verified BEE/product label wattage, not star count.',
    formula: 'Fans × (Old W − New W)/1000 × Hours/day × Days × 0.710',
    evidence: 'BEE/product labels, model details, dated photographs, and invoice.',
    difficulty: 'Medium',
    timeCommitment: 'One-time',
    sdgGoals: [7, 13],
    icon: 'Fan',
    gradient: 'from-blue-500 to-indigo-400',
    iconBg: 'bg-blue-700/40',
    color: 'text-blue-500', bgColor: 'bg-blue-50', badgeColor: 'bg-blue-100 text-blue-700',
    fields: [
      { key: 'num_fans', label: 'Number of fans upgraded', type: 'number', unit: 'fans', min: 1, placeholder: 'e.g. 4' },
      { key: 'old_wattage', label: 'Old rated wattage', type: 'number', unit: 'W', min: 1, placeholder: 'e.g. 75' },
      { key: 'new_wattage', label: 'New BLDC rated wattage', type: 'number', unit: 'W', min: 1, placeholder: 'e.g. 30' },
      { key: 'daily_hours', label: 'Operating hours per day', type: 'number', unit: 'hrs', min: 0.5, placeholder: 'e.g. 8' },
      { key: 'days', label: 'Eligible days this month', type: 'number', unit: 'days', min: 1, placeholder: 'e.g. 30' },
    ],
  },

  // ─────────────────────────────────────────────── 7. Efficient Appliance
  {
    id: 'efficient-appliance',
    apiId: 7,
    formulaType: 'efficient_appliance',
    title: 'Upgrade to an Efficient Appliance',
    officialTitle: 'Upgrade to an Energy-Efficient Appliance',
    category: 'Energy',
    description:
      'Replace an old major appliance with a higher BEE-star-rated model. ' +
      'Excludes ceiling fans and LED lighting, which are covered under separate pledges.',
    note:
      'This pledge covers major appliances only, for example air conditioners, refrigerators, ' +
      'washing machines, dishwashers and water heaters. Ceiling fans and lighting are claimed under ' +
      'their own pledges and must not be reported here as well.',
    longDescription:
      'Upgrading to an appliance with lower labelled annual electricity use reduces grid consumption for the life of the product. The saving is allocated across the reporting period. This pledge applies to major appliances only: ceiling fans and LED lighting have dedicated pledges, and the same upgrade must never be credited twice.',
    impact: 'Up to 7.1 kg CO₂e/month per appliance',
    co2Savings: '(Old annual kWh − New annual kWh) ÷ 12 × months × 0.710',
    co2Factor: 0.710,
    co2FactorUnit: 'kg CO₂e per kWh reduced',
    co2Methodology:
      'India CEA v21.0: difference between old and new BEE-labelled annual kWh, allocated to the reporting period, × 0.710 kg CO₂e/kWh. Verify with BEE labels, model and serial numbers.',
    formula: '(Old annual kWh − New annual kWh) / 12 × Eligible months × 0.710',
    evidence: 'Old/new BEE labels, model and serial numbers, and purchase invoice.',
    difficulty: 'Medium',
    timeCommitment: 'One-time',
    sdgGoals: [7, 12, 13],
    icon: 'Refrigerator',
    gradient: 'from-amber-600 to-orange-400',
    iconBg: 'bg-amber-700/40',
    color: 'text-amber-600', bgColor: 'bg-amber-50', badgeColor: 'bg-amber-100 text-amber-700',
    fields: [
      { key: 'appliance_type', label: 'Appliance type', type: 'text', placeholder: 'e.g. Refrigerator' },
      { key: 'old_annual_kwh', label: 'Old labelled annual electricity use', type: 'number', unit: 'kWh/yr', min: 1, placeholder: 'e.g. 300' },
      { key: 'new_annual_kwh', label: 'New labelled annual electricity use', type: 'number', unit: 'kWh/yr', min: 1, placeholder: 'e.g. 180' },
      { key: 'eligible_months', label: 'Eligible months in service', type: 'number', unit: 'months', min: 1, placeholder: 'e.g. 6' },
    ],
  },

  // ─────────────────────────────────────────────── 8. Rooftop Solar
  {
    id: 'rooftop-solar',
    apiId: 8,
    formulaType: 'rooftop_solar',
    title: 'Rooftop Solar / Renewable Electricity',
    officialTitle: 'Use Rooftop Solar or Verified Renewable Electricity',
    category: 'Energy',
    description: 'Generate, consume, or procure verified renewable electricity.',
    longDescription:
      'Verified renewable electricity that is generated, self-consumed, or procured displaces grid electricity one-for-one. Each eligible verified kWh avoids 0.710 kg CO₂ under the current India grid factor. Only metered or certificate-backed kWh are eligible.',
    impact: 'Scales with verified renewable kWh',
    co2Savings: 'Verified renewable kWh × 0.710',
    co2Factor: 0.710,
    co2FactorUnit: 'kg CO₂e per renewable kWh',
    co2Methodology:
      'India CEA v21.0: eligible verified renewable kWh × 0.710 kg CO₂e/kWh. Evidence: inverter dashboard, generation meter, utility bill, or recognised certificate.',
    formula: 'Verified renewable kWh × 0.710',
    evidence: 'Inverter dashboard, generation meter, utility bill, or recognised certificate.',
    difficulty: 'Hard',
    timeCommitment: 'Ongoing',
    sdgGoals: [7, 13],
    icon: 'Sun',
    gradient: 'from-yellow-500 to-amber-300',
    iconBg: 'bg-yellow-600/40',
    color: 'text-yellow-500', bgColor: 'bg-yellow-50', badgeColor: 'bg-yellow-100 text-yellow-700',
    fields: [
      { key: 'source', label: 'Source', type: 'select', options: [
        { value: 'rooftop_generated', label: 'Rooftop solar (generated)' },
        { value: 'procured', label: 'Renewable electricity procured' },
        { value: 'certificate', label: 'Green tariff / certificate' },
      ], default: 'rooftop_generated' },
      { key: 'renewable_kwh', label: 'Verified renewable electricity this month', type: 'number', unit: 'kWh', min: 0.1, placeholder: 'e.g. 250' },
    ],
  },

  // ─────────────────────────────────────────────── 9. Plant-Based Meals
  {
    id: 'plant-based-meals',
    apiId: 9,
    formulaType: 'plant_based_meals',
    title: 'Replace Meat with Plant-Based Meals',
    officialTitle: 'Replace a High-Impact Meat Meal with a Plant-Based Meal',
    category: 'Food',
    description: 'Switch high-impact meat meals to plant-based alternatives.',
    longDescription:
      'Animal agriculture accounts for roughly 14.5% of global greenhouse-gas emissions. Category matters enormously: a beef meal emits about 7.26 kg CO₂e versus 1.73 kg for chicken and 0.50 kg for a plant-based meal.',
    impact: 'Up to 84 kg CO₂e/month',
    co2Savings: 'Meals × (meat category EF − plant EF)',
    co2Factor: 2.8,
    co2FactorUnit: 'kg CO₂e per meal switched (average)',
    co2Methodology:
      'Poore & Nemecek 2018 / IPCC AR6: meals × difference between approved category-specific meal emission factors. Beef 7.26, mutton 5.00, pork 2.90, chicken 1.73, plant-based 0.50 kg CO₂e/meal.',
    formula: 'Meals × (Meat category EF − 0.50)',
    evidence: 'Dated meal photographs, food bills, cafeteria records, or other reviewer-approved evidence.',
    difficulty: 'Medium',
    timeCommitment: 'Ongoing',
    sdgGoals: [2, 13, 15],
    icon: 'Salad',
    gradient: 'from-lime-600 to-green-400',
    iconBg: 'bg-lime-700/40',
    color: 'text-lime-700', bgColor: 'bg-lime-50', badgeColor: 'bg-lime-100 text-lime-800',
    fields: [
      { key: 'meat_category', label: 'Meat meal you replaced', type: 'select', options: [
        { value: 'beef', label: 'Beef' },
        { value: 'mutton', label: 'Mutton / Lamb' },
        { value: 'pork', label: 'Pork' },
        { value: 'chicken', label: 'Chicken' },
      ], default: 'chicken' },
      { key: 'num_meals', label: 'Eligible meals replaced this month', type: 'number', unit: 'meals', min: 1, placeholder: 'e.g. 20' },
    ],
  },

  // ─────────────────────────────────────────────── 10. Avoid Single-Use Plastic
  {
    id: 'avoid-plastic',
    apiId: 10,
    formulaType: 'avoid_plastic',
    title: 'Avoid Single-Use Plastic',
    officialTitle: 'Avoid Defined Single-Use Plastic Items',
    category: 'Materials',
    description: 'Replace defined single-use plastic items with reusable alternatives.',
    longDescription:
      'Single-use plastics carry significant embedded production emissions and are rarely recycled in India. Each avoided item is credited at its approved lifecycle factor, net of the amortised impact of the reusable replacement.',
    impact: 'Up to 15 kg CO₂e/month',
    co2Savings: 'Quantity × item-specific lifecycle factor',
    co2Factor: 0.161,
    co2FactorUnit: 'kg CO₂e per 500 ml PET bottle avoided',
    co2Methodology:
      'UK Environment Agency / GHG Protocol Product Standard: verified quantity × approved item-specific lifecycle factor, net of replacement impact. Bottle 0.161, cup 0.055, cutlery 0.040, bag 0.033, straw 0.010 kg CO₂e/item.',
    formula: 'Quantity avoided × Item lifecycle EF',
    evidence: 'Refill or purchase record, reusable-container QR, dated photographs, or retailer/partner record.',
    difficulty: 'Easy',
    timeCommitment: 'Daily',
    sdgGoals: [12, 14],
    icon: 'Package',
    gradient: 'from-teal-600 to-emerald-400',
    iconBg: 'bg-teal-700/40',
    color: 'text-teal-600', bgColor: 'bg-teal-50', badgeColor: 'bg-teal-100 text-teal-700',
    fields: [
      { key: 'item_type', label: 'Approved item type avoided', type: 'select', options: [
        { value: 'bottle', label: 'PET bottle (500 ml)' },
        { value: 'cup', label: 'Disposable cup' },
        { value: 'cutlery', label: 'Disposable cutlery set' },
        { value: 'bag', label: 'Single-use carry bag' },
        { value: 'straw', label: 'Plastic straw' },
      ], default: 'bottle' },
      { key: 'quantity', label: 'Number of items avoided this month', type: 'number', unit: 'items', min: 1, placeholder: 'e.g. 45' },
      { key: 'replacement_method', label: 'Replacement / reuse method', type: 'text', placeholder: 'e.g. Refilled steel bottle at office' },
    ],
  },

  // ─────────────────────────────────────────────── 11. Electric Two-Wheeler
  {
    id: 'electric-two-wheeler',
    apiId: 11,
    formulaType: 'electric_2w',
    title: 'Use an Electric Two-Wheeler',
    officialTitle: 'Use an Electric Two-Wheeler Instead of a Petrol Two-Wheeler',
    category: 'Mobility',
    description: 'Ride an electric two-wheeler in place of a petrol one.',
    longDescription:
      'Switching from a petrol two-wheeler to an electric one removes direct combustion emissions, offset by the grid emissions of the electricity used for charging. Net savings equal the petrol baseline for the eligible distance minus EV charging emissions.',
    impact: 'Up to 1.2 tonnes CO₂e/year',
    co2Savings: 'Petrol baseline emissions − EV charging emissions',
    co2Factor: 0.018,
    co2FactorUnit: 'net kg CO₂e per km (typical)',
    co2Methodology:
      'India CEA v21.0 + WRI India: approved baseline petrol emissions for the eligible distance − (EV charging kWh × 0.710). Petrol two-wheeler baseline 0.0358 kg CO₂/km.',
    formula: '(0.0358 × Distance) − (Charging kWh × 0.710)',
    evidence: 'Start/end odometer photographs, vehicle model or registration details, and charging-app, smart-charger or electricity record.',
    difficulty: 'Medium',
    timeCommitment: 'Daily',
    sdgGoals: [7, 11, 13],
    icon: 'Zap',
    gradient: 'from-green-600 to-emerald-400',
    iconBg: 'bg-green-700/40',
    color: 'text-green-600', bgColor: 'bg-green-50', badgeColor: 'bg-green-100 text-green-700',
    fields: [
      { key: 'vehicle_model', label: 'Baseline petrol two-wheeler model', type: 'text', placeholder: 'e.g. Honda Activa 110' },
      { key: 'distance_km', label: 'Eligible distance this month', type: 'number', unit: 'km', min: 1, placeholder: 'e.g. 400' },
      { key: 'charging_kwh', label: 'EV charging electricity used', type: 'number', unit: 'kWh', min: 0.1, placeholder: 'e.g. 10' },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

export const PLEDGE_ID_MAP: Record<string, number> = Object.fromEntries(
  PLEDGES.map(p => [p.id, p.apiId])
);

export function getPledge(id: string): Pledge | undefined {
  return PLEDGES.find(p => p.id === id);
}

/** Fields visible for the current form values (respects `showIf`). */
export function visibleFields(pledge: Pledge, values: Record<string, string | number>): PledgeField[] {
  return pledge.fields.filter(f => {
    if (!f.showIf) return true;
    const current = String(values[f.showIf.key] ?? pledge.fields.find(x => x.key === f.showIf!.key)?.default ?? '');
    return current === f.showIf.equals;
  });
}

/**
 * Build the exact payload the backend carbon engine expects.
 * Keys here MUST match backend/utils/carbonEngine.js.
 */
export function toApiInputs(pledgeId: string, v: Record<string, string | number>): Record<string, string | number> {
  const n = (k: string, fallback = 0) => Number(v[k] ?? fallback) || fallback;
  const s = (k: string, fallback = '') => String(v[k] ?? fallback);

  switch (pledgeId) {
    case 'public-transport':
      return { vehicle_type: s('vehicle_type', 'car_petrol'), transit_mode: s('transit_mode', 'metro'), distance_km: n('distance_km'), num_trips: n('num_trips') };
    case 'carpooling':
      return { vehicle_type: s('vehicle_type', 'car_petrol'), distance_km: n('distance_km'), num_trips: n('num_trips'), num_occupants: n('num_occupants', 2) };
    case 'walk-cycle':
      return { displaced_mode: s('displaced_mode', 'two_wheeler'), distance_km: n('distance_km'), num_trips: n('num_trips') };
    case 'ac-optimisation':
      return s('method', 'modelled') === 'measured'
        ? { method: 'measured', kwh_saved: n('kwh_saved') }
        : { method: 'modelled', ac_capacity_kw: n('ac_capacity_kw', 1.5), delta_setpoint: n('delta_setpoint'), daily_hours: n('daily_hours'), days: n('days', 30) };
    case 'led-lighting':
      return { num_lamps: n('num_lamps', 1), old_wattage: n('old_wattage'), new_wattage: n('new_wattage', 9), daily_hours: n('daily_hours') };
    case 'bldc-fans':
      return { num_fans: n('num_fans', 1), old_wattage: n('old_wattage'), new_wattage: n('new_wattage'), daily_hours: n('daily_hours'), days: n('days', 30) };
    case 'efficient-appliance':
      return { appliance_type: s('appliance_type'), old_annual_kwh: n('old_annual_kwh'), new_annual_kwh: n('new_annual_kwh'), eligible_months: n('eligible_months', 1) };
    case 'rooftop-solar':
      return { source: s('source', 'rooftop_generated'), renewable_kwh: n('renewable_kwh') };
    case 'plant-based-meals':
      return { meat_category: s('meat_category', 'chicken'), num_meals: n('num_meals') };
    case 'avoid-plastic':
      return { item_type: s('item_type', 'bottle'), quantity: n('quantity'), replacement_method: s('replacement_method') };
    case 'electric-two-wheeler': {
      const km = n('distance_km');
      const kwh = n('charging_kwh');
      return { vehicle_model: s('vehicle_model'), distance_km: km, ev_kwh_per_km: km > 0 ? kwh / km : 0.025 };
    }
    default:
      return v;
  }
}

/**
 * Client-side live preview. Mirrors backend/utils/carbonEngine.js exactly —
 * the backend value is always authoritative.
 */
export function calculateCO2(pledgeId: string, v: Record<string, string | number>): number {
  const EFm = EMISSION_FACTORS;
  const n = (k: string, fallback = 0) => Number(v[k] ?? fallback) || fallback;
  const s = (k: string, fallback = '') => String(v[k] ?? fallback);
  const vehEF = (k: string, d: string) => (EFm as Record<string, number>)[s(k, d)] ?? EFm.car_petrol;

  let result = 0;
  switch (pledgeId) {
    case 'public-transport': {
      const base = vehEF('vehicle_type', 'car_petrol');
      const transit = (EFm as Record<string, number>)[s('transit_mode', 'metro')] ?? EFm.bus;
      result = Math.max(0, (base - transit) * n('distance_km') * n('num_trips') * 2);
      break;
    }
    case 'carpooling': {
      const occ = Math.max(2, n('num_occupants', 2));
      result = vehEF('vehicle_type', 'car_petrol') * (1 - 1 / occ) * n('distance_km') * n('num_trips');
      break;
    }
    case 'walk-cycle':
      result = vehEF('displaced_mode', 'two_wheeler') * n('distance_km') * n('num_trips');
      break;
    case 'ac-optimisation':
      result = s('method', 'modelled') === 'measured'
        ? n('kwh_saved') * EFm.grid
        : 0.06 * n('delta_setpoint') * n('ac_capacity_kw', 1.5) * n('daily_hours') * n('days', 30) * EFm.grid;
      break;
    case 'led-lighting':
      result = n('num_lamps', 1) * (Math.max(0, n('old_wattage') - n('new_wattage', 9)) / 1000) * n('daily_hours') * 30 * EFm.grid;
      break;
    case 'bldc-fans':
      result = n('num_fans', 1) * (Math.max(0, n('old_wattage') - n('new_wattage')) / 1000) * n('daily_hours') * n('days', 30) * EFm.grid;
      break;
    case 'efficient-appliance':
      result = (Math.max(0, n('old_annual_kwh') - n('new_annual_kwh')) / 12) * n('eligible_months', 1) * EFm.grid;
      break;
    case 'rooftop-solar':
      result = n('renewable_kwh') * EFm.grid;
      break;
    case 'plant-based-meals':
      result = n('num_meals') * (((EFm as Record<string, number>)[s('meat_category', 'chicken')] ?? EFm.chicken) - EFm.plant);
      break;
    case 'avoid-plastic':
      result = n('quantity') * ((EFm as Record<string, number>)[s('item_type', 'bottle')] ?? EFm.bag);
      break;
    case 'electric-two-wheeler':
      result = Math.max(0, EFm.two_wheeler * n('distance_km') - n('charging_kwh') * EFm.grid);
      break;
    default:
      result = 0;
  }
  return Math.round(result * 1000) / 1000;
}

export default PLEDGES;
