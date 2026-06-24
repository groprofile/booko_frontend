import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DayPassListingPage from "./pages/DayPassListingPage";
import DayPassDetailsPage from "./pages/DayPassDetailsPage";
import MonthlyPassListingPage from "./pages/MonthlyPassListingPage";
import MonthlyPassDetailsPage from "./pages/MonthlyPassDetailsPage";
import MeetingRoomListingPage from "./pages/MeetingRoomListingPage";
import MeetingRoomDetailsPage from "./pages/MeetingRoomDetailsPage";
import HotelListingPage from "./pages/HotelListingPage";
import HotelDetailsPage from "./pages/HotelDetailsPage";
import VirtualOfficeListingPage from "./pages/VirtualOfficeListingPage";
import VirtualOfficeSlugRouter from "./pages/VirtualOfficeSlugRouter";
import CoworkingSpacesListingPage from "./pages/CoworkingSpacesListingPage";
import CheckoutPage from "./pages/CheckoutPage";
import BookingConfirmedPage from "./pages/BookingConfirmedPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";
import FAQsPage from "./pages/FAQsPage";
import StaticPage from "./pages/StaticPage";
// Partner
import PartnerSignupPage from "./pages/partner/PartnerSignupPage";
import PartnerSigninPage from "./pages/partner/PartnerSigninPage";
import PartnerVerifyEmailPage from "./pages/partner/PartnerVerifyEmailPage";
import PartnerOnboardingPage from "./pages/partner/PartnerOnboardingPage";
import PartnerPendingReviewPage from "./pages/partner/PartnerPendingReviewPage";
import OnboardingLayout from "./components/partner/OnboardingLayout";
import BusinessDetailsPage from "./pages/partner/onboarding/BusinessDetailsPage";
import CenterSetupPage from "./pages/partner/onboarding/CenterSetupPage";
import KycDocumentsPage from "./pages/partner/onboarding/KycDocumentsPage";
import BankDetailsPage from "./pages/partner/onboarding/BankDetailsPage";
import ReviewSubmitPage from "./pages/partner/onboarding/ReviewSubmitPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/:city/day-pass" element={<DayPassListingPage />} />
      <Route path="/:city/day-pass/:listingId" element={<DayPassDetailsPage />} />
      <Route path="/:city/monthly-pass" element={<MonthlyPassListingPage />} />
      <Route path="/:city/monthly-pass/:passSlug" element={<MonthlyPassDetailsPage />} />
      <Route path="/:city/meeting-rooms" element={<MeetingRoomListingPage />} />
      <Route path="/:city/meeting-rooms/:roomSlug" element={<MeetingRoomDetailsPage />} />
      <Route path="/:city/hotels" element={<HotelListingPage />} />
      <Route path="/:city/hotels/:hotelSlug" element={<HotelDetailsPage />} />
      <Route
        path="/:city/hourly-hotels"
        element={<HotelListingPage presetStayType="Hourly Stay" landingLabel="Hourly Hotels" />}
      />
      <Route
        path="/:city/full-day-hotels"
        element={<HotelListingPage presetStayType="Full Day Stay" landingLabel="Full Day Hotels" />}
      />
      <Route
        path="/:city/couple-friendly-hotels"
        element={<HotelListingPage presetTag="Couple Friendly" landingLabel="Couple Friendly Hotels" />}
      />
      <Route
        path="/:city/business-hotels"
        element={<HotelListingPage presetStayType="Business Hotel" landingLabel="Business Hotels" />}
      />
      <Route path="/:city/virtual-office" element={<VirtualOfficeListingPage />} />
      <Route path="/:city/virtual-office/:slug" element={<VirtualOfficeSlugRouter />} />
      <Route path="/coworking-spaces" element={<CoworkingSpacesListingPage />} />
      <Route path="/:city/coworking-spaces" element={<CoworkingSpacesListingPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/booking-confirmed" element={<BookingConfirmedPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/refund-policy" element={<RefundPolicyPage />} />
      <Route path="/cancellation-policy" element={<StaticPage title="Cancellation Policy" sections={[{ heading: "Day Pass Cancellations", body: "Cancel up to 2 hours before check-in for a full refund." }, { heading: "Meeting Room Cancellations", body: "Cancel up to 4 hours before the booking start time for a full refund." }, { heading: "Monthly Pass Cancellations", body: "Cancellations within 7 days of start for workspace failures. No cancellation once membership begins." }]} />} />
      <Route path="/faqs" element={<FAQsPage />} />
      <Route path="/help" element={<FAQsPage />} />
      <Route path="/careers" element={<StaticPage title="Careers at Bokko" subtitle="Join India's fastest-growing workspace platform" sections={[{ heading: "We're Hiring!", body: "We're looking for passionate people to join our mission. Roles available in Product, Engineering, Marketing, Sales and Operations." }, { heading: "How to Apply", body: "Send your resume and a short note about why you'd like to join Bokko to careers@bokkoapp.com" }]} />} />
      <Route path="/partner" element={<StaticPage title="Partner With Bokko" subtitle="List your workspace and grow your bookings" sections={[{ heading: "Why Partner With Bokko?", body: "Access 50,000+ monthly workspace seekers. Zero commission for the first 3 months. Real-time booking dashboard. Dedicated account manager." }, { heading: "How to Get Started", body: "Click 'List Your Space' or email partners@bokkoapp.com. Our team will onboard you within 48 hours." }]} />} />
      <Route path="/list-your-space" element={<StaticPage title="List Your Space" subtitle="Start receiving bookings within 48 hours" sections={[{ heading: "Get Started", body: "Email partners@bokkoapp.com with your workspace details or call +91 80080 08000." }]} />} />
      <Route path="/blog" element={<StaticPage title="Bokko Blog" subtitle="Workspace tips, city guides and productivity insights" sections={[{ heading: "Coming Soon", body: "Our blog is being set up. Check back soon for workspace guides, coworking tips and city-specific workspace roundups." }]} />} />
      <Route path="/cookie-policy" element={<StaticPage title="Cookie Policy" subtitle="How Bokko uses cookies and similar technologies" sections={[{ heading: "What Are Cookies", body: "Cookies are small text files stored on your device when you visit Bokko. They help us remember your preferences, keep you logged in, and understand how you use our platform." }, { heading: "Cookies We Use", body: "Essential Cookies — Required for the platform to work. These cannot be disabled.\n\nAnalytics Cookies — Help us understand which pages are visited and how users navigate the site. Data is anonymised.\n\nPreference Cookies — Remember your city, search filters and display settings.\n\nMarketing Cookies — Used to show relevant ads and measure campaign performance." }, { heading: "Managing Cookies", body: "You can control or delete cookies through your browser settings. Disabling cookies may affect some features such as staying logged in or saving your preferences." }, { heading: "Third-Party Cookies", body: "We use trusted third-party services (Google Analytics, payment gateways) that may set their own cookies. These are governed by their respective privacy policies." }, { heading: "Contact", body: "For questions about our cookie practices:\n\nGrofeed Technology India Pvt Ltd (Brand: Bokko)\nLightbridge, 07B-101 & 07A-127, Saki Vihar Rd,\nTunga Village, Chandivali, Powai, Mumbai, Maharashtra 400072\nEmail: Hello@bokkoapp.com" }]} />} />
      {/* Partner auth & onboarding */}
      <Route path="/partner/signup" element={<PartnerSignupPage />} />
      <Route path="/partner/signin" element={<PartnerSigninPage />} />
      <Route path="/partner/verify-email" element={<PartnerVerifyEmailPage />} />
      <Route path="/partner/pending-review" element={<PartnerPendingReviewPage />} />
      <Route path="/partner/onboarding" element={<OnboardingLayout />}>
        <Route index element={<PartnerOnboardingPage />} />
        <Route path="business" element={<BusinessDetailsPage />} />
        <Route path="centers" element={<CenterSetupPage />} />
        <Route path="kyc" element={<KycDocumentsPage />} />
        <Route path="bank" element={<BankDetailsPage />} />
        <Route path="review" element={<ReviewSubmitPage />} />
      </Route>
    </Routes>
  );
}

export default App;
