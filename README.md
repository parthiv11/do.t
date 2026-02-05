# DO.T

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Tambo AI](https://img.shields.io/badge/Tambo-AI-purple)](https://tambo.co)
[![DigitalOcean](https://img.shields.io/badge/DigitalOcean-Cloud-0080FF?logo=digitalocean)](https://digitalocean.com)

**Not a chatbot with DigitalOcean. It's DigitalOcean, chat-first.**

## Philosophy

**This isn't a chatbot that happens to control DigitalOcean.**

**This is DigitalOcean, reimagined for the chat era.**

Traditional cloud consoles trap you in dashboards, forms, and endless clicks. DO.T inverts the entire experience: you simply talk to your infrastructure, and the right interface materializes exactly when you need it.

- Want a new Droplet? Just say *"Create an Ubuntu server in NYC"*
- Need to scale? Say *"Add 3 more nodes to my cluster"*
- Checking status? Ask *"How are my databases doing?"*

The chat is the primary interface. Visual components are summoned inline—rich dashboards, confirmation dialogs, status panels—appearing precisely when the conversation calls for them.

**Don't chat *with* DigitalOcean. Chat *as* DigitalOcean.**

## Demo
Try it yourself: **[CheatSheet](https://cheatsheet.tambo.co)**

### Preview
https://github.com/user-attachments/assets/da72aa8b-6bc5-468e-8f42-0da685105d22

## Features

- **ChatOps Interface**: Manage DigitalOcean resources through natural language commands
- **Visual Dashboard**: DigitalOcean-style interface for viewing and managing resources
- **Resource Management**:
  - Droplets: Create, view, reboot, and destroy virtual machines
  - Kubernetes: Manage K8s clusters
  - Databases: Managed database clusters
  - Domains: DNS management
  - Volumes: Block storage management
  - Firewalls: Security rules
- **MCP Support**: Connect external tools via Model Context Protocol
- **Real-time Updates**: Dashboard updates as resources change


## Get Started

1. Clone this repository

2. Navigate to the project directory:
   ```bash
   cd do.t
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up your environment variables:

   **Option A: Using Tambo CLI (Recommended)**
   ```bash
   npx tambo init
   ```
   This will interactively prompt you for your Tambo API key and create `.env.local` automatically.

   **Option B: Manual Setup**
   ```bash
   cp example.env.local .env.local
   ```
   Then edit `.env.local` and add:
   - `TAMBO_API_KEY` from [tambo.co/dashboard](https://tambo.co/dashboard)
   - `DIGITALOCEAN_TOKEN` from [DigitalOcean API tokens](https://cloud.digitalocean.com/account/api/tokens)

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to use the app!

## Architecture Overview

### Tambo Components

The AI can render specialized components for each resource type:

| Resource | Components |
|----------|-------------|
| Droplets | `dropletCreate`, `dropletDelete`, `dropletReboot`, `dropletView`, `dropletList` |
| Kubernetes | `kubernetesClusterCreate`, `kubernetesClusterDelete`, `kubernetesClusterView`, `kubernetesClusterList` |
| Databases | `databaseCreate`, `databaseDelete`, `databaseView`, `databaseList` |
| Domains | `domainCreate`, `domainDelete`, `domainView`, `domainList` |
| Volumes | `volumeCreate`, `volumeDelete`, `volumeView`, `volumeList` |
| Firewalls | `firewallCreate`, `firewallDelete`, `firewallView`, `firewallList` |

### Key Files

**Configuration**
- `src/lib/tambo.ts` - Component and tool registration
- `src/app/chat/page.tsx` - Main chat interface with TamboProvider

**Dashboard**
- `src/components/ui/do-dashboard.tsx` - DigitalOcean-style dashboard UI
- `src/lib/infra-store.ts` - Infrastructure state management (Zustand)

**Components**
- `src/components/tambo/digitalocean/` - Resource-specific components organized by service:
  - `droplets/` - Droplet management components
  - `kubernetes/` - Kubernetes cluster components
  - `databases/` - Managed database components
  - `domains/` - DNS management components
  - `volumes/` - Block storage components
  - `firewalls/` - Firewall rule components

**API Routes**
- `src/app/api/digitalocean/droplets/` - Droplet CRUD operations
- `src/app/api/digitalocean/droplets/[id]/actions` - Droplet actions (reboot)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint and TypeScript checks
- `npm run check-types` - Run TypeScript type checking

### Adding Custom Components

Register components in `src/lib/tambo.ts` that the AI can render inline in chat. Example structure:

```tsx
import type { TamboComponent } from "@tambo-ai/react";

const components: TamboComponent[] = [
  {
    name: "MyComponent",
    description: "When to use this component",
    component: MyComponent,
    propsSchema: myComponentSchema, // Zod schema
  },
];
```

See `src/components/tambo/digitalocean/` for component examples and [Tambo Components docs](https://docs.tambo.co/concepts/components) for detailed guidance.

### Creating Custom Tools

Add tools in `src/tools/` following this pattern:

```tsx
export const myTool = {
  name: "toolName",
  description: "What this tool does",
  tool: async (param: string) => {
    // Implementation
    return { success: true, message: "Result" };
  },
  toolSchema: z.function().args(
    z.string().describe("Parameter description")
  ).returns(z.object({
    success: z.boolean(),
    message: z.string().optional(),
  })),
};
```

Register in `src/lib/tambo.ts` tools array. See [Tambo Tools docs](https://docs.tambo.co/concepts/tools) for details.

### Project Structure

```
src/
├── app/
│   ├── api/digitalocean/    # API routes for DO integration
│   ├── chat/page.tsx         # Main chat interface
│   └── layout.tsx            # Root layout
├── components/
│   ├── tambo/digitalocean/  # Resource components by service
│   └── ui/do-dashboard.tsx   # Dashboard UI
├── lib/
│   ├── tambo.ts             # Component/tool registration
│   └── infra-store.ts        # State management
└── tools/
    └── digitalocean-tools.ts # AI tools for resource management
```

### Model Context Protocol (MCP)

Configure MCP servers via the settings modal to connect external tools and data sources. Servers are stored in browser localStorage and support custom authorization headers.

## Documentation

Learn more about Tambo:
- [Components](https://docs.tambo.co/concepts/components)
- [Interactable Components](https://docs.tambo.co/concepts/components/interactable-components)
- [Tools](https://docs.tambo.co/concepts/tools)
- [Additional Context](https://docs.tambo.co/concepts/additional-context)

Built with [Tambo AI](https://tambo.co) - A framework for building AI-powered UIs.

## Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License
