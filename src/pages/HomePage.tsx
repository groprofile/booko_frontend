import Header from "../components/Header";
import Hero from "../components/Hero";
import ExploreCategoriesSection from "../components/ExploreCategoriesSection";
import FindYourSpaceSection from "../components/FindYourSpaceSection";
import RecommendedSpacesSection from "../components/RecommendedSpacesSection";
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
        <ExploreCategoriesSection />
        <FindYourSpaceSection />
        <RecommendedSpacesSection />
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
