import Link from "next/link";
import MegaMenu, { type MegaCol } from "./MegaMenu";

const SAREE_COLS: MegaCol[] = [
  { title: "Roots", items: ["Banarasi", "Kanchipuram Silk", "Paithani", "Patola", "Bengali", "Ikat", "Bandhani"] },
  { title: "Fabric", items: ["Chiffon", "Georgette", "Cotton", "Pure Silk", "Satin", "Linen Sarees", "Net", "Organza Sarees", "Tissue Sarees", "Art Silk"] },
  { title: "Occasion", items: ["Party Wear", "Wedding", "Festive", "Casual", "Cocktail Sarees"] },
  { title: "Work", items: ["Embroidered", "Printed", "Handloom Sarees", "Chikankari", "Kalamkari", "Plain", "Sequins"] },
];

const LEHENGA_COLS: MegaCol[] = [
  { title: "Occasion", items: ["Bridal Wear", "Festival Wear", "Party Wear", "Wedding Wear"], all: "All Occasions" },
  { title: "Style", items: ["Circular Style", "A-Line Lehenga", "Indowestern Lehenga"], all: "All Styles" },
  { title: "Fabric", items: ["Art Silk Lehenga", "Net Lehenga", "Georgette Lehenga", "Velvet Lehenga", "Silk Lehenga"], all: "All Fabrics" },
];

const SALWAR_COLS: MegaCol[] = [
  { title: "Occasion", items: ["Festive Wear", "Party Wear", "Wedding Wear", "Casual Wear", "Bollywood Wear"], all: "All Occasions" },
  { title: "Style", items: ["Anarkali Style", "Straight Style", "Abaya Style", "A-Line Suits", "Pakistani Style", "Punjabi Style"], all: "All Styles" },
  { title: "Fabric", items: ["Chanderi Suits", "Georgette Suits", "Cotton Suits", "Net Suits", "Art Silk Suits"], all: "All Fabrics" },
];

type Item =
  | { href: string; label: string; accent?: boolean }
  | { mega: { label: string; href: string; cols: MegaCol[]; align?: "left" | "right" } };

const NAV: Item[] = [
  { href: "/category/sale", label: "Sale", accent: true },
  { href: "/category/new", label: "New" },
  { href: "/category/women", label: "Women" },
  { href: "/category/men", label: "Men" },
  { mega: { label: "Sarees", href: "/category/sarees", cols: SAREE_COLS } },
  { mega: { label: "Lehengas", href: "/category/lehengas", cols: LEHENGA_COLS } },
  { mega: { label: "Suits", href: "/category/kurtas", cols: SALWAR_COLS, align: "right" } },
  // "Kids" and "Jewellery" temporarily disabled on RRcollections (2026-06-25).
];

// Myntra-style top-level nav item: bold uppercase with a gold underline on hover.
const itemBase =
  "flex h-full items-center whitespace-nowrap border-b-[3px] border-transparent text-[13px] font-bold uppercase tracking-wide text-ink transition-colors hover:border-gold hover:text-gold-dark";
const accentBase =
  "flex h-full items-center whitespace-nowrap border-b-[3px] border-transparent text-[13px] font-bold uppercase tracking-wide text-sale transition-colors hover:border-sale";

function itemHref(i: Item): string {
  return "mega" in i ? i.mega.href : i.href;
}

/** Desktop primary navigation — rendered inline inside the header (Myntra layout). */
export function MainNav({ className = "" }: { className?: string }) {
  return (
    <ul className={className}>
      {NAV.map((i, idx) => (
        <li key={idx} className="flex">
          {"mega" in i ? (
            <MegaMenu label={i.mega.label} href={i.mega.href} cols={i.mega.cols} align={i.mega.align} triggerClassName={itemBase} />
          ) : (
            <Link href={i.href} className={i.accent ? accentBase : itemBase}>
              {i.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Mobile scrollable category bar (shown only below lg, where MainNav is hidden). */
export default function CategoryNav() {
  return (
    <nav className="border-b border-neutral-200 bg-white lg:hidden">
      <div className="mx-auto max-w-7xl px-4">
        <ul className="no-scrollbar flex items-center gap-5 overflow-x-auto py-2.5 text-[13px] font-bold uppercase tracking-wide">
          {NAV.map((i, idx) => {
            const accent = !("mega" in i) && i.accent;
            return (
              <li key={idx} className="whitespace-nowrap">
                <Link href={itemHref(i)} className={accent ? "text-sale" : "text-ink hover:text-gold-dark"}>
                  {"mega" in i ? i.mega.label : i.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
