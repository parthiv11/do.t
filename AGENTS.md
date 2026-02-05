# DO.T - Agent Cheat Sheet

**DO.T** — Not a chatbot with DigitalOcean. It's DigitalOcean, chat-first.

Built with **Tambo** (https://tambo.co). See https://docs.tambo.co/llms.txt for full Tambo documentation.

## Tambo Architecture

**Three-Layer System:**
1. **Context Helpers** - Auto-included in every AI message (read-only)
2. **Interactables** - Publish component state via `withInteractable` HOC
3. **Tools** - Functions AI calls to mutate state (in `src/tools/`)

**Configuration:** `src/lib/tambo.ts` registers all components and tools.

**Critical Streaming Gotchas:**
- Props stream token-by-token as LLM generates
- Use `useTamboStreamStatus()` to detect streaming
- Safe destructuring: `const { prop = default } = props || {}`
- Optional chaining: `array?.[0]?.property`

## DigitalOcean Integration

**State:** `src/lib/infra-store.ts` (Zustand store for infrastructure state)

**Components:** `src/components/tambo/digitalocean/`
- `droplets/` - Droplet management (create, delete, reboot, view, list)
- `kubernetes/` - Kubernetes clusters
- `databases/` - Managed databases
- `domains/` - DNS management
- `volumes/` - Block storage
- `firewalls/` - Security rules

**Tools:** `src/tools/digitalocean-tools.ts`
- createDroplet, deleteDroplet, rebootDroplet, listDroplets

**API Routes:** `src/app/api/digitalocean/`
- `droplets/` - Droplet CRUD operations
- `droplets/[id]/actions` - Droplet actions (reboot)

**Key Rules:**
- All operations go through `infraStore` (no local state forks)
- Components must tolerate SSR (`return null` when `window` undefined)
- DIGITALOCEAN_TOKEN is server-only, never expose to client

## Development

**Commands:**
- `npm run dev` - Dev server
- `npm run build` - Production build
- `npm run lint` - ESLint
- `npm run check-types` - TypeScript check

**Style:**
- TypeScript + React (App Router) + functional components
- 2-space indent, PascalCase components, camelCase hooks, kebab-case utils
- DigitalOcean-style UI: bg-[#0d1117], text-[#e6edf3], border-[#30363d]

**Build & Commit:**
- Run `npm run build` BEFORE committing (not after every fix)
- Imperative mood (`Add utils`, `Fix context`)
- Mention affected Tambo tools/components explicitly

**Dependency Upgrades:**
- When upgrading Tambo packages or UI components, preserve custom edits
- Key customizations to preserve:
  - `src/components/tambo/message-thread-full.tsx` - GitHub and Tambo buttons in sidebar
  - `src/components/tambo/thread-history.tsx` - Exported `useThreadHistoryContext` hook
- Always review diffs before accepting upstream changes



<!-- tambo-docs-v1.0 -->
## Tambo AI Framework

This project uses **Tambo AI** for building AI assistants with generative UI and MCP support.

**Documentation**: https://docs.tambo.co/llms.txt

### CLI Commands (Non-Interactive)

The Tambo CLI auto-detects non-interactive environments. Use these commands:

```bash
# Initialize (requires API key from https://console.tambo.co)
npx tambo init --api-key=sk_...

# Add components
npx tambo add <component> --yes

# List available components
npx tambo list --yes

# Create new app
npx tambo create-app <name> --template=standard

# Get help
npx tambo --help
npx tambo <command> --help
```

**Exit codes**: 0=success, 1=error, 2=requires flags (check stderr for exact command)
