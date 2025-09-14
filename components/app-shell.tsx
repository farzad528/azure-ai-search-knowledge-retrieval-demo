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
  Dismiss20Regular
} from '@fluentui/react-icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

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
  const pathname = usePathname()

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
        />

        {/* Main content */}
        <main 
          id="main-content" 
          className="flex-1 min-w-0 md:ml-64"
        >
          <div className="p-6 md:p-8">
            {children}
          </div>
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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
          >
            <Navigation20Regular className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-accent flex items-center justify-center">
              <Search20Regular className="h-4 w-4 text-fg-on-accent" />
            </div>
            <span className="font-semibold text-lg">Azure AI Search</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
}

function Sidebar({ navigation, currentPath, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:top-16">
        <div className="flex flex-col flex-1 bg-bg-card border-r border-stroke-divider">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  isActive={currentPath === item.href}
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
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-accent flex items-center justify-center">
                    <Search20Regular className="h-4 w-4 text-fg-on-accent" />
                  </div>
                  <span className="font-semibold">Azure AI Search</span>
                </div>
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
}

function SidebarLink({ item, isActive, onClick }: SidebarLinkProps) {
  const Icon = item.icon

  return (
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
      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent rounded-r-full" />
      )}
      
      <Icon className={cn('mr-3 h-5 w-5 flex-shrink-0')} />
      {item.label}
    </Link>
  )
}