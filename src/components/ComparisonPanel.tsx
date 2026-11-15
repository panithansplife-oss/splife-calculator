import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Download,
  Scale,
  Search,
  Trash2,
} from 'lucide-react';
import { formatBaht, type SavedPlan } from '../utils/insuranceCalculator';

interface ComparisonPanelProps {
  savedPlans: SavedPlan[];
  onLoadPlan: (plan: SavedPlan) => void;
  onDeletePlan: (id: string) => void;
  onClearAll: () => void;
  onSaveCurrentSnapshot: () => void;
  canSaveCurrent: boolean;
}

export const ComparisonPanel: React.FC<ComparisonPanelProps> = ({
  savedPlans,
  onLoadPlan,
  onDeletePlan,
  onClearAll,
  onSaveCurrentSnapshot,
  canSaveCurrent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'totalAsc' | 'sumDesc'>('newest');

  const filteredPlans = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = savedPlans.filter((p) => {
      if (genderFilter !== 'all' && p.gender !== genderFilter) return false;
      if (!q) return true;
      return (
        p.label.toLowerCase().includes(q) ||
        p.planName.toLowerCase().includes(q) ||
        String(p.sumAssured).includes(q) ||
        String(p.term).includes(q)
      );
    });

    if (sortBy === 'totalAsc') {
      return [...list].sort((a, b) => a.totalPremium - b.totalPremium);
    }
    if (sortBy === 'sumDesc') {
      return [...list].sort((a, b) => b.sumAssured - a.sumAssured);
    }
    return list;
  }, [savedPlans, searchQuery, genderFilter, sortBy]);

  const lowestTotalId = useMemo(() => {
    if (filteredPlans.length < 2) return null;
    return filteredPlans.reduce((best, cur) =>
      cur.totalPremium < best.totalPremium ? cur : best
    ).id;
  }, [filteredPlans]);

  const maxTotal = useMemo(() => {
    if (filteredPlans.length === 0) return 1;
    return Math.max(...filteredPlans.map((p) => p.totalPremium), 1);
  }, [filteredPlans]);

  const handleExportCsv = () => {
    if (savedPlans.length === 0) return;
    const headers = [
      'ชื่อแผน',
      'เพศ',
      'ปีเกิด (พ.ศ.)',
      'อายุ (ปี)',
      'ทุนประกัน (บาท)',
      'ระยะเวลาเอาประกัน (ปี)',
      'อัตราเบี้ยต่อทุน 1,000 บาท',
      'เบี้ยรวมตลอดสัญญา (บาท)',
      'FBI 20% (บาท)',
    ];
    const rows = savedPlans.map((p) => [
      `"${p.label.replace(/"/g, '""')}"`,
      p.gender === 'male' ? 'ชาย' : 'หญิง',
      p.birthYearBE,
      p.age,
      p.sumAssured,
      p.term,
      p.ratePerThousand.toFixed(2),
      p.totalPremium,
      p.fbiReward,
    ]);
    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mlta-comparison-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section
      id="comparison-section"
      aria-label="ตารางเปรียบเทียบแผนประกันที่บันทึกไว้"
      className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
    >
      {/* Header Toolbar */}
      <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-emerald-700" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-slate-900">
              ตารางเปรียบเทียบแผนประกันที่บันทึกไว้
            </h2>
            <span className="text-xs font-mono font-semibold tabular-nums text-emerald-800">
              ({savedPlans.length}/4 แผน)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            บันทึกเปรียบเทียบได้สูงสุด 4 แผน เพื่อเทียบอัตราเบี้ย เบี้ยรวมตลอดสัญญา และ FBI 20% (สามารถลบออกได้)
          </p>
        </div>

        {savedPlans.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>ส่งออก CSV</span>
            </button>
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors whitespace-nowrap shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>ล้างรายการทั้งหมด</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      {savedPlans.length > 0 && (
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อแผน บริษัท ทุน..."
                aria-label="ค้นหาแผนประกันที่บันทึกไว้"
                className="h-9 w-56 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
              {(
                [
                  { id: 'all', label: 'ทั้งหมด' },
                  { id: 'male', label: 'ชาย' },
                  { id: 'female', label: 'หญิง' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setGenderFilter(tab.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    genderFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <label htmlFor="sort-plans" className="text-slate-500 whitespace-nowrap">
              เรียงตาม:
            </label>
            <select
              id="sort-plans"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'newest' | 'totalAsc' | 'sumDesc')
              }
              className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:border-emerald-700 focus:outline-none"
            >
              <option value="newest">บันทึกล่าสุด</option>
              <option value="totalAsc">เบี้ยรวมน้อยไปมาก</option>
              <option value="sumDesc">ทุนประกันมากไปน้อย</option>
            </select>
          </div>
        </div>
      )}

      {/* Empty State */}
      {savedPlans.length === 0 ? (
        <div className="p-10 sm:p-14 text-center max-w-lg mx-auto">
          <p className="text-base font-semibold text-slate-900">
            ยังไม่มีแผนประกันที่บันทึกไว้สำหรับการเปรียบเทียบ
          </p>
          <p className="mt-1.5 text-sm text-slate-500">
            กรอกข้อมูลเพศ ปีเกิด ทุนประกัน และระยะเวลาในเครื่องคำนวณด้านบน แล้วกดปุ่ม &ldquo;บันทึกข้อมูลเพื่อเปรียบเทียบแผนประกัน&rdquo; เพื่อเทียบความคุ้มค่าหลายแผนพร้อมกัน
          </p>
          <button
            type="button"
            disabled={!canSaveCurrent}
            onClick={onSaveCurrentSnapshot}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:bg-slate-300 disabled:text-slate-500 transition-colors"
          >
            <span>บันทึกแผนปัจจุบันเป็นรายการแรก</span>
          </button>
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="p-10 text-center text-sm text-slate-500">
          ไม่พบแผนประกันที่ตรงกับเงื่อนไขการค้นหา
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {/* High-Density Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-600">
                  <th className="py-3 pl-6 pr-3 whitespace-nowrap">ชื่อแผน</th>
                  <th className="py-3 px-3 whitespace-nowrap">ผู้เอาประกัน</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">ทุนประกัน</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">ระยะเวลา</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">อัตราเบี้ย (ต่อ 1,000)</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">เบี้ยรวมตลอดสัญญา</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">FBI (20%)</th>
                  <th className="py-3 pl-3 pr-6 text-right whitespace-nowrap">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredPlans.map((plan) => {
                  const isLowestTotal = plan.id === lowestTotalId;
                  return (
                    <tr
                      key={plan.id}
                      className={`transition-colors hover:bg-slate-50/90 ${
                        isLowestTotal ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 pl-6 pr-3">
                        <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                          {plan.label}
                        </div>
                        {isLowestTotal && (
                          <div className="text-xs text-emerald-700 font-semibold mt-0.5">
                            เบี้ยรวมต่ำสุด
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-xs text-slate-700 whitespace-nowrap tabular-nums">
                        {plan.gender === 'male' ? 'ชาย' : 'หญิง'} · {plan.age} ปี (พ.ศ.{' '}
                        {plan.birthYearBE})
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-xs sm:text-sm font-medium tabular-nums text-slate-800 whitespace-nowrap">
                        {formatBaht(plan.sumAssured)} บ.
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-xs sm:text-sm tabular-nums text-slate-700 whitespace-nowrap">
                        {plan.term} ปี
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-xs sm:text-sm tabular-nums text-slate-700 whitespace-nowrap">
                        {plan.ratePerThousand.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-xs sm:text-sm font-bold tabular-nums text-slate-900 whitespace-nowrap">
                        {formatBaht(plan.totalPremium)} บ.
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-xs font-semibold tabular-nums text-emerald-700 whitespace-nowrap">
                        {formatBaht(plan.fbiReward)} บ.
                      </td>
                      <td className="py-3.5 pl-3 pr-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onLoadPlan(plan)}
                            title="โหลดค่านี้เข้าเครื่องคำนวณ"
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>โหลด</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeletePlan(plan.id)}
                            aria-label={`ลบแผน ${plan.label}`}
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>ลบ</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Visual Total Premium Bar Comparison */}
          {filteredPlans.length >= 2 && (
            <div className="p-5 sm:p-6 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-700">
                  เปรียบเทียบสัดส่วนเบี้ยประกันรวมตลอดสัญญา (บาท)
                </h3>
                <span className="text-[11px] text-slate-500">
                  ยิ่งแท่งสั้น เบี้ยรวมยิ่งประหยัด
                </span>
              </div>
              <div className="space-y-2.5">
                {filteredPlans.map((plan) => {
                  const pct = Math.max(8, (plan.totalPremium / maxTotal) * 100);
                  const isLowest = plan.id === lowestTotalId;
                  return (
                    <div key={plan.id} className="grid grid-cols-12 items-center gap-3">
                      <div className="col-span-4 sm:col-span-3 truncate text-xs font-medium text-slate-700">
                        {plan.label}
                      </div>
                      <div className="col-span-5 sm:col-span-7 h-5 rounded-md bg-slate-200/70 overflow-hidden">
                        <div
                          className={`h-full rounded-md transition-all duration-300 ${
                            isLowest ? 'bg-emerald-600' : 'bg-slate-600'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-2 text-right font-mono text-xs font-semibold tabular-nums text-slate-900">
                        {formatBaht(plan.totalPremium)} บ.
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
