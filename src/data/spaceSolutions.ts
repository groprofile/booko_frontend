export interface SpaceSolution {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

const img = (photoId: string) =>
  `https://images.unsplash.com/photo-${photoId}?w=600&h=375&fit=crop&q=80&auto=format`;

export const spaceSolutions: SpaceSolution[] = [
  {
    id: "day-pass",
    title: "Day Pass",
    description: "Work from premium coworking spaces, by the day.",
    image: img("1524758631624-e2822e304c36"),
    href: "/mumbai/day-pass",
  },
  {
    id: "meeting-room",
    title: "Meeting Room",
    description: "Professional meeting spaces, billed by the hour.",
    image: img("1431540015161-0bf868a2d407"),
    href: "/mumbai/meeting-rooms",
  },
  {
    id: "monthly-pass",
    title: "Monthly Pass",
    description: "A dedicated desk and unlimited access, every month.",
    image: img("1497215728101-856f4ea42174"),
    href: "/mumbai/monthly-pass",
  },
  {
    id: "hourly-hotel",
    title: "Hourly Hotel",
    description: "Pay only for the hours you need. Ideal for short stays.",
    image: img("1542314831-068cd1dbfeeb"),
    href: "/mumbai/hourly-hotels",
  },
  {
    id: "full-day-hotel",
    title: "Full Day Hotel",
    description: "Flexible day-use and overnight stays for travellers.",
    image: img("1520250497591-112f2f40a3f4"),
    href: "/mumbai/full-day-hotels",
  },
  {
    id: "virtual-office",
    title: "Virtual Office",
    description: "A registered business address, without the overhead.",
    image: img("1497366216548-37526070297c"),
    href: "/mumbai/virtual-office",
  },
];
