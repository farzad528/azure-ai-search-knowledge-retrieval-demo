'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Bot20Regular,
  Globe20Regular,
  Settings20Regular,
  ChevronRight20Regular
} from '@fluentui/react-icons'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'

const valuePropositions = [
  {
    icon: Bot20Regular,
    title: "One API for agent grounding",
    description: "Connect your agents to all data via one centralized entry point"
  },
  {
    icon: Globe20Regular,
    title: "Multi-source agentic RAG",
    description: "A unified retrieval pipeline with LLM-powered query planning for full context"
  },
  {
    icon: Settings20Regular,
    title: "Automated data processing",
    description: "All extraction, enrichment, embedding and storing is done for you"
  }
]

const customerBenefits = [
  {
    title: "Agentic RAG engine",
    description: "Maximize the most out of your data with an advanced RAG engine that works out of the box. Pull relevant information across multiple sources using query planning, multi-hop reasoning and agent-optimized response synthesis."
  },
  {
    title: "Zero-friction agent context",
    description: "Add expert domain knowledge to your Foundry agents in one click, without leaving the portal."
  },
  {
    title: "Enterprise-ready from day one",
    description: "Built-in security, compliance, and Purview integration vs. fragmented systems siloed by source."
  },
  {
    title: "Centralized RAG expertise",
    description: "Foundry Knowledge was designed to ground enterprise agents, so developers don't need to become RAG experts. Focus on agent logic instead of knowledge infrastructure plumbing."
  }
]


const knowledgeSourceTypes = [
  { name: 'Azure Blob Storage', icon: '/icons/blob.svg', category: 'Cloud Storage' },
  { name: 'Microsoft OneLake', icon: '/icons/onelake.svg', category: 'Cloud Storage' },
  { name: 'Azure AI Search', icon: '/icons/search_icon.svg', category: 'AI & Search' },
  { name: 'MCP', icon: '/icons/mcp.svg', category: 'Protocols' },
  { name: 'Azure SQL', icon: '/icons/sql.svg', category: 'Databases' },
  { name: 'Azure Cosmos DB', icon: '/icons/cosmosdb.svg', category: 'Databases' },
  { name: 'ADLS Gen2', icon: '/icons/adlsgen2.svg', category: 'Cloud Storage' },
  { name: 'Azure Table Storage', icon: '/icons/blob.svg', category: 'Cloud Storage' },
  { name: 'Web', icon: '/icons/web.svg', category: 'Web & Search' },
  { name: 'SharePoint (Remote)', icon: '/icons/sharepoint.svg', category: 'Collaboration' },
  { name: 'SharePoint (Synced)', icon: '/icons/sharepoint.svg', category: 'Collaboration' },
  { name: 'Fabric Ontology', icon: '/icons/web.svg', category: 'Knowledge Graph' }
]

export function LandingPage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/test')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-canvas via-bg-card to-bg-canvas flex flex-col">
      {/* Header */}
      <div className="text-center pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-fg-default mb-4">
            Azure AI Foundry Knowledge
          </h1>
          <p className="text-xl text-fg-muted mb-8 max-w-2xl mx-auto px-4">
            Knowledge Retrieval and Agentic RAG Platform
          </p>
        </motion.div>
      </div>

      {/* Main Call to Action */}
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-xl w-full"
        >
          <Card
            className="cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 border-2 border-stroke-divider bg-bg-card/90 backdrop-blur-sm hover:bg-bg-card hover:border-accent"
            onClick={() => router.push('/test')}
          >
            <CardHeader className="pb-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 mb-6">
                  <Image
                    src="/icons/ai-foundry.png"
                    alt="Azure AI Foundry Knowledge"
                    width={48}
                    height={48}
                    className="brightness-0 invert"
                  />
                </div>
                <CardTitle className="text-3xl text-fg-default mb-3">
                  Azure AI Foundry Knowledge
                </CardTitle>
                <CardDescription className="text-lg text-fg-muted max-w-md">
                  Intelligent knowledge retrieval and agentic chat experiences powered by Azure AI Search and Foundry Agent Service
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full h-14 text-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 transition-all duration-300"
                size="lg"
                onClick={() => router.push('/test')}
              >
                Try Now
                <ChevronRight20Regular className="ml-2 h-6 w-6" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Value Propositions - Moved Below */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl font-semibold text-fg-default mb-3">
            Key Features
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <div className="grid md:grid-cols-3 gap-8">
            {valuePropositions.map((prop, index) => (
              <motion.div
                key={prop.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1 + index * 0.1 }}
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

      {/* Customer Benefits */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl font-semibold text-fg-default mb-3">
            Primary Customer Benefits
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <div className="grid md:grid-cols-2 gap-6">
            {customerBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.5 + index * 0.1 }}
                className="flex flex-col p-6 rounded-lg bg-bg-card/50 backdrop-blur-sm border border-stroke-divider/50"
              >
                <div className="flex items-start mb-3">
                  <span className="text-accent mr-2 mt-0.5">•</span>
                  <h3 className="text-lg font-semibold text-fg-default">
                    {benefit.title}
                  </h3>
                </div>
                <p className="text-sm text-fg-muted pl-5">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Knowledge Sources Showcase - Moved to Bottom */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
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
          transition={{ duration: 0.6, delay: 1.6 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {knowledgeSourceTypes.map((source, index) => (
            <motion.div
              key={source.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 1.7 + index * 0.02 }}
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
          transition={{ duration: 0.6, delay: 2.0 }}
          className="text-center mt-6"
        >
          <p className="text-sm text-fg-muted">
            And many more through our extensible connector architecture
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-stroke-divider px-6 py-4 text-xs text-fg-muted flex items-center justify-center">
        <span>Made with <span role="img" aria-label="love">❤️</span> by Azure AI Search Product Group</span>
      </footer>
    </div>
  )
}