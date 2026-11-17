/**
 * Client-side helper to load Academic Strata filter options from NURVIA's
 * verified `/api/strata/*` Route Handlers while preserving hierarchy and
 * never inventing AcademicYear or Season endpoints.
 */

import { nurviaApi } from '@/lib/api-client';
import type { StudyLibraryFiltersDto } from '@/lib/api-types';
import type { StrataRecord } from './contracts';

function extractDisplayName(record: StrataRecord): string {
  const candidate = record.name ?? record.title ?? record.slug ?? record.code ?? record.id;
  return typeof candidate === 'string' || typeof candidate === 'number' ? String(candidate).trim() : '';
}

function extractId(record: StrataRecord): string {
  const candidate = record.id ?? record._id ?? record.uuid ?? record.slug ?? record.name;
  return typeof candidate === 'string' || typeof candidate === 'number' ? String(candidate).trim() : '';
}

export interface StrataHierarchyFilters extends StudyLibraryFiltersDto {
  institutions: Array<{ id: string; name: string }>;
  programs: Array<{ id: string; name: string; domainId?: string }>;
  courses: Array<{ id: string; name: string; programId?: string }>;
  cohorts: Array<{ id: string; name: string; divisionId?: string }>;
  classes: Array<{ id: string; name: string; cohortId?: string }>;
}

/**
 * Queries verified LexmaCasto Academic Strata endpoints and maps them into
 * StudyLibraryFiltersDto without fabricating missing AcademicYear or Season data.
 */
export async function fetchStrataFilterOptions(): Promise<StrataHierarchyFilters | null> {
  const [schoolsRes, subjectsRes, topicsRes, examsRes, sectionsRes, institutionsRes, programsRes, coursesRes, cohortsRes, classesRes] =
    await Promise.all([
      nurviaApi.getStrata('schools'),
      nurviaApi.getStrata('subjects'),
      nurviaApi.getStrata('topics'),
      nurviaApi.getStrata('exams'),
      nurviaApi.getStrata('sections'),
      nurviaApi.getStrata('institutions'),
      nurviaApi.getStrata('programs'),
      nurviaApi.getStrata('courses'),
      nurviaApi.getStrata('cohorts'),
      nurviaApi.getStrata('classes'),
    ]);

  const anySuccess =
    schoolsRes.success ||
    subjectsRes.success ||
    topicsRes.success ||
    examsRes.success ||
    sectionsRes.success ||
    institutionsRes.success;

  if (!anySuccess) {
    return null;
  }

  const schoolItems = schoolsRes.success && schoolsRes.data ? schoolsRes.data.items : [];
  const subjectItems = subjectsRes.success && subjectsRes.data ? subjectsRes.data.items : [];
  const topicItems = topicsRes.success && topicsRes.data ? topicsRes.data.items : [];
  const examItems = examsRes.success && examsRes.data ? examsRes.data.items : [];
  const sectionItems = sectionsRes.success && sectionsRes.data ? sectionsRes.data.items : [];
  const institutionItems = institutionsRes.success && institutionsRes.data ? institutionsRes.data.items : [];
  const programItems = programsRes.success && programsRes.data ? programsRes.data.items : [];
  const courseItems = coursesRes.success && coursesRes.data ? coursesRes.data.items : [];
  const cohortItems = cohortsRes.success && cohortsRes.data ? cohortsRes.data.items : [];
  const classItems = classesRes.success && classesRes.data ? classesRes.data.items : [];

  // Extract academicYears, seasons, and difficulties ONLY if present on actual returned records
  const yearSet = new Set<number>();
  const seasonSet = new Set<string>();
  const difficultySet = new Set<string>();
  for (const rec of [...examItems, ...sectionItems, ...cohortItems, ...classItems]) {
    const rawYear = rec.academicYear ?? rec.year;
    if (typeof rawYear === 'number' && Number.isFinite(rawYear)) {
      yearSet.add(rawYear);
    } else if (typeof rawYear === 'string' && /^\d{4}$/.test(rawYear.trim())) {
      yearSet.add(Number(rawYear.trim()));
    }
    const rawSeason = rec.season ?? rec.term;
    if (typeof rawSeason === 'string' && rawSeason.trim()) {
      seasonSet.add(rawSeason.trim());
    }
    const rawDifficulty = rec.difficulty;
    if (typeof rawDifficulty === 'string' && rawDifficulty.trim()) {
      difficultySet.add(rawDifficulty.trim());
    }
  }

  return {
    pathways: [],
    categories: [],
    schools: schoolItems.map(extractDisplayName).filter(Boolean),
    academicYears: Array.from(yearSet).sort((a, b) => b - a),
    subjects: subjectItems.map(extractDisplayName).filter(Boolean),
    seasons: Array.from(seasonSet),
    exams: examItems
      .map((ex) => ({
        id: extractId(ex),
        code: typeof ex.code === 'string' && ex.code.trim() ? ex.code.trim() : extractId(ex),
        title: extractDisplayName(ex),
        pathway: typeof ex.pathway === 'string' ? ex.pathway : 'RN',
        category: typeof ex.category === 'string' ? ex.category : 'Assessment',
      }))
      .filter((ex) => ex.id && ex.title),
    topics: topicItems.map(extractDisplayName).filter(Boolean),
    difficulties: Array.from(difficultySet) as StudyLibraryFiltersDto['difficulties'],
    questionTypes: [],
    institutions: institutionItems
      .map((item) => ({ id: extractId(item), name: extractDisplayName(item) }))
      .filter((i) => i.id && i.name),
    programs: programItems
      .map((item) => ({
        id: extractId(item),
        name: extractDisplayName(item),
        domainId: item.domainId ? String(item.domainId) : undefined,
      }))
      .filter((i) => i.id && i.name),
    courses: courseItems
      .map((item) => ({
        id: extractId(item),
        name: extractDisplayName(item),
        programId: item.programId ? String(item.programId) : undefined,
      }))
      .filter((i) => i.id && i.name),
    cohorts: cohortItems
      .map((item) => ({
        id: extractId(item),
        name: extractDisplayName(item),
        divisionId: item.divisionId ? String(item.divisionId) : undefined,
      }))
      .filter((i) => i.id && i.name),
    classes: classItems
      .map((item) => ({
        id: extractId(item),
        name: extractDisplayName(item),
        cohortId: item.cohortId ? String(item.cohortId) : undefined,
      }))
      .filter((i) => i.id && i.name),
  };
}
