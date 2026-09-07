/**
 * Temporary token preview — replaced by the router in Task 4.
 */
const swatches = [
  { name: 'background', className: 'bg-background' },
  { name: 'surface', className: 'bg-surface' },
  { name: 'foreground', className: 'bg-foreground' },
  { name: 'muted-foreground', className: 'bg-muted-foreground' },
  { name: 'border', className: 'bg-border' },
  { name: 'brand', className: 'bg-brand' },
  { name: 'brand gradient', className: 'bg-brand-gradient' },
  { name: 'ink', className: 'bg-ink' },
  { name: 'destructive', className: 'bg-destructive' },
]

export default function App() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">Design tokens</h1>
      <p className="text-muted-foreground mt-1">
        Verifying the theme layer renders before components are built.
      </p>

      <div className="bg-brand-border-gradient rounded-card shadow-card mt-8 p-[3px]">
        <div className="bg-surface rounded-card grid grid-cols-2 gap-4 p-6 sm:grid-cols-3">
          {swatches.map((swatch) => (
            <div key={swatch.name}>
              <div
                className={`border-border rounded-control h-12 border ${swatch.className}`}
              />
              <p className="text-muted-foreground mt-2 text-xs">{swatch.name}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
