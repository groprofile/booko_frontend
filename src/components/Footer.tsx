import { Link } from "react-router-dom";
import { Lock, ShieldCheck, Zap, Heart } from "lucide-react";
import Logo from "./Logo";
import { LinkedInIcon, InstagramIcon, YoutubeIcon, FacebookIcon, XIcon } from "./SocialIcons";
import { GooglePlayBadge, AppStoreBadge } from "./StoreBadges";

const columns = [
  {
    title: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Careers", to: "/careers" },
      { label: "Press & Media", to: "/press" },
      { label: "Blog", to: "/blog" },
      { label: "Contact Us", to: "/contact" },
      { label: "Partner With Bokko", to: "/partner" },
      { label: "Investor Relations", to: "/investors" },
    ],
  },
  {
    title: "Products",
    links: [
      { label: "Coworking Spaces", to: "/coworking-spaces" },
      { label: "Day Pass", to: "/day-pass" },
      { label: "Meeting Rooms", to: "/meeting-rooms" },
      { label: "Virtual Office", to: "/virtual-office" },
      { label: "List Your Space", to: "/list-your-space" },
    ],
  },
  {
    title: "Top Cities",
    links: [
      { label: "Mumbai", to: "/mumbai/day-pass" },
      { label: "Delhi NCR", to: "/delhi/day-pass" },
      { label: "Bengaluru", to: "/bangalore/day-pass" },
      { label: "Hyderabad", to: "/hyderabad/day-pass" },
      { label: "Chennai", to: "/chennai/day-pass" },
      { label: "Pune", to: "/pune/day-pass" },
      { label: "Noida", to: "/noida/day-pass" },
      { label: "Kochi", to: "/kochi/day-pass" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", to: "/help" },
      { label: "FAQs", to: "/faqs" },
      { label: "WhatsApp Support", to: "/whatsapp" },
      { label: "Partner Support", to: "/partner-support" },
      { label: "Cancellation Policy", to: "/cancellation-policy" },
      { label: "Refund Policy", to: "/refund-policy" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy-policy" },
      { label: "Terms & Conditions", to: "/terms" },
      { label: "Refund Policy", to: "/refund-policy" },
      { label: "Cancellation Policy", to: "/cancellation-policy" },
      { label: "Cookie Policy", to: "/cookie-policy" },
      { label: "Security Policy", to: "/security-policy" },
    ],
  },
];

const socialLinks = [
  { label: "LinkedIn", icon: LinkedInIcon, href: "https://linkedin.com/company/bokkoapp" },
  { label: "Instagram", icon: InstagramIcon, href: "https://instagram.com/bokkoapp" },
  { label: "YouTube", icon: YoutubeIcon, href: "https://youtube.com/@bokkoapp" },
  { label: "Facebook", icon: FacebookIcon, href: "https://facebook.com/bokkoapp" },
  { label: "X", icon: XIcon, href: "https://x.com/bokkoapp" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-[#0F172A]">
      {/* Newsletter / CTA strip */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <div>
            <p className="text-base font-bold text-white">Get workspace deals in your city</p>
            <p className="text-sm text-slate-400">Weekly curated offers, no spam.</p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-sm gap-2"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="h-10 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#2563EB]"
            />
            <button type="submit"
              className="h-10 rounded-xl bg-[#2563EB] px-5 text-sm font-bold text-white hover:bg-[#1d4ed8]">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        {/* Brand + Social */}
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="flex flex-col gap-4">
            <Logo variant="light" />
            <p className="max-w-xs text-sm leading-relaxed text-slate-300">
              India's fastest-growing workspace booking platform. Find and book verified coworking
              spaces, meeting rooms, day passes, virtual offices and hotels — instantly.
            </p>
            <div className="flex gap-2.5">
              {socialLinks.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noreferrer"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-[#2563EB]">
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Download App</p>
            <GooglePlayBadge size="compact" />
            <AppStoreBadge size="compact" />
          </div>
        </div>

        {/* Links grid */}
        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-white">{column.title}</h3>
              <ul className="mt-4 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to}
                      className="text-sm text-slate-300 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-white/10 pt-8">
          {[
            { icon: Lock, label: "SSL Secured" },
            { icon: ShieldCheck, label: "10,000+ Verified Spaces" },
            { icon: Zap, label: "Instant Confirmation" },
            { icon: Heart, label: "100% Made in India" },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-slate-300">
              <Icon size={14} strokeWidth={1.75} />
              {label}
            </span>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-sm leading-relaxed text-slate-400">
            <span className="font-semibold text-slate-300">Grofeed Technology India Pvt Ltd</span>
            {" "}(Brand: <span className="font-semibold text-slate-300">Bokko</span>){" · "}
            Lightbridge, 07B-101 &amp; 07A-127, Saki Vihar Rd, Tunga Village, Chandivali, Powai, Mumbai, Maharashtra 400072
            {" · "}
            <a href="mailto:Hello@bokkoapp.com" className="text-slate-300 hover:text-white">
              Hello@bokkoapp.com
            </a>
            {" · "}
            <a href="tel:+918369029490" className="text-slate-300 hover:text-white">
              +91 83690 29490
            </a>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            By continuing past this page, you agree to our{" "}
            <Link to="/terms" className="text-slate-300 hover:text-white">Terms & Conditions</Link>
            {", "}
            <Link to="/privacy-policy" className="text-slate-300 hover:text-white">Privacy Policy</Link>
            {" and "}
            <Link to="/refund-policy" className="text-slate-300 hover:text-white">Refund Policy</Link>.
            All trademarks are properties of their respective owners.
          </p>
          <p className="mt-3 text-sm text-slate-400">
            2024–{new Date().getFullYear()} © Bokko — a brand of Grofeed Technology India Pvt Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
