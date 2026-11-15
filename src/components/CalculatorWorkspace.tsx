import React, { useState } from 'react';
import {
  AlertTriangle,
  BookmarkPlus,
  Check,
  Minus,
  Plus,
  RotateCcw,
  User,
} from 'lucide-react';
import {
  type CalculationResult,
  type Gender,
  calculateInsurance,
  formatBaht,
  formatIntegerInput,
} from '../utils/insuranceCalculator';
import { PartnerHeader } from './PartnerHeader';

interface CalculatorWorkspaceProps {
  gender: Gender;
  setGender: (g: Gender) => void;
  birthYearInput: string;
  setBirthYearInput: (v: string) => void;
  sumAssuredInput: string;
  setSumAssuredInput: (v: string) => void;
  termInput: string;
  setTermInput: (v: string) => void;
  planId: string;
  setPlanId: (id: string) => void;
  result: CalculationResult;
  onSavePlan: (customLabel: string) => void;
  onResetDefaults: () => void;
  savedCount: number;
}

const SUM_PRESETS = [
  { label: '50,000', value: 50_000 },
  { label: '100,000', value: 100_000 },
  { label: '500,000', value: 500_000 },
  { label: '1 ล้าน', value: 1_000_000 },
  { label: '5 ล้าน', value: 5_000_000 },
  { label: '10 ล้าน', value: 10_000_000 },
  { label: '150 ล้าน', value: 150_000_000 },
];

const TERM_PRESETS = [1, 5, 10, 15, 20, 30];

export const CalculatorWorkspace: React.FC<CalculatorWorkspaceProps> = ({
  gender,
  setGender,
  birthYearInput,
  setBirthYearInput,
  sumAssuredInput,
  setSumAssuredInput,
  termInput,
  setTermInput,
  result,
  onSavePlan,
  onResetDefaults,
  savedCount,
}) => {
  const [planLabel, setPlanLabel] = useState('');
  const [justSaved, setJustSaved] = useState(false);
  const [touched, setTouched] = useState({
    birthYear: false,
    sumAssured: false,
    term: false,
  });

  const showBirthYearError =
    Boolean(result.errors.birthYear) &&
    (birthYearInput.trim().length > 0 || touched.birthYear);
  const showSumAssuredError =
    Boolean(result.errors.sumAssured) &&
    (sumAssuredInput.trim().length > 0 || touched.sumAssured);
  const showTermError =
    Boolean(result.errors.term) &&
    (termInput.trim().length > 0 || touched.term);
  const hasEmptyRequiredField =
    !birthYearInput.trim() || !sumAssuredInput.trim() || !termInput.trim();

  const isComparisonFull = savedCount >= 4;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!result.isValid || isComparisonFull) return;
    onSavePlan(planLabel.trim());
    setPlanLabel('');
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1800);
  };

  const adjustBirthYear = (delta: number) => {
    const currentVal = result.birthYearBE ?? result.currentYearBE - 47;
    setBirthYearInput(String(currentVal + delta));
  };

  const handleSumBlur = () => {
    if (!result.errors.sumAssured && result.sumAssured !== null) {
      setSumAssuredInput(formatIntegerInput(result.sumAssured));
    }
  };

  return (
    <section aria-label="เครื่องคำนวณเบี้ยประกันคุ้มครองสินเชื่อระยะยาว" className="space-y-6">
      {/* Insurer Header Title Strip */}
      <PartnerHeader />

      {/* Main 2-Column Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Parameters */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                ข้อมูลผู้ขอเอาประกันและวงเงินคุ้มครอง
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                คำนวณผลแบบ Real-time ทันทีที่ปรับเปลี่ยนข้อมูล · กรอกตัวเลขจำนวนเต็มเท่านั้น
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-500 whitespace-nowrap shrink-0">
              ปีปัจจุบัน พ.ศ. {result.currentYearBE}
            </span>
          </div>

          {/* 1. Gender */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800">
              เพศผู้เอาประกัน
            </label>
            <div
              role="radiogroup"
              aria-label="เพศผู้เอาประกัน"
              className="grid grid-cols-2 gap-3"
            >
              {(
                [
                  { value: 'male', label: 'ชาย' },
                  { value: 'female', label: 'หญิง' },
                ] as const
              ).map((opt) => {
                const active = gender === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setGender(opt.value)}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
                      active
                        ? 'border-emerald-700 bg-emerald-700 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <User className="h-4 w-4" aria-hidden="true" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Birth Year (พ.ศ.) & Live Age Readout */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="birth-year-input"
                className="block text-sm font-semibold text-slate-800"
              >
                ปีเกิด (พ.ศ.)
              </label>
              <span className="text-xs text-slate-500">
                เกณฑ์รับประกันอายุ 20–65 ปี (ปีปัจจุบัน {result.currentYearBE} - ปีเกิด)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
              <div className="sm:col-span-7 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => adjustBirthYear(-1)}
                  aria-label="ลดปีเกิด 1 ปี"
                  className="inline-flex h-14 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300 active:scale-[0.98] transition-all"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <div className="relative flex-1">
                  <input
                    id="birth-year-input"
                    type="text"
                    inputMode="numeric"
                    value={birthYearInput}
                    onChange={(e) => setBirthYearInput(e.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, birthYear: true }))}
                    placeholder="เช่น 2522"
                    aria-invalid={showBirthYearError}
                    aria-describedby="birth-year-help"
                    className={`h-14 w-full rounded-xl border-2 px-4 pr-14 font-mono text-xl font-bold tabular-nums tracking-tight text-slate-900 placeholder:font-medium placeholder:text-slate-400/80 shadow-sm transition-all focus:outline-none ${
                      showBirthYearError
                        ? 'border-red-500 bg-red-50/40 focus:bg-white focus:ring-4 focus:ring-red-200/60'
                        : 'border-emerald-600/70 bg-emerald-50/35 hover:border-emerald-700 focus:bg-white focus:border-emerald-700 focus:ring-4 focus:ring-emerald-500/20'
                    }`}
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-900/70">
                    พ.ศ.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => adjustBirthYear(1)}
                  aria-label="เพิ่มปีเกิด 1 ปี"
                  className="inline-flex h-14 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300 active:scale-[0.98] transition-all"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              {/* Calculated Age Readout */}
              <div
                className={`sm:col-span-5 flex items-center justify-between rounded-xl border px-4 py-2.5 ${
                  showBirthYearError
                    ? 'border-red-200 bg-red-50/70 text-red-900'
                    : 'border-emerald-200 bg-emerald-50/60 text-emerald-950'
                }`}
              >
                <span className="text-xs font-medium">อายุลูกค้า</span>
                <span className="font-mono text-lg font-bold tabular-nums">
                  {result.age !== null ? `${result.age} ปี` : '—'}
                </span>
              </div>
            </div>

            {showBirthYearError ? (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-medium text-red-800"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
                <span>{result.errors.birthYear}</span>
              </div>
            ) : (
              <p id="birth-year-help" className="text-xs text-slate-500">
                {result.age !== null && result.birthYearBE !== null ? (
                  <>
                    คำนวณอัตโนมัติ: {result.currentYearBE} − {result.birthYearBE} ={' '}
                    <span className="font-semibold text-slate-700">{result.age} ปี</span> · ค่าที่กรอกต้องเป็นตัวเลขจำนวนเต็มเท่านั้น
                  </>
                ) : (
                  'กรอกปีเกิด พ.ศ. 4 หลัก (ตัวเลขจำนวนเต็มเท่านั้น เช่น 2522)'
                )}
              </p>
            )}
          </div>

          {/* 3. Sum Assured (ทุนประกัน) */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="sum-assured-input"
                className="block text-sm font-semibold text-slate-800"
              >
                ทุนประกัน
              </label>
              <span className="text-xs text-slate-500 tabular-nums">
                ขั้นต่ำ 50,000 บาท · สูงสุด 150,000,000 บาท (150 ล้านบาท)
              </span>
            </div>

            <div className="relative">
              <input
                id="sum-assured-input"
                type="text"
                inputMode="numeric"
                value={sumAssuredInput}
                onChange={(e) => setSumAssuredInput(e.target.value)}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, sumAssured: true }));
                  handleSumBlur();
                }}
                placeholder="เช่น 100,000"
                aria-invalid={showSumAssuredError}
                aria-describedby="sum-assured-help"
                className={`h-14 w-full rounded-xl border-2 px-4 pr-16 font-mono text-xl font-bold tabular-nums tracking-tight text-slate-900 placeholder:font-medium placeholder:text-slate-400/80 shadow-sm transition-all focus:outline-none ${
                  showSumAssuredError
                    ? 'border-red-500 bg-red-50/40 focus:bg-white focus:ring-4 focus:ring-red-200/60'
                    : 'border-emerald-600/70 bg-emerald-50/35 hover:border-emerald-700 focus:bg-white focus:border-emerald-700 focus:ring-4 focus:ring-emerald-500/20'
                }`}
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-900/70">
                บาท
              </span>
            </div>

            {/* Quick Sum Assured Presets */}
            <div className="flex flex-wrap gap-1.5" aria-label="ตัวเลือกทุนประกันด่วน">
              {SUM_PRESETS.map((preset) => {
                const isSelected = result.sumAssured === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setSumAssuredInput(formatIntegerInput(preset.value))}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium tabular-nums transition-colors whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {showSumAssuredError ? (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-medium text-red-800"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
                <span>{result.errors.sumAssured}</span>
              </div>
            ) : (
              <p id="sum-assured-help" className="text-xs text-slate-500">
                กรอกตัวเลขจำนวนเต็มระหว่าง 50,000 – 150,000,000 บาท เท่านั้น (ห้ามมีทศนิยม)
              </p>
            )}
          </div>

          {/* 4. Policy Term (ระยะเวลาเอาประกัน) */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="term-input"
                className="block text-sm font-semibold text-slate-800"
              >
                ระยะเวลาเอาประกัน
              </label>
              <span className="text-xs text-slate-500 tabular-nums">
                เลือกได้ 1–30 ปี (จำนวนเต็มเท่านั้น)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-5 relative">
                <input
                  id="term-input"
                  type="text"
                  inputMode="numeric"
                  value={termInput}
                  onChange={(e) => setTermInput(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, term: true }))}
                  placeholder="เช่น 10"
                  aria-invalid={showTermError}
                  aria-describedby="term-warning-note"
                  className={`h-14 w-full rounded-xl border-2 px-4 pr-12 font-mono text-xl font-bold tabular-nums tracking-tight text-slate-900 placeholder:font-medium placeholder:text-slate-400/80 shadow-sm transition-all focus:outline-none ${
                    showTermError
                      ? 'border-red-500 bg-red-50/40 focus:bg-white focus:ring-4 focus:ring-red-200/60'
                      : 'border-emerald-600/70 bg-emerald-50/35 hover:border-emerald-700 focus:bg-white focus:border-emerald-700 focus:ring-4 focus:ring-emerald-500/20'
                  }`}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-900/70">
                  ปี
                </span>
              </div>

              <div className="sm:col-span-7 flex flex-wrap gap-1.5" aria-label="ตัวเลือกระยะเวลาด่วน">
                {TERM_PRESETS.map((t) => {
                  const isSelected = result.term === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTermInput(String(t))}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium tabular-nums transition-colors whitespace-nowrap shrink-0 ${
                        isSelected
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {t} ปี
                    </button>
                  );
                })}
              </div>
            </div>

            {showTermError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-medium text-red-800"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
                <span>{result.errors.term}</span>
              </div>
            )}

            {/* Mandatory End-of-Form Important Warning */}
            <div
              id="term-warning-note"
              className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3.5 py-2.5 text-xs text-amber-950"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />
              <div className="space-y-0.5">
                <p className="font-semibold">
                  ข้อควรระวังสำคัญ: ต้องไม่เกินกว่าระยะเวลากู้ยืมเงินตามสัญญากู้
                </p>
                <p className="text-amber-800">
                  หมายเหตุเพิ่มเติม: ค่าที่กรอกทุกช่อง (ปีเกิด พ.ศ., ทุนประกัน และระยะเวลาเอาประกัน) ต้องเป็นตัวเลขจำนวนเต็มเท่านั้น
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Calculation Results */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            {/* Primary Premium Hero Block (Total Premium Only) */}
            <div className="bg-[#0F2A1E] text-white p-6">
              <div className="flex items-center justify-between gap-2 text-xs text-emerald-200/90">
                <span>ผลการคำนวณเบี้ยประกัน</span>
                <span className="truncate">รับประกันโดย SP Life และพันธมิตร</span>
              </div>

              {result.isValid && result.totalPremium !== null ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs text-emerald-200/80">
                      เบี้ยประกันรวมตลอดสัญญา ({result.term} ปี)
                    </p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span
                        data-testid="total-premium"
                        className="font-mono text-3xl sm:text-4xl font-bold tracking-tight tabular-nums text-white"
                      >
                        {formatBaht(result.totalPremium)}
                      </span>
                      <span className="text-sm font-medium text-emerald-200">
                        บาท
                      </span>
                    </div>
                  </div>
                </div>
              ) : hasEmptyRequiredField && !showBirthYearError && !showSumAssuredError && !showTermError ? (
                <div className="mt-4 rounded-xl border border-emerald-800/80 bg-emerald-950/60 p-4 text-sm text-emerald-100">
                  <p className="font-semibold text-emerald-300">
                    กรุณากรอกข้อมูลเพื่อคำนวณเบี้ยประกัน
                  </p>
                  <p className="mt-1 text-xs text-emerald-200/80">
                    ระบุปีเกิด (พ.ศ.) ทุนประกัน และระยะเวลาเอาประกัน ระบบจะแสดงเบี้ยประกันรวมและ FBI 20% ทันที
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-emerald-800/80 bg-emerald-950/60 p-4 text-sm text-emerald-100">
                  <p className="font-semibold text-amber-300">
                    ไม่สามารถคำนวณเบี้ยประกันได้ในขณะนี้
                  </p>
                  <p className="mt-1 text-xs text-emerald-200/80">
                    กรุณาแก้ไขข้อมูลที่มีเครื่องหมายแจ้งเตือนทางด้านซ้ายให้ถูกต้องตามเงื่อนไข
                  </p>
                </div>
              )}
            </div>

            {/* Structured Breakdown Table */}
            <div className="divide-y divide-slate-100 px-6 py-2">
              <div className="flex items-center justify-between py-3.5 text-sm">
                <div>
                  <p className="font-medium text-slate-800">FBI ที่ได้ (20%)</p>
                  <p className="text-xs text-slate-500">ผลตอบแทน 20% จากเบี้ยประกัน</p>
                </div>
                <span
                  data-testid="fbi-reward"
                  className="font-mono text-base font-bold tabular-nums text-emerald-700"
                >
                  {result.isValid && result.fbiReward !== null
                    ? `${formatBaht(result.fbiReward)} บาท`
                    : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3.5 text-sm">
                <span className="text-slate-600">อัตราเบี้ยต่อทุน 1,000 บาท</span>
                <span className="font-mono text-sm font-semibold tabular-nums text-slate-800">
                  {result.isValid && result.ratePerThousand !== null
                    ? `${result.ratePerThousand.toFixed(2)} บาท`
                    : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3.5 text-sm">
                <span className="text-slate-600">ข้อมูลผู้เอาประกัน</span>
                <span className="font-medium text-slate-800 tabular-nums">
                  {gender === 'male' ? 'ชาย' : 'หญิง'} ·{' '}
                  {result.age !== null ? `อายุ ${result.age} ปี` : '—'} ·{' '}
                  {result.sumAssured !== null
                    ? `ทุน ${formatBaht(result.sumAssured)} บ.`
                    : '—'}
                </span>
              </div>
            </div>

            {/* Save to Compare Form */}
            <form
              onSubmit={handleSave}
              className="border-t border-slate-200 bg-slate-50/70 p-5 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="plan-label-input"
                  className="block text-xs font-medium text-slate-600"
                >
                  ตั้งชื่อแผนเพื่อบันทึกเปรียบเทียบ (ไม่ระบุก็ได้)
                </label>
                <span className="font-mono text-xs font-semibold tabular-nums text-emerald-800">
                  {savedCount}/4 แผน
                </span>
              </div>
              <input
                id="plan-label-input"
                type="text"
                value={planLabel}
                onChange={(e) => setPlanLabel(e.target.value)}
                disabled={isComparisonFull}
                placeholder="เช่น สินเชื่อบ้าน 5 ปี หรือ แผนกู้สหกรณ์"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-400"
              />
              {isComparisonFull && (
                <div
                  role="status"
                  className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />
                  <span>
                    ตารางเปรียบเทียบเต็มแล้ว (สูงสุด 4 แผน) กรุณาลบแผนเดิมในตารางด้านล่างก่อนบันทึกเพิ่ม
                  </span>
                </div>
              )}
              <button
                type="submit"
                disabled={!result.isValid || isComparisonFull}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
              >
                {justSaved ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    <span>บันทึกแผนเรียบร้อยแล้ว ({savedCount}/4 แผน)</span>
                  </>
                ) : isComparisonFull ? (
                  <>
                    <BookmarkPlus className="h-4 w-4" aria-hidden="true" />
                    <span>บันทึกครบสูงสุด 4 แผนแล้ว</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="h-4 w-4" aria-hidden="true" />
                    <span>บันทึกข้อมูลเพื่อเปรียบเทียบแผนประกัน</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
