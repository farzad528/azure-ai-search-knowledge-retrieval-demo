'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { 
  Search20Regular, 
  Database20Regular, 
  Bot20Regular, 
  Play20Regular, 
  ChartMultiple20Regular, 
  Settings20Regular,
  Navigation20Regular,
  Dismiss20Regular,
  ArrowUpRight16Regular
} from '@fluentui/react-icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Tooltip } from '@/components/ui/tooltip'
import Image from 'next/image'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navigation: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: Search20Regular },
  { href: '/knowledge-sources', label: 'Knowledge sources', icon: Database20Regular },
  { href: '/knowledge-agents', label: 'Knowledge agents', icon: Bot20Regular },
  { href: '/playground', label: 'Playground', icon: Play20Regular },
  { href: '/activity', label: 'Activity', icon: ChartMultiple20Regular },
  { href: '/settings', label: 'Settings', icon: Settings20Regular },
]

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [collapsed, setCollapsed] = React.useState(false)
  const pathname = usePathname()

  // Load persisted collapse state
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('sidebarCollapsed')
      if (stored === 'true') setCollapsed(true)
    } catch {}
  }, [])

  const toggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev
      try { localStorage.setItem('sidebarCollapsed', String(next)) } catch {}
      return next
    })
  }

  // Keyboard shortcut Ctrl+B to toggle collapse (similar to VS Code sidebar)
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        toggleCollapse();
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="min-h-screen bg-bg-canvas">
      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-6 focus:z-50 rounded-md bg-accent px-4 py-2 text-sm font-medium text-fg-on-accent focus:outline-none focus:ring-2 focus:ring-stroke-focus focus:ring-offset-2"
      >
        Skip to content
      </a>

      {/* Header */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

  <div className="flex">
        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-0 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="absolute inset-0 bg-black bg-opacity-50" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <Sidebar
          navigation={navigation}
            currentPath={pathname}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            collapsed={collapsed}
            onToggleCollapse={toggleCollapse}
        />

        {/* Main content */}
        <main 
          id="main-content" 
          className={cn('flex-1 min-w-0 flex flex-col min-h-[calc(100vh-4rem)] transition-[margin] duration-200', collapsed ? 'md:ml-20' : 'md:ml-64')}
        >
          <div className="flex-1 p-6 md:p-8">
            {children}
          </div>
          <footer className="border-t border-stroke-divider px-6 py-4 text-xs text-fg-muted flex items-center justify-center">
            <span>Made with <span role="img" aria-label="love">❤️</span> by Azure AI Search Product Group</span>
          </footer>
        </main>
      </div>
    </div>
  )
}

interface HeaderProps {
  onMenuClick: () => void
}

function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-stroke-divider bg-bg-card/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
  <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
          >
            <Navigation20Regular className="h-5 w-5" />
          </Button>
          
          <Link href="/" aria-label="Home" className="flex items-center gap-1.5 min-w-0 focus:outline-none focus:ring-2 focus:ring-stroke-focus rounded-sm">
            <Image src="/icons/search_icon.svg" alt="Azure AI Search" width={26} height={26} priority className="shrink-0" />
            <span className="font-semibold text-lg truncate max-w-[9rem] sm:max-w-none leading-tight">
              <span className="hidden sm:inline">Azure AI Search - Knowledge Retrieval Demo</span>
              <span className="sm:hidden">Knowledge Retrieval</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <a 
            href="https://learn.microsoft.com/rest/api/searchservice/knowledge-agents?view=rest-searchservice-2025-08-01-preview" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm font-medium text-fg-default hover:text-accent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stroke-focus rounded-sm px-1"
          >
            <span>API docs</span>
            <ArrowUpRight16Regular className="h-3.5 w-3.5" />
          </a>
          
          <Tooltip content="View on GitHub">
            <a 
              href="https://github.com/farzad528/azure-ai-search-knowledge-retrieval-demo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-fg-default hover:text-accent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stroke-focus rounded-sm px-1"
            >
              <span>Source</span>
              <Image 
                src="/icons/github-mark.svg" 
                alt="GitHub" 
                width={16} 
                height={16} 
                className="dark:hidden" 
              />
              <Image 
                src="/icons/github-mark-white.svg" 
                alt="GitHub" 
                width={16} 
                height={16} 
                className="hidden dark:block" 
              />
            </a>
          </Tooltip>
          
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="Account settings">
            <div className="h-6 w-6 rounded-full bg-accent-muted flex items-center justify-center">
              <span className="text-xs font-medium">U</span>
            </div>
          </Button>
        </div>
      </div>
    </header>
  )
}

interface SidebarProps {
  navigation: NavItem[]
  currentPath: string
  isOpen: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

function Sidebar({ navigation, currentPath, isOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <nav className={cn('hidden md:flex md:flex-col md:fixed md:inset-y-0 md:top-16 transition-[width] duration-200', collapsed ? 'md:w-20' : 'md:w-64')}
        aria-label="Primary navigation"
        aria-expanded={!collapsed}
      >
        <div className="flex flex-col flex-1 bg-bg-card border-r border-stroke-divider overflow-hidden">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className={cn('px-2 mb-4 flex justify-end', collapsed && 'justify-center')}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onToggleCollapse}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-pressed={collapsed}
              >
                <motion.span
                  initial={false}
                  animate={{ rotate: collapsed ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="inline-flex"
                >
                  <Navigation20Regular className="h-5 w-5" />
                </motion.span>
              </Button>
            </div>
            <nav className="mt-2 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  isActive={currentPath === item.href}
                  collapsed={collapsed}
                />
              ))}
            </nav>
          </div>
        </div>
      </nav>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-bg-card border-r border-stroke-divider md:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between h-16 px-4 border-b border-stroke-divider">
                <Link href="/" aria-label="Home" className="flex items-center gap-1.5 min-w-0 focus:outline-none focus:ring-2 focus:ring-stroke-focus rounded-sm">
                  <Image src="/icons/search_icon.svg" alt="Azure AI Search" width={26} height={26} className="shrink-0" />
                  <span className="font-semibold truncate max-w-[10rem] leading-tight">Azure AI Search - Knowledge Retrieval Demo</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  aria-label="Close navigation menu"
                >
                  <Dismiss20Regular className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <nav className="mt-5 flex-1 px-2 space-y-1">
                  {navigation.map((item) => (
                    <SidebarLink
                      key={item.href}
                      item={item}
                      isActive={currentPath === item.href}
                      onClick={onClose}
                    />
                  ))}
                </nav>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}

interface SidebarLinkProps {
  item: NavItem
  isActive: boolean
  onClick?: () => void
  collapsed?: boolean
}

function SidebarLink({ item, isActive, onClick, collapsed }: SidebarLinkProps) {
  const Icon = item.icon

  const linkEl = (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-fast relative',
        isActive
          ? 'bg-accent-subtle text-accent'
          : 'text-fg-default hover:bg-bg-hover hover:text-fg-default'
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent rounded-r-full" />
      )}
      <Icon className={cn('h-5 w-5 flex-shrink-0', collapsed ? 'mx-auto' : 'mr-3')} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  )
  return collapsed ? <Tooltip content={item.label}>{linkEl}</Tooltip> : linkEl
}