import { Minus, Square, X } from 'lucide-react'

export function TitleBar() {
  return (
    <header className="drag-region flex h-9 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-3">
      <div className="flex items-center gap-2 no-drag">
        <span className="text-xs font-bold tracking-wide text-primary">clawT</span>
        <span className="text-xs text-muted-foreground">Hermes Desktop</span>
      </div>
      <div className="flex items-center gap-1 no-drag">
        <button
          onClick={() => window.minimize?.()}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors"
        >
          <Minus className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <button
          onClick={() => window.maximize?.()}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors"
        >
          <Square className="h-3 w-3 text-muted-foreground" />
        </button>
        <button
          onClick={() => window.close?.()}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-destructive/20 transition-colors"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
        </button>
      </div>
    </header>
  )
}
