/**
 * Conversation Starters Loader & Hook
 * -----------------------------------
 * The actual editable data now lives in `config/conversation-starters.json`.
 * To add a new industry / agent:
 *  1. Open `config/conversation-starters.json`.
 *  2. Append a new object to the `sets` array with `agentIds` and `starters`.
 *  3. Each starter must have: id, label, prompt, complexity (Simple|Moderate|Advanced).
 *  4. (Optional) tags: string[] for UI or analytics.
 *
 * This module imports and type-checks the JSON. At runtime, minimal validation
 * guards against accidental structure errors (fails soft to fallback mode).
 */

export type StarterComplexity = 'Simple' | 'Moderate' | 'Advanced'

export interface ConversationStarter {
  id: string
  label: string
  prompt: string
  complexity: StarterComplexity
  tags?: string[]
}

export interface ConversationStarterSet {
  agentIds: string[] // agent names/ids this set applies to
  starters: ConversationStarter[]
}

/**
 * Generic fallback starters shown when an agent has no domain-specific set.
 */
import rawConfig from '@/config/conversation-starters.json'

// Narrow the imported JSON through a runtime validator
interface RawConfig {
  version: number
  updated?: string
  generalFallback: ConversationStarter[]
  sets: ConversationStarterSet[]
}

function isConversationStarter(obj: any): obj is ConversationStarter {
  return obj && typeof obj.id === 'string' && typeof obj.label === 'string' && typeof obj.prompt === 'string' && ['Simple','Moderate','Advanced'].includes(obj.complexity)
}

function sanitizeStarters(arr: any[]): ConversationStarter[] {
  if (!Array.isArray(arr)) return []
  return arr.filter(isConversationStarter)
}

let generalFallbackStarters: ConversationStarter[] = []
let conversationStarterRegistry: ConversationStarterSet[] = []

try {
  const cfg = rawConfig as RawConfig
  generalFallbackStarters = sanitizeStarters(cfg.generalFallback)
  conversationStarterRegistry = Array.isArray(cfg.sets) ? cfg.sets.map(set => ({
    agentIds: Array.isArray(set.agentIds) ? set.agentIds.filter(id => typeof id === 'string') : [],
    starters: sanitizeStarters((set as any).starters)
  })) : []
} catch (e) {
  // Fail soft: provide minimal fallback
  generalFallbackStarters = [
    {
      id: 'fallback-theme',
      label: 'Summarize Themes',
      prompt: 'Summarize key themes across the most recent documents.',
      complexity: 'Simple'
    }
  ]
  conversationStarterRegistry = []
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn('[conversationStarters] Failed to load JSON config:', e)
  }
}

/**
 * Registry of conversation starter sets.
 * Extend this by pushing new objects (avoid mutating existing ones to retain history).
 */
export { conversationStarterRegistry, generalFallbackStarters }

/**
 * Hook to retrieve conversation starters for a given agent id.
 * Applies ordering: Simple -> Moderate -> Advanced.
 */
export function useConversationStarters(agentId: string | null | undefined) {
  // Simple runtime selection – no React state required since it's deterministic.
  const set = conversationStarterRegistry.find(s => agentId && s.agentIds.includes(agentId))
  const starters = (set ? set.starters : generalFallbackStarters).slice().sort((a, b) => {
    const order: Record<StarterComplexity, number> = { 'Simple': 0, 'Moderate': 1, 'Advanced': 2 }
    return order[a.complexity] - order[b.complexity]
  })
  const isGeneralFallback = !set
  return { starters, isGeneralFallback }
}

/**
 * Utility for programmatic extension (e.g., dynamic registration at runtime).
 * Not currently used in UI, but available if future admin UI needs to append sets.
 */
export function registerConversationStarterSet(set: ConversationStarterSet) {
  conversationStarterRegistry.push({
    agentIds: set.agentIds,
    starters: set.starters.filter(isConversationStarter)
  })
}
