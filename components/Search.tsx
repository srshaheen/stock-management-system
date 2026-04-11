"use client";

import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // 300ms wait korbe user-er typing thamar por
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative flex flex-1">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <Input
        className="pl-10 bg-white"
        placeholder={placeholder}
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("q")?.toString()}
      />
    </div>
  );
}
