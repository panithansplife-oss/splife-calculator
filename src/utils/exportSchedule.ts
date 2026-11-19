import {
  type CalculationResult,
  MLTA_MAX_AGE_PLUS_TERM,
  MLTA_TERMS_PART1,
  MLTA_TERMS_PART2,
  MRTA_MAX_AGE_PLUS_TERM,
  formatBaht,
  getMltaScheduleTables,
  getMrtaScheduleTables,
} from './insuranceCalculator';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildPrintableScheduleHtml(result: CalculationResult): string {
  const sumAssured = result.sumAssured ?? (result.insuranceType === 'mrta' ? 1_000_000 : 100_000);
  const age = result.age;
  const genderLabel = result.gender === 'male' ? 'ชาย' : 'หญิง';
  const isMrta = result.insuranceType === 'mrta';
  const maxAgePlusTerm = isMrta ? MRTA_MAX_AGE_PLUS_TERM : MLTA_MAX_AGE_PLUS_TERM;
  const titleText = isMrta
    ? 'ตารางเบี้ยประกันคุ้มครองสินเชื่อ แบบทุนลดลง (MRTA) คุ้มครอง 1–30 ปี'
    : 'ตารางเบี้ยประกันคุ้มครองสินเชื่อ แบบทุนคงที่ (MLTA) คุ้มครอง 1–30 ปี';

  const renderMltaTable = (
    rows: ReturnType<typeof getMltaScheduleTables>['part1'],
    terms: readonly number[],
    breakBefore = false
  ) => {
    const headerCols = terms
      .map(
        (t) =>
          `<th class="${result.term === t ? 'col-selected' : ''}">${t}</th>`
      )
      .join('');

    const bodyRows = rows
      .map((row) => {
        const isHighlighted = age !== null && age >= row.minAge && age <= row.maxAge;
        const cells = terms
          .map((t) => {
            const val = row.premiums[t];
            const exceedsCap =
              isHighlighted && age !== null && age + t > MLTA_MAX_AGE_PLUS_TERM;
            if (val === null) {
              return `<td class="cell-na">—</td>`;
            }
            const isExact = isHighlighted && result.term === t;
            const cls = isExact
              ? 'cell-exact'
              : exceedsCap
              ? 'cell-cap'
              : isHighlighted
              ? 'cell-row-hi'
              : '';
            return `<td class="${cls}">${formatBaht(val)}</td>`;
          })
          .join('');
        return `<tr class="${isHighlighted ? 'row-hi' : ''}"><td class="age-cell ${
          isHighlighted ? 'age-cell-hi' : ''
        }">${escapeHtml(row.label)}</td>${cells}</tr>`;
      })
      .join('');

    return `
      <div class="table-wrap ${breakBefore ? 'break-before' : ''}">
        <table>
          <thead>
            <tr>
              <th rowspan="2" class="age-head">ช่วงอายุ</th>
              <th colspan="${terms.length}">ระยะเวลาเอาประกันภัย (ปี) · ชำระเบี้ยครั้งเดียว (${terms[0]}–${terms[terms.length - 1]} ปี)</th>
            </tr>
            <tr class="subhead">${headerCols}</tr>
          </thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>
    `;
  };

  const renderMrtaTable = (
    rows: ReturnType<typeof getMrtaScheduleTables>['part1'],
    terms: readonly number[],
    breakBefore = false
  ) => {
    const headerCols = terms
      .map(
        (t) =>
          `<th class="${result.term === t ? 'col-selected' : ''}">${t}</th>`
      )
      .join('');

    const bodyRows = rows
      .map((row) => {
        const isHighlighted = age === row.age;
        const cells = terms
          .map((t) => {
            const val = row.premiums[t];
            if (val === null) {
              return `<td class="cell-na">—</td>`;
            }
            const isExact = isHighlighted && result.term === t;
            const cls = isExact ? 'cell-exact' : isHighlighted ? 'cell-row-hi' : '';
            return `<td class="${cls}">${formatBaht(val)}</td>`;
          })
          .join('');
        return `<tr class="${isHighlighted ? 'row-hi' : ''}"><td class="age-cell ${
          isHighlighted ? 'age-cell-hi' : ''
        }">${row.age}</td>${cells}</tr>`;
      })
      .join('');

    return `
      <div class="table-wrap ${breakBefore ? 'break-before' : ''}">
        ${
          breakBefore
            ? `<div class="cont-head"><span><strong>ตารางเบี้ยประกัน MRTA (ต่อ) · คุ้มครอง 16–30 ปี</strong></span><span>เพศ: ${genderLabel} · ทุน: ${formatBaht(sumAssured)} บ. · อายุ: ${age ?? '—'} ปี</span></div>`
            : ''
        }
        <table>
          <thead>
            <tr>
              <th rowspan="2" class="age-head">อายุ</th>
              <th colspan="${terms.length}">ระยะเวลาคุ้มครอง (ปี) · ชำระเบี้ยครั้งเดียว (${terms[0]}–${terms[terms.length - 1]} ปี)</th>
            </tr>
            <tr class="subhead">${headerCols}</tr>
          </thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>
    `;
  };

  let tablesHtml = '';
  if (isMrta) {
    const { part1, part2 } = getMrtaScheduleTables(result.gender, sumAssured);
    tablesHtml =
      renderMrtaTable(part1, MLTA_TERMS_PART1, false) +
      renderMrtaTable(part2, MLTA_TERMS_PART2, true);
  } else {
    const { part1, part2 } = getMltaScheduleTables(result.gender, sumAssured);
    tablesHtml =
      renderMltaTable(part1, MLTA_TERMS_PART1, false) +
      renderMltaTable(part2, MLTA_TERMS_PART2, false);
  }

  return `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(titleText)}</title>
  <style>
    @page { size: A4 landscape; margin: 5mm 6mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 16px;
      font-family: "IBM Plex Sans Thai", "Sarabun", "Tahoma", system-ui, -apple-system, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      max-width: 1120px;
      margin: 0 auto 12px;
      padding: 10px 14px;
      background: #0f2a1e;
      color: #ffffff;
      border-radius: 10px;
    }
    .toolbar button {
      background: #10b981;
      color: #06281a;
      border: 0;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
    .sheet {
      max-width: 1120px;
      margin: 0 auto;
      background: #ffffff;
      padding: 14px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
    }
    .header {
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 6px;
      margin-bottom: 6px;
    }
    h1 { font-size: 14px; margin: 0 0 2px; line-height: 1.25; }
    .subtitle { font-size: 10.5px; color: #475569; margin: 0; }
    .meta {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 6px;
      margin-top: 6px;
      font-size: 10.5px;
    }
    .meta-box {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 4px 8px;
      background: #ffffff;
    }
    .meta-box.hi {
      border-color: #a7f3d0;
      background: #ecfdf5;
    }
    .cont-head {
      display: none;
    }
    .table-wrap { margin-top: 8px; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
      line-height: 1.15;
      font-variant-numeric: tabular-nums;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 2px 4px;
      text-align: right;
      white-space: nowrap;
    }
    thead tr:first-child th {
      background: #0f6e47;
      color: #ffffff;
      text-align: center;
      font-weight: 600;
    }
    thead tr.subhead th {
      background: #128053;
      color: #ffffff;
      font-weight: 600;
    }
    thead tr.subhead th.col-selected {
      background: #fbbf24;
      color: #0f172a;
    }
    th.age-head, td.age-cell {
      text-align: center;
      font-weight: 600;
      background: #ecfdf5;
      color: #064e3b;
      width: 44px;
    }
    td.age-cell-hi {
      background: #047857 !important;
      color: #ffffff !important;
    }
    tr.row-hi td { background: #d1fae5; font-weight: 700; color: #064e3b; }
    td.cell-na { background: #e2e8f0 !important; color: #94a3b8 !important; font-weight: 400; }
    td.cell-cap { background: #f1f5f9 !important; color: #94a3b8 !important; text-decoration: line-through; }
    td.cell-exact { background: #047857 !important; color: #ffffff !important; font-weight: 700; }
    .footer {
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #64748b;
      margin-top: 6px;
    }
    @media print {
      body { padding: 0; background: #ffffff; }
      .toolbar { display: none !important; }
      .sheet { max-width: none; border: 0; padding: 0; border-radius: 0; }
      .header { padding-bottom: 4px; margin-bottom: 4px; }
      h1 { font-size: 12px; margin: 0; }
      .subtitle { font-size: 9px; }
      .meta { margin-top: 4px; gap: 5px; font-size: 9px; }
      .meta-box { padding: 2px 6px; }
      .table-wrap { margin-top: 4px; }
      table { font-size: ${isMrta ? '8px' : '9px'}; line-height: ${isMrta ? '1.05' : '1.15'}; }
      th, td { padding: ${isMrta ? '0.8px 3.5px' : '2px 4px'}; }
      .footer { font-size: 8.5px; margin-top: 4px; }
      .break-before { break-before: page; page-break-before: always; margin-top: 0; }
      .cont-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #cbd5e1;
        padding-bottom: 3px;
        margin-bottom: 4px;
        font-size: 9px;
        color: #334155;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <span style="font-size:13px;font-weight:600;">SPLife Credit Shield · เอกสารพร้อมพิมพ์ (A4 แนวนอน)</span>
    <button type="button" onclick="window.print()">สั่งพิมพ์ / บันทึก PDF</button>
  </div>
  <div class="sheet">
    <div class="header">
      <h1>${escapeHtml(titleText)}</h1>
      <p class="subtitle">คำนวณเบี้ยประกันชำระครั้งเดียวครบ 1–30 ปี ตามทุนประกัน ${formatBaht(sumAssured)} บาท · ธ.ก.ส. SPLife และพันธมิตร</p>
      <div class="meta">
        <div class="meta-box">เพศ: <strong>${genderLabel}</strong></div>
        <div class="meta-box">ทุนประกัน: <strong>${formatBaht(sumAssured)} บาท</strong></div>
        <div class="meta-box">ปีเกิด (พ.ศ.): <strong>${result.birthYearBE ?? '—'}</strong></div>
        <div class="meta-box hi">อายุผู้เอาประกัน: <strong>${age !== null ? `${age} ปี` : '—'}</strong></div>
      </div>
    </div>
    ${tablesHtml}
    <div class="footer">
      <span>* อายุของผู้เอาประกันภัย เมื่อรวมกับระยะเวลาเอาประกันภัยแล้วต้องไม่เกิน ${maxAgePlusTerm} ปี (ช่อง — คือเกินเกณฑ์ไม่รับประกัน)</span>
      <span>ปีอ้างอิง พ.ศ. ${result.currentYearBE}</span>
    </div>
  </div>
</body>
</html>`;
}

export function buildScheduleCsv(result: CalculationResult): string {
  const sumAssured = result.sumAssured ?? (result.insuranceType === 'mrta' ? 1_000_000 : 100_000);
  const genderLabel = result.gender === 'male' ? 'ชาย' : 'หญิง';
  const isMrta = result.insuranceType === 'mrta';
  const allTerms = [...MLTA_TERMS_PART1, ...MLTA_TERMS_PART2];

  const lines: string[] = [];
  lines.push(
    [
      isMrta ? 'ตารางเบี้ยประกัน MRTA (แบบทุนลดลง)' : 'ตารางเบี้ยประกัน MLTA (แบบทุนคงที่)',
      `เพศ: ${genderLabel}`,
      `ทุนประกัน: ${sumAssured}`,
      `ปีเกิด (พ.ศ.): ${result.birthYearBE ?? '-'}`,
      `อายุ: ${result.age ?? '-'}`,
    ]
      .map(escapeCsvCell)
      .join(',')
  );

  lines.push(
    ['อายุ/ช่วงอายุ', ...allTerms.map((t) => `${t} ปี`)].map(escapeCsvCell).join(',')
  );

  if (isMrta) {
    const { part1, part2 } = getMrtaScheduleTables(result.gender, sumAssured);
    const part2ByAge = new Map(part2.map((r) => [r.age, r]));
    for (const r1 of part1) {
      const r2 = part2ByAge.get(r1.age);
      const vals = allTerms.map((t) => {
        const v = t <= 15 ? r1.premiums[t] : r2?.premiums[t] ?? null;
        return v === null ? '-' : v;
      });
      lines.push([r1.age, ...vals].map(escapeCsvCell).join(','));
    }
  } else {
    const { part1, part2 } = getMltaScheduleTables(result.gender, sumAssured);
    const part2ByKey = new Map(part2.map((r) => [r.key, r]));
    for (const r1 of part1) {
      const r2 = part2ByKey.get(r1.key);
      const vals = allTerms.map((t) => {
        const v = t <= 15 ? r1.premiums[t] : r2?.premiums[t] ?? null;
        return v === null ? '-' : v;
      });
      lines.push([r1.label, ...vals].map(escapeCsvCell).join(','));
    }
  }

  return '\uFEFF' + lines.join('\r\n');
}

export function triggerFileDownload(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
