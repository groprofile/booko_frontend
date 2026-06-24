import { Zap, ShieldCheck, SlidersHorizontal, Lock, Receipt, LayoutGrid } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    bg: "#EFF6FF",
    color: "#2563EB",
    title: "Instant Booking",
    description: "Confirmed in seconds, no calls or waiting.",
  },
  {
    icon: ShieldCheck,
    bg: "#ECFDF5",
    color: "#16A34A",
    title: "Verified Partners",
    description: "Every space personally vetted by our team.",
  },
  {
    icon: SlidersHorizontal,
    bg: "#FFF7ED",
    color: "#F97316",
    title: "Flexible Plans",
    description: "Hourly, daily or monthly — your call.",
  },
  {
    icon: Lock,
    bg: "#EFF6FF",
    color: "#2563EB",
    title: "Secure Payments",
    description: "Encrypted, trusted payment gateways.",
  },
  {
    icon: Receipt,
    bg: "#ECFDF5",
    color: "#16A34A",
    title: "GST Invoice Support",
    description: "Business-ready invoices on every booking.",
  },
  {
    icon: LayoutGrid,
    bg: "#FFF7ED",
    color: "#F97316",
    title: "Multiple Space Types",
    description: "Hotels, coworking, meeting rooms and more.",
  },
];

export default function WhyChooseBokkoSection() {
  return (
    <section className="w-full bg-[#ECFDF5] py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="overflow-hidden rounded-[24px]">
            <img
              src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=700&h=850&fit=crop&q=80&auto=format"
              alt="A premium Bokko workspace"
              className="h-[320px] w-full object-cover sm:h-[420px] lg:h-[520px]"
            />
          </div>

          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
              Why Choose Bokko
            </h2>
            <p className="mt-4 max-w-lg text-base text-[#475569] sm:text-lg">
              A single, trustworthy platform for every space your business needs — built for
              speed, flexibility and scale.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-7 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex items-start gap-3.5">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: benefit.bg, color: benefit.color }}
                  >
                    <benefit.icon size={22} strokeWidth={1.8} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">{benefit.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[#64748B]">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
