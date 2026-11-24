import { rotorPerformance, bladeComparison } from './bem.js';

const canvas = document.getElementById('bemCanvas');
const ctx = canvas.getContext('2d');
const ui = {
  radius: document.getElementById('radius'), wind: document.getElementById('wind'),
  tsr: document.getElementById('tsr'), pitch: document.getElementById('pitch'), blades: document.getElementById('blades'),
  radiusOut: document.getElementById('radiusOut'), windOut: document.getElementById('windOut'),
  tsrOut: document.getElementById('tsrOut'), pitchOut: document.getElementById('pitchOut'), bladesOut: document.getElementById('bladesOut'),
  power: document.getElementById('power'), cp: document.getElementById('cp'),
  thrust: document.getElementById('thrust'), tipLoss: document.getElementById('tipLoss')
};

function inputs() {
  return {
    radius: Number(ui.radius.value), windSpeed: Number(ui.wind.value),
    tipSpeedRatio: Number(ui.tsr.value), pitch: Number(ui.pitch.value),
    bladeCount: Number(ui.blades.value)
  };
}

function sync() {
  ui.radiusOut.textContent = ui.radius.value;
  ui.windOut.textContent = ui.wind.value;
  ui.tsrOut.textContent = Number(ui.tsr.value).toFixed(1);
  ui.pitchOut.textContent = ui.pitch.value;
  ui.bladesOut.textContent = ui.blades.value;
  update();
}

function drawAxes(left, right, top, bottom) {
  ctx.strokeStyle = 'rgba(210,232,245,.25)';
  ctx.fillStyle = '#b1c1cf';
  ctx.font = '12px Inter, sans-serif';
  ctx.textAlign = 'center';
  for (let i = 0; i <= 10; i++) {
    const x = left + i / 10 * (right - left);
    ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke();
    ctx.fillText((i / 10).toFixed(1), x, bottom + 22);
  }
  ctx.textAlign = 'right';
  for (let i = 0; i <= 8; i++) {
    const y = bottom - i / 8 * (bottom - top);
    ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke();
    ctx.fillText((i / 8 * 1.5).toFixed(1), left - 10, y + 4);
  }
  ctx.fillStyle = '#edf5ff';
  ctx.textAlign = 'center';
  ctx.fillText('Normalized blade radius r/R', (left + right) / 2, 505);
  ctx.save(); ctx.translate(20, (top + bottom) / 2); ctx.rotate(-Math.PI / 2);
  ctx.fillText('Section lift coefficient C_l', 0, 0); ctx.restore();
}

function drawLine(sections, left, right, top, bottom, color, width) {
  ctx.beginPath();
  sections.forEach((section, i) => {
    const x = left + section.rFraction * (right - left);
    const y = bottom - section.cl / 1.5 * (bottom - top);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function drawChart(current, alternate) {
  const left = 78, right = 828, top = 32, bottom = 462;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#091522'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawAxes(left, right, top, bottom);
  drawLine(alternate.sections, left, right, top, bottom, '#ffb45b', 2);
  drawLine(current.sections, left, right, top, bottom, '#57d6d1', 4);
}

function update() {
  const values = inputs();
  const current = rotorPerformance(values);
  const alternateBladeCount = values.bladeCount === 2 ? 3 : 2;
  const alternate = rotorPerformance({ ...values, bladeCount: alternateBladeCount });
  ui.power.textContent = `${(current.power / 1e6).toFixed(2)} MW`;
  ui.cp.textContent = current.cp.toFixed(3);
  ui.thrust.textContent = `${(current.thrust / 1000).toFixed(1)} kN`;
  ui.tipLoss.textContent = `${(current.tipLossMean * 100).toFixed(1)}%`;
  drawChart(current, alternate);
}

[ui.radius, ui.wind, ui.tsr, ui.pitch, ui.blades].forEach((input) => input.addEventListener('input', sync));
document.getElementById('mode2').addEventListener('click', () => { ui.blades.value = 2; sync(); });
document.getElementById('mode3').addEventListener('click', () => { ui.blades.value = 3; sync(); });
sync();
