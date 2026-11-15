import { useEffect, useMemo, useState } from 'react';
import {
  CalculatorWorkspace,
} from './components/CalculatorWorkspace';
import { ComparisonPanel } from './components/ComparisonPanel';
import { MltaDetailsSection } from './components/MltaDetailsSection';
import {
  calculateInsurance,
  formatBaht,
  type Gender,
  type SavedPlan,
} from './utils/insuranceCalculator';

const STORAGE_KEY = 'sp_life_saved_plans_v1';
const MAX_SAVED_PLANS = 4;

const DEFAULT_STATE = {
  gender: 'male' as Gender,
  birthYearInput: '',
  sumAssuredInput: '',
  termInput: '',
  planId: 'sp-baac',
};

export default function App() {
  const [gender, setGender] = useState<Gender>(DEFAULT_STATE.gender);
  const [birthYearInput, setBirthYearInput] = useState(DEFAULT_STATE.birthYearInput);
  const [sumAssuredInput, setSumAssuredInput] = useState(DEFAULT_STATE.sumAssuredInput);
  const [termInput, setTermInput] = useState(DEFAULT_STATE.termInput);
  const [planId, setPlanId] = useState(DEFAULT_STATE.planId);

  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);

  useEffect(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const result = useMemo(
    () =>
      calculateInsurance({
        gender,
        birthYearInput,
        sumAssuredInput,
        termInput,
        planId,
      }),
    [gender, birthYearInput, sumAssuredInput, termInput, planId]
  );

  const handleSavePlan = (customLabel = '') => {
    if (
      savedPlans.length >= MAX_SAVED_PLANS ||
      !result.isValid ||
      result.birthYearBE === null ||
      result.age === null ||
      result.sumAssured === null ||
      result.term === null ||
      result.totalPremium === null ||
      result.annualPremium === null ||
      result.fbiReward === null ||
      result.ratePerThousand === null
    ) {
      return;
    }

    const autoLabel = `${result.gender === 'male' ? 'ชาย' : 'หญิง'} ${result.age} ปี · ทุน ${formatBaht(
      result.sumAssured
    )} · ${result.term} ปี`;

    const newEntry: SavedPlan = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label: customLabel || autoLabel,
      createdAt: new Date().toISOString(),
      planId: result.plan.id,
      planName: result.plan.shortName,
      gender: result.gender,
      birthYearBE: result.birthYearBE,
      age: result.age,
      sumAssured: result.sumAssured,
      term: result.term,
      totalPremium: result.totalPremium,
      annualPremium: result.annualPremium,
      japanTripPoints: result.japanTripPoints,
      fbiReward: result.fbiReward,
      ratePerThousand: result.ratePerThousand,
    };

    setSavedPlans((prev) => [newEntry, ...prev]);
  };

  const handleLoadPlan = (plan: SavedPlan) => {
    setGender(plan.gender);
    setBirthYearInput(String(plan.birthYearBE));
    setSumAssuredInput(plan.sumAssured.toLocaleString('en-US'));
    setTermInput(String(plan.term));
    setPlanId(plan.planId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePlan = (id: string) => {
    setSavedPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClearAll = () => {
    setSavedPlans([]);
  };

  const handleResetDefaults = () => {
    setGender(DEFAULT_STATE.gender);
    setBirthYearInput(DEFAULT_STATE.birthYearInput);
    setSumAssuredInput(DEFAULT_STATE.sumAssuredInput);
    setTermInput(DEFAULT_STATE.termInput);
    setPlanId(DEFAULT_STATE.planId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8F6] text-slate-900">
      {/* Top Navigation Bar (3-zone contract) */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-16">
          <a
            href="#calculator-section"
            className="text-base sm:text-lg font-bold tracking-tight text-[#0A6C45] whitespace-nowrap shrink-0"
          >
            SP Life Credit Shield
          </a>

          <nav
            aria-label="เมนูหลัก"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <a
              href="#calculator-section"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              คำนวณเบี้ย
            </a>
            <a
              href="#comparison-section"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              เปรียบเทียบแผน ({savedPlans.length})
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

          <div className="flex items-center shrink-0">
            <button
              type="button"
              disabled={!result.isValid || savedPlans.length >= MAX_SAVED_PLANS}
              onClick={() => handleSavePlan('')}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:bg-slate-300 disabled:text-slate-500 transition-colors whitespace-nowrap shrink-0"
            >
              {savedPlans.length >= MAX_SAVED_PLANS
                ? `บันทึกครบ ${MAX_SAVED_PLANS} แผนแล้ว`
                : `บันทึกแผนปัจจุบัน (${savedPlans.length}/${MAX_SAVED_PLANS})`}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        id="calculator-section"
        className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-7 sm:py-9 space-y-8"
      >
        {/* Title & Unboxed Metadata Line */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
            โปรแกรมคำนวณเบี้ย : แบบประกันภัยคุ้มครองสินเชื่อ แบบคงที่(M<span className="text-red-600">L</span>TA)
          </h1>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm text-slate-500">
            <span>อายุรับประกัน 20–65 ปี</span>
            <span aria-hidden="true">·</span>
            <span>ทุนประกัน 50,000 – 150,000,000 บาท</span>
            <span aria-hidden="true">·</span>
            <span>ระยะเวลาเอาประกัน 1–30 ปี</span>
            <span aria-hidden="true">·</span>
            <span>คำนวณเบี้ยรายปีและสิทธิประโยชน์ Real-time</span>
          </div>
        </div>

        {/* Real-time Calculator */}
        <CalculatorWorkspace
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
          onSavePlan={handleSavePlan}
          onResetDefaults={handleResetDefaults}
          savedCount={savedPlans.length}
        />

        {/* Saved Plans Comparison Table */}
        <ComparisonPanel
          savedPlans={savedPlans}
          onLoadPlan={handleLoadPlan}
          onDeletePlan={handleDeletePlan}
          onClearAll={handleClearAll}
          onSaveCurrentSnapshot={() => handleSavePlan('')}
          canSaveCurrent={result.isValid}
        />

        {/* Underwriting Conditions Reference */}
        <section
          id="rules-section"
          aria-label="เงื่อนไขและข้อกำหนดการคำนวณเบี้ยประกัน"
          className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4"
        >
          <h2 className="text-base font-semibold text-slate-900">
            เงื่อนไขและเกณฑ์การคำนวณเบี้ยประกันคุ้มครองสินเชื่อ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1 text-xs sm:text-sm text-slate-600">
            <div className="space-y-1">
              <p className="font-semibold text-slate-900">01. เกณฑ์อายุผู้เอาประกัน (พ.ศ.)</p>
              <p className="leading-relaxed">
                คำนวณอายุจากสูตร <span className="font-medium text-slate-800">ปีปัจจุบัน (พ.ศ.) ลบ ปีเกิด (พ.ศ.)</span> โดยต้องมีอายุระหว่าง 20–65 ปี
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
                เลือกระยะเวลาได้ 1–30 ปี (ตัวเลขจำนวนเต็มเท่านั้น) <span className="font-semibold text-amber-800">ต้องไม่เกินกว่าระยะเวลากู้ยืมเงินตามสัญญากู้</span> พร้อมคำนวณ FBI 20% โดยอัตโนมัติ
              </p>
            </div>
          </div>
        </section>

        {/* Detailed MLTA Underwriting, Benefits, Definitions & Exclusions */}
        <MltaDetailsSection />
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>โปรแกรมคำนวณเบี้ยประกันภัยคุ้มครองสินเชื่อ แบบคงที่ (MLTA) · ข้อมูลที่บันทึกจะถูกล้างอัตโนมัติเมื่อรีเฟรชหน้าเว็บ</span>
          <span>หมายเหตุ: ค่าที่กรอกทุกช่องต้องเป็นตัวเลขจำนวนเต็มเท่านั้น</span>
        </div>
      </footer>
    </div>
  );
}
