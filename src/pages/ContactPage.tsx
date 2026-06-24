import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Mail, Phone, MapPin } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name && email && message) setSubmitted(true);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Header />
      <main className="flex-1">
        <div className="bg-[#0F172A] px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1280px]">
            <nav className="flex items-center gap-1.5 text-sm text-white/50">
              <Link to="/" className="hover:text-white">Home</Link>
              <ChevronRight size={14} />
              <span className="text-white">Contact Us</span>
            </nav>
            <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">Contact Us</h1>
            <p className="mt-2 text-base text-white/60">We typically respond within 2 hours on business days</p>
          </div>
        </div>

        <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
            {/* Contact form */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
              {submitted ? (
                <div className="flex flex-col items-center gap-4 py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#DCFCE7] text-3xl">✅</div>
                  <h2 className="text-xl font-bold text-[#0F172A]">Message Sent!</h2>
                  <p className="text-sm text-[#64748B]">Thank you, {name}! We'll get back to you at {email} within 2 hours.</p>
                  <button type="button" onClick={() => setSubmitted(false)}
                    className="rounded-xl bg-[#2563EB] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1d4ed8]">
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <h2 className="text-xl font-bold text-[#0F172A]">Send us a message</h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wide text-[#64748B]">Full Name *</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                        className="h-11 rounded-xl border border-[#E2E8F0] px-4 text-sm text-[#0F172A] outline-none focus:border-[#2563EB]" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wide text-[#64748B]">Email *</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                        className="h-11 rounded-xl border border-[#E2E8F0] px-4 text-sm text-[#0F172A] outline-none focus:border-[#2563EB]" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wide text-[#64748B]">Phone</label>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="h-11 rounded-xl border border-[#E2E8F0] px-4 text-sm text-[#0F172A] outline-none focus:border-[#2563EB]" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wide text-[#64748B]">Subject</label>
                      <select value={subject} onChange={(e) => setSubject(e.target.value)}
                        className="h-11 rounded-xl border border-[#E2E8F0] px-4 text-sm text-[#0F172A] outline-none focus:border-[#2563EB] bg-white">
                        <option value="">Select a topic</option>
                        <option>Booking Support</option>
                        <option>List My Space</option>
                        <option>Refund / Cancellation</option>
                        <option>Partnership</option>
                        <option>Technical Issue</option>
                        <option>General Inquiry</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-[#64748B]">Message *</label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5}
                      className="rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A] outline-none focus:border-[#2563EB] resize-none" />
                  </div>
                  <button type="submit"
                    className="h-12 rounded-xl bg-[#2563EB] text-sm font-bold text-white hover:bg-[#1d4ed8]">
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Info cards */}
            <div className="flex flex-col gap-5">
              {[
                { icon: Mail, title: "Email", value: "Hello@bokkoapp.com", link: "mailto:Hello@bokkoapp.com" },
                { icon: Phone, title: "Phone", value: "+91 83690 29490", link: "tel:+918369029490" },
                { icon: MapPin, title: "Office", value: "Lightbridge, 07B-101 & 07A-127, Saki Vihar Rd, Tunga Village, Chandivali, Powai, Mumbai, Maharashtra 400072", link: "https://maps.google.com/?q=Lightbridge+Saki+Vihar+Rd+Chandivali+Powai+Mumbai" },
              ].map(({ icon: Icon, title, value, link }) => (
                <a key={title} href={link} target={title === "Office" ? "_blank" : undefined} rel="noreferrer"
                  className="flex items-start gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:border-[#2563EB]">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">{title}</p>
                    <p className="mt-0.5 text-sm font-semibold text-[#0F172A]">{value}</p>
                  </div>
                </a>
              ))}

              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">Company</p>
                <p className="mt-1 text-sm font-semibold text-[#0F172A]">Grofeed Technology India Pvt Ltd</p>
                <p className="mt-0.5 text-xs text-[#64748B]">Brand: Bokko</p>
              </div>

              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
                <p className="text-sm font-bold text-[#0F172A]">WhatsApp Support</p>
                <p className="mt-1 text-xs text-[#64748B]">Chat with us on WhatsApp for instant help</p>
                <a href="https://wa.me/918369029490" target="_blank" rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-bold text-white hover:bg-[#1ebe5d]">
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
