export const rho = 1.225;

export function prandtlTipLoss(bladeCount, tsr, radiusFraction) {
  if (bladeCount < 1 || tsr <= 0 || radiusFraction <= 0) return 1;
  const f = (2 * bladeCount / Math.PI) *
    (Math.sqrt(1 - radiusFraction * radiusFraction) / (radiusFraction * tsr));
  const exponent = -Math.max(f, 0);
  return (2 / Math.PI) * Math.acos(Math.exp(exponent));
}

export function rotorPerformance({ radius, windSpeed, tipSpeedRatio, pitch, bladeCount }) {
  const area = Math.PI * radius * radius;
  const omega = tipSpeedRatio * windSpeed / radius;
  const sections = [];

  for (let i = 1; i <= 20; i++) {
    const rFraction = i / 20;
    const radiusLocal = radius * rFraction;
    const localSpeed = omega * radiusLocal;
    const relativeSpeed = Math.sqrt(windSpeed * windSpeed + localSpeed * localSpeed);
    const phi = Math.atan2(windSpeed, localSpeed) * 180 / Math.PI;
    const angleOfAttack = clamp(phi - 10 - pitch, -12, 18);
    const cl = clamp(0.9 + 0.105 * angleOfAttack - 0.0022 * angleOfAttack * angleOfAttack, 0.2, 1.35);
    const cd = 0.012 + 0.0008 * Math.abs(angleOfAttack) + 0.0003 * angleOfAttack * angleOfAttack;
    const solidity = (bladeCount * (1.8 - 0.8 * rFraction)) / (2 * Math.PI * rFraction);
    const tipLoss = prandtlTipLoss(bladeCount, tipSpeedRatio, rFraction);
    const axialInduction = clamp(1 / (1 + 4 * tipLoss * rFraction * rFraction * tipSpeedRatio * tipSpeedRatio), 0.08, 0.33);
    const ct = clamp(solidity * (cl * Math.cos(phi * Math.PI / 180) - cd * Math.sin(phi * Math.PI / 180)) * tipLoss, 0.02, 1.2);
    const cpSection = clamp(4 * axialInduction * (1 - axialInduction) * axialInduction + ct * 0.36, 0.02, 0.58);
    sections.push({ rFraction, radiusLocal, relativeSpeed, angleOfAttack, cl, cd, phi, tipLoss, axialInduction, cpSection });
  }

  const meanCp = sections.reduce((sum, section) => sum + section.cpSection, 0) / sections.length;
  const betzAdjusted = clamp(meanCp * (1 - 0.003 * pitch * pitch), 0.05, 0.593);
  const ratedPower = betzAdjusted * 0.5 * rho * area * windSpeed ** 3;
  const thrust = 0.5 * rho * area * windSpeed ** 2 * clamp(0.75 + 0.06 * bladeCount, 0.75, 1);
  const tipLossMean = sections.reduce((sum, section) => sum + section.tipLoss, 0) / sections.length;
  return { cp: betzAdjusted, power: ratedPower, thrust, omega, sections, tipLossMean };
}

export function bladeComparison(radius, windSpeed, tipSpeedRatio, pitch) {
  return [2, 3].map((bladeCount) => ({
    bladeCount,
    ...rotorPerformance({ radius, windSpeed, tipSpeedRatio, pitch, bladeCount })
  }));
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
