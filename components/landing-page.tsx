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
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import Image from 'next/image'
import { useRef } from 'react'

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

// Scroll-reveal animation component
function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function LandingPage() {
  const router = useRouter()
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Parallax effect for hero section
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -50])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.3])

  return (
  <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-bg-canvas via-bg-card to-bg-canvas flex flex-col overflow-x-hidden">
      {/* Animated background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Hero Section with Parallax */}
      <motion.div
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 text-center pt-20 pb-12 px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-fg-default mb-6 tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Agentic RAG
            </span>
            <br />
            <span className="text-fg-default">Engine</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-fg-muted mb-12 max-w-3xl mx-auto font-light"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Simple, Powerful, Trusted
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Main Call to Action with enhanced animations */}
      <div className="relative z-10 flex items-center justify-center px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.02 }}
          className="max-w-xl w-full"
        >
          <Card
            className="cursor-pointer transition-all duration-500 hover:shadow-2xl border-2 border-stroke-divider bg-bg-card/90 backdrop-blur-sm hover:bg-bg-card hover:border-accent overflow-hidden group"
            onClick={() => router.push('/test')}
          >
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-indigo-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:via-indigo-500/5 group-hover:to-blue-500/5 transition-all duration-500" />

            <CardHeader className="pb-6 relative">
              <div className="flex flex-col items-center text-center">
                <motion.div
                  className="p-5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Image
                    src="/icons/ai-foundry.png"
                    alt="Azure AI Foundry Knowledge"
                    width={48}
                    height={48}
                    className="brightness-0 invert"
                  />
                </motion.div>
                <CardTitle className="text-3xl text-fg-default mb-3">
                  Azure AI Foundry Knowledge
                </CardTitle>
                <CardDescription className="text-lg text-fg-muted max-w-md">
                  Intelligent knowledge retrieval and agentic chat experiences powered by Azure AI Search and Foundry Agent Service
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <Button
                className="w-full h-14 text-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 group"
                size="lg"
                onClick={() => router.push('/test')}
              >
                Try Now
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronRight20Regular className="ml-2 h-6 w-6" />
                </motion.div>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Value Propositions with Scroll Reveal */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-fg-default mb-4">
              Key Features
            </h2>
            <p className="text-fg-muted max-w-2xl mx-auto">
              Everything you need to build intelligent knowledge systems
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8">
          {valuePropositions.map((prop, index) => (
            <ScrollReveal key={prop.title} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center p-8 rounded-2xl bg-bg-card/50 backdrop-blur-sm border border-stroke-divider/50 hover:border-accent/50 hover:shadow-xl transition-all duration-300 h-full"
              >
                <motion.div
                  className="mb-6 p-4 rounded-full bg-gradient-to-br from-accent-subtle to-accent/10"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <prop.icon className="h-7 w-7 text-accent" />
                </motion.div>
                <h3 className="text-xl font-semibold text-fg-default mb-3">
                  {prop.title}
                </h3>
                <p className="text-fg-muted leading-relaxed">
                  {prop.description}
                </p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Customer Benefits with Scroll Reveal */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-fg-default mb-4">
              Primary Customer Benefits
            </h2>
            <p className="text-fg-muted max-w-2xl mx-auto">
              Built for enterprise teams that need reliable, scalable knowledge systems
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8">
          {customerBenefits.map((benefit, index) => (
            <ScrollReveal key={benefit.title} delay={index * 0.1}>
              <motion.div
                whileHover={{ x: 8 }}
                transition={{ duration: 0.3 }}
                className="group flex flex-col p-8 rounded-2xl bg-bg-card/50 backdrop-blur-sm border border-stroke-divider/50 hover:border-accent/50 hover:shadow-xl transition-all duration-300 h-full"
              >
                <div className="flex items-start mb-4">
                  <motion.span
                    className="text-2xl text-accent mr-3 mt-1"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
                  >
                    •
                  </motion.span>
                  <h3 className="text-xl font-semibold text-fg-default group-hover:text-accent transition-colors duration-300">
                    {benefit.title}
                  </h3>
                </div>
                <p className="text-fg-muted pl-8 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Knowledge Sources Showcase with Scroll Reveal */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-fg-default mb-4">
              Connect Any Data Source
            </h2>
            <p className="text-lg text-fg-muted max-w-3xl mx-auto">
              Seamlessly integrate with your existing data infrastructure across cloud storage, databases,
              collaboration platforms, and more
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {knowledgeSourceTypes.map((source, index) => (
              <motion.div
                key={source.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.03 }}
                whileHover={{ y: -8, scale: 1.05 }}
                className="group flex flex-col items-center p-5 rounded-2xl bg-bg-card/40 backdrop-blur-sm border border-stroke-divider/40 hover:border-accent/50 hover:bg-bg-card/60 hover:shadow-lg transition-all duration-300"
              >
                <motion.div
                  className="w-14 h-14 mb-4 flex items-center justify-center rounded-xl bg-gradient-to-br from-bg-canvas/80 to-bg-subtle/50 group-hover:from-accent-subtle/30 group-hover:to-accent/10"
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Image
                    src={source.icon}
                    alt={source.name}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </motion.div>
                <h3 className="text-xs font-semibold text-fg-default text-center mb-2 line-clamp-2 min-h-[2rem]">
                  {source.name}
                </h3>
                <span className="text-xs text-fg-muted font-medium">
                  {source.category}
                </span>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="text-center mt-12">
            <p className="text-fg-muted">
              And many more through our extensible connector architecture
            </p>
          </div>
        </ScrollReveal>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-stroke-divider bg-bg-card/80 backdrop-blur-sm px-6 py-8 text-sm text-fg-muted mt-auto">
        <div className="max-w-6xl mx-auto text-center">
          <p>
            Made with <span role="img" aria-label="love">❤️</span> by Azure AI Search Product Group
          </p>
        </div>
      </footer>

      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />
    </div>
  )
}