# wind-turbine-bem-analysis

[![Live demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-57d6d1)](https://raghav1822.github.io/wind-turbine-bem-analysis/)

An interactive horizontal-axis wind turbine blade analysis using blade element momentum (BEM) theory and 2-blade versus 3-blade comparison.

## Engineering model

- Blade discretized into 20 annular sections
- Blade element lift and drag estimates
- Prandtl tip-loss correction
- Axial induction and thrust estimate
- Betz-limit-safe power coefficient
- Section lift coefficient comparison for 2-blade and 3-blade rotors

## Run locally

```bash
npm test
npm run serve
```

Open `http://localhost:8080`.
