---
description: "Scaffold a new PRG RAISE Playground Scratch extension — generates index.ts with blocks, metadata, and optional Svelte UI components"
name: "New PRG Extension"
argument-hint: "Extension name and folder (e.g. my_robot_arm)"
agent: "agent"
---

Create a new PRG RAISE Playground extension.

Follow the rules in [prg-extension instructions](../instructions/prg-extension.instructions.md) and [prg-extension-svelte instructions](../instructions/prg-extension-svelte.instructions.md).

## Instructions

Ask the user for the following if not already provided as an argument:

1. **Folder name** — snake_case folder under `scratch-prg-extensions/extensions/src/` (e.g. `my_robot_arm`)
2. **Extension display name** — shown in the Scratch UI
3. **Short description** — one sentence
4. **Block color** — hex code (or suggest `#822fbd` as default)
5. **Mixins needed** — ask which capabilities are required:
   - `"ui"` — custom Svelte panels
   - `"customSaveData"` — save/load state
   - `"customArguments"` — custom argument pickers
   - `"indicators"` — status indicators
6. **Blocks to create** — ask for a brief list of block names and what they do. For each block ask:
   - Is it a `command` (does something), `reporter` (returns value), or `button` (opens UI)?
   - What arguments does it take (type, options, defaults)?

## Output

Generate the following files:

### Always: `extensions/src/<folder>/index.ts`

Use this exact structure:

```typescript
import { type Environment, extension, Language, scratch } from "$common";

const details = {
  name: "<Extension Display Name>",
  description: "<description>",
  implementationLanguage: Language.English,
  blockColor: "<hex>",
  menuColor: "<complementary hex>",
  menuSelectColor: "<accent hex>",
  tags: ["Arduino Modulino"],
};

export default class<ClassName> extends extension(details<mixins>) {
  // State fields here

  async init(env: Environment): Promise<void> {
    // Initialization logic
  }

  // Block methods — one per block, each preceded by its decorator
}
```

Rules for block generation:

- Each block must use the `@scratch.command`, `@scratch.reporter`, or `@scratch.button` decorator
- Use template literal form for static blocks; function form `(self, tag) => tag\`...\`` when the block needs dynamic options from extension state
- Each placeholder `${{ type, defaultValue?, options? }}` maps to one method parameter in order
- Async methods return `Promise<void>` (command) or `Promise<T>` (reporter)
- Add a JSDoc comment above each decorator explaining what the block does

### If `"ui"` mixin is selected: `extensions/src/<folder>/<PanelName>.svelte`

```svelte
<script lang="ts">
  import type <ClassName> from ".";

  export let extension: <ClassName>;
</script>

<!-- UI here -->

<style>
  /* scoped styles */
</style>
```

### If `"customArguments"` mixin is selected: `extensions/src/<folder>/<Name>Picker.svelte`

Include all three required props and a reactive `setter` call:

```svelte
<script lang="ts">
  import type <ClassName>, { <EnumName> } from ".";
  import type { ArgumentEntry, ArgumentEntrySetter, ParameterOf } from "$common";

  type Value = ParameterOf<<ClassName>, "<methodName>", 0>;

  // svelte-ignore unused-export-let
  export let extension: <ClassName>;
  // svelte-ignore unused-export-let
  export let current: ArgumentEntry<Value>;
  export let setter: ArgumentEntrySetter<Value>;

  let value: Value = current.value;
  $: text = String(value);
  $: setter({ value, text });
</script>

<!-- Picker UI here -->
```

### Always: `extensions/src/<folder>/package.json`

```json
{
  "name": "<folder_name>",
  "version": "0.0.1"
}
```

## After generating files

Print a summary:

```
Extension created:
  Folder:   extensions/src/<folder>/
  Class:    <ClassName>
  Blocks:   <count>
  UI files: <list of .svelte files or "none">

To run:
  pnpm dev -i <folder>
  Open http://localhost:8602/
```

Then remind the user to run `pnpm typecheck` to validate TypeScript before committing.
