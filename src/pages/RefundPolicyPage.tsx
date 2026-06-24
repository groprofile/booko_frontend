import StaticPage from "./StaticPage";

export default function RefundPolicyPage() {
  return (
    <StaticPage
      title="Refund Policy"
      subtitle="We want you to be happy with every booking on Bokko"
      sections={[
        { heading: "Day Pass Refunds", body: "Full refund if cancelled at least 2 hours before check-in time. No refund for cancellations within 2 hours of check-in or for no-shows. Refunds are processed within 5–7 business days to the original payment method." },
        { heading: "Meeting Room Refunds", body: "Full refund if cancelled at least 4 hours before the booking start time. 50% refund if cancelled between 4 hours and 1 hour before start. No refund for cancellations within 1 hour of the booking." },
        { heading: "Monthly Pass Refunds", body: "For monthly memberships, a refund is available within 7 days of start date if the workspace fails to provide the promised services. No refund after 7 days unless the operator closes or materially changes the service." },
        { heading: "Virtual Office Refunds", body: "Refund available within 48 hours of payment for plans not yet activated. No refund once documents have been submitted and the business address has been activated." },
        { heading: "Hotel Bookings", body: "Refund eligibility depends on the hotel's cancellation policy displayed at time of booking. Bokko will facilitate refund processing in line with the hotel's policy." },
        { heading: "Processing Time", body: "All approved refunds are processed within 5–7 business days. The amount will be credited to the original payment source. For UPI and wallet payments, refunds may be instant in some cases." },
        { heading: "How to Request a Refund", body: "Email Hello@bokkoapp.com with your Booking ID and reason for cancellation, or use the 'Cancel Booking' option in your Bokko account. Our team will process your request within 24 hours.\n\nGrofeed Technology India Pvt Ltd (Brand: Bokko)\nLightbridge, 07B-101 & 07A-127, Saki Vihar Rd, Tunga Village, Chandivali, Powai, Mumbai, Maharashtra 400072" },
      ]}
    />
  );
}
