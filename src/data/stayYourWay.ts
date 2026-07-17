export type StayMode = "hourly" | "fullDay";

export interface StayHotel {
  id: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  price: string;
  priceUnit: string;
  href: string;
}

export interface StayModeContent {
  id: StayMode;
  tabLabel: string;
  heading: string;
  description: string;
  benefits: string[];
  ctaLabel: string;
  ctaHref: string;
}

export const stayModes: StayModeContent[] = [
  {
    id: "hourly",
    tabLabel: "Hourly Stay",
    heading: "Book Hotels By The Hour",
    description:
      "Pay only for the time you need. Perfect for business meetings, airport layovers, quick breaks and short stays.",
    benefits: [
      "3 Hour Stays",
      "6 Hour Stays",
      "9 Hour Stays",
      "Instant Confirmation",
      "Couple Friendly Options",
      "Premium Hotels",
    ],
    ctaLabel: "Explore Hourly Hotels",
    ctaHref: "/mumbai/hourly-hotels",
  },
  {
    id: "fullDay",
    tabLabel: "Full Day Stay",
    heading: "Premium Full-Day Hotel Experiences",
    description:
      "Flexible day-use and overnight stays for business travelers, families and workcation seekers.",
    benefits: [
      "Full Day Access",
      "Early Check-In",
      "Late Check-Out",
      "Workcation Friendly",
      "GST Invoice Support",
      "Premium Properties",
    ],
    ctaLabel: "Explore Full Day Hotels",
    ctaHref: "/mumbai/full-day-hotels",
  },
];
