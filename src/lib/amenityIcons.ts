import {
  ArrowUpDown,
  Bath,
  Bike,
  Briefcase,
  Building2,
  Camera,
  Car,
  CheckCircle2,
  Clock,
  Coffee,
  ConciergeBell,
  Dumbbell,
  FileCheck2,
  Headphones,
  KeyRound,
  Lock,
  Luggage,
  Mail,
  MessageCircle,
  Mic,
  Monitor,
  Package2,
  ParkingCircle,
  PartyPopper,
  PhoneCall,
  Plane,
  Presentation,
  Printer,
  RefreshCcw,
  ShieldCheck,
  ShowerHead,
  Snowflake,
  Sofa,
  Sparkles,
  Speaker,
  TrainFront,
  Trees,
  Users,
  UserCheck,
  UserRound,
  Utensils,
  UtensilsCrossed,
  Video,
  Volume2,
  Wallet,
  Waves,
  Wifi,
  type LucideIcon,
  Fan,
  Droplet,
  BatteryCharging,
  Armchair,
  Tv,
} from "lucide-react";

/** Whole-word (or whole-phrase), case-insensitive keyword matcher. */
function kw(...words: string[]) {
  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`\\b(${escaped.join("|")})\\b`, "i");
}

interface Rule {
  pattern: RegExp;
  icon: LucideIcon;
}

/**
 * Ordered keyword → icon rules for vendor-supplied amenity/equipment/
 * facility labels, which are free text and vary a lot ("WiFi" vs
 * "High Speed WiFi" vs "Wi-Fi"). Order matters — more specific phrases
 * (e.g. "2 Wheeler Parking") must come before generic ones ("Parking").
 */
const rules: Rule[] = [
  { pattern: kw("2 wheeler", "two wheeler", "bike parking", "scooter parking"), icon: Bike },
  { pattern: kw("4 wheeler", "four wheeler", "car parking", "valet"), icon: Car },
  { pattern: kw("parking"), icon: ParkingCircle },

  { pattern: kw("wifi", "wi-fi", "internet", "broadband"), icon: Wifi },

  { pattern: kw("ac", "air condition", "air conditioning", "air conditioner", "central cooling"), icon: Snowflake },
  { pattern: kw("ventilation", "fan"), icon: Fan },

  { pattern: kw("power backup", "backup power", "generator", "inverter", "electricity"), icon: BatteryCharging },
  { pattern: kw("charging point", "charging station", "ev charging"), icon: BatteryCharging },

  { pattern: kw("cctv", "surveillance", "security camera"), icon: Camera },
  { pattern: kw("security", "guard", "safety"), icon: ShieldCheck },
  { pattern: kw("locker", "storage"), icon: Lock },
  { pattern: kw("key access", "keycard", "access control", "biometric"), icon: KeyRound },

  { pattern: kw("tea", "coffee", "beverage", "refreshment"), icon: Coffee },
  { pattern: kw("snacks", "pantry", "cafeteria", "cafe"), icon: Utensils },
  { pattern: kw("food", "restaurant", "breakfast", "meal", "dining", "room service", "kitchen"), icon: UtensilsCrossed },
  { pattern: kw("water", "drinking water", "ro water"), icon: Droplet },

  { pattern: kw("meeting room", "conference room", "boardroom", "discussion room"), icon: Users },
  { pattern: kw("video conferencing", "video conference"), icon: Video },
  { pattern: kw("projector"), icon: Presentation },
  { pattern: kw("whiteboard", "monitor", "display screen"), icon: Monitor },
  { pattern: kw("tv", "led screen", "smart tv", "television"), icon: Tv },
  { pattern: kw("microphone", "mic"), icon: Mic },
  { pattern: kw("speaker", "sound system", "audio"), icon: Speaker },
  { pattern: kw("print", "printing", "scanner", "xerox"), icon: Printer },

  { pattern: kw("metro", "railway", "train station"), icon: TrainFront },
  { pattern: kw("airport", "airport transfer"), icon: Plane },
  { pattern: kw("lift", "elevator"), icon: ArrowUpDown },

  { pattern: kw("wellness", "spa"), icon: Sparkles },
  { pattern: kw("gym", "fitness"), icon: Dumbbell },
  { pattern: kw("swimming pool", "pool"), icon: Waves },
  { pattern: kw("shower"), icon: ShowerHead },
  { pattern: kw("washroom", "restroom", "toilet"), icon: Bath },

  { pattern: kw("coworking access", "business center", "business centre", "workspace access", "office space"), icon: Building2 },
  { pattern: kw("lounge", "seating area"), icon: Armchair },
  { pattern: kw("common area", "recreation"), icon: Sofa },

  { pattern: kw("reception"), icon: UserRound },
  { pattern: kw("concierge", "front desk"), icon: ConciergeBell },
  { pattern: kw("visitor management", "visitor policy"), icon: UserCheck },

  { pattern: kw("event space", "event"), icon: PartyPopper },
  { pattern: kw("phone booth", "call booth"), icon: PhoneCall },

  { pattern: kw("mail handling", "postal"), icon: Mail },
  { pattern: kw("courier", "parcel", "delivery"), icon: Package2 },
  { pattern: kw("luggage", "baggage"), icon: Luggage },

  { pattern: kw("company registration", "business support"), icon: Briefcase },
  { pattern: kw("gst", "registration", "compliance", "documentation"), icon: FileCheck2 },
  { pattern: kw("correspondence", "communication"), icon: MessageCircle },
  { pattern: kw("support", "helpdesk", "customer care", "dedicated support"), icon: Headphones },

  { pattern: kw("garden", "outdoor", "terrace"), icon: Trees },
  { pattern: kw("24x7", "24/7", "round the clock"), icon: Clock },
  { pattern: kw("billing", "invoice"), icon: Wallet },
  { pattern: kw("cancellation", "refund"), icon: RefreshCcw },
  { pattern: kw("noise", "acoustics"), icon: Volume2 },
];

/**
 * Resolve a vendor-supplied amenity/equipment/facility label (free text)
 * to a matching Lucide icon. Falls back to a plain checkmark when no
 * keyword rule matches so unrecognised labels still render sensibly.
 */
export function resolveAmenityIcon(label: string): LucideIcon {
  const match = rules.find((rule) => rule.pattern.test(label));
  return match?.icon ?? CheckCircle2;
}
