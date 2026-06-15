import type { ReactNode } from "react";

export function DataTable({ headers, children }: Readonly<{ headers: string[]; children: ReactNode }>) {
  return (
    <div className="glass-card relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-8" style={{ zIndex: "inherit" }}>
      <div className="w-full overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[700px] lg:min-w-0 border-separate border-spacing-0 text-left text-sm">
          <thead className="relative z-10">
            <tr className="bg-gradient-to-r from-[var(--card)] to-[var(--surface)] shadow-md shadow-blue-500/5">
              {headers.map((header, i) => (
                <th key={header} className={`border-y border-[var(--border)] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--foreground)] whitespace-nowrap ${i === 0 ? 'border-l rounded-l-2xl' : ''} ${i === headers.length - 1 ? 'border-r rounded-r-2xl' : ''}`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_td]:px-4 [&_td]:py-6 [&_tr]:transition-colors [&_tr]:hover:bg-[var(--foreground)]/[0.02] [&_td]:whitespace-nowrap lg:[&_td]:whitespace-normal">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}

