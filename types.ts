
export type ImageType = 'scenario' | 'model' | 'clothing' | 'accessory';

export interface ImageSet {
  scenario: File | null;
  model: File | null;
  clothing: File | null;
  accessory: File | null;
}

export interface ImagePreviewSet {
  scenario: string | null;
  model: string | null;
  clothing: string | null;
  accessory: string | null;
}

export interface GeneratedImageSet {
  artistic: string | null;
  expository: string | null;
}
