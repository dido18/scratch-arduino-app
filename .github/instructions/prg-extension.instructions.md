---
description: "Use when: developing PRG RAISE Playground Scratch extensions — TypeScript blocks, decorators, menus, and extension class patterns in index.ts"
applyTo: "**/extensions/**/index.ts"
---

# PRG Extension Development Guide

This instruction applies to TypeScript Scratch extensions in the PRG RAISE Playground framework. Follow these patterns for consistency with existing extensions.

## Quick References

- **Main entry point**: `index.ts` (TypeScript-only, JSDoc-first)
- **Framework forks**: Scratch GUI and Scratch VM (git submodules in `scratch-packages/`)
- **Build system**: PNPM monorepo with TypeScript compilation
- **Testing output**: Served at `http://localhost:8602/`

---

## Extension Structure & Patterns

### 1. Extension Class & Metadata

All PRG extensions use **TypeScript decorators** and extend the `extension()` helper. Start with metadata:

```typescript
import {
  type Environment,
  extension,
  Language,
  SaveDataHandler,
  scratch,
} from "$common";

const details = {
  name: "My Extension",
  description: "A brief description",
  implementationLanguage: Language.English,
  blockColor: "#822fbd", // Hex color for blocks
  menuColor: "#4ed422", // Hex color for menu
  menuSelectColor: "#9e0d2c",
  tags: ["PRG Internal"],
};

export default class MyExtension
  extends extension(details, "ui", "customSaveData")
{
  // Extension state and methods
}
```

**Mixin options**:

- `"ui"` — enables `openUI()` and Svelte component support
- `"customSaveData"` — enables `SaveDataHandler` for persistence
- `"customArguments"` — enables custom argument components
- `"indicators"` — enables status indicators

### 2. Block Definitions with Decorators

Blocks are defined using **decorators** (`@scratch.reporter`, `@scratch.command`, `@scratch.button`). The decorator syntax uses **tagged template literals**:

```typescript
// Reporter block (returns a value)
@(scratch.reporter`My number is ${{ type: "number", defaultValue: 5 }}`)
getNumber(num: number): number {
  return num;
}

// Command block (runs without returning)
@(scratch.command`Set color to ${{ type: "string", options: ["red", "green", "blue"] }}`)
setColor(color: string): void {
  console.log(`Color is ${color}`);
}

// Button block (no arguments, triggered by user click)
@(scratch.button`My Button`)
onButtonClick(): void {
  this.openUI("MyPanel");
}

// Async command
@(scratch.command`Wait ${{ type: "number", defaultValue: 1 }} seconds`)
async wait(seconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}
```

**Block text rules**:

- Use backtick strings for natural language text
- Placeholder syntax: `${{ type, defaultValue?, options? }}`
- Each placeholder becomes a method parameter in order
- `${"blockInput"}` for literal block input fields

### 3. Argument Types & Menus

**Built-in argument types**:

- `"string"` — text input with optional dropdown
- `"number"` — numeric input
- `"boolean"` — checkbox
- `"angle"` — angle picker (0-360)
- `"color"` — color picker
- `"matrix"` — matrix grid editor
- `"image"` — inline image display
- `"note"` — MIDI note picker

**Dropdowns with static options**:

```typescript
@(scratch.reporter`Pick ${{ type: "string", options: ["apple", "banana", "cherry"] }}`)
pickFruit(fruit: string): string {
  return fruit;
}
```

**Dropdowns with dynamic options (Menu)**:

```typescript
class MyExtension extends extension(details) {
  animals = {
    items: ["🐕 Dog", "🐈 Cat", "🐘 Elephant"],
    acceptsReporters: true, // Allow reporter blocks as input
    handler: (input: any) => String(input), // Convert to string
  };

  @scratch.reporter((self, tag) =>
    tag`Pick this animal: ${{ type: "string", options: self.animals }}`
  )
  pickAnimal(animal: string): string {
    return animal;
  }
}
```

**Key difference**: Dynamic menus use a **function** instead of template literal. This allows access to `self` (the extension instance).

### 4. Custom Argument Components (Svelte)

For complex UI pickers inside blocks, use `makeCustomArgument()` with a Svelte component:

```typescript
import AnimalPicker from "./AnimalPicker.svelte";

@(scratch.command((self, tag) => {
  const arg = self.makeCustomArgument({
    component: AnimalPicker,
    initial: { value: Animal.Dog, text: "🐕 Dog" }
  });
  return tag`Add ${arg} to my collection`;
}))
addAnimal(animal: Animal): void {
  // animal is already the resolved value from the picker
}
```

> For all Svelte component patterns (modal panels, argument selectors, props, state) see the `prg-extension-svelte` instructions.

---

## File Organization

```
extensions/
├── src/
│   ├── my_extension/
│   │   ├── index.ts              # Main extension class (required)
│   │   ├── MyPanel.svelte        # UI component (if needed)
│   │   ├── CustomArgument.svelte # Custom argument component
│   │   └── assets/
│   │       ├── icon.png
│   │       └── icon.svg
│   └── common/                       # Shared utilities (for all extensions)
│       └── index.ts
└── package.json
```

**Best practices**:

- Keep `index.ts` focused on block definitions and state management
- Move complex logic to separate utility files
- Co-locate assets (images, icons) with the extension directory
- Use `common/` for shared helpers (type definitions, utilities)
- Svelte component conventions are defined in the `prg-extension-svelte` instructions

---

## Development Workflow

### Create a New Extension

```bash
cd scratch-prg-extensions/extensions/src
pnpm new:extension my_awesome_extension
# Interactive prompts for project setup
# Output includes the path to index.ts

# Or barebones (no template comments):
pnpm new:extension my_awesome_extension barebones
```

The command creates:

- `scratch-prg-extensions/extensions/src/my_awesome_extension/index.ts` (main extension file)
- `scratch-prg-extensions/extensions/src/my_awesome_extension/package.json` (extension metadata)
- `scratch-prg-extensions/extensions/src/my_awesome_extension/*.svelte` template files (if UI is selected)

### Run for Development

```bash
pnpm dev -i my_awesome_extension
# or: pnpm dev --include my_awesome_extension

# Serves at http://localhost:8602/
# Auto-reloads on every file change
```

**Options**:

- `-i all` — serve all extensions (resource-intensive)
- `-i ext1,ext2` — serve multiple specific extensions
- Watch for TypeScript errors in terminal output

### Add to Scratch Workspace

1. Open http://localhost:8602/ in browser
2. Click "Add Extension" button
3. Enter your extension name (from `details.name`)
4. Blocks appear in Scratch palette under your category color

### Verify Blocks Appear

In browser DevTools Console (F12 → Console):

```javascript
// List all registered extensions
Object.keys(window.scratchExtensions);

// Find your extension
window.scratchExtensions["My Extension"];

// List blocks
window.scratchVM.runtime.getBlocks();
```

### Type Checking

Validate TypeScript before committing:

```bash
pnpm typecheck
```

This runs the TypeScript compiler across all extensions without emitting JavaScript.

### Testing Extensions

During development:

1. Keep dev server running
2. Write a simple test block in Scratch
3. Click the block to trigger your code
4. Check browser Console for `console.log()` output

**Common issues**:

- Block not appearing? → Check `details.name` matches decorator
- Decorator not compiling? → Verify template literal syntax
- Menu not showing? → Ensure `Menu` object has `items` array

---

## Common Patterns & Gotchas

### 1. Function vs. Template Literal Decorators

**Template literal** (static):

```typescript
@(scratch.reporter`Answer is ${{ type: "number" }}`)
add(num: number): number { }
```

**Function** (dynamic, access to `self`):

```typescript
@(scratch.reporter((self, tag) =>
  tag`Pick ${{ type: "string", options: self.animals }}`
))
pickAnimal(animal: string): string { }
```

Use function form when decorators need to access extension state (dynamic menus, custom arguments).

### 2. Language Support

Define multilingual extensions with `ExtensionMenuDisplayDetails`:

```typescript
const details = {
  name: "My Extension",
  [Language.Español]: {
    name: "Mi Extensión",
    description: "Descripción en español",
  },
  [Language.Français]: {
    name: "Mon Extension",
    // ...
  },
};
```

### 3. Inline Images

Display images directly in blocks:

```typescript
import myImage from "./assets/my-image.png";

@(scratch.reporter`${{ type: "image", uri: myImage, alt: "My image", flipRTL: true }}`)
imageBlock(img: "inline image"): string {
  return "done";
}
```

**Notes**:

- `flipRTL: true` flips image for right-to-left languages
- Import images at the top; type checker ensures they're valid
- Use `"inline image"` as the parameter type

### 4. Block Utilities

Access metadata about the running block:

```typescript
@(scratch.reporter`Get my block ID`)
getBlockID({ blockID }: BlockUtilityWithID): string {
  return blockID;
}
```

**Available utilities**:

- `BlockUtilityWithID` — provides `blockID` (unique identifier for this block instance)

### 5. Asynchronous Blocks

Always mark async methods:

```typescript
@(scratch.command`Fetch data from ${{ type: "string" }}`)
async fetchData(url: string): Promise<void> {
  const response = await fetch(url);
  const json = await response.json();
  console.log(json);
}
```

Return type is automatically inferred as `Promise<void>` for commands, `Promise<T>` for reporters.

### 6. Menu Handlers

Convert arbitrary input to valid menu values:

```typescript
const animalMenu = {
  items: [{ text: "🐕", value: 0 }, { text: "🐈", value: 1 }],
  handler: (input: any) => {
    if (typeof input === "number" && input in animals) return input;
    return 0;  // Default
  }
};

@(scratch.reporter((self, tag) =>
  tag`Animal: ${{ type: "number", options: animalMenu }}`
))
getAnimal(id: number): string { }
```

### 7. Type-Safe Enums for Arguments

Use TypeScript enums for type safety:

```typescript
export enum Animal {
  Dog,
  Cat,
  Elephant,
}

export const animalNames = {
  [Animal.Dog]: "🐕 Dog",
  [Animal.Cat]: "🐈 Cat",
  [Animal.Elephant]: "🐘 Elephant",
};

@(scratch.reporter((self, tag) =>
  tag`Pick ${{ type: "number", options: Object.values(animalNames) }}`
))
pickAnimal(animal: Animal): string {
  return animalNames[animal];
}
```

### 8. Error Handling in Dropdown Handlers

Always provide safe defaults:

```typescript
const safeFruit = (input: any): Fruit => {
  try {
    const num = Number(input);
    if (num in Fruit) return num;
  } catch (e) {
    console.warn(`Invalid fruit input: ${input}`);
  }
  return Fruit.Apple; // Safe default
};
```

### 9. Initialization

Use `async init(env: Environment)` for setup:

```typescript
async init(env: Environment): Promise<void> {
  // Initialize resources, load data, etc.
  this.animals = await fetchAnimalsFromAPI();
  console.log("Extension initialized");
}
```

The `init` method runs once when the extension loads.

---

## Code Style & Documentation

### JSDoc Comments

Add JSDoc to document extension purpose and complex methods:

```typescript
/**
 * Fetch data from an external API.
 * @param url The API endpoint
 * @returns Promise resolving to parsed JSON
 */
async fetchData(url: string): Promise<Record<string, any>> {
  const response = await fetch(url);
  return response.json();
}
```

VS Code will show these in hover hints and autocomplete.

### Block Documentation

Document what blocks do with comments above the decorator:

```typescript
// Move forward by the given distance
@(scratch.command`Move forward ${{ type: "number", defaultValue: 10 }} pixels`)
moveForward(distance: number): void {
  // ...
}
```

---

## Debugging Tips

### Browser Console (F12)

All `console.log()` calls appear here:

```typescript
@(scratch.command`Test`)
test(): void {
  console.log("Block executed!");  // Visible in DevTools
}
```

**Check for**:

- TypeScript compilation errors reported by webpack
- Extension load messages
- Your extension's console output

### Redux DevTools (Advanced)

The Scratch VM uses Redux. View state changes:

```javascript
// In browser console
window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
```

This helps debug complex state interactions.

### Test Blocks Methodically

1. Create a simple test reporter block that returns a known value
2. Click it and verify the output in Scratch
3. Gradually add complexity (arguments, async, etc.)

### Common Errors & Solutions

| Error                          | Cause                   | Solution                                                   |
| ------------------------------ | ----------------------- | ---------------------------------------------------------- |
| "Block not found"              | Decorator/name mismatch | Verify `details.name` matches your block names             |
| Block appears but doesn't work | Implementation error    | Check browser console for exceptions                       |
| Menu items not showing         | `options` is undefined  | Ensure `Menu.items` is populated in `init()`               |
| Type error on decorator        | Template literal syntax | Use backticks and `${{ }}` syntax correctly                |
| Svelte component not rendering | Missing props           | See `prg-extension-svelte` instructions for required props |
| Stale changes after edit       | Dev server cache        | Kill dev server and restart `pnpm dev`                     |

---
