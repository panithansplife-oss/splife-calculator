import React, { useMemo } from 'react';
import { Printer } from 'lucide-react';
import {
  type CalculationResult,
  MLTA_TERMS_PART1,
  MLTA_TERMS_PART2,
  MRTA_MAX_AGE_PLUS_TERM,
  type MrtaTableRow,
  formatBaht,
  getMrtaScheduleTables,
} from '../utils/insuranceCalculator';

interface MrtaScheduleTableProps {
  result: CalculationResult;
  onSelectTerm?: (term: number) => void;
  onRequestPrint?: () => void;
}

const PREVIEW_SUM_ASSURED = 1_000_000;

export const MrtaScheduleTable: React.FC<MrtaScheduleTableProps> = ({
  result,
  onSelectTerm,
  onRequestPrint,
}) => {
  const hasValidSum = result.sumAssured !== null && !result.errors.sumAssured;
  const highlightedAge =
    result.age !== null && !result.errors.birthYear ? result.age : null;
  const hasReadyData = highlightedAge !== null && hasValidSum;
  const effectiveSum = hasValidSum ? result.sumAssured! : PREVIEW_SUM_ASSURED;

  const { part1, part2 } = useMemo(
    () => getMrtaScheduleTables(result.gender, effectiveSum),
    [result.gender, effectiveSum]
  );

  const selectedTerm =
    result.term !== null && !result.errors.term ? result.term : null;

  const handlePrint = () => {
    if (onRequestPrint) {
      onRequestPrint();
    } else {
      window.print();
    }
  };

  const renderMatrixTable = (
    rows: MrtaTableRow[],
    terms: readonly number[],
    ariaLabel: string,
    extraWrapperClass = ''
  ) => (
    <div
      className={`overflow-x-auto rounded-xl border border-slate-300 print:rounded-none print:border-slate-400 ${extraWrapperClass}`}
    >
      <table
        aria-label={ariaLabel}
        className="w-full border-collapse text-[11px] sm:text-xs print:text-[8px] print:leading-[1.08]"
      >
        <thead>
          <tr className="bg-[#0F6E47] text-white">
            <th
              rowSpan={2}
              className="w-14 border border-emerald-800 px-2 py-1.5 text-center font-semibold whitespace-nowrap print:py-[1px] print:px-1"
            >
              อายุ
            </th>
            <th
              colSpan={terms.length}
              className="border border-emerald-800 px-2 py-1.5 text-center font-semibold print:py-[1px]"
            >
              ระยะเวลาคุ้มครอง (ปี) · ชำระเบี้ยครั้งเดียว ({terms[0]}–{terms[terms.length - 1]} ปี)
            </th>
          </tr>
          <tr className="bg-[#128053] text-white">
            {terms.map((t) => {
              const isColSelected = selectedTerm === t;
              return (
                <th
                  key={t}
                  className={`border border-emerald-800 px-1.5 py-1.5 text-right font-mono font-semibold tabular-nums whitespace-nowrap print:py-[1px] print:px-1 ${
                    isColSelected ? 'bg-amber-400 text-slate-950' : ''
                  }`}
                >
                  {t}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isRowHighlighted = highlightedAge === row.age;

            return (
              <tr
                key={row.age}
                className={
                  isRowHighlighted
                    ? 'bg-emerald-100/90 text-emerald-950 font-semibold'
                    : 'bg-white text-slate-800 hover:bg-slate-50'
                }
              >
                <td
                  className={`border border-slate-200 px-2 py-1 text-center font-mono font-semibold tabular-nums whitespace-nowrap print:py-[0.5px] print:px-1 ${
                    isRowHighlighted
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-emerald-50/70 text-emerald-950'
                  }`}
                >
                  {row.age}
                </td>
                {terms.map((t) => {
                  const val = row.premiums[t];
                  const exceedsCustomerAgeCap =
                    isRowHighlighted &&
                    highlightedAge !== null &&
                    highlightedAge + t > MRTA_MAX_AGE_PLUS_TERM;

                  if (val === null) {
                    return (
                      <td
                        key={t}
                        className="border border-slate-200 bg-slate-200/75 px-1.5 py-1 text-right font-mono text-slate-400 print:py-[0.5px] print:px-1"
                        aria-label="ไม่รับประกัน"
                      >
                        —
                      </td>
                    );
                  }

                  const isExactCell = isRowHighlighted && selectedTerm === t;
                  const isClickable = Boolean(
                    onSelectTerm && isRowHighlighted && !exceedsCustomerAgeCap
                  );

                  return (
                    <td
                      key={t}
                      onClick={() => {
                        if (isClickable && onSelectTerm) {
                          onSelectTerm(t);
                        }
                      }}
                      title={
                        isClickable ? `คลิกเพื่อเลือก ${t} ปี` : undefined
                      }
                      className={`border border-slate-200 px-1.5 py-1 text-right font-mono tabular-nums whitespace-nowrap print:py-[0.5px] print:px-1 ${
                        isExactCell
                          ? 'bg-emerald-700 text-white font-bold ring-1 ring-inset ring-amber-300'
                          : isRowHighlighted
                          ? 'font-bold text-emerald-950'
                          : ''
                      } ${isClickable ? 'cursor-pointer hover:bg-emerald-200/70' : ''}`}
                    >
                      {formatBaht(val)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <section
      id="mrta-schedule-section"
      aria-label="ตารางเบี้ยประกันคุ้มครองสินเชื่อ แบบทุนลดลง (MRTA) 1 ถึง 30 ปี"
      className="rounded-2xl border border-slate-200 bg-white overflow-hidden print:border-0 print:rounded-none"
    >
      {/* Header & Print Action */}
      <div
        className={`bg-slate-50/80 px-5 py-4 sm:px-6 print:bg-white print:px-0 print:pt-0 print:pb-1 print:border-b print:border-slate-300 ${
          hasReadyData ? 'border-b border-slate-200' : ''
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 print:text-xs print:leading-tight">
              ตารางเบี้ยประกันคุ้มครองสินเชื่อ แบบทุนลดลง (M
              <span className="text-red-600">R</span>TA) คุ้มครอง 1–30 ปี
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 print:text-[9px] print:mt-0 print:text-slate-600">
              {hasReadyData
                ? `คำนวณเบี้ยประกันชำระครั้งเดียวครบ 1–30 ปี ตามทุนประกัน ${formatBaht(effectiveSum)} บาท (อายุ 20–70 ปี)`
                : 'กรุณาใส่ข้อมูลด้านบน (ปีเกิด พ.ศ. และทุนประกัน) เพื่อแสดงตารางเบี้ยประกันครบ 1–30 ปี'}
            </p>
          </div>

          {hasReadyData && (
            <button
              type="button"
              onClick={handlePrint}
              className="print:hidden inline-flex items-center justify-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2"
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              <span>พิมพ์ตารางเบี้ย MRTA (1–30 ปี)</span>
            </button>
          )}
        </div>

        {/* Parameter Strip */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs print:grid-cols-4 print:gap-1.5 print:mt-1 print:text-[9px]">
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 print:py-0.5 print:px-2">
            <span className="text-slate-500">เพศ: </span>
            {hasReadyData ? (
              <span className="font-bold text-slate-900">
                {result.gender === 'male' ? 'ชาย' : 'หญิง'}
              </span>
            ) : (
              <span className="font-medium text-slate-400">กรุณาใส่ข้อมูลด้านบน</span>
            )}
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 print:py-0.5 print:px-2">
            <span className="text-slate-500">ทุนประกัน: </span>
            {hasValidSum ? (
              <span className="font-mono font-bold tabular-nums text-slate-900">
                {formatBaht(effectiveSum)} บาท
              </span>
            ) : (
              <span className="font-medium text-slate-400">กรุณาใส่ข้อมูลด้านบน</span>
            )}
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 print:py-0.5 print:px-2">
            <span className="text-slate-500">ปีเกิด (พ.ศ.): </span>
            {highlightedAge !== null && result.birthYearBE !== null ? (
              <span className="font-mono font-bold tabular-nums text-slate-900">
                {result.birthYearBE}
              </span>
            ) : (
              <span className="font-medium text-slate-400">กรุณาใส่ข้อมูลด้านบน</span>
            )}
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2 print:py-0.5 print:px-2">
            <span className="text-emerald-800">อายุผู้เอาประกัน: </span>
            {highlightedAge !== null ? (
              <span className="font-mono font-bold tabular-nums text-emerald-950">
                {highlightedAge} ปี
              </span>
            ) : (
              <span className="font-medium text-emerald-700/70">กรุณาใส่ข้อมูลด้านบน</span>
            )}
          </div>
        </div>
      </div>

      {/* Official Two-Tier Full 1-30 Year Rate Matrix (Hidden until inputs are complete) */}
      {hasReadyData && (
        <div className="p-4 sm:p-6 space-y-4 print:px-0 print:py-1 print:space-y-1">
          {renderMatrixTable(
            part1,
            MLTA_TERMS_PART1,
            'ตารางเบี้ยประกัน MRTA คุ้มครอง 1 ถึง 15 ปี'
          )}
          <div className="print:break-before-page print:space-y-1">
            <div className="hidden print:flex items-center justify-between border-b border-slate-300 pb-1 text-[9px] text-slate-700">
              <span className="font-bold text-slate-900">
                ตารางเบี้ยประกัน MRTA (ต่อ) · คุ้มครอง 16–30 ปี
              </span>
              <span className="font-mono tabular-nums">
                เพศ: {result.gender === 'male' ? 'ชาย' : 'หญิง'} · ทุน:{' '}
                {formatBaht(effectiveSum)} บ. · อายุ: {highlightedAge} ปี
              </span>
            </div>
            {renderMatrixTable(
              part2,
              MLTA_TERMS_PART2,
              'ตารางเบี้ยประกัน MRTA คุ้มครอง 16 ถึง 30 ปี'
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 print:text-[8.5px]">
            <span>
              * อายุของผู้เอาประกันภัย เมื่อรวมกับระยะเวลาเอาประกันภัยแล้วต้องไม่เกิน 75 ปี (ช่องสีเทา — คือเกินเกณฑ์ไม่รับประกัน) · รับประกันโดย ธ.ก.ส. SPLife และพันธมิตร
            </span>
            <span className="font-mono tabular-nums">
              ปีอ้างอิง พ.ศ. {result.currentYearBE}
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
