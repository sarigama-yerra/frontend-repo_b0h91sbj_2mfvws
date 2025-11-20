import { useEffect, useMemo, useState } from 'react'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

const StatusBadge = ({ value }) => (
  <span className={`px-2 py-1 rounded text-xs font-medium ${value === 'active' ? 'bg-green-100 text-green-700' : value === 'inactive' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-700'}`}>{value}</span>
)

const ReviewBadge = ({ value }) => (
  <span className={`px-2 py-1 rounded text-xs font-medium ${value === 'approved' ? 'bg-emerald-100 text-emerald-700' : value === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>{value}</span>
)

function BannerList({ onEdit }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [review, setReview] = useState('')
  const [vendorFlag, setVendorFlag] = useState('')
  const [shinrFlag, setShinrFlag] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (status) params.set('status', status)
    if (review) params.set('review_status', review)
    if (vendorFlag) params.set('vendor', vendorFlag === 'true')
    if (shinrFlag) params.set('shinr', shinrFlag === 'true')
    if (dateFrom) params.set('published_from', new Date(dateFrom).toISOString())
    if (dateTo) params.set('published_to', new Date(dateTo).toISOString())

    const res = await fetch(`${BACKEND}/api/banners?${params.toString()}`)
    const json = await res.json()
    setItems(json)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id, patch) => {
    await fetch(`${BACKEND}/api/banners/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    await load()
  }

  const remove = async (id) => {
    if (!confirm('Delete this banner?')) return
    await fetch(`${BACKEND}/api/banners/${id}`, { method: 'DELETE' })
    await load()
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm text-slate-600">Search</label>
          <input className="w-full border rounded px-3 py-2" placeholder="Search by title, text, vendor" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-slate-600">Status</label>
          <select className="w-full border rounded px-3 py-2" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-600">Review</label>
          <select className="w-full border rounded px-3 py-2" value={review} onChange={e => setReview(e.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-600">Vendor</label>
          <select className="w-full border rounded px-3 py-2" value={vendorFlag} onChange={e => setVendorFlag(e.target.value)}>
            <option value="">All</option>
            <option value="true">Vendor</option>
            <option value="false">Not Vendor</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-600">Shinr</label>
          <select className="w-full border rounded px-3 py-2" value={shinrFlag} onChange={e => setShinrFlag(e.target.value)}>
            <option value="">All</option>
            <option value="true">Shinr</option>
            <option value="false">Not Shinr</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-600">Published From</label>
          <input type="datetime-local" className="w-full border rounded px-3 py-2" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-slate-600">Published To</label>
          <input type="datetime-local" className="w-full border rounded px-3 py-2" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded bg-slate-100 border" onClick={load}>Search</button>
          <button className="px-4 py-2 rounded border" onClick={() => {setQuery(''); setStatus(''); setReview(''); setVendorFlag(''); setShinrFlag(''); setDateFrom(''); setDateTo('');}}>Reset</button>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 text-left text-slate-600 text-sm">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Review</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Publish</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6 text-center" colSpan={7}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="px-4 py-6 text-center" colSpan={7}>No banners found</td></tr>
            ) : (
              items.map(b => (
                <tr key={b.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{b.title}</div>
                    <div className="text-xs text-slate-500">{b.category || '-'}{b.vendor_name ? ` • ${b.vendor_name}` : ''}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{b.variant}</td>
                  <td className="px-4 py-3"><StatusBadge value={b.status} /></td>
                  <td className="px-4 py-3"><ReviewBadge value={b.review_status} /></td>
                  <td className="px-4 py-3 text-slate-600">{b.vendor ? (b.is_premium_vendor ? 'Vendor (PV)' : 'Vendor') : (b.shinr ? 'Shinr' : '-')}</td>
                  <td className="px-4 py-3 text-slate-600">{b?.timing?.start_time ? new Date(b.timing.start_time).toLocaleString() : '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="relative group">
                        <button className="px-2 py-1 rounded border">⋯</button>
                        <div className="absolute right-0 mt-2 hidden group-hover:block bg-white border rounded shadow z-10">
                          <button onClick={() => updateStatus(b.id, { status: 'active' })} className="block w-full text-left px-3 py-2 hover:bg-slate-50">Mark Active</button>
                          <button onClick={() => updateStatus(b.id, { status: 'draft' })} className="block w-full text-left px-3 py-2 hover:bg-slate-50">Mark Draft</button>
                          <button onClick={() => updateStatus(b.id, { status: 'inactive' })} className="block w-full text-left px-3 py-2 hover:bg-slate-50">Mark Inactive</button>
                          <div className="border-t" />
                          <button onClick={() => updateStatus(b.id, { review_status: 'approved' })} className="block w-full text-left px-3 py-2 hover:bg-slate-50">Approve</button>
                          <button onClick={() => updateStatus(b.id, { review_status: 'rejected' })} className="block w-full text-left px-3 py-2 hover:bg-slate-50">Reject</button>
                          <button onClick={() => updateStatus(b.id, { review_status: 'pending' })} className="block w-full text-left px-3 py-2 hover:bg-slate-50">Mark Pending</button>
                        </div>
                      </div>
                      <button className="px-2 py-1 rounded border" title="Edit" onClick={() => onEdit(b)}>✎</button>
                      <button className="px-2 py-1 rounded border text-rose-600" title="Delete" onClick={() => remove(b.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default BannerList
