<script lang="ts">
  import type Extension from ".";
  import { ParameterOf, ArgumentEntry, ArgumentEntrySetter, color } from "$common";

  type Value = ParameterOf<Extension, "whenModulinoButtonsPressed", 0>;

  export let setter: ArgumentEntrySetter<Value>;
  export let current: ArgumentEntry<Value>

  let selectedButton = current.value || "";

  const handleButtonClick = (button: string) => {
    selectedButton = button;
    setter({
      value: button,
      text: `Button ${button}`,
    });
  };
</script>

<style>
  .modulino-container {
    display: inline-block;
    padding: 8px;
    background-color: #2c5530;
    border: 2px solid #1a3320;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    font-family: Arial, sans-serif;
  }

  .button-row {
    display: flex;
    gap: 12px;
    justify-content: center;
    align-items: center;
  }

  .button {
    width: 32px;
    height: 32px;
    border: 2px solid #666;
    border-radius: 50%;
    background-color: #f0f0f0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 12px;
    color: #333;
    transition: all 0.2s ease;
    user-select: none;
  }

  .button:hover {
    background-color: #e0e0e0;
    border-color: #555;
    transform: translateY(-1px);
  }

  .button.selected {
    background-color: #ff6b35;
    border-color: #e55a2b;
    color: white;
    box-shadow: 0 0 8px rgba(255, 107, 53, 0.4);
  }

  .button:active {
    transform: translateY(0);
  }
</style>

<div class="modulino-container">
  <div class="button-row">
    <div
      class="button {selectedButton === 'A' ? 'selected' : ''}"
      on:click={() => handleButtonClick('A')}
      on:keydown={(e) => e.key === 'Enter' && handleButtonClick('A')}
      role="button"
      tabindex="0"
      title="Button A"
    >
      A
    </div>
    <div
      class="button {selectedButton === 'B' ? 'selected' : ''}"
      on:click={() => handleButtonClick('B')}
      on:keydown={(e) => e.key === 'Enter' && handleButtonClick('B')}
      role="button"
      tabindex="0"
      title="Button B"
    >
      B
    </div>
    <div
      class="button {selectedButton === 'C' ? 'selected' : ''}"
      on:click={() => handleButtonClick('C')}
      on:keydown={(e) => e.key === 'Enter' && handleButtonClick('C')}
      role="button"
      tabindex="0"
      title="Button C"
    >
      C
    </div>
  </div>
</div>