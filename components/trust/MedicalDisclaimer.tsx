import Link from 'next/link';

/**
 * Short, honest health disclaimer for fitness / medication-adjacent tracking.
 */
export function MedicalDisclaimer({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-xs leading-relaxed text-stone-500">
        KeepStrong is for{' '}
        <span className="font-medium text-stone-600">wellness and fitness tracking</span> only. It is{' '}
        <span className="font-medium text-stone-600">not</span> medical advice, diagnosis, or treatment.
        Talk to your clinician about GLP-1 medications and any health decisions.
      </p>
      <p className="text-[11px] text-stone-400">
        <Link href="/privacy" className="underline decoration-stone-300 underline-offset-2 hover:text-stone-600">
          Privacy
        </Link>
        <span className="mx-1.5 text-stone-300">·</span>
        <Link href="/terms" className="underline decoration-stone-300 underline-offset-2 hover:text-stone-600">
          Terms
        </Link>
      </p>
    </div>
  );
}
