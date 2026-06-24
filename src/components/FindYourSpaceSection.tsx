import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { spaceSolutions } from "../data/spaceSolutions";

export default function FindYourSpaceSection() {
  return (
    <section id="categories" className="w-full bg-[#F8FAFC] py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
            Find Your Perfect Space
          </h2>
          <p className="mt-4 text-base text-[#64748B] sm:text-lg">
            Discover flexible workspaces, day passes, meeting rooms, hotels and virtual office
            solutions tailored to your needs.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {spaceSolutions.map((solution) => (
            <div
              key={solution.id}
              className="group flex flex-col overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-soft-lg"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <img
                  src={solution.image}
                  alt={solution.title}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-bold text-[#0F172A]">{solution.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                  {solution.description}
                </p>

                <Link
                  to={solution.href}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] transition-all hover:gap-2.5 hover:text-[#1D4ED8]"
                >
                  Explore Now
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
