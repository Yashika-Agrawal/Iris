'use client';
import { FocusStack } from '../../components/mail/FocusStack';
import { useFocusStack } from '../../lib/hooks/useFocusStack';
import { Loader } from '../../components/ui/Loader';

export default function MailPage() {
  const { items, isLoading, hasGenerated, generateStack } = useFocusStack();

  if (isLoading) {
    return <Loader label="Iris is synthesizing..." sublabel="Analyzing Inbox & Calendar" />;
  }

  if (!hasGenerated) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
        <h2 className="text-xl font-bold text-primary">Your Focus Stack</h2>
        <p className="text-secondary max-w-sm">
          Click below to let Iris analyze your inbox and calendar to identify your highest priorities.
        </p>
        <button
          onClick={generateStack}
          className="px-4 py-2 mt-2 bg-accent-blue text-white rounded-md font-semibold hover:bg-opacity-90 transition-opacity"
        >
          Synthesize Priorities
        </button>
      </div>
    );
  }

  return <FocusStack items={items} />;
}
