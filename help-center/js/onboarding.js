// ========================================
// Onboarding Flow Controller
// ========================================
let currentStep = 1;
const totalSteps = 6;

function updateProgress() {
  const pct = ((currentStep - 1) / (totalSteps - 1)) * 100;
  document.getElementById('progressFill').style.width = pct + '%';
  document.querySelectorAll('.dot').forEach((dot, i) => {
    const step = i + 1;
    dot.classList.toggle('active', step === currentStep);
    dot.classList.toggle('completed', step < currentStep);
  });
  document.getElementById('stepLabel').textContent = `Step ${currentStep} of ${totalSteps}`;
}

function showStep(n) {
  document.querySelectorAll('.step').forEach(s => {
    s.classList.toggle('hidden', parseInt(s.dataset.step) !== n);
  });
  currentStep = n;
  updateProgress();
}

function nextStep() { if (currentStep < totalSteps) showStep(currentStep + 1); }
function prevStep() { if (currentStep > 1) showStep(currentStep - 1); }

// POS Selection
function selectPOS(pos) {
  document.querySelectorAll('.pos-card').forEach(c => c.classList.remove('selected'));
  if (pos === 'square') document.getElementById('posSquare').classList.add('selected');
  if (pos === 'vagaro') document.getElementById('posVagaro').classList.add('selected');
  if (pos === 'skip') document.getElementById('posSkip').classList.add('selected');
  document.getElementById('btnPosContinue').disabled = false;
}

// Brand Selection (auto-handled by CSS :has())

// Import clients: toggle all
const toggleAll = document.getElementById('toggleAll');
if (toggleAll) {
  toggleAll.addEventListener('change', () => {
    document.querySelectorAll('.client-row input[type="checkbox"]').forEach(cb => {
      cb.checked = toggleAll.checked;
    });
    updateImportCount();
  });
}

// Import clients: individual toggles
function updateImportCount() {
  const checked = document.querySelectorAll('.client-row input:checked').length;
  const total = document.querySelectorAll('.client-row input').length;
  const el = document.getElementById('importCount');
  if (el) el.textContent = `${checked} of ${total} selected`;
}

document.querySelectorAll('.client-row input[type="checkbox"]').forEach(cb => {
  cb.addEventListener('change', updateImportCount);
});

// Formula Wizard
let wizardStep = 1;
const wizardSteps = 4;

function wizardNext() {
  if (wizardStep < wizardSteps) {
    document.querySelector(`.wizard-step[data-wizard="${wizardStep}"]`).classList.remove('active');
    wizardStep++;
    document.querySelector(`.wizard-step[data-wizard="${wizardStep}"]`).classList.add('active');
  }
}

function wizardPrev() {
  if (wizardStep > 1) {
    document.querySelector(`.wizard-step[data-wizard="${wizardStep}"]`).classList.remove('active');
    wizardStep--;
    document.querySelector(`.wizard-step[data-wizard="${wizardStep}"]`).classList.add('active');
  }
}

function selectClient(el) {
  document.querySelectorAll('.client-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
}

function selectBrand(el) {
  document.querySelectorAll('.brand-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
}

function selectDev(el) {
  document.querySelectorAll('.dev-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
}

function adjustQty(btn, delta) {
  const span = btn.parentElement.querySelector('span');
  let val = parseFloat(span.textContent);
  val = Math.max(0, +(val + delta * 0.5).toFixed(1));
  span.textContent = val;
}

function adjustTime(delta) {
  const el = document.getElementById('processTime');
  let val = parseInt(el.textContent);
  val = Math.max(5, val + delta);
  el.textContent = val;
}

function saveFormula() {
  // Flash success
  const btn = document.querySelector('.wizard-step.active .btn-primary');
  if (btn) {
    const original = btn.textContent;
    btn.textContent = 'Saved ✓';
    btn.style.background = 'var(--teal)';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
      nextStep();
    }, 800);
  } else {
    nextStep();
  }
}

// Init
updateProgress();
