export default function Divider({ label = "or use email" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 border-t border-zinc-200" />
      <span className="text-[13px] font-semibold text-zinc-400">{label}</span>
      <div className="flex-1 border-t border-zinc-200" />
    </div>
  );
}
