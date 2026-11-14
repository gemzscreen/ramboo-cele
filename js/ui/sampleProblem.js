// Preview of generated board-style problems: proves the template engine end to
// end across the bank. The real exam screens arrive in Phase 1.
import { buildInstance } from '../engine/generator.js';
import { createRng, randomSeed } from '../engine/rng.js';

const LETTERS = ['A', 'B', 'C', 'D'];

export function mountSampleProblem(root, templates, seed = randomSeed()) {
  let template = templates[0];
  let instance;
  let revealed = false;

  root.innerHTML = `
    <div class="sample-picker">
      <label for="sample-template">Problem type</label>
      <select id="sample-template">
        ${templates.map((t) => `<option value="${t.id}">${t.subject} \u00b7 ${t.archetype}</option>`).join('')}
      </select>
    </div>
    <div data-role="body"></div>`;
  const body = root.querySelector('[data-role="body"]');
  const picker = root.querySelector('#sample-template');

  function render() {
    const items = instance.items.map((item) => `
      <li class="item">
        <p class="item-ask">${item.ask}</p>
        <ol class="choices">
          ${item.choices.map((c, j) => `
            <li class="choice${revealed && c.correct ? ' is-correct' : ''}">
              <span class="choice-letter">${LETTERS[j]}</span>
              <span class="choice-text">${c.text} ${item.unit}</span>
              ${revealed && c.correct ? '<span class="choice-mark">\u2713 Correct</span>' : ''}
            </li>`).join('')}
        </ol>
      </li>`).join('');

    body.innerHTML = `
      <p class="stem">${instance.stem}</p>
      ${template.figure ? `<div class="sample-figure paper">${template.figure(instance.vars)}</div>` : ''}
      <ol class="items${instance.items.length === 1 ? ' items-single' : ''}">${items}</ol>
      ${revealed ? `<div class="solution"><h3>Solution</h3><ol>${instance.solution.map((s) => `<li>${s}</li>`).join('')}</ol></div>` : ''}
      <div class="live-actions">
        <button type="button" class="btn btn-primary" data-role="new">New values</button>
        <button type="button" class="btn" data-role="reveal" aria-pressed="${revealed}">${revealed ? 'Hide answers' : 'Show answers'}</button>
      </div>`;

    body.querySelector('[data-role="new"]').addEventListener('click', () => generate(randomSeed()));
    body.querySelector('[data-role="reveal"]').addEventListener('click', () => { revealed = !revealed; render(); });
  }

  function generate(newSeed) {
    instance = buildInstance(template, createRng(newSeed));
    revealed = false;
    render();
  }

  picker.addEventListener('change', () => {
    template = templates.find((t) => t.id === picker.value) || templates[0];
    generate(randomSeed());
  });

  generate(seed);
  return { getInstance: () => instance, getTemplate: () => template };
}
