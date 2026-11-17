import type { StudyGuideSummaryDto } from '@/lib/api-types';

export interface StudyGuideTerm {
  term: string;
  definition: string;
}

export interface StudyGuideTable {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface StudyGuideSection {
  heading: string;
  points: string[];
}

export interface StudyGuideRecord {
  id: string;
  slug: string;
  title: string;
  subject: string;
  pathway: 'RN' | 'PN_LPN' | 'Both';
  summary: string;
  readingMinutes: number;
  keyConcepts: string[];
  clinicalPriorities: string[];
  importantTerminology: StudyGuideTerm[];
  comparisonTable?: StudyGuideTable;
  structuredNotes: StudyGuideSection[];
  relatedTopicSlugs: string[];
  relatedCarePlanSlugs: string[];
  source: 'Verified Remote Backend';
  contentVersion: string;
  publicationStatus: 'Published' | 'Draft';
}

export const STUDY_GUIDE_SUBJECTS = [
  'All',
  'Cardiac & EKG',
  'Respiratory',
  'Maternity',
  'Pediatrics',
  'Pharmacology',
  'Fundamentals',
  'Med-Surg/Renal',
  'Mental Health',
  'Dosage Calculation',
] as const;

export type StudyGuidesRemoteStatus =
  | 'loaded'
  | 'not_provisioned'
  | 'unauthorized'
  | 'error';

export interface StudyGuidesLoadResult {
  guides: StudyGuideRecord[];
  localCount: number;
  remoteCount: number;
  remoteStatus: StudyGuidesRemoteStatus;
  statusCode?: number;
  remoteMessage?: string;
}

export function mapRemoteStudyGuide(dto: StudyGuideSummaryDto): StudyGuideRecord {
  return {
    id: dto.id,
    slug: dto.slug || dto.id,
    title: dto.title,
    subject: dto.category || 'Fundamentals',
    pathway: (dto.pathway as StudyGuideRecord['pathway']) || 'Both',
    summary: dto.summary,
    readingMinutes: dto.readingMinutes || 10,
    keyConcepts: [],
    clinicalPriorities: [],
    importantTerminology: [],
    structuredNotes: [],
    relatedTopicSlugs: [],
    relatedCarePlanSlugs: [],
    source: 'Verified Remote Backend',
    contentVersion: 'remote',
    publicationStatus: dto.isPublished ? 'Published' : 'Draft',
  };
}

/**
 * Normalizes and deduplicates server-returned Study Guides, excluding unpublished drafts.
 * Study Guides are strictly server-driven (no local-first fallback).
 */
export function filterPublishedRemoteStudyGuides(
  remoteDtos: readonly StudyGuideSummaryDto[] = []
): StudyGuideRecord[] {
  const byKey = new Map<string, StudyGuideRecord>();
  for (const dto of remoteDtos) {
    if (!dto.isPublished) continue;
    const mapped = mapRemoteStudyGuide(dto);
    const key = mapped.slug.toLowerCase();
    if (!byKey.has(key) && !Array.from(byKey.values()).some((g) => g.id === mapped.id)) {
      byKey.set(key, mapped);
    }
  }
  return Array.from(byKey.values());
}

/**
 * Loads Study Guides strictly from the server-driven backend contract.
 * Never falls back to local seed data or localStorage.
 */
export async function loadStudyGuidesCatalogue(options?: {
  remoteFetcher?: () => Promise<{
    success: boolean;
    statusCode?: number;
    errorCode?: string;
    message?: string;
    data?: StudyGuideSummaryDto[];
  }>;
}): Promise<StudyGuidesLoadResult> {
  if (!options?.remoteFetcher) {
    return {
      guides: [],
      localCount: 0,
      remoteCount: 0,
      remoteStatus: 'not_provisioned',
      statusCode: 501,
      remoteMessage:
        'Study Guides are server-driven and the shared backend Study Guides endpoint is not yet provisioned (501 NOT_PROVISIONED).',
    };
  }

  try {
    const res = await options.remoteFetcher();
    if (res.success && Array.isArray(res.data)) {
      const published = filterPublishedRemoteStudyGuides(res.data);
      return {
        guides: published,
        localCount: 0,
        remoteCount: published.length,
        remoteStatus: 'loaded',
        statusCode: res.statusCode ?? 200,
      };
    }

    if (res.statusCode === 501 || res.errorCode === 'NOT_PROVISIONED') {
      return {
        guides: [],
        localCount: 0,
        remoteCount: 0,
        remoteStatus: 'not_provisioned',
        statusCode: 501,
        remoteMessage:
          res.message ||
          'Study Guides are server-driven and require backend provisioning on LexmaCasto (501 NOT_PROVISIONED).',
      };
    }

    if (res.statusCode === 401 || res.statusCode === 403) {
      return {
        guides: [],
        localCount: 0,
        remoteCount: 0,
        remoteStatus: 'unauthorized',
        statusCode: res.statusCode,
        remoteMessage: res.message || 'Sign in with an authorized learner account to view Study Guides.',
      };
    }

    return {
      guides: [],
      localCount: 0,
      remoteCount: 0,
      remoteStatus: 'error',
      statusCode: res.statusCode,
      remoteMessage: res.message || 'Unable to load Study Guides from the server.',
    };
  } catch {
    return {
      guides: [],
      localCount: 0,
      remoteCount: 0,
      remoteStatus: 'error',
      remoteMessage: 'Network error while loading Study Guides from the server.',
    };
  }
}

export function getStudyGuideBySlug(
  slug: string,
  guides: readonly StudyGuideRecord[] = []
): StudyGuideRecord | null {
  const normalized = slug.trim().toLowerCase();
  return guides.find((g) => g.slug.toLowerCase() === normalized || g.id.toLowerCase() === normalized) ?? null;
}
