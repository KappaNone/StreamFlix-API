export type ContentTag =
  | 'violence'
  | 'strong_violence'
  | 'fear'
  | 'coarse_language'
  | 'sexual_content'
  | 'mature_themes'
  | 'none';

export enum AgeCategory {
  ALL = 'ALL',
  KIDS = 'KIDS',
  TEENS = 'TEENS',
  ADULT = 'ADULT',
}

export const AgeGuidelines: Record<AgeCategory, ContentTag[]> = {
  [AgeCategory.ALL]: ['none'],
  [AgeCategory.KIDS]: ['none', 'fear'],
  [AgeCategory.TEENS]: ['fear', 'violence', 'coarse_language'],
  [AgeCategory.ADULT]: ['fear','violence','strong_violence','coarse_language','sexual_content','mature_themes'],
};

export function allowedTagsFor(ageCategory: AgeCategory) {
  return AgeGuidelines[ageCategory] ?? AgeGuidelines[AgeCategory.ALL];
}

export function isContentAllowedFor(ageCategory: AgeCategory, tags: ContentTag[] = []) {
  const allowed = new Set(allowedTagsFor(ageCategory));
  return tags.every(t => allowed.has(t) || t === 'none');
}