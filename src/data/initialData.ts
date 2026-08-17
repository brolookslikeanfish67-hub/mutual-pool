import {
  User,
  Pod,
  Perk,
  AuditLogEntry,
  WeeklyCycle,
  Deposit,
  AdCampaign,
} from '../types';

// -----------------------------------------------------------------------------
// Enums – single source of truth for all statuses & categories
// -----------------------------------------------------------------------------

export enum PerkCategory {
  VehicleMaintenance = 'Vehicle Maintenance',
  Healthcare = 'Healthcare',
  InsuranceRoadside = 'Insurance & Roadside',
  GasFuel = 'Gas & Fuel Discounts',
  // Add more as needed
}

export enum PerkRedemptionType {
  Code = 'CODE',
  Link = 'LINK',
}

export enum PerkStatus {
  Approved = 'APPROVED',
  Pending = 'PENDING',
  Rejected = 'REJECTED',
}

export enum CampaignStatus {
  Recruiting = 'recruiting',
  Active = 'active',
  Completed = 'completed',
}

// -----------------------------------------------------------------------------
// Perk factory – avoids repetition and ensures consistent shape
// -----------------------------------------------------------------------------

function createPerk(
  id: string,
  title: string,
  category: PerkCategory,
  provider: string,
  description: string,
  valueBadge: string,
  redemptionType: PerkRedemptionType,
  redemptionData: string,
  eligibility: string,
  iconName: string,
  partnerEmail: string = '',
  status: PerkStatus = PerkStatus.Approved,
  submittedBy: string = '',
  submittedByUserId: string = '',
  redeemedCount: number = 0
): Perk {
  return {
    id,
    title,
    category,
    provider,
    description,
    valueBadge,
    redemptionType,
    redemptionData,
    eligibility,
    status,
    submittedBy,
    submittedByUserId,
    iconName,
    redeemedCount,
  };
}

// -----------------------------------------------------------------------------
// Initial Data
// -----------------------------------------------------------------------------

export const INITIAL_USERS: User[] = [];
export const INITIAL_PODS: Pod[] = [];
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];

// Perks – using the factory
export const INITIAL_PERKS: Perk[] = [
  createPerk(
    'perk_meineke_20',
    '20% Off Full Synthetic Oil Change & Brake Inspection',
    PerkCategory.VehicleMaintenance,
    'Meineke Car Care',
    'Exclusive 20% discount on all oil changes, tire rotations, and brake servicing for verified gig drivers.',
    '20% OFF',
    PerkRedemptionType.Code,
    'MEINEKE20GIG',
    'All active Mutual Pool members',
    'Car',
    'partnerships@meineke.com',
    PerkStatus.Approved,
    'Meineke Corporate',
    'partner_meineke',
    42
  ),
  createPerk(
    'perk_stride_health',
    'Free ACA Healthcare Enrollment & $0 Subsidy Finder',
    PerkCategory.Healthcare,
    'Stride Health',
    'Find health, dental, and vision insurance plans starting under $10/month with personalized subsidy calculation.',
    'FREE CONSULT',
    PerkRedemptionType.Link,
    'https://www.stridehealth.com/gigmutual',
    'All gig workers',
    'HeartPulse',
    'affiliates@stridehealth.com',
    PerkStatus.Approved,
    'Stride Health',
    'partner_stride',
    89
  ),
  createPerk(
    'perk_legal_shield',
    '25% Off Rideshare & Delivery Legal Defense Plan',
    PerkCategory.InsuranceRoadside,
    'LegalShield',
    'On-demand traffic ticket defense, accident consultation, and contract review tailored for gig fleet drivers.',
    '25% OFF',
    PerkRedemptionType.Code,
    'GIGLEGAL25',
    'All verified members',
    'ShieldCheck',
    'legal@partnerships.com',
    PerkStatus.Approved,
    'Imagine Legal',
    'partner_imagine',
    18
  ),
  createPerk(
    'perk_gasbuddy_fuel',
    '15¢/Gal Cashback on All Fuel Purchases',
    PerkCategory.GasFuel,
    'GasBuddy Business',
    'Save up to 15¢ per gallon at over 95% of gas stations nationwide with Pay with GasBuddy card.',
    '15¢/GAL OFF',
    PerkRedemptionType.Link,
    'https://pay.gasbuddy.com/gigmutual',
    'Active delivery riders',
    'Zap',
    'fleet@gasbuddy.com',
    PerkStatus.Approved,
    'GasBuddy Fleet',
    'partner_gasbuddy',
    124
  ),
];

// Campaigns – also use a factory for consistency
function createCampaign(
  id: string,
  title: string,
  brandName: string,
  brandColor: string,
  description: string,
  targetMetro: string,
  deliveryPlatforms: string[],
  dailyPayout: number,
  weeklyEstimatedEarnings: number,
  maxCouriersTarget: number,
  activeCouriersCount: number,
  durationWeeks: number,
  startDate: string,
  endDate: string,
  impressionsTarget: number,
  currentImpressions: number,
  gearRequired: string[],
  requirements: string[],
  status: CampaignStatus,
  brandLogo?: string,
  bannerUrl?: string,
): AdCampaign {
  return {
    id,
    title,
    brandName,
    brandLogo: brandLogo || '',
    brandColor,
    bannerUrl: bannerUrl || '',
    description,
    targetMetro,
    deliveryPlatforms,
    dailyPayout,
    weeklyEstimatedEarnings,
    maxCouriersTarget,
    activeCouriersCount,
    durationWeeks,
    startDate,
    endDate,
    impressionsTarget,
    currentImpressions,
    gearRequired,
    requirements,
    status,
    createdAt: new Date().toISOString().split('T')[0], // auto-set today, but can be overridden
  };
}

export const INITIAL_CAMPAIGNS: AdCampaign[] = [
  createCampaign(
    'camp_celsius_chicago_2026',
    'Celsius Live Fit — Chicago Metro Fleet Ambassador',
    'Celsius Energy',
    '#FF6B00',
    'Represent Celsius Live Fit on high-density delivery routes throughout downtown Chicago, River North, and the West Loop. Earn a guaranteed daily wage supplement for wearing the branded performance jersey and high-visibility backpack.',
    'Chicago, IL',
    ['DoorDash', 'UberEats', 'Grubhub'],
    65,
    390,
    40,
    28,
    8,
    '2026-08-01',
    '2026-09-26',
    350000,
    215000,
    ['Celsius Reflective Windbreaker', 'Thermal Delivery Backpack (40L)', 'Celsius Branded Cap'],
    ['Active courier on DoorDash, UberEats, or Grubhub', 'Minimum 4 delivery shifts per week', 'Wear gear during all delivery routes', 'Weekly GPS shift log confirmation'],
    CampaignStatus.Recruiting,
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80'
  ),
  createCampaign(
    'camp_liquiddeath_nyc_2026',
    'Liquid Death "Murder Your Thirst" NYC Fleet',
    'Liquid Death',
    '#1A1A1A',
    'High-impact street presence for Liquid Death mountain water across Manhattan and Brooklyn. Turn every delivery into daily supplemental earnings with bold custom apparel.',
    'New York, NY',
    ['DoorDash', 'UberEats', 'Relay', 'Grubhub'],
    75,
    450,
    60,
    52,
    12,
    '2026-08-10',
    '2026-11-02',
    600000,
    180000,
    ['Liquid Death Heavyweight Zip Hoodie', 'Custom Insulated Cargo Bag', 'Liquid Death Beanie'],
    ['Operating in Manhattan or Brooklyn delivery zones', 'Minimum 5 active shifts weekly', 'Check in via MutualPool app during shifts'],
    CampaignStatus.Recruiting,
    'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'
  ),
  createCampaign(
    'camp_meineke_national_2026',
    'Meineke Fleet Care — National Courier Vehicle Fleet',
    'Meineke Car Care',
    '#E11D48',
    'National brand ambassador program supporting vehicle maintenance and delivery safety. Earn daily stipend plus exclusive Meineke discounts on brakes and oil changes.',
    'National / All Metros',
    ['DoorDash', 'UberEats', 'Instacart', 'Grubhub'],
    55,
    330,
    100,
    64,
    6,
    '2026-07-15',
    '2026-08-26',
    400000,
    310000,
    ['Meineke High-Vis All-Weather Jacket', 'Insulated Grocery Trunk Organizer'],
    ['Any vehicle-based gig delivery courier', 'Maintain clean vehicle exterior with removable door magnet (optional)', 'Minimum 20 delivery hours/wk'],
    CampaignStatus.Recruiting,
    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80'
  ),
  createCampaign(
    'camp_sweetgreen_la_2026',
    'Sweetgreen Fresh Fuel — Los Angeles & Westside Fleet',
    'Sweetgreen',
    '#15803D',
    'Promote healthy fast-casual dining across Santa Monica, Venice, Downtown LA, and Culver City. Eco-friendly bike and scooter couriers prioritized.',
    'Los Angeles, CA',
    ['DoorDash', 'UberEats', 'Postmates'],
    70,
    420,
    35,
    22,
    10,
    '2026-08-05',
    '2026-10-14',
    280000,
    110000,
    ['Sweetgreen Sustainable Jersey', 'Thermal Bike Courier Backpack (35L)'],
    ['Delivery in Los Angeles metro area', 'Bike, e-bike, scooter, or EV preferred', 'Minimum 15 trips weekly'],
    CampaignStatus.Recruiting,
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80'
  ),
];

// -----------------------------------------------------------------------------
// Helper functions – makes consuming this data easier and safer
// -----------------------------------------------------------------------------

export const getPerksByCategory = (category: PerkCategory): Perk[] =>
  INITIAL_PERKS.filter((perk) => perk.category === category);

export const getActiveCampaigns = (): AdCampaign[] =>
  INITIAL_CAMPAIGNS.filter(
    (camp) => camp.status === CampaignStatus.Recruiting || camp.status === CampaignStatus.Active
  );

export const getCampaignByMetro = (metro: string): AdCampaign[] =>
  INITIAL_CAMPAIGNS.filter((camp) =>
    camp.targetMetro.toLowerCase().includes(metro.toLowerCase())
  );

/**
 * Validates that a perk has all required fields – useful for runtime checks.
 */
export const validatePerk = (perk: Perk): boolean => {
  return !!(
    perk.id &&
    perk.title &&
    perk.category &&
    perk.provider &&
    perk.description &&
    perk.redemptionType &&
    perk.redemptionData
  );
};

/**
 * Generates a new campaign ID – useful when adding campaigns dynamically.
 */
export const generateCampaignId = (brandName: string, metro: string): string => {
  const slug = brandName.toLowerCase().replace(/\s+/g, '_');
  const metroSlug = metro.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const year = new Date().getFullYear();
  return `camp_${slug}_${metroSlug}_${year}`;
};
