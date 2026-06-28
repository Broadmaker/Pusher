import { Button, Modal } from './index'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  variant?: 'danger' | 'primary'
}

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'danger' }: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title} subtitle={message} gradient={false}
      icon={
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      }
    >
      <div className="flex gap-3">
        <Button variant={variant} onClick={onConfirm} className="flex-1">{confirmLabel}</Button>
        <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
      </div>
    </Modal>
  )
}
