# QA & Acceptance Criteria

## Accessibility Checklist (WCAG AA/AAA)

### Keyboard Navigation
- [ ] **Tab order is logical**: Header → Nav → Main → Footer
- [ ] **All interactive elements are reachable** via keyboard
- [ ] **Focus indicators are visible** with 2px offset outline
- [ ] **ESC key closes dialogs/drawers** and returns focus to trigger
- [ ] **Arrow keys work in menus** and select components
- [ ] **Enter/Space activate buttons** and form controls
- [ ] **No keyboard traps** - focus can always move forward/backward

### Screen Readers
- [ ] **Page has proper heading hierarchy** (h1 → h2 → h3, no skipping)
- [ ] **All form inputs have labels** (explicit or aria-label)
- [ ] **Error messages are announced** via aria-describedby
- [ ] **Loading states are announced** with aria-live regions
- [ ] **Icons have text alternatives** (aria-label or sr-only text)
- [ ] **Skip link works** and is visible on focus
- [ ] **Landmark roles are present** (nav, main, aside, footer)

### Visual & Motor
- [ ] **Touch targets are ≥44×44px** for mobile interaction
- [ ] **Color contrast meets WCAG AA** (4.5:1 for normal text)
- [ ] **Focus indicators meet 3:1 contrast** against background
- [ ] **UI works at 200% browser zoom** without horizontal scroll
- [ ] **Motion respects prefers-reduced-motion** setting
- [ ] **Content reflows properly** at narrow widths (320px)

## Cross-Browser Testing

### Desktop Browsers
- [ ] **Chrome (latest)**
- [ ] **Firefox (latest)**  
- [ ] **Safari (latest)**
- [ ] **Edge (latest)**

### Mobile Browsers
- [ ] **Mobile Chrome (Android)**
- [ ] **Mobile Safari (iOS)**
- [ ] **Samsung Internet**

### Critical Features
- [ ] **Theme switching** works in all browsers
- [ ] **Form validation** displays properly
- [ ] **Animations** degrade gracefully
- [ ] **Focus management** works consistently
- [ ] **Responsive design** adapts correctly

## Performance Checklist

### Core Web Vitals
- [ ] **LCP ≤ 2.5s** (First contentful paint of main content)
- [ ] **FID ≤ 100ms** (Time to first user interaction)
- [ ] **CLS ≤ 0.1** (No unexpected layout shifts)

### Optimization
- [ ] **Images use next/image** with proper sizes attributes
- [ ] **Heavy components are lazy loaded** below the fold
- [ ] **Prefetch is disabled** on bandwidth-sensitive links
- [ ] **Server components cache** API responses appropriately
- [ ] **Bundle size is reasonable** (< 200KB initial JS)

### Network Conditions
- [ ] **Works on 3G networks** with graceful loading states
- [ ] **Offline state is handled** with appropriate messages
- [ ] **Request failures show retry options**

## Page-by-Page Acceptance

### Dashboard Page (/)
#### Visual Layout
- [ ] **Page header** displays title and description correctly
- [ ] **Stats cards** show accurate counts with proper formatting
- [ ] **Two-column layout** on xl screens, single column on mobile
- [ ] **Cards have proper hover states** with elevation change

#### Functionality  
- [ ] **Refresh button** reloads data and updates counts
- [ ] **Create agent button** opens creation form/dialog
- [ ] **Agent cards show correct status** (active/idle/error)
- [ ] **"Open playground" links** work correctly
- [ ] **Empty states display** when no data is available

#### Keyboard Navigation
- [ ] **Tab order**: Page header → Refresh → Create agent → Agent cards → Source cards
- [ ] **Agent cards are focusable** and activate with Enter/Space
- [ ] **Create buttons have visible focus** indicators

### Knowledge Sources Page (/knowledge-sources)
#### Visual Layout
- [ ] **Search bar** takes full width on mobile, flexible on desktop
- [ ] **Grid adapts**: 1 col mobile, 2 cols tablet, 3 cols desktop
- [ ] **Source type icons** display correctly with proper colors
- [ ] **Status indicators** use consistent color coding

#### Functionality
- [ ] **Search filters results** in real-time as user types
- [ ] **Filter button** opens filter options (even if placeholder)
- [ ] **Source cards link** to detail pages correctly
- [ ] **Connection status** reflects actual source state

#### Data Handling
- [ ] **Loading skeleton** appears during initial load
- [ ] **Error state** shows with retry option
- [ ] **Empty search results** show appropriate message
- [ ] **No sources state** displays with connect CTA

### Knowledge Agents Page (/knowledge-agents)
#### Similar criteria as Knowledge Sources, plus:
- [ ] **Agent model information** displays correctly
- [ ] **Source badges** show attached knowledge sources
- [ ] **Last run timestamp** formats properly
- [ ] **Settings link** opens agent configuration

### Playground Page (/playground)
#### Layout & Responsive
- [ ] **Three-pane layout**: sidebar, chat, settings drawer
- [ ] **Sidebar collapses** on tablet/mobile with overlay
- [ ] **Chat area takes remaining space** and scrolls properly
- [ ] **Input is sticky** at bottom and remains accessible

#### Chat Functionality
- [ ] **Messages display correctly** with user/assistant avatars
- [ ] **Typing indicator** shows while agent is responding
- [ ] **References expand/collapse** with smooth animation
- [ ] **Chat input supports** multiline with Shift+Enter
- [ ] **Send button is disabled** when input is empty

#### Agent Selection
- [ ] **Agent dropdown** populates with available agents
- [ ] **URL parameter (?agent=id)** selects correct agent
- [ ] **Agent info displays** model and source count
- [ ] **No agent state** shows selection prompt

## Form Validation Testing

### Create Agent Form
#### Field Validation
- [ ] **Required fields show errors** when submitted empty
- [ ] **Name field validates** length and allowed characters
- [ ] **Model selection is required** and validates properly
- [ ] **At least one source** must be selected
- [ ] **Temperature slider** respects min/max bounds (0-2)
- [ ] **Max tokens slider** respects bounds (1-4000)

#### User Experience
- [ ] **Error messages appear** immediately on blur for immediate feedback
- [ ] **Form cannot be submitted** while validation errors exist
- [ ] **Success message displays** after successful creation
- [ ] **Form resets** or redirects after successful submission
- [ ] **Cancel button** discards changes with confirmation if dirty

## Dark Mode Testing

### Theme Switching
- [ ] **Toggle button** switches theme immediately
- [ ] **Theme persists** across page reloads
- [ ] **System preference** is respected on first visit
- [ ] **No flash of wrong theme** on page load

### Visual Consistency
- [ ] **All components** have proper dark mode styles
- [ ] **Text contrast** meets accessibility requirements
- [ ] **Border colors** are visible but not harsh
- [ ] **Focus indicators** remain visible in dark mode
- [ ] **Images and icons** adapt appropriately

## Edge Cases & Error Handling

### Network Issues
- [ ] **API timeouts** show appropriate error messages
- [ ] **Connection failures** offer retry mechanisms
- [ ] **Partial data loads** handle gracefully
- [ ] **Rate limiting** displays helpful messages

### Data Edge Cases
- [ ] **Empty responses** from APIs are handled
- [ ] **Very long names/text** truncate or wrap properly
- [ ] **Special characters** in names display correctly
- [ ] **Large numbers** format with proper separators
- [ ] **Missing optional fields** don't break layout

### User Actions
- [ ] **Rapid clicking** doesn't create duplicate requests
- [ ] **Form resubmission** is prevented appropriately
- [ ] **Browser back button** works as expected
- [ ] **Page refresh** maintains user context where appropriate

## Acceptance Criteria Summary

### Dashboard Page
**Given** a user visits the dashboard
**When** the page loads
**Then** they should see:
- Page title "Knowledge retrieval" 
- Stats cards with current counts
- List of knowledge agents (if any)
- List of knowledge sources (if any)
- Appropriate empty states for missing data

**And** the page should:
- Load within 2.5 seconds on 3G
- Be navigable entirely by keyboard
- Work properly in both light and dark themes
- Adapt layout for mobile/tablet/desktop screens

### Knowledge Sources Page  
**Given** a user visits the knowledge sources page
**When** they interact with the interface
**Then** they should be able to:
- Search sources by name
- View source status and document counts
- Navigate to source details
- See appropriate loading/empty/error states

### Knowledge Agents Page
**Given** a user visits the knowledge agents page  
**When** they view the agent list
**Then** each agent card should show:
- Agent name and status
- AI model information
- Connected knowledge sources (up to 3, with "+N more")
- Last run timestamp or "Never run"
- Quick access to playground

### Agent Playground
**Given** a user opens the playground with an agent selected
**When** they send a message
**Then** the system should:
- Display a typing indicator while processing
- Return a response with relevant references
- Show reference sources with relevance scores
- Maintain chat history within the session
- Allow smooth scrolling through conversation

**And** the interface should:
- Support keyboard navigation
- Work on touch devices
- Handle long conversations without performance issues
- Gracefully handle API errors with retry options