import type { ReactNode } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  submitLabel = 'Salvar',
  pending,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  onSubmit: () => void
  submitLabel?: string
  pending?: boolean
  children: ReactNode
}) {
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-lg">
      <DialogHeader><DialogTitle>{title}</DialogTitle>{description && <DialogDescription>{description}</DialogDescription>}</DialogHeader>
      <form className="dialog-form" onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
        {children}
        <div className="dialog-actions">
          <button className="button button-ghost" type="button" onClick={() => onOpenChange(false)}>Cancelar</button>
          <button className="button button-primary" type="submit" disabled={pending}>{pending ? 'Salvando…' : submitLabel}</button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
}

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <div className="field"><label>{label}</label>{children}{error && <span className="field-error">{error}</span>}</div>
}
