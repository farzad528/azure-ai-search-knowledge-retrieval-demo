'use client'

import { useState } from 'react'
import { ChevronDown20Regular, ChevronUp20Regular } from '@fluentui/react-icons'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { cn } from '@/lib/utils'

type MCPToolCall = {
  toolName: string
  serverURL: string
  ref_id: number
  title?: string
  content: string
}

type MCPToolCallDisplayProps = {
  toolCalls: MCPToolCall[]
  className?: string
}

export function MCPToolCallDisplay({ toolCalls, className }: MCPToolCallDisplayProps) {
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set())

  const toggleExpanded = (index: number) => {
    setExpandedIndices(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  if (!toolCalls || toolCalls.length === 0) return null

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 text-xs font-medium text-fg-muted uppercase tracking-wide">
        <Image 
          src="/icons/tools.svg" 
          alt="Tools" 
          width={14} 
          height={14}
          className="opacity-70"
        />
        <span>MCP Tool Calls</span>
      </div>
      
      {toolCalls.map((toolCall, index) => {
        const isExpanded = expandedIndices.has(index)
        let parsedContent: {
          raw?: any
          naturalLanguageQuery?: string
          naturalLanguageResponse?: string
        } = {}
        
        try {
          parsedContent = JSON.parse(toolCall.content)
        } catch (err) {
          console.error('Failed to parse tool call content:', err)
        }

        return (
          <Card 
            key={index} 
            className="border border-stroke-divider bg-bg-subtle hover:border-accent/40 transition-colors"
          >
            <CardContent className="p-4">
              {/* Tool Header */}
              <button
                onClick={() => toggleExpanded(index)}
                className="w-full flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-accent-subtle border border-accent/20">
                    <Image 
                      src="/icons/tools.svg" 
                      alt="Tool" 
                      width={16} 
                      height={16}
                      className="text-accent"
                    />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-fg-default group-hover:text-accent transition-colors">
                      {toolCall.toolName}
                    </div>
                    {parsedContent.naturalLanguageQuery && (
                      <div className="text-xs text-fg-muted mt-0.5">
                        Query: {parsedContent.naturalLanguageQuery}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronUp20Regular className="h-4 w-4 text-fg-muted group-hover:text-accent transition-colors" />
                  ) : (
                    <ChevronDown20Regular className="h-4 w-4 text-fg-muted group-hover:text-accent transition-colors" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-4 pt-4 border-t border-stroke-divider">
                      {/* Tool Name */}
                      <div>
                        <div className="text-[10px] font-medium text-fg-muted uppercase tracking-wider mb-1">
                          Tool Name
                        </div>
                        <div className="text-sm font-mono bg-bg-default border border-stroke-divider rounded px-3 py-2">
                          {toolCall.toolName}
                        </div>
                      </div>

                      {/* Natural Language Query */}
                      {parsedContent.naturalLanguageQuery && (
                        <div>
                          <div className="text-[10px] font-medium text-fg-muted uppercase tracking-wider mb-1">
                            Natural Language Query
                          </div>
                          <div className="text-sm bg-bg-default border border-stroke-divider rounded px-3 py-2 text-fg-default">
                            {parsedContent.naturalLanguageQuery}
                          </div>
                        </div>
                      )}

                      {/* Natural Language Response */}
                      {parsedContent.naturalLanguageResponse && (
                        <div>
                          <div className="text-[10px] font-medium text-fg-muted uppercase tracking-wider mb-1">
                            Natural Language Response
                          </div>
                          <div className="text-sm bg-bg-default border border-stroke-divider rounded px-3 py-2 max-h-96 overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-fg-default leading-relaxed font-sans">
                              {parsedContent.naturalLanguageResponse}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Server URL (collapsed by default) */}
                      <details className="group/url">
                        <summary className="text-[10px] font-medium text-fg-muted uppercase tracking-wider cursor-pointer hover:text-accent transition-colors">
                          Server URL
                        </summary>
                        <div className="mt-1 text-xs font-mono bg-bg-default border border-stroke-divider rounded px-3 py-2 text-fg-muted break-all">
                          {toolCall.serverURL}
                        </div>
                      </details>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
