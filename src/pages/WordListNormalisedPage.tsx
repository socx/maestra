import { Disclosure } from '@headlessui/react'
import { useMemo, useState } from 'react'

import wordsData from '../services/data/subject-vocab-normalised.json'

type NormalisedWord = {
  word: string
  definition: string
  synonymns: string[]
  usage: string
  category: string
  'sub-category': string
  stage: 'KS3' | 'KS4' | 'General' | string
}

type GroupByMode = 'category' | 'startsWith'

type SortMode = 'categoryAsc' | 'categoryDesc' | 'wordAsc' | 'wordDesc'

function compareText(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: 'base' })
}

function startsWithKey(word: string): string {
  const trimmed = word.trim()
  if (!trimmed) return '#'
  const first = trimmed[0].toUpperCase()
  return /[A-Z]/.test(first) ? first : '#'
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort(compareText)
}

function hashString(input: string): string {
  // Small stable hash for React keys.
  let hash = 5381
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i)
  }
  return (hash >>> 0).toString(16)
}

function wordKey(item: NormalisedWord): string {
  const parts = [item.category, item['sub-category'], item.word, item.definition, item.usage]
  return `${item.category}|${item['sub-category']}|${item.word}|${hashString(parts.join('|'))}`
}

export function WordListNormalisedPage() {
  const [groupBy, setGroupBy] = useState<GroupByMode>('category')
  const [sortMode, setSortMode] = useState<SortMode>('categoryAsc')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [startsWithFilter, setStartsWithFilter] = useState<string>('All')

  const allWords = useMemo(() => {
    return (wordsData as NormalisedWord[]).filter((w) => w && w.word && w.category)
  }, [])

  const categories = useMemo(() => {
    return uniqueSorted(allWords.map((w) => w.category))
  }, [allWords])

  const startsWithOptions = useMemo(() => {
    return uniqueSorted(allWords.map((w) => startsWithKey(w.word)))
  }, [allWords])

  const filteredWords = useMemo(() => {
    return allWords.filter((w) => {
      if (categoryFilter !== 'All' && w.category !== categoryFilter) return false
      const sw = startsWithKey(w.word)
      if (startsWithFilter !== 'All' && sw !== startsWithFilter) return false
      return true
    })
  }, [allWords, categoryFilter, startsWithFilter])

  const sortedWords = useMemo(() => {
    const copy = [...filteredWords]
    copy.sort((a, b) => {
      if (sortMode === 'wordAsc') return compareText(a.word, b.word)
      if (sortMode === 'wordDesc') return compareText(b.word, a.word)

      const catCmp = compareText(a.category, b.category)
      if (catCmp !== 0) return sortMode === 'categoryAsc' ? catCmp : -catCmp
      return compareText(a.word, b.word)
    })
    return copy
  }, [filteredWords, sortMode])

  const grouped = useMemo(() => {
    if (groupBy === 'startsWith') {
      const map = new Map<string, NormalisedWord[]>()
      for (const item of sortedWords) {
        const k = startsWithKey(item.word)
        const arr = map.get(k) ?? []
        arr.push(item)
        map.set(k, arr)
      }

      const keys = Array.from(map.keys()).sort(compareText)
      return keys.map((key) => ({ key, header: key, items: map.get(key) ?? [] }))
    }

    const map = new Map<string, NormalisedWord[]>()
    for (const item of sortedWords) {
      const k = item.category
      const arr = map.get(k) ?? []
      arr.push(item)
      map.set(k, arr)
    }

    const keys = Array.from(map.keys()).sort((a, b) => {
      const cmp = compareText(a, b)
      if (sortMode === 'categoryDesc') return -cmp
      return cmp
    })

    return keys.map((key) => ({ key, header: key, items: map.get(key) ?? [] }))
  }, [groupBy, sortedWords, sortMode])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Word List</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{sortedWords.length} words</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="groupBy"
                className="block text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                Group by
              </label>
              <select
                id="groupBy"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as GroupByMode)}
                className="mt-2 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              >
                <option value="category">Category</option>
                <option value="startsWith">Starts with (First Letter)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="sortMode"
                className="block text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                Sort
              </label>
              <select
                id="sortMode"
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="mt-2 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              >
                <option value="categoryAsc">Category (A → Z)</option>
                <option value="categoryDesc">Category (Z → A)</option>
                <option value="wordAsc">Word (A → Z)</option>
                <option value="wordDesc">Word (Z → A)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900"
              aria-expanded={filtersOpen}
              aria-controls="word-list-filters"
            >
              Filters
            </button>

            <button
              type="button"
              onClick={() => {
                setCategoryFilter('All')
                setStartsWithFilter('All')
              }}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900"
            >
              Clear
            </button>
          </div>
        </div>

        {filtersOpen ? (
          <div id="word-list-filters" className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-800">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Disclosure defaultOpen>
                {({ open }) => (
                  <div className="rounded-md border border-gray-200 dark:border-gray-800">
                    <Disclosure.Button className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                      Category
                      <span className="text-xs text-gray-500 dark:text-gray-400">{open ? 'Hide' : 'Show'}</span>
                    </Disclosure.Button>
                    <Disclosure.Panel className="border-t border-gray-200 px-4 py-3 dark:border-gray-800">
                      <div className="max-h-56 overflow-auto">
                        <div className="space-y-2">
                          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                            <input
                              type="radio"
                              name="categoryFilter"
                              value="All"
                              checked={categoryFilter === 'All'}
                              onChange={() => setCategoryFilter('All')}
                              className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-700"
                            />
                            All
                          </label>
                          {categories.map((c) => (
                            <label
                              key={c}
                              className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
                            >
                              <input
                                type="radio"
                                name="categoryFilter"
                                value={c}
                                checked={categoryFilter === c}
                                onChange={() => setCategoryFilter(c)}
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-700"
                              />
                              {c}
                            </label>
                          ))}
                        </div>
                      </div>
                    </Disclosure.Panel>
                  </div>
                )}
              </Disclosure>

              <Disclosure defaultOpen>
                {({ open }) => (
                  <div className="rounded-md border border-gray-200 dark:border-gray-800">
                    <Disclosure.Button className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                      Starts with
                      <span className="text-xs text-gray-500 dark:text-gray-400">{open ? 'Hide' : 'Show'}</span>
                    </Disclosure.Button>
                    <Disclosure.Panel className="border-t border-gray-200 px-4 py-3 dark:border-gray-800">
                      <div className="max-h-56 overflow-auto">
                        <div className="grid grid-cols-6 gap-2 sm:grid-cols-9">
                          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                            <input
                              type="radio"
                              name="startsWithFilter"
                              value="All"
                              checked={startsWithFilter === 'All'}
                              onChange={() => setStartsWithFilter('All')}
                              className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-700"
                            />
                            All
                          </label>
                          {startsWithOptions.map((l) => (
                            <label
                              key={l}
                              className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
                            >
                              <input
                                type="radio"
                                name="startsWithFilter"
                                value={l}
                                checked={startsWithFilter === l}
                                onChange={() => setStartsWithFilter(l)}
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-700"
                              />
                              {l}
                            </label>
                          ))}
                        </div>
                      </div>
                    </Disclosure.Panel>
                  </div>
                )}
              </Disclosure>
            </div>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-950">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-200"
                >
                  Word
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-200"
                >
                  Definition
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-200"
                >
                  Synonymns
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-200"
                >
                  Sentence usage
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
              {grouped.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-600 dark:text-gray-300">
                    No words match the current filters.
                  </td>
                </tr>
              ) : (
                grouped.flatMap((group) => {
                  return [
                    <tr key={`group-${group.key}`} className="bg-gray-50 dark:bg-gray-950">
                      <th
                        scope="colgroup"
                        colSpan={4}
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
                      >
                        {group.header}
                      </th>
                    </tr>,
                    ...group.items.map((item) => (
                      <tr key={wordKey(item)} className="align-top">
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.word}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{item.definition}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                          {item.synonymns?.length ? item.synonymns.join(', ') : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                          {item.usage || '—'}
                        </td>
                      </tr>
                    )),
                  ]
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
