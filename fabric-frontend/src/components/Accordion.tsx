import { useState, type ReactNode } from 'react';
import { clsx } from 'clsx';

export type AccordionItem = {
  id: string;
  question: string;
  answer: ReactNode;
};

type AccordionProps = {
  items: AccordionItem[];
  className?: string;
};

export function Accordion({ items, className }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className={clsx('space-y-3', className)} role="list">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div
            key={item.id}
            className="card overflow-hidden"
            role="listitem"
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              onClick={() => setOpenId(open ? null : item.id)}
              aria-expanded={open}
            >
              <span className="font-medium text-page-heading">{item.question}</span>
              <span
                className={clsx(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-transform dark:bg-primary-950/50 dark:text-primary-300',
                  open && 'rotate-180',
                )}
                aria-hidden
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </button>
            {open && (
              <div className="border-t border-neutral-200/80 px-5 py-4 text-sm leading-relaxed text-page-body dark:border-neutral-600/60">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
