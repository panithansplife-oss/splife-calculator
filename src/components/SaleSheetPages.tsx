import React, { useMemo } from 'react';
import {
  type CalculationResult,
  type InsuranceType,
  MIN_AGE,
  MLTA_MAX_AGE,
  MLTA_MAX_AGE_PLUS_TERM,
  MRTA_MAX_AGE,
  MRTA_MAX_AGE_PLUS_TERM,
  formatBaht,
  getMltaCustomerTerms,
  getMrtaCustomerTerms,
} from '../utils/insuranceCalculator';
import {
  MLTA_OFFICIAL_IMAGE_ASSETS,
  MLTA_OVERLAY_POSITIONS,
  MRTA_OFFICIAL_IMAGE_ASSETS,
  MRTA_OVERLAY_POSITIONS,
} from '../utils/mltaSaleSheetContent';

interface SaleSheetPagesProps {
  result: CalculationResult;
  sheetType: InsuranceType;
  customerName: string;
  advisorName?: string;
  compactPreview?: boolean;
}

export const SaleSheetPages: React.FC<SaleSheetPagesProps> = ({
  result,
  sheetType,
  customerName,
  compactPreview = false,
}) => {
  const hasValidSum = result.sumAssured !== null && !result.errors.sumAssured;
  const highlightedAge =
    result.age !== null &&
    result.age >= MIN_AGE &&
    result.age <= MRTA_MAX_AGE
      ? result.age
      : null;
  const hasReadyData = highlightedAge !== null && hasValidSum;

  const isMrta = sheetType === 'mrta';
  const maxCap = isMrta ? MRTA_MAX_AGE_PLUS_TERM : MLTA_MAX_AGE_PLUS_TERM;
  const isAgeOverMltaLimit =
    hasReadyData && !isMrta && highlightedAge! > MLTA_MAX_AGE;
  const showGender = highlightedAge !== null || hasValidSum;

  const effectiveSum = hasValidSum ? result.sumAssured! : isMrta ? 1_000_000 : 100_000;
  const effectiveAge = highlightedAge ?? 35;

  const quotes = useMemo(
    () =>
      isMrta
        ? getMrtaCustomerTerms(result.gender, effectiveAge, effectiveSum)
        : getMltaCustomerTerms(result.gender, effectiveAge, effectiveSum),
    [isMrta, result.gender, effectiveAge, effectiveSum]
  );

  const selectedTerm =
    result.term !== null &&
    !result.errors.term &&
    (highlightedAge === null || highlightedAge + result.term <= maxCap)
      ? result.term
      : null;

  const selectedQuote = useMemo(
    () =>
      hasReadyData && selectedTerm
        ? quotes.find((q) => q.term === selectedTerm && q.totalPremium !== null) ?? null
        : null,
    [hasReadyData, quotes, selectedTerm]
  );

  if (isAgeOverMltaLimit) {
    return null;
  }

  const assets = isMrta ? MRTA_OFFICIAL_IMAGE_ASSETS : MLTA_OFFICIAL_IMAGE_ASSETS;
  const pos = isMrta ? MRTA_OVERLAY_POSITIONS : MLTA_OVERLAY_POSITIONS;
  const typeLabel = isMrta
    ? 'แบบประกันภัยคุ้มครองสินเชื่อแบบลดลง (MRTA)'
    : 'แบบประกันภัยคุ้มครองสินเชื่อแบบคงที่ (MLTA)';

  const overlaySizeClass = compactPreview
    ? 'text-[9px] sm:text-[10.5px]'
    : 'text-[clamp(10px,1.55vw,13.5px)] print:text-[12px]';

  return (
    <div className={compactPreview ? 'space-y-3' : 'print:p-0 print:bg-white print:space-y-0'}>
      {/* PAGE 1: UPLOADED OFFICIAL FRONT IMAGE WITH AUTO-FILLED OVERLAYS */}
      <article
        className={
          compactPreview
            ? 'relative mx-auto w-full max-w-[540px] overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xs'
            : 'relative mx-auto max-w-[794px] overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xs print:w-[190mm] print:max-w-full print:rounded-none print:border-0 print:shadow-none print:break-inside-avoid'
        }
      >
        <img
          src={assets.front}
          alt={`${typeLabel} ด้านหน้า`}
          className="block w-full h-auto"
        />
        {customerName.trim() && (
          <div
            style={{ ...pos.customerName, paddingLeft: '6px' }}
            className={`pointer-events-none absolute truncate font-bold leading-none text-[#0f2a1e] tabular-nums ${overlaySizeClass}`}
          >
            {customerName.trim()}
          </div>
        )}
        {highlightedAge !== null && (
          <div
            style={pos.age}
            className={`pointer-events-none absolute text-center font-bold leading-none text-[#0f2a1e] tabular-nums ${overlaySizeClass}`}
          >
            {highlightedAge}
          </div>
        )}
        {showGender && (
          <div
            style={pos.gender}
            className={`pointer-events-none absolute text-center font-bold leading-none text-[#0f2a1e] tabular-nums ${overlaySizeClass}`}
          >
            {result.gender === 'male' ? 'ชาย' : 'หญิง'}
          </div>
        )}
        {selectedTerm !== null && (
          <div
            style={pos.term}
            className={`pointer-events-none absolute text-center font-bold leading-none text-[#0f2a1e] tabular-nums ${overlaySizeClass}`}
          >
            {selectedTerm}
          </div>
        )}
        {hasValidSum && result.sumAssured !== null && (
          <div
            style={pos.sumAssured}
            className={`pointer-events-none absolute text-center font-bold leading-none text-[#0f2a1e] tabular-nums ${overlaySizeClass}`}
          >
            {formatBaht(result.sumAssured)}
          </div>
        )}
        {selectedQuote?.totalPremium != null && (
          <div
            style={pos.premium}
            className={`pointer-events-none absolute text-center font-bold leading-none text-[#0f2a1e] tabular-nums ${overlaySizeClass}`}
          >
            {formatBaht(selectedQuote.totalPremium)}
          </div>
        )}
      </article>

      {/* PAGE 2: UPLOADED OFFICIAL BACK IMAGE */}
      <article
        className={
          compactPreview
            ? 'mx-auto w-full max-w-[540px] overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xs'
            : 'mx-auto max-w-[794px] overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xs print:w-[190mm] print:max-w-full print:rounded-none print:border-0 print:shadow-none print:break-before-page print:break-inside-avoid'
        }
      >
        <img
          src={assets.back}
          alt={`สรุปเงื่อนไขทั่วไปของแบบประกันภัย ${isMrta ? 'MRTA' : 'MLTA'} ด้านหลัง`}
          className="block w-full h-auto"
        />
      </article>
    </div>
  );
};
