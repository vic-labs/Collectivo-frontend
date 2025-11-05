# AGENTS.md

## Build/Lint/Test Commands
- **Build**: `bun run build` (vite build)
- **Dev server**: `bun run dev` (vite dev --port 3000 --host)
- **Test all**: `bun run test` (vitest run)
- **Test single file**: `bun run test path/to/file.test.ts`
- **Codegen**: `bun run codegen` (sui-ts-codegen generate)
- **No lint command** - relies on TypeScript strict mode

## Code Style Guidelines

### Code Style
- **Imports**: Single quotes for internal, double for external libraries. Use `@/` path alias
- **TypeScript**: Strict mode enabled. Explicit typing for parameters/returns
- **React**: Functional components with arrow functions, destructured props, named exports
- **Styling**: Tailwind CSS with shadcn/ui "new-york" style, `cn()` utility for classes
- **Naming**: PascalCase for components/types, camelCase for variables/functions, kebab-case for files
- **Error Handling**: React Query `enabled` flag, optional chaining, type-safe boundaries
- **Formatting**: No semicolons, 2-space indentation, single quotes in JSX, trailing commas

### Separation of Concerns
- **UI Components** (`src/components/`) - Pure presentation logic, focused and single-purpose
- **Business Logic** (`src/lib/app-utils/`) - Utility functions, calculations, and formatting
- **Contract SDK** (`src/contract-sdk/`) - Generated blockchain interaction layer (DO NOT EDIT)
- **Data Layer** (`src/utils/`) - API queries and data fetching with React Query
- **Routing** (`src/routes/`) - Page-level composition, data loading via loaders
- **Component Architecture**: Break complex components into smaller sub-components, keep helper functions separate from component logic</content>
<parameter name="filePath">/Users/user/Desktop/SUI-MOVE/collectivo/frontend/AGENTS.md