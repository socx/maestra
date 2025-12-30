import { Link } from 'react-router-dom'

type FooterLink = {
  label: string
  to: string
}

type FooterColumn = {
  title: string
  links: FooterLink[]
}

const columns: FooterColumn[] = [
  {
    title: 'App',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Word List', to: '/word-list' },
      { label: 'Practice', to: '/practice' },
      { label: 'Exercise', to: '/exercise' },
    ],
  },
  {
    title: 'Support',
    links: [{ label: 'Help', to: '/help' }],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/help' },
      { label: 'Contact', to: '/help' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', to: '/help' },
      { label: 'Terms', to: '/help' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-white/10 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-gray-200 pt-8 dark:border-white/10">
          <div className="grid gap-6 lg:grid-cols-3 lg:items-center">
            <div className="lg:col-span-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Subscribe to our newsletter</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Get spelling practice tips and updates.
              </p>
            </div>

            <form
              className="flex w-full max-w-md gap-2"
              onSubmit={(e) => {
                e.preventDefault()
              }}
            >
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/10 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500"
              />
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Subscribe
              </button>
            </form>
          </div>

          <p className="mt-8 text-xs text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} Maestra. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
