export function ShopFrame({ children }: { children: React.ReactNode }) {
  return <div data-shop-frame className="fixed inset-x-0 bottom-0 top-[76px] z-10 overflow-y-auto overscroll-contain bg-white lg:left-[272px]">{children}</div>;
}

export default function ShopLoading() {
  return <ShopFrame>
    <div role="status" aria-label="Loading shop" className="mx-auto w-full max-w-[1180px] px-4 py-5 sm:p-8">
      <span className="sr-only">Loading your shop</span>
      <div className="h-36 rounded-[28px] bg-orange-50" />
      <div className="mt-6 grid min-h-[420px] grid-cols-1 overflow-hidden rounded-[28px] border border-violet-100 sm:grid-cols-2">
        <div className="bg-violet-50" /><div className="bg-zinc-50" />
      </div>
      <div className="mt-7 h-10 w-56 rounded-xl bg-zinc-100" />
    </div>
  </ShopFrame>;
}
