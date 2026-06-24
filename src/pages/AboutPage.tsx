import StaticPage from "./StaticPage";

export default function AboutPage() {
  return (
    <StaticPage
      title="About Bokko"
      subtitle="India's All-in-One Space Booking Platform"
      sections={[
        {
          heading: "Who We Are",
          body: "Bokko is a brand of Grofeed Technology India Pvt Ltd — a team of entrepreneurs, designers and engineers who were frustrated with how hard it was to book a reliable workspace in India.\n\nWe launched with one mission: make booking verified coworking spaces, meeting rooms, day passes, virtual offices and hotels as easy as ordering food online.",
        },
        {
          heading: "Our Mission",
          body: "To empower every professional, freelancer, startup and enterprise in India with instant access to the best workspaces — without brokers, hidden fees or long waiting queues.\n\nWe believe great work deserves a great environment. Bokko makes that accessible to everyone.",
        },
        {
          heading: "What We Offer",
          body: "• Day Pass – Book a workspace for a day, from ₹99\n• Meeting Rooms – Hourly meeting rooms for teams of 2–200\n• Virtual Office – GST-compliant business address starting ₹499/month\n• Monthly Pass – Dedicated desk memberships at top coworking brands\n• Hotels – Business and leisure hotels, hourly to overnight stays\n• Coworking Spaces – Browse and compare 10,000+ verified spaces",
        },
        {
          heading: "Our Values",
          body: "Transparency — No hidden charges. What you see is what you pay.\nSpeed — Instant confirmation. No back-and-forth calls.\nTrust — Every space is verified by the Bokko team.\nInclusion — Great workspaces should be accessible to all, not just enterprise.",
        },
        {
          heading: "Legal & Company Details",
          body: "Legal Name: Grofeed Technology India Pvt Ltd\nBrand Name: Bokko\n\nRegistered Office:\nLightbridge, 07B-101 & 07A-127, Saki Vihar Rd,\nTunga Village, Chandivali, Powai,\nMumbai, Maharashtra 400072\n\nEmail: Hello@bokkoapp.com\nPhone: +91 83690 29490",
        },
      ]}
    />
  );
}
