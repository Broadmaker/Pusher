import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../data/api-context'
import { useToast } from '../components/Toast'
import { Button, Input, Modal } from '../components/ui'

interface Props {
  onClose: () => void
}

export default function CreateAppModal({ onClose }: Props) {
  const { addApp } = useApi()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState<{ id: string; apiKey: string } | null>(null)
  const { addToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || creating) return
    setCreating(true)
    try {
      const app = await addApp(name.trim())
      setCreated(app)
    } catch {
      addToast('Failed to create app', 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleCopy = () => {
    if (created) {
      navigator.clipboard.writeText(created.apiKey)
      addToast('API key copied to clipboard')
    }
  }

  const handleClose = () => {
    if (created) navigate(`/apps/${created.id}`)
    onClose()
  }

  return (
    <Modal
      open
      onClose={handleClose}
      title={created ? 'App Created' : 'New App'}
      subtitle={created ? 'Your API key is ready' : 'Register a new project to get an API key'}
      icon={created ? (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      )}
    >
      {created ? (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">API Key</label>
            <div className="flex items-center gap-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl px-4 py-3.5">
              <code className="flex-1 text-sm text-gray-700 font-mono tracking-wide truncate">{created.apiKey}</code>
              <Button variant="ghost" size="sm" onClick={handleCopy}>Copy</Button>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => { navigate(`/apps/${created.id}`); onClose() }} className="flex-1">
              Go to App
            </Button>
            <Button variant="secondary" onClick={() => setCreated(null)} className="flex-1">
              Create Another
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="App Name"
            placeholder="e.g. My Mobile App"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            required
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
              </svg>
            }
          />
          <div className="flex gap-3">
            <Button type="submit" loading={creating} className="flex-1">Create App</Button>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
