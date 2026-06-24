export interface PopularCity {
  id: string;
  name: string;
  image?: string;
  isAll?: boolean;
}

export const popularCities: PopularCity[] = [
  {
    id: "mumbai",
    name: "Mumbai",
    image:
      "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=200&h=200&fit=crop&q=80&auto=format",
  },
  {
    id: "delhi",
    name: "Delhi",
    image:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=200&h=200&fit=crop&q=80&auto=format",
  },
  {
    id: "bangalore",
    name: "Bangalore",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Vidhana_Soudha_2012.jpg/330px-Vidhana_Soudha_2012.jpg",
  },
  {
    id: "chennai",
    name: "Chennai",
    image:
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=200&h=200&fit=crop&q=80&auto=format",
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Charminar_Hyderabad_1.jpg/330px-Charminar_Hyderabad_1.jpg",
  },
  {
    id: "kolkata",
    name: "Kolkata",
    image:
      "https://images.unsplash.com/photo-1558431382-27e303142255?w=200&h=200&fit=crop&q=80&auto=format",
  },
  {
    id: "pune",
    name: "Pune",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Sinhagad.jpg/330px-Sinhagad.jpg",
  },
  {
    id: "lucknow",
    name: "Lucknow",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Clock_tower_%2C_lucknow.jpg/330px-Clock_tower_%2C_lucknow.jpg",
  },
  { id: "all", name: "All Cities", isAll: true },
];
