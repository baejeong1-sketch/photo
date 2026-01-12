
export enum ProfessionalStyle {
  MALE_SUIT = '정장 (남성)',
  FEMALE_SUIT = '정장 (여성)',
  SMART_CASUAL = '비즈니스 캐주얼',
  MINIMAL_WHITE = '심플 화이트 배경',
  MODERN_GRAY = '세련된 그레이 배경'
}

export interface TransformationState {
  originalImage: string | null;
  resultImage: string | null;
  isProcessing: boolean;
  error: string | null;
  selectedStyle: ProfessionalStyle;
}
