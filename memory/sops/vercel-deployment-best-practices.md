# Vercel Deployment Best Practices for ColorGenius

## Key Learnings from Week 1 Sprint

### 1. Next.js Configuration for Vercel
- **Issue**: `output: 'export'` in next.config.ts breaks Server-Side Rendering (SSR)
- **Impact**: API routes work at build time but dynamic routes may be limited at runtime
- **Solution**: Keep `output: 'export'` for deploy compatibility but plan to remove for true SSR
- **Alternative**: Use fallback mock data when absolute paths aren't available

### 2. File System Access in Vercel Serverless Functions
- **Issue**: Relative paths from `process.cwd()` don't reach workspace root in `.next/server/`
- **Solution**: 
  - Use fallback mock data for development/deployment compatibility
  - Consider absolute paths or environment variables for production paths
  - Validate file access patterns during local development

### 3. Dark Mode Implementation Approach
- **Success**: CSS variable-first approach works excellently
- **Implementation**: 
  - Define all color tokens in `globals.css` as CSS variables
  - Enable `darkMode: 'class'` in tailwind.config.js
  - Bind Tailwind classes to CSS variables
  - Result: shadcn/ui components inherit dark mode automatically

### 4. Type Safety Patterns
- **Issue**: TypeScript Set spread error in colors route
- **Fix**: Use `Array.from(new Set(...))` instead of `[...new Set(...)]`
- **Issue**: Null-safety on regex match
- **Fix**: Use optional chaining + filter (`match()?.filter(Boolean) || []`)

## Deployment Checklist
- [ ] Verify `next.config.ts` doesn't use `output: 'export'` for SSR requirements
- [ ] Test API routes with both mock and real data paths
- [ ] Validate dark mode implementation across all components
- [ ] Check TypeScript null safety on all regex operations
- [ ] Confirm file system access works in Vercel serverless environment

## Related Files
- `packages/web/next.config.ts`
- `packages/web/globals.css`
- `packages/web/tailwind.config.js`
- `packages/web/src/app/api/colors/route.ts`