import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { MdLightMode, MdDarkMode } from "react-icons/md";

export default function ThemeToggle() {
  const { dark, setDark } = useContext(ThemeContext);

  return (
    <button
      onClick={() => setDark(!dark)}
      aria-label="Toggle theme"
      className="
        relative flex items-center justify-center
        w-10 h-10 rounded-full
        bg-surface-dark dark:bg-surface
        text-text-dark dark:text-text
        hover:bg-bg hover:text-text
        dark:hover:bg-bg-dark dark:hover:text-text-dark
        transition-all duration-300
      "
    >
      {/* Light Icon */}
      <MdLightMode
        className={`
          absolute text-xl transition-all duration-300
          ${dark ? "opacity-0 scale-75 rotate-90" : "opacity-100 scale-100 rotate-0"}
        `}
      />

      {/* Dark Icon */}
      <MdDarkMode
        className={`
          absolute text-xl transition-all duration-300
          ${dark ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-75 -rotate-90"}
        `}
      />
    </button>
  );
}
