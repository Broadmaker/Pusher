import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useApi } from '../data/api-context'
import { useToast } from '../components/Toast'
import { VAPID_PUBLIC_KEY } from '../config'
import { Button, Input, Modal, ConfirmDialog } from '../components/ui'

export default function AppSettings() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { apps, updateApp, deleteApp, rotateApiKey } = useApi()
  const { addToast } = useToast()
  const app = apps.find(a => a.id === id)

  const [showEdit, setShowEdit] = useState(false)
  const [editName, setEditName] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [showRotate, setShowRotate] = useState(false)

  if (!app) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 sm:p-12 text-center">
        <p className="text-gray-500 font-medium">App not found</p>
      </div>
    )
  }

  const handleEdit = () => {
    setEditName(app.name)
    setShowEdit(true)
  }

  const handleSaveEdit = async () => {
    if (!editName.trim()) return
    try {
      await updateApp(app.id, editName.trim())
      setShowEdit(false)
      addToast('App name updated')
    } catch { addToast('Failed to update app name', 'error') }
  }

  const handleDelete = async () => {
    try {
      await deleteApp(app.id)
      addToast('App deleted')
      navigate('/dashboard')
    } catch { addToast('Failed to delete app', 'error') }
  }

  const handleRotate = async () => {
    try {
      const newKey = await rotateApiKey(app.id)
      addToast('API key regenerated')
      navigator.clipboard.writeText(newKey)
      setShowRotate(false)
    } catch { addToast('Failed to rotate key', 'error') }
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0">
            {app.name[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{app.name}</h1>
            <p className="text-sm text-gray-500">App settings and API credentials</p>
          </div>
          <button
            onClick={handleEdit}
            className="shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">API Key</h3>
          <button
            onClick={() => setShowRotate(true)}
            className="text-xs font-medium text-amber-600 hover:text-amber-800 transition-colors"
          >
            Regenerate
          </button>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl px-3 sm:px-4 py-3">
          <code className="flex-1 text-xs sm:text-sm text-gray-700 font-mono tracking-wide truncate">{app.apiKey}</code>
          <button
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 shrink-0 transition-colors"
            onClick={() => { navigator.clipboard.writeText(app.apiKey); addToast('API key copied') }}
          >
            Copy
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
          <Link to={`/apps/${app.id}/devices`}
            className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-semibold py-2.5 sm:py-2 px-4 rounded-xl hover:bg-gray-200 text-sm transition-all active:scale-[0.98]">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
            View Devices
          </Link>
          <Link to={`/apps/${app.id}/notify`}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2.5 sm:py-2 px-4 rounded-xl hover:bg-blue-700 text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98]">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            Send Notification
          </Link>
          <Link to={`/apps/${app.id}/history`}
            className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-semibold py-2.5 sm:py-2 px-4 rounded-xl hover:bg-gray-200 text-sm transition-all active:scale-[0.98]">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Notification History
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Integration</h3>
        <p className="text-sm text-gray-500 mb-4">Add this snippet to your website or app to start registering devices.</p>
        <pre className="bg-slate-900 text-slate-200 p-3 sm:p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">
{`<script src="https://pusher.dev/sdk.js"></script>
<script>
  PushSDK.init("${app.apiKey}", {
    vapidPublicKey: "${VAPID_PUBLIC_KEY}"
  })
</script>`}
        </pre>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <Button
          variant="danger"
          onClick={() => setShowDelete(true)}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          }
        >
          Delete App
        </Button>
      </div>

      {/* Edit name modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit App Name" gradient={false}>
        <div className="space-y-5">
          <Input
            label="App Name"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            autoFocus
            required
          />
          <div className="flex gap-3">
            <Button onClick={handleSaveEdit} className="flex-1">Save</Button>
            <Button variant="secondary" onClick={() => setShowEdit(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Rotate API key confirmation */}
      <ConfirmDialog
        open={showRotate}
        onClose={() => setShowRotate(false)}
        onConfirm={handleRotate}
        title="Regenerate API Key?"
        message="The current key will stop working immediately. The new key will be copied to your clipboard."
        confirmLabel="Regenerate"
        variant="danger"
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete App?"
        message={`Are you sure you want to delete "${app.name}"? This will also remove all devices and notification history. This cannot be undone.`}
        confirmLabel="Delete App"
        variant="danger"
      />
    </div>
  )
}
