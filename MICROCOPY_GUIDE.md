# Microcopy & Content Guidelines

Following Microsoft Copilot's voice and tone: **calm, helpful, concise, and professional**.

## Voice & Tone Principles

### 1. Calm & Reassuring
- Use present tense for current states
- Avoid urgency unless truly critical
- Focus on what users *can* do rather than limitations

### 2. Helpful & Informative
- Lead with the user's goal
- Provide context for actions
- Explain the "why" when it matters

### 3. Concise & Scannable
- Sentence case for everything except proper nouns
- Front-load important information
- Use active voice
- Keep sentences under 20 words

### 4. Professional & Trustworthy
- Technical accuracy without jargon
- Consistent terminology
- Clear next steps

## Content Types

### Page Titles
- **Pattern**: Noun-first, descriptive
- **Examples**: 
  - ✅ "Knowledge sources"
  - ✅ "Agent playground" 
  - ❌ "Manage your knowledge sources"
  - ❌ "Playground for agents"

### Descriptions
- **Pattern**: Brief explanation of purpose and capability
- **Length**: 1-2 sentences, under 140 characters
- **Examples**:
  - ✅ "Manage search indexes and data sources for knowledge retrieval."
  - ✅ "Chat with AI agents connected to your knowledge sources."
  - ❌ "This is where you can manage all of your different search indexes..."

### Button Labels (CTAs)
- **Pattern**: Verb + noun, action-focused
- **Examples**:
  - ✅ "Create agent"
  - ✅ "Connect source"
  - ✅ "Open playground"
  - ❌ "New agent"
  - ❌ "Add a new source"

### Status Messages
- **Pattern**: State first, context second
- **Examples**:
  - ✅ "Active • 1,234 documents indexed"
  - ✅ "Syncing • Last updated 2 hours ago"
  - ✅ "Error • Unable to connect to index"
  - ❌ "This source is currently active and has indexed 1,234 documents"

## Page-Specific Copy

### Dashboard
| Element | Copy |
|---------|------|
| Title | "Knowledge retrieval" |
| Description | "Manage knowledge sources and agents for intelligent document search and chat experiences." |
| Stats Labels | "Knowledge sources" • "Knowledge agents" • "Total documents" |
| Stats Descriptions | "Active search indexes and data sources" • "Configured chat agents" • "Searchable documents across all sources" |

### Knowledge Sources
| Element | Copy |
|---------|------|
| Title | "Knowledge sources" |
| Description | "Manage search indexes and data sources for knowledge retrieval." |
| Primary CTA | "Connect source" |
| Search Placeholder | "Search knowledge sources..." |
| Empty State Title | "No knowledge sources" |
| Empty State Description | "Connect your first data source to enable knowledge retrieval and chat experiences." |
| Empty State CTA | "Connect source" |

### Knowledge Agents
| Element | Copy |
|---------|------|
| Title | "Knowledge agents" |
| Description | "Manage chat agents configured with knowledge sources and AI models." |
| Primary CTA | "Create agent" |
| Search Placeholder | "Search knowledge agents..." |
| Empty State Title | "No knowledge agents" |
| Empty State Description | "Create your first agent to start chatting with your knowledge sources." |
| Empty State CTA | "Create agent" |

### Playground
| Element | Copy |
|---------|------|
| Chat Placeholder | "Ask me anything about your knowledge sources..." |
| Helper Text | "Press Enter to send, Shift+Enter for new line" |
| No Agent Title | "No agent selected" |
| No Agent Description | "Please select or create a knowledge agent to start chatting." |
| Welcome Title | "Start a conversation" |
| Welcome Description | "Ask me anything about your knowledge sources. I can search, analyze, and provide insights based on your data." |

## Form Copy

### Create Agent Form
| Element | Copy |
|---------|------|
| Title | "Create knowledge agent" |
| Description | "Configure a new AI agent with access to your knowledge sources." |
| Section: Basic | "Basic information" |
| Section: Model | "Model configuration" |
| Section: Sources | "Knowledge sources" |
| Section: Advanced | "Advanced settings" |
| Field: Name Label | "Agent name" |
| Field: Name Help | "A friendly name for your agent that users will see" |
| Field: Description Label | "Description" |
| Field: Description Help | "Optional description of the agent's purpose and capabilities" |
| Field: Model Label | "AI model" |
| Field: Model Help | "Choose the AI model that powers your agent" |

### Form Field Help Text
- **Pattern**: Explain purpose, not mechanics
- **Examples**:
  - ✅ "A friendly name for your agent that users will see"
  - ✅ "Choose which knowledge sources this agent can search"
  - ❌ "Enter the name you want to give this agent"
  - ❌ "Select one or more sources from the list below"

## Error Messages

### Patterns
- **Pattern**: What happened + what to do next
- **Tone**: Helpful, not apologetic
- **Examples**:
  - ✅ "Unable to load knowledge sources. Check your connection and try again."
  - ✅ "Agent name is required. Please enter a name for your agent."
  - ❌ "Sorry, we couldn't load your knowledge sources. We apologize for the inconvenience."

### Validation Messages
| Field | Message |
|-------|---------|
| Required name | "Agent name is required" |
| Name too long | "Agent name must be less than 100 characters" |
| Invalid characters | "Agent name can only contain letters, numbers, spaces, hyphens, and underscores" |
| No sources | "At least one knowledge source is required" |

## Success Messages

### Toast Messages
| Action | Title | Description |
|---------|-------|-------------|
| Agent Created | "Agent created" | "Your new knowledge agent is ready to use." |
| Agent Updated | "Agent updated" | "Changes saved successfully." |
| Source Connected | "Source connected" | "Your knowledge source is now available for agents." |
| Query Sent | "Processing your request" | "Searching knowledge sources..." |

## Loading States

### Messages
- **Pattern**: Action in progress
- **Examples**:
  - ✅ "Loading..." (generic)
  - ✅ "Searching knowledge sources..." (specific)
  - ✅ "Creating agent..." (action-specific)
  - ❌ "Please wait while we load your data"

## Time & Dates

### Relative Time
- **Pattern**: Human-readable, contextual
- **Examples**:
  - "Just now" (< 1 minute)
  - "5m ago" (< 1 hour)
  - "2h ago" (< 24 hours)  
  - "3d ago" (< 7 days)
  - "Dec 15, 2023" (> 7 days)

### Status Timestamps
- **Pattern**: "Action + relative time"
- **Examples**:
  - "Updated 2h ago"
  - "Created 3d ago"
  - "Last run 15m ago"
  - "Never run" (if no timestamp)

## Help Text & Tooltips

### Patterns
- **Pattern**: Brief explanation of benefit or context
- **Length**: One sentence, under 60 characters
- **Examples**:
  - ✅ "Controls response creativity (0 = focused, 2 = creative)"
  - ✅ "Maximum response length"
  - ❌ "This slider allows you to control how creative the AI responses will be"

## Accessibility Labels

### Screen Reader Text
- **Pattern**: Descriptive action + context
- **Examples**:
  - `aria-label="Open agent settings"`
  - `aria-label="Search knowledge sources"`
  - `aria-label="Delete agent [Agent Name]"`
  - `aria-label="Toggle theme"`

### Skip Links
- **Text**: "Skip to content"
- **Usage**: Always first interactive element

## Numbers & Data

### Formatting
- **Large numbers**: Use commas (1,234,567)
- **Counts**: Singular/plural handling
  - "1 document" / "1,234 documents"
  - "1 source" / "5 sources"
- **Percentages**: No decimal places unless < 1%
  - "85%" not "85.0%"
  - "0.3%" for very small values

### Loading/Empty States
- **Zero state**: "No [items] to show"
- **Loading state**: Use skeleton loaders with accessible labels
- **Error state**: "Unable to load [items]"

## Brand Voice Examples

### Good Examples ✅
- "Ask me anything about your knowledge sources."
- "Your agent is ready to use."
- "Connect your first data source to get started."
- "Choose which sources this agent can search."

### Poor Examples ❌  
- "Feel free to ask your agent anything you'd like!"
- "Congratulations! Your agent has been successfully created and is now ready for you to use."
- "Please connect a data source so that you can begin using the system."
- "You must select at least one or more knowledge sources for your agent."