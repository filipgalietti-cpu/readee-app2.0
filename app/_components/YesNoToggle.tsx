"use client";

/**
 * Binary yes/no toggle for assignment settings. Replaces checkboxes
 * because teachers strongly prefer "yes / no" framing for
 * class-behavior controls over boxes they can miss toggling.
 */
export default function YesNoToggle({
  value,
  onChange,
  label,
  helper,
  disabled,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
  helper?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-zinc-900 dark:text-white">
          {label}
        </div>
        {helper && (
          <div className="mt-0.5 text-[11px] text-zinc-500 dark:text-slate-400">
            {helper}
          </div>
        )}
      </div>
      <div
        role="radiogroup"
        aria-label={label}
        className="flex flex-shrink-0 overflow-hidden rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
      >
        <button
          type="button"
          role="radio"
          aria-checked={value === true}
          disabled={disabled}
          onClick={() => onChange(true)}
          className={`min-w-[44px] rounded-full px-3 py-1 transition ${
            value
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:text-slate-400"
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={value === false}
          disabled={disabled}
          onClick={() => onChange(false)}
          className={`min-w-[44px] rounded-full px-3 py-1 transition ${
            !value
              ? "bg-zinc-200 text-zinc-800 shadow-sm dark:bg-slate-700 dark:text-white"
              : "text-zinc-500 hover:text-zinc-900 dark:text-slate-400"
          }`}
        >
          No
        </button>
      </div>
    </div>
  );
}
