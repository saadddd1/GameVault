'use client'

import { useParams } from 'next/navigation'
import ToolForm from '@/components/admin/ToolForm'

export default function EditWindowsPage() {
  const params = useParams()
  return <ToolForm type="windows" mode="edit" editId={parseInt(params.id as string)} />
}
