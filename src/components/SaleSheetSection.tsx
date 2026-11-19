import React from 'react';
import { type CalculationResult, type InsuranceType } from '../utils/insuranceCalculator';
import { SaleSheetPages } from './SaleSheetPages';

interface SaleSheetSectionProps {
  result: CalculationResult;
  sheetType: InsuranceType;
  setSheetType?: (t: InsuranceType) => void;
  customerName: string;
  setCustomerName?: (v: string) => void;
  advisorName: string;
  setAdvisorName?: (v: string) => void;
  onSelectTerm?: (term: number) => void;
  onClearTerm?: () => void;
  onRequestPrintSaleSheet?: (targetType: InsuranceType) => void;
  isPrintTarget: boolean;
}

export const SaleSheetSection: React.FC<SaleSheetSectionProps> = ({
  result,
  sheetType,
  customerName,
  advisorName,
  isPrintTarget,
}) => {
  return (
    <section
      id="sale-sheet-section"
      aria-label="Sale Sheet เอกสารสรุปข้อเสนอแผนประกันคุ้มครองสินเชื่อ"
      className={
        isPrintTarget
          ? 'hidden print:block print-sale-sheet-page'
          : 'hidden print:hidden'
      }
    >
      <SaleSheetPages
        result={result}
        sheetType={sheetType}
        customerName={customerName}
        advisorName={advisorName}
      />
    </section>
  );
};
