import { productTabs } from "../data/productTabs";
import type { ProductKey } from "../types";

interface CategoryTabsProps {
  activeKey: ProductKey;
  onSelect: (key: ProductKey) => void;
}

export default function CategoryTabs({ activeKey, onSelect }: CategoryTabsProps) {
  return (
    <div
      className="scrollbar-hide flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full bg-[#0F172A] p-1.5"
      role="tablist"
      aria-label="Search by product"
    >
      {productTabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(tab.key)}
            className={
              "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 active:scale-95 " +
              (isActive ? "bg-white text-[#0F172A] shadow-soft" : "text-white/80 hover:bg-white/10")
            }
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
