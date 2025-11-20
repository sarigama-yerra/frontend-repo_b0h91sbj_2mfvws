import { useEffect, useMemo, useState } from 'react'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

const initial = {
  title: '',
  category: 'festival',
  variant: 'banner', // banner | text
  banner_image_url: '',
  button_name: '',
  text: '',
  bg_color: '#ffffff',
  vendor: false,
  shinr: false,
  vendor_id: '',
  vendor_name: '',
  is_premium_vendor: false,
  show_in_home_page: false,
  target_value: '',
  whom_to_show: 'all',
  customers_file_name: '',
  locations: [],
  timing: {
    start_time: '',
    end_time: '',
    continuous: false,
  },
  status: 'draft',
  review_status: 'pending',
}

function BannerForm({ open, onClose, onSaved, editing }) {
  const [data, setData] = useState(initial)
  const [vendors, setVendors] = useState([])
  const [vendorQuery, setVendorQuery] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editing) {
      setData({ ...initial, ...editing })
    } else if (open) {
      setData(initial)
    }
  }, [open, editing])

  useEffect(() => {
    if (vendorQuery.length === 0) return setVendors([])
    const id = setTimeout(async () => {
      const res = await fetch(`${BACKEND}/api/vendors?q=${encodeURIComponent(vendorQuery)}`)
      const json = await res.json()
      setVendors(json)
    }, 300)
    return () => clearTimeout(id)
  }, [vendorQuery])

  const handleChange = (key, value) => setData(d => ({ ...d, [key]: value }))
  const handleTiming = (key, value) => setData(d => ({ ...d, timing: { ...d.timing, [key]: value } }))

  const save = async (asDraft = false) => {
    setSaving(true)
    try {
      const payload = { ...data }
      if (asDraft) payload.status = 'draft'

      // Convert time inputs to ISO strings
      const toISO = (v) => v ? new Date(v).toISOString() : null
      payload.timing = {
        start_time: toISO(payload.timing.start_time) || new Date().toISOString(),
        end_time: toISO(payload.timing.end_time) || null,
        continuous: payload.timing.continuous,
      }

      const method = editing?.id ? 'PATCH' : 'POST'
      const url = editing?.id ? `${BACKEND}/api/banners/${editing.id}` : `${BACKEND}/api/banners`
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to save')
      onSaved?.()
      onClose?.()
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-black/40 p-4 overflow-auto">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">{editing ? 'Edit Banner' : 'Create Banner'}</h3>
          <button className="text-slate-500 hover:text-slate-700" onClick={onClose}>✕</button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-sm text-slate-600">Title</span>
              <input className="w-full border rounded px-3 py-2" value={data.title} onChange={e => handleChange('title', e.target.value)} placeholder="Banner title" />
            </label>
            <label className="space-y-1">
              <span className="text-sm text-slate-600">Category</span>
              <select className="w-full border rounded px-3 py-2" value={data.category} onChange={e => handleChange('category', e.target.value)}>
                <option value="festival">Festival</option>
                <option value="sale">Sale</option>
                <option value="general">General</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="space-y-1">
              <span className="text-sm text-slate-600">Type</span>
              <select className="w-full border rounded px-3 py-2" value={data.variant} onChange={e => handleChange('variant', e.target.value)}>
                <option value="banner">Banner</option>
                <option value="text">Text</option>
              </select>
            </label>
            {data.variant === 'banner' && (
              <label className="space-y-1">
                <span className="text-sm text-slate-600">Banner Image URL</span>
                <input className="w-full border rounded px-3 py-2" value={data.banner_image_url} onChange={e => handleChange('banner_image_url', e.target.value)} placeholder="https://..." />
              </label>
            )}
            <label className="space-y-1">
              <span className="text-sm text-slate-600">Button Name</span>
              <input className="w-full border rounded px-3 py-2" value={data.button_name} onChange={e => handleChange('button_name', e.target.value)} placeholder="Shop Now" />
            </label>
          </div>

          {data.variant === 'text' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1">
                <span className="text-sm text-slate-600">Text</span>
                <textarea className="w-full border rounded px-3 py-2" rows={3} value={data.text} onChange={e => handleChange('text', e.target.value)} />
              </label>
              <label className="space-y-1">
                <span className="text-sm text-slate-600">Background Color</span>
                <input type="color" className="w-24 h-10 p-1 border rounded" value={data.bg_color} onChange={e => handleChange('bg_color', e.target.value)} />
              </label>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.vendor} onChange={e => handleChange('vendor', e.target.checked)} />
              <span>Vendor</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.shinr} onChange={e => handleChange('shinr', e.target.checked)} />
              <span>Shinr</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={data.show_in_home_page} onChange={e => handleChange('show_in_home_page', e.target.checked)} />
              <span>Show in Home Page</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-sm text-slate-600">Vendor Search</span>
              <input className="w-full border rounded px-3 py-2" placeholder="Search vendor..." value={vendorQuery} onChange={e => setVendorQuery(e.target.value)} />
              {vendors.length > 0 && (
                <div className="border rounded divide-y max-h-48 overflow-auto mt-2">
                  {vendors.map(v => (
                    <button key={v.id} type="button" onClick={() => {handleChange('vendor_id', v.id); handleChange('vendor_name', v.name); handleChange('is_premium_vendor', !!v.is_premium)}} className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between">
                      <span>{v.name}{v.code ? ` (${v.code})` : ''}</span>
                      {v.is_premium && <span className="text-xs text-amber-600 font-medium">PV</span>}
                    </button>
                  ))}
                </div>
              )}
            </label>
            <label className="space-y-1">
              <span className="text-sm text-slate-600">Target Value</span>
              <input className="w-full border rounded px-3 py-2" value={data.target_value} onChange={e => handleChange('target_value', e.target.value)} placeholder="/collections/festival" />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-sm text-slate-600">Whom to show</span>
              <select className="w-full border rounded px-3 py-2" value={data.whom_to_show} onChange={e => handleChange('whom_to_show', e.target.value)}>
                <option value="all">All customers</option>
                <option value="customers_set">Set of customers (upload later)</option>
                <option value="new_joinee">New joinee</option>
                <option value="location_based">Location based</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm text-slate-600">Button Label</span>
              <input className="w-full border rounded px-3 py-2" value={data.button_name} onChange={e => handleChange('button_name', e.target.value)} placeholder="Explore" />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="space-y-1">
              <span className="text-sm text-slate-600">Start Time</span>
              <input type="datetime-local" className="w-full border rounded px-3 py-2" value={data.timing.start_time} onChange={e => handleTiming('start_time', e.target.value)} />
            </label>
            <label className="space-y-1">
              <span className="text-sm text-slate-600">End Time (optional)</span>
              <input type="datetime-local" className="w-full border rounded px-3 py-2" value={data.timing.end_time} onChange={e => handleTiming('end_time', e.target.value)} />
            </label>
            <label className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={data.timing.continuous} onChange={e => handleTiming('continuous', e.target.checked)} />
              <span>Continuous</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="space-y-1">
              <span className="text-sm text-slate-600">Status</span>
              <select className="w-full border rounded px-3 py-2" value={data.status} onChange={e => handleChange('status', e.target.value)}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm text-slate-600">Review Status</span>
              <select className="w-full border rounded px-3 py-2" value={data.review_status} onChange={e => handleChange('review_status', e.target.value)}>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>
          </div>
        </div>
        <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-end gap-3">
          <button className="px-4 py-2 rounded border" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 rounded border" onClick={() => save(true)} disabled={saving}>Save as Draft</button>
          <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={() => save(false)} disabled={saving}>{editing ? 'Update' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}

export default BannerForm
