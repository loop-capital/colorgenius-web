export interface FormulaComponent {
  shadeId: string;
  shadeName: string;
  shadeCode: string;
  hex: string;
  targetGrams: number;  // planned amount (from formula or manual)
  actualGrams: number;  // weighed on scale
}
