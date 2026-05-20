import { clsx } from 'clsx';
import { InfoPageLayout } from '../components/InfoPageLayout';
import { ScrollReveal } from '../components/ScrollReveal';

const STEPS = [
  {
    step: 1,
    icon: '✨',
    title: 'Brand registers product',
    body: 'A skincare manufacturer registers the product with batch, expiry, ingredients, and organization profile details.',
  },
  {
    step: 2,
    icon: '📱',
    title: 'Generate QR code',
    body: 'VeriChain creates a signed verification link and QR image shoppers can scan on packaging.',
  },
  {
    step: 3,
    icon: '📤',
    title: 'Request transfer',
    body: 'The brand sends custody to a distributor. Ownership stays unchanged until acceptance.',
  },
  {
    step: 4,
    icon: '✅',
    title: 'Accept custody',
    body: 'The distributor reviews and accepts. The blockchain records the new owner for traceability.',
  },
  {
    step: 5,
    icon: '🏪',
    title: 'Retail handoff',
    body: 'Stock moves to a retailer through the same request-and-accept flow before consumer sale.',
  },
  {
    step: 6,
    icon: '🔍',
    title: 'Consumer scan',
    body: 'Shoppers scan the QR to verify authenticity, expiry, ingredients, halal status, and allergy-related alerts.',
  },
  {
    step: 7,
    icon: '⏰',
    title: 'Inventory & reminders',
    body: 'Consumers can save verified skincare items and receive expiry and safety reminders.',
  },
];

export default function HowItWorksPage() {
  return (
    <InfoPageLayout
      title="How It Works"
      subtitle="From skincare brand registration to consumer verification in seven steps."
    >
      <div className="relative max-w-5xl mx-auto">
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-primary-300/0 via-primary-400/60 to-primary-300/0 dark:via-primary-600/70" />

        <div className="space-y-6">
          {STEPS.map((step, index) => (
            <ScrollReveal
              key={step.step}
              staggerIndex={index}
              staggerMs={90}
              className={clsx(
                'relative md:grid md:grid-cols-[1fr_auto_1fr] md:items-stretch',
              )}
            >
              <div className={clsx('hidden md:block', index % 2 === 0 ? 'md:col-start-1' : 'md:col-start-3')} />

              <div className="absolute left-6 md:left-1/2 top-9 -translate-x-1/2 z-20">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-200/80 bg-white text-xs font-bold text-primary-700 shadow-lg shadow-primary-500/15 dark:border-primary-700 dark:bg-neutral-900 dark:text-primary-300">
                  {step.step}
                </div>
              </div>

              <div
                className={clsx(
                  'ml-16 md:ml-0',
                  index % 2 === 0 ? 'md:col-start-1 md:mr-8' : 'md:col-start-3 md:ml-8',
                )}
              >
                <div
                  className={clsx(
                    'rounded-2xl border border-slate-200/90 bg-white/95 p-6 md:p-7 shadow-sm dark:border-neutral-600 dark:bg-neutral-800',
                    'motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-out hover:-translate-y-1 hover:shadow-2xl hover:border-primary-300/70 dark:hover:border-primary-500/60',
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 text-2xl text-white shadow-md motion-safe:transition-transform motion-safe:duration-300 hover:scale-105">
                      {step.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                        Step {step.step}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold text-page-heading">{step.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-page-body">{step.body}</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </InfoPageLayout>
  );
}
