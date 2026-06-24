import type { VirtualOfficeListing } from "./virtualOfficeListings";

export interface BillingTier {
  key: "monthly" | "quarterly" | "yearly";
  label: string;
  multiplier: number;
}

export interface PlanComparisonRow {
  feature: string;
  basic: boolean;
  business: boolean;
  premium: boolean;
}

export interface DocumentRequirement {
  name: string;
  description: string;
}

export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
}

export interface NearbyPlace {
  category: string;
  name: string;
  distanceKm: number;
}

export interface ReviewItem {
  name: string;
  date: string;
  rating: number;
  comment: string;
}

export interface FaqItem {
  category: string;
  question: string;
  answer: string;
}

export interface TrustScoreItem {
  label: string;
  achieved: boolean;
}

export interface VirtualOfficeDetails {
  rating: number;
  reviewCount: number;
  heroImage: string;
  trustScore: number;
  trustScoreItems: TrustScoreItem[];
  whyThisOffice: string[];
  planComparison: PlanComparisonRow[];
  documentRequirements: DocumentRequirement[];
  approvalWindow: string;
  howItWorks: HowItWorksStep[];
  nearbyPlaces: NearbyPlace[];
  facilities: string[];
  ratingBreakdown: { star: number; percent: number }[];
  reviews: ReviewItem[];
  aiReviewSummary: string[];
  faqs: FaqItem[];
}

export const billingTiers: BillingTier[] = [
  { key: "monthly", label: "Monthly", multiplier: 1 },
  { key: "quarterly", label: "Quarterly", multiplier: 2.7 },
  { key: "yearly", label: "Yearly", multiplier: 10 },
];

function hashSeed(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 100000;
  }
  return hash + 1;
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const reviewerNames = ["Priyanka Ingawale", "Tanmaya Pradhan", "Arjun Mehta", "Sneha Kulkarni", "Rohit Sharma", "Ayesha Khan"];
const reviewMonths = ["Jan-2026", "Dec-2025", "Nov-2025", "Oct-2025", "Sep-2025", "Aug-2025"];
const reviewComments = [
  "GST registration was approved within 2 days, very smooth process.",
  "Professional business address, helped us close deals faster.",
  "Support team responded quickly whenever we had questions.",
  "Mail handling has been reliable every single month.",
  "Documentation process was simple and well explained.",
  "Great value for a startup just getting started.",
];

const facilityPool = [
  "Reception",
  "Meeting Rooms",
  "Coworking Access",
  "Business Lounge",
  "Printing",
  "Internet",
  "Conference Rooms",
  "Visitor Management",
  "Parking",
  "Security",
];

const documentPool: DocumentRequirement[] = [
  { name: "PAN Card", description: "Valid PAN card of the business owner or authorized signatory." },
  { name: "Aadhaar Card", description: "Aadhaar card for identity verification." },
  { name: "Passport Photo", description: "Recent passport-size photograph of the applicant." },
  { name: "Business Proof", description: "Certificate of incorporation or business registration proof." },
  { name: "Company Documents", description: "MOA, AOA or partnership deed, as applicable." },
  { name: "GST Documents", description: "Existing GST certificate, if you have one, for address transfer." },
];

const howItWorksSteps: HowItWorksStep[] = [
  { step: 1, title: "Choose Plan", description: "Pick the virtual office plan that fits your business needs." },
  { step: 2, title: "Upload Documents", description: "Submit your PAN, Aadhaar and business documents online." },
  { step: 3, title: "Verification", description: "Our team verifies your documents and business details." },
  { step: 4, title: "Approval", description: "Get approved and receive your agreement for signature." },
  { step: 5, title: "Get Business Address", description: "Receive your registered business address and NOC." },
  { step: 6, title: "Start Using", description: "Start using your address for GST, mail and business correspondence." },
];

const faqPool: FaqItem[] = [
  { category: "GST Registration", question: "Can I use this address for GST registration?", answer: "Yes, this address is GST-eligible and comes with the required NOC and supporting documents." },
  { category: "Address Proof", question: "What documents are provided as address proof?", answer: "You'll receive a signed rental agreement, NOC and utility bill copy for your records." },
  { category: "Mail Handling", question: "How is my mail and courier handled?", answer: "All mail and couriers are received at the address and forwarded or scanned to you based on your plan." },
  { category: "Renewal", question: "How does plan renewal work?", answer: "Plans auto-renew at the end of the billing cycle; you'll be notified 7 days in advance." },
  { category: "Refund", question: "What is the refund policy?", answer: "Refunds are available within 7 days of purchase if your application hasn't been processed yet." },
  { category: "Compliance", question: "Is this address compliant with MCA and GST norms?", answer: "Yes, all our virtual office addresses meet MCA and GST department compliance requirements." },
];

export function getVirtualOfficeDetails(listing: VirtualOfficeListing): VirtualOfficeDetails {
  const seed = hashSeed(listing.id);
  const r1 = seededRandom(seed * 1.7);
  const r2 = seededRandom(seed * 2.9);
  const r3 = seededRandom(seed * 4.1);

  const rating = Math.round((4 + r1 * 0.9) * 10) / 10;
  const reviewCount = Math.round(20 + r2 * 250);

  const trustScoreItems: TrustScoreItem[] = [
    { label: "GST Registration Eligible", achieved: listing.gstEligible },
    { label: "Business Address Verified", achieved: listing.businessAddressAvailable },
    { label: "Mail Handling Available", achieved: listing.servicesIncluded.includes("Mail Handling") },
    { label: "Compliance Ready", achieved: listing.gstEligible || listing.servicesIncluded.includes("Company Registration") },
    { label: "Documentation Support", achieved: true },
  ];
  const achievedCount = trustScoreItems.filter((item) => item.achieved).length;
  const trustScore = Math.min(99, 70 + achievedCount * 6 + Math.round(r3 * 3));

  const whyThisOffice = [
    "GST Registration Address",
    "Business Address",
    listing.servicesIncluded.includes("Mail Handling") ? "Mail Handling" : "Courier Handling",
    "Company Registration Support",
    "Dedicated Support",
    listing.servicesIncluded.includes("Meeting Room Credits") ? "Meeting Room Access" : "Coworking Access",
    "Reception Services",
    "Business Correspondence",
    "Government Compliance Ready",
  ];

  const planComparison: PlanComparisonRow[] = [
    { feature: "GST Registration", basic: true, business: true, premium: true },
    { feature: "Business Address", basic: true, business: true, premium: true },
    { feature: "Mail Handling", basic: false, business: true, premium: true },
    { feature: "Courier Handling", basic: false, business: true, premium: true },
    { feature: "Meeting Room Credits", basic: false, business: false, premium: true },
    { feature: "Coworking Access", basic: false, business: false, premium: true },
    { feature: "Dedicated Support", basic: false, business: true, premium: true },
  ];

  const reviews: ReviewItem[] = Array.from({ length: 5 }, (_, index) => {
    const ra = seededRandom(seed + index * 11.7);
    const rb = seededRandom(seed + index * 5.3);
    return {
      name: reviewerNames[Math.floor(ra * reviewerNames.length) % reviewerNames.length],
      date: reviewMonths[index % reviewMonths.length],
      rating: rb > 0.75 ? 4 : 5,
      comment: reviewComments[Math.floor(ra * reviewComments.length) % reviewComments.length],
    };
  });

  const fiveStarBase = Math.round(50 + (rating - 3.6) * 25);
  const fiveStar = Math.min(92, Math.max(40, fiveStarBase || 60));
  const remaining = 100 - fiveStar;
  const fourStar = Math.round(remaining * 0.55);
  const threeStar = Math.round(remaining * 0.22);
  const twoStar = Math.round(remaining * 0.13);
  const oneStar = Math.max(0, 100 - fiveStar - fourStar - threeStar - twoStar);

  return {
    rating,
    reviewCount,
    heroImage: listing.images[0],
    trustScore,
    trustScoreItems,
    whyThisOffice,
    planComparison,
    documentRequirements: documentPool,
    approvalWindow: "Approval within 24-48 hours",
    howItWorks: howItWorksSteps,
    nearbyPlaces: [
      { category: "Landmark", name: `${listing.area} Landmark Tower`, distanceKm: Math.round((0.2 + r1 * 1.5) * 10) / 10 },
      { category: "Metro Station", name: `${listing.area} Metro Station`, distanceKm: Math.round((0.4 + r2 * 2.2) * 10) / 10 },
      { category: "Railway Station", name: `${listing.area} Railway Station`, distanceKm: Math.round((1 + r3 * 5) * 10) / 10 },
      { category: "Airport", name: `${listing.city.charAt(0).toUpperCase()}${listing.city.slice(1)} Airport`, distanceKm: Math.round((4 + r1 * 18) * 10) / 10 },
      { category: "Banks", name: `${listing.area} Banking Cluster`, distanceKm: Math.round((0.2 + r2 * 1.2) * 10) / 10 },
      { category: "Government Offices", name: `${listing.area} Govt. Office Complex`, distanceKm: Math.round((0.5 + r3 * 3) * 10) / 10 },
      { category: "Coworking Spaces", name: `${listing.area} Coworking Hub`, distanceKm: Math.round((0.3 + r1 * 1.8) * 10) / 10 },
    ],
    facilities: facilityPool,
    ratingBreakdown: [
      { star: 5, percent: fiveStar },
      { star: 4, percent: fourStar },
      { star: 3, percent: threeStar },
      { star: 2, percent: twoStar },
      { star: 1, percent: oneStar },
    ],
    reviews,
    aiReviewSummary: ["Fast Approval", "Easy GST Registration", "Professional Address", "Helpful Support Team", "Excellent Service"],
    faqs: faqPool,
  };
}
