"use client";

interface TosCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /**
   * "parent" — consumer flow, parent accepts on behalf of a child.
   * "educator" — teacher / specialist creating their own account;
   *   no "child of mine" language.
   * Defaults to "parent" for backwards compatibility.
   */
  role?: "parent" | "educator";
}

export default function TosCheckbox({
  checked,
  onChange,
  role = "parent",
}: TosCheckboxProps) {
  const lead =
    role === "educator"
      ? "I am at least 18 years old and acting on behalf of myself or my school."
      : "I am the parent or legal guardian of this child.";
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
      />
      <span className="text-sm text-gray-700 leading-snug">
        {lead} I agree to the{" "}
        <a
          href="/terms-of-service"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 font-medium hover:underline"
        >
          Terms of Service
        </a>
        ,{" "}
        <a
          href="/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 font-medium hover:underline"
        >
          Privacy Policy
        </a>
        , and{" "}
        <a
          href="/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 font-medium hover:underline"
        >
          Copyright Policy
        </a>
        .
      </span>
    </label>
  );
}
