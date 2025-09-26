'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Search20Regular,
  Bot20Regular,
  Globe20Regular,
  ShieldCheckmark20Regular,
  Settings20Regular,
  ChevronRight20Regular
} from '@fluentui/react-icons'
import { usePath } from '@/lib/path-context'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'

const valuePropositions = [
  {
    icon: Bot20Regular,
    title: "Effortless Agent Grounding",
    description: "Build agents that think, not search. One API connects your agent to all enterprise knowledge - from databases to documents to live web data."
  },
  {
    icon: Globe20Regular,
    title: "Intelligent Knowledge Synthesis",
    description: "Get answers, not search results. AI-powered query planning delivers contextual, synthesized responses across all your data sources."
  },
  {
    icon: Settings20Regular,
    title: "Zero-Setup Knowledge Foundation",
    description: "Connect any data source instantly. From SharePoint to SQL databases - no indexing, no ETL, no infrastructure management required."
  }
]

const pathOptions = [
  {
    id: 'azure-ai-search' as const,
    title: 'Azure AI Search Standalone',
    subtitle: 'Knowledge APIs',
    description: 'Use if you want to leverage Azure AI Search Knowledge Base end-to-end',
    icon: Search20Regular,
    gradient: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'foundry-agent-service' as const,
    title: 'Azure AI Search + Foundry',
    subtitle: 'Agent Service',
    description: 'Azure AI Search knowledge bases with Foundry Agent Service for grounding',
    icon: ShieldCheckmark20Regular,
    gradient: 'from-purple-500 to-indigo-600'
  }
]

const knowledgeSourceTypes = [
  { name: 'Azure Blob Storage', icon: '/icons/blob.svg', category: 'Cloud Storage' },
  { name: 'Azure Data Lake Gen2', icon: '/icons/adlsgen2.svg', category: 'Cloud Storage' },
  { name: 'OneLake', icon: '/icons/onelake.svg', category: 'Cloud Storage' },
  { name: 'Microsoft Fabric', icon: '/icons/fabric.svg', category: 'Analytics' },
  { name: 'SQL Database', icon: '/icons/sql.svg', category: 'Databases' },
  { name: 'Cosmos DB', icon: '/icons/cosmosdb.svg', category: 'Databases' },
  { name: 'Bing Search', icon: '/icons/bing.svg', category: 'Web & Search' },
  { name: 'Web Sources', icon: '/icons/web.svg', category: 'Web & Search' },
  { name: 'SharePoint', icon: '/icons/sharepoint.svg', category: 'Collaboration' },
  { name: 'Microsoft 365', icon: '/icons/m365.svg', category: 'Collaboration' },
  { name: 'GitHub', icon: '/icons/github-mark.svg', category: 'Code & Dev' },
  { name: 'MCP Servers', icon: '/icons/mcp.svg', category: 'Protocols' }
]

export function LandingPage() {
  const { setSelectedPath } = usePath()
  const router = useRouter()

  const handlePathSelection = (pathId: 'azure-ai-search' | 'foundry-agent-service') => {
    setSelectedPath(pathId)
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-canvas via-bg-card to-bg-canvas flex flex-col">
      {/* Header */}
      <div className="text-center pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-fg-default mb-4">
            Azure AI Search
          </h1>
          <p className="text-xl text-fg-muted mb-12 max-w-2xl mx-auto px-4">
            Knowledge Retrieval and Agentic RAG Platform
          </p>
        </motion.div>

        {/* Value Propositions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-6xl mx-auto px-4 mb-16"
        >
          <div className="grid md:grid-cols-3 gap-8">
            {valuePropositions.map((prop, index) => (
              <motion.div
                key={prop.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="flex flex-col items-center text-center p-6 rounded-lg bg-bg-card/50 backdrop-blur-sm border border-stroke-divider/50"
              >
                <div className="mb-4 p-3 rounded-full bg-accent-subtle">
                  <prop.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-fg-default mb-2">
                  {prop.title}
                </h3>
                <p className="text-sm text-fg-muted">
                  {prop.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Knowledge Sources Showcase */}
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-semibold text-fg-default mb-3">
            Connect Any Data Source
          </h2>
          <p className="text-fg-muted max-w-2xl mx-auto">
            Seamlessly integrate with your existing data infrastructure across cloud storage, databases,
            collaboration platforms, and more
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {knowledgeSourceTypes.map((source, index) => (
            <motion.div
              key={source.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.9 + index * 0.05 }}
              className="group flex flex-col items-center p-4 rounded-lg bg-bg-card/30 backdrop-blur-sm border border-stroke-divider/30 hover:border-stroke-control hover:bg-bg-card/50 transition-all duration-300"
            >
              <div className="w-12 h-12 mb-3 flex items-center justify-center rounded-lg bg-bg-canvas/50 group-hover:scale-110 transition-transform duration-300">
                <Image
                  src={source.icon}
                  alt={source.name}
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xs font-medium text-fg-default text-center mb-1 line-clamp-2">
                {source.name}
              </h3>
              <span className="text-xs text-fg-muted">
                {source.category}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center mt-6"
        >
          <p className="text-sm text-fg-muted">
            And many more through our extensible connector architecture
          </p>
        </motion.div>
      </div>

      {/* Path Selection */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="max-w-4xl w-full"
        >
          <h2 className="text-2xl font-semibold text-center text-fg-default mb-8">
            Choose Your Path
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {pathOptions.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.5 + index * 0.1 }}
                className="group"
              >
                <Card
                  className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-stroke-divider bg-bg-card/80 backdrop-blur-sm hover:bg-bg-card"
                  onClick={() => handlePathSelection(option.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${option.gradient}`}>
                        <option.icon className="h-6 w-6 text-white" />
                      </div>
                      <ChevronRight20Regular className="h-5 w-5 text-fg-muted group-hover:text-accent transition-colors" />
                    </div>
                    <CardTitle className="text-xl text-fg-default">
                      {option.title}
                    </CardTitle>
                    <CardDescription className="text-base font-medium text-accent">
                      {option.subtitle}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-fg-muted leading-relaxed">
                      {option.description}
                    </p>
                    <Button
                      className="w-full mt-4 group-hover:bg-accent group-hover:text-fg-on-accent transition-colors"
                      variant="outline"
                    >
                      Get Started
                      <ChevronRight20Regular className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}