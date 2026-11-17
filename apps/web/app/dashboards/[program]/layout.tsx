import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { isNursingProgramSlug, NURSING_PROGRAMS } from '@/lib/programs/programRegistry';
import { PanelThemeProvider } from '@/lib/contexts/panel/layout/theme/PanelThemeContext';
import { PanelFontSizeProvider } from '@/lib/contexts/panel/layout/theme/PanelFontSizeContext';
import { LeftSidebarProvider } from '@/lib/contexts/panel/layout/includes/sidebar/LeftSidebarContext';
import { RightSidebarProvider } from '@/lib/contexts/panel/layout/includes/sidebar/RightSidebarContext';
import DashboardPreloader from '@/components/common/dashboards/elements/DashboardPreloader';
import { ProgramDashboardShell } from '@/components/dashboards/ProgramDashboardShell';

export default async function ProgramDashboardLayout({
  params,
  children,
}: {
  params: Promise<{ program: string }>;
  children: ReactNode;
}) {
  const { program } = await params;
  if (!isNursingProgramSlug(program)) {
    notFound();
  }

  return (
    <PanelThemeProvider>
      <PanelFontSizeProvider>
        <LeftSidebarProvider>
          <RightSidebarProvider>
            <DashboardPreloader>
              <ProgramDashboardShell program={NURSING_PROGRAMS[program]}>
                {children}
              </ProgramDashboardShell>
            </DashboardPreloader>
          </RightSidebarProvider>
        </LeftSidebarProvider>
      </PanelFontSizeProvider>
    </PanelThemeProvider>
  );
}
