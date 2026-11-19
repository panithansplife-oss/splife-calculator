import React from 'react';

export const PartnerHeader: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-[#0F2A1E] via-[#143B2A] to-[#0A1F15] p-6 sm:p-7 text-white shadow-md">
      {/* Background ambient glow */}
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold tracking-wider text-emerald-300 border border-emerald-500/30">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            โครงการประกันภัยคุ้มครองสินเชื่อ
          </span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            ธ.ก.ส. <span className="text-emerald-400 text-[28px]">SPLife</span> ประกันชีวิต
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium">
            <span className="text-emerald-200/80 font-normal">รับประกันโดย:</span>
            <div className="inline-flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center rounded-md bg-[#168A4B]/20 border border-[#168A4B]/40 px-2.5 py-1 text-xs font-semibold text-[#4ADE80]">
                อาคเนย์ประกันชีวิต
              </span>
              <span className="inline-flex items-center rounded-md bg-[#D81373]/20 border border-[#D81373]/40 px-2.5 py-1 text-xs font-semibold text-[#F472B6]">
                เมืองไทยประกันชีวิต
              </span>
              <span className="inline-flex items-center rounded-md bg-[#0069B4]/20 border border-[#0069B4]/40 px-2.5 py-1 text-xs font-semibold text-[#38BDF8]">
                ไทยประกันชีวิต
              </span>
              <span className="inline-flex items-center rounded-md bg-[#00A2D9]/20 border border-[#00A2D9]/40 px-2.5 py-1 text-xs font-semibold text-[#7DD3FC]">
                ไทยสมุทรประกันชีวิต
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
