export type StayMode = "hourly" | "fullDay";

export interface StayHotel {
  id: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  price: string;
  priceUnit: string;
}

export interface StayModeContent {
  id: StayMode;
  tabLabel: string;
  heading: string;
  description: string;
  benefits: string[];
  ctaLabel: string;
  hotels: StayHotel[];
}

const img = (photoId: string) =>
  `https://images.unsplash.com/photo-${photoId}?w=480&h=300&fit=crop&q=80&auto=format`;

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
    hotels: [
      {
        id: "hr-1",
        name: "Bokko Express Inn",
        location: "Andheri, Mumbai",
        image: img("1542314831-068cd1dbfeeb"),
        rating: 4.6,
        price: "₹599",
        priceUnit: "/ 3 Hours",
      },
      {
        id: "hr-2",
        name: "Bokko Transit Suites",
        location: "Aerocity, Delhi",
        image: img("1611892440504-42a792e24d32"),
        rating: 4.7,
        price: "₹699",
        priceUnit: "/ 3 Hours",
      },
      {
        id: "hr-3",
        name: "Bokko Quick Stay",
        location: "Koramangala, Bangalore",
        image: img("1568084680786-a84f91d1153c"),
        rating: 4.5,
        price: "₹649",
        priceUnit: "/ 3 Hours",
      },
      {
        id: "hr-4",
        name: "Bokko Hourly Retreat",
        location: "Banjara Hills, Hyderabad",
        image: img("1455587734955-081b22074882"),
        rating: 4.8,
        price: "₹749",
        priceUnit: "/ 3 Hours",
      },
    ],
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
    hotels: [
      {
        id: "fd-1",
        name: "Bokko Workcation Resort",
        location: "Lonavala, Pune",
        image: img("1520250497591-112f2f40a3f4"),
        rating: 4.7,
        price: "₹1,999",
        priceUnit: "/ Day",
      },
      {
        id: "fd-2",
        name: "Bokko Business Suites",
        location: "Connaught Place, Delhi",
        image: img("1582610116397-edb318620f90"),
        rating: 4.6,
        price: "₹2,499",
        priceUnit: "/ Day",
      },
      {
        id: "fd-3",
        name: "Bokko Day Retreat",
        location: "Whitefield, Bangalore",
        image: img("1582719508461-905c673771fd"),
        rating: 4.8,
        price: "₹2,199",
        priceUnit: "/ Day",
      },
      {
        id: "fd-4",
        name: "Bokko Premium Stay",
        location: "Marine Drive, Mumbai",
        image: img("1554995207-c18c203602cb"),
        rating: 4.9,
        price: "₹2,799",
        priceUnit: "/ Day",
      },
    ],
  },
];
