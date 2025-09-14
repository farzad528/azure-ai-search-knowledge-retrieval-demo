# Performance Checklist

## Core Web Vitals Targets

### Largest Contentful Paint (LCP) ≤ 2.5s
- [ ] **Use `next/image`** for all images with proper `sizes` attribute
- [ ] **Prioritize above-the-fold images** with `priority={true}`
- [ ] **Preload critical fonts** in layout component
- [ ] **Server-side render initial content** (dashboard stats, navigation)
- [ ] **Optimize largest page elements**: hero sections, main content cards

### First Input Delay (FID) ≤ 100ms  
- [ ] **Minimize JavaScript execution time** during page load
- [ ] **Use dynamic imports** for non-critical components
- [ ] **Defer non-essential JavaScript** until after interaction
- [ ] **Optimize event handlers** to be lightweight
- [ ] **Use `useCallback` and `useMemo`** for expensive computations

### Cumulative Layout Shift (CLS) ≤ 0.1
- [ ] **Reserve space for images** with explicit dimensions
- [ ] **Use skeleton loaders** that match final content dimensions  
- [ ] **Avoid inserting content** above existing content
- [ ] **Use CSS aspect-ratio** for responsive containers
- [ ] **Preload fonts** to prevent layout shifts from font swapping

## Next.js Optimization

### Image Optimization
```tsx
// ✅ Good: Responsive image with proper sizes
<Image 
  src="/hero-image.jpg"
  alt="Dashboard overview"
  width={800}
  height={400}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// ❌ Bad: No sizes, no priority, no dimensions
<img src="/hero-image.jpg" alt="Dashboard" />
```

### Code Splitting
```tsx
// ✅ Good: Lazy load heavy components
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  ssr: false,
  loading: () => <LoadingSkeleton className="h-64" />
})

// ✅ Good: Conditional loading
const AdminPanel = dynamic(() => import('./AdminPanel'), {
  ssr: false
})

// Use only when user has admin role
{isAdmin && <AdminPanel />}
```

### Prefetch Strategy
```tsx
// ✅ Good: Disable prefetch for bandwidth-heavy pages
<Link href="/analytics" prefetch={false}>
  View Analytics
</Link>

// ✅ Good: Prefetch critical navigation
<Link href="/dashboard" prefetch={true}>
  Dashboard
</Link>
```

## React Performance

### Component Optimization
```tsx
// ✅ Good: Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return heavyProcessing(data)
}, [data])

// ✅ Good: Memoize callback functions
const handleClick = useCallback((id: string) => {
  onItemClick(id)
}, [onItemClick])

// ✅ Good: Memoize stable components
const MemoizedCard = memo(({ item, onSelect }) => {
  return <Card {...item} onClick={onSelect} />
})
```

### List Optimization
```tsx
// ✅ Good: Use stable keys
{items.map(item => (
  <ItemCard key={item.id} item={item} />
))}

// ❌ Bad: Index as key causes re-renders
{items.map((item, index) => (
  <ItemCard key={index} item={item} />
))}
```

### State Management
```tsx
// ✅ Good: Split state to minimize re-renders
const [searchQuery, setSearchQuery] = useState('')
const [filters, setFilters] = useState({})
const [sortOrder, setSortOrder] = useState('asc')

// ❌ Bad: Single state object causes unnecessary re-renders
const [uiState, setUiState] = useState({
  searchQuery: '',
  filters: {},
  sortOrder: 'asc'
})
```

## Bundle Size Optimization

### Dependencies
- [ ] **Audit bundle with `npm run build`** and check output
- [ ] **Use tree-shaking friendly imports**
  ```tsx
  // ✅ Good
  import { format } from 'date-fns'
  
  // ❌ Bad  
  import * as dateFns from 'date-fns'
  ```
- [ ] **Replace heavy libraries** with lightweight alternatives
- [ ] **Remove unused dependencies** regularly

### Code Organization
- [ ] **Split routes** at page level with Next.js automatic splitting
- [ ] **Create common chunks** for shared utilities
- [ ] **Lazy load modals/dialogs** that aren't immediately needed
- [ ] **Use native browser APIs** when possible instead of polyfills

## Network & Caching

### API Optimization
```tsx
// ✅ Good: Cache stable data with appropriate stale time
const { data: sources } = useQuery({
  queryKey: ['knowledge-sources'],
  queryFn: fetchKnowledgeSources,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
})

// ✅ Good: Prefetch related data
const queryClient = useQueryClient()
useEffect(() => {
  queryClient.prefetchQuery(['agents'], fetchAgents)
}, [queryClient])
```

### Server Components (App Router)
```tsx
// ✅ Good: Server component for static content
async function KnowledgeSourcesList() {
  const sources = await fetchKnowledgeSources()
  
  return (
    <div>
      {sources.map(source => (
        <SourceCard key={source.id} source={source} />
      ))}
    </div>
  )
}

// ✅ Good: Client component only for interactivity
'use client'
function SearchableSourcesList({ sources }) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => 
    sources.filter(s => s.name.includes(query)), [sources, query]
  )
  
  return (
    <>
      <SearchInput value={query} onChange={setQuery} />
      <SourcesList sources={filtered} />
    </>
  )
}
```

## Runtime Performance

### Animation Performance  
- [ ] **Use CSS transforms** instead of changing layout properties
- [ ] **Prefer `transform` and `opacity`** for animations
- [ ] **Use `will-change`** sparingly and remove after animation
- [ ] **Respect `prefers-reduced-motion`** setting
- [ ] **Keep animation durations short** (≤300ms)

```css
/* ✅ Good: GPU-accelerated animations */
.slide-in {
  transform: translateX(100%);
  transition: transform 200ms ease-out;
}

.slide-in.active {
  transform: translateX(0);
}

/* ❌ Bad: Causes layout thrashing */
.slide-in {
  left: 100%;
  transition: left 200ms ease-out;
}
```

### Memory Management
- [ ] **Clean up event listeners** in useEffect cleanup
- [ ] **Cancel pending requests** when component unmounts
- [ ] **Remove timers/intervals** in cleanup functions
- [ ] **Unsubscribe from observables** properly

```tsx
useEffect(() => {
  const controller = new AbortController()
  
  fetchData(controller.signal)
    .then(setData)
    .catch(err => {
      if (!controller.signal.aborted) {
        setError(err)
      }
    })
  
  return () => {
    controller.abort()
  }
}, [])
```

## Monitoring & Measurement

### Development Tools
- [ ] **React DevTools Profiler** to identify slow components
- [ ] **Chrome DevTools Performance** tab for runtime analysis
- [ ] **Lighthouse CI** in build process
- [ ] **Bundle Analyzer** to identify large dependencies

### Production Monitoring
- [ ] **Web Vitals reporting** to analytics service
- [ ] **Error boundary** telemetry for crash reporting  
- [ ] **Performance API** for custom metrics
- [ ] **User timing marks** for key user actions

```tsx
// Track key user interactions
const handleAgentCreate = useCallback(async (data) => {
  performance.mark('agent-create-start')
  
  try {
    await createAgent(data)
    performance.mark('agent-create-end')
    performance.measure(
      'agent-create-duration',
      'agent-create-start', 
      'agent-create-end'
    )
  } catch (error) {
    // Handle error
  }
}, [])
```

## Performance Budget

### Target Metrics
| Metric | Target | Action if Exceeded |
|--------|--------|-------------------|
| Bundle Size | < 200KB initial | Split code, remove dependencies |
| LCP | < 2.5s | Optimize images, preload critical resources |
| FID | < 100ms | Reduce JavaScript, defer non-critical |
| CLS | < 0.1 | Reserve space, avoid content insertion |
| Time to Interactive | < 4s | Reduce JavaScript execution time |

### Regular Audits
- [ ] **Weekly Lighthouse scores** on key pages
- [ ] **Monthly bundle size review** with team
- [ ] **Quarterly dependency audit** for unused packages
- [ ] **Performance regression testing** in CI/CD pipeline

## Quick Performance Wins

### Immediate Actions
1. **Add loading states** to all async operations
2. **Implement image optimization** with next/image
3. **Add skeleton loaders** matching content layout
4. **Use proper heading hierarchy** for SEO and accessibility
5. **Minify and compress** all static assets

### Medium-term Improvements
1. **Implement virtual scrolling** for long lists (>100 items)
2. **Add service worker** for offline functionality
3. **Optimize font loading** with preload and display strategies
4. **Implement proper error boundaries** with retry mechanisms
5. **Add progressive enhancement** for JavaScript-disabled users

### Advanced Optimizations
1. **Server-side rendering** for public pages
2. **Edge caching** for API responses
3. **Critical CSS extraction** for above-the-fold content  
4. **Resource hints** (preload, prefetch, preconnect)
5. **Advanced image formats** (WebP, AVIF) with fallbacks