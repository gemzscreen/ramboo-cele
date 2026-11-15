// Stage 3 checks for js/models/layeredPermeability.js.
import { layeredPermeability } from '../../js/models/layeredPermeability.js';
const near = (x, y, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
const rejects = (fn, cases, failures) => { for (const bad of cases) { let threw = false; try { fn(bad); } catch { threw = true; } if (!threw) failures.push(`accepted invalid input ${JSON.stringify(bad)}`); } };
const refCheck = (ref, want, failures, tol = 5e-4) => { for (const [k, val] of Object.entries(want)) if (Math.abs(ref[k] - val) > tol * Math.abs(val)) failures.push(`reference instance: ${k} = ${ref[k]}, hand value ${val}`); };

export function check(rng, runs) {
  const failures = [];
  const fail = (msg, v) => { if (failures.length < 10) failures.push(`${msg} for ${JSON.stringify(v)}`); };
  for (let i = 0; i < runs; i++) {
    const layers = Array.from({ length: 1 + Math.floor(rng() * 5) }, () => ({ H: 0.2 + rng() * 6, k: 10 ** (-3 + rng() * 4) }));
    const r = layeredPermeability(layers);
    // Parallel flow under a common gradient i: the layer discharges add.
    const grad = 0.37; const qPar = layers.reduce((s, l) => s + l.k * grad * l.H, 0);
    if (!near(r.kH * grad * r.total, qPar, 1e-9)) fail('kH does not reproduce the total parallel flow', layers);
    // Flow across the layers at velocity v: the head losses v H/k add.
    const vel = 0.011; const loss = layers.reduce((s, l) => s + (vel * l.H) / l.k, 0);
    if (!near((vel * r.total) / r.kV, loss, 1e-9)) fail('kV does not reproduce the total head loss', layers);
    if (r.kH < r.kV * (1 - 1e-12)) fail('kH must be at least kV', layers);
    const ks = layers.map((l) => l.k);
    if (r.kH > Math.max(...ks) * (1 + 1e-12) || r.kV < Math.min(...ks) * (1 - 1e-12)) fail('equivalent k outside the range of the layers', layers);
    if (!near(layeredPermeability(layers.slice().reverse()).kV, r.kV, 1e-9)) fail('order of layers should not matter', layers);
  }
  const same = layeredPermeability([{ H: 2, k: 0.5 }, { H: 3, k: 0.5 }]);
  if (!near(same.kH, 0.5) || !near(same.kV, 0.5)) failures.push('uniform soil should give kH = kV = k');
  // Hand-solved: (2 m, 1), (3 m, 6), (1 m, 0.1) m/day. kH = (2 + 18 + 0.1)/6 = 3.35;
  // kV = 6/(2/1 + 3/6 + 1/0.1) = 6/12.5 = 0.48; ratio = 6.979.
  refCheck(layeredPermeability([{ H: 2, k: 1 }, { H: 3, k: 6 }, { H: 1, k: 0.1 }]), { total: 6, kH: 3.35, kV: 0.48, ratio: 6.97917 }, failures, 1e-6);
  rejects(layeredPermeability, [[], [{ H: 0, k: 1 }], [{ H: 2, k: -1 }], [{ H: 2, k: NaN }]], failures);
  return failures;
}
