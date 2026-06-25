import { useState } from "react";
import { Star, MapPin, ArrowRight, TrendingUp, Zap } from "lucide-react";
import { Link } from "react-router-dom";

type Category = "day-pass" | "meeting-room" | "virtual-office" | "hotel";

interface Space {
  id: string;
  name: string;
  area: string;
  city: string;
  rating: number;
  reviews: number;
  price: number;
  unit: string;
  image: string;
  href: string;
  badge?: string;
  amenities: string[];
}

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=640&h=400&fit=crop&q=80&auto=format`;

const SPACES: Record<Category, Space[]> = {
  "day-pass": [
    {
      id: "dp1",
      name: "WeWork BKC",
      area: "Bandra Kurla Complex",
      city: "Mumbai",
      rating: 4.9,
      reviews: 1284,
      price: 799,
      unit: "/ day",
      image: img("1497366216548-37526070297c"),
      href: "/mumbai/day-pass",
      badge: "Most Popular",
      amenities: ["High-Speed WiFi", "Café", "Meeting Rooms", "24/7 Access"],
    },
    {
      id: "dp2",
      name: "91Springboard HSR",
      area: "HSR Layout",
      city: "Bangalore",
      rating: 4.8,
      reviews: 976,
      price: 599,
      unit: "/ day",
      image: img("1524758631624-e2822e304c36"),
      href: "/bangalore/day-pass",
      badge: "Top Rated",
      amenities: ["Rooftop Deck", "Gaming Zone", "Café", "Lockers"],
    },
    {
      id: "dp3",
      name: "Smartworks Cyber City",
      area: "Cyber City",
      city: "Gurgaon",
      rating: 4.8,
      reviews: 742,
      price: 699,
      unit: "/ day",
      image: img("1600508773327-f2f8e2d946fc"),
      href: "/gurgaon/day-pass",
      amenities: ["Standing Desks", "Phone Booths", "Cafeteria", "Parking"],
    },
    {
      id: "dp4",
      name: "The Hive, Powai",
      area: "Powai",
      city: "Mumbai",
      rating: 4.7,
      reviews: 588,
      price: 649,
      unit: "/ day",
      image: img("1497215728101-856f4ea42174"),
      href: "/mumbai/day-pass",
      amenities: ["Lake View", "Café", "Meeting Pods", "WiFi 1 Gbps"],
    },
  ],
  "meeting-room": [
    {
      id: "mr1",
      name: "IQ Business Centre",
      area: "Andheri East",
      city: "Mumbai",
      rating: 4.9,
      reviews: 822,
      price: 999,
      unit: "/ hr",
      image: img("1431540015161-0bf868a2d407"),
      href: "/mumbai/meeting-rooms",
      badge: "Most Popular",
      amenities: ["4K Display", "Video Conf.", "Whiteboards", "Catering"],
    },
    {
      id: "mr2",
      name: "Awfis Koramangala",
      area: "Koramangala",
      city: "Bangalore",
      rating: 4.8,
      reviews: 641,
      price: 799,
      unit: "/ hr",
      image: img("1573496359142-b8d87734a5a2"),
      href: "/bangalore/meeting-rooms",
      badge: "Top Rated",
      amenities: ["Dolby Sound", "Glass Walls", "Concierge", "Parking"],
    },
    {
      id: "mr3",
      name: "CoWrks Golf Course Rd",
      area: "Golf Course Road",
      city: "Gurgaon",
      rating: 4.8,
      reviews: 519,
      price: 1199,
      unit: "/ hr",
      image: img("1581092335878-2d9ff86ca2bf"),
      href: "/gurgaon/meeting-rooms",
      amenities: ["16-Seat Boardroom", "Presentation Deck", "Bar Cart", "WiFi"],
    },
    {
      id: "mr4",
      name: "Regus Banjara Hills",
      area: "Banjara Hills",
      city: "Hyderabad",
      rating: 4.7,
      reviews: 388,
      price: 699,
      unit: "/ hr",
      image: img("1517502884422-41eaead166d4"),
      href: "/hyderabad/meeting-rooms",
      amenities: ["Smart TV", "Video Bridge", "Tea/Coffee", "Reception"],
    },
  ],
  "virtual-office": [
    {
      id: "vo1",
      name: "Prestige Tech Park",
      area: "Sarjapur Road",
      city: "Bangalore",
      rating: 4.9,
      reviews: 1104,
      price: 1499,
      unit: "/ mo",
      image: img("1497366811353-6870744d04b2"),
      href: "/bangalore/virtual-office",
      badge: "Most Popular",
      amenities: ["GST Address", "Mail Handling", "Call Answering", "ROC Filing"],
    },
    {
      id: "vo2",
      name: "Nariman Point Address",
      area: "Nariman Point",
      city: "Mumbai",
      rating: 4.9,
      reviews: 934,
      price: 1999,
      unit: "/ mo",
      image: img("1497215728101-856f4ea42174"),
      href: "/mumbai/virtual-office",
      badge: "Premium Address",
      amenities: ["Prime CBD Location", "Mail Scan & Forward", "GST Reg.", "Reception"],
    },
    {
      id: "vo3",
      name: "Connaught Place Office",
      area: "Connaught Place",
      city: "Delhi",
      rating: 4.8,
      reviews: 712,
      price: 1299,
      unit: "/ mo",
      image: img("1520607774542-6b750a5e30b5"),
      href: "/delhi/virtual-office",
      amenities: ["CP Address", "Mail Box", "Courier Handling", "Meeting Credits"],
    },
    {
      id: "vo4",
      name: "Hitech City Workspace",
      area: "Hitech City",
      city: "Hyderabad",
      rating: 4.7,
      reviews: 498,
      price: 999,
      unit: "/ mo",
      image: img("1497366216548-37526070297c"),
      href: "/hyderabad/virtual-office",
      amenities: ["GST Address", "8 Meeting Hrs", "Mail Handling", "Digital Presence"],
    },
  ],
  hotel: [
    {
      id: "h1",
      name: "FabHotel Prime BKC",
      area: "Bandra Kurla Complex",
      city: "Mumbai",
      rating: 4.8,
      reviews: 1562,
      price: 1999,
      unit: "/ night",
      image: img("1542314831-068cd1dbfeeb"),
      href: "/mumbai/hotels",
      badge: "Best Rated",
      amenities: ["AC Room", "Free Breakfast", "WiFi", "24/7 Check-in"],
    },
    {
      id: "h2",
      name: "Lemon Tree Whitefield",
      area: "Whitefield",
      city: "Bangalore",
      rating: 4.8,
      reviews: 1188,
      price: 2499,
      unit: "/ night",
      image: img("1520250497591-112f2f40a3f4"),
      href: "/bangalore/hotels",
      badge: "Popular Stay",
      amenities: ["Pool", "Gym", "Restaurant", "Airport Transfer"],
    },
    {
      id: "h3",
      name: "Treebo Trend Cyber Hub",
      area: "Cyber Hub",
      city: "Gurgaon",
      rating: 4.7,
      reviews: 876,
      price: 1799,
      unit: "/ night",
      image: img("1566073771259-470b3e56ef97"),
      href: "/gurgaon/hotels",
      amenities: ["City View", "Café", "Business Center", "WiFi"],
    },
    {
      id: "h4",
      name: "Zostel Plus Hauz Khas",
      area: "Hauz Khas",
      city: "Delhi",
      rating: 4.7,
      reviews: 692,
      price: 1499,
      unit: "/ night",
      image: img("1596436889106-be35e843f974"),
      href: "/delhi/hotels",
      amenities: ["Rooftop Bar", "AC Room", "Social Lounge", "Free WiFi"],
    },
  ],
};

const TABS: Array<{ id: Category; label: string; emoji: string }> = [
  { id: "day-pass",       label: "Day Pass",       emoji: "☀️" },
  { id: "meeting-room",   label: "Meeting Room",   emoji: "🏛️" },
  { id: "virtual-office", label: "Virtual Office", emoji: "🖥️" },
  { id: "hotel",          label: "Hotel",          emoji: "🏨" },
];

const CATEGORY_LINKS: Record<Category, string> = {
  "day-pass":       "/mumbai/day-pass",
  "meeting-room":   "/mumbai/meeting-rooms",
  "virtual-office": "/mumbai/virtual-office",
  "hotel":          "/mumbai/hotels",
};

export default function FindYourSpaceSection() {
  const [active, setActive] = useState<Category>("day-pass");
  const spaces = SPACES[active];

  return (
    <section className="w-full bg-white py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-bold text-[#D97706]">
                <TrendingUp size={12} /> Popular &amp; Highly Rated
              </span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
              Top Spaces, Loved by Thousands
            </h2>
            <p className="mt-2 text-base text-[#64748B]">
              Hand-picked centers with the highest ratings and bookings across India.
            </p>
          </div>
          <Link
            to={CATEGORY_LINKS[active]}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#2563EB] transition-colors hover:bg-[#EFF6FF]"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="mt-8 flex gap-2 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                active === tab.id
                  ? "bg-[#2563EB] text-white shadow-md shadow-blue-200"
                  : "border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB]"
              }`}
            >
              <span className="text-base leading-none">{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Space Cards */}
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {spaces.map((space) => (
            <Link
              key={space.id}
              to={space.href}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                  src={space.image}
                  alt={space.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {space.badge && (
                  <span className="absolute left-3 top-3 flex items-center gap-1 rounded-lg bg-[#2563EB] px-2.5 py-1 text-[10px] font-bold text-white shadow">
                    <Zap size={9} className="fill-current" /> {space.badge}
                  </span>
                )}
                {/* Rating overlay */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 backdrop-blur-sm">
                  <Star size={11} className="fill-[#FBBF24] text-[#FBBF24]" />
                  <span className="text-[11px] font-bold text-white">{space.rating}</span>
                  <span className="text-[10px] text-white/70">({space.reviews >= 1000 ? `${(space.reviews / 1000).toFixed(1)}k` : space.reviews})</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col p-4">
                <p className="truncate font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                  {space.name}
                </p>
                <div className="mt-1 flex items-center gap-1 text-xs text-[#94A3B8]">
                  <MapPin size={11} />
                  {space.area}, {space.city}
                </div>

                {/* Amenities */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {space.amenities.slice(0, 3).map((a) => (
                    <span key={a} className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-medium text-[#475569]">
                      {a}
                    </span>
                  ))}
                </div>

                {/* Price */}
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <span className="text-lg font-extrabold text-[#0F172A]">₹{space.price.toLocaleString("en-IN")}</span>
                    <span className="ml-1 text-xs text-[#94A3B8]">{space.unit}</span>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] opacity-0 transition-opacity group-hover:opacity-100">
                    Book Now <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
