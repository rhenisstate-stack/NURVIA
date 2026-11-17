import type { ReactNode } from 'react';
import { ExamThemeProvider } from '@/lib/contexts/web/assessment/theme/ExamThemeContext';
import { ExamFontSizeProvider } from '@/lib/contexts/web/assessment/theme/ExamFontSizeContext';
import { LiveStrataExamProvider } from '@/lib/contexts/panel/assessment/LiveStrataExamContext';
import { LiveExamActionProvider } from '@/lib/contexts/web/assessment/live/useLiveExamActionContext';

export default function LiveExamsLayout({ children }: { children: ReactNode }) {
  return (
    <ExamThemeProvider>
      <ExamFontSizeProvider>
        <LiveStrataExamProvider>
          <LiveExamActionProvider>{children}</LiveExamActionProvider>
        </LiveStrataExamProvider>
      </ExamFontSizeProvider>
    </ExamThemeProvider>
  );
}
