# Development Guidelines

## Code Organization

1. **Component Structure**
   - Components live in `src/components`
   - Pages in `src/pages`
   - Shared utilities in `src/lib`
   - Hooks in `src/hooks`
   - Types in `src/types`

2. **State Management**
   - Use React Query for server state
   - Local state with useState/useReducer
   - Context for shared app state
   - Prefer server state when possible

3. **Styling**
   - Use Tailwind CSS classes
   - Follow shadcn/ui patterns
   - Maintain consistent spacing
   - Use CSS variables for theming

## Best Practices

1. **TypeScript**
   - Define interfaces for all props
   - Use strict type checking
   - Avoid `any` types
   - Document complex types

2. **Components**
   - Keep components focused
   - Extract reusable logic to hooks
   - Use composition over inheritance
   - Document props with JSDoc

3. **Performance**
   - Memoize expensive calculations
   - Use React Query for caching
   - Lazy load routes
   - Monitor bundle size

4. **Testing**
   - Write unit tests for utilities
   - Component tests for UI logic
   - E2E tests for critical flows
   - Test error scenarios

## Database

1. **Supabase Tables**
   - Use UUIDs for primary keys
   - Enable RLS policies
   - Add appropriate indexes
   - Document schema changes

2. **Migrations**
   - One change per migration
   - Include rollback logic
   - Test migrations locally
   - Document complex migrations 