# Responsive Design Guide

## Breakpoints

Following Tailwind CSS defaults with mobile-first approach:

| Breakpoint | Min Width | Max Width | Usage |
|------------|-----------|-----------|-------|
| `sm` | 640px | - | Small tablets |
| `md` | 768px | - | Tablets |
| `lg` | 1024px | - | Small desktops |
| `xl` | 1280px | - | Large desktops |
| `2xl` | 1536px | - | Extra large screens |

## Component Responsiveness

### AppShell
- **Mobile (< 768px)**: Sidebar is hidden, hamburger menu shows overlay
- **Desktop (≥ 768px)**: Persistent sidebar, header spans full width

**Classes:**
- `md:ml-64` - Main content offset on desktop
- `md:hidden` - Hide mobile menu button on desktop
- `hidden md:flex` - Hide desktop sidebar on mobile

### Dashboard Grid
- **Mobile**: Single column layout
- **Tablet (≥ 768px)**: 2 columns for stats, single column for content
- **Desktop (≥ 1280px)**: 3 columns for stats, 2 columns for content sections

**Classes:**
- `grid-cols-1 md:grid-cols-3` - Stats cards
- `grid-cols-1 xl:grid-cols-2` - Main content sections

### Knowledge Source/Agent Cards
- **Mobile**: Single column, full width cards
- **Tablet (≥ 1024px)**: 2 columns
- **Desktop (≥ 1280px)**: 3 columns for sources, 2 for agents

**Classes:**
- `grid-cols-1 lg:grid-cols-2 xl:grid-cols-3` - Knowledge sources
- `grid-cols-1 lg:grid-cols-2` - Knowledge agents

### Search and Filters
- **Mobile**: Stacked vertically with full-width elements
- **Desktop**: Horizontal layout with flexible search input

**Classes:**
- `flex-col sm:flex-row` - Layout direction
- `flex-1` - Search input takes available space

### Playground Layout
- **Mobile**: Single column, collapsible sidebar
- **Tablet (≥ 768px)**: Two-pane layout with fixed sidebar
- **Desktop**: Three-pane when settings drawer is open

**Classes:**
- `w-80` - Fixed sidebar width
- `flex-1` - Chat area takes remaining space
- `w-320` - Settings drawer width (when open)

## Typography Scale

Mobile-first typography with responsive adjustments:

| Element | Mobile | Desktop |
|---------|--------|---------|
| Page titles | `text-2xl` | `text-3xl` |
| Section headings | `text-lg` | `text-xl` |
| Card titles | `text-sm` | `text-md` |
| Body text | `text-sm` | `text-md` |

## Spacing Scale

Consistent 8pt grid system:

| Token | Mobile | Desktop | Usage |
|-------|--------|---------|-------|
| Page padding | `p-4` | `p-6 md:p-8` | Main content areas |
| Card padding | `p-4` | `p-6` | Internal card spacing |
| Section gaps | `space-y-6` | `space-y-8` | Between major sections |
| Item gaps | `space-y-4` | `space-y-4` | Between list items |

## Touch Targets

All interactive elements meet WCAG AA guidelines:

- **Minimum**: 44×44px (`h-11 w-11`)
- **Buttons**: 40px height (`h-10`) with adequate padding
- **Icon buttons**: 44×44px (`h-11 w-11`)
- **Form inputs**: 40px height (`h-10`)

## Performance Considerations

### Image Optimization
```tsx
import Image from 'next/image'

// Always specify sizes for responsive images
<Image 
  src="/image.jpg" 
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={isAboveFold}
/>
```

### Dynamic Imports
```tsx
// Lazy load heavy components on mobile
const HeavyChart = dynamic(() => import('./HeavyChart'), { 
  ssr: false,
  loading: () => <LoadingSkeleton className="h-64" />
})
```

### Prefetch Strategy
```tsx
// Disable prefetch for mobile to save bandwidth
<Link href="/heavy-page" prefetch={false}>
```

## Density Checks

Test layouts at these specific widths:

### Critical Breakpoints
- **320px**: Minimum mobile width
- **375px**: iPhone standard width  
- **768px**: Tablet portrait
- **1024px**: Tablet landscape
- **1280px**: Small desktop
- **1920px**: Large desktop

### Component-Specific Tests
- **Navigation**: Ensure menu items don't wrap
- **Cards**: Content doesn't overflow at narrow widths  
- **Forms**: Labels and inputs stack properly
- **Tables**: Horizontal scroll or column hiding works

## Tailwind Utilities Reference

### Container Queries (when available)
```css
/* Future enhancement with container queries */
@container (min-width: 400px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### Common Responsive Patterns

#### Show/Hide
```tsx
className="block md:hidden" // Mobile only
className="hidden md:block" // Desktop only
```

#### Flexible Grids
```tsx
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
```

#### Responsive Text
```tsx
className="text-sm md:text-base lg:text-lg"
```

#### Adaptive Spacing
```tsx
className="p-4 md:p-6 lg:p-8"
className="gap-4 md:gap-6 lg:gap-8"
```