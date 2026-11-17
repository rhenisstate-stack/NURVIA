import { notFound } from 'next/navigation';
import { ProgramLandingView } from '@/components/programs/ProgramLandingView';
import {
  isNursingProgramSlug,
  NURSING_PROGRAMS,
  NURSING_PROGRAM_SLUGS,
} from '@/lib/programs/programRegistry';

export function generateStaticParams() {
  return NURSING_PROGRAM_SLUGS.map((program) => ({ program }));
}

export default async function ProgramExamLandingPage({
  params,
}: {
  params: Promise<{ program: string }>;
}) {
  const { program } = await params;
  if (!isNursingProgramSlug(program)) {
    notFound();
  }
  return <ProgramLandingView program={NURSING_PROGRAMS[program]} />;
}
