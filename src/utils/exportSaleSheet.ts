import {
  type CalculationResult,
  type InsuranceType,
  MLTA_MAX_AGE,
  MLTA_MAX_AGE_PLUS_TERM,
  MRTA_MAX_AGE_PLUS_TERM,
  formatBaht,
  getMltaCustomerTerms,
  getMrtaCustomerTerms,
} from './insuranceCalculator';
import {
  MLTA_OFFICIAL_FRONT_TEXT,
  MLTA_OFFICIAL_IMAGE_ASSETS,
  MLTA_OVERLAY_POSITIONS,
  MRTA_OFFICIAL_FRONT_TEXT,
  MRTA_OFFICIAL_IMAGE_ASSETS,
  MRTA_OVERLAY_POSITIONS,
  fetchImageAsDataUrl,
} from './mltaSaleSheetContent';

export interface SaleSheetExportOptions {
  result: CalculationResult;
  sheetType: InsuranceType;
  customerName?: string;
  advisorName?: string;
  frontImageSrc?: string;
  backImageSrc?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildOfficialSaleSheetImageHtml({
  result,
  sheetType,
  customerName = '',
  frontImageSrc,
  backImageSrc,
}: SaleSheetExportOptions): string {
  const isMrta = sheetType === 'mrta';
  const assets = isMrta ? MRTA_OFFICIAL_IMAGE_ASSETS : MLTA_OFFICIAL_IMAGE_ASSETS;
  const pos = isMrta ? MRTA_OVERLAY_POSITIONS : MLTA_OVERLAY_POSITIONS;
  const maxCap = isMrta ? MRTA_MAX_AGE_PLUS_TERM : MLTA_MAX_AGE_PLUS_TERM;
  const typeCode = isMrta ? 'MRTA' : 'MLTA';
  const docTitle = isMrta
    ? MRTA_OFFICIAL_FRONT_TEXT.title
    : MLTA_OFFICIAL_FRONT_TEXT.title;

  const resolvedFront = frontImageSrc ?? assets.front;
  const resolvedBack = backImageSrc ?? assets.back;

  const validAge =
    result.age !== null && !result.errors.birthYear ? result.age : null;
  const validSum =
    result.sumAssured !== null && !result.errors.sumAssured
      ? result.sumAssured
      : null;
  const showGender = validAge !== null || validSum !== null;
  const genderLabel = result.gender === 'male' ? 'ชาย' : 'หญิง';
  const effectiveAge = validAge ?? 35;

  const quotes =
    validSum !== null
      ? isMrta
        ? getMrtaCustomerTerms(result.gender, effectiveAge, validSum)
        : getMltaCustomerTerms(result.gender, effectiveAge, validSum)
      : [];

  const selectedTerm =
    result.term !== null &&
    !result.errors.term &&
    (validAge === null || validAge + result.term <= maxCap)
      ? result.term
      : null;

  const selectedQuote =
    validAge !== null && validSum !== null && selectedTerm !== null
      ? quotes.find((q) => q.term === selectedTerm && q.totalPremium !== null) ?? null
      : null;

  return `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sale Sheet · ${escapeHtml(docTitle)} (${typeCode})</title>
  <style>
    @page { size: A4 portrait; margin: 5mm 6mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 16px;
      font-family: "IBM Plex Sans Thai", "Sarabun", "Tahoma", system-ui, sans-serif;
      color: #0f172a;
      background: #f1f5f9;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 794px;
      margin: 0 auto 12px;
      padding: 10px 14px;
      background: #78350f;
      color: #fff;
      border-radius: 10px;
      font-size: 13px;
    }
    .toolbar button {
      background: #fbbf24;
      color: #451a03;
      border: 0;
      border-radius: 8px;
      padding: 7px 14px;
      font-weight: 700;
      cursor: pointer;
    }
    .sheet-page {
      position: relative;
      max-width: 794px;
      margin: 0 auto 18px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
    }
    .sheet-page img {
      display: block;
      width: 100%;
      height: auto;
    }
    .field-overlay {
      position: absolute;
      font-weight: 700;
      color: #0f2a1e;
      font-size: clamp(10px, 1.55vw, 13.5px);
      line-height: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-variant-numeric: tabular-nums;
      pointer-events: none;
    }
    .field-center { text-align: center; }
    .back-page {
      page-break-before: always;
    }
    @media print {
      body { padding: 0; background: #ffffff; }
      .toolbar { display: none !important; }
      .sheet-page {
        width: 190mm;
        max-width: 190mm;
        margin: 0 auto;
        border: 0;
        border-radius: 0;
        box-shadow: none;
        break-inside: avoid;
      }
      .sheet-page img {
        width: 100%;
        height: auto;
      }
      .field-overlay {
        font-size: 12px;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <span><strong>SPLife Credit Shield</strong> · Sale Sheet ${typeCode} (2 หน้า หน้า-หลัง)</span>
    <button type="button" onclick="window.print()">สั่งพิมพ์ / บันทึก PDF</button>
  </div>

  <!-- หน้า 1: รูปแบบฟอร์ม Sale Sheet ${typeCode} ฉบับจริง พร้อมเติมข้อมูลอัตโนมัติ -->
  <section class="sheet-page">
    <img src="${escapeHtml(resolvedFront)}" alt="${escapeHtml(docTitle)} (${typeCode}) ด้านหน้า" />
    ${
      customerName.trim()
        ? `<div class="field-overlay" style="left:${pos.customerName.left};width:${pos.customerName.width};bottom:${pos.customerName.bottom};padding-left:6px;">${escapeHtml(customerName.trim())}</div>`
        : ''
    }
    ${
      validAge !== null
        ? `<div class="field-overlay field-center" style="left:${pos.age.left};width:${pos.age.width};bottom:${pos.age.bottom};">${validAge}</div>`
        : ''
    }
    ${
      showGender
        ? `<div class="field-overlay field-center" style="left:${pos.gender.left};width:${pos.gender.width};bottom:${pos.gender.bottom};">${genderLabel}</div>`
        : ''
    }
    ${
      selectedTerm !== null
        ? `<div class="field-overlay field-center" style="left:${pos.term.left};width:${pos.term.width};bottom:${pos.term.bottom};">${selectedTerm}</div>`
        : ''
    }
    ${
      validSum !== null
        ? `<div class="field-overlay field-center" style="left:${pos.sumAssured.left};width:${pos.sumAssured.width};bottom:${pos.sumAssured.bottom};">${formatBaht(validSum)}</div>`
        : ''
    }
    ${
      selectedQuote?.totalPremium != null
        ? `<div class="field-overlay field-center" style="left:${pos.premium.left};width:${pos.premium.width};bottom:${pos.premium.bottom};">${formatBaht(selectedQuote.totalPremium)}</div>`
        : ''
    }
  </section>

  <!-- หน้า 2: รูปสรุปเงื่อนไขทั่วไป (ด้านหลัง) -->
  <section class="sheet-page back-page">
    <img src="${escapeHtml(resolvedBack)}" alt="สรุปเงื่อนไขทั่วไปของแบบประกันภัย ${typeCode} ด้านหลัง" />
  </section>
</body>
</html>`;
}

export function buildSaleSheetHtml(options: SaleSheetExportOptions): string {
  return buildOfficialSaleSheetImageHtml(options);
}

export async function buildSaleSheetHtmlAsync(
  options: SaleSheetExportOptions
): Promise<string> {
  const assets =
    options.sheetType === 'mrta'
      ? MRTA_OFFICIAL_IMAGE_ASSETS
      : MLTA_OFFICIAL_IMAGE_ASSETS;

  const [frontImageSrc, backImageSrc] = await Promise.all([
    fetchImageAsDataUrl(assets.front),
    fetchImageAsDataUrl(assets.back),
  ]);

  return buildOfficialSaleSheetImageHtml({
    ...options,
    frontImageSrc,
    backImageSrc,
  });
}

export { MLTA_MAX_AGE };
