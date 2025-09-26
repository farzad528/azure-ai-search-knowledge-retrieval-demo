'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/shared/page-header'
import {
  Database20Regular,
  ArrowLeft20Regular,
  Document20Regular,
  Globe20Regular,
  FolderOpen20Regular
} from '@fluentui/react-icons'
import Link from 'next/link'
import { motion } from 'framer-motion'

const sourceTypes = [
  {
    id: 'document',
    name: 'Documents',
    description: 'Upload PDF, Word, or text documents',
    icon: Document20Regular
  },
  {
    id: 'website',
    name: 'Website',
    description: 'Crawl and index web content',
    icon: Globe20Regular
  },
  {
    id: 'folder',
    name: 'File Folder',
    description: 'Index files from a folder',
    icon: FolderOpen20Regular
  }
]

export default function CreateKnowledgeBasePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sourceType: '',
    sourceConfig: {}
  })
  const [creating, setCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.sourceType) return

    setCreating(true)
    try {
      // Redirect to existing knowledge sources creation for simplicity
      // In a real implementation, this would create via Foundry APIs
      router.push('/knowledge-sources/quick-create')
    } catch (error) {
      console.error('Error creating knowledge base:', error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Knowledge Base"
        description="Set up a new knowledge base for your agents"
        icon={Database20Regular}
        breadcrumb={
          <Button variant="ghost" size="sm" asChild>
            <Link href="/knowledge">
              <ArrowLeft20Regular className="h-4 w-4 mr-2" />
              Back to Knowledge
            </Link>
          </Button>
        }
      />

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide basic details for your knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-fg-default">
                  Name *
                </label>
                <Input
                  id="name"
                  placeholder="Enter knowledge base name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-fg-default">
                  Description
                </label>
                <Textarea
                  id="description"
                  placeholder="Describe what this knowledge base contains"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Source Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Source</CardTitle>
              <CardDescription>
                Choose the type of content to include in your knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {sourceTypes.map((type, index) => (
                  <motion.div
                    key={type.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        formData.sourceType === type.id
                          ? 'border-accent bg-accent-subtle'
                          : 'border-stroke-divider hover:border-stroke-control hover:bg-bg-hover'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, sourceType: type.id }))}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          formData.sourceType === type.id ? 'bg-accent text-white' : 'bg-bg-subtle'
                        }`}>
                          <type.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-fg-default">{type.name}</h3>
                          <p className="text-sm text-fg-muted">{type.description}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href="/knowledge">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={!formData.name || !formData.sourceType || creating}
            >
              {creating ? 'Creating...' : 'Create Knowledge Base'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}