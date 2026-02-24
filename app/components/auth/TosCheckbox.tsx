"use client";

interface TosCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function TosCheckbox({ checked, onChange }: TosCheckboxProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
      />
      <span className="text-sm text-gray-700 leading-snug">
        I am the parent or legal guardian of this child. I agree to the{" "}
        <a
          href="/terms-of-service"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 font-medium hover:underline"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 font-medium hover:underline"
        >
          Privacy Policy
        </a>
        .
      </span>
    </label>
  );
}
