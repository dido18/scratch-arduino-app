# Agents Guide for scratch-arduino-app

This repository hosts a small app that runs Scratch on Arduino UNO Q with custom extensions, a Python bridge, and an Arduino sketch. Agentic tools should follow these conventions to build, test, format, and write code safely.

## Repo Layout
- `Taskfile.yaml` task runner with build/upload/watch utilities
- `sketch/` Arduino sketch (`sketch.ino`, `sketch.yaml`)
- `python/` web UI bridge (`python/main.py`)
- `scratch-prg-extensions/extensions/src/arduino_basics/` TypeScript extension and test
- `scratch-prg-extensions/extensions/src/arduino_modulino/` TypeScript extension and test
- `app.yaml` app manifest (ports, bricks)
- `dprint.json` formatter config (TS/JSON/MD/YAML + Ruff plugin)
- `.github/workflows/` CI (release/check)

## Prerequisites
- pnpm (installed via `task install`) and a recent Node
- go-task (`task` CLI)
- dprint (installed via `task install`)
- arduino-cli with UNO Q core (`arduino:zephyr:unoq`)
- adb (for pushing to the board)
- Docker available on the board (used by Python base image)

## Build, Lint, Test

### Initialize Scratch playground
- `task scratch:init` clones `mitmedialab/prg-raise-playground`, installs deps, and symlinks local extensions
- After init: open `http://localhost:8602?host=BOARD_IP` to dev the GUI and extensions

### Watch / Live Dev
- `task watch` runs three watchers:
  - `scratch:watch` dev server for Scratch GUI (includes both extensions)
  - `python:watch` auto push Python to the board and restart the container
  - `sketch:watch` auto compile/upload the Arduino sketch and sync `sketch/` to the board

### Build & Package App Assets
- `task app:build` copies `python/`, `sketch/`, `app.yaml`, `certs/` and builds Scratch assets via pnpm in the cloned playground
- `task app:zip` creates `build/scratch-arduino-app-<version>.zip`
  - Optional env: `APP_VERSION=1.2.3 task app:zip` (defaults to `git rev-parse --short HEAD`)
- `task app:upload` builds, zips, pushes to the board, unzips, and starts
- `task app:start` starts the app on the board

### Sketch Commands
- `task sketch:compile-and-upload` compiles and uploads to UNO Q
  - Build path: `.cache`
  - Board: `arduino:zephyr:unoq` (flash mode `ram` on upload)
- `task sketch:monitor` opens serial monitor at `/dev/ttyACM0`

### Python Bridge Commands
- `task python:upload-and-restart` pushes `python/` and restarts the container
- `task python:monitor` tails logs of the Python base container on the board

### Formatting / Lint
- `task fmt` runs dprint format for TS/JSON/MD/YAML and Ruff plugin for Python style
- `task fmt:check` runs dprint in check mode
- `dprint.json` highlights:
  - Plugins: typescript, json, markdown, pretty_yaml, ruff
  - Python style via Ruff plugin: `indentStyle: space`, `lineLength: 100`, `indentWidth: 4`
  - Excludes: `**/.venv/**`, `**/assets/**`, `**/scratch-editor/**`, `**/build/**`
- There is no ESLint config in this repo; rely on TypeScript compiler diagnostics in the playground and dprint formatting

### Tests
- Tests live in each extension package:
  - `arduino_basics/index.test.ts`
  - `arduino_modulino/index.test.ts`
- Each package.json defines a test script that delegates to the playground root via pnpm filter:
  - Basics: `pnpm --filter prg-extension-root test arduino_basics/index.test.ts`
  - Modulino: `pnpm --filter prg-extension-root test arduino_modulino/index.test.ts`

#### Run a Single Test File
- Basics: `pnpm --filter prg-extension-root test scratch-prg-extensions/extensions/src/arduino_basics/index.test.ts`
- Modulino: `pnpm --filter prg-extension-root test scratch-prg-extensions/extensions/src/arduino_modulino/index.test.ts`
- Notes:
  - The `$testing` and `$common` path aliases resolve only within the cloned `prg-raise-playground` environment created by `task scratch:init`
  - Run tests from within the playground root or via the package scripts shown above

## Runtime Protocols
- Web UI server runs with SSL: visit `https://<BOARD_HOST>:7000` (required for `getUserMedia()`)
- Extensions connect to `wss://<host>:7000` using Socket.IO (`path: /socket.io`, transports `polling` and `websocket`)
- Query param `host=BOARD_HOST` allows local dev to proxy to a board (`getArduinoBoardHost()`)
- Python bridge relays messages:
  - Receive `matrix_draw` from the web UI and call `Bridge.call("matrix_draw", frame)`
  - Emit `modulino_buttons_pressed` back to clients when sketch reports button events
- Arduino sketch exposes handlers via `Bridge.provide("matrix_draw", ...)` and `Bridge.provide("set_led_rgb", ...)`

## Code Style Guidelines

### Imports
- Prefer named imports and type-only imports where available:
  - `import { type Environment, extension, scratch } from "$common"`
  - `import { io, type Socket } from "socket.io-client"`
- Group imports: external packages first, internal alias modules (`$common`, `$testing`) next, then local files (e.g., Svelte components)
- Avoid deep relative paths; use aliases provided by the playground
- Do not use default imports for modules that export named APIs unless that is the module contract

### Formatting
- Use dprint via `task fmt` for TS/JSON/MD/YAML; Python style via Ruff plugin
- Two spaces are acceptable in TS files per dprint defaults; Python uses 4 spaces per `indentWidth: 4`
- Line length target for Python: 100 per dprint Ruff; for TS, follow dprint defaults, keep lines concise
- Keep trailing commas where supported to reduce diff noise
- Keep ASCII comments short and purpose-driven; avoid decorative comments

### Types (TypeScript)
- Use `type` annotations for imports and parameters
- Prefer `const` for immutable values; avoid `var` (use `let` only for reassignments)
- Annotate function parameters and return types explicitly where inference is weak
- Avoid `any`; prefer union, literal, and readonly types (`as const`) when appropriate
- Use `private` fields for encapsulation (`private socket: Socket | null = null`)
- Use `readonly` for constants and config objects when they should not change

### Naming
- Classes: `PascalCase` (e.g., `ArduinoBasics`, `ModulinoButtons`)
- Functions/methods/variables: `camelCase` (e.g., `getArduinoBoardHost`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `PATTERNS`)
- Events/messages: `lower_snake_or_kebab` per existing APIs (e.g., `matrix_draw`, `modulino_buttons_pressed`)
- Prefer clear, descriptive names over abbreviations

### Error Handling
- TypeScript (extensions):
  - Guard for `null` sockets before `emit`
  - Log connection lifecycle (`connect`, `disconnect` with `reason`)
  - Use `console.error` for unexpected failures; `console.warn` for recoverable conditions
  - Do not throw from event handlers; instead, validate inputs and no-op or emit diagnostics
- Python bridge:
  - Validate message payloads (`frame` must be 104 chars for the 8x13 matrix)
  - Wrap `Bridge.call` in try/except for transport errors and log the exception
  - Keep synchronous handlers small; avoid blocking operations in socket callbacks
- Arduino sketch:
  - Validate lengths and inputs (`frame.length() == 104`), default invalid chars to `0`
  - Use `Serial.println` for diagnostics; keep ISR-safe code out of button updates
  - Keep `Bridge.notify` payloads small and well-defined (A/B/C)

### Events & Sockets
- Always read `host` from the URL if present; fallback to `window.location.hostname`
- Use `wss` in production and local dev; ensure certificate trust on the device
- Prefer emitting typed payloads (e.g., `{ frame: string }`, `{ btn: string }`)
- Reset transient state after consuming events (e.g., clear `button_pressed` once matched)

### Arduino Sketch Conventions
- Target: UNO Q, 8x13 LED matrix `Arduino_LED_Matrix`
 - Brightness levels are 0-7; map string digits to `uint8_t` in `shades`
- Expose callable functions via `Bridge.provide`; keep them fast and side-effect constrained
- Use `digitalWrite` with clear polarity (`LOW` to turn on in current wiring); encapsulate repeated patterns

### Python Conventions
- Use small, composable callback functions for UI messages
- Maintain SSL (`use_ssl=True`) for `WebUI`
- Avoid global mutable state other than module-level objects from bricks
- Log concise, structured messages

### Scratch Extension Conventions
- Define `ExtensionMenuDisplayDetails` with `name`, `description`, icons, tags, and colors
- UI custom arguments use Svelte components (e.g., `MatrixArgument`, `ButtonArgument`) via `makeCustomArgument`
- Use `@scratch.command` and `@scratch.hat` decorators to define blocks
- Keep block tags human readable (e.g., ``tag`draw ${arg} matrix```)

## CI & Workflows
- `.github/workflows/check.yaml` and `release.yaml` exist for automation
- Use `task fmt:check` locally before commits; keep CI green
- Do not commit secrets; avoid pushing `.env` or credentials files

## Cursor/Copilot Rules
- No Cursor rules found in `.cursor/rules/` or `.cursorrules`
- No Copilot instructions found at `.github/copilot-instructions.md`
- If such files are added later, ensure agents ingest and follow them; also update this guide

## Notes for Agents
- Never use destructive git commands; do not amend commits unless requested
- Prefer specialized tools (Read/Grep/Glob/Write/Apply Patch) over shell for file ops
- Keep edits minimal and ASCII; add comments only when needed for clarity
- Suggest tests and formatting after code changes; offer `task` commands users can run
