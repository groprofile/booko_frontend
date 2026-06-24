import StaticPage from "./StaticPage";

export default function TermsPage() {
  return (
    <StaticPage
      title="Terms & Conditions"
      subtitle="Last updated: January 2025"
      sections={[
        { heading: "Acceptance of Terms", body: "By accessing or using Bokko (operated by Grofeed Technology India Pvt Ltd), you agree to be bound by these Terms and all applicable laws. If you do not agree, do not use the platform." },
        { heading: "Booking & Reservations", body: "All bookings are subject to availability and workspace operator confirmation. Bokko acts as a marketplace and is not directly responsible for workspace conditions. We facilitate the booking and payment, but the service is delivered by the workspace operator." },
        { heading: "Pricing & Payments", body: "All prices are in Indian Rupees (INR) and inclusive of applicable taxes unless stated otherwise. Payment is processed at the time of booking. Bokko uses secure, PCI-DSS compliant payment gateways." },
        { heading: "Cancellation Policy", body: "Cancellation policies vary by workspace and product type. Day passes are cancellable up to 2 hours before check-in. Meeting rooms can be cancelled up to 4 hours in advance. Monthly passes and virtual office plans follow operator-specific policies." },
        { heading: "User Responsibilities", body: "Users must provide accurate information during booking. Users are responsible for adhering to workspace rules, check-in/check-out times and conduct policies. Misuse of spaces may result in account suspension." },
        { heading: "Intellectual Property", body: "All content on Bokko including text, images, logos and software is the property of Grofeed Technology India Pvt Ltd or its licensors. The brand name 'Bokko' and all associated marks are owned by Grofeed Technology India Pvt Ltd. You may not reproduce or distribute any content without prior written consent." },
        { heading: "Limitation of Liability", body: "Bokko's liability shall not exceed the amount paid for the specific booking in dispute. We are not liable for indirect, incidental or consequential damages." },
        { heading: "Governing Law", body: "These Terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra." },
        { heading: "Company Details", body: "Legal Name: Grofeed Technology India Pvt Ltd\nBrand Name: Bokko\n\nRegistered Office:\nLightbridge, 07B-101 & 07A-127, Saki Vihar Rd,\nTunga Village, Chandivali, Powai,\nMumbai, Maharashtra 400072\n\nEmail: Hello@bokkoapp.com\nPhone: +91 83690 29490" },
      ]}
    />
  );
}
