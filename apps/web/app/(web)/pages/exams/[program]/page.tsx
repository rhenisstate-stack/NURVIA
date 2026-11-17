import { notFound } from 'next/navigation';
import { ProgramLandingView } from '@/components/programs/ProgramLandingView';
import {
  isNursingProgramSlug,
  NURSING_PROGRAMS,
} from '@/lib/programs/programRegistry';

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
