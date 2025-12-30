import { useTheme } from '../hooks/useTheme'

function SunIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={className}>
      <path
        fillRule="evenodd"
        d="M10 2.5a.75.75 0 01.75.75v1a.75.75 0 01-1.5 0v-1A.75.75 0 0110 2.5zM10 14a4 4 0 100-8 4 4 0 000 8zm7.5-4a.75.75 0 01-.75.75h-1a.75.75 0 010-1.5h1A.75.75 0 0117.5 10zM4.25 10a.75.75 0 00-.75-.75h-1a.75.75 0 000 1.5h1A.75.75 0 004.25 10zm11.03 4.28a.75.75 0 011.06 1.06l-.71.71a.75.75 0 01-1.06-1.06l.71-.71zM5.37 4.41a.75.75 0 010 1.06l-.71.71A.75.75 0 013.6 5.12l.71-.71a.75.75 0 011.06 0zm10.26-1.06a.75.75 0 011.06 0l.71.71a.75.75 0 01-1.06 1.06l-.71-.71a.75.75 0 010-1.06zM4.41 14.63a.75.75 0 011.06 0l.71.71a.75.75 0 11-1.06 1.06l-.71-.71a.75.75 0 010-1.06z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function MoonIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
  )
}

// Tailwind UI “toggle with icons” style, implemented as a button + aria-checked.
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const checked = theme === 'dark'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={toggleTheme}
      className="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full bg-white/10 p-px transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 aria-checked:bg-indigo-500"
    >
      <span className="sr-only">Toggle dark mode</span>
      <span
        aria-hidden="true"
        className="pointer-events-none relative inline-block size-5 translate-x-0 rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out group-aria-checked:translate-x-5"
      >
        <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 ease-in-out opacity-100 group-aria-checked:opacity-0">
          <SunIcon className="size-3 text-gray-700" />
        </span>
        <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 ease-in-out opacity-0 group-aria-checked:opacity-100">
          <MoonIcon className="size-3 text-white" />
        </span>
      </span>
    </button>
  )
}
