"use client";

import { useMemo, useState } from "react";

const DEFAULTS = {
  squareFeet: 1500,
  askingRentPerSf: 20,
  leaseYears: 5,
  commissionRate: 6
} as const;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function CommissionCalculator() {
  const [squareFeet, setSquareFeet] = useState<number>(DEFAULTS.squareFeet);
  const [askingRentPerSf, setAskingRentPerSf] = useState<number>(DEFAULTS.askingRentPerSf);
  const [leaseYears, setLeaseYears] = useState<number>(DEFAULTS.leaseYears);
  const [commissionRate, setCommissionRate] = useState<number>(DEFAULTS.commissionRate);

  const values = useMemo(() => {
    const annualBaseRent = squareFeet * askingRentPerSf;
    const totalLeaseValue = annualBaseRent * leaseYears;
    const estimatedCommission = totalLeaseValue * (commissionRate / 100);

    return {
      annualBaseRent,
      totalLeaseValue,
      estimatedCommission
    };
  }, [askingRentPerSf, commissionRate, leaseYears, squareFeet]);

  return (
    <div className="calculator-shell">
      <div className="stack calculator-copy">
        <div className="eyebrow">Commission Savings Calculator</div>
        <h2 className="section-title calculator-title">
          See what one filled vacancy can save in broker commission.
        </h2>
        <p className="body-copy calculator-body">
          Plug in your suite size, asking rent, lease term, and commission rate
          to estimate the brokerage fee an owner would typically pay on a
          completed lease.
        </p>
      </div>

      <div className="calculator-grid">
        <div className="card calculator-card">
          <div className="calculator-fields">
            <label className="calculator-field">
              <span>Square feet</span>
              <input
                min={0}
                onChange={(event) => setSquareFeet(Number(event.target.value) || 0)}
                type="number"
                value={squareFeet}
              />
            </label>
            <label className="calculator-field">
              <span>Asking rent / SF</span>
              <input
                min={0}
                onChange={(event) => setAskingRentPerSf(Number(event.target.value) || 0)}
                type="number"
                value={askingRentPerSf}
              />
            </label>
            <label className="calculator-field">
              <span>Lease term (years)</span>
              <input
                min={1}
                onChange={(event) => setLeaseYears(Number(event.target.value) || 1)}
                type="number"
                value={leaseYears}
              />
            </label>
            <label className="calculator-field">
              <span>Commission rate %</span>
              <input
                min={0}
                onChange={(event) => setCommissionRate(Number(event.target.value) || 0)}
                step="0.5"
                type="number"
                value={commissionRate}
              />
            </label>
          </div>
        </div>

        <div className="card calculator-results">
          <div className="calculator-result">
            <span className="calculator-result-label">Annual base rent</span>
            <strong>{formatCurrency(values.annualBaseRent)}</strong>
          </div>
          <div className="calculator-result">
            <span className="calculator-result-label">Total lease value</span>
            <strong>{formatCurrency(values.totalLeaseValue)}</strong>
          </div>
          <div className="calculator-result calculator-result-accent">
            <span className="calculator-result-label">Estimated commission avoided</span>
            <strong>{formatCurrency(values.estimatedCommission)}</strong>
          </div>
          <p className="footer-note" style={{ margin: 0 }}>
            Estimate only. Actual commission structures vary by market, broker,
            and lease economics.
          </p>
        </div>
      </div>
    </div>
  );
}
