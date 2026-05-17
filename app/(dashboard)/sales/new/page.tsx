import { prisma } from "@/lib/prisma";
import { createSale } from "../action";
import SearchableSelect from "@/components/Searchableselect"; // path adjust koro

export default async function NewSalePage() {
  const products = await prisma.product.findMany({
    orderBy: { modelName: "asc" },
  });

  const buyers = await prisma.buyer.findMany({
    orderBy: { name: "asc" },
  });

  const productOptions = products.map((p) => ({
    value: p.id,
    label:
      p.stockQuantity === 0
        ? `${p.modelName} — Out of Stock`
        : `${p.modelName} (Stock: ${p.stockQuantity})`,
  }));

  const buyerOptions = buyers.map((b) => ({
    value: b.id,
    label: b.name,
  }));

  const inputClass =
    "w-full h-[42px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-[13.5px] font-medium text-slate-900 placeholder:text-slate-300 outline-none transition focus:border-indigo-500 focus:bg-indigo-50/30 focus:ring-2 focus:ring-indigo-500/10";

  return (
    <div className=" bg-[#f8f9fc] flex items-start justify-center px-6 py-12">
      <div className="w-full max-w-170">
        {/* Header */}

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_32px_rgba(0,0,0,0.06)]">
          <form action={createSale as any}>
            {/* ── Section 1: Product & Buyer ── */}
            <div className="px-7 py-6 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
                  Product & Buyer
                </p>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                {/* Product — Searchable */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500">
                    Product Model
                  </label>
                  <SearchableSelect
                    name="productId"
                    options={productOptions}
                    placeholder="Type to search model…"
                    required
                  />
                </div>

                {/* Buyer — Searchable */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500">
                    Buyer
                  </label>
                  <SearchableSelect
                    name="buyerId"
                    options={buyerOptions}
                    placeholder="Type to search buyer…"
                    required
                  />
                </div>
              </div>
            </div>

            {/* ── Section 2: Pricing ── */}
            <div className="px-7 py-6 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
                  Pricing Details
                </p>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
                {/* Quantity */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500">
                    Quantity
                  </label>
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    placeholder="0"
                    required
                    className={inputClass}
                  />
                </div>

                {/* Unit Price */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500">
                    Unit Price (৳)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-slate-400 pointer-events-none select-none">
                      ৳
                    </span>
                    <input
                      name="unitPrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      required
                      className={`${inputClass} pl-6`}
                    />
                  </div>
                </div>

                {/* Paid Amount */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500">
                    Paid Amount (৳)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-slate-400 pointer-events-none select-none">
                      ৳
                    </span>
                    <input
                      name="paidAmount"
                      type="number"
                      step="0.01"
                      defaultValue="0"
                      required
                      className={`${inputClass} pl-6`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Info Banner ── */}
            <div className="px-7 py-5 border-b border-slate-100">
              <div className="flex items-start gap-2.5 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <svg
                  className="text-green-600 mt-0.5 shrink-0"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-[12.5px] text-slate-600 leading-relaxed">
                  <span className="font-semibold text-green-700">
                    Due amount
                  </span>{" "}
                  is automatically calculated as{" "}
                  <span className="font-semibold text-green-700">
                    Total − Paid
                  </span>{" "}
                  and added to the buyer&apos;s profile upon completion.
                </p>
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex items-center justify-between px-7 py-5 bg-slate-50 border-t border-slate-200 max-sm:flex-col max-sm:items-end max-sm:gap-3">
              <span className="text-[11px] font-medium text-slate-400">
                All fields are required
              </span>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  className="h-10 px-4 rounded-lg border border-slate-200 bg-white text-[13px] font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-lg bg-indigo-500 text-white text-[13px] font-bold flex items-center gap-2 shadow-[0_2px_8px_rgba(99,102,241,0.35)] transition hover:bg-indigo-600 hover:shadow-[0_4px_16px_rgba(99,102,241,0.4)] hover:-translate-y-px active:translate-y-0 cursor-pointer"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Complete Sale
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
