<script lang="ts">
  import type Extension from ".";
  import { type ParameterOf, type ArgumentEntry, type ArgumentEntrySetter } from "$common";

  type Value = ParameterOf<Extension, "servoWrite", 0>;

  export let setter: ArgumentEntrySetter<Value>;
  export let current: ArgumentEntry<Value>;

  let selectedPin: number = current.value;

  type PinDef = { pin: number; label: string };

  const rightPins: PinDef[] = [
    { pin: 13, label: "D13" },
    { pin: 12, label: "D12" },
    { pin: 11, label: "~D11" },
    { pin: 10, label: "~D10" },
    { pin: 9,  label: "~D9" },
    { pin: 8,  label: "D8" },
    { pin: 7,  label: "D7" },
    { pin: 6,  label: "~D6" },
    { pin: 5,  label: "~D5" },
    { pin: 4,  label: "D4" },
    { pin: 3,  label: "~D3" },
    { pin: 2,  label: "D2" },
    { pin: 1,  label: "D1" },
    { pin: 0,  label: "D0" },
  ];

  const leftPins: PinDef[] = [
    { pin: 14, label: "A0" },
    { pin: 15, label: "A1" },
    { pin: 16, label: "A2" },
    { pin: 17, label: "A3" },
    { pin: 18, label: "A4" },
    { pin: 19, label: "A5" },
  ];

  const allPins = [...rightPins, ...leftPins];

  const handleClick = (p: PinDef) => { selectedPin = p.pin; };

  $: setter({ value: selectedPin, text: allPins.find(p => p.pin === selectedPin)?.label ?? String(selectedPin) });
</script>

<div class="board-wrap">
  <div class="header header-left">
    <div class="spacer" style="height: calc((14 - 6) * 22px / 2)"></div>
    {#each leftPins as p}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="pin-wrapper left"
        on:click={() => handleClick(p)}
      >
        <span class="pin-label left-label">{p.label}</span>
        <div class="pin-housing" class:selected={selectedPin === p.pin}>
          <div class="pin-hole"></div>
        </div>
      </div>
    {/each}
  </div>

  <div class="header header-right">
    {#each rightPins as p}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="pin-wrapper right"
        on:click={() => handleClick(p)}
      >
        <div class="pin-housing" class:selected={selectedPin === p.pin}>
          <div class="pin-hole"></div>
        </div>
        <span class="pin-label right-label">{p.label}</span>
      </div>
    {/each}
  </div>

</div>

<style>
  .board-wrap {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    font-family: monospace;
    font-size: 9px;
    gap: 40px;
  }

  /* ── Shared header column ── */
  .header {
    display: flex;
    flex-direction: column;
    gap: 0;
    background-color: transparent;
    padding: 2px 0;
  }

  .header-left {
    border-right: none;
  }

  .header-right {
    border-left: none;
  }

  /* ── Individual pin wrapper ── */
  .pin-wrapper {
    display: flex;
    align-items: center;
    height: 20px;
    gap: 3px;
    cursor: pointer;
    user-select: none;
    padding: 0 2px;
  }

  .pin-wrapper.left {
    flex-direction: row-reverse;
    justify-content: flex-end;
  }

  .pin-wrapper.right {
    flex-direction: row;
    justify-content: flex-start;
  }

  /* Black housing rectangle containing the hole */
  .pin-housing {
    width: 14px;
    height: 14px;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
    transition: background-color 0.15s, border-color 0.15s, box-shadow 0.15s;
  }

  .pin-housing:hover {
    background: #2a2a2a;
    border-color: #555;
  }

  .pin-housing.selected {
    background: #E5AD24;
    border-color: #c88a00;
    box-shadow: 0 0 4px #E5AD24bb;
  }

  /* Square hole inside the housing */
  .pin-hole {
    width: 7px;
    height: 7px;
    background: #666;
    border: none;
    border-radius: 0;
    flex-shrink: 0;
    position: relative;
  }

  .pin-housing.selected .pin-hole {
    background: #fff3cc;
  }

  /* Labels with orange badge background — fixed equal width */
  .pin-label {
    background: #ff7a3d;
    color: #fff;
    font-size: 8px;
    white-space: nowrap;
    font-weight: 700;
    letter-spacing: 0.02em;
    padding: 2px 6px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    width: 30px;
    text-align: center;
  }

  .left-label {
    order: 1;
  }

  .right-label {
    order: 1;
  }

  .pin-wrapper.left:hover .pin-label,
  .pin-wrapper.right:hover .pin-label {
    background: #ff9255;
    box-shadow: 0 2px 6px rgba(255,122,61,0.4);
  }

  .pin-wrapper:has(.pin-housing.selected) .pin-label {
    background: #E5AD24;
    box-shadow: 0 0 6px #E5AD24aa;
  }

  .spacer {
    flex-shrink: 0;
  }
</style>
