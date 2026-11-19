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
  MLTA_OFFICIAL_BACK_TEXT,
  MLTA_OFFICIAL_FRONT_TEXT,
  MLTA_OFFICIAL_IMAGE_ASSETS,
  MLTA_OVERLAY_POSITIONS,
  MRTA_OFFICIAL_BACK_EXTRA,
  MRTA_OFFICIAL_FRONT_TEXT,
  fetchImageAsDataUrl,
  getMrtaCoverageDiagramSvg,
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

function buildOfficialMltaImageHtml({
  result,
  customerName = '',
  frontImageSrc = MLTA_OFFICIAL_IMAGE_ASSETS.front,
  backImageSrc = MLTA_OFFICIAL_IMAGE_ASSETS.back,
}: SaleSheetExportOptions): string {
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
      ? getMltaCustomerTerms(result.gender, effectiveAge, validSum)
      : [];

  const selectedTerm =
    result.term !== null &&
    !result.errors.term &&
    (validAge === null || validAge + result.term <= MLTA_MAX_AGE_PLUS_TERM)
      ? result.term
      : null;

  const selectedQuote =
    validAge !== null && validSum !== null && selectedTerm !== null
      ? quotes.find((q) => q.term === selectedTerm && q.totalPremium !== null) ?? null
      : null;

  const pos = MLTA_OVERLAY_POSITIONS;

  return `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sale Sheet · ${escapeHtml(MLTA_OFFICIAL_FRONT_TEXT.title)} (MLTA)</title>
  <style>
    @page { size: A4 portrait; margin: 6mm 7mm; }
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
        max-width: 196mm;
        max-height: 282mm;
        margin: 0 auto;
        border: 0;
        border-radius: 0;
        box-shadow: none;
        break-inside: avoid;
      }
      .sheet-page img {
        width: 100%;
        height: auto;
        max-height: 282mm;
        object-fit: contain;
      }
      .field-overlay {
        font-size: 12.5px;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <span><strong>SPLife Credit Shield</strong> · Sale Sheet MLTA (2 หน้า หน้า-หลัง)</span>
    <button type="button" onclick="window.print()">สั่งพิมพ์ / บันทึก PDF</button>
  </div>

  <!-- หน้า 1: รูปแบบฟอร์ม Sale Sheet MLTA ฉบับจริง พร้อมเติมข้อมูลอัตโนมัติ -->
  <section class="sheet-page">
    <img src="${escapeHtml(frontImageSrc)}" alt="แบบประกันภัยคุ้มครองสินเชื่อแบบคงที่ (MLTA) ด้านหน้า" />
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
    <img src="${escapeHtml(backImageSrc)}" alt="สรุปเงื่อนไขทั่วไปของแบบประกันภัย MLTA ด้านหลัง" />
  </section>
</body>
</html>`;
}

export function buildSaleSheetHtml(options: SaleSheetExportOptions): string {
  if (options.sheetType === 'mlta') {
    return buildOfficialMltaImageHtml(options);
  }
  return buildOfficialMrtaHtml(options);
}

export async function buildSaleSheetHtmlAsync(
  options: SaleSheetExportOptions
): Promise<string> {
  if (options.sheetType === 'mlta') {
    const [frontImageSrc, backImageSrc] = await Promise.all([
      fetchImageAsDataUrl(MLTA_OFFICIAL_IMAGE_ASSETS.front),
      fetchImageAsDataUrl(MLTA_OFFICIAL_IMAGE_ASSETS.back),
    ]);
    return buildOfficialMltaImageHtml({
      ...options,
      frontImageSrc,
      backImageSrc,
    });
  }
  return buildOfficialMrtaHtml(options);
}

function buildOfficialMrtaHtml({
  result,
  customerName = '',
  advisorName = '',
}: SaleSheetExportOptions): string {
  const isMrta = true;
  const validAge =
    result.age !== null && !result.errors.birthYear ? result.age : null;
  const validSum =
    result.sumAssured !== null && !result.errors.sumAssured
      ? result.sumAssured
      : null;
  const showGender = validAge !== null || validSum !== null;
  const genderText = showGender
    ? result.gender === 'male'
      ? 'ชาย'
      : 'หญิง'
    : '...........';
  const effectiveAge = validAge ?? 35;
  const maxCap = MRTA_MAX_AGE_PLUS_TERM;

  const quotes =
    validSum !== null
      ? getMrtaCustomerTerms(result.gender, effectiveAge, validSum)
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

  const customerText = customerName.trim()
    ? escapeHtml(customerName.trim())
    : '.......................................................................';
  const advisorText = advisorName.trim()
    ? escapeHtml(advisorName.trim())
    : '';
  const ageText = validAge !== null ? `${validAge}` : '..............';
  const termText = selectedTerm !== null ? `${selectedTerm}` : '.........';
  const sumText =
    validSum !== null
      ? formatBaht(validSum)
      : '......................................';
  const premiumText =
    selectedQuote?.totalPremium != null
      ? formatBaht(selectedQuote.totalPremium)
      : '..............................';

  const diagramSvg = getMrtaCoverageDiagramSvg(selectedTerm);

  const docHeading = isMrta
    ? MRTA_OFFICIAL_FRONT_TEXT.title
    : MLTA_OFFICIAL_FRONT_TEXT.title;

  const sumHeader = isMrta
    ? 'จำนวนเงินเอาประกันภัยเริ่มต้น'
    : 'จำนวนเงินเอาประกันภัย';

  const toolbarBg = '#78350f';
  const toolbarBtnBg = '#fbbf24';
  const toolbarBtnText = '#451a03';

  const benefitsHtml = isMrta
    ? `
      <div class="benefits">
        <h3>${escapeHtml(MRTA_OFFICIAL_FRONT_TEXT.benefitsHeading)}</h3>
        <p>${escapeHtml(MRTA_OFFICIAL_FRONT_TEXT.benefit1)}</p>
        <p>${escapeHtml(MRTA_OFFICIAL_FRONT_TEXT.benefit2Heading)}</p>
        <p class="indent">${escapeHtml(MRTA_OFFICIAL_FRONT_TEXT.benefit2_1Heading)}</p>
        <p class="indent-2"><strong>งวดที่ 1</strong> ${escapeHtml(
          MRTA_OFFICIAL_FRONT_TEXT.benefit2_1Installment1.replace(/^งวดที่ 1\s*/, '')
        )}</p>
        <p class="indent-2"><strong>งวดที่ 2</strong> ${escapeHtml(
          MRTA_OFFICIAL_FRONT_TEXT.benefit2_1Installment2.replace(/^งวดที่ 2\s*/, '')
        )}</p>
        <p class="indent">${escapeHtml(MRTA_OFFICIAL_FRONT_TEXT.benefit2_2)}</p>
      </div>
    `
    : `
      <div class="benefits">
        <h3>${escapeHtml(MLTA_OFFICIAL_FRONT_TEXT.benefitsHeading)}</h3>
        <p>${escapeHtml(MLTA_OFFICIAL_FRONT_TEXT.benefit1)}</p>
        <p>${escapeHtml(MLTA_OFFICIAL_FRONT_TEXT.benefit2Heading)}</p>
        <p class="indent">${escapeHtml(MLTA_OFFICIAL_FRONT_TEXT.benefit2_1)}</p>
        <p class="indent">${escapeHtml(MLTA_OFFICIAL_FRONT_TEXT.benefit2_2)}</p>
      </div>
    `;

  const mrtaSignatureHtml = isMrta
    ? `
      <div class="sig-grid">
        <div class="sig-col">
          <div class="sig-decl">${escapeHtml(MRTA_OFFICIAL_FRONT_TEXT.advisorDeclaration)}</div>
          <div class="sig-box">
            <div class="sig-line-row">${
              advisorText ? `<strong>${advisorText}</strong>` : '&nbsp;'
            }</div>
            <div class="sig-role">ลายมือชื่อนายหน้าประกันชีวิต</div>
            <div class="sig-meta">เลขที่ใบอนุญาต........................................................</div>
            <div class="sig-meta">วันที่............................เวลา................</div>
          </div>
        </div>
        <div class="sig-col">
          <div class="sig-decl">${escapeHtml(MRTA_OFFICIAL_FRONT_TEXT.customerDeclaration)}</div>
          <div class="sig-box">
            <div class="sig-line-row">${
              customerName.trim() ? `<strong>${escapeHtml(customerName.trim())}</strong>` : '&nbsp;'
            }</div>
            <div class="sig-role">ลายมือชื่อผู้ขอเอาประกันภัย</div>
            <div class="sig-meta">&nbsp;</div>
            <div class="sig-meta">วันที่............................เวลา................</div>
          </div>
        </div>
      </div>
    `
    : '';

  const mrtaBackExtraHtml = isMrta
    ? `
      <div class="back-section">
        <h2>${escapeHtml(MRTA_OFFICIAL_BACK_EXTRA.cancellationHeading)}</h2>
        <p>${escapeHtml(MRTA_OFFICIAL_BACK_EXTRA.cancellationBody1)}</p>
        <p style="margin-top:6px;">${escapeHtml(MRTA_OFFICIAL_BACK_EXTRA.cancellationBody2)}</p>
      </div>
      <div class="back-warning">
        <strong>คำเตือน :</strong> ผู้ขอเอาประกันภัยควรศึกษา และทำความเข้าใจในเอกสารเสนอขายก่อนตัดสินใจทำประกันภัย
      </div>
    `
    : '';

  return `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sale Sheet · ${escapeHtml(docHeading)} (${isMrta ? 'MRTA' : 'MLTA'})</title>
  <style>
    @page { size: A4 portrait; margin: 6mm 7mm; }
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
      background: ${toolbarBg};
      color: #fff;
      border-radius: 10px;
      font-size: 13px;
    }
    .toolbar button {
      background: ${toolbarBtnBg};
      color: ${toolbarBtnText};
      border: 0;
      border-radius: 8px;
      padding: 7px 14px;
      font-weight: 700;
      cursor: pointer;
    }
    .sheet {
      max-width: 794px;
      margin: 0 auto 18px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 16px 22px 14px;
    }
    .logos {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      align-items: center;
      justify-items: center;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e2e8f0;
    }
    .logo-mtl {
      background: #18181b;
      color: #fff;
      padding: 5px 11px;
      border-radius: 12px 12px 12px 2px;
      text-align: center;
      font-size: 10.5px;
      font-weight: 700;
      line-height: 1.15;
    }
    .logo-ocean {
      border: 1.5px solid #18181b;
      padding: 4px 9px;
      text-align: center;
      font-size: 9.5px;
      font-weight: 700;
      line-height: 1.15;
    }
    .logo-se {
      text-align: center;
      color: #0f172a;
      font-size: 12.5px;
      font-weight: 800;
      line-height: 1.05;
    }
    .logo-se span {
      display: block;
      font-size: 7.5px;
      font-weight: 600;
      margin-top: 2px;
    }
    .logo-tli {
      background: #18181b;
      color: #fff;
      padding: 5px 10px;
      text-align: center;
      font-size: 10.5px;
      font-weight: 700;
      line-height: 1.1;
    }
    h1.doc-title {
      font-size: 16.5px;
      font-weight: 800;
      margin: 0 0 2px;
      color: #0f172a;
    }
    .doc-sub {
      font-size: 12.5px;
      font-weight: 600;
      margin: 0 0 1px;
      color: #0f172a;
    }
    .doc-broker {
      font-size: 12px;
      font-weight: 700;
      margin: 0 0 6px;
      color: #0f172a;
    }
    .proposal-meta {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
      font-size: 11.5px;
      margin-bottom: 4px;
    }
    .proposal-right {
      text-align: right;
      white-space: nowrap;
      line-height: 1.4;
    }
    .val-fill {
      font-weight: 700;
      text-decoration: underline;
      text-decoration-style: dotted;
      text-underline-offset: 3px;
      padding: 0 4px;
      font-variant-numeric: tabular-nums;
    }
    .diagram-caption {
      text-align: center;
      font-size: 10px;
      font-weight: 600;
      color: #0f172a;
      margin: 2px 0 2px;
    }
    .diagram-wrap {
      margin: 2px 0;
    }
    .assumption {
      text-align: center;
      font-size: 10px;
      font-weight: 600;
      color: #0f172a;
      margin: 2px 0 6px;
    }
    table.form-box {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 6px;
      font-variant-numeric: tabular-nums;
    }
    table.form-box th,
    table.form-box td {
      border: 1.4px solid #0f172a;
      padding: 4px 8px;
    }
    table.form-box th {
      font-size: 11.5px;
      font-weight: 700;
      text-align: center;
      background: #f8fafc;
    }
    .cell-main {
      font-size: 11px;
      font-weight: 600;
    }
    .cell-note {
      font-size: 8.8px;
      color: #334155;
      margin-top: 2px;
      font-weight: 500;
    }
    .cell-center {
      text-align: center;
      font-size: 11.5px;
      font-weight: 700;
    }
    .check-circle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      border: 1.5px solid #0f172a;
      border-radius: 999px;
      font-size: 10px;
      margin-right: 5px;
    }
    .benefits {
      font-size: 9.5px;
      line-height: 1.34;
      color: #0f172a;
      margin-top: 3px;
    }
    .benefits h3 {
      font-size: 10.5px;
      font-weight: 700;
      margin: 0 0 2px;
    }
    .benefits p {
      margin: 1px 0;
    }
    .benefits .indent {
      padding-left: 12px;
    }
    .benefits .indent-2 {
      padding-left: 24px;
    }
    .notes {
      font-size: 9px;
      line-height: 1.34;
      color: #0f172a;
      margin-top: 5px;
    }
    .notes .indent {
      padding-left: 36px;
    }
    .front-footer {
      text-align: center;
      margin-top: 6px;
      padding-top: 5px;
      border-top: 1px dashed #cbd5e1;
      font-size: 9.5px;
      line-height: 1.35;
    }
    .front-footer .quote {
      font-weight: 700;
      font-size: 10px;
      margin-top: 2px;
    }
    .sig-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 6px;
      font-size: 9px;
      line-height: 1.3;
    }
    .sig-decl {
      min-height: 32px;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .sig-box {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 6px 8px;
      text-align: center;
    }
    .sig-line-row {
      border-bottom: 1px dotted #334155;
      min-height: 16px;
      margin: 0 12px 3px;
      font-size: 9.5px;
    }
    .sig-role {
      font-weight: 700;
      font-size: 9.5px;
      margin-bottom: 2px;
    }
    .sig-meta {
      font-size: 8.5px;
      color: #334155;
      margin-top: 1.5px;
    }
    /* Page 2 (Back Side) */
    .back-page {
      page-break-before: always;
      font-size: 9.5px;
      line-height: 1.36;
      color: #0f172a;
    }
    .back-section {
      margin-bottom: 8px;
    }
    .back-section h2 {
      font-size: 11.5px;
      font-weight: 700;
      margin: 0 0 3px;
      color: #0f172a;
    }
    .back-section p {
      margin: 2px 0;
    }
    .back-warning {
      margin-top: 8px;
      padding-top: 5px;
      border-top: 1px dashed #cbd5e1;
      font-size: 10px;
    }
    @media print {
      body { padding: 0; background: #ffffff; }
      .toolbar { display: none !important; }
      .sheet {
        max-width: none;
        margin: 0;
        border: 0;
        border-radius: 0;
        padding: 0 2px;
        break-inside: avoid;
      }
      .back-page {
        font-size: 9.2px;
        line-height: 1.34;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <span><strong>SPLife Credit Shield</strong> · Sale Sheet ${isMrta ? 'MRTA' : 'MLTA'} (2 หน้า หน้า-หลัง)</span>
    <button type="button" onclick="window.print()">สั่งพิมพ์ / บันทึก PDF</button>
  </div>

  <!-- หน้า 1: เอกสารเสนอขาย -->
  <section class="sheet">
    <div class="logos">
      <div class="logo-mtl">เมืองไทย<br/>ประกันชีวิต</div>
      <div class="logo-ocean">ไทยสมุทร<br/><span style="font-size:7px;font-weight:600;">OCEAN LIFE INSURANCE</span></div>
      <div class="logo-se">se Life<span>อาคเนย์ประกันชีวิต</span></div>
      <div class="logo-tli">ไทยประกันชีวิต</div>
    </div>

    <h1 class="doc-title">${escapeHtml(docHeading)}</h1>
    <p class="doc-sub">${escapeHtml(MLTA_OFFICIAL_FRONT_TEXT.subtitle)}</p>
    <p class="doc-broker">${escapeHtml(MLTA_OFFICIAL_FRONT_TEXT.brokerLine)}</p>

    <div class="proposal-meta">
      <div>
        เสนอ <span class="val-fill">${customerText}</span>
        อายุ <span class="val-fill">${ageText}</span> ปี
        เพศ <span class="val-fill">${genderText}</span>
      </div>
      <div class="proposal-right">
        <div>ระยะเวลาเอาประกันภัย <span class="val-fill">${termText}</span> ปี</div>
        <div>ระยะเวลาชำระเบี้ยประกันภัย <strong>ครั้งเดียว</strong></div>
      </div>
    </div>

    ${
      isMrta
        ? `<div class="diagram-caption">${escapeHtml(MRTA_OFFICIAL_FRONT_TEXT.diagramCaption)}</div>`
        : ''
    }
    <div class="diagram-wrap">${diagramSvg}</div>
    <div class="assumption">${escapeHtml(MLTA_OFFICIAL_FRONT_TEXT.assumptionNote)}</div>

    <table class="form-box">
      <thead>
        <tr>
          <th style="width:60%">ความคุ้มครอง</th>
          <th style="width:40%">${escapeHtml(sumHeader)}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="cell-center">${escapeHtml(docHeading)}</td>
          <td class="cell-center"><span class="val-fill">${sumText}</span> บาท</td>
        </tr>
      </tbody>
    </table>

    <table class="form-box">
      <thead>
        <tr>
          <th style="width:60%">เบี้ยประกันภัย</th>
          <th style="width:40%">งวดการชำระเบี้ยประกันภัย</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="cell-main">
            เบี้ยประกันชีวิต ${escapeHtml(docHeading)} <span class="val-fill">${premiumText}</span> บาท
            <div class="cell-note">${escapeHtml(MLTA_OFFICIAL_FRONT_TEXT.premiumDeliveryNote)}</div>
          </td>
          <td class="cell-center">
            <span class="check-circle">&#10003;</span> ครั้งเดียว
          </td>
        </tr>
      </tbody>
    </table>

    ${benefitsHtml}

    <div class="notes">
      <div><strong>${escapeHtml(MLTA_OFFICIAL_FRONT_TEXT.notesHeading)}</strong> ${escapeHtml(
        MLTA_OFFICIAL_FRONT_TEXT.note1
      )}</div>
      <div class="indent">${escapeHtml(MLTA_OFFICIAL_FRONT_TEXT.note2)}</div>
    </div>

    <div class="front-footer">
      <div>${escapeHtml(MLTA_OFFICIAL_FRONT_TEXT.footerBackRef)}</div>
      <div class="quote">${escapeHtml(MLTA_OFFICIAL_FRONT_TEXT.footerBrokerDisclaimer)}</div>
    </div>

    ${mrtaSignatureHtml}
  </section>

  <!-- หน้า 2 (ด้านหลัง): สรุปเงื่อนไขทั่วไป -->
  <section class="sheet back-page">
    <div class="back-section">
      <h2>${escapeHtml(MLTA_OFFICIAL_BACK_TEXT.generalConditionsHeading)}</h2>
      ${MLTA_OFFICIAL_BACK_TEXT.generalConditions
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join('')}
    </div>

    <div class="back-section">
      <h2>${escapeHtml(MLTA_OFFICIAL_BACK_TEXT.validityHeading)}</h2>
      <p>${escapeHtml(MLTA_OFFICIAL_BACK_TEXT.validityBody)}</p>
    </div>

    <div class="back-section">
      <h2>${escapeHtml(MLTA_OFFICIAL_BACK_TEXT.nonCoverageHeading)}</h2>
      ${MLTA_OFFICIAL_BACK_TEXT.nonCoverageItems
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join('')}
    </div>

    <div class="back-section" style="${isMrta ? '' : 'margin-bottom:0'}">
      <h2>${escapeHtml(MLTA_OFFICIAL_BACK_TEXT.tpdExclusionsHeading)}</h2>
      <p>${escapeHtml(MLTA_OFFICIAL_BACK_TEXT.tpdExclusionsIntro)}</p>
      ${MLTA_OFFICIAL_BACK_TEXT.tpdExclusions
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join('')}
    </div>

    ${mrtaBackExtraHtml}
  </section>
</body>
</html>`;
}

export { MLTA_MAX_AGE };
