'use client'

import { useParams } from 'next/navigation'
import ToolForm from '@/components/admin/ToolForm'

export default function EditAndroidPage() {
  const params = useParams()
  return <ToolForm type="android" mode="edit" editId={parseInt(params.id as string)} />
}
