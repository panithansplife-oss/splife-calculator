import React, { useMemo } from 'react';
import { Check } from 'lucide-react';
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
  MLTA_OFFICIAL_BACK_TEXT,
  MLTA_OFFICIAL_FRONT_TEXT,
  MLTA_OFFICIAL_IMAGE_ASSETS,
  MLTA_OVERLAY_POSITIONS,
  MRTA_DIAGRAM_STEPS,
  MRTA_OFFICIAL_BACK_EXTRA,
  MRTA_OFFICIAL_FRONT_TEXT,
} from '../utils/mltaSaleSheetContent';

interface SaleSheetSectionProps {
  result: CalculationResult;
  sheetType: InsuranceType;
  setSheetType: (t: InsuranceType) => void;
  customerName: string;
  setCustomerName: (v: string) => void;
  advisorName: string;
  setAdvisorName: (v: string) => void;
  onSelectTerm?: (term: number) => void;
  onClearTerm?: () => void;
  onRequestPrintSaleSheet: (targetType: InsuranceType) => void;
  isPrintTarget: boolean;
}

export const SaleSheetSection: React.FC<SaleSheetSectionProps> = ({
  result,
  sheetType,
  customerName,
  advisorName,
  isPrintTarget,
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

  const docTitle = isMrta
    ? MRTA_OFFICIAL_FRONT_TEXT.title
    : MLTA_OFFICIAL_FRONT_TEXT.title;

  return (
    <section
      id="sale-sheet-section"
      aria-label="Sale Sheet เอกสารสรุปข้อเสนอแผนประกันคุ้มครองสินเชื่อ"
      className={
        isPrintTarget
          ? 'hidden print:block print-sale-sheet-page'
          : 'hidden print:hidden'
      }
    >

      {/* ==================== OFFICIAL 2-PAGE BAAC SALE SHEET ==================== */}
      {!isAgeOverMltaLimit && !isMrta && (
        <div className="hidden print:block print:p-0 print:bg-white print:space-y-0">
          {/* MLTA PAGE 1: UPLOADED OFFICIAL FRONT IMAGE WITH AUTO-FILLED OVERLAYS */}
          <article className="relative mx-auto max-w-[794px] overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xs print:w-[196mm] print:max-w-full print:rounded-none print:border-0 print:shadow-none print:break-inside-avoid">
            <img
              src={MLTA_OFFICIAL_IMAGE_ASSETS.front}
              alt="แบบประกันภัยคุ้มครองสินเชื่อแบบคงที่ (MLTA) ด้านหน้า"
              className="block w-full h-auto"
            />
            {customerName.trim() && (
              <div
                style={{ ...MLTA_OVERLAY_POSITIONS.customerName, paddingLeft: '6px' }}
                className="pointer-events-none absolute truncate font-bold leading-none text-[#0f2a1e] tabular-nums text-[clamp(10px,1.55vw,13.5px)] print:text-[12.5px]"
              >
                {customerName.trim()}
              </div>
            )}
            {highlightedAge !== null && (
              <div
                style={MLTA_OVERLAY_POSITIONS.age}
                className="pointer-events-none absolute text-center font-bold leading-none text-[#0f2a1e] tabular-nums text-[clamp(10px,1.55vw,13.5px)] print:text-[12.5px]"
              >
                {highlightedAge}
              </div>
            )}
            {showGender && (
              <div
                style={MLTA_OVERLAY_POSITIONS.gender}
                className="pointer-events-none absolute text-center font-bold leading-none text-[#0f2a1e] tabular-nums text-[clamp(10px,1.55vw,13.5px)] print:text-[12.5px]"
              >
                {result.gender === 'male' ? 'ชาย' : 'หญิง'}
              </div>
            )}
            {selectedTerm !== null && (
              <div
                style={MLTA_OVERLAY_POSITIONS.term}
                className="pointer-events-none absolute text-center font-bold leading-none text-[#0f2a1e] tabular-nums text-[clamp(10px,1.55vw,13.5px)] print:text-[12.5px]"
              >
                {selectedTerm}
              </div>
            )}
            {hasValidSum && result.sumAssured !== null && (
              <div
                style={MLTA_OVERLAY_POSITIONS.sumAssured}
                className="pointer-events-none absolute text-center font-bold leading-none text-[#0f2a1e] tabular-nums text-[clamp(10px,1.55vw,13.5px)] print:text-[12.5px]"
              >
                {formatBaht(result.sumAssured)}
              </div>
            )}
            {selectedQuote?.totalPremium != null && (
              <div
                style={MLTA_OVERLAY_POSITIONS.premium}
                className="pointer-events-none absolute text-center font-bold leading-none text-[#0f2a1e] tabular-nums text-[clamp(10px,1.55vw,13.5px)] print:text-[12.5px]"
              >
                {formatBaht(selectedQuote.totalPremium)}
              </div>
            )}
          </article>

          {/* MLTA PAGE 2: UPLOADED OFFICIAL BACK IMAGE */}
          <article className="mx-auto max-w-[794px] overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xs print:w-[196mm] print:max-w-full print:rounded-none print:border-0 print:shadow-none print:break-before-page print:break-inside-avoid">
            <img
              src={MLTA_OFFICIAL_IMAGE_ASSETS.back}
              alt="สรุปเงื่อนไขทั่วไปของแบบประกันภัย MLTA ด้านหลัง"
              className="block w-full h-auto"
            />
          </article>
        </div>
      )}

      {!isAgeOverMltaLimit && isMrta && (
        <div className="hidden print:block print:p-0 print:bg-white print:space-y-0">
          {/* MRTA PAGE 1: FRONT PROPOSAL */}
          <article className="mx-auto max-w-[794px] rounded-lg border border-slate-300 bg-white p-5 sm:p-7 shadow-xs text-slate-900 print:w-[196mm] print:max-w-full print:rounded-none print:border-0 print:shadow-none print:p-0 print:break-inside-avoid">
            {/* Partner Insurers Top Row */}
            <div className="grid grid-cols-4 gap-3 items-center justify-items-center pb-2.5 mb-3 border-b border-slate-200 print:mb-1.5 print:pb-1">
              <div className="bg-zinc-900 text-white px-3 py-1 rounded-xl rounded-bl-xs text-center text-[11px] font-bold leading-tight">
                เมืองไทย
                <br />
                ประกันชีวิต
              </div>
              <div className="border-[1.5px] border-zinc-900 px-2.5 py-1 text-center leading-tight">
                <div className="text-[11px] font-bold text-zinc-900">ไทยสมุทร</div>
                <div className="text-[7px] font-semibold tracking-tight text-zinc-700">
                  OCEAN LIFE INSURANCE
                </div>
              </div>
              <div className="text-center text-zinc-900 leading-none">
                <div className="text-sm font-extrabold">se Life</div>
                <div className="text-[7.5px] font-semibold mt-0.5">อาคเนย์ประกันชีวิต</div>
              </div>
              <div className="bg-zinc-900 text-white px-2.5 py-1.5 text-center text-[11px] font-bold leading-tight">
                ไทยประกันชีวิต
              </div>
            </div>

            {/* Official Headings */}
            <div className="space-y-0.5 mb-2.5 print:mb-1">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 print:text-base print:leading-tight">
                {docTitle}
              </h3>
              <p className="text-sm font-semibold text-slate-900 print:text-xs print:leading-tight">
                {MLTA_OFFICIAL_FRONT_TEXT.subtitle}
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 print:text-xs print:leading-tight">
                {MLTA_OFFICIAL_FRONT_TEXT.brokerLine}
              </p>
            </div>

            {/* Proposal Meta Line */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 text-xs sm:text-sm mb-2.5 print:flex-row print:text-[11px] print:mb-1">
              <div className="leading-relaxed">
                เสนอ{' '}
                <span className="inline-block min-w-[160px] border-b border-dotted border-slate-700 px-1 font-bold text-slate-900">
                  {customerName.trim() || ''}
                </span>{' '}
                อายุ{' '}
                <span className="inline-block min-w-[36px] text-center border-b border-dotted border-slate-700 px-1 font-mono font-bold tabular-nums">
                  {highlightedAge ?? ''}
                </span>{' '}
                ปี เพศ{' '}
                <span className="inline-block min-w-[44px] text-center border-b border-dotted border-slate-700 px-1 font-bold">
                  {showGender ? (result.gender === 'male' ? 'ชาย' : 'หญิง') : ''}
                </span>
              </div>
              <div className="sm:text-right print:text-right shrink-0 space-y-0.5 tabular-nums">
                <div>
                  ระยะเวลาเอาประกันภัย{' '}
                  <span className="inline-block min-w-[36px] text-center border-b border-dotted border-slate-700 px-1 font-mono font-bold">
                    {selectedTerm ?? ''}
                  </span>{' '}
                  ปี
                </div>
                <div>
                  ระยะเวลาชำระเบี้ยประกันภัย <strong>ครั้งเดียว</strong>
                </div>
              </div>
            </div>

            <div className="my-1.5 print:my-0.5">
              <p className="text-center text-[11px] font-semibold text-slate-900 mb-1 print:text-[9.5px] print:mb-0.5">
                {MRTA_OFFICIAL_FRONT_TEXT.diagramCaption}
              </p>
              <svg
                viewBox="0 0 700 212"
                className="w-full h-auto"
                role="img"
                aria-label="แผนภาพความคุ้มครองแบบประกันภัยคุ้มครองสินเชื่อแบบลดลง 1 ถึง 30 ปี"
              >
                <text x="6" y="124" fontSize="13.5" fontWeight="700" fill="#0f172a">
                  ระยะเวลา
                </text>
                <text x="6" y="142" fontSize="13.5" fontWeight="700" fill="#0f172a">
                  ชำระเงินกู้ (ปี)
                </text>

                {MRTA_DIAGRAM_STEPS.map((s, idx) => (
                  <rect
                    key={idx}
                    x={s.x}
                    y={s.y}
                    width={s.w}
                    height={140 - s.y}
                    fill="rgba(217, 119, 6, 0.08)"
                    stroke="#0f172a"
                    strokeWidth="1.5"
                  />
                ))}

                <path
                  d="M 106 38 C 195 48, 355 82, 548 139"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="2"
                />
                <path
                  d="M 106 38 C 195 48, 355 82, 548 139 L 548 140 L 106 140 Z"
                  fill="rgba(255, 255, 255, 0.68)"
                />
                <text x="275" y="114" textAnchor="middle" fontSize="14.5" fontWeight="700" fill="#0f172a">
                  ภาระหนี้สินคงเหลือ
                </text>

                <line x1="106" y1="140" x2="548" y2="140" stroke="#0f172a" strokeWidth="2.2" />

                <rect x="96" y="131" width="20" height="18" rx="3" fill="#ffffff" stroke="#0f172a" strokeWidth="1.8" />
                <text x="106" y="144" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#0f172a">
                  0
                </text>
                <rect x="538" y="131" width="20" height="18" rx="3" fill="#ffffff" stroke="#0f172a" strokeWidth="1.8" />
                <text x="548" y="144" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#0f172a">
                  30
                </text>

                <line x1="106" y1="152" x2="106" y2="174" stroke="#0f172a" strokeWidth="1.8" />
                <polygon points="106,149 102,157 110,157" fill="#0f172a" />
                <text x="106" y="189" textAnchor="middle" fontSize="11" fontWeight="600" fill="#0f172a">
                  ชำระเบี้ยประกันภัยครั้งเดียว
                </text>

                <path
                  d="M 124 154 L 124 164 L 548 164 L 548 154"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="1.6"
                />
                <line x1="336" y1="164" x2="336" y2="172" stroke="#0f172a" strokeWidth="1.6" />
                <text x="336" y="187" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0f172a">
                  เลือกระยะเวลาเอาประกันภัยได้ตั้งแต่ 1 - 30 ปี
                </text>

                <text x="625" y="42" textAnchor="middle" fontSize="13.5" fontWeight="700" fill="#0f172a">
                  จำนวนเงินเอาประกันภัย
                </text>
                <text x="625" y="96" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0f172a">
                  ระยะเวลาผ่อนชำระ
                </text>
                <text x="625" y="116" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0f172a">
                  =
                </text>
                <text x="625" y="138" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0f172a">
                  {selectedTerm !== null
                    ? `ระยะเวลาเอาประกันภัย ${selectedTerm} ปี`
                    : 'ระยะเวลาเอาประกันภัย'}
                </text>
              </svg>
            </div>

            <p className="text-center text-[11px] font-semibold text-slate-800 mb-2.5 print:text-[9.5px] print:mb-1">
              {MLTA_OFFICIAL_FRONT_TEXT.assumptionNote}
            </p>

            {/* Box Table 1: Coverage & Sum Assured */}
            <table className="w-full border-collapse mb-2 tabular-nums print:mb-1">
              <thead>
                <tr className="bg-slate-50">
                  <th className="w-[60%] border-[1.5px] border-slate-900 px-3 py-1.5 text-center text-xs sm:text-sm font-bold print:py-1 print:text-xs">
                    ความคุ้มครอง
                  </th>
                  <th className="w-[40%] border-[1.5px] border-slate-900 px-3 py-1.5 text-center text-xs sm:text-sm font-bold print:py-1 print:text-xs">
                    จำนวนเงินเอาประกันภัยเริ่มต้น
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-[1.5px] border-slate-900 px-3 py-1.5 text-center text-xs sm:text-sm font-semibold print:py-1 print:text-xs">
                    {docTitle}
                  </td>
                  <td className="border-[1.5px] border-slate-900 px-3 py-1.5 text-center text-xs sm:text-sm font-bold print:py-1 print:text-xs">
                    <span className="inline-block min-w-[110px] border-b border-dotted border-slate-700 px-1 font-mono">
                      {hasValidSum && result.sumAssured !== null
                        ? formatBaht(result.sumAssured)
                        : ''}
                    </span>{' '}
                    บาท
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Box Table 2: Premium & Payment Frequency */}
            <table className="w-full border-collapse mb-2.5 tabular-nums print:mb-1">
              <thead>
                <tr className="bg-slate-50">
                  <th className="w-[60%] border-[1.5px] border-slate-900 px-3 py-1.5 text-center text-xs sm:text-sm font-bold print:py-1 print:text-xs">
                    เบี้ยประกันภัย
                  </th>
                  <th className="w-[40%] border-[1.5px] border-slate-900 px-3 py-1.5 text-center text-xs sm:text-sm font-bold print:py-1 print:text-xs">
                    งวดการชำระเบี้ยประกันภัย
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-[1.5px] border-slate-900 px-3 py-1.5 text-xs sm:text-sm font-semibold print:py-1 print:text-xs">
                    <div>
                      เบี้ยประกันชีวิต {docTitle}{' '}
                      <span className="inline-block min-w-[90px] text-center border-b border-dotted border-slate-700 px-1 font-mono font-bold">
                        {selectedQuote?.totalPremium != null
                          ? formatBaht(selectedQuote.totalPremium)
                          : ''}
                      </span>{' '}
                      บาท
                    </div>
                    <p className="text-[10px] font-medium text-slate-600 mt-0.5 print:text-[8.5px]">
                      {MLTA_OFFICIAL_FRONT_TEXT.premiumDeliveryNote}
                    </p>
                  </td>
                  <td className="border-[1.5px] border-slate-900 px-3 py-1.5 text-center text-xs sm:text-sm font-bold print:py-1 print:text-xs">
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-900">
                        <Check className="h-3 w-3 stroke-[2.5]" aria-hidden="true" />
                      </span>
                      <span>ครั้งเดียว</span>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* MRTA Policy Benefits */}
            <div className="space-y-0.5 text-[10.5px] leading-snug text-slate-900 print:text-[9px] print:leading-[1.28]">
              <h4 className="text-xs font-bold print:text-[10px]">
                {MRTA_OFFICIAL_FRONT_TEXT.benefitsHeading}
              </h4>
              <p>{MRTA_OFFICIAL_FRONT_TEXT.benefit1}</p>
              <p>{MRTA_OFFICIAL_FRONT_TEXT.benefit2Heading}</p>
              <p className="pl-3">{MRTA_OFFICIAL_FRONT_TEXT.benefit2_1Heading}</p>
              <p className="pl-6">
                <strong>งวดที่ 1</strong>{' '}
                {MRTA_OFFICIAL_FRONT_TEXT.benefit2_1Installment1.replace(/^งวดที่ 1\s*/, '')}
              </p>
              <p className="pl-6">
                <strong>งวดที่ 2</strong>{' '}
                {MRTA_OFFICIAL_FRONT_TEXT.benefit2_1Installment2.replace(/^งวดที่ 2\s*/, '')}
              </p>
              <p className="pl-3">{MRTA_OFFICIAL_FRONT_TEXT.benefit2_2}</p>
            </div>

            {/* Notes */}
            <div className="mt-2 space-y-0.5 text-[10px] leading-snug text-slate-900 print:text-[8.5px] print:mt-1 print:leading-[1.28]">
              <p>
                <strong>{MLTA_OFFICIAL_FRONT_TEXT.notesHeading}</strong>{' '}
                {MLTA_OFFICIAL_FRONT_TEXT.note1}
              </p>
              <p className="pl-10">{MLTA_OFFICIAL_FRONT_TEXT.note2}</p>
            </div>

            {/* Front Footer */}
            <div className="mt-2.5 pt-2 border-t border-dashed border-slate-300 text-center text-[10.5px] space-y-0.5 print:text-[9px] print:mt-1 print:pt-1">
              <p>{MLTA_OFFICIAL_FRONT_TEXT.footerBackRef}</p>
              <p className="font-bold text-slate-900">
                {MLTA_OFFICIAL_FRONT_TEXT.footerBrokerDisclaimer}
              </p>
            </div>

            {/* MRTA Dual Signature Boxes */}
            <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] leading-snug print:grid-cols-2 print:gap-3 print:mt-1.5 print:text-[8.5px]">
              <div className="flex flex-col justify-between gap-1.5 print:gap-1">
                <p className="text-slate-800">{MRTA_OFFICIAL_FRONT_TEXT.advisorDeclaration}</p>
                <div className="rounded border border-slate-300 bg-slate-100/90 px-3 py-2 text-center print:py-1.5">
                  <div className="mx-3 min-h-[18px] border-b border-dotted border-slate-600 font-semibold text-slate-900 print:min-h-[15px]">
                    {advisorName.trim() || ''}
                  </div>
                  <p className="font-bold text-slate-900 mt-1">ลายมือชื่อนายหน้าประกันชีวิต</p>
                  <p className="text-slate-700 mt-0.5">
                    เลขที่ใบอนุญาต........................................................
                  </p>
                  <p className="text-slate-700 mt-0.5">
                    วันที่............................เวลา................
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-1.5 print:gap-1">
                <p className="text-slate-800">{MRTA_OFFICIAL_FRONT_TEXT.customerDeclaration}</p>
                <div className="rounded border border-slate-300 bg-slate-100/90 px-3 py-2 text-center print:py-1.5">
                  <div className="mx-3 min-h-[18px] border-b border-dotted border-slate-600 font-semibold text-slate-900 print:min-h-[15px]">
                    {customerName.trim() || ''}
                  </div>
                  <p className="font-bold text-slate-900 mt-1">ลายมือชื่อผู้ขอเอาประกันภัย</p>
                  <p className="text-slate-700 mt-0.5">&nbsp;</p>
                  <p className="text-slate-700 mt-0.5">
                    วันที่............................เวลา................
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* MRTA PAGE 2: BACK SIDE CONDITIONS & EXCLUSIONS */}
          <article className="mx-auto max-w-[794px] rounded-lg border border-slate-300 bg-white p-5 sm:p-7 shadow-xs text-slate-900 print:w-[196mm] print:max-w-full print:rounded-none print:border-0 print:shadow-none print:p-0 print:break-before-page print:break-inside-avoid">
            <div className="mb-2 flex items-center justify-between border-b border-slate-200 pb-1.5 text-[11px] font-semibold text-slate-500 print:hidden">
              <span>ด้านหลังเอกสาร MRTA (หน้า 2)</span>
              <span>สรุปเงื่อนไขทั่วไปของกรมธรรม์ ข้อยกเว้น และสิทธิยกเลิก 15 วัน</span>
            </div>

            <div className="space-y-3.5 text-[11px] leading-relaxed print:space-y-1.5 print:text-[9px] print:leading-[1.32]">
              <section className="space-y-1 print:space-y-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 print:text-[10.5px]">
                  {MLTA_OFFICIAL_BACK_TEXT.generalConditionsHeading}
                </h4>
                {MLTA_OFFICIAL_BACK_TEXT.generalConditions.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </section>

              <section className="space-y-1 print:space-y-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 print:text-[10.5px]">
                  {MLTA_OFFICIAL_BACK_TEXT.validityHeading}
                </h4>
                <p>{MLTA_OFFICIAL_BACK_TEXT.validityBody}</p>
              </section>

              <section className="space-y-1 print:space-y-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 print:text-[10.5px]">
                  {MLTA_OFFICIAL_BACK_TEXT.nonCoverageHeading}
                </h4>
                {MLTA_OFFICIAL_BACK_TEXT.nonCoverageItems.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </section>

              <section className="space-y-1 print:space-y-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 print:text-[10.5px]">
                  {MLTA_OFFICIAL_BACK_TEXT.tpdExclusionsHeading}
                </h4>
                <p>{MLTA_OFFICIAL_BACK_TEXT.tpdExclusionsIntro}</p>
                {MLTA_OFFICIAL_BACK_TEXT.tpdExclusions.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </section>

              <section className="space-y-1 print:space-y-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 print:text-[10.5px]">
                  {MRTA_OFFICIAL_BACK_EXTRA.cancellationHeading}
                </h4>
                <p>{MRTA_OFFICIAL_BACK_EXTRA.cancellationBody1}</p>
                <p className="pt-1 print:pt-0.5">{MRTA_OFFICIAL_BACK_EXTRA.cancellationBody2}</p>
              </section>

              <div className="pt-2 border-t border-dashed border-slate-300 text-xs print:text-[9.5px] print:pt-1">
                <strong>คำเตือน :</strong> ผู้ขอเอาประกันภัยควรศึกษา และทำความเข้าใจในเอกสารเสนอขายก่อนตัดสินใจทำประกันภัย
              </div>
            </div>
          </article>
        </div>
      )}
    </section>
  );
};
