import Header from "../components/Header";
import Hero from "../components/Hero";
import PopularCitiesSection from "../components/PopularCitiesSection";
import ExploreCategoriesSection from "../components/ExploreCategoriesSection";
import FindYourSpaceSection from "../components/FindYourSpaceSection";
import RecommendedSpacesSection from "../components/RecommendedSpacesSection";
import StayYourWaySection from "../components/StayYourWaySection";
import OffersSection from "../components/OffersSection";
import WhyChooseBokkoSection from "../components/WhyChooseBokkoSection";
import DownloadAppSection from "../components/DownloadAppSection";
import PartnerCTA from "../components/PartnerCTA";
import FAQSection from "../components/FAQSection";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Header />
      <main className="flex flex-1 flex-col">
        <Hero />
        <PopularCitiesSection />
        <ExploreCategoriesSection />
        <FindYourSpaceSection />
        <RecommendedSpacesSection />
        <StayYourWaySection />
        <OffersSection />
        <WhyChooseBokkoSection />
        <DownloadAppSection />
        <PartnerCTA />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
