"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // Shadcn utility
import { NAV_ITEMS } from "@/lib/constants";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col border-r bg-slate-50/50 w-64 fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary tracking-tight">
          StockMaster{" "}
          <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded-full">
            v1.0
          </span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-slate-100",
                isActive
                  ? "bg-white shadow-sm text-primary border border-slate-200"
                  : "text-slate-500 hover:text-slate-900",
              )}
            >
              <item.icon
                className={cn("w-4 h-4", isActive ? "text-primary" : "")}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-100">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs">
            SR
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">Shahinur Rahman</p>
            <p className="text-[10px] text-slate-500 truncate">Admin Profile</p>
          </div>
        </div>
      </div>
    </div>
  );
}
