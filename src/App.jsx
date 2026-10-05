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
        className="fixed inset-0 h-full w-full border-0"
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

    return {
      file: file.replace('./', 'src/'),
      name: rel,
      path: `/${slugify(rel)}`,
      Widget: lazy(load),
    }
  })
  .sort((a, b) => a.name.localeCompare(b.name))

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
      <div className="p-8 text-red-600">
        <h2 className="text-lg font-semibold">
          This widget crashed
        </h2>

        <pre className="mt-2 whitespace-pre-wrap text-sm">
          {String(this.state.error)}
        </pre>
      </div>
    )
  }
}

function Index() {
  return (
    <main className="mx-auto max-w-2xl p-8 text-left">
      <h1 className="mb-6 text-2xl font-bold">
        Widgets
      </h1>

      {widgets.length === 0 && (
        <p>
          No widgets yet. Add a .tsx, .jsx or .html file under
          src/widgets/.
        </p>
      )}

      <ul className="space-y-2">
        {widgets.map((widget) => {
          const href = `${baseUrl}#${widget.path}`

          return (
            <li key={widget.path}>
              <a
                className="text-blue-600 hover:underline"
                href={href}
              >
                {widget.name}
              </a>

              <span className="ml-2 text-xs text-gray-500">
                {href}
              </span>
            </li>
          )
        })}
      </ul>
    </main>
  )
}

function App() {
  const [currentPath, setCurrentPath] =
    useState(getCurrentPath)

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

  if (!match) {
    return <Index />
  }

  const { Widget } = match

  return (
    <>
      <a
        className="fixed left-2 top-2 z-50 text-sm text-blue-600 hover:underline"
        href={baseUrl}
      >
        ← All widgets
      </a>

      <ErrorBoundary>
        <Suspense
          fallback={
            <p className="p-8">
              Loading…
            </p>
          }
        >
          <Widget />
        </Suspense>
      </ErrorBoundary>
    </>
  )
}

export default App