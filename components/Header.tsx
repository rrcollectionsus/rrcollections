import Link from "next/link";
import { SITE, waLink } from "@/lib/site";
import { SearchIcon, HeartIcon, UserIcon, WhatsAppIcon } from "./icons";
import Logo from "./Logo";
import { MainNav } from "./CategoryNav";
import CartIcon from "./CartIcon";

const actionClass =
  "flex flex-col items-center gap-0.5 text-[11px] font-semibold text-ink hover:text-gold-dark";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 lg:h-[4.5rem] lg:gap-7">
        {/* Logo */}
        <Logo />

        {/* Primary nav (desktop, inline — Myntra layout) */}
        <MainNav className="hidden h-full items-stretch gap-5 lg:flex xl:gap-7" />

        {/* Search (tablet/desktop) */}
        <form action="/search" className="ml-auto hidden w-40 md:block lg:w-56 xl:w-72">
          <div className="flex items-center rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 focus-within:border-gold focus-within:bg-white">
            <SearchIcon className="h-5 w-5 shrink-0 text-neutral-500" />
            <input
              type="search"
              name="q"
              placeholder="Search for sarees, lehengas…"
              className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-neutral-500"
              aria-label="Search products"
            />
          </div>
        </form>

        {/* Account actions */}
        <div className="ml-auto flex items-center gap-5 md:ml-4 md:gap-6">
          <Link href="/login" className={actionClass}>
            <UserIcon className="h-6 w-6" />
            Profile
          </Link>
          <Link href="/wishlist" className={actionClass}>
            <HeartIcon className="h-6 w-6" />
            Wishlist
          </Link>
          <CartIcon />
          <a
            href={waLink(`Hi ${SITE.name}!`)}
            target="_blank"
            rel="noopener noreferrer"
            className={actionClass}
          >
            <WhatsAppIcon className="h-6 w-6" />
            WhatsApp
          </a>
        </div>
      </div>

      {/* Search (mobile) */}
      <form action="/search" className="px-4 pb-3 md:hidden">
        <div className="flex items-center rounded-md border border-neutral-300 bg-neutral-50 px-4 py-2.5">
          <SearchIcon className="h-5 w-5 shrink-0 text-neutral-500" />
          <input
            type="search"
            name="q"
            placeholder="Search for sarees, lehengas…"
            className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-neutral-500"
            aria-label="Search products"
          />
        </div>
      </form>
    </header>
  );
}
