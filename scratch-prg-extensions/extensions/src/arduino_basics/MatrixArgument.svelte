<script lang="ts">
  import type Extension from ".";
  import { ParameterOf, ArgumentEntry, ArgumentEntrySetter, color } from "$common";

  type Value = ParameterOf<Extension, "drawMatrix", 0>;

  export let setter: ArgumentEntrySetter<Value>;
  export let current: ArgumentEntry<Value>

  let matrix = current.value;

  let isMousePressed = false;
  let capturedValue = 0; // Store the value from the first clicked LED
  let paintMode = true; // true = paint mode, false = erase Mode

  const handleMouseDown = (event: MouseEvent, row: number, col: number) => {
    event.preventDefault();
    isMousePressed = true;

    capturedValue = matrix[row][col];
    if (capturedValue === 0) {
      paintMode = true;
      setLEDValue(row, col, 7);
    } else {
      paintMode = false;
      setLEDValue(row, col, 0);
    }
  };

  const handleMouseUp = () => {
    isMousePressed = false;
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isMousePressed) {
        if (paintMode) {
          setLEDValue(row, col, 7);
        } else {
          setLEDValue(row, col, 0);
        }
    }
  };

 const setLEDValue = (row: number, col: number, value: number) => {
    matrix = matrix.map((r: number[], rIndex: number) =>
      r.map((cell, cIndex) => {
        if (rIndex === row && cIndex === col) {
          return value;
        }
        return cell;
      })
    );
  };


  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault(); // Prevent right-click context menu
  };

  const clearMatrix = () => {
    matrix = matrix.map(row => row.map((cell: any) => 0));
  };

  const fillMatrix = () => {
    matrix = matrix.map(row => row.map(cell => 7));
  };

 $: setter({ value: matrix, text:"frame" });
</script>

<style>
  .matrix {
    display: inline-block;
    border: 1px solid #333;
    background-color: #000;
    border-radius: 4px;
    padding: 2px;
  }

  .matrix-row {
    display: flex;
    gap: 1px;
    margin-bottom: 1px;
  }

  .matrix-row:last-child {
    margin-bottom: 0;
  }

  .led {
    width: 15px;
    height: 15px;
    border: 1px solid #444;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.1s ease;
    user-select: none;
    background-color: #222;
  }

  .led:hover {
    border-color: #666;
    transform: scale(1.1);
  }

  .controls {
    margin-top: 8px;
    display: flex;
    gap: 5px;
    justify-content: center;
  }

  .btn {
    padding: 4px 8px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
    transition: background-color 0.2s ease;
  }

  .btn-clear {
    background-color: #dc3545;
    color: white;
  }

  .btn-clear:hover {
    background-color: #c82333;
  }

  .btn-fill {
    background-color: #28a745;
    color: white;
  }

  .btn-fill:hover {
    background-color: #218838;
  }
</style>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div style:background-color={color.ui.white} on:mouseup={handleMouseUp}>
  <div class="matrix">
    {#each matrix as row, rowIndex}
      <div class="matrix-row">
        {#each row as ledValue, colIndex}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class="led"
            style:background-color={ledValue > 0 ? `rgba(0, 123, 255)` : '#222'}
            style:box-shadow={ledValue > 0 ? `0 0 ${ledValue * 2}px rgba(0, 123, 255, 0.8)` : 'none'}
            on:mousedown={(e) => handleMouseDown(e, rowIndex, colIndex)}
            on:mouseenter={() => handleMouseEnter(rowIndex, colIndex)}
            on:contextmenu={handleContextMenu}
            tabindex="0"
            role="button"
            aria-label="LED {rowIndex},{colIndex}: brightness {ledValue}"
          ></div>
        {/each}
      </div>
    {/each}
  </div>

  <div class="controls">
    <button class="btn btn-clear" on:click={clearMatrix}>Clear</button>
    <button class="btn btn-fill" on:click={fillMatrix}>Fill</button>
  </div>
</div>