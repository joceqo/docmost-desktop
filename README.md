# Docmost Desktop

A lightweight native desktop wrapper for [Docmost](https://docmost.com) — the open-source self-hosted wiki.

Built with [Electrobun](https://electrobun.dev) (Bun + native WebView).

## Features

- Wraps any Docmost instance in a native macOS window
- Persistent login sessions (cookies survive restarts)
- System tray with quick access
- Window position/size remembered across launches
- Standard Edit menu (Cmd+C/V/X/Z work in the Docmost editor)
- First-run setup UI for configuring your instance URL

## Getting Started

```bash
bun install
bun start
```

On first launch, enter your Docmost instance URL (e.g. `https://docs.example.com` or `https://app.docmost.com`).

## Project Structure

```
src/
├── bun/
│   ├── index.ts          # Main process: windows, tray, menus
│   └── settings.ts       # Settings persistence
├── settings-ui/
│   ├── index.html        # First-run config page
│   ├── index.ts          # RPC bridge to main process
│   └── style.css
└── rpc-types.ts          # Shared RPC type definitions
```

## Development

```bash
bun run dev    # Start in dev mode
bun run build  # Production build
```
