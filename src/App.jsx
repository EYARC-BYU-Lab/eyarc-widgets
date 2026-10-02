import { Component, Suspense, lazy } from 'react'

// Every .tsx/.jsx file under src/widgets becomes a page. Drop a file in and it
// shows up on the index; no edits here needed. Each must `export default` a component.
const modules = import.meta.glob('./widgets/**/*.{tsx,jsx}')

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9/]+/g, '-').replace(/(^-|-$)|-(?=\/)|(?<=\/)-/g, '')

const widgets = Object.entries(modules)
  .map(([file, load]) => {
    const rel = file.replace('./widgets/', '').replace(/\.(tsx|jsx)$/, '')
    return { file: `src/widgets/${rel}`, name: rel, path: `/${slugify(rel)}`, Widget: lazy(load) }
  })
  .sort((a, b) => a.name.localeCompare(b.name))

class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="p-8 text-red-600">
        <h2 className="text-lg font-semibold">This widget crashed</h2>
        <pre className="mt-2 whitespace-pre-wrap text-sm">{String(this.state.error)}</pre>
      </div>
    )
  }
}

function Index() {
  return (
    <main className="mx-auto max-w-2xl p-8 text-left">
      <h1 className="mb-6 text-2xl font-bold">Widgets</h1>
      {widgets.length === 0 && <p>No widgets yet. Add a .tsx file under src/widgets/.</p>}
      <ul className="space-y-2">
        {widgets.map((w) => (
          <li key={w.path}>
            <a className="text-blue-600 hover:underline" href={w.path}>{w.name}</a>
            <span className="ml-2 text-xs text-gray-500">{w.path}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}

function App() {
  const current = decodeURIComponent(window.location.pathname).replace(/\/$/, '')
  const match = widgets.find((w) => w.path === current)

  if (!match) return <Index />

  const { Widget } = match
  return (
    <>
      <a className="fixed top-2 left-2 z-50 text-sm text-blue-600 hover:underline" href="/">← All widgets</a>
      <ErrorBoundary>
        <Suspense fallback={<p className="p-8">Loading…</p>}>
          <Widget />
        </Suspense>
      </ErrorBoundary>
    </>
  )
}

export default App
