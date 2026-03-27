<script lang="ts">
  import type Extension from ".";
  import { ParameterOf, ArgumentEntry, ArgumentEntrySetter } from "$common";

  type Value = ParameterOf<Extension, "setPixelsPattern", 0>;

  export let setter: ArgumentEntrySetter<Value>;
  export let current: ArgumentEntry<Value>;

  const NUM_LEDS = 8;

  // Initialise from current value or default all off
  let leds: Value = current.value && current.value.length === NUM_LEDS
    ? current.value.map(c => ({ ...c }))
    : Array.from({ length: NUM_LEDS }, () => ({ r: 0, g: 0, b: 0 }));

  // Hidden color-input refs, one per LED
  let colorInputs: HTMLInputElement[] = [];

  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  const rgbToHex = (r: number, g: number, b: number) =>
    `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  const hexToRgb = (hex: string) => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  });

  const isOff = (led: { r: number; g: number; b: number }) =>
    led.r === 0 && led.g === 0 && led.b === 0;

  const handleLedClick = (index: number) => {
    colorInputs[index]?.click();
  };

  const handleColorChange = (index: number, event: Event) => {
    const hex = (event.target as HTMLInputElement).value;
    leds = leds.map((led, i) => (i === index ? hexToRgb(hex) : { ...led }));
  };

  const clearAll = () => {
    leds = Array.from({ length: NUM_LEDS }, () => ({ r: 0, g: 0, b: 0 }));
  };

  $: setter({ value: leds, text: "pixels" });
</script>

<style>
  .pixels-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 12px;
    background-color: #00798c;
    border-radius: 12px;
    gap: 10px;
  }

  .leds-row {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
  }

  .led-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    position: relative;
  }

  .led {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid rgba(255, 255, 255, 0.3);
    transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
  }

  .led:hover {
    transform: scale(1.15);
    border-color: rgba(255, 255, 255, 0.8);
  }

  .led.off {
    background-color: #1a3a3d;
    box-shadow: none;
  }

  .led.on {
    box-shadow: 0 0 8px 3px var(--glow-color, rgba(255, 255, 255, 0.6));
  }

  .led-index {
    font-size: 9px;
    color: rgba(255, 255, 255, 0.6);
    font-family: monospace;
  }

  .color-input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    pointer-events: none;
  }

  .controls {
    display: flex;
    gap: 6px;
  }

  .btn {
    padding: 4px 10px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 11px;
    background-color: #62AEB2;
    color: white;
    transition: background-color 0.2s ease;
  }

  .btn:hover {
    background-color: #5a9ea2;
  }
</style>

<div class="pixels-container">
  <div class="leds-row">
    {#each leds as led, i}
      <div class="led-wrapper">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class="led {isOff(led) ? 'off' : 'on'}"
          style="
            background-color: {isOff(led) ? '#1a3a3d' : `rgb(${led.r},${led.g},${led.b})`};
            --glow-color: rgba({led.r},{led.g},{led.b},0.7);
          "
          title="LED {i} — click to set color"
          on:click={() => handleLedClick(i)}
        />
        <input
          type="color"
          class="color-input"
          value={rgbToHex(led.r, led.g, led.b)}
          bind:this={colorInputs[i]}
          on:input={(e) => handleColorChange(i, e)}
        />
        <span class="led-index">{i}</span>
      </div>
    {/each}
  </div>

  <div class="controls">
    <button class="btn" on:click={clearAll}>Clear all</button>
  </div>
</div>
