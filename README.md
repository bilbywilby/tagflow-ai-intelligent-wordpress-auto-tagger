# Cloudflare AI Chat Agent Template

[cloudflarebutton]

A production-ready Cloudflare Workers application featuring a modern React frontend with persistent, multi-session AI chat powered by Durable Objects. Supports streaming responses, tool calling (web search, weather, MCP integration), model switching, and comprehensive session management.

## ✨ Key Features

- **Persistent Chat Sessions**: Unlimited sessions with titles, timestamps, and activity tracking via Durable Objects.
- **AI Integration**: Cloudflare AI Gateway with Gemini models (Flash, Pro, 2.0/2.5 variants).
- **Tool Calling**: Built-in tools for web search (SerpAPI), weather, URL fetching, and extensible MCP server support.
- **Streaming UI**: Real-time message streaming with smooth React frontend using shadcn/ui and Tailwind CSS.
- **Session APIs**: Create, list, delete, rename, and clear sessions via REST endpoints.
- **Responsive Design**: Dark/light themes, mobile-friendly, with sidebar navigation and error boundaries.
- **Type-Safe**: Full TypeScript with Workers types, strict mode, and end-to-end typing.
- **Production-Ready**: CORS, logging, health checks, client error reporting, and observability.

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| **Backend** | Cloudflare Workers, Durable Objects, Hono, Agents SDK, OpenAI SDK |
| **Frontend** | React 18, Vite, TypeScript, shadcn/ui, Tailwind CSS, TanStack Query, React Router |
| **State** | Zustand, Immer, Durable Objects storage |
| **Tools** | SerpAPI, MCP Protocol, Cloudflare AI Gateway |
| **Dev Tools** | Bun, Wrangler, ESLint, Tailwind |

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Configure AI credentials** (in `wrangler.jsonc`):
   ```json
   "vars": {
     "CF_AI_BASE_URL": "https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/openai",
     "CF_AI_API_KEY": "{your_ai_token}",
     "SERPAPI_KEY": "{optional_serpapi_key}"
   }
   ```

3. **Development**:
   ```bash
   bun dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## 📋 Setup & Installation

### Prerequisites
- [Bun](https://bun.sh) 1.0+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- Cloudflare account with [Workers AI Gateway](https://developers.cloudflare.com/ai-gateway/) configured

### Steps
1. Clone or download the project.
2. Run `bun install` to install dependencies.
3. Update `wrangler.jsonc`:
   - Replace `YOUR_ACCOUNT_ID` and `YOUR_GATEWAY_ID` in `CF_AI_BASE_URL`.
   - Add `CF_AI_API_KEY` from your Cloudflare API tokens.
   - Optional: Add `SERPAPI_KEY` for web search ([serpapi.com](https://serpapi.com)).
4. Generate types: `bun cf-typegen`.
5. Start dev server: `bun dev`.

### Type Generation
```bash
wrangler types
```
Updates `./worker/env.d.ts` with binding types.

## 💻 Usage

### Chat Sessions
- **New Session**: Auto-created on first message or via POST `/api/sessions`.
- **List Sessions**: GET `/api/sessions`.
- **Switch Sessions**: UI-managed via chat service.
- **Streaming Chat**: POST `/api/chat/:sessionId/chat` with `{ message, model?, stream: true }`.

### Frontend Customization
- Edit `src/pages/HomePage.tsx` for main UI.
- Use `src/lib/chat.ts` for API integration.
- Components in `src/components/ui/` (shadcn).

### Backend Extension
- **Add Routes**: `worker/userRoutes.ts`.
- **Custom Tools**: `worker/tools.ts` → `executeTool()`.
- **Modify Agent**: `worker/agent.ts` → `onRequest()`.
- **Chat Logic**: `worker/chat.ts` → `ChatHandler`.

## 🔧 Development Workflow

- **Hot Reload**: Frontend auto-reloads on `src/` changes.
- **Worker Dev**: Changes to `worker/` require `wrangler dev` or `bun dev`.
- **Linting**: `bun lint`.
- **Build**: `bun build` (produces `dist/`).
- **Preview**: `bun preview`.

**Pro Tips**:
- Use `console.log` in worker for real-time logs.
- Test tools: `/api/chat/:id/chat` → "What's the weather in NYC?".
- Debug sessions: GET `/api/sessions`.

## 🚀 Deployment

1. **Build assets**:
   ```bash
   bun build
   ```

2. **Deploy**:
   ```bash
   bun deploy
   ```
   Or use the button below:

[cloudflarebutton]

3. **Custom Domain**: `wrangler deploy --name my-chat-app`.
4. **Bindings**: Ensure Durable Objects and vars are set in dashboard.

**Production Notes**:
- Assets served from `dist/` via Workers Sites.
- SPA routing handled automatically.
- Observability enabled by default.

## 🔗 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sessions` | GET | List sessions |
| `/api/sessions` | POST | Create session |
| `/api/sessions/:id` | DELETE | Delete session |
| `/api/chat/:id/messages` | GET | Get chat state |
| `/api/chat/:id/chat` | POST | Send message |
| `/api/chat/:id/clear` | DELETE | Clear messages |

## 🤝 Contributing

1. Fork & clone.
2. `bun install`.
3. Create feature branch.
4. `bun dev` → test.
5. PR with description.

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

## 🙌 Support

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/)
- Issues: GitHub Issues

Built with ❤️ by Cloudflare Templates.