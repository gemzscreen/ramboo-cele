// The content bank: every template the app can draw from. A template file
// that is not listed here is not shipped; tests/stage3-models.js fails if a
// file under content/templates/ is missing from this list.
import psadBeamSs001 from '../../content/templates/psad/PSAD-BEAM-SS-001.js';
import psadBeamSs002 from '../../content/templates/psad/PSAD-BEAM-SS-002.js';
import msteSurvCurve001 from '../../content/templates/mste/MSTE-SURV-CURVE-001.js';
import hgeHydroGate001 from '../../content/templates/hge/HGE-HYDRO-GATE-001.js';

export const TEMPLATES = [psadBeamSs001, psadBeamSs002, msteSurvCurve001, hgeHydroGate001];

export const templateById = (id) => TEMPLATES.find((t) => t.id === id);
