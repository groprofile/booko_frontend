import MainLayout from "../components/layout/MainLayout";
import Hero from "../components/Hero";
import ExploreCategoriesSection from "../components/ExploreCategoriesSection";
import PopularCitiesSection from "../components/PopularCitiesSection";
import FindYourSpaceSection from "../components/FindYourSpaceSection";
import RecommendedSpacesSection from "../components/RecommendedSpacesSection";
import WhyChooseBokkoSection from "../components/WhyChooseBokkoSection";
import DownloadAppSection from "../components/DownloadAppSection";
import PartnerCTA from "../components/PartnerCTA";
import FAQSection from "../components/FAQSection";

export default function HomePage() {
  return (
    <MainLayout>
      <Hero />
      <ExploreCategoriesSection />
      <PopularCitiesSection />
      <FindYourSpaceSection />
      <RecommendedSpacesSection />
      <WhyChooseBokkoSection />
      <DownloadAppSection />
      <PartnerCTA />
      <FAQSection />
    </MainLayout>
  );
}
