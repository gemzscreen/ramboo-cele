// The content bank: every template the app can draw from. A template file
// that is not listed here is not shipped; tests/stage3-models.js fails if a
// file under content/templates/ is missing from this list.
import psadBeamSs001 from '../../content/templates/psad/PSAD-BEAM-SS-001.js';
import psadBeamSs002 from '../../content/templates/psad/PSAD-BEAM-SS-002.js';
import msteSurvCurve001 from '../../content/templates/mste/MSTE-SURV-CURVE-001.js';
import hgeHydroGate001 from '../../content/templates/hge/HGE-HYDRO-GATE-001.js';
import psadTosPropped001 from '../../content/templates/psad/PSAD-TOS-PROPPED-001.js';
import psadSteelCol001 from '../../content/templates/psad/PSAD-STEEL-COL-001.js';
import psadSomTorsion001 from '../../content/templates/psad/PSAD-SOM-TORSION-001.js';
import psadRcBeam001 from '../../content/templates/psad/PSAD-RC-BEAM-001.js';
import msteEconLoan001 from '../../content/templates/mste/MSTE-ECON-LOAN-001.js';
import mstePhysProj001 from '../../content/templates/mste/MSTE-PHYS-PROJ-001.js';
import msteCalcBox001 from '../../content/templates/mste/MSTE-CALC-BOX-001.js';
import hgeFlowPipe001 from '../../content/templates/hge/HGE-FLOW-PIPE-001.js';
import hgeSoilTriax001 from '../../content/templates/hge/HGE-SOIL-TRIAX-001.js';
import hgeSoilPhase001 from '../../content/templates/hge/HGE-SOIL-PHASE-001.js';
import psadEmFriction001 from '../../content/templates/psad/PSAD-EM-FRICTION-001.js';
import psadFtgShear001 from '../../content/templates/psad/PSAD-FTG-SHEAR-001.js';
import psadPscStress001 from '../../content/templates/psad/PSAD-PSC-STRESS-001.js';
import msteCmPert001 from '../../content/templates/mste/MSTE-CM-PERT-001.js';
import msteTransGreen001 from '../../content/templates/mste/MSTE-TRANS-GREEN-001.js';
import msteEdaBinom001 from '../../content/templates/mste/MSTE-EDA-BINOM-001.js';
import msteHwySsd001 from '../../content/templates/mste/MSTE-HWY-SSD-001.js';
import hgeSoilStress001 from '../../content/templates/hge/HGE-SOIL-STRESS-001.js';
import hgeBuoyBarge001 from '../../content/templates/hge/HGE-BUOY-BARGE-001.js';
import hgeConsolNc001 from '../../content/templates/hge/HGE-CONSOL-NC-001.js';

export const TEMPLATES = [
  psadBeamSs001, psadBeamSs002, psadTosPropped001, psadSteelCol001, psadSomTorsion001, psadRcBeam001,
  psadEmFriction001, psadFtgShear001, psadPscStress001,
  msteSurvCurve001, msteEconLoan001, mstePhysProj001, msteCalcBox001,
  msteCmPert001, msteTransGreen001, msteEdaBinom001, msteHwySsd001,
  hgeHydroGate001, hgeFlowPipe001, hgeSoilTriax001, hgeSoilPhase001,
  hgeSoilStress001, hgeBuoyBarge001, hgeConsolNc001,
];

export const templateById = (id) => TEMPLATES.find((t) => t.id === id);
