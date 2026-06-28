import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApi } from '../data/api-context'
import { useToast } from '../components/Toast'
import { Button, Input, Textarea, ConfirmDialog } from '../components/ui'
import type { Template } from '../data/mock'

export default function SendNotification() {
  const { id } = useParams<{ id: string }>()
  const { apps, devices, templates, sendNotification, addTemplate, deleteTemplate } = useApi()
  const { addToast } = useToast()
  const app = apps.find(a => a.id === id)
  const appTemplates = id ? (templates[id] || []) : []
  const deviceCount = id ? (devices[id] || []).length : 0
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [showSave, setShowSave] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  if (!app) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 sm:p-12 text-center">
        <p className="text-gray-500 font-medium">App not found</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    if (deviceCount === 0) {
      try {
        await sendNotification(id!, title.trim(), body.trim())
        setTitle('')
        setBody('')
        addToast('Notification sent successfully!')
      } catch { addToast('Failed to send notification', 'error') }
    } else {
      setShowConfirm(true)
    }
  }

  const handleConfirmSend = async () => {
    try {
      await sendNotification(id!, title.trim(), body.trim())
      setTitle('')
      setBody('')
      setShowConfirm(false)
      addToast('Notification sent successfully!')
    } catch { addToast('Failed to send notification', 'error') }
  }

  const applyTemplate = (t: Template) => {
    setTitle(t.title)
    setBody(t.body)
  }

  const handleSaveTemplate = () => {
    if (!templateName.trim() || !title.trim()) return
    addTemplate(id!, templateName.trim(), title.trim(), body.trim())
    setTemplateName('')
    setShowSave(false)
    addToast('Template saved')
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0">
            {app.name[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Send Notification</h1>
            <p className="text-sm text-gray-500 truncate">{app.name} &mdash; compose a push notification</p>
          </div>
        </div>
      </div>

      {/* Device count & tip */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${deviceCount > 0 ? 'bg-emerald-50' : 'bg-gray-100'}`}>
            <svg className={`w-5 h-5 ${deviceCount > 0 ? 'text-emerald-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">{deviceCount} device{deviceCount !== 1 ? 's' : ''} registered</div>
            <div className="text-xs text-gray-500">Your notification will be sent to all devices</div>
          </div>
        </div>
        <div className="flex-1 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-800">Best practices</div>
            <div className="text-xs text-gray-600">Keep titles under 50 chars and messages concise. Save frequent messages as templates for reuse.</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Templates sidebar */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Templates</h3>
              <span className="text-xs text-gray-400">{appTemplates.length}</span>
            </div>
            {appTemplates.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No templates yet. Save one from the form.</p>
            ) : (
              <div className="space-y-2">
                {appTemplates.map(t => (
                  <div key={t.id} className="group flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 hover:bg-blue-50/50 transition-colors cursor-pointer" onClick={() => applyTemplate(t)}>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{t.name}</div>
                      <div className="text-xs text-gray-400 truncate">{t.title} &mdash; {t.body}</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(t) }}
                      className="shrink-0 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Title"
                placeholder="e.g. Flash Sale"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
              <Textarea
                label="Message"
                placeholder="Write your notification message..."
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={4}
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" variant="success" icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                }>
                  Send Push Notification
                </Button>
                <Button type="button" variant="secondary" icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />
                  </svg>
                } onClick={() => setShowSave(!showSave)}>
                  Save as Template
                </Button>
              </div>
            </form>

            {/* Save template inline form */}
            {showSave && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Input
                      placeholder="Template name"
                      value={templateName}
                      onChange={e => setTemplateName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <Button onClick={handleSaveTemplate} disabled={!templateName.trim() || !title.trim()}>
                    Save
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmSend}
        title="Send notification?"
        message={`This notification will be sent to ${deviceCount} device${deviceCount !== 1 ? 's' : ''}.`}
        confirmLabel="Send"
        variant="primary"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) { deleteTemplate(id!, deleteTarget.id); addToast('Template deleted') }; setDeleteTarget(null) }}
        title="Delete template?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  )
}
