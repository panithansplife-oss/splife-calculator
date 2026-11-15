import React, { useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  FileText,
  HeartHandshake,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

type DetailTab = 'all' | 'underwriting' | 'benefits' | 'definitions' | 'exclusions';

const TAB_ITEMS: { id: DetailTab; label: string }[] = [
  { id: 'all', label: 'แสดงทั้งหมด (4 หมวด)' },
  { id: 'underwriting', label: '1. ข้อกำหนดการรับประกันชีวิต' },
  { id: 'benefits', label: '2. ผลประโยชน์ความคุ้มครอง' },
  { id: 'definitions', label: '3. คำนิยาม ความคุ้มครอง' },
  { id: 'exclusions', label: '4. ข้อยกเว้นความคุ้มครอง' },
];

export const MltaDetailsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DetailTab>('all');

  const showSection = (section: Exclude<DetailTab, 'all'>) =>
    activeTab === 'all' || activeTab === section;

  return (
    <section
      id="mlta-details-section"
      aria-label="รายละเอียดโครงการประกันชีวิตคุ้มครองสินเชื่อ แบบทุนคงที่ (MLTA)"
      className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
    >
      {/* Section Header & Filter Tabs */}
      <div className="bg-[#0F2A1E] text-white px-5 py-6 sm:px-7">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-emerald-300 tracking-wide">
              รายละเอียดกรมธรรม์และเงื่อนไขความคุ้มครอง
            </p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white text-balance">
              โครงการประกันชีวิตคุ้มครองสินเชื่อ{' '}
              <span className="text-amber-300">แบบทุนคงที่</span> (M
              <span className="text-red-400">L</span>TA)
            </h2>
          </div>
        </div>

        {/* Interactive Tab Selector */}
        <div
          role="tablist"
          aria-label="หมวดหมู่รายละเอียดความคุ้มครอง MLTA"
          className="mt-5 flex flex-wrap gap-1.5"
        >
          {TAB_ITEMS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  isActive
                    ? 'bg-emerald-500 text-[#0A1F15]'
                    : 'bg-white/10 text-emerald-100 hover:bg-white/20 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Sections separated cleanly with hairline dividers */}
      <div className="divide-y divide-slate-200">
        {/* 1. ข้อกำหนดการรับประกันชีวิต */}
        {showSection('underwriting') && (
          <div className="p-5 sm:p-7 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                <FileText className="h-4.5 w-4.5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  01. ข้อกำหนดการรับประกันชีวิต
                </h3>
                <p className="text-xs text-slate-500">
                  เงื่อนไขคุณสมบัติ วงเงินเอาประกันภัย และวิธีการชำระเบี้ยประกันภัย
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#115E3B] text-white">
                    <th className="py-3 px-4 font-semibold w-full sm:w-[34%] border-b border-emerald-800">
                      หัวข้อ
                    </th>
                    <th className="py-3 px-4 font-semibold border-b border-emerald-800">
                      รายละเอียด
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <th
                      scope="row"
                      className="py-3.5 px-4 font-semibold text-slate-900 align-top bg-slate-50/60"
                    >
                      คุณสมบัติผู้เอาประกันภัย
                    </th>
                    <td className="py-3.5 px-4 leading-relaxed">
                      <ul className="list-disc pl-5 space-y-1.5 marker:text-emerald-700">
                        <li>
                          อายุ{' '}
                          <span className="font-semibold text-red-600 tabular-nums">
                            20–65 ปี
                          </span>{' '}
                          รวมระยะเวลาผ่อนชำระหนี้สินไม่เกินอายุ{' '}
                          <span className="font-semibold text-red-600 tabular-nums">
                            70 ปี
                          </span>
                        </li>
                        <li>
                          เป็น
                          <span className="font-semibold text-red-600">
                            ลูกค้าผู้กู้เงิน
                          </span>
                          ของธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร
                        </li>
                      </ul>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <th
                      scope="row"
                      className="py-3.5 px-4 font-semibold text-slate-900 align-top bg-slate-50/60"
                    >
                      ระยะเวลาเอาประกันภัย
                    </th>
                    <td className="py-3.5 px-4 leading-relaxed">
                      <span className="font-semibold text-red-600 tabular-nums">
                        1 – 30 ปี
                      </span>{' '}
                      และต้องไม่เกินกว่าระยะเวลากู้ยืมเงินตามสัญญากู้
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <th
                      scope="row"
                      className="py-3.5 px-4 font-semibold text-slate-900 align-top bg-slate-50/60"
                    >
                      จำนวนเงินเอาประกันภัยขั้นต่ำ (บาท)
                    </th>
                    <td className="py-3.5 px-4 leading-relaxed">
                      <span className="font-semibold text-red-600 tabular-nums">
                        50,000 บาท
                      </span>{' '}
                      (ไม่เกินวงเงินสินเชื่อที่ได้รับอนุมัติ)
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <th
                      scope="row"
                      className="py-3.5 px-4 font-semibold text-slate-900 align-top bg-slate-50/60"
                    >
                      จำนวนเงินเอาประกันภัยสูงสุด (ต่อราย)
                    </th>
                    <td className="py-3.5 px-4 leading-relaxed">
                      <ul className="list-disc pl-5 space-y-1.5 marker:text-emerald-700">
                        <li>
                          <span className="font-semibold text-red-600 tabular-nums">
                            Life สูงสุด 150
                          </span>{' '}
                          ล้านบาท รวมสินค้า CL ทุกแบบและทุกช่องทาง
                        </li>
                        <li>
                          <span className="font-semibold text-red-600 tabular-nums">
                            TPD สูงสุด 150
                          </span>{' '}
                          ล้านบาท รวมสินค้า CL ทุกแบบและทุกช่องทาง
                        </li>
                      </ul>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <th
                      scope="row"
                      className="py-3.5 px-4 font-semibold text-slate-900 align-top bg-slate-50/60"
                    >
                      การชำระเบี้ยประกันภัย
                    </th>
                    <td className="py-3.5 px-4 leading-relaxed">
                      เป็นแบบ
                      <span className="font-semibold text-red-600">
                        ชำระครั้งเดียว
                      </span>
                      คุ้มครองตลอดระยะสัญญา ทั้งนี้เบี้ยประกันภัยจะขึ้นอยู่กับ เพศ
                      อายุ จำนวนเงินเอาประกันภัย และระยะเวลาเอาประกันภัยของแต่ละบุคคล
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <th
                      scope="row"
                      className="py-3.5 px-4 font-semibold text-slate-900 align-top bg-slate-50/60"
                    >
                      การชำระเบี้ยประกันภัยผ่านบัตรเครดิต
                    </th>
                    <td className="py-3.5 px-4 leading-relaxed">
                      <span className="font-semibold text-red-600">ไม่สามารถ</span>
                      ชำระเบี้ยประกันภัยผ่านบัตรเครดิต
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <th
                      scope="row"
                      className="py-3.5 px-4 font-semibold text-slate-900 align-top bg-slate-50/60"
                    >
                      การขอทำสัญญาเพิ่มเติม
                    </th>
                    <td className="py-3.5 px-4 leading-relaxed">
                      <span className="font-semibold text-red-600">ไม่สามารถ</span>
                      ขอทำสัญญาเพิ่มเติม
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. ผลประโยชน์ความคุ้มครอง */}
        {showSection('benefits') && (
          <div className="p-5 sm:p-7 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="h-4.5 w-4.5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  02. ผลประโยชน์ความคุ้มครอง
                </h3>
                <p className="text-xs text-slate-500">
                  ความคุ้มครองกรณีเสียชีวิต (Life) และกรณีทุพพลภาพถาวรสิ้นเชิง (TPD)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 rounded-xl border border-slate-200 bg-slate-50/40">
              {/* Life */}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-white">
                    <HeartHandshake className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    เสียชีวิต (<span className="text-red-600">Life</span>)
                  </h4>
                </div>
                <p className="text-sm leading-relaxed text-slate-700">
                  <span className="font-semibold text-slate-900">
                    เมื่อสมาชิกผู้เอาประกันภัยเสียชีวิต
                  </span>{' '}
                  และบริษัทได้รับหลักฐานพิสูจน์การมรณกรรมตามแบบและวิธีที่บริษัทกำหนดจนครบถ้วนแล้ว
                  จะจ่ายผลประโยชน์เท่ากับ{' '}
                  <span className="font-semibold text-red-600">
                    100% ของจำนวนเงินเอาประกันภัย ณ วันเริ่มสัญญา
                  </span>
                </p>
              </div>

              {/* TPD */}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-white">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    ทุพพลภาพถาวรสิ้นเชิง (<span className="text-red-600">TPD</span>)
                  </h4>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  การทุพพลภาพถาวรสิ้นเชิง{' '}
                  <span className="font-normal text-slate-700">
                    ในกรณีใดกรณีหนึ่งดังต่อไปนี้
                  </span>
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed text-slate-700 marker:text-red-500">
                  <li>
                    กรณีพิสูจน์ได้ว่าเกิดการทุพพลภาพถาวรสิ้นเชิง
                    โดยเกิดขึ้นต่อเนื่องเป็นเวลาไม่น้อยกว่า{' '}
                    <span className="font-medium tabular-nums">180 วัน</span>{' '}
                    บริษัทจะ{' '}
                    <span className="font-semibold text-red-600">
                      จ่าย 100% ของจำนวนเงินเอาประกันภัย ณ วันเริ่มสัญญา
                    </span>{' '}
                    และให้ถือว่าสัญญาสิ้นสุดผลบังคับ
                  </li>
                  <li>
                    กรณีที่เกิดการสูญเสียที่สามารถพิสูจน์ได้อย่างชัดเจน
                    หรือมีข้อบ่งชี้ทางการแพทย์ชัดเจนว่าสมาชิกผู้เอาประกันภัยตกเป็นบุคคลทุพพลภาพถาวรสิ้นเชิง
                    บริษัทจะ{' '}
                    <span className="font-semibold text-red-600">
                      จ่าย 100% ของจำนวนเงินเอาประกันภัย ณ วันเริ่มสัญญา
                    </span>{' '}
                    และให้ถือว่าสัญญาสิ้นสุดผลบังคับ
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 3. คำนิยาม ความคุ้มครอง */}
        {showSection('definitions') && (
          <div className="p-5 sm:p-7 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                <BookOpen className="h-4.5 w-4.5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  03. คำนิยาม ความคุ้มครอง
                </h3>
                <p className="text-xs text-slate-500">
                  ขอบเขตคำจำกัดความของการเสียชีวิตและการทุพพลภาพถาวรสิ้นเชิงตามกรมธรรม์
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Definition: Life */}
              <div className="space-y-1.5">
                <h4 className="text-sm sm:text-base font-bold text-red-600">
                  เสียชีวิต (Life)
                </h4>
                <p className="text-sm leading-relaxed text-slate-700">
                  <span className="font-semibold text-slate-900">
                    เสียชีวิตทุกกรณีจากการเจ็บป่วยหรืออุบัติเหตุ
                  </span>{' '}
                  คุ้มครอง <span className="tabular-nums">24</span> ชั่วโมงทั่วโลก
                </p>
              </div>

              <hr className="border-slate-100" />

              {/* Definition: TPD */}
              <div className="space-y-3">
                <h4 className="text-sm sm:text-base font-bold text-red-600">
                  ทุพพลภาพถาวรสิ้นเชิง (TPD)
                </h4>
                <p className="text-sm leading-relaxed font-medium text-slate-900">
                  การที่ร่างกายทุพพลภาพถาวรสิ้นเชิง
                  ถึงขนาดไม่สามารถประกอบหน้าที่การงานใด ๆ ในอาชีพประจำหรืออาชีพอื่น ๆ
                  เพื่อรับค่าจ้างหรือค่าตอบแทนได้โดยสิ้นเชิงตลอดไป
                  อันเป็นผลเกิดจากอุบัติเหตุหรือการเจ็บป่วยต่อเนื่องเป็นระยะเวลา{' '}
                  <span className="tabular-nums">180</span> วัน
                  รวมถึงการสูญเสียอวัยวะส่วนสำคัญ คือ แขน ขาหรือตา ตั้งแต่{' '}
                  <span className="tabular-nums">2</span> ส่วนขึ้นไป
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-sm text-slate-700">
                  <li className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                    <span className="font-mono font-bold text-red-600 shrink-0">•</span>
                    <span>
                      ตาบอดสนิททั้ง <span className="tabular-nums">2</span> ข้าง
                      และไม่สามารถจะรักษาให้หายเป็นปกติได้ หรือ
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                    <span className="font-mono font-bold text-red-600 shrink-0">•</span>
                    <span>
                      สูญเสียมือหรือเท้าทั้ง <span className="tabular-nums">2</span>{' '}
                      ข้าง โดยการตัดออกตั้งแต่ข้อมือหรือข้อเท้า หรือ
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                    <span className="font-mono font-bold text-red-600 shrink-0">•</span>
                    <span>
                      สูญเสียมือ <span className="tabular-nums">1</span> ข้างและเท้า{' '}
                      <span className="tabular-nums">1</span> ข้าง
                      โดยการตัดออกตั้งแต่ข้อมือหรือข้อเท้า หรือ
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                    <span className="font-mono font-bold text-red-600 shrink-0">•</span>
                    <span>
                      สูญเสียสายตา <span className="tabular-nums">1</span> ข้าง
                      โดยไม่สามารถจะรักษาให้หายเป็นปกติได้
                      กับสูญเสียมือหรือเท้าข้างใดข้างหนึ่ง
                      โดยการตัดออกตั้งแต่ข้อมือหรือข้อเท้า
                      การสูญเสียอวัยวะดังกล่าวข้างต้นให้รวมถึงการสูญเสียสมรรถภาพในการใช้งานโดยสิ้นเชิงถาวรด้วย
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 4. ข้อยกเว้นความคุ้มครอง */}
        {showSection('exclusions') && (
          <div className="p-5 sm:p-7 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                <ShieldAlert className="h-4.5 w-4.5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  04. ข้อยกเว้นความคุ้มครอง
                </h3>
                <p className="text-xs text-slate-500">
                  กรณีที่กรมธรรม์ไม่ให้ความคุ้มครองทั้งกรณีเสียชีวิตและทุพพลภาพถาวรสิ้นเชิง
                </p>
              </div>
            </div>

            {/* Key Life Exclusion Callout */}
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3.5 text-sm text-slate-900">
              <AlertTriangle
                className="h-4.5 w-4.5 text-amber-700 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <p className="font-semibold leading-relaxed">
                ฆ่าตัวตายภายใน 1 ปี นับตั้งแต่วันเริ่มมีผลคุ้มครองตามกรมธรรม์ประกันภัย
                หรือถูกผู้รับประโยชน์ฆ่าตายโดยเจตนา
              </p>
            </div>

            {/* TPD Exclusions 1-8 */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">
                ทุพพลภาพถาวรสิ้นเชิงอันเนื่องมาจากสาเหตุต่าง ๆ ดังต่อไปนี้
              </p>

              <ol className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm leading-relaxed text-slate-700">
                <li className="flex gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                  <span className="font-mono font-bold text-emerald-800 tabular-nums shrink-0">
                    1)
                  </span>
                  <span>
                    การฆ่าตัวตาย พยายามฆ่าตัวตาย หรือการทำร้ายร่างกายตนเอง
                  </span>
                </li>
                <li className="flex gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                  <span className="font-mono font-bold text-emerald-800 tabular-nums shrink-0">
                    2)
                  </span>
                  <span>
                    ขณะที่ผู้เอาประกันภัยก่ออาชญากรรมที่มีความผิดสถานหนัก
                    หรือขณะถูกจับกุม หรือหลบหนีการจับกุม
                  </span>
                </li>
                <li className="flex gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                  <span className="font-mono font-bold text-emerald-800 tabular-nums shrink-0">
                    3)
                  </span>
                  <span>
                    สงครามไม่ว่าจะประกาศหรือไม่ก็ตาม การรุกราน
                    หรือการกระทำของศัตรูต่างชาติ สงครามกลางเมือง การปฏิวัติ
                    การกบฏ การจลาจล การก่อการร้าย
                  </span>
                </li>
                <li className="flex gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                  <span className="font-mono font-bold text-emerald-800 tabular-nums shrink-0">
                    4)
                  </span>
                  <span>
                    การบาดเจ็บขณะที่ผู้เอาประกันภัยกำลังขึ้นหรือกำลังลงหรือโดยสารอยู่ในอากาศยานที่มิได้จดทะเบียน
                    เพื่อบรรทุกผู้โดยสารและมิได้ประกอบการโดยสายการบินพาณิชย์
                  </span>
                </li>
                <li className="flex gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                  <span className="font-mono font-bold text-emerald-800 tabular-nums shrink-0">
                    5)
                  </span>
                  <span>
                    ขณะที่ผู้เอาประกันภัยขับขี่หรือปฏิบัติหน้าที่เป็นพนักงานประจำอากาศยานใด ๆ
                  </span>
                </li>
                <li className="flex gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                  <span className="font-mono font-bold text-emerald-800 tabular-nums shrink-0">
                    6)
                  </span>
                  <span>
                    ขณะที่ผู้เอาประกันภัยปฏิบัติหน้าที่เป็นทหาร ตำรวจ
                    หรืออาสาสมัครและเข้าปฏิบัติการในสงคราม หรือปราบปราม
                  </span>
                </li>
                <li className="flex gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                  <span className="font-mono font-bold text-emerald-800 tabular-nums shrink-0">
                    7)
                  </span>
                  <span>
                    ความบกพร่องทางร่างกาย การเจ็บป่วย
                    หรือบาดเจ็บที่ผู้เอาประกันภัยทราบอยู่แล้วในขณะที่สัญญาประกันภัยเริ่มมีผลบังคับ
                    แต่มิได้แจ้งให้บริษัทฯ ทราบ
                    เว้นแต่ผู้นั้นได้เอาประกันภัยตามสัญญาเพิ่มเติมนี้มาแล้วเป็นเวลาไม่น้อยกว่า{' '}
                    <span className="tabular-nums">12</span> เดือน
                  </span>
                </li>
                <li className="flex gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                  <span className="font-mono font-bold text-emerald-800 tabular-nums shrink-0">
                    8)
                  </span>
                  <span>
                    การบาดเจ็บที่เกิดขึ้นจากการกระทำของผู้เอาประกันภัย
                    ขณะอยู่ภายใต้ฤทธิ์สุรา สารเสพติด หรือยาเสพติด ให้โทษ
                    จนไม่สามารถครองสติได้{' '}
                    <span className="font-semibold text-red-600">
                      (ระดับแอลกอฮอล์ในเลือดตั้งแต่ 150 มิลลิกรัมเปอร์เซ็นต์ขึ้นไป)
                    </span>
                  </span>
                </li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
