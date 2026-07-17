import { useParams } from "react-router-dom";
import VirtualOfficeListingPage from "./VirtualOfficeListingPage";
import VirtualOfficeDetailsPage from "./VirtualOfficeDetailsPage";
import { cityToLocalities } from "../data/virtualOfficeListings";
import { findByDeslug } from "../utils/slug";

export default function VirtualOfficeSlugRouter() {
  const params = useParams<{ city?: string; slug: string }>();
  const citySlug = params.city?.toLowerCase() ?? null;
  const slug = params.slug ?? "";
  const areas = citySlug ? cityToLocalities[citySlug] ?? [] : [];
  const matchedArea = citySlug ? findByDeslug(areas, slug) : null;

  if (matchedArea) {
    return <VirtualOfficeListingPage areaSlug={slug} />;
  }

  return <VirtualOfficeDetailsPage officeSlug={slug} />;
}
