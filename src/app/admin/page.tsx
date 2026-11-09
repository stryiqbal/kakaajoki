"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Activity,
  Blocks,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Clock3,
  CreditCard,
  ExternalLink,
  Gamepad2,
  Hash,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

type NavItemData = {
  id: string;
  title: string;
  icon: LucideIcon;
  badge?: number | string;
  shortcut?: string;
  children?: NavItemData[];
};

type NavGroupData = {
  heading?: string;
  items: NavItemData[];
};

type AdminOrder = {
  order_id: string;
  service_title: string;
  product_title: string;
  quantity: number;
  unit_price: number;
  subtotal_amount: number;
  fee_amount: number;
  amount: number;
  contact_phone: string;
  account_data: Record<string, string>;
  payment_status: "pending_review" | "paid" | "rejected";
  account_status: "pending" | "processing" | "completed" | null;
  created_at: string;
  has_proof: boolean;
};

const ORDER_PAGE_SIZE = 25;

const serviceGroups: NavGroupData[] = [
  {
    heading: "Services",
    items: [
      {
        id: "mobile-legends",
        title: "Mobile Legends",
        icon: Gamepad2,
        children: [
          { id: "rank", title: "Rank", icon: Hash },
          { id: "mmr", title: "MMR", icon: Hash },
          { id: "classic", title: "Classic", icon: Hash },
          { id: "mabar", title: "Mabar", icon: Hash },
          { id: "rising", title: "Rising League", icon: Hash },
          { id: "montage", title: "Video Montage", icon: Hash },
        ],
      },
      {
        id: "magic-chess",
        title: "Magic Chess",
        icon: Blocks,
        children: [
          { id: "go-go", title: "Go Go", icon: Hash },
          { id: "mc-mmr", title: "MMR", icon: Hash },
        ],
      },
    ],
  },
];

const navGroups: NavGroupData[] = [
  {
    items: [
      { id: "search", title: "Search", icon: Search, shortcut: "Ctrl K" },
      { id: "home", title: "Summary", icon: LayoutDashboard },
      { id: "revenue", title: "Revenue", icon: Activity },
    ],
  },
  ...serviceGroups,
];

const bottomItems: NavItemData[] = [
  { id: "logout", title: "Log out", icon: LogOut },
];

const services = serviceGroups.flatMap((group) =>
  group.items.flatMap((category) =>
    (category.children ?? []).map((service) => ({ ...service, category: category.title })),
  ),
);

const serviceOrderTitles: Record<string, string> = {
  rank: "Mobile Legends Rank",
  mmr: "Mobile Legends MMR",
  classic: "Mobile Legends Classic",
  mabar: "Mabar / Gendong Mobile Legends",
  rising: "Mobile Legends Rising League",
  montage: "Mobile Legends Video Montage",
  "go-go": "Magic Chess Go Go",
  "mc-mmr": "Magic Chess Go Go MMR",
};

const workspaceOptions = ["Semua layanan", "Mobile Legends", "Magic Chess"];

function WorkspaceSwitcher({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (workspace: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="group mb-4 flex w-full cursor-pointer select-none items-center justify-between rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/5"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#151515] shadow-sm">
            <Image src="/home/logo.png?v=3" alt="Kakaajoki" width={32} height={32} className="size-full object-contain" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[13px] font-medium leading-none text-white">
              {selected === "Semua layanan" ? "All Services" : selected}
            </span>
            <span className="mt-1 text-[11px] leading-none text-zinc-500">
              Kakaajoki
            </span>
          </span>
        </span>
        <ChevronDown
          className="size-4 shrink-0 text-zinc-500 transition-colors group-hover:text-zinc-300"
          strokeWidth={1.5}
        />
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Tutup pilihan katalog"
            className="fixed inset-0 z-40 cursor-pointer"
            onClick={() => setIsOpen(false)}
          />
          <div
            role="listbox"
            aria-label="Pilih kategori layanan"
            className="absolute left-0 top-[52px] z-50 flex w-full flex-col gap-0.5 rounded-lg border border-white/10 bg-[#181818] py-1 shadow-xl"
          >
            {workspaceOptions.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected === option}
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                className={`mx-1 cursor-pointer rounded-md px-3 py-2 text-left text-[13px] transition-colors ${
                  selected === option
                    ? "bg-red-500/10 font-medium text-red-300"
                    : "text-zinc-300 hover:bg-white/5"
                }`}
              >
                {option === "Semua layanan" ? "All Services" : option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function NavItem({
  item,
  activeId,
  onSelect,
  unfinishedOrdersByService,
  level = 0,
  disabled = false,
}: {
  item: NavItemData;
  activeId: string;
  onSelect: (item: NavItemData) => void;
  unfinishedOrdersByService: Record<string, number>;
  level?: number;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(Boolean(item.children?.length));
  const Icon = item.icon;
  const hasChildren = Boolean(item.children?.length);
  const isActive =
    activeId === item.id || item.children?.some((child) => child.id === activeId);
  const itemStyle = { paddingLeft: `${level * 12 + 10}px` } satisfies CSSProperties;

  return (
    <div className="flex w-full flex-col">
      <button
        type="button"
        disabled={disabled}
        aria-expanded={hasChildren ? isOpen : undefined}
        onClick={() => {
          if (hasChildren) setIsOpen((open) => !open);
          else onSelect(item);
        }}
        className={`group flex w-full cursor-pointer select-none items-center justify-between rounded-md py-[7px] pr-2.5 text-left transition-all duration-200 disabled:cursor-wait disabled:opacity-60 ${
          isActive
            ? "bg-white/10 font-medium text-white"
            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
        }`}
        style={itemStyle}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <Icon
            className={`size-4 shrink-0 transition-colors ${
              isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
            }`}
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <span className="truncate text-[13px] tracking-wide">{item.title}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {item.shortcut && (
            <kbd className="hidden h-5 items-center justify-center rounded border border-white/10 bg-black/30 px-1.5 font-mono text-[10px] font-medium text-zinc-500 group-hover:inline-flex">
              {item.shortcut}
            </kbd>
          )}
          {item.badge !== undefined && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500/10 px-1.5 text-[10px] font-medium text-red-300">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronRight
              className={`size-3.5 text-zinc-600 transition-transform duration-200 ${
                isOpen ? "rotate-90" : ""
              }`}
              strokeWidth={2}
              aria-hidden="true"
            />
          )}
        </span>
      </button>

      {hasChildren && (
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="relative mt-0.5 flex min-h-0 flex-col gap-0.5 overflow-hidden">
            <div
              className="absolute bottom-0 top-0 border-l border-white/10"
              style={{ left: `${level * 12 + 17.5}px` }}
              aria-hidden="true"
            />
            {item.children?.map((child) => {
              const serviceTitle = serviceOrderTitles[child.id];
              const badge = serviceTitle
                ? unfinishedOrdersByService[serviceTitle] ?? 0
                : 0;
              const childItem = badge > 0 ? { ...child, badge } : child;
              return (
                <NavItem
                  key={child.id}
                  item={childItem}
                  activeId={activeId}
                  onSelect={onSelect}
                  unfinishedOrdersByService={unfinishedOrdersByService}
                  level={level + 1}
                  disabled={disabled}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarNav({
  activeId,
  onSelect,
  unfinishedOrderCount,
  unfinishedOrdersByService,
  activeWorkspace,
  onWorkspaceSelect,
  onLogout,
  isLoggingOut,
  logoutError,
}: {
  activeId: string;
  onSelect: (item: NavItemData) => void;
  unfinishedOrderCount: number;
  unfinishedOrdersByService: Record<string, number>;
  activeWorkspace: string;
  onWorkspaceSelect: (workspace: string) => void;
  onLogout: () => void;
  isLoggingOut: boolean;
  logoutError: string;
}) {
  const handleSelect = (item: NavItemData) => {
    if (item.id === "logout") onLogout();
    else onSelect(item);
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#101010] p-3 font-sans md:w-[260px]">
      <WorkspaceSwitcher selected={activeWorkspace} onSelect={onWorkspaceSelect} />
      <nav
        aria-label="Navigasi admin"
        className="mt-2 flex flex-1 flex-col gap-4 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {navGroups.map((group, index) => (
          <div key={group.heading ?? `main-${index}`} className="flex flex-col gap-0.5">
            {group.heading && (
              <span className="mb-1 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                {group.heading}
              </span>
            )}
            {group.items.map((item) => {
              const navItem = item.id === "home" && unfinishedOrderCount > 0
                ? { ...item, badge: unfinishedOrderCount }
                : item;
              return (
                <NavItem
                  key={item.id}
                  item={navItem}
                  activeId={activeId}
                  onSelect={handleSelect}
                  unfinishedOrdersByService={unfinishedOrdersByService}
                />
              );
            })}
          </div>
        ))}
      </nav>
      <div className="mt-3 flex flex-col gap-0.5 border-t border-white/10 pt-3">
        {logoutError && (
          <p role="alert" className="mb-2 px-2 text-xs text-red-300">
            {logoutError}
          </p>
        )}
        {bottomItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            activeId={activeId}
            onSelect={handleSelect}
            unfinishedOrdersByService={unfinishedOrdersByService}
            disabled={item.id === "logout" && isLoggingOut}
          />
        ))}
      </div>
    </div>
  );
}

function flattenNavItems(groups: NavGroupData[]): NavItemData[] {
  return groups.flatMap((group) =>
    group.items.flatMap((item) => [item, ...(item.children ?? [])]),
  );
}

const flatNavItems = flattenNavItems(navGroups);

type RevenueData = {
  totalRevenue: number;
  allTimeRevenue: number;
  paidOrderCount: number;
  dailyTotals: Array<{ day: string; amount: number; orderCount: number }>;
  history: Array<{
    order_id: string;
    service_title: string;
    product_title: string;
    amount: number;
    paid_at: string;
  }>;
  historyTotal: number;
  historyPage: number;
  historyPageSize: number;
};

function getJakartaMonthKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  return `${year}-${month}`;
}

function shiftMonth(monthKey: string, offset: number) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + offset, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatRupiah(amount: number | null | undefined) {
  const safeAmount = typeof amount === "number" && Number.isFinite(amount)
    ? amount
    : 0;
  return `Rp ${safeAmount.toLocaleString("id-ID")}`;
}

function RevenueDashboard({
  month,
  onMonthChange,
  historyPage,
  onHistoryPageChange,
  data,
  isLoading,
  error,
}: {
  month: string;
  onMonthChange: (month: string) => void;
  historyPage: number;
  onHistoryPageChange: (page: number) => void;
  data: RevenueData | null;
  isLoading: boolean;
  error: string;
}) {
  const chartScrollRef = useRef<HTMLDivElement>(null);
  const monthPickerRef = useRef<HTMLDivElement>(null);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(Number(month.slice(0, 4)));
  useEffect(() => {
    if (!isMonthPickerOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !monthPickerRef.current?.contains(event.target)) {
        setIsMonthPickerOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMonthPickerOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMonthPickerOpen]);
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  const totalsByDay = new Map(
    (data?.dailyTotals ?? []).map((item) => [Number(item.day.slice(-2)), item]),
  );
  const dailyPoints = Array.from({ length: daysInMonth }, (_, index) => ({
    day: index + 1,
    amount: totalsByDay.get(index + 1)?.amount ?? 0,
    orderCount: totalsByDay.get(index + 1)?.orderCount ?? 0,
  }));
  const maxAmount = Math.max(...dailyPoints.map((point) => point.amount), 1);
  const chartWidth = Math.max(760, 82 + (daysInMonth - 1) * 42);
  const chartBounds = { left: 62, right: chartWidth - 62, top: 18, bottom: 194 };
  const chartPoints = dailyPoints.map((point, index) => ({
    ...point,
    x: chartBounds.left + (index / Math.max(dailyPoints.length - 1, 1)) * (chartBounds.right - chartBounds.left),
    y: chartBounds.bottom - (point.amount / maxAmount) * (chartBounds.bottom - chartBounds.top),
  }));
  const linePath = chartPoints.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
  const areaPath = `${linePath} L${chartBounds.right},${chartBounds.bottom} L${chartBounds.left},${chartBounds.bottom} Z`;
  const dayTicks = dailyPoints.map((point) => point.day);
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(`${month}-01T00:00:00+07:00`));
  const currentMonth = getJakartaMonthKey();
  const dailyAverage = data && daysInMonth > 0 ? data.totalRevenue / daysInMonth : 0;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Revenue</h1>
          <p className="mt-1 text-sm text-zinc-400">Confirmed payments by day</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onMonthChange(shiftMonth(month, -1))}
            aria-label="Previous month"
            className="flex size-9 cursor-pointer items-center justify-center rounded-md border border-white/10 text-zinc-300 transition hover:bg-white/5"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <div ref={monthPickerRef} className="relative">
            <button
              type="button"
              aria-label={`Choose revenue month, currently ${monthLabel}`}
              aria-haspopup="dialog"
              aria-expanded={isMonthPickerOpen}
              onClick={() => {
                setPickerYear(year);
                setIsMonthPickerOpen((open) => !open);
              }}
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-[#181818] px-3 text-xs text-zinc-200 transition hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <span>{monthLabel}</span>
              <CalendarDays size={15} className="shrink-0 text-zinc-400" aria-hidden="true" />
            </button>
            {isMonthPickerOpen && (
              <div role="dialog" aria-label="Choose revenue month" className="absolute right-0 z-30 mt-2 w-64 rounded-lg border border-white/10 bg-[#181818] p-3 shadow-xl shadow-black/40">
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    aria-label="Previous year"
                    onClick={() => setPickerYear((selectedYear) => selectedYear - 1)}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-md text-zinc-300 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <ChevronLeft size={16} aria-hidden="true" />
                  </button>
                  <span className="text-sm font-semibold text-white">{pickerYear}</span>
                  <button
                    type="button"
                    aria-label="Next year"
                    disabled={pickerYear >= Number(currentMonth.slice(0, 4))}
                    onClick={() => setPickerYear((selectedYear) => selectedYear + 1)}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-md text-zinc-300 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {Array.from({ length: 12 }, (_, index) => {
                    const monthValue = String(index + 1).padStart(2, "0");
                    const monthKey = `${pickerYear}-${monthValue}`;
                    const label = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" })
                      .format(new Date(Date.UTC(pickerYear, index, 1)));
                    const isSelected = monthKey === month;
                    const isFuture = monthKey > currentMonth;
                    return (
                      <button
                        key={monthValue}
                        type="button"
                        disabled={isFuture}
                        aria-pressed={isSelected}
                        onClick={() => {
                          onMonthChange(monthKey);
                          setIsMonthPickerOpen(false);
                        }}
                        className={`h-9 cursor-pointer rounded-md text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-30 ${isSelected ? "bg-red-500 text-white" : "text-zinc-300 hover:bg-white/10"}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => onMonthChange(shiftMonth(month, 1))}
            aria-label="Next month"
            disabled={month >= currentMonth}
            className="flex size-9 cursor-pointer items-center justify-center rounded-md border border-white/10 text-zinc-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </header>

      {error && (
        <p role="alert" className="rounded-md border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-300">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center gap-2 rounded-lg border border-white/10 text-xs text-zinc-500">
          <LoaderCircle size={15} className="animate-spin" /> Loading revenue...
        </div>
      ) : data ? (
        <>
          <section aria-label="Revenue summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Money In", value: formatRupiah(data.totalRevenue), detail: "Total received" },
              { label: "Paid Orders", value: String(data.paidOrderCount), detail: "Confirmed transactions" },
              { label: "Daily Average", value: formatRupiah(Math.round(dailyAverage)), detail: "Average per day" },
              { label: "All-time Revenue", value: formatRupiah(data.allTimeRevenue), detail: "All paid orders" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
                <p className="text-xs text-zinc-400">{item.label}</p>
                <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
                <p className="mt-1 text-[11px] text-zinc-500">{item.detail}</p>
              </div>
            ))}
          </section>

          <section aria-labelledby="revenue-chart-heading" className="rounded-lg border border-white/10 bg-[#141414] p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 id="revenue-chart-heading" className="text-sm font-semibold">Daily Revenue</h2>
              </div>
            </div>
            <div ref={chartScrollRef} tabIndex={0} aria-label="Daily revenue chart, horizontally scrollable" className="w-full overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <svg role="img" aria-label={`Daily revenue for ${monthLabel}`} viewBox={`0 0 ${chartWidth} 230`} className="h-56 max-w-none" style={{ width: chartWidth }}>
                <defs>
                  <linearGradient id="revenue-area" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.34" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.01" />
                  </linearGradient>
                </defs>
                {[0, 0.5, 1].map((fraction) => {
                  const y = chartBounds.bottom - fraction * (chartBounds.bottom - chartBounds.top);
                  return (
                    <g key={fraction}>
                      <line x1={chartBounds.left} x2={chartBounds.right} y1={y} y2={y} stroke="#ffffff" strokeOpacity="0.08" />
                    </g>
                  );
                })}
                <path d={areaPath} fill="url(#revenue-area)" />
                <path d={linePath} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                {chartPoints.filter((point) => point.amount > 0).map((point) => (
                  <circle key={point.day} cx={point.x} cy={point.y} r="3.5" fill="#fca5a5" stroke="#ef4444" strokeWidth="2">
                    <title>{`${point.day} ${monthLabel}: ${formatRupiah(point.amount)} (${point.orderCount} orders)`}</title>
                  </circle>
                ))}
                {dayTicks.map((day) => {
                  const point = chartPoints[day - 1];
                  return (
                    <text key={day} x={point.x} y="218" textAnchor="middle" fill="#71717a" fontSize="10">
                      {day}
                    </text>
                  );
                })}
              </svg>
            </div>
          </section>

          <section aria-labelledby="revenue-history-heading" className="rounded-lg border border-white/10 bg-[#141414] p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 id="revenue-history-heading" className="text-sm font-semibold">Payment History</h2>
                <p className="mt-1 text-xs text-zinc-500">{monthLabel}</p>
              </div>
            </div>
            {data.history.length === 0 ? (
              <div className="flex min-h-20 items-center justify-center rounded-md border border-dashed border-white/10 text-xs text-zinc-500">
                No paid orders this month.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.07]">
                {data.history.map((item) => (
                  <article key={item.order_id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-300">
                        <Plus size={17} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-zinc-200">{item.service_title} · {item.product_title}</p>
                        <p className="mt-1 text-[11px] text-zinc-600">
                          {new Intl.DateTimeFormat("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "Asia/Jakarta",
                          }).format(new Date(item.paid_at))} WIB
                        </p>
                      </div>
                    </div>
                    <p className="text-right text-sm font-semibold text-white">{formatRupiah(item.amount)}</p>
                  </article>
                ))}
              </div>
            )}
            {data.historyTotal > data.historyPageSize && (
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                <p className="text-xs text-zinc-500">
                  Page {data.historyPage} of {Math.ceil(data.historyTotal / data.historyPageSize)}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onHistoryPageChange(historyPage - 1)}
                    disabled={historyPage <= 1}
                    aria-label="Previous revenue history page"
                    className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-white/10 text-zinc-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onHistoryPageChange(historyPage + 1)}
                    disabled={historyPage >= Math.ceil(data.historyTotal / data.historyPageSize)}
                    aria-label="Next revenue history page"
                    className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-white/10 text-zinc-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeWorkspace, setActiveWorkspace] = useState("Semua layanan");
  const [activeNavId, setActiveNavId] = useState("home");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [logoutError, setLogoutError] = useState("");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [unfinishedOrderCount, setUnfinishedOrderCount] = useState(0);
  const [unfinishedOrdersByService, setUnfinishedOrdersByService] = useState<Record<string, number>>({});
  const [totalOrderCount, setTotalOrderCount] = useState(0);
  const [orderPage, setOrderPage] = useState(1);
  const [ordersRefreshVersion, setOrdersRefreshVersion] = useState(0);
  const [revenueMonth, setRevenueMonth] = useState(getJakartaMonthKey);
  const [revenueHistoryPage, setRevenueHistoryPage] = useState(1);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [isRevenueLoading, setIsRevenueLoading] = useState(false);
  const [revenueError, setRevenueError] = useState("");
  const [ordersError, setOrdersError] = useState("");
  const [confirmation, setConfirmation] = useState<{
    title?: string;
    message: string;
    description?: string;
    cancelLabel?: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);
  const [proofPreview, setProofPreview] = useState<{ orderId: string; url: string } | null>(null);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const [ordersSearch, setOrdersSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");

  const activeId = activeNavId;
  const activeTitle = flatNavItems.find((item) => item.id === activeId)?.title ?? "Ringkasan";
  const searchResults = services.filter((service) =>
    `${service.title} ${service.category}`
      .toLowerCase()
      .includes(searchValue.trim().toLowerCase()),
  );
  const orderServiceOptions = [...new Set(
    services
      .map((service) => serviceOrderTitles[service.id])
      .filter((title): title is string => Boolean(title)),
  )].sort((left, right) => left.localeCompare(right, "id"));
  const summaryOrders = orders;
  const pageCount = Math.max(1, Math.ceil(totalOrderCount / ORDER_PAGE_SIZE));
  const hasActiveOrderFilters = Boolean(
    ordersSearch.trim() ||
    serviceFilter !== "all" ||
    paymentFilter !== "all" ||
    accountFilter !== "all" ||
    activeWorkspace !== "Semua layanan",
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
      if (event.key === "Escape") {
        setIsSearchOpen(false);
        setConfirmation(null);
        setProofPreview(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isSearchOpen && !confirmation && !proofPreview) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
    };
  }, [confirmation, isSearchOpen, proofPreview]);

  useEffect(() => {
    let isCancelled = false;

    async function loadAdminEmail() {
      try {
        const response = await fetch("/api/admin/auth", { cache: "no-store" });
        const result = (await response.json().catch(() => ({}))) as { email?: string };
        if (response.ok && !isCancelled) setAdminEmail(result.email ?? "");
      } catch {
        if (!isCancelled) setAdminEmail("");
      }
    }

    void loadAdminEmail();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsOrdersLoading(true);
      setOrdersError("");

      const searchParams = new URLSearchParams({
        page: String(orderPage),
        workspace: activeWorkspace,
        service: serviceFilter,
        paymentStatus: paymentFilter,
        accountStatus: accountFilter,
        search: ordersSearch,
      });

      try {
        const response = await fetch(`/api/admin/orders?${searchParams}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const result = (await response.json().catch(() => ({}))) as {
          orders?: AdminOrder[];
          total?: number;
          error?: string;
        };
        if (!response.ok) throw new Error(result.error ?? "Order belum dapat dimuat.");
        if (!isCancelled) {
          const total = result.total ?? 0;
          const lastPage = Math.max(1, Math.ceil(total / ORDER_PAGE_SIZE));
          if (orderPage > lastPage) {
            setOrderPage(lastPage);
            return;
          }
          setOrders(result.orders ?? []);
          setTotalOrderCount(total);
        }
      } catch (error) {
        if (!isCancelled) {
          setOrdersError(error instanceof Error ? error.message : "Order belum dapat dimuat.");
        }
      } finally {
        if (!isCancelled) setIsOrdersLoading(false);
      }
    }, ordersSearch ? 250 : 0);

    return () => {
      isCancelled = true;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [accountFilter, activeWorkspace, orderPage, ordersRefreshVersion, ordersSearch, paymentFilter, serviceFilter]);

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    async function loadUnfinishedOrderCounts() {
      try {
        const response = await fetch("/api/admin/orders?summary=true", {
          cache: "no-store",
          signal: controller.signal,
        });
        const result = (await response.json().catch(() => ({}))) as {
          unfinishedOrderCount?: number;
          unfinishedOrdersByService?: Record<string, number>;
          error?: string;
        };
        if (!response.ok) {
          throw new Error(result.error ?? "Ringkasan order belum dapat dimuat.");
        }
        if (!isCancelled) {
          setUnfinishedOrderCount(result.unfinishedOrderCount ?? 0);
          setUnfinishedOrdersByService(result.unfinishedOrdersByService ?? {});
        }
      } catch (error) {
        if (!isCancelled && !controller.signal.aborted) {
          setOrdersError(error instanceof Error ? error.message : "Ringkasan order belum dapat dimuat.");
        }
      }
    }

    void loadUnfinishedOrderCounts();
    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [ordersRefreshVersion]);

  useEffect(() => {
    if (activeNavId !== "revenue") return;

    let isCancelled = false;
    const controller = new AbortController();

    async function loadRevenue() {
      try {
        const searchParams = new URLSearchParams({
          revenueMonth,
          historyPage: String(revenueHistoryPage),
        });
        const response = await fetch(`/api/admin/orders?${searchParams}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const result = (await response.json().catch(() => ({}))) as RevenueData & {
          error?: string;
        };
        if (!response.ok) throw new Error(result.error ?? "Revenue belum dapat dimuat.");
        if (!isCancelled) setRevenueData(result);
      } catch (error) {
        if (!isCancelled && !controller.signal.aborted) {
          setRevenueError(error instanceof Error ? error.message : "Revenue belum dapat dimuat.");
        }
      } finally {
        if (!isCancelled) setIsRevenueLoading(false);
      }
    }

    void loadRevenue();
    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [activeNavId, ordersRefreshVersion, revenueHistoryPage, revenueMonth]);

  const resetOrderFilters = () => {
    setOrdersSearch("");
    setPaymentFilter("all");
    setAccountFilter("all");
    setOrderPage(1);
  };

  const handleWorkspaceSelect = (workspace: string) => {
    setActiveWorkspace(workspace);
    setActiveNavId("home");
    setServiceFilter("all");
    resetOrderFilters();
  };

  const openService = (serviceId: string) => {
    const service = services.find((item) => item.id === serviceId);
    const serviceTitle = serviceOrderTitles[serviceId];
    if (!service || !serviceTitle) return;

    setActiveNavId(service.id);
    setActiveWorkspace(service.category);
    setServiceFilter(serviceTitle);
    resetOrderFilters();
    setIsSearchOpen(false);
    setSearchValue("");
  };

  const handleSelect = (item: NavItemData) => {
    if (item.id === "search") {
      setIsSearchOpen(true);
      return;
    }
    if (item.id === "revenue") {
      setActiveNavId("revenue");
      setIsRevenueLoading(true);
      setRevenueError("");
      return;
    }
    if (item.id === "home") {
      setActiveNavId("home");
      setActiveWorkspace("Semua layanan");
      setServiceFilter("all");
      resetOrderFilters();
      return;
    }
    openService(item.id);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setLogoutError("");

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      if (!response.ok) throw new Error("Sesi tidak dapat diakhiri.");
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setLogoutError("Logout gagal. Coba lagi.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const requestLogout = () => {
    setConfirmation({
      title: "Log out?",
      message: `Signed in as ${adminEmail || "admin"}`,
      description: "You'll need to sign in again to keep using Kakaajoki Admin",
      cancelLabel: "Cancel",
      confirmLabel: "Log out",
      onConfirm: () => void handleLogout(),
    });
  };

  const openProofPreview = async (order: AdminOrder) => {
    setOrdersError("");
    try {
      const response = await fetch(
        `/api/admin/orders?proofOrderId=${encodeURIComponent(order.order_id)}`,
        { cache: "no-store" },
      );
      const result = (await response.json().catch(() => ({}))) as {
        proofUrl?: string;
        error?: string;
      };
      if (!response.ok || !result.proofUrl) {
        throw new Error(result.error ?? "Payment proof could not be loaded.");
      }
      setProofPreview({ orderId: order.order_id, url: result.proofUrl });
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : "Payment proof could not be loaded.");
    }
  };

  const requestPaymentStatusUpdate = (
    orderId: string,
    status: AdminOrder["payment_status"],
  ) => {
    const statusLabel = status === "pending_review"
      ? "Pending review"
      : status === "paid"
        ? "Paid"
        : "Rejected";
    setConfirmation({
      title: "Update payment status?",
      message: `Order ID: ${orderId}`,
      description: `Payment status will be changed to ${statusLabel}.`,
      cancelLabel: "Cancel",
      confirmLabel: "Update status",
      onConfirm: () => void updateOrderStatus(orderId, "payment_status", status),
    });
  };

  const updateOrderStatus = async (
    orderId: string,
    field: "payment_status" | "account_status",
    status: AdminOrder["payment_status"] | NonNullable<AdminOrder["account_status"]>,
  ) => {
    setUpdatingOrderId(orderId);
    setOrdersError("");
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, field, status }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        order?: {
          order_id: string;
          payment_status: AdminOrder["payment_status"];
          account_status: AdminOrder["account_status"];
        };
        error?: string;
      };
      if (!response.ok || !result.order) {
        throw new Error(result.error ?? "Status order belum dapat diperbarui.");
      }
      setOrdersRefreshVersion((version) => version + 1);
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : "Status order belum dapat diperbarui.");
    } finally {
      setUpdatingOrderId("");
    }
  };

  const summaryItems = [
    {
      label: "Total Orders",
      value: String(totalOrderCount),
      detail: "Overall",
      icon: Package,
    },
    {
      label: "Needs Verification",
      value: String(summaryOrders.filter((order) => order.payment_status === "pending_review").length),
      detail: "Pending",
      icon: CreditCard,
    },
    {
      label: "In Progress",
      value: String(summaryOrders.filter((order) => order.payment_status === "paid" && order.account_status !== "completed").length),
      detail: "Active",
      icon: Activity,
    },
    {
      label: "Completed",
      value: String(summaryOrders.filter((order) => order.payment_status === "paid" && order.account_status === "completed").length),
      detail: "Finished",
      icon: Check,
    },
  ];

  return (
    <main
      data-hide-floating-cs
      className="flex min-h-screen w-full items-center justify-center bg-[#080808] p-3 text-white sm:p-6"
    >
      <div className="relative flex h-[min(760px,calc(100dvh-1.5rem))] min-h-[620px] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-white/10 bg-[#111111] shadow-sm ring-1 ring-white/[0.03] md:h-[700px] md:min-h-0 md:flex-row">
        <div
          className={`shrink-0 overflow-hidden transition-all duration-300 ease-in-out md:h-full ${
            isSidebarOpen
              ? "h-[250px] max-h-[250px] opacity-100 md:w-[260px] md:max-h-none"
              : "h-0 max-h-0 opacity-0 md:w-0 md:max-h-none"
          }`}
        >
          <SidebarNav
            activeId={activeId}
            onSelect={handleSelect}
            unfinishedOrderCount={unfinishedOrderCount}
            unfinishedOrdersByService={unfinishedOrdersByService}
            activeWorkspace={activeWorkspace}
            onWorkspaceSelect={handleWorkspaceSelect}
            onLogout={requestLogout}
            isLoggingOut={isLoggingOut}
            logoutError={logoutError}
          />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white/[0.015]">
          <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#141414] px-3 sm:px-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label={isSidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
                onClick={() => setIsSidebarOpen((open) => !open)}
                className="cursor-pointer rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                {isSidebarOpen ? <PanelLeftClose size={18} strokeWidth={1.5} /> : <PanelLeftOpen size={18} strokeWidth={1.5} />}
              </button>
              <div className="flex min-w-0 items-center gap-2 text-sm text-zinc-500">
                <span className="truncate">Kakaajoki</span>
                <span aria-hidden="true">/</span>
                <span className="truncate font-medium text-zinc-200">{activeTitle}</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Cari layanan"
                className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-white/10 px-2 text-xs text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200 sm:w-48 sm:justify-start sm:px-2.5"
              >
                <Search size={15} strokeWidth={1.5} />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="ml-auto hidden rounded border border-white/10 px-1 font-mono text-[10px] text-zinc-600 sm:inline">
                  Ctrl K
                </kbd>
              </button>
              <span aria-label="Administrator" className="flex size-8 items-center justify-center overflow-hidden rounded-full border border-red-500/20 bg-[#151515]">
                <Image src="/home/logo.png?v=3" alt="Kakaajoki" width={32} height={32} className="size-full object-contain" />
              </span>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:p-6 md:p-8">
            {activeNavId === "revenue" ? (
              <RevenueDashboard
                month={revenueMonth}
                onMonthChange={(month) => {
                  setRevenueMonth(month);
                  setRevenueHistoryPage(1);
                  setIsRevenueLoading(true);
                  setRevenueError("");
                }}
                historyPage={revenueHistoryPage}
                onHistoryPageChange={(page) => {
                  setRevenueHistoryPage(page);
                  setIsRevenueLoading(true);
                }}
                data={revenueData}
                isLoading={isRevenueLoading}
                error={revenueError}
              />
            ) : (
              <>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold">Order Operations</h1>
                <p className="mt-1 text-sm text-zinc-400">
                  Manage payments and account progress
                </p>
              </div>
            </div>

            <section aria-label="Ringkasan layanan" className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {summaryItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex min-h-28 items-start justify-between rounded-lg border border-white/10 bg-white/[0.025] p-4"
                    >
                      <div>
                        <p className="text-xs text-zinc-400">{item.label}</p>
                        <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
                        <p className="mt-1 text-[11px] text-zinc-500">{item.detail}</p>
                      </div>
                      <Icon size={17} className="text-zinc-500" aria-hidden="true" />
                    </div>
                  );
                })}
            </section>

            <section aria-labelledby="orders-heading" className="mb-6 rounded-lg border border-white/10 bg-[#141414] p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 id="orders-heading" className="text-sm font-semibold">Incoming orders</h2>
                </div>
              </div>

              <div className="mb-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <label className="relative block sm:col-span-2 xl:col-span-1">
                  <span className="sr-only">Cari order</span>
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="search"
                    value={ordersSearch}
                    onChange={(event) => {
                      setOrdersSearch(event.currentTarget.value);
                      setOrderPage(1);
                    }}
                    placeholder="Search..."
                    className="h-9 w-full rounded-md border border-white/10 bg-white/[0.03] pl-9 pr-3 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-red-500"
                  />
                </label>
                <label>
                  <span className="sr-only">Filter layanan</span>
                  <select
                    value={serviceFilter}
                    onChange={(event) => {
                      const nextServiceFilter = event.currentTarget.value;
                      const matchingService = services.find(
                        (service) => serviceOrderTitles[service.id] === nextServiceFilter,
                      );
                      setServiceFilter(nextServiceFilter);
                      setActiveNavId(matchingService?.id ?? "home");
                      setActiveWorkspace(matchingService?.category ?? "Semua layanan");
                      setOrderPage(1);
                    }}
                    className="h-9 w-full cursor-pointer rounded-md border border-white/10 bg-[#181818] px-3 text-xs text-zinc-300 outline-none focus:border-red-500"
                  >
                    <option value="all">All Services</option>
                    {orderServiceOptions.map((serviceTitle) => (
                      <option key={serviceTitle} value={serviceTitle}>{serviceTitle}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="sr-only">Filter payment</span>
                  <select
                    value={paymentFilter}
                    onChange={(event) => {
                      setPaymentFilter(event.currentTarget.value);
                      setOrderPage(1);
                    }}
                    className="h-9 w-full cursor-pointer rounded-md border border-white/10 bg-[#181818] px-3 text-xs text-zinc-300 outline-none focus:border-red-500"
                  >
                    <option value="all">All Payment</option>
                    <option value="pending_review">Menunggu verifikasi</option>
                    <option value="paid">Paid</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </label>
                <label>
                  <span className="sr-only">Filter status akun</span>
                  <select
                    value={accountFilter}
                    onChange={(event) => {
                      setAccountFilter(event.currentTarget.value);
                      setOrderPage(1);
                    }}
                    className="h-9 w-full cursor-pointer rounded-md border border-white/10 bg-[#181818] px-3 text-xs text-zinc-300 outline-none focus:border-red-500"
                  >
                    <option value="all">All Account Statuses</option>
                    <option value="inactive">Belum aktif</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Proses</option>
                    <option value="completed">Selesai</option>
                  </select>
                </label>
              </div>

              {ordersError && (
                <p role="alert" className="mb-3 rounded-md border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-300">
                  {ordersError}
                </p>
              )}

              {isOrdersLoading ? (
                <div className="flex min-h-24 items-center justify-center gap-2 text-xs text-zinc-500">
                  <LoaderCircle size={15} className="animate-spin" /> Memuat order...
                </div>
              ) : totalOrderCount === 0 ? (
                <div className="flex min-h-20 items-center justify-center rounded-md border border-dashed border-white/10 text-xs text-zinc-500">
                  {hasActiveOrderFilters ? "Tidak ada order yang cocok dengan filter." : "Belum ada order masuk."}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {orders.map((order) => {
                    const isUpdating = updatingOrderId === order.order_id;
                    const statusLabel = order.payment_status === "paid"
                            ? "Paid"
                      : order.payment_status === "rejected"
                        ? "Ditolak"
                        : "Menunggu verifikasi";

                    return (
                      <article key={order.order_id} className="rounded-md border border-white/[0.08] bg-white/[0.02] p-3 sm:p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="break-all font-mono text-xs font-semibold text-white">{order.order_id}</p>
                            <p className="mt-1 text-xs font-medium text-zinc-200">{order.service_title} · {order.product_title}</p>
                          </div>
                          <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            order.payment_status === "paid"
                              ? "bg-emerald-400/10 text-emerald-300"
                              : order.payment_status === "rejected"
                                ? "bg-red-400/10 text-red-300"
                                : "bg-amber-300/10 text-amber-200"
                          }`}>
                            {order.payment_status === "paid" ? <Check size={12} /> : order.payment_status === "rejected" ? <XCircle size={12} /> : <Clock3 size={12} />}
                            {statusLabel}
                          </span>
                        </div>

                        <dl className="mt-3 grid gap-x-5 gap-y-2 border-t border-white/[0.08] pt-3 text-xs sm:grid-cols-2">
                          <div className="flex justify-between gap-3"><dt className="text-zinc-500">Jumlah / total</dt><dd className="text-right text-zinc-200">{order.quantity}x · {formatRupiah(order.amount)}</dd></div>
                          <div className="flex justify-between gap-3"><dt className="text-zinc-500">Kontak</dt><dd className="text-right text-zinc-200">{order.contact_phone}</dd></div>
                          <div className="flex justify-between gap-3"><dt className="text-zinc-500">Waktu</dt><dd className="text-right text-zinc-200">{new Date(order.created_at).toLocaleString("id-ID")}</dd></div>
                          {Object.entries(order.account_data ?? {}).map(([label, value]) => (
                            <div key={label} className="flex justify-between gap-3"><dt className="text-zinc-500">{label}</dt><dd className="min-w-0 break-words text-right text-zinc-200">{value}</dd></div>
                          ))}
                        </dl>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Status akun</p>
                            {order.payment_status === "paid" ? (
                              <p className="mt-1 text-xs font-medium text-zinc-200">
                                {order.account_status === "completed"
                                  ? "Selesai"
                                  : order.account_status === "processing"
                                    ? "Proses"
                                    : "Pending"}
                              </p>
                            ) : (
                              <p className="mt-1 text-xs text-zinc-500">Aktif setelah payment paid</p>
                            )}
                          </div>
                          {order.payment_status === "paid" && (
                            <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Status akun ${order.order_id}`}>
                              {([
                                ["pending", "Pending"],
                                ["processing", "Proses"],
                                ["completed", "Selesai"],
                              ] as const).map(([status, label]) => (
                                <button
                                  key={status}
                                  type="button"
                                  disabled={isUpdating}
                                  aria-pressed={order.account_status === status}
                                  onClick={() => void updateOrderStatus(order.order_id, "account_status", status)}
                                  className={`min-h-8 cursor-pointer rounded-md px-2.5 text-[10px] font-semibold transition disabled:cursor-wait disabled:opacity-50 ${
                                    order.account_status === status
                                      ? "bg-red-500/15 text-red-300 ring-1 ring-red-500/30"
                                      : "border border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white"
                                  }`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.08] pt-3">
                          <div className="flex flex-wrap gap-2">
                            {order.has_proof ? (
                              <button
                                type="button"
                                onClick={() => void openProofPreview(order)}
                                className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-white/10 px-3 text-xs font-medium text-zinc-200 transition hover:bg-white/5"
                              >
                                <ExternalLink size={14} /> Payment Proof
                              </button>
                            ) : (
                              <span className="inline-flex h-9 items-center text-xs text-red-300">Proof unavailable.</span>
                            )}
                          </div>
                          <label className="flex items-center gap-2 text-[10px] text-zinc-500">
                            Payment
                            <select
                              aria-label={`Payment status ${order.order_id}`}
                              value={order.payment_status}
                              disabled={isUpdating}
                              onChange={(event) => {
                                const nextStatus = event.currentTarget.value as AdminOrder["payment_status"];
                                if (nextStatus !== order.payment_status) {
                                  requestPaymentStatusUpdate(order.order_id, nextStatus);
                                }
                              }}
                              className="h-9 cursor-pointer rounded-md border border-white/10 bg-[#181818] px-2.5 text-xs text-zinc-200 outline-none focus:border-red-500 disabled:cursor-wait disabled:opacity-50"
                            >
                              <option value="pending_review">Menunggu verifikasi</option>
                              <option value="paid">Paid</option>
                              <option value="rejected">Ditolak</option>
                            </select>
                          </label>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {pageCount > 1 && !isOrdersLoading && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <p className="text-xs text-zinc-500">
                    Menampilkan {(orderPage - 1) * ORDER_PAGE_SIZE + 1}-
                    {Math.min(orderPage * ORDER_PAGE_SIZE, totalOrderCount)} dari {totalOrderCount} order
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderPage((page) => Math.max(1, page - 1))}
                      disabled={orderPage <= 1}
                      aria-label="Halaman sebelumnya"
                      className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-white/10 text-zinc-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={16} aria-hidden="true" />
                    </button>
                    <span className="min-w-24 text-center text-xs text-zinc-400">
                      Halaman {orderPage} dari {pageCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOrderPage((page) => Math.min(pageCount, page + 1))}
                      disabled={orderPage >= pageCount}
                      aria-label="Halaman berikutnya"
                      className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-white/10 text-zinc-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}
            </section>
              </>
            )}
          </div>
        </div>

        {isSearchOpen && (
          <div className="absolute inset-0 z-50 flex items-start justify-center bg-black/55 px-4 pt-[12vh] backdrop-blur-sm">
            <button
              type="button"
              aria-label="Tutup pencarian"
              className="absolute inset-0 cursor-pointer"
              onClick={() => setIsSearchOpen(false)}
            />
            <section role="dialog" aria-modal="true" aria-label="Cari layanan" className="relative w-full max-w-xl overflow-hidden rounded-xl border border-white/10 bg-[#161616] shadow-2xl">
              <div className="flex items-center border-b border-white/10 px-4">
                <Search className="mr-3 size-[18px] shrink-0 text-zinc-500" strokeWidth={1.5} aria-hidden="true" />
                <input
                  autoFocus
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  className="flex-1 bg-transparent py-4 text-sm text-white outline-none placeholder:text-zinc-600"
                  placeholder="Cari layanan game..."
                />
                <button type="button" onClick={() => setIsSearchOpen(false)} className="ml-3 cursor-pointer rounded-md p-1 text-zinc-500 transition hover:bg-white/5 hover:text-white" aria-label="Tutup pencarian">
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {searchResults.length ? searchResults.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => openService(service.id)}
                    className="flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-left transition hover:bg-white/5"
                  >
                    <span>
                      <span className="block text-sm text-zinc-200">{service.title}</span>
                      <span className="mt-0.5 block text-[11px] text-zinc-500">{service.category}</span>
                    </span>
                    <ChevronRight size={14} className="text-zinc-500" />
                  </button>
                )) : (
                  <p className="px-3 py-8 text-center text-sm text-zinc-500">
                    Layanan tidak ditemukan.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 border-t border-white/10 px-4 py-2.5 text-[10px] text-zinc-600">
                <Search size={13} aria-hidden="true" />
                Pilih layanan untuk menampilkan order terkait
              </div>
            </section>
          </div>
        )}

        <AnimatePresence>
          {confirmation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 py-4 backdrop-blur-sm"
            >
              <button
                type="button"
                aria-label="Tutup konfirmasi"
                className="absolute inset-0 cursor-pointer"
                onClick={() => setConfirmation(null)}
              />
              <motion.section
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={confirmation.title ? "admin-confirmation-title" : "admin-confirmation-message"}
                initial={{ opacity: 0, y: -14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.75 }}
                className="relative z-10 flex w-full max-w-md items-start gap-3 rounded-xl bg-white p-4 text-zinc-700 shadow-2xl"
              >
                {!confirmation.title && (
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
                    <CircleAlert size={15} strokeWidth={2.5} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  {confirmation.title && (
                    <div className="flex items-center justify-between gap-3">
                      <h2 id="admin-confirmation-title" className="text-base font-semibold text-zinc-900">
                        {confirmation.title}
                      </h2>
                      <button
                        type="button"
                        aria-label="Tutup konfirmasi"
                        onClick={() => setConfirmation(null)}
                        className="-mr-1 -mt-1 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
                      >
                        <X size={17} />
                      </button>
                    </div>
                  )}
                  <p
                    id="admin-confirmation-message"
                    className={confirmation.title ? "mt-2 text-sm text-zinc-500" : "text-sm font-medium"}
                  >
                    {confirmation.message}
                  </p>
                  {confirmation.description && (
                    <p className="mt-3 text-sm font-medium leading-5 text-zinc-800">
                      {confirmation.description}
                    </p>
                  )}
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmation(null)}
                      className="min-h-8 cursor-pointer rounded-md px-3 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100"
                    >
                      {confirmation.cancelLabel ?? "Batal"}
                    </button>
                    <button
                      type="button"
                      disabled={isLoggingOut}
                      onClick={() => {
                        const confirmAction = confirmation.onConfirm;
                        setConfirmation(null);
                        confirmAction();
                      }}
                      className="min-h-8 cursor-pointer rounded-md bg-red-500 px-3 text-xs font-semibold text-white transition hover:bg-red-600 disabled:cursor-wait disabled:opacity-60"
                    >
                      {confirmation.confirmLabel}
                    </button>
                  </div>
                </div>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {proofPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[70] flex cursor-pointer items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
              onClick={(event) => {
                if (event.target === event.currentTarget) setProofPreview(null);
              }}
            >
              <motion.section
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-proof-preview-title"
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                className="flex max-h-[calc(100%-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-white/10 bg-[#151515] shadow-2xl"
              >
                <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
                  <h2 id="admin-proof-preview-title" className="min-w-0 truncate text-sm font-semibold text-white">
                    Payment Proof · {proofPreview.orderId}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setProofPreview(null)}
                      aria-label="Close payment proof"
                    className="ml-3 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-400 transition hover:bg-white/10 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </header>
                <div className="relative h-[min(70dvh,32rem)] w-full">
                  <Image
                    src={proofPreview.url}
                    alt={`Payment proof for order ${proofPreview.orderId}`}
                    fill
                    unoptimized
                    className="object-contain p-3"
                  />
                </div>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
