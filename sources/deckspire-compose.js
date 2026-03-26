/**
 * Deckspire integration: compose full Universal LPC spritesheet from export JSON (version 2),
 * without mounting the Mithril UI.
 *
 * Prerequisites:
 *   - window.itemMetadata (load item-metadata.js)
 *   - window.__DECKSPIRE_LPC_BASE__ optional URL prefix for spritesheets/
 */

import { importStateFromJSON } from "./state/json.js";
import { renderCharacter, initCanvas, canvas } from "./canvas/renderer.js";
import { getAllCredits } from "./utils/credits.js";
import { state } from "./state/state.js";

/**
 * @param {string | object} jsonInput - JSON string or parsed object (version 2 export)
 * @returns {Promise<{ canvas: HTMLCanvasElement; credits: unknown[]; sheetWidth: number; sheetHeight: number }>}
 */
export async function composeFromExportJson(jsonInput) {
  const jsonString =
    typeof jsonInput === "string" ? jsonInput : JSON.stringify(jsonInput);
  const imported = importStateFromJSON(jsonString);
  Object.assign(state, imported);

  if (!canvas) {
    initCanvas();
  }
  await renderCharacter(state.selections, state.bodyType);

  const credits = getAllCredits(state.selections, state.bodyType);
  return {
    canvas,
    credits,
    sheetWidth: canvas.width,
    sheetHeight: canvas.height,
  };
}
