import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useState,
} from 'react'

const modules = import.meta.glob('./widgets/**/*.{tsx,jsx}')

// HTML artifacts are loaded as text and rendered in a full-page iframe.
const htmlModules = import.meta.glob('./widgets/**/*.html', {
  query: '?raw',
  import: 'default',
})

const loadHtmlWidget = (load) => () =>
  load().then((html) => ({
    default: () => (
      <iframe
        className="block h-[calc(100vh-5.5rem)] w-full border-0 bg-white"
        srcDoc={html}
        title="HTML widget"
      />
    ),
  }))

const slugify = (value) =>
  value
    .split('/')
    .map((part) =>
      part
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    )
    .filter(Boolean)
    .join('/')

const baseUrl = import.meta.env.BASE_URL

const widgets = [
  ...Object.entries(modules).map(([file, load]) => [
    file,
    load,
  ]),
  ...Object.entries(htmlModules).map(([file, load]) => [
    file,
    loadHtmlWidget(load),
  ]),
]
  .map(([file, load]) => {
    const rel = file
      .replace('./widgets/', '')
      .replace(/\.(tsx|jsx|html)$/, '')
    const parts = rel.split('/')
    const widgetTitle =
      parts[parts.length - 1] || rel
    const groupPath =
      parts.length > 1
        ? parts.slice(0, -1).join('/')
        : 'Ungrouped'

    return {
      file: file.replace('./', 'src/'),
      name: rel,
      title: widgetTitle,
      group: groupPath,
      path: `/${slugify(rel)}`,
      Widget: lazy(load),
    }
  })
  .sort((a, b) => a.name.localeCompare(b.name))

const formatGroupTitle = (group) =>
  group
    .split('/')
    .map((part) => part.replace(/[-_]+/g, ' '))
    .join(' / ')

const widgetGroups = Array.from(
  widgets.reduce((acc, widget) => {
    if (!acc.has(widget.group)) {
      acc.set(widget.group, [])
    }

    acc.get(widget.group).push(widget)
    return acc
  }, new Map())
)
  .map(([group, items]) => ({
    key: group,
    title: formatGroupTitle(group),
    items,
  }))
  .sort((a, b) => {
    if (a.key === 'Ungrouped') {
      return -1
    }

    if (b.key === 'Ungrouped') {
      return 1
    }

    return a.title.localeCompare(b.title)
  })

const getCurrentPath = () => {
  const path = window.location.hash
    .replace(/^#/, '')
    .replace(/\/$/, '')

  return path || '/'
}

class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (!this.state.error) {
      return this.props.children
    }

    return (
      <div className="mx-auto mt-20 max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-left shadow-sm">
        <h2 className="text-lg font-semibold text-red-700">
          This widget crashed
        </h2>

        <pre className="mt-3 whitespace-pre-wrap text-sm text-red-700/80">
          {String(this.state.error)}
        </pre>
      </div>
    )
  }
}

function Index() {
  const [copyStateByPath, setCopyStateByPath] = useState({})

  const copyWidgetLink = async (widget) => {
    const href = `${window.location.origin}${baseUrl}#${widget.path}`

    try {
      await navigator.clipboard.writeText(href)
      setCopyStateByPath((current) => ({
        ...current,
        [widget.path]: 'copied',
      }))
    } catch (error) {
      console.error('Failed to copy widget link', error)
      setCopyStateByPath((current) => ({
        ...current,
        [widget.path]: 'error',
      }))
    }
  }

  useEffect(() => {
    const timerIds = Object.entries(copyStateByPath).map(
      ([path, state]) => {
        if (state === 'idle') {
          return null
        }

        return window.setTimeout(() => {
          setCopyStateByPath((current) => ({
            ...current,
            [path]: 'idle',
          }))
        }, 1800)
      }
    )

    return () => {
      timerIds.forEach((timerId) => {
        if (timerId) {
          window.clearTimeout(timerId)
        }
      })
    }
  }, [copyStateByPath])

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 backdrop-blur-sm sm:p-8">
          <div className="mb-4">
            <h1 className="!text-indigo-700 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Widgets
            </h1>
            <div className="mt-2 h-1 w-16 rounded-full bg-indigo-400" />
          </div>

          <p className="mb-7 max-w-xl text-sm text-slate-600 sm:text-base">
            Browse the available widgets and open any one of them.
          </p>

          {widgets.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No widgets yet. Add a .tsx, .jsx or .html file under
              src/widgets/.
            </p>
          )}

          <div className="space-y-3">
            {widgetGroups.map((group, index) => (
              <details
                key={group.key}
                className="rounded-2xl border border-slate-200 bg-white"
                open={index === 0}
              >
                <summary className="cursor-pointer list-none px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-800">
                      {group.title}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                      {group.items.length}
                    </span>
                  </div>
                </summary>

                <div className="border-t border-slate-200 p-3 sm:p-4">
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {group.items.map((widget) => {
                      const href = `${baseUrl}#${widget.path}`
                      const cardState =
                        copyStateByPath[widget.path] || 'idle'

                      return (
                        <li key={widget.path}>
                          <div
                            className="group cursor-pointer rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50 p-3 transition duration-150 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white hover:shadow-sm"
                            onClick={() => {
                              window.location.hash = widget.path
                            }}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                window.location.hash = widget.path
                              }
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            <div className="flex items-center gap-3">
                              <span className="block min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">
                                {widget.title}
                              </span>

                              <button
                                className="ml-auto cursor-pointer rounded-full border border-indigo-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-700 transition hover:border-indigo-300 hover:text-indigo-800"
                                onClick={(event) => {
                                  event.preventDefault()
                                  event.stopPropagation()
                                  copyWidgetLink(widget)
                                }}
                                type="button"
                              >
                                {cardState === 'copied'
                                  ? 'Copied!'
                                  : cardState === 'error'
                                    ? 'Failed'
                                    : 'Copy Link'}
                              </button>
                            </div>

                            <span className="mt-2 block truncate text-xs text-slate-500">
                              {href}
                            </span>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

function App() {
  const [currentPath, setCurrentPath] =
    useState(getCurrentPath)
  const [copyState, setCopyState] = useState('idle')

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(getCurrentPath())
    }

    window.addEventListener(
      'hashchange',
      handleHashChange
    )

    return () => {
      window.removeEventListener(
        'hashchange',
        handleHashChange
      )
    }
  }, [])

  const match = widgets.find(
    (widget) => widget.path === currentPath
  )

  useEffect(() => {
    setCopyState('idle')
  }, [currentPath])

  useEffect(() => {
    if (copyState === 'idle') {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setCopyState('idle')
    }, 1800)

    return () => window.clearTimeout(timeoutId)
  }, [copyState])

  if (!match) {
    return <Index />
  }

  const { Widget } = match
  const copyCurrentLink = async () => {
    try {
      await navigator.clipboard.writeText(
        window.location.href
      )
      setCopyState('copied')
    } catch (error) {
      console.error('Failed to copy widget link', error)
      setCopyState('error')
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2">
          <a
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-indigo-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-800"
            href={baseUrl}
          >
            ← All widgets
          </a>

          <h2 className="!text-indigo-700 min-w-0 truncate px-3 text-center text-sm font-bold tracking-tight sm:text-base">
            {match.title}
          </h2>

          <button
            className="cursor-pointer whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
            onClick={copyCurrentLink}
            type="button"
          >
            {copyState === 'copied'
              ? 'Copied!'
              : copyState === 'error'
                ? 'Copy failed'
                : 'Copy Link'}
          </button>
        </div>
      </header>

      <div className="px-4 py-4 sm:px-6">
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="flex min-h-[50vh] items-center justify-center">
                <p className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                  Loading…
                </p>
              </div>
            }
          >
            <Widget />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}

export default App