<script lang="ts">
  import type Extension from ".";
  import { ParameterOf, ArgumentEntry, ArgumentEntrySetter } from "$common";

  type Value = ParameterOf<Extension, "whenModulinoButtonsPressed", 0>;

  export let setter: ArgumentEntrySetter<Value>;
  export let current: ArgumentEntry<Value>

  let selectedButton = current.value || "";

  const handleButtonClick = (button: string) => {
    selectedButton = button;
    setter({
      value: button,
      text: `${button}`,
    });
  };
</script>

<style>
.modulino-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.modulino-pcb {
  width: 300px;
  height: 150px;
  background-color: #00798c;
  border-radius: 15px;
  position: relative; /* All children are positioned relative to this */
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5); /* Inner shadow for depth */
}

.mounting-hole {
  position: absolute;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 5px #c0c0c0;
}
.mounting-hole::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 15px; /* Inner hole size */
  height: 15px;
  border-radius: 50%;
  background-color: #000; /* Actual hole */
}

/* Positioning the Mounting Holes */
.top-left { top: 15px; left: 15px; }
.top-right { top: 15px; right: 15px; }
.bottom-left { bottom: 15px; left: 15px; }
.bottom-right { bottom: 15px; right: 15px; }

/* --- Pin Headers (Connection Points) --- */
.pin-header {
  position: absolute;
  height: 8px; /* Height of the header area */
  background-color: transparent;
  display: flex;
  justify-content: space-around;
}

/* Small Pin Holes at the Top */
.top-pins {
  top: 5px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
}
.top-pins::before {
  content: '';
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  /* Create 4 equally spaced silver solder pads */
  background: radial-gradient(circle at 12.5% 50%, #c0c0c0 3px, transparent 3px),
              radial-gradient(circle at 37.5% 50%, #c0c0c0 3px, transparent 3px),
              radial-gradient(circle at 62.5% 50%, #c0c0c0 3px, transparent 3px),
              radial-gradient(circle at 87.5% 50%, #c0c0c0 3px, transparent 3px);
  background-size: 100% 100%;
}

.bottom-pins {
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
}
.bottom-pins::before {
  content: '';
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  /* Create 10 equally spaced silver solder pads */
  background:
    radial-gradient(circle at 5% 50%, #c0c0c0 3px, transparent 3px),
    radial-gradient(circle at 15% 50%, #c0c0c0 3px, transparent 3px),
    radial-gradient(circle at 25% 50%, #c0c0c0 3px, transparent 3px),
    radial-gradient(circle at 35% 50%, #c0c0c0 3px, transparent 3px),
    radial-gradient(circle at 45% 50%, #c0c0c0 3px, transparent 3px),
    radial-gradient(circle at 55% 50%, #c0c0c0 3px, transparent 3px),
    radial-gradient(circle at 65% 50%, #c0c0c0 3px, transparent 3px),
    radial-gradient(circle at 75% 50%, #c0c0c0 3px, transparent 3px),
    radial-gradient(circle at 85% 50%, #c0c0c0 3px, transparent 3px),
    radial-gradient(circle at 95% 50%, #c0c0c0 3px, transparent 3px);
  background-size: 100% 100%;
}


.button-group {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: absolute;
  width: 80%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.tactile-button {
  width: 30px;
  height: 30px;
  background-color: #888; /* Button body color */
  position: relative;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tactile-button:hover {
  background-color: #999;
  transform: scale(1.05);
}

.tactile-button.selected {
  background-color: #ff6b35;
  box-shadow: 0 0 8px rgba(255, 107, 53, 0.6);
}

.tactile-button:active {
  transform: scale(0.95);
}

.button-label {
  color: white;
  font-size: 10px;
  font-weight: bold;
  font-family: Arial, sans-serif;
  text-align: center;
  margin-top: 2px;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.8);
}

/* Button Cap (The grey circle) */
.tactile-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #c0c0c0; /* Button cap color */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4) inset;
}

/* Solder Pads for the Button (The silver rectangles) */
.tactile-button::after {
  content: '';
  position: absolute;
  /* Using a combination of box-shadow to fake the 4 pads */
  width: 0;
  height: 0;
  box-shadow:
    -15px -15px 0 2px #c0c0c0,  /* Top Left Pad */
    15px -15px 0 2px #c0c0c0,   /* Top Right Pad */
    -15px 15px 0 2px #c0c0c0,   /* Bottom Left Pad */
    15px 15px 0 2px #c0c0c0;    /* Bottom Right Pad */
  border-radius: 2px;
}

/* --- IC Chip (The small black square) --- */
.ic-chip {
  position: absolute;
  top: 20px;
  right: 60px;
  width: 12px;
  height: 12px;
  background-color: #1a1a1a; /* Black chip body */
  border-radius: 2px;
  box-shadow: 0 0 0 1px #c0c0c0; /* Silver pin outline */
}

</style>

<div class="modulino-container">
  <div class="modulino-pcb">
    <div class="mounting-hole top-left"></div>
    <div class="mounting-hole top-right"></div>
    <div class="mounting-hole bottom-left"></div>
    <div class="mounting-hole bottom-right"></div>

    <div class="pin-header top-pins"></div>
    <div class="pin-header bottom-pins"></div>

    <div class="button-group">
      <div class="button-container">
        <div
          class="tactile-button button-1 {selectedButton === 'A' ? 'selected' : ''}"
          on:click={() => handleButtonClick('A')}
          on:keydown={(e) => e.key === 'Enter' && handleButtonClick('A')}
          role="button"
          tabindex="0"
          title="Button A"
        ></div>
        <div class="button-label">A</div>
      </div>
      <div class="button-container">
        <div
          class="tactile-button button-2 {selectedButton === 'B' ? 'selected' : ''}"
          on:click={() => handleButtonClick('B')}
          on:keydown={(e) => e.key === 'Enter' && handleButtonClick('B')}
          role="button"
          tabindex="0"
          title="Button B"
        ></div>
        <div class="button-label">B</div>
      </div>
      <div class="button-container">
        <div
          class="tactile-button button-3 {selectedButton === 'C' ? 'selected' : ''}"
          on:click={() => handleButtonClick('C')}
          on:keydown={(e) => e.key === 'Enter' && handleButtonClick('C')}
          role="button"
          tabindex="0"
          title="Button C"
        ></div>
        <div class="button-label">C</div>
      </div>
    </div>
    <div class="ic-chip"></div>
  </div>
</div>
