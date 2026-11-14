// Preview of one generated board-style situation: proves the template engine
// end to end. The real exam screens arrive in Phase 1.
import { buildInstance } from '../engine/generator.js';
import { createRng, randomSeed } from '../engine/rng.js';

const LETTERS = ['A', 'B', 'C', 'D'];

export function mountSampleProblem(root, template, seed = randomSeed()) {
  let instance;
  let revealed = false;

  function render() {
    const items = instance.items.map((item, i) => `
      <li class="item">
        <p class="item-ask">${item.ask}</p>
        <ol class="choices">
          ${item.choices.map((c, j) => `
            <li class="choice${revealed && c.correct ? ' is-correct' : ''}">
              <span class="choice-letter">${LETTERS[j]}</span>
              <span class="choice-text">${c.text} ${item.unit}</span>
              ${revealed && c.correct ? '<span class="choice-mark">✓ Correct</span>' : ''}
            </li>`).join('')}
        </ol>
      </li>`).join('');

    root.innerHTML = `
      <p class="stem">${instance.stem}</p>
      <div class="sample-figure paper">${template.figure(instance.vars)}</div>
      <ol class="items">${items}</ol>
      ${revealed ? `<div class="solution"><h3>Solution</h3><ol>${instance.solution.map((s) => `<li>${s}</li>`).join('')}</ol></div>` : ''}
      <div class="live-actions">
        <button type="button" class="btn btn-primary" data-role="new">New values</button>
        <button type="button" class="btn" data-role="reveal" aria-pressed="${revealed}">${revealed ? 'Hide answers' : 'Show answers'}</button>
      </div>`;

    root.querySelector('[data-role="new"]').addEventListener('click', () => generate(randomSeed()));
    root.querySelector('[data-role="reveal"]').addEventListener('click', () => { revealed = !revealed; render(); });
  }

  function generate(newSeed) {
    instance = buildInstance(template, createRng(newSeed));
    revealed = false;
    render();
  }

  generate(seed);
  return { getInstance: () => instance };
}
