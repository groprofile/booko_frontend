export interface Offer {
  id: string;
  discountLabel: string;
  description: string;
  code: string;
  note?: string;
  gradient: string;
  image?: string;
}

export const offers: Offer[] = [
  {
    id: "hotel-midweek",
    discountLabel: "Get 20% Off",
    description: "On weekday bookings at Bokko Hotels using coupon",
    code: "STAY20",
    gradient: "linear-gradient(135deg, #92654B 0%, #4A2E1C 100%)",
    image: "https://placehold.co/400x400/92654B/FFFFFF?text=Bokko",
  },
  {
    id: "coworking-thu-fri",
    discountLabel: "Get 20% Off",
    description: "On Thu and Fri bookings at Bokko Coworking using coupon",
    code: "WORK20",
    gradient: "linear-gradient(135deg, #3E7C89 0%, #1F4A54 100%)",
    image: "https://placehold.co/400x400/3E7C89/FFFFFF?text=Bokko",
  },
  {
    id: "meeting-weekend",
    discountLabel: "Get 20% Off",
    description: "On weekend bookings at Meeting Rooms using coupon",
    code: "WEEKEND20",
    gradient: "linear-gradient(135deg, #6B3A82 0%, #3B1E49 100%)",
    image: "https://placehold.co/400x400/6B3A82/FFFFFF?text=Bokko",
  },
  {
    id: "welcome-offer",
    discountLabel: "Get Flat 10% Off",
    description: "On your 1st booking using coupon",
    code: "WELCOME",
    note: "*Apply at checkout",
    gradient: "linear-gradient(135deg, #3730A3 0%, #1E1B4B 100%)",
  },
];
