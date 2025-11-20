import { useState } from 'react'
import Layout from './components/Layout'
import BannerList from './components/BannerList'
import BannerForm from './components/BannerForm'

function App() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const onCreate = () => { setEditing(null); setOpen(true) }
  const onEdit = (item) => { setEditing(item); setOpen(true) }

  return (
    <Layout onCreate={onCreate}>
      <BannerList onEdit={onEdit} />
      <BannerForm open={open} onClose={() => setOpen(false)} onSaved={() => window.location.reload()} editing={editing} />
    </Layout>
  )
}

export default App
