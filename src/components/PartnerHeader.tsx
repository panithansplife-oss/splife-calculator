import React from 'react';

const PARTNER_INSURERS = [
  {
    id: 'selife',
    name: 'อาคเนย์ประกันชีวิต (SE Life)',
    logo: '/assets/logos/selife.png',
  },
  {
    id: 'muangthai',
    name: 'เมืองไทยประกันชีวิต',
    logo: '/assets/logos/muangthai.png',
  },
  {
    id: 'thailife',
    name: 'ไทยประกันชีวิต',
    logo: '/assets/logos/thailife.png',
  },
  {
    id: 'oceanlife',
    name: 'ไทยสมุทรประกันชีวิต',
    logo: '/assets/logos/oceanlife.png',
  },
] as const;

export const PartnerHeader: React.FC = () => {
  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-900/15 bg-white shadow-xs">
      {/* Top SPlife Official Identity */}
      <div className="border-b-2 border-[#0E4D24]/85 bg-white px-5 pt-5 pb-4 sm:px-8 sm:pt-6 sm:pb-5 text-center">
        <p className="text-[11px] sm:text-xs font-semibold tracking-wide text-emerald-800/80 mb-2">
          ธ.ก.ส. · โครงการประกันภัยคุ้มครองสินเชื่อ
        </p>
        <img
          src="/assets/logos/splife.png"
          alt="SP life"
          className="mx-auto h-10 sm:h-14 w-auto object-contain"
        />
        <h2 className="mt-1.5 text-base sm:text-xl font-bold tracking-tight text-[#0E4D24]">
          ประกันชีวิตคุ้มครองสินเชื่อ
        </h2>
      </div>

      {/* Bottom 4 Separate Official Partner Insurer Logo Cards */}
      <div className="bg-[#F7FAF8] px-4 py-4 sm:px-7 sm:py-5">
        <div className="mb-3.5 flex items-center justify-center gap-3">
          <span className="h-px flex-1 max-w-[72px] bg-emerald-900/15" aria-hidden="true" />
          <span className="text-xs font-semibold text-emerald-950/75">รับประกันภัยโดย</span>
          <span className="h-px flex-1 max-w-[72px] bg-emerald-900/15" aria-hidden="true" />
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          {PARTNER_INSURERS.map((partner) => (
            <div
              key={partner.id}
              className="flex h-20 sm:h-24 items-center justify-center rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-emerald-600/40 hover:shadow-sm"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-13 sm:h-16 w-auto max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
