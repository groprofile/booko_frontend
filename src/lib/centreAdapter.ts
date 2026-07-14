import type { DayPassListing } from '../data/dayPassListings';
import type { DayPassDetails, SeatingOptionDetail } from '../data/dayPassDetails';
import type { HotelListing } from '../data/hotelListings';
import type { HotelDetails, RoomOption } from '../data/hotelDetails';
import type { MeetingRoomListing, HourlyPrice } from '../data/meetingRoomListings';
import type { MeetingRoomDetails, SiblingRoom } from '../data/meetingRoomDetails';
import type { MonthlyPassListing } from '../data/monthlyPassListings';
import type { MonthlyPassDetails, MembershipType, SeatingOption as MonthlySeatingOption } from '../data/monthlyPassDetails';
import type { VirtualOfficeListing } from '../data/virtualOfficeListings';
import type { VirtualOfficeDetails } from '../data/virtualOfficeDetails';
import type { CoworkingSpace, ServiceKey, ServiceLink } from '../data/coworkingSpaces';

export interface CentreApiRow {
  id: string;
  center_name: string;
  city: string;
  locality: string | null;
  address: string | null;
  description: string | null;
  rating: number | null;
  opening_time: string | null;
  closing_time: string | null;
  latitude: number | null;
  longitude: number | null;
  center_photos: Array<{ image_url: string; is_cover: boolean; sort_order: number }>;
  center_amenities: Array<{ amenity_key: string; amenity_label: string }>;
  center_membership_plans: Array<{
    id: string;
    name: string;
    price: number;
    product_type: string;
    plan_type: string;
    unit: string | null;
    is_active: boolean;
    description?: string | null;
  }>;
  categories: { id: string; name: string; slug: string } | null;
  distance_km: number | null;
  min_price: number | null;
}

const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=560&h=380&fit=crop&q=80&auto=format';

function cityToSlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, '-');
}

function getImages(c: CentreApiRow): string[] {
  const photos = c.center_photos ?? [];
  const sorted = [...photos].sort((a, b) =>
    a.is_cover ? -1 : b.is_cover ? 1 : a.sort_order - b.sort_order,
  );
  const urls = sorted.map((p) => p.image_url).filter(Boolean);
  return urls.length > 0 ? urls : [PLACEHOLDER_IMG];
}

function getMinPrice(c: CentreApiRow, productType: string): number {
  const plans = (c.center_membership_plans ?? []).filter(
    (p) => p.is_active && p.product_type === productType,
  );
  if (plans.length > 0) return Math.min(...plans.map((p) => p.price));
  return c.min_price ?? 0;
}

function getAmenityLabels(c: CentreApiRow): string[] {
  return (c.center_amenities ?? []).map((a) => a.amenity_label);
}

function getTransitAmenities(c: CentreApiRow): string[] {
  return getAmenityLabels(c).filter((l) => {
    const lower = l.toLowerCase();
    return lower.includes('metro') || lower.includes('bus') || lower.includes('station') || lower.includes('train');
  });
}

export function apiToDayPassListing(c: CentreApiRow): DayPassListing {
  const plans = (c.center_membership_plans ?? []).filter(
    (p) => p.product_type === 'day-pass' && p.is_active,
  );
  const seatingTypes = [...new Set(plans.map((p) => p.name || 'Hot Desk'))];
  const price = getMinPrice(c, 'day-pass');
  const openTime = c.opening_time ? c.opening_time.slice(0, 5) : '09:00';
  const closeTime = c.closing_time ? c.closing_time.slice(0, 5) : '21:00';

  return {
    id: c.id,
    city: cityToSlug(c.city),
    brand: c.center_name,
    name: c.center_name,
    spaceType: 'Coworking Space',
    locality: c.locality ?? c.address ?? '',
    distanceKm: Math.round((c.distance_km ?? 0) * 10) / 10,
    openTime,
    closeTime,
    opensEarly: openTime < '08:00',
    closesLate: closeTime > '22:00',
    openNow: false,
    seatingTypes: seatingTypes.length > 0 ? seatingTypes : ['Hot Desk'],
    accessibility: getTransitAmenities(c),
    price,
    bestPrice: price,
    offerCode: 'BOKKO10',
    offerCount: Math.max(plans.length, 1),
    rating: c.rating ?? 4.0,
    reviews: 0,
    popular: (c.rating ?? 0) >= 4.5,
    premier: (c.rating ?? 0) >= 4.8,
    images: getImages(c),
  };
}

export function apiToHotelListing(c: CentreApiRow): HotelListing {
  const plans = (c.center_membership_plans ?? []).filter(
    (p) => p.product_type === 'hotel' && p.is_active,
  );
  const pricing = plans.map((p) => {
    const unitKey = p.unit === '3h' ? '3' : p.unit === '6h' ? '6' : p.unit === '12h' ? '12' : 'full-day';
    return { key: unitKey as '3' | '6' | '12' | 'full-day', label: p.name, price: p.price, available: true };
  });
  const bestPrice = getMinPrice(c, 'hotel');

  return {
    id: c.id,
    city: cityToSlug(c.city),
    chain: c.center_name,
    name: c.center_name,
    locality: c.locality ?? '',
    distanceKm: Math.round((c.distance_km ?? 0) * 10) / 10,
    stayTypes: ['Hourly Stay'],
    category: c.categories?.name ?? 'Business',
    badges: [],
    rating: c.rating ?? 4.0,
    reviews: 0,
    amenities: getAmenityLabels(c),
    trustSignals: [],
    popularTags: [],
    pricing: pricing.length > 0
      ? pricing
      : [{ key: 'full-day', label: 'Full Day', price: bestPrice, available: true }],
    bestPrice,
    offerCode: 'BOKKO10',
    popular: (c.rating ?? 0) >= 4.5,
    images: getImages(c),
  };
}

export function apiToMeetingRoomListing(c: CentreApiRow): MeetingRoomListing {
  const plans = (c.center_membership_plans ?? []).filter(
    (p) => p.product_type === 'meeting-room' && p.is_active,
  );
  const pricing: HourlyPrice[] = plans.map((p) => ({
    hours: Number(p.unit?.replace('h', '') ?? 1),
    label: p.name,
    price: p.price,
  }));
  const bestPrice = getMinPrice(c, 'meeting-room');
  const amenities = getAmenityLabels(c);

  return {
    id: c.id,
    city: cityToSlug(c.city),
    brand: c.center_name,
    workspaceName: c.center_name,
    name: c.center_name,
    roomType: 'Meeting Room',
    seatingCapacity: '2-10',
    capacity: 10,
    locality: c.locality ?? '',
    distanceKm: Math.round((c.distance_km ?? 0) * 10) / 10,
    equipment: amenities.filter((a) => {
      const l = a.toLowerCase();
      return l.includes('projector') || l.includes('screen') || l.includes('whiteboard') || l.includes('tv') || l.includes('video');
    }),
    roomTags: [],
    amenities,
    bookingOptions: ['Hourly'],
    pricing: pricing.length > 0
      ? pricing
      : [{ hours: 1, label: '1 Hour', price: bestPrice }],
    bestPrice,
    offerCode: 'BOKKO10',
    offerCount: Math.max(plans.length, 1),
    popular: (c.rating ?? 0) >= 4.5,
    premier: (c.rating ?? 0) >= 4.8,
    images: getImages(c),
  };
}

export function apiToMonthlyPassListing(c: CentreApiRow): MonthlyPassListing {
  const plans = (c.center_membership_plans ?? []).filter(
    (p) => p.product_type === 'monthly-pass' && p.is_active,
  );
  const seatingTypes = [...new Set(plans.map((p) => p.name || 'Hot Desk'))];
  const price = getMinPrice(c, 'monthly-pass');

  return {
    id: c.id,
    city: cityToSlug(c.city),
    brand: c.center_name,
    name: c.center_name,
    spaceType: 'Coworking Space',
    locality: c.locality ?? '',
    distanceKm: Math.round((c.distance_km ?? 0) * 10) / 10,
    seatingTypes: seatingTypes.length > 0 ? seatingTypes : ['Hot Desk'],
    accessibility: getTransitAmenities(c),
    lockIn: '1 Month',
    price,
    bestPrice: price,
    offerCode: 'BOKKO10',
    offerCount: Math.max(plans.length, 1),
    rating: c.rating ?? 4.0,
    reviews: 0,
    popular: (c.rating ?? 0) >= 4.5,
    premier: (c.rating ?? 0) >= 4.8,
    images: getImages(c),
  };
}

export function apiToVirtualOfficeListing(c: CentreApiRow): VirtualOfficeListing {
  const plans = (c.center_membership_plans ?? []).filter(
    (p) => p.product_type === 'virtual-office' && p.is_active,
  );
  const voPlan = plans.map((p) => ({
    key: p.id,
    planId: p.id,
    name: p.name,
    price: p.price,
    description: p.plan_type ?? '',
  }));
  const bestPrice = getMinPrice(c, 'virtual-office');

  return {
    id: c.id,
    city: cityToSlug(c.city),
    brand: c.center_name,
    centerName: c.center_name,
    area: c.locality ?? '',
    buildingType: c.categories?.name ?? 'Business Center',
    address: c.address ?? '',
    rating: c.rating ?? 4.0,
    reviews: 0,
    popularTags: [],
    servicesIncluded: getAmenityLabels(c),
    durations: plans.map((p) => p.unit ?? 'Monthly').filter(Boolean),
    metroConnectivity: getTransitAmenities(c).some((a) => a.toLowerCase().includes('metro')),
    businessAddressAvailable: true,
    gstEligible: true,
    premier: (c.rating ?? 0) >= 4.8,
    popular: (c.rating ?? 0) >= 4.5,
    plans: voPlan.length > 0
      ? voPlan
      : [{ key: 'basic', name: 'Basic Plan', price: bestPrice, description: 'Virtual Office' }],
    bestPrice,
    images: getImages(c),
  };
}

const PRODUCT_TYPE_TO_SK: Record<string, ServiceKey> = {
  'day-pass': 'dayPass',
  'meeting-room': 'meetingRoom',
  'monthly-pass': 'monthlyPass',
  'virtual-office': 'virtualOffice',
};

const SK_LABEL: Record<ServiceKey, string> = {
  dayPass: 'Day Pass',
  meetingRoom: 'Meeting Rooms',
  monthlyPass: 'Monthly Pass',
  virtualOffice: 'Virtual Office',
  privateCabin: 'Private Cabin',
  managedOffice: 'Managed Office',
  trainingRoom: 'Training Room',
  boardRoom: 'Board Room',
};

const PT_SLUG: Record<string, string> = {
  'day-pass': 'day-pass',
  'meeting-room': 'meeting-rooms',
  'monthly-pass': 'monthly-pass',
  'virtual-office': 'virtual-office',
};

export function apiToCoworkingSpace(c: CentreApiRow): CoworkingSpace {
  const citySlug = cityToSlug(c.city);
  const locality = c.locality ?? c.address ?? '';
  const amenities = getAmenityLabels(c);
  const transitAmenities = getTransitAmenities(c);
  const activePlans = (c.center_membership_plans ?? []).filter((p) => p.is_active);

  const productTypes = [...new Set(activePlans.map((p) => p.product_type))];
  const serviceKeys: ServiceKey[] = productTypes
    .map((pt) => PRODUCT_TYPE_TO_SK[pt])
    .filter((sk): sk is ServiceKey => Boolean(sk));

  const services: ServiceLink[] = productTypes
    .filter((pt) => PRODUCT_TYPE_TO_SK[pt])
    .map((pt) => {
      const sk = PRODUCT_TYPE_TO_SK[pt];
      const typePlans = activePlans.filter((p) => p.product_type === pt);
      const minPrice = typePlans.length > 0 ? Math.min(...typePlans.map((p) => p.price)) : (c.min_price ?? 0);
      const label = SK_LABEL[sk];
      const unit = pt === 'meeting-room' ? '/hr' : '';
      return {
        key: sk,
        label,
        priceLabel: `${label} from ₹${minPrice}${unit}`,
        href: `/${citySlug}/${PT_SLUG[pt]}/${c.id}`,
      } as ServiceLink;
    });

  const allPrices = activePlans.map((p) => p.price).filter((p) => p != null);
  const startingPrice = allPrices.length > 0 ? Math.min(...allPrices) : (c.min_price ?? 0);
  const rating = c.rating ?? 4.0;

  return {
    id: c.id,
    city: citySlug,
    brand: c.center_name,
    locationLabel: `${c.city} - ${locality}`,
    name: c.center_name,
    locality,
    distanceKm: Math.round((c.distance_km ?? 0) * 10) / 10,
    rating,
    reviews: 0,
    startingPrice,
    image: getImages(c)[0],
    premium: rating >= 4.8,
    popular: rating >= 4.5,
    metroConnectivity: transitAmenities.some((a) => a.toLowerCase().includes('metro')),
    parking: amenities.some((a) => a.toLowerCase().includes('parking')),
    access247: serviceKeys.includes('monthlyPass'),
    instantBooking: serviceKeys.includes('dayPass') || serviceKeys.includes('meetingRoom'),
    corporateFriendly: serviceKeys.includes('meetingRoom') || serviceKeys.includes('virtualOffice'),
    gstCompliant: serviceKeys.includes('virtualOffice'),
    services,
    serviceKeys,
    matchScoreItems: [],
    matchScore: Math.round(50 + rating * 10),
  };
}

// ─── Detail builders ────────────────────────────────────────────────────────

export function apiToDayPassDetails(c: CentreApiRow): DayPassDetails {
  const images = getImages(c);
  const amenities = getAmenityLabels(c);
  const plans = (c.center_membership_plans ?? []).filter(
    (p) => p.product_type === 'day-pass' && p.is_active,
  );
  const hasParking = amenities.some((a) => a.toLowerCase().includes('parking'));
  const hasFood = amenities.some((a) => a.toLowerCase().includes('cafe') || a.toLowerCase().includes('food'));

  const seatingOptions: SeatingOptionDetail[] = plans.map((p) => ({
    planId: p.id,
    type: p.name,
    description: p.description ?? `${p.name} workspace with all amenities included.`,
    features: amenities.slice(0, 4),
    availability: 'Available',
    price: p.price,
    bestPrice: Math.round(p.price * 0.9),
    offerCode: 'BOKKO10',
    image: images[0],
  }));

  return {
    galleryImages: images,
    description: c.description ?? `${c.center_name} offers premium day pass access in ${c.locality ?? c.city}.`,
    rules: [
      'Valid government ID required at entry',
      'No outside food allowed in the workspace',
      'Maintain silence in focus zones',
      'Booking is non-transferable',
    ],
    internetSpeed: '100 Mbps',
    parkingDetails: hasParking ? 'Free parking available for day pass holders' : 'Street parking nearby',
    foodBeverage: hasFood ? 'In-house café with beverages and snacks' : 'Vending machines available',
    address: c.address ?? `${c.locality ?? ''}, ${c.city}`,
    metroStation: 'Nearest Metro',
    metroDistanceKm: 0.5,
    railwayStation: 'Nearest Railway Station',
    railwayDistanceKm: 2.0,
    landmarks: [c.locality ?? c.city],
    travelTimeMin: 10,
    amenities,
    seatingOptions: seatingOptions.length > 0 ? seatingOptions : [{
      type: 'Hot Desk',
      description: 'Flexible open seating with all amenities.',
      features: amenities.slice(0, 4),
      availability: 'Available',
      price: c.min_price ?? 500,
      bestPrice: Math.round((c.min_price ?? 500) * 0.9),
      offerCode: 'BOKKO10',
      image: images[0],
    }],
    ratingBreakdown: [
      { star: 5, percent: 65 },
      { star: 4, percent: 20 },
      { star: 3, percent: 10 },
      { star: 2, percent: 3 },
      { star: 1, percent: 2 },
    ],
    reviews: [],
  };
}

export function apiToHotelDetails(c: CentreApiRow): HotelDetails {
  const images = getImages(c);
  const amenities = getAmenityLabels(c);
  const plans = (c.center_membership_plans ?? []).filter(
    (p) => p.product_type === 'hotel-room' && p.is_active,
  );

  const rooms: RoomOption[] = plans.map((p, i) => ({
    id: p.id,
    name: p.name,
    images: images.slice(0, 3).length > 0 ? images.slice(0, 3) : images,
    sizeSqft: 250 + i * 50,
    occupancy: 2,
    bedType: p.name.toLowerCase().includes('twin') ? 'Twin' : p.name.toLowerCase().includes('suite') ? 'King' : 'Double',
    amenities: amenities.slice(0, 6),
    description: p.description ?? `Comfortable ${p.name} with modern amenities.`,
    pricing: [{ key: 'night', label: '1 Night', price: p.price, available: true }],
    breakfastIncluded: amenities.some((a) => a.toLowerCase().includes('breakfast')),
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
  }));

  const amenityCategories = [
    { category: 'General', items: amenities.filter((_, i) => i < 6) },
    { category: 'Business', items: amenities.filter((a) => /meeting|work|wifi/i.test(a)) },
  ].filter((cat) => cat.items.length > 0);

  return {
    galleryImages: images,
    propertyType: 'Business Hotel',
    distanceAirportKm: 18,
    distanceMetroKm: 0.8,
    distanceRailwayKm: 3.5,
    description: c.description ?? `${c.center_name} is a premium property in ${c.locality ?? c.city}, ideal for business and leisure travelers.`,
    aboutLocation: `Situated in ${c.locality ?? c.city}, ${c.city}, close to key business districts.`,
    whyStayHere: `Experience premium hospitality at ${c.center_name} with top-class amenities and a strategic location.`,
    aiHighlights: [
      `Prime location in ${c.locality ?? c.city}`,
      'High-speed WiFi throughout',
      'Professional workspace available',
    ],
    whyBookCards: ['Best Rate Guarantee', 'Free Cancellation Available', 'Instant Confirmation'],
    rooms: rooms.length > 0 ? rooms : [{
      id: c.id + '-room',
      name: 'Standard Room',
      images,
      sizeSqft: 250,
      occupancy: 2,
      bedType: 'Double',
      amenities: amenities.slice(0, 6),
      description: 'Comfortable standard room with all essential amenities.',
      pricing: [{ key: 'night', label: '1 Night', price: c.min_price ?? 2000, available: true }],
      breakfastIncluded: false,
      cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
    }],
    mealOptions: [
      { key: 'no-meal', label: 'No Meal', priceDelta: 0 },
      { key: 'breakfast', label: 'Breakfast', priceDelta: 350 },
      { key: 'breakfast-dinner', label: 'Breakfast + Dinner', priceDelta: 700 },
    ],
    amenityCategories: amenityCategories.length > 0 ? amenityCategories : [{ category: 'General', items: amenities }],
    nearbyPlaces: [],
    rules: {
      checkIn: c.opening_time?.slice(0, 5) ?? '14:00',
      checkOut: c.closing_time?.slice(0, 5) ?? '11:00',
      couplePolicy: 'Couples welcome with valid ID proof',
      localIdPolicy: 'Local ID accepted',
      childPolicy: 'Children below 12 stay free',
      smokingPolicy: 'No smoking inside rooms',
      petPolicy: 'Pets not allowed',
      cancellationPolicy: 'Free cancellation up to 24 hours',
      refundPolicy: 'Refund within 5-7 business days',
    },
    ratingBreakdown: [
      { star: 5, percent: 60 },
      { star: 4, percent: 25 },
      { star: 3, percent: 10 },
      { star: 2, percent: 3 },
      { star: 1, percent: 2 },
    ],
    reviews: [],
    aiReviewSummary: [
      `Great location in ${c.locality ?? c.city}`,
      'Clean and comfortable rooms',
      'Professional staff',
    ],
    coupons: [{ code: 'BOKKO10', description: '10% off on your first booking', discountPercent: 10 }],
  };
}

export function apiToMeetingRoomDetails(c: CentreApiRow): MeetingRoomDetails {
  const images = getImages(c);
  const amenities = getAmenityLabels(c);
  const plans = (c.center_membership_plans ?? []).filter(
    (p) => p.product_type === 'meeting-room' && p.is_active,
  );
  const rating = c.rating ?? 4.5;
  const hasParking = amenities.some((a) => a.toLowerCase().includes('parking'));

  const siblingRoomTypes: SiblingRoom[] = plans.map((p) => ({
    id: p.id,
    roomType: p.name,
    seatingCapacity: p.unit ?? 'Up to 10',
    capacity: 10,
    pricing: [{ key: p.plan_type || 'hourly', label: 'Per Hour', price: p.price }],
  }));

  const durationPricing = plans.length > 0
    ? plans.map((p) => ({ key: p.plan_type || 'hourly', label: p.name, price: p.price }))
    : [
        { key: '1hr', label: '1 Hour', price: c.min_price ?? 500 },
        { key: '4hr', label: '4 Hours', price: Math.round((c.min_price ?? 500) * 3.5) },
        { key: '8hr', label: 'Full Day', price: (c.min_price ?? 500) * 6 },
      ];

  return {
    rating,
    reviewCount: 0,
    galleryImages: images,
    badges: ['Instant Confirmation', 'Top Rated'],
    buildingName: c.center_name,
    floor: 'Ground Floor',
    durationPricing,
    siblingRoomTypes: siblingRoomTypes.length > 0 ? siblingRoomTypes : [{
      id: c.id + '-room',
      roomType: 'Conference Room',
      seatingCapacity: 'Up to 10',
      capacity: 10,
      pricing: [{ key: 'hourly', label: 'Per Hour', price: c.min_price ?? 500 }],
    }],
    whyBookCards: ['Instant Confirmation', 'Professional Setup', 'High-Speed WiFi'],
    roomConfigurations: [
      { layout: 'Boardroom', capacity: 10, suitableFor: 'Formal meetings and presentations' },
      { layout: 'Theater', capacity: 20, suitableFor: 'Workshops and training' },
      { layout: 'Classroom', capacity: 15, suitableFor: 'Training sessions' },
    ],
    equipmentTech: amenities.filter((a) =>
      /projector|screen|tv|whiteboard|mic|speaker|wifi|hdmi/i.test(a),
    ),
    addOns: [
      { key: 'projector', label: 'Projector', price: 200 },
      { key: 'whiteboard', label: 'Whiteboard', price: 0 },
      { key: 'tea-coffee', label: 'Tea & Coffee', price: 150 },
    ],
    nearbyPlaces: [],
    parkingAvailable: hasParking,
    host: {
      brand: c.center_name,
      propertyManager: 'Property Manager',
      responseTimeMinutes: 30,
      verified: true,
      yearsOperating: 3,
      satisfactionScore: Math.round(rating * 20),
    },
    rules: {
      foodPolicy: 'Outside food allowed',
      outsideCateringPolicy: 'Catering allowed with prior notice',
      visitorPolicy: 'Registered guests only',
      timingPolicy: `${c.opening_time?.slice(0, 5) ?? '09:00'} – ${c.closing_time?.slice(0, 5) ?? '21:00'}`,
      noisePolicy: 'Keep noise to a minimum in shared areas',
      cancellationPolicy: 'Free cancellation up to 2 hours before booking',
      refundPolicy: 'Refund within 5-7 business days',
      securityRules: 'CCTV surveillance throughout the premises',
    },
    ratingBreakdown: [
      { star: 5, percent: 65 },
      { star: 4, percent: 20 },
      { star: 3, percent: 10 },
      { star: 2, percent: 3 },
      { star: 1, percent: 2 },
    ],
    reviews: [],
    aiReviewSummary: [
      `Great meeting space in ${c.locality ?? c.city}`,
      'Professional environment',
      'Easy booking process',
    ],
  };
}

export function apiToMonthlyPassDetails(c: CentreApiRow): MonthlyPassDetails {
  const images = getImages(c);
  const amenities = getAmenityLabels(c);
  const plans = (c.center_membership_plans ?? []).filter(
    (p) => p.product_type === 'monthly-pass' && p.is_active,
  );
  const rating = c.rating ?? 4.5;

  const membershipTypes: MembershipType[] = plans.map((p) => ({
    key: p.plan_type || p.id,
    planId: p.id,
    name: p.name,
    price: p.price,
    accessHours: '9 AM – 9 PM',
    meetingRoomCredits: '2 hours/month',
    guestsAllowed: '1 guest/day',
    storage: 'Personal locker',
    communityAccess: 'Full access',
  }));

  const seatingOptions: MonthlySeatingOption[] = plans.map((p, i) => ({
    key: p.plan_type || p.id,
    name: p.name,
    image: images[i % images.length],
    capacity: '1 person',
    benefits: amenities.slice(0, 3),
    available: true,
  }));

  return {
    galleryImages: images,
    badges: ['GST Compliant', 'Flexible Plans'],
    metroDistanceKm: 0.5,
    railwayDistanceKm: 2.0,
    airportDistanceKm: 20,
    membershipTypes: membershipTypes.length > 0 ? membershipTypes : [{
      key: 'hot-desk',
      name: 'Hot Desk',
      price: c.min_price ?? 5000,
      accessHours: '9 AM – 9 PM',
      meetingRoomCredits: '2 hours/month',
      guestsAllowed: '1 guest/day',
      storage: 'Personal locker',
      communityAccess: 'Full access',
    }],
    whyChooseFeatures: [
      'Flexible month-to-month plans',
      'High-speed internet',
      'Access to common areas',
      'Professional business address',
    ],
    seatingOptions: seatingOptions.length > 0 ? seatingOptions : [{
      key: 'hot-desk',
      name: 'Hot Desk',
      image: images[0],
      capacity: '1 person',
      benefits: amenities.slice(0, 3),
      available: true,
    }],
    amenities,
    nearbyPlaces: [],
    whoIsThisFor: ['Freelancers', 'Startups', 'Remote workers', 'Small teams'],
    seatTiers: [
      { seats: 1, label: 'Solo', estimatedMonthly: c.min_price ?? 5000 },
      { seats: 5, label: 'Small Team', estimatedMonthly: Math.round((c.min_price ?? 5000) * 4.5) },
      { seats: 10, label: 'Team', estimatedMonthly: (c.min_price ?? 5000) * 8 },
      { seats: 'Enterprise', label: 'Enterprise', estimatedMonthly: null },
    ],
    communityBenefits: ['Networking events', 'Skill workshops', 'Member discounts'],
    ratingBreakdown: [
      { stars: 5, percent: 65 },
      { stars: 4, percent: 20 },
      { stars: 3, percent: 10 },
      { stars: 2, percent: 3 },
      { stars: 1, percent: 2 },
    ],
    aiLovedTags: [
      { tag: 'Great Location', mentions: 45 },
      { tag: 'Fast WiFi', mentions: 38 },
      { tag: 'Professional Staff', mentions: 30 },
    ],
    reviews: [],
    matchScoreItems: [
      { label: 'Location', achieved: true },
      { label: 'Amenities', achieved: amenities.length > 5 },
      { label: 'Pricing', achieved: true },
    ],
    matchScore: Math.round(50 + rating * 10),
    aiRecommendedFor: [
      { persona: 'Freelancer', reason: 'Flexible plans and vibrant community' },
      { persona: 'Startup', reason: 'Scalable space and professional address' },
    ],
  };
}

export function apiToVirtualOfficeDetails(c: CentreApiRow): VirtualOfficeDetails {
  const images = getImages(c);
  const amenities = getAmenityLabels(c);
  const plans = (c.center_membership_plans ?? []).filter(
    (p) => p.product_type === 'virtual-office' && p.is_active,
  );
  const rating = c.rating ?? 4.5;
  const hasBusiness = plans.some((p) => /business/i.test(p.name));
  const hasPremium = plans.some((p) => /premium/i.test(p.name));

  return {
    rating,
    reviewCount: 0,
    heroImage: images[0],
    trustScore: 90,
    trustScoreItems: [
      { label: 'GST Registered Address', achieved: true },
      { label: 'Govt. Compliant Documentation', achieved: true },
      { label: 'Dedicated Relationship Manager', achieved: hasBusiness || hasPremium },
      { label: 'Mail Handling', achieved: true },
      { label: 'Call Answering Service', achieved: hasPremium },
    ],
    whyThisOffice: [
      `Prime address in ${c.locality ?? c.city}`,
      'GST-registered business address',
      'Mail and courier handling',
      'Meeting room access on demand',
    ],
    planComparison: [
      { feature: 'Business Address', basic: true, business: true, premium: true },
      { feature: 'Mail Handling', basic: true, business: true, premium: true },
      { feature: 'GST Registration Support', basic: false, business: true, premium: true },
      { feature: 'Meeting Room Credits', basic: false, business: true, premium: true },
      { feature: 'Dedicated Phone Number', basic: false, business: false, premium: true },
      { feature: 'Call Answering', basic: false, business: false, premium: true },
    ],
    documentRequirements: [
      { name: 'Aadhaar Card', description: 'Self-attested copy of Aadhaar card' },
      { name: 'PAN Card', description: 'Self-attested copy of PAN card' },
      { name: 'Passport Photo', description: 'Recent passport-sized photograph' },
      { name: 'Business Registration', description: 'Company incorporation certificate (if applicable)' },
    ],
    approvalWindow: '24-48 hours',
    howItWorks: [
      { step: 1, title: 'Choose a Plan', description: 'Select the virtual office plan that fits your needs.' },
      { step: 2, title: 'Submit Documents', description: 'Upload your KYC documents online for verification.' },
      { step: 3, title: 'Get Approved', description: 'Receive approval within 24-48 hours.' },
      { step: 4, title: 'Start Using', description: 'Use your business address on all official communications.' },
    ],
    nearbyPlaces: [],
    facilities: amenities.length > 0 ? amenities : ['High-Speed WiFi', 'Reception Services', 'Meeting Rooms', 'Parking'],
    ratingBreakdown: [
      { star: 5, percent: 65 },
      { star: 4, percent: 20 },
      { star: 3, percent: 10 },
      { star: 2, percent: 3 },
      { star: 1, percent: 2 },
    ],
    reviews: [],
    aiReviewSummary: [
      'Excellent business address in a prime location',
      'Quick documentation process',
      'Responsive support team',
    ],
    faqs: [
      { category: 'General', question: 'What is a virtual office?', answer: 'A virtual office gives you a business address and related services without physical office space.' },
      { category: 'Billing', question: 'Can I cancel anytime?', answer: 'Yes, you can cancel with 30 days notice.' },
      { category: 'Documents', question: 'What documents do I need?', answer: 'You need Aadhaar, PAN, and a passport photo. Business registration certificate if applicable.' },
    ],
  };
}
