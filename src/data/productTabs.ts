import {
  CalendarCheck,
  Briefcase,
  Armchair,
  Users,
  Globe2,
  Hotel,
} from "lucide-react";
import type { ProductKey } from "../types";

export interface SearchField {
  key: string;
  label: string;
  placeholder: string;
  type: "location" | "text" | "date" | "time" | "number";
}

export interface ProductTab {
  key: ProductKey;
  label: string;
  icon: typeof Hotel;
  fields: SearchField[];
  ctaLabel: string;
}

export const productTabs: ProductTab[] = [
  {
    key: "coworking",
    label: "Coworking",
    icon: Briefcase,
    ctaLabel: "Search Coworking",
    fields: [
      { key: "location", label: "Location", placeholder: "Search by city or area", type: "location" },
      { key: "date", label: "Date", placeholder: "Select date", type: "date" },
      { key: "seats", label: "Seats", placeholder: "Number of seats", type: "number" },
    ],
  },
  {
    key: "dayPass",
    label: "Day Pass",
    icon: Armchair,
    ctaLabel: "Search Day Pass",
    fields: [
      { key: "location", label: "Location", placeholder: "Search by city or area", type: "location" },
      { key: "date", label: "Date", placeholder: "Select date", type: "date" },
      { key: "members", label: "Members", placeholder: "Number of members", type: "number" },
    ],
  },
  {
    key: "meetingRooms",
    label: "Meeting Rooms",
    icon: Users,
    ctaLabel: "Search Meeting Rooms",
    fields: [
      { key: "location", label: "Location", placeholder: "Search by city or area", type: "location" },
      { key: "date", label: "Date", placeholder: "Select date", type: "date" },
      { key: "time", label: "Time", placeholder: "Select time", type: "time" },
      { key: "capacity", label: "Capacity", placeholder: "Number of attendees", type: "number" },
    ],
  },
  {
    key: "monthlyPass",
    label: "Monthly Pass",
    icon: CalendarCheck,
    ctaLabel: "Search Monthly Pass",
    fields: [
      { key: "location", label: "Location", placeholder: "Search by city or area", type: "location" },
      { key: "startDate", label: "Start Date", placeholder: "Select start date", type: "date" },
      { key: "members", label: "Members", placeholder: "Number of members", type: "number" },
    ],
  },
  {
    key: "virtualOffice",
    label: "Virtual Office",
    icon: Globe2,
    ctaLabel: "Search Virtual Office",
    fields: [
      { key: "city", label: "City", placeholder: "Select city", type: "location" },
      { key: "businessType", label: "Business Type", placeholder: "e.g. GST Registration", type: "text" },
    ],
  },
  {
    key: "hotels",
    label: "Hotels",
    icon: Hotel,
    ctaLabel: "Search Hotels",
    fields: [
      { key: "location", label: "Location", placeholder: "Where are you going?", type: "location" },
      { key: "checkIn", label: "Check-In", placeholder: "Check-in date", type: "date" },
      { key: "checkOut", label: "Check-Out", placeholder: "Check-out date", type: "date" },
      { key: "guests", label: "Guests", placeholder: "Add guests", type: "number" },
    ],
  },
];
