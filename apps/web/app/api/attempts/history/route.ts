import { NextRequest, NextResponse } from 'next/server';
import type { ExamAttemptSummaryDto } from '@/lib/api-types';
import {
  extractSiteMetadataFromRequestHeaders,
  lexmaCastoRequest,
} from '@/lib/lexmacasto/client';
import { buildStrataEndpointPath } from '@/lib/lexmacasto/contracts';
import { getServerCastoSession } from '@/lib/lexmacasto/session';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  Pragma: 'no-cache',
};

interface LexmaCastoExamResultRaw {
  id?: string | number;
  guidId?: string;
  examId?: string | number;
  examGuidId?: string;
  title?: string;
  assessmentName?: string;
  status?: string;
  isAttempted?: boolean;
  attemptedAt?: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  percentageScore?: number;
  score?: number;
  passed?: boolean;
  questionsCount?: number;
  totalAnswered?: number;
}

function mapLexmaCastoResultToAttemptSummary(
  item: LexmaCastoExamResultRaw
): ExamAttemptSummaryDto | null {
  const attemptId = String(item.guidId ?? item.id ?? '').trim();
  const examId = String(item.examGuidId ?? item.examId ?? item.guidId ?? item.id ?? '').trim();
  if (!attemptId || !examId) {
    return null;
  }

  let status = 'Submitted';
  if (typeof item.status === 'string' && ['InProgress', 'Submitted', 'Graded', 'Expired'].includes(item.status)) {
    status = item.status;
  } else if (item.reviewedAt) {
    status = 'Graded';
  } else if (item.isAttempted === false) {
    status = 'InProgress';
  }

  const startedAtUtc =
    (typeof item.attemptedAt === 'string' && item.attemptedAt) ||
    (typeof item.createdAt === 'string' && item.createdAt) ||
    new Date().toISOString();

  const submittedAtUtc =
    status === 'InProgress'
      ? undefined
      : (typeof item.reviewedAt === 'string' && item.reviewedAt) ||
        (typeof item.attemptedAt === 'string' && item.attemptedAt) ||
        (typeof item.updatedAt === 'string' && item.updatedAt) ||
        undefined;

  const scorePercentage =
    typeof item.percentageScore === 'number'
      ? item.percentageScore
      : typeof item.score === 'number'
        ? item.score
        : undefined;

  const totalQuestions =
    typeof item.questionsCount === 'number'
      ? item.questionsCount
      : typeof item.totalAnswered === 'number'
        ? item.totalAnswered
        : 0;

  return {
    attemptId,
    examId,
    examTitle: String(item.title ?? item.assessmentName ?? 'Exam Attempt'),
    status,
    startedAtUtc,
    ...(submittedAtUtc ? { submittedAtUtc } : {}),
    ...(scorePercentage !== undefined ? { scorePercentage } : {}),
    ...(typeof item.passed === 'boolean' ? { passed: item.passed } : {}),
    totalQuestions,
  };
}

export async function GET(request: NextRequest) {
  const session = await getServerCastoSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Authentication is required.', errorCode: 'UNAUTHORIZED' },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  const pageParam = Number(request.nextUrl.searchParams.get('page') || '1');
  const perPageParam = Number(request.nextUrl.searchParams.get('perPage') || '50');
  const page = Number.isInteger(pageParam) && pageParam >= 1 && pageParam <= 10_000 ? pageParam : 1;
  const perPage = Number.isInteger(perPageParam) && perPageParam >= 1 && perPageParam <= 100 ? perPageParam : 50;

  const backendPath = buildStrataEndpointPath(
    'examResults',
    { page, perPage },
    'relative'
  );

  const siteMeta = extractSiteMetadataFromRequestHeaders(
    request.headers,
    '/api/attempts/history'
  );

  const result = await lexmaCastoRequest<{
    data?: {
      results?: LexmaCastoExamResultRaw[];
      items?: LexmaCastoExamResultRaw[];
    };
    results?: LexmaCastoExamResultRaw[];
    items?: LexmaCastoExamResultRaw[];
  }>(backendPath, {
    method: 'GET',
    session,
    siteMeta,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        success: false,
        message: result.message,
        errorCode: result.errorCode,
        errors: result.errors,
      },
      { status: result.status, headers: NO_STORE_HEADERS }
    );
  }

  const rawList =
    result.data?.data?.results ??
    result.data?.data?.items ??
    result.data?.results ??
    result.data?.items ??
    [];

  const mapped = Array.isArray(rawList)
    ? rawList
        .map(mapLexmaCastoResultToAttemptSummary)
        .filter((item): item is ExamAttemptSummaryDto => item !== null)
    : [];

  return NextResponse.json(
    {
      success: true,
      message: 'OK',
      data: mapped,
    },
    { headers: NO_STORE_HEADERS }
  );
}
