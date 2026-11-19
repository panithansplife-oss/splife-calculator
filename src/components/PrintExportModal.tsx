import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Printer,
  X,
} from 'lucide-react';
import {
  type CalculationResult,
  type InsuranceType,
  MLTA_MAX_AGE,
  formatBaht,
} from '../utils/insuranceCalculator';
import {
  buildPrintableScheduleHtml,
  buildScheduleCsv,
  triggerFileDownload,
} from '../utils/exportSchedule';
import { buildSaleSheetHtmlAsync } from '../utils/exportSaleSheet';

export type PrintTarget = 'schedule' | 'sale-sheet';

interface PrintExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CalculationResult;
  printTarget: PrintTarget;
  setPrintTarget: (target: PrintTarget) => void;
  saleSheetType: InsuranceType;
  setSaleSheetType: (t: InsuranceType) => void;
  customerName: string;
  setCustomerName?: (v: string) => void;
  advisorName: string;
  setAdvisorName?: (v: string) => void;
}

export const PrintExportModal: React.FC<PrintExportModalProps> = ({
  isOpen,
  onClose,
  result,
  printTarget,
  setPrintTarget,
  saleSheetType,
  setSaleSheetType,
  customerName,
  setCustomerName,
  advisorName,
  setAdvisorName,
}) => {
  const [printBlockedHint, setPrintBlockedHint] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPrintBlockedHint(false);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isSaleSheet = printTarget === 'sale-sheet';
  const activeType = isSaleSheet ? saleSheetType : result.insuranceType;
  const isMrta = activeType === 'mrta';
  const typeCode = isMrta ? 'MRTA' : 'MLTA';
  const scheduleTypeCode = result.insuranceType === 'mrta' ? 'MRTA' : 'MLTA';
  const ageSuffix = result.age !== null ? `-อายุ${result.age}` : '';
  const scheduleFilename = `ตารางเบี้ย-${scheduleTypeCode}${ageSuffix}-1-30ปี`;
  const saleSheetFilename = `SaleSheet-${typeCode}${ageSuffix}`;
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const isMltaAgeOver =
    isSaleSheet && !isMrta && result.age !== null && result.age > MLTA_MAX_AGE;
  const hasScheduleReady =
    result.age !== null &&
    !result.errors.birthYear &&
    result.sumAssured !== null &&
    !result.errors.sumAssured;
  const validAge =
    result.age !== null && !result.errors.birthYear ? result.age : null;
  const validSum =
    result.sumAssured !== null && !result.errors.sumAssured
      ? result.sumAssured
      : null;
  const hasAnyFilledData = validAge !== null || validSum !== null;

  // Unified Sky-Blue (Schedule) + Amber-Gold (Sale Sheet) palette for both MLTA and MRTA
  const themeHeaderBg = isSaleSheet ? 'bg-amber-800' : 'bg-sky-800';
  const themePrimaryBtn = isSaleSheet
    ? 'bg-amber-600 hover:bg-amber-700'
    : 'bg-sky-700 hover:bg-sky-800';
  const themeHtmlBtn = isSaleSheet
    ? 'border-amber-700 bg-amber-50 text-amber-900 hover:bg-amber-100'
    : 'border-sky-700 bg-sky-50 text-sky-900 hover:bg-sky-100';

  const handleNativePrint = () => {
    let beforePrintTriggered = false;
    const onBeforePrint = () => {
      beforePrintTriggered = true;
    };
    window.addEventListener('beforeprint', onBeforePrint, { once: true });

    try {
      window.print();
    } catch {
      setPrintBlockedHint(true);
    }

    // In sandboxed preview iframes, browsers silently ignore window.print() without firing beforeprint
    setTimeout(() => {
      window.removeEventListener('beforeprint', onBeforePrint);
      if (!beforePrintTriggered && isInIframe) {
        setPrintBlockedHint(true);
      }
    }, 350);
  };

  const handleDownloadHtml = async () => {
    if (isSaleSheet) {
      const html = await buildSaleSheetHtmlAsync({
        result,
        sheetType: saleSheetType,
        customerName,
        advisorName,
      });
      triggerFileDownload(html, `${saleSheetFilename}.html`, 'text/html;charset=utf-8');
      return;
    }
    const html = buildPrintableScheduleHtml(result);
    triggerFileDownload(html, `${scheduleFilename}.html`, 'text/html;charset=utf-8');
  };

  const handleDownloadCsv = () => {
    const csv = buildScheduleCsv(result);
    triggerFileDownload(csv, `${scheduleFilename}.csv`, 'text/csv;charset=utf-8');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs print:hidden"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex shrink-0 items-start justify-between gap-3 ${themeHeaderBg} px-5 py-4 text-white transition-colors`}>
          <div>
            <h3 id="print-modal-title" className="text-base font-bold">
              {isSaleSheet
                ? `พิมพ์ Sale Sheet เสนอขาย (${typeCode})`
                : `พิมพ์ตารางเบี้ยประกัน ${scheduleTypeCode} (1–30 ปี)`}
            </h3>
            <p className="text-xs text-white/80 mt-0.5">
              {isSaleSheet
                ? `รูปแบบหน้ากระดาษ A4 แนวตั้ง 2 หน้า (หน้า-หลัง) · แบบฟอร์ม ธ.ก.ส. ${typeCode}`
                : `รูปแบบหน้ากระดาษ A4 แนวนอน · ตารางเบี้ยรวม ${scheduleTypeCode} ครบ 1–30 ปี`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Separated Color-Coded Document Selector */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-500">
              เลือกเอกสารที่ต้องการพิมพ์ / บันทึก:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                disabled={!hasScheduleReady}
                onClick={() => setPrintTarget('schedule')}
                className={`rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
                  !hasScheduleReady
                    ? 'cursor-not-allowed border-slate-200 bg-slate-100/70 text-slate-400'
                    : !isSaleSheet
                    ? 'border-sky-700 bg-sky-700 text-white font-semibold'
                    : 'border-sky-200 bg-sky-50/40 text-sky-950 hover:bg-sky-50'
                }`}
              >
                <div>ตารางเบี้ย {scheduleTypeCode}</div>
                <div
                  className={`text-[10px] mt-0.5 ${
                    !hasScheduleReady
                      ? 'text-slate-400'
                      : !isSaleSheet
                      ? 'text-sky-100'
                      : 'text-sky-800/80'
                  }`}
                >
                  {hasScheduleReady
                    ? 'A4 แนวนอน · 1–30 ปี'
                    : 'ต้องกรอกอายุและทุนประกันก่อน'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPrintTarget('sale-sheet');
                  setSaleSheetType(activeType);
                }}
                className={`rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
                  isSaleSheet
                    ? 'border-amber-600 bg-amber-600 text-white font-semibold'
                    : 'border-amber-200 bg-amber-50/40 text-amber-950 hover:bg-amber-50'
                }`}
              >
                <div>Sale Sheet {typeCode}</div>
                <div
                  className={`text-[10px] mt-0.5 ${
                    isSaleSheet ? 'text-amber-100' : 'text-amber-800/80'
                  }`}
                >
                  A4 แนวตั้ง · 2 หน้า (หน้า-หลัง)
                </div>
              </button>
            </div>
          </div>

          {/* Summary Snapshot */}
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs">
            <div>
              <span className="text-slate-500">แบบประกัน: </span>
              <span className="font-semibold text-slate-900">
                {isMrta ? 'MRTA (ทุนลดลง)' : 'MLTA (ทุนคงที่)'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">เพศ: </span>
              <span className="font-semibold text-slate-900">
                {hasAnyFilledData
                  ? result.gender === 'male'
                    ? 'ชาย'
                    : 'หญิง'
                  : 'เว้นว่าง (กรอกมือ)'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">อายุผู้เอาประกัน: </span>
              <span className="font-mono font-bold text-emerald-800">
                {validAge !== null ? `${validAge} ปี` : 'เว้นว่าง (กรอกมือ)'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">ทุนประกัน: </span>
              <span className="font-mono font-bold text-slate-900">
                {validSum !== null ? `${formatBaht(validSum)} บ.` : 'เว้นว่าง (กรอกมือ)'}
              </span>
            </div>
          </div>

          {/* Optional Customer Name Field for Sale Sheet */}
          {isSaleSheet && !isMltaAgeOver && setCustomerName && (
            <div>
              <label
                htmlFor="modal-sale-sheet-customer"
                className="block text-[11px] font-medium text-slate-600 mb-1"
              >
                ชื่อผู้ขอเอาประกันภัย / ลูกค้า (ไม่บังคับ)
              </label>
              <input
                id="modal-sale-sheet-customer"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="เว้นว่างสำหรับกรอกมือ หรือพิมพ์ชื่อลูกค้า"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          )}

          {isMltaAgeOver && (
            <div
              role="status"
              className="flex items-start justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-3 text-xs text-amber-950"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" aria-hidden="true" />
                <span>
                  อายุ {result.age} ปี เกินเกณฑ์ MLTA (สูงสุด 65 ปี) กรุณาเลือก{' '}
                  <strong>Sale Sheet MRTA</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSaleSheetType('mrta')}
                className="shrink-0 rounded-lg bg-amber-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-amber-800"
              >
                พิมพ์ MRTA
              </button>
            </div>
          )}

          {!isMltaAgeOver && (isInIframe || printBlockedHint) && (
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 px-3.5 py-3 text-xs text-amber-950"
            >
              <AlertCircle
                className="h-4 w-4 shrink-0 text-amber-700 mt-0.5"
                aria-hidden="true"
              />
              <div className="space-y-1 leading-relaxed">
                <p className="font-semibold">
                  {printBlockedHint
                    ? 'เบราว์เซอร์บล็อกหน้าต่างสั่งพิมพ์ในกรอบพรีวิวนี้'
                    : 'หมายเหตุเมื่อใช้งานในหน้าต่างพรีวิว'}
                </p>
                <p className="text-amber-900/90">
                  หากกดสั่งพิมพ์แล้วหน้าต่างพิมพ์ไม่เด้งขึ้น กรุณาเลือก{' '}
                  <span className="font-semibold">“ดาวน์โหลดไฟล์พร้อมพิมพ์ (.html)”</span>{' '}
                  หรือกด{' '}
                  <span className="font-semibold">“เปิดแท็บใหม่เพื่อพิมพ์”</span>{' '}
                  แล้วกดพิมพ์ (Ctrl+P / Save as PDF) ได้ทันที
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isMltaAgeOver && (
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleNativePrint}
                className={`flex w-full items-center justify-center gap-2 rounded-xl ${themePrimaryBtn} px-4 py-3 text-sm font-semibold text-white transition-colors`}
              >
                <Printer className="h-4 w-4" aria-hidden="true" />
                <span>
                  {isSaleSheet
                    ? `สั่งพิมพ์ Sale Sheet ${typeCode} (2 หน้า หน้า-หลัง A4)`
                    : `สั่งพิมพ์ตารางเบี้ย ${scheduleTypeCode} (1–30 ปี)`}
                </span>
              </button>

              <div className={`grid grid-cols-1 ${!isSaleSheet ? 'sm:grid-cols-2' : ''} gap-2.5`}>
                <button
                  type="button"
                  onClick={handleDownloadHtml}
                  className={`flex items-center justify-center gap-2 rounded-xl border ${themeHtmlBtn} px-3.5 py-2.5 text-xs font-semibold transition-colors`}
                >
                  <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    {isSaleSheet
                      ? `ดาวน์โหลด Sale Sheet ${typeCode} (.html)`
                      : `ดาวน์โหลดตาราง ${scheduleTypeCode} (.html)`}
                  </span>
                </button>

                {!isSaleSheet && (
                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                  >
                    <FileSpreadsheet className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                    <span>ส่งออกตาราง {scheduleTypeCode} Excel (.csv)</span>
                  </button>
                )}
              </div>

              {isInIframe && typeof window !== 'undefined' && (
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>เปิดแอปในแท็บใหม่เพื่อสั่งพิมพ์ (สำหรับหน้าต่างพรีวิว)</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
