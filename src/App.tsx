import { useMemo, useState } from 'react';
import {
  CalculatorWorkspace,
} from './components/CalculatorWorkspace';
import { MltaDetailsSection } from './components/MltaDetailsSection';
import { MltaScheduleTable } from './components/MltaScheduleTable';
import { MrtaScheduleTable } from './components/MrtaScheduleTable';
import { PrintExportModal, type PrintTarget } from './components/PrintExportModal';
import { SaleSheetSection } from './components/SaleSheetSection';
import {
  calculateInsurance,
  type Gender,
  type InsuranceType,
} from './utils/insuranceCalculator';

const DEFAULT_STATE = {
  insuranceType: 'mlta' as InsuranceType,
  gender: 'male' as Gender,
  birthYearInput: '',
  sumAssuredInput: '',
  termInput: '',
  planId: 'sp-baac',
};

export default function App() {
  const [insuranceType, setInsuranceType] = useState<InsuranceType>(
    DEFAULT_STATE.insuranceType
  );
  const [gender, setGender] = useState<Gender>(DEFAULT_STATE.gender);
  const [birthYearInput, setBirthYearInput] = useState(DEFAULT_STATE.birthYearInput);
  const [sumAssuredInput, setSumAssuredInput] = useState(DEFAULT_STATE.sumAssuredInput);
  const [termInput, setTermInput] = useState(DEFAULT_STATE.termInput);
  const [planId, setPlanId] = useState(DEFAULT_STATE.planId);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printMissingNotice, setPrintMissingNotice] = useState(false);
  const [printTarget, setPrintTarget] = useState<PrintTarget>('schedule');
  const [saleSheetType, setSaleSheetType] = useState<InsuranceType>(
    DEFAULT_STATE.insuranceType
  );
  const [customerName, setCustomerName] = useState('');
  const [advisorName, setAdvisorName] = useState('');

  const result = useMemo(
    () =>
      calculateInsurance({
        insuranceType,
        gender,
        birthYearInput,
        sumAssuredInput,
        termInput,
        planId,
      }),
    [insuranceType, gender, birthYearInput, sumAssuredInput, termInput, planId]
  );

  const hasScheduleReady =
    result.age !== null &&
    !result.errors.birthYear &&
    result.sumAssured !== null &&
    !result.errors.sumAssured;

  const handleRequestPrint = (
    target: PrintTarget = 'schedule',
    sheetChoice?: InsuranceType
  ) => {
    setPrintTarget(target);
    if (sheetChoice) {
      setSaleSheetType(sheetChoice);
    }

    if (target === 'schedule' && !hasScheduleReady) {
      setPrintMissingNotice(true);
      const targetId =
        result.age !== null && !result.errors.birthYear
          ? 'sum-assured-input'
          : 'birth-year-input';
      const el = document.getElementById(targetId);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus();
      return;
    }
    setPrintMissingNotice(false);
    setPrintModalOpen(true);
  };

  const handleResetDefaults = () => {
    setGender(DEFAULT_STATE.gender);
    setBirthYearInput(DEFAULT_STATE.birthYearInput);
    setSumAssuredInput(DEFAULT_STATE.sumAssuredInput);
    setTermInput(DEFAULT_STATE.termInput);
    setPlanId(DEFAULT_STATE.planId);
    setPrintMissingNotice(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8F6] text-slate-900">
      {/* Top Navigation Bar (3-zone contract) */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-16">
          <a
            href="#calculator-section"
            className="inline-flex items-baseline gap-1.5 tracking-tight text-[#0A6C45] whitespace-nowrap shrink-0"
          >
            <span className="text-xl sm:text-2xl font-extrabold">SPLife</span>
            <span className="text-sm sm:text-base font-semibold text-emerald-800/85">
              Credit Shield
            </span>
          </a>

          <nav
            aria-label="เมนูหลัก"
            className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-600"
          >
            <a
              href="#calculator-section"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              คำนวณเบี้ย
            </a>
            <a
              href={insuranceType === 'mlta' ? '#mlta-schedule-section' : '#mrta-schedule-section'}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              ตารางเบี้ยประกัน
            </a>
            <a
              href="#sale-sheet-section"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Sale Sheet
            </a>
            <a
              href="#rules-section"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              เงื่อนไขรับประกัน
            </a>
            <a
              href="#mlta-details-section"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              รายละเอียดความคุ้มครอง
            </a>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleRequestPrint('schedule')}
              className="rounded-lg bg-sky-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sky-800 transition-colors whitespace-nowrap shrink-0"
            >
              {insuranceType === 'mrta' ? 'พิมพ์ตาราง MRTA' : 'พิมพ์ตาราง MLTA'}
            </button>
            <button
              type="button"
              onClick={() => handleRequestPrint('sale-sheet', insuranceType)}
              className="rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition-colors whitespace-nowrap shrink-0"
            >
              {insuranceType === 'mrta' ? 'พิมพ์ Sale Sheet MRTA' : 'พิมพ์ Sale Sheet MLTA'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        id="calculator-section"
        className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-7 sm:py-9 space-y-8 print:max-w-none print:p-0 print:space-y-0"
      >
        {printMissingNotice && !hasScheduleReady && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs sm:text-sm font-medium text-amber-950 print:hidden"
          >
            <span>
              กรุณากรอกข้อมูล <strong>ปีเกิด (พ.ศ.)</strong> และ <strong>ทุนประกัน</strong> ด้านล่างให้ครบถ้วนก่อนพิมพ์ตาราง 1–30 ปี
            </span>
            <button
              type="button"
              onClick={() => setPrintMissingNotice(false)}
              className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100"
            >
              ปิด
            </button>
          </div>
        )}
        {/* Title & Unboxed Metadata Line */}
        <div className="space-y-4 print:hidden">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              {insuranceType === 'mrta' ? (
                <>
                  โปรแกรมคำนวณเบี้ย : แบบประกันภัยคุ้มครองสินเชื่อ แบบทุนลดลง(M
                  <span className="text-red-600">R</span>TA)
                </>
              ) : (
                <>
                  โปรแกรมคำนวณเบี้ย : แบบประกันภัยคุ้มครองสินเชื่อ แบบทุนคงที่(M
                  <span className="text-red-600">L</span>TA)
                </>
              )}
            </h1>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm text-slate-500">
              <span>
                {insuranceType === 'mrta' ? 'อายุรับประกัน 20–70 ปี' : 'อายุรับประกัน 20–65 ปี'}
              </span>
              <span aria-hidden="true">·</span>
              <span>ทุนประกัน 50,000 – 150,000,000 บาท</span>
              <span aria-hidden="true">·</span>
              <span>ระยะเวลาเอาประกัน 1–30 ปี</span>
              <span aria-hidden="true">·</span>
              <span>คำนวณเบี้ยประกันและสิทธิประโยชน์ Real-time</span>
            </div>
          </div>

          {/* Left / Right Mode Selector: MLTA vs MRTA */}
          <div
            role="tablist"
            aria-label="เลือกแบบประกันภัยคุ้มครองสินเชื่อ"
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            <button
              type="button"
              role="tab"
              aria-selected={insuranceType === 'mlta'}
              onClick={() => {
                setInsuranceType('mlta');
                setSaleSheetType('mlta');
                setTermInput('');
              }}
              className={`group text-left rounded-2xl border-2 px-5 py-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 ${
                insuranceType === 'mlta'
                  ? 'border-[#0F2A1E] bg-[#0F2A1E] text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-900 hover:border-emerald-600/60 hover:bg-emerald-50/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight">
                  แบบทุนคงที่ (M
                  <span className={insuranceType === 'mlta' ? 'text-red-400' : 'text-red-600'}>
                    L
                  </span>
                  TA)
                </span>
                <span
                  className={`text-xs font-semibold whitespace-nowrap shrink-0 ${
                    insuranceType === 'mlta' ? 'text-emerald-300' : 'text-slate-400'
                  }`}
                >
                  {insuranceType === 'mlta' ? 'กำลังเลือกใช้งาน' : 'คลิกเพื่อเลือก'}
                </span>
              </div>
              <p
                className={`mt-1 text-xs ${
                  insuranceType === 'mlta' ? 'text-emerald-100/90' : 'text-slate-500'
                }`}
              >
                ทุนประกันคงที่ตลอดสัญญา · อายุ 20–65 ปี · ระยะเวลา 1–30 ปี (รวมอายุไม่เกิน 70 ปี)
              </p>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={insuranceType === 'mrta'}
              onClick={() => {
                setInsuranceType('mrta');
                setSaleSheetType('mrta');
                setTermInput('');
              }}
              className={`group text-left rounded-2xl border-2 px-5 py-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 ${
                insuranceType === 'mrta'
                  ? 'border-[#0F2A1E] bg-[#0F2A1E] text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-900 hover:border-emerald-600/60 hover:bg-emerald-50/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight">
                  แบบทุนลดลง (M
                  <span className={insuranceType === 'mrta' ? 'text-red-400' : 'text-red-600'}>
                    R
                  </span>
                  TA)
                </span>
                <span
                  className={`text-xs font-semibold whitespace-nowrap shrink-0 ${
                    insuranceType === 'mrta' ? 'text-emerald-300' : 'text-slate-400'
                  }`}
                >
                  {insuranceType === 'mrta' ? 'กำลังเลือกใช้งาน' : 'คลิกเพื่อเลือก'}
                </span>
              </div>
              <p
                className={`mt-1 text-xs ${
                  insuranceType === 'mrta' ? 'text-emerald-100/90' : 'text-slate-500'
                }`}
              >
                ทุนประกันลดลงตามระยะเวลา · อายุ 20–70 ปี · ระยะเวลา 1–30 ปี (รวมอายุไม่เกิน 75 ปี)
              </p>
            </button>
          </div>
        </div>

        {/* Real-time Calculator */}
        <div className="print:hidden">
          <CalculatorWorkspace
            insuranceType={insuranceType}
            gender={gender}
            setGender={setGender}
            birthYearInput={birthYearInput}
            setBirthYearInput={setBirthYearInput}
            sumAssuredInput={sumAssuredInput}
            setSumAssuredInput={setSumAssuredInput}
            termInput={termInput}
            setTermInput={setTermInput}
            planId={planId}
            setPlanId={setPlanId}
            result={result}
            onResetDefaults={handleResetDefaults}
          />
        </div>

        {/* Full 1-30 Year MLTA / MRTA Rate Schedule */}
        <div className={printTarget === 'sale-sheet' ? 'print:hidden' : ''}>
          {insuranceType === 'mlta' ? (
            <MltaScheduleTable
              result={result}
              onSelectTerm={(t) => setTermInput(String(t))}
              onRequestPrint={() => handleRequestPrint('schedule')}
            />
          ) : (
            <MrtaScheduleTable
              result={result}
              onSelectTerm={(t) => setTermInput(String(t))}
              onRequestPrint={() => handleRequestPrint('schedule')}
            />
          )}
        </div>

        {/* Distinct MLTA / MRTA Printable Sale Sheets */}
        <SaleSheetSection
          result={result}
          sheetType={saleSheetType}
          setSheetType={setSaleSheetType}
          customerName={customerName}
          setCustomerName={setCustomerName}
          advisorName={advisorName}
          setAdvisorName={setAdvisorName}
          onSelectTerm={(t) => setTermInput(String(t))}
          onClearTerm={() => setTermInput('')}
          onRequestPrintSaleSheet={(targetType) => handleRequestPrint('sale-sheet', targetType)}
          isPrintTarget={printTarget === 'sale-sheet'}
        />

        {/* Underwriting Conditions Reference */}
        <section
          id="rules-section"
          aria-label="เงื่อนไขและข้อกำหนดการคำนวณเบี้ยประกัน"
          className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 print:hidden"
        >
          <h2 className="text-base font-semibold text-slate-900">
            เงื่อนไขและเกณฑ์การคำนวณเบี้ยประกันคุ้มครองสินเชื่อ (
            {insuranceType === 'mrta' ? 'แบบทุนลดลง MRTA' : 'แบบทุนคงที่ MLTA'})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1 text-xs sm:text-sm text-slate-600">
            <div className="space-y-1">
              <p className="font-semibold text-slate-900">01. เกณฑ์อายุผู้เอาประกัน (พ.ศ.)</p>
              <p className="leading-relaxed">
                คำนวณอายุจากสูตร{' '}
                <span className="font-medium text-slate-800">
                  ปีปัจจุบัน (พ.ศ.) ลบ ปีเกิด (พ.ศ.)
                </span>{' '}
                {insuranceType === 'mrta'
                  ? 'โดยต้องมีอายุระหว่าง 20–70 ปี (รวมระยะเวลาไม่เกิน 75 ปี)'
                  : 'โดยต้องมีอายุระหว่าง 20–65 ปี (รวมระยะเวลาไม่เกิน 70 ปี)'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-slate-900">02. วงเงินทุนประกันคุ้มครอง</p>
              <p className="leading-relaxed">
                กำหนดทุนประกันขั้นต่ำ <span className="font-mono font-medium text-slate-800">50,000</span> บาท และสูงสุดไม่เกิน <span className="font-mono font-medium text-slate-800">150,000,000</span> บาท (150 ล้านบาท) ค่าที่กรอกต้องเป็นตัวเลขจำนวนเต็มเท่านั้น
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-slate-900">03. ระยะเวลาเอาประกันและสิทธิประโยชน์</p>
              <p className="leading-relaxed">
                แสดงตารางครบ 1–30 ปี (ตัวเลขจำนวนเต็มเท่านั้น){' '}
                <span className="font-semibold text-amber-800">
                  ต้องไม่เกินกว่าระยะเวลากู้ยืมเงินตามสัญญากู้
                </span>{' '}
                พร้อมคำนวณ FBI 20% โดยอัตโนมัติ
              </p>
            </div>
          </div>
        </section>

        {/* Detailed MLTA / MRTA Underwriting, Benefits, Definitions & Exclusions */}
        <div className="print:hidden">
          <MltaDetailsSection insuranceType={insuranceType} />
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500 print:hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>โปรแกรมคำนวณเบี้ยประกันภัยคุ้มครองสินเชื่อ (MLTA / MRTA) · ธ.ก.ส. SPLife และพันธมิตร</span>
          <span>หมายเหตุ: ค่าที่กรอกทุกช่องต้องเป็นตัวเลขจำนวนเต็มเท่านั้น</span>
        </div>
      </footer>

      <PrintExportModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        result={result}
        printTarget={printTarget}
        setPrintTarget={setPrintTarget}
        saleSheetType={saleSheetType}
        setSaleSheetType={setSaleSheetType}
        customerName={customerName}
        setCustomerName={setCustomerName}
        advisorName={advisorName}
        setAdvisorName={setAdvisorName}
      />
    </div>
  );
}
