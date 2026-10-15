export type ToolCategory = 'image' | 'pdf' | 'text' | 'developer' | 'calculator';

export interface ToolFAQ {
  question: string;
  questionBn?: string;
  answer: string;
  answerBn?: string;
}

export interface ToolGuideStep {
  step: number;
  title: string;
  titleBn?: string;
  desc: string;
  descBn?: string;
}

export interface ToolDef {
  id: string;
  slug: string;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  category: ToolCategory;
  icon: string;
  keywords: string[];
  isPopular?: boolean;
  status: 'implemented' | 'partially-implemented' | 'requires-configuration';
  steps: ToolGuideStep[];
  faqs: ToolFAQ[];
  privacyNote: string;
  privacyNoteBn?: string;
}

export interface CategoryDef {
  id: ToolCategory;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  icon: string;
  gradient: string;
}
