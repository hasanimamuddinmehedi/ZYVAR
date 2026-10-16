import { useState } from "react";
import { FaPlus, FaCheck, FaTimes } from "react-icons/fa";

const NEW = "__new__";

/**
 * Category select + "type your own category" option.
 * Custom / AI-created categories are added to the list (via onAddCategory)
 * and therefore also appear in the product edit page.
 */
export default function CategoryField({
  value,
  onChange,
  categories,
  onAddCategory,
  required = false,
  selectClassName = "",
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const options =
    value && !categories.some((c) => c.toLowerCase() === value.toLowerCase())
      ? [...categories, value]
      : categories;

  const commit = () => {
    const clean = draft.trim().replace(/\s+/g, " ").slice(0, 40);
    if (!clean) return;
    const finalName = onAddCategory ? onAddCategory(clean) : clean;
    onChange(finalName || clean);
    setDraft("");
    setAdding(false);
  };

  return (
    <div className="space-y-3">
      <select
        value={adding ? NEW : value}
        required={required && !adding}
        onChange={(e) => {
          if (e.target.value === NEW) {
            setAdding(true);
          } else {
            setAdding(false);
            onChange(e.target.value);
          }
        }}
        className={selectClassName}
      >
        <option value="">Select Category</option>
        {options.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
        <option value={NEW}>+ Type a new category…</option>
      </select>

      {adding && (
        <div className="flex gap-2">
          <input
            autoFocus
            type="text"
            value={draft}
            maxLength={40}
            placeholder="New category name"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
            }}
            className="flex-1 px-5 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
          />
          <button
            type="button"
            onClick={commit}
            className="px-5 rounded-2xl bg-[#C6922B] text-black font-black flex items-center gap-2"
          >
            <FaCheck size={12} /> Add
          </button>
          <button
            type="button"
            onClick={() => {
              setAdding(false);
              setDraft("");
            }}
            className="px-4 rounded-2xl bg-white/10 text-gray-300"
            aria-label="Cancel"
          >
            <FaTimes size={12} />
          </button>
        </div>
      )}

      {!adding && value && !categories.some((c) => c.toLowerCase() === value.toLowerCase()) && (
        <p className="text-xs text-[#C6922B] flex items-center gap-2">
          <FaPlus size={9} /> “{value}” is a new category — it will be created with this product.
        </p>
      )}
    </div>
  );
}
