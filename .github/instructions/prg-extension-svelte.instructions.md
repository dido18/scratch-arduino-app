---
description: "Use when: creating or editing Svelte components for PRG RAISE Playground extensions \u2014 modal UI panels, custom argument selectors, component props, reactive state"
applyTo: "**/extensions/**/*.svelte"
---

# PRG Extension \u2014 Svelte Component Guide

This instruction covers all Svelte component patterns for PRG RAISE Playground extensions.
Svelte files live **alongside** `index.ts` in the same extension folder and are co-located with their extension.

> For TypeScript extension class, block decorators, and menus, see the `prg-extension` instructions.

---

## Two Types of Svelte Components

PRG extensions use Svelte for two distinct purposes:

| Type                | File naming       | Opened via                     | Purpose                         |
| ------------------- | ----------------- | ------------------------------ | ------------------------------- |
| **Modal UI Panel**  | `MyPanel.svelte`  | `this.openUI("MyPanel")`       | Full control panels, info views |
| **Custom Argument** | `MyPicker.svelte` | `this.makeCustomArgument(...)` | Inline block argument selector  |

Both types receive an `extension` prop. Argument components additionally receive `setter` and `current`.

---

## Modal UI Panels

### Opening a Panel (from `index.ts`)

Register `"ui"` as a mixin, then call `openUI()` from any button block:

```typescript
// index.ts
export default class MyExtension extends extension(details, "ui") {
  @scratch.button`Open Control Panel`
  showPanel(): void {
    this.openUI("Counter", "Panel Title (optional)");
  }
}
```

`openUI("Counter")` looks for a file named `Counter.svelte` in the same folder.

### Panel Component Structure

```svelte
<!-- Counter.svelte -->
<script lang="ts">
  import type MyExtension from ".";
  //           ^ import the class type from the extension's index.ts

  export let extension: MyExtension;
  //         ^ automatically injected by the framework

  let count = extension.count;

  const increment = () => {
    extension.increment();
    count = extension.count;
  };
</script>

<div class="panel">
  <h2>My Counter</h2>
  <p>Count: {count}</p>
  <button on:click={increment}>+1</button>
</div>

<style>
  .panel {
    padding: 1rem;
    min-width: 300px;
  }
</style>
```

**Rules**:

- Always `import type ExtensionClass from "."` — never import the default value directly (avoid circular side-effects)
- The `extension` prop is always provided; do not assign a default
- Use Svelte's reactive `$:` statements to sync with extension state
- Panels are rendered in a Scratch modal; keep UI compact (`max-width: 500px`)

### Reactive State Sync

When an extension method mutates state, re-read from `extension` to trigger Svelte reactivity:

```svelte
<script lang="ts">
  import type MyExtension from ".";

  export let extension: MyExtension;

  let items = [...extension.collection];

  const addItem = () => {
    extension.addItem("new");
    items = [...extension.collection]; // reassign to trigger reactivity
  };
</script>
```

---

## Custom Argument Components

Custom argument components replace a standard dropdown with a fully-custom Svelte picker rendered **inside the block**.

### Required Props

All three props must be declared with `export`. The framework injects them automatically:

```svelte
<script lang="ts">
  import type Extension from ".";
  import type { ArgumentEntry, ArgumentEntrySetter, ParameterOf } from "$common";

  // The parameter type this argument represents (mirrors method signature)
  type Value = ParameterOf<Extension, "myBlockMethod", 0>;
  //                                  ^ method name   ^ param index

  export let extension: Extension;            // the extension instance
  export let current: ArgumentEntry<Value>;   // current { value, text }
  export let setter: ArgumentEntrySetter<Value>; // call to update the block arg
</script>
```

Add `// svelte-ignore unused-export-let` if the linter complains about an unused prop.

### Updating the Argument Value

Call `setter({ value, text })` whenever the user makes a selection:

```svelte
<script lang="ts">
  import type Extension, { Animal, nameByAnimal, emojiByAnimal } from ".";
  import type { ArgumentEntry, ArgumentEntrySetter, ParameterOf } from "$common";

  type Value = ParameterOf<Extension, "addAnimalToCollection", 0>;

  // svelte-ignore unused-export-let
  export let extension: Extension;
  // svelte-ignore unused-export-let
  export let current: ArgumentEntry<Value>;
  export let setter: ArgumentEntrySetter<Value>;

  let value: Value = current.value;
  $: text = nameByAnimal[value]; // reactively derive display text

  $: setter({ value, text }); // push every change back to the block
</script>

<div class="picker">
  {#each Object.entries(emojiByAnimal) as [id, emoji]}
    <button on:click={() => (value = parseInt(id))}>
      {emoji}
    </button>
  {/each}
</div>
```

**Key rules**:

- `setter()` must be called on every change \u2014 use a reactive `$:` statement
- `current.value` holds the previous/initial value; read it once on component mount
- Never mutate `current` directly; always go through `setter`
- `text` is the human-readable label shown in the block; `value` is what the method receives

### Wiring the Component in `index.ts`

```typescript
// index.ts
import AnimalPicker from "./AnimalPicker.svelte";
import { Animal, nameByAnimal } from "."; // export enums from index.ts

@(scratch.command(function (_, tag) {
  const arg = this.makeCustomArgument({
    component: AnimalPicker,
    initial: { value: Animal.Leopard, text: nameByAnimal[Animal.Leopard] }
    //         ^ must match ArgumentEntry<Value> shape
  });
  return tag`Add ${arg} to collection`;
}))
addAnimalToCollection(animal: Animal): void {
  this.collection.push(animal);
  this.openUI("Alert"); // optional: show feedback after
}
```

---

## Shared Patterns

### Importing from `$common`

All shared extension types come from the `$common` alias:

```svelte
<script lang="ts">
  import type {
    ArgumentEntry,        // { value: T; text: string }
    ArgumentEntrySetter,  // (entry: ArgumentEntry<T>) => void
    ParameterOf,          // extract type of a method parameter
  } from "$common";
</script>
```

### Scoped Styles

Always use Svelte's scoped `<style>` block. Never write global CSS from a single extension:

```svelte
<style>
  /* Scoped automatically by Svelte \u2014 no risk of leaking into Scratch UI */
  .picker {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  button {
    font-size: 1.25rem;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    border: 2px solid transparent;
    border-radius: 4px;
  }

  button.selected {
    border-color: #622fbd;
    background: #f3ecff;
  }
</style>
```

### Class Directives

Use `class:name={condition}` instead of ternary string concatenation:

```svelte
<!-- \u2705 preferred -->
<button class:selected={value === current}>Click me</button>

<!-- \u274c avoid -->
<button class={value === current ? 'selected' : ''}>Click me</button>
```

### Event Handling

Use Svelte `on:` directives:

```svelte
<button on:click={handleClick}>Click</button>
<input on:input={(e) => (text = e.currentTarget.value)} />
```

---

## File & Naming Conventions

```
extensions/src/my_extension/
\u251c\u2500\u2500 index.ts             # Extension class (TS)
\u251c\u2500\u2500 Counter.svelte       # Modal panel  \u2014 opened via openUI("Counter")
\u251c\u2500\u2500 Animals.svelte       # Another modal panel
\u251c\u2500\u2500 AnimalPicker.svelte  # Custom argument component
\u2514\u2500\u2500 assets/
    \u251c\u2500\u2500 icon.png
    \u2514\u2500\u2500 icon.svg
```

**Naming rules**:

- Modal panels: PascalCase noun (`Counter`, `ColorPicker`, `AnimalCollection`)
- Argument pickers: PascalCase noun + "Picker" or "Argument" suffix
- Do **not** create a `ui/` subdirectory \u2014 keep Svelte files flat alongside `index.ts`

---

## Accessibility Checklist

- Every `<button>` must have visible text or `aria-label`
- Every `<img>` inside a component must have `alt` text
- Avoid relying on color alone to convey state (add text or icon)
- Ensure interactive elements are reachable with keyboard (`tabindex` if needed)

---

## Common Errors & Solutions

| Error                         | Cause                     | Solution                                               |
| ----------------------------- | ------------------------- | ------------------------------------------------------ |
| `extension` is undefined      | Wrong import of extension | Use `import type Extension from "."`                   |
| `setter` not a function       | Prop name mismatch        | Ensure prop is `setter`, not `onChange` or similar     |
| Block arg doesn't update      | Forgot to call `setter`   | Add `$: setter({ value, text })` reactive statement    |
| Component not found           | File name mismatch        | `openUI("Foo")` requires `Foo.svelte` (case-sensitive) |
| Style bleeds into Scratch     | Global CSS written        | Always write styles inside `<style>` in `.svelte` file |
| TypeScript error on prop type | `ParameterOf` wrong index | Check the method signature and 0-based parameter index |

---

## Resources

- [Svelte Interactive Tutorial](https://svelte.dev/tutorial/) \u2014 reactive assignments, bindings, class directives
- [PRG complex_example](https://github.com/mitmedialab/prg-raise-playground/tree/dev/extensions/src/complex_example) \u2014 real-world custom argument and modal panel
- [PRG simple_example](https://github.com/mitmedialab/prg-raise-playground/tree/dev/extensions/src/simple_example) \u2014 minimal UI panels
- `$common` types: `extensions/src/common/index.ts`
