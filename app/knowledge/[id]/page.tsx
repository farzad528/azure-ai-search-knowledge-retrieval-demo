'use client'

import { useRouter, useParams } from 'next/navigation'
import { useEffect } from 'react'

export default function KnowledgeDetailPage() {
  const router = useRouter()
  const params = useParams()
  
  useEffect(() => {
    // Redirect to the edit page
    if (params?.id) {
      router.replace(`/knowledge/${params.id}/edit`)
    }
  }, [params?.id, router])

  return null
}
