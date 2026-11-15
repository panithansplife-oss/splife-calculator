import React from 'react';
import { INSURANCE_PLANS, type InsurancePlanOption } from '../utils/insuranceCalculator';

interface PartnerLogosProps {
  selectedPlanId: string;
  onSelectPlan: (planId: string) => void;
}

export const PartnerLogos: React.FC<PartnerLogosProps> = ({
  selectedPlanId,
  onSelectPlan,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {INSURANCE_PLANS.map((plan) => {
        const isSelected = plan.id === selectedPlanId;
        return (
          <button
            key={plan.id}
            type="button"
            onClick={() => onSelectPlan(plan.id)}
            aria-pressed={isSelected}
            className={`group flex flex-col justify-between gap-3 rounded-xl border p-4 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
              isSelected
                ? 'border-emerald-700 bg-emerald-50/80 shadow-xs ring-1 ring-emerald-700'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
            }`}
          >
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${
                  isSelected ? 'text-emerald-800' : 'text-slate-500'
                }`}
              >
                รับประกันโดย
              </p>
              <h3 className="mt-0.5 text-base font-bold text-slate-900">
                {plan.shortName}
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              {plan.description}
            </p>
          </button>
        );
      })}
    </div>
  );
};
