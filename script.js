let current = '0';
let expression = '';
let mode = 'deg';
let lastAnswer = 0;
let isNewInput = true;
let historyList = [];
let invMode = false;

const display = document.getElementById('displayMain');
const exprDisplay = document.getElementById('displayExpr');

function updateDisplay() {
  display.textContent = current;
  display.className = 'display-main';
  if (current.length > 12) display.classList.add('small');
}

function press(val) {
  if (isNewInput && !['(', ')'].includes(val)) {
    if (['+', '-', '*', '/'].includes(val)) {
      // Continue with operator
    } else {
      current = '';
      isNewInput = false;
    }
  }

  if (val === '.' && current.includes('.')) return;
  if (current === '0' && val !== '.') {
    if (['+', '-', '*', '/', '%'].includes(val)) {
      current += val;
    } else {
      current = val;
    }
  } else {
    current += val;
  }
  isNewInput = false;
  updateDisplay();
}

function pressConst(c) {
  const val = c === 'π' ? Math.PI : Math.E;
  current = isNewInput ? String(val) : current + String(val);
  isNewInput = false;
  updateDisplay();
}

function clearAll() {
  current = '0';
  expression = '';
  exprDisplay.textContent = '';
  isNewInput = true;
  invMode = false;
  updateDisplay();
}

function deleteLast() {
  if (isNewInput || current.length <= 1) {
    current = '0';
    isNewInput = true;
  } else {
    current = current.slice(0, -1);
  }
  updateDisplay();
}

function setMode(m, btn) {
  mode = m;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function toRad(deg) { return deg * Math.PI / 180; }
function toDeg(rad) { return rad * 180 / Math.PI; }

function factorial(n) {
  n = Math.floor(n);
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function calcFn(fn) {
  const num = parseFloat(current);
  let result;
  const expr = current;

  switch(fn) {
    case 'sin':
      result = invMode
        ? toDeg(Math.asin(num))
        : Math.sin(mode === 'deg' ? toRad(num) : num);
      exprDisplay.textContent = invMode ? `asin(${expr})` : `sin(${expr})`;
      break;
    case 'cos':
      result = invMode
        ? toDeg(Math.acos(num))
        : Math.cos(mode === 'deg' ? toRad(num) : num);
      exprDisplay.textContent = invMode ? `acos(${expr})` : `cos(${expr})`;
      break;
    case 'tan':
      result = invMode
        ? toDeg(Math.atan(num))
        : Math.tan(mode === 'deg' ? toRad(num) : num);
      exprDisplay.textContent = invMode ? `atan(${expr})` : `tan(${expr})`;
      break;
    case 'log':
      result = invMode ? Math.pow(10, num) : Math.log10(num);
      exprDisplay.textContent = invMode ? `10^(${expr})` : `log(${expr})`;
      break;
    case 'ln':
      result = invMode ? Math.exp(num) : Math.log(num);
      exprDisplay.textContent = invMode ? `e^(${expr})` : `ln(${expr})`;
      break;
    case 'sqrt':
      result = Math.sqrt(num);
      exprDisplay.textContent = `√(${expr})`;
      break;
    case 'cbrt':
      result = Math.cbrt(num);
      exprDisplay.textContent = `∛(${expr})`;
      break;
    case 'sq':
      result = num * num;
      exprDisplay.textContent = `(${expr})²`;
      break;
    case 'pow':
      current += '^';
      updateDisplay();
      return;
    case 'fact':
      result = factorial(num);
      exprDisplay.textContent = `${expr}!`;
      break;
    case 'abs':
      result = Math.abs(num);
      exprDisplay.textContent = `|${expr}|`;
      break;
    case 'inv_x':
      result = 1 / num;
      exprDisplay.textContent = `1/(${expr})`;
      break;
    case 'neg':
      result = -num;
      exprDisplay.textContent = `-(${expr})`;
      break;
    case 'exp':
      current += 'e+';
      updateDisplay();
      return;
    case 'ans':
      current = String(lastAnswer);
      isNewInput = false;
      updateDisplay();
      return;
    case 'rand':
      result = parseFloat(Math.random().toFixed(8));
      exprDisplay.textContent = 'rand()';
      break;
    case 'inv':
      invMode = !invMode;
      document.querySelector('[onclick="calcFn(\'inv\')"]')
        .style.background = invMode ? '#7c3aed' : '';
      return;
    default:
      return;
  }

  if (isNaN(result) || !isFinite(result)) {
    current = 'Error';
    display.className = 'display-main error';
    display.textContent = 'Error';
    isNewInput = true;
    return;
  }

  const rounded = parseFloat(result.toFixed(10));
  addHistory(exprDisplay.textContent, rounded);
  lastAnswer = rounded;
  current = String(rounded);
  isNewInput = true;
  updateDisplay();
  invMode = false;
  document.querySelector('[onclick="calcFn(\'inv\')"]').style.background = '';
}

function calculate() {
  try {
    const expr = current
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/\^/g, '**')
      .replace(/π/g, Math.PI)
      .replace(/e(?!\+)/g, Math.E)
      .replace(/%/g, '/100');

    exprDisplay.textContent = current + ' =';
    // eslint-disable-next-line no-eval
    const result = Function('"use strict"; return (' + expr + ')')();

    if (isNaN(result) || !isFinite(result)) throw new Error('Invalid');

    const rounded = parseFloat(result.toFixed(10));
    addHistory(current + ' =', rounded);
    lastAnswer = rounded;
    current = String(rounded);
    isNewInput = true;
    updateDisplay();
  } catch(e) {
    display.className = 'display-main error';
    display.textContent = 'Error';
    isNewInput = true;
  }
}

function addHistory(expr, result) {
  historyList.unshift({ expr, result });
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById('historyList');
  if (historyList.length === 0) {
    list.innerHTML = '<div class="history-empty">No calculations yet</div>';
    return;
  }
  list.innerHTML = historyList.slice(0, 20).map(h => `
    <div class="history-item" onclick="loadHistory('${h.result}')">
      <div class="hi-expr">${h.expr}</div>
      <div class="hi-result">${h.result}</div>
    </div>`).join('');
}

function loadHistory(val) {
  current = String(val);
  isNewInput = true;
  updateDisplay();
}

function clearHistory() {
  historyList = [];
  renderHistory();
}

function toggleHistory() {
  document.getElementById('historyPanel').classList.toggle('hidden');
}

// KEYBOARD SUPPORT
document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9') press(e.key);
  else if (e.key === '.') press('.');
  else if (e.key === '+') press('+');
  else if (e.key === '-') press('-');
  else if (e.key === '*') press('*');
  else if (e.key === '/') { e.preventDefault(); press('/'); }
  else if (e.key === '%') press('%');
  else if (e.key === '(') press('(');
  else if (e.key === ')') press(')');
  else if (e.key === 'Enter' || e.key === '=') calculate();
  else if (e.key === 'Backspace') deleteLast();
  else if (e.key === 'Escape') clearAll();
});

window.onload = () => {
  updateDisplay();
  renderHistory();
};