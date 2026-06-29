import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApi } from '../data/api-context'
import { useToast } from '../components/Toast'
import { Button, Input, Textarea, ConfirmDialog } from '../components/ui'
import type { Template } from '../data/mock'

function NotificationPreview({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white/90">Pusher</p>
          <p className="text-base font-bold text-white mt-0.5 leading-tight">{title || 'Notification Title'}</p>
          <p className="text-sm text-blue-100 mt-1 leading-snug">{body || 'Your message will appear here...'}</p>
        </div>
      </div>
    </div>
  )
}

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
  const [showTemplates, setShowTemplates] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [sending, setSending] = useState(false)

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
      setSending(true)
      try {
        await sendNotification(id!, title.trim(), body.trim())
        setTitle('')
        setBody('')
        addToast('Notification sent successfully!')
      } catch { addToast('Failed to send notification', 'error') }
      setSending(false)
    } else {
      setShowConfirm(true)
    }
  }

  const handleConfirmSend = async () => {
    setSending(true)
    try {
      await sendNotification(id!, title.trim(), body.trim())
      setTitle('')
      setBody('')
      setShowConfirm(false)
      addToast('Notification sent successfully!')
    } catch { addToast('Failed to send notification', 'error') }
    setSending(false)
  }

  const applyTemplate = (t: Template) => {
    setTitle(t.title)
    setBody(t.body)
    setShowTemplates(false)
  }

  const handleSaveTemplate = () => {
    if (!templateName.trim() || !title.trim()) return
    addTemplate(id!, templateName.trim(), title.trim(), body.trim())
    setTemplateName('')
    setShowSave(false)
    addToast('Template saved')
  }

  return (
    <div className="pb-24 sm:pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0">
          {app.name[0].toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Send Notification</h1>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
            <span className="truncate">{app.name}</span>
            <span className="text-gray-300">|</span>
            {deviceCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
                {deviceCount} device{deviceCount !== 1 ? 's' : ''}
              </span>
            ) : (
              <span className="text-amber-600">No devices registered</span>
            )}
          </div>
        </div>
        {/* Desktop: templates toggle */}
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="hidden lg:flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />
          </svg>
          Templates ({appTemplates.length})
        </button>
      </div>

      {/* Notification Preview */}
      <div className="mb-6">
        <NotificationPreview title={title} body={body} />
      </div>

      {/* Templates - Mobile always visible, Desktop toggle */}
      {appTemplates.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center justify-between w-full lg:hidden bg-white rounded-xl border border-gray-200 shadow-sm p-4"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />
              </svg>
              <span className="text-sm font-semibold text-gray-700">Templates</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{appTemplates.length}</span>
            </div>
            <svg className={`w-5 h-5 text-gray-400 transition-transform ${showTemplates ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
      )}

      <div className={`space-y-2 mb-6 lg:hidden ${showTemplates || appTemplates.length === 0 ? '' : 'hidden'}`}>
        {appTemplates.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
            <p className="text-xs text-gray-400">No templates yet. Save one from the form.</p>
          </div>
        ) : (
          appTemplates.map(t => (
            <div key={t.id} onClick={() => applyTemplate(t)} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden active:scale-[0.99] transition-transform">
              <div className="flex items-center p-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{t.title}{t.body ? ` — ${t.body}` : ''}</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(t) }}
                  className="ml-3 p-2.5 rounded-xl bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 active:scale-90 transition-all shrink-0"
                  aria-label="Delete template"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Templates sidebar - Desktop */}
        <div className={`hidden ${showTemplates ? 'lg:block' : 'lg:hidden'} lg:col-span-2`}>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Templates</h3>
              <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{appTemplates.length}</span>
            </div>
            {appTemplates.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No templates yet. Save one from the form.</p>
            ) : (
              <div className="space-y-2">
                {appTemplates.map(t => (
                  <div key={t.id} onClick={() => applyTemplate(t)} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-3 hover:bg-blue-50/50 transition-colors cursor-pointer group">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{t.name}</div>
                      <div className="text-xs text-gray-400 truncate">{t.title}{t.body ? ` — ${t.body}` : ''}</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(t) }}
                      className="shrink-0 p-1.5 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      aria-label="Delete template"
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
        <div className={`${showTemplates ? 'lg:col-span-3' : 'lg:col-span-5'}`}>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <span className={`text-xs ${title.length > 50 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                    {title.length}/50
                  </span>
                </div>
                <Input
                  placeholder="e.g. Payroll Posted"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Message</label>
                  <span className={`text-xs ${body.length > 200 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                    {body.length}/200
                  </span>
                </div>
                <Textarea
                  placeholder="Write your notification message..."
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
              </div>

              {/* Save template */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowSave(!showSave)}
                  className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />
                  </svg>
                  {showSave ? 'Cancel' : 'Save as Template'}
                </button>
              </div>

              {showSave && (
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
              )}

              {/* Send button - desktop */}
              <div className="hidden sm:flex sm:flex-col sm:gap-2 pt-2">
                <Button type="submit" size="md" variant="success" loading={sending} icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                } className="w-full sm:w-auto">
                  {deviceCount > 0 ? `Send to ${deviceCount} device${deviceCount !== 1 ? 's' : ''}` : 'Send Notification'}
                </Button>
                {title.length > 45 && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    Long titles may be truncated on some devices
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile: sticky bottom bar */}
      <div className="fixed bottom-16 left-0 right-0 z-30 bg-white border-t border-gray-200 p-4 sm:hidden safe-area-bottom">
        <div className="flex gap-3">
          <Button
            type="submit"
            variant="success"
            loading={sending}
            onClick={handleSubmit}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            }
            className="flex-1"
          >
            {deviceCount > 0 ? `Send to ${deviceCount} device${deviceCount !== 1 ? 's' : ''}` : 'Send Notification'}
          </Button>
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
