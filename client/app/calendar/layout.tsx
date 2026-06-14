'use client';
import { useKeyboard } from '../../lib/hooks/useKeyboard';
import { AppShell } from '../../components/layout/AppShell';
import { NavRail } from '../../components/layout/NavRail';
import { ComposeModal } from '../../components/mail/ComposeModal';
import { MeetingBrief } from '../../components/calendar/MeetingBrief';
import { useMeetingBrief } from '../../lib/hooks/useMeetingBrief';

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  useKeyboard();
  const { briefEvent, briefThread, isVisible, handleDismiss } = useMeetingBrief();

  return (
    <>
      <AppShell
        nav={<NavRail />}
        main={children}
      />
      <ComposeModal />
      <MeetingBrief
        event={briefEvent}
        thread={briefThread}
        isVisible={isVisible}
        onDismiss={handleDismiss}
      />
    </>
  );
}
