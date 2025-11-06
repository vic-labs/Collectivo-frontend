# AGENTS.md

**IMPORTANT**: Do not commit changes without explicit user permission. Always ask before creating commits.

## Build/Lint/Test Commands
- **Build**: `bun run build`
- **Dev server**: `bun run dev`
- **Test all**: `bun run test` (uses Vitest)
- **Test single file**: `bun run test path/to/file.test.ts`
- **Codegen**: `bun run codegen`
- **No lint command** - relies on TypeScript strict mode

## Code Style Guidelines
- **Imports**: Single quotes, use path aliases (`@/*` for `src/*`)
- **TypeScript**: Strict mode enabled, explicit typing for parameters/returns
- **React**: Functional components with arrow functions, destructured props, named exports
- **Styling**: Tailwind CSS with shadcn/ui "new-york" style, `cn()` utility for classes
- **Naming**: PascalCase for components/types, camelCase for variables/functions, kebab-case for files
- **Error Handling**: React Query `enabled` flag, optional chaining, type-safe boundaries
- **Formatting**: No semicolons, 2-space indentation, single quotes in JSX, trailing commas

## Architecture
- **UI Components** (`src/components/`): Pure presentation logic, single-purpose
- **Business Logic** (`src/lib/app-utils/`): Universal core utilities, calculations, formatting
- **Custom Hooks** (`src/lib/hooks/`): Reusable business logic with transaction handling
- **Contract SDK** (`src/contract-sdk/`): Generated blockchain layer (DO NOT EDIT)
- **Data Layer** (`src/utils/`): API queries with React Query
- **Routing** (`src/routes/`): Page composition, data loading via loaders
- **Component Architecture**: Break complex components into sub-components, separate creation dialogs
- **Custom Hooks Pattern**: Extract transaction logic into reusable hooks (e.g., `useCreateProposal`, `useVoteOnProposal`)
- **Module-Specific Logic**: Keep module-specific utilities within component directories
- **Type Reuse**: Import and reuse existing types from utils instead of redefining</content>
<parameter name="filePath">/Users/user/Desktop/SUI-MOVE/collectivo/frontend/AGENTS.md