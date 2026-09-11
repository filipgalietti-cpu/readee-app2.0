/** A quiet, full-screen transition while account and reader routing resolve. */
export default function ReaderLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex min-h-dvh flex-col items-center justify-center bg-[#faf8ff] px-6 text-center"
      data-reader-loading
    >
      <img
        src="/images/ui/bunny-reading.png"
        alt=""
        width={240}
        height={240}
        className="h-48 w-48 object-contain sm:h-60 sm:w-60"
      />
      <p className="mt-6 text-2xl font-semibold text-violet-900">Getting Readee ready</p>
    </div>
  );
}
