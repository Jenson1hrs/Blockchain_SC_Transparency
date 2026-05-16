export function MetadataIncompleteBadge({
  className,
  compact,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span
      className={
        className ??
        `inline-flex items-center rounded-full border border-amber-300/90 bg-amber-50 font-medium text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/50 dark:text-amber-200 ${
          compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs'
        }`
      }
    >
      {compact ? 'Incomplete' : 'Metadata Incomplete'}
    </span>
  );
}
