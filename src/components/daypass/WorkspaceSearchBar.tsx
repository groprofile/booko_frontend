import { Search } from "lucide-react";

interface WorkspaceSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function WorkspaceSearchBar({ value, onChange }: WorkspaceSearchBarProps) {
  return (
    <div className="flex h-14 items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 transition-colors focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/15">
      <Search size={18} className="shrink-0 text-[#64748B]" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search workspace, brand or locality..."
        className="h-full w-full bg-transparent text-sm font-medium text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
      />
    </div>
  );
}
