import Link from "next/link";
import { type Product, discountPct } from "@/lib/products";
import { SITE, usd } from "@/lib/site";
import WishlistButton from "./WishlistButton";
import AddToCartButton from "./AddToCartButton";
import SmartImage from "./SmartImage";

function compactCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0) + "k";
  return String(n);
}

export default function ProductCard({ product, wishlistSaved }: { product: Product; wishlistSaved?: boolean }) {
  const off = discountPct(product);

  return (
    <div className="group relative flex flex-col bg-white transition-shadow duration-200 hover:shadow-[0_6px_20px_rgba(11,29,63,0.15)]">
      <div className="relative overflow-hidden">
        <Link href={`/product/${product.slug}`} aria-label={product.name}>
          <SmartImage
            src={product.image}
            alt={product.name}
            className="aspect-[3/4] w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </Link>

        {product.badge && (
          <span className="absolute left-0 top-2 bg-navy px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-gold">
            {product.badge}
          </span>
        )}

        <WishlistButton
          slug={product.slug}
          initialSaved={wishlistSaved}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-ink opacity-0 shadow transition hover:text-sale group-hover:opacity-100"
        />

        {/* Rating pill (Myntra style) */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-white/95 px-1.5 py-0.5 text-[11px] font-bold text-ink shadow-sm">
          <span>{product.rating.toFixed(1)}</span>
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="#c2a14d" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="text-neutral-300">|</span>
          <span className="font-medium text-neutral-500">{compactCount(product.reviews)}</span>
        </div>

        {/* Add to bag — slides up on hover (Myntra reveal) */}
        <AddToCartButton
          item={{ slug: product.slug, name: product.name, price: product.price, image: product.image }}
          className="absolute inset-x-0 bottom-0 translate-y-full bg-navy py-2.5 text-xs font-bold uppercase tracking-wide text-gold transition-transform duration-200 group-hover:translate-y-0 disabled:bg-neutral-300 disabled:text-white"
        />
      </div>

      <div className="flex flex-1 flex-col px-2 py-2.5">
        <p className="truncate text-sm font-bold text-ink">{product.brand || SITE.name}</p>
        <Link href={`/product/${product.slug}`} className="truncate text-[13px] text-neutral-500 hover:text-gold-dark">
          {product.name}
        </Link>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-sm font-bold text-ink">{usd(product.price)}</span>
          {product.mrp && product.mrp > product.price && (
            <span className="text-xs text-neutral-400 line-through">{usd(product.mrp)}</span>
          )}
          {off && <span className="text-xs font-bold text-gold-dark">({off}% OFF)</span>}
        </div>
      </div>
    </div>
  );
}
