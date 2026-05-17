import { clsx } from 'clsx';
import { InfoPageLayout } from '../components/InfoPageLayout';
import { InfoSection, InfoStatCard } from '../components/info/InfoSection';
import { ScrollReveal } from '../components/ScrollReveal';

const HOVER_CARD =
  'motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-out hover:-translate-y-1 hover:shadow-medium';

const ROLES = [
  {
    icon: '👤',
    title: 'Consumer',
    description: 'Verify products, save personal inventory, and get expiry and allergy reminders.',
  },
  {
    icon: '🏭',
    title: 'Manufacturer',
    description: 'Register products, generate QR codes, and request transfers to distributors.',
  },
  {
    icon: '🚚',
    title: 'Distributor',
    description: 'Accept inbound stock, update locations, and forward products to retailers.',
  },
  {
    icon: '🏪',
    title: 'Retailer',
    description: 'Manage shelf stock, monitor expiry, and support in-store verification.',
  },
  {
    icon: '🏛️',
    title: 'Regulator',
    description: 'Review organizations, flagged products, and platform-wide oversight.',
  },
  {
    icon: '⚙️',
    title: 'Admin',
    description: 'Manage users and monitor platform, database, and blockchain health.',
  },
];

export default function AboutPage() {
  return (
    <InfoPageLayout
      title="About VeriChain"
      subtitle="Trusted traceability for every handoff from factory to consumer."
    >
      <ScrollReveal>
        <InfoSection
          title="Our mission"
          subtitle="Help partners and shoppers see where products come from and whether they are genuine."
          variant="gradient"
          className={HOVER_CARD}
        >
          <p className="text-page-body leading-relaxed">
            VeriChain connects manufacturers, distributors, retailers, regulators, and consumers on
            one traceability platform. Each custody step can be recorded on blockchain while rich
            product details stay easy to search and share.
          </p>
        </InfoSection>
      </ScrollReveal>

      <ScrollReveal staggerIndex={1}>
        <div className="grid gap-4 sm:grid-cols-3">
          <InfoStatCard icon="🔍" label="Focus" value="Authenticity" />
          <InfoStatCard icon="🔗" label="Method" value="Blockchain records" />
          <InfoStatCard icon="📱" label="Access" value="QR verification" />
        </div>
      </ScrollReveal>

      <div className="grid gap-6 md:grid-cols-2">
        <ScrollReveal staggerIndex={2}>
          <InfoSection title="The problem" variant="muted" className={HOVER_CARD}>
            <p className="text-sm leading-relaxed text-page-body">
              Counterfeit goods and hidden supply chains make it hard to trust origin, handling, and
              expiry. Paper trails are easy to change. Siloed databases hide the full story.
            </p>
          </InfoSection>
        </ScrollReveal>
        <ScrollReveal staggerIndex={3}>
          <InfoSection title="Our solution" variant="muted" className={HOVER_CARD}>
            <p className="text-sm leading-relaxed text-page-body">
              VeriChain anchors key custody events on blockchain and keeps practical data in a fast
              application layer. Teams work through clear roles. Consumers verify with a simple scan.
            </p>
          </InfoSection>
        </ScrollReveal>
      </div>

      <ScrollReveal staggerIndex={4}>
        <InfoSection
          title="Trust and transparency"
          subtitle="Everyone sees the same verified history for a product."
          className={HOVER_CARD}
        >
          <div className="rounded-xl border border-primary-200/50 bg-primary-50/40 p-5 dark:border-primary-800/40 dark:bg-primary-950/20">
            <p className="text-sm leading-relaxed text-page-body">
              Transfer requests require acceptance before ownership changes. QR checks use signed
              data so tampered labels are flagged. Regulators can review organizations and products
              without replacing the on-chain audit trail.
            </p>
          </div>
        </InfoSection>
      </ScrollReveal>

      <ScrollReveal staggerIndex={5}>
        <InfoSection title="On-chain vs off-chain" subtitle="Two layers, one clear experience.">
          <div className="grid gap-4 md:grid-cols-2">
            <div
              className={clsx(
                'rounded-2xl border border-primary-300/50 bg-gradient-to-br from-primary-50 to-white p-6 dark:border-primary-700/50 dark:from-primary-950/30 dark:to-neutral-900',
                HOVER_CARD,
              )}
            >
              <span className="inline-flex rounded-full bg-primary-600 px-3 py-0.5 text-xs font-semibold text-white">
                On-chain
              </span>
              <h3 className="mt-4 font-semibold text-page-heading">Immutable traceability</h3>
              <p className="mt-2 text-sm text-page-body">
                Product creation, ownership transfers, and location updates that form the custody
                audit trail.
              </p>
            </div>
            <div
              className={clsx(
                'rounded-2xl border border-neutral-200/80 bg-neutral-50/90 p-6 dark:border-neutral-600/50 dark:bg-neutral-900/50',
                HOVER_CARD,
              )}
            >
              <span className="inline-flex rounded-full bg-neutral-700 px-3 py-0.5 text-xs font-semibold text-white dark:bg-neutral-500">
                Off-chain
              </span>
              <h3 className="mt-4 font-semibold text-page-heading">Rich application data</h3>
              <p className="mt-2 text-sm text-page-body">
                Images, ingredients, user accounts, inventory, expiry dates, notifications, and
                organization verification status.
              </p>
            </div>
          </div>
        </InfoSection>
      </ScrollReveal>

      <ScrollReveal staggerIndex={6}>
        <InfoSection title="Role ecosystem">
          <div className="grid gap-4 sm:grid-cols-2">
            {ROLES.map((role, index) => (
              <ScrollReveal
                key={role.title}
                staggerIndex={index}
                staggerMs={100}
              >
                <div
                  className={clsx(
                    'group flex gap-4 rounded-2xl border border-neutral-200/80 bg-white/90 p-5 dark:border-neutral-600/50 dark:bg-neutral-800/80',
                    HOVER_CARD,
                    'hover:border-primary-200/80 dark:hover:border-primary-600/40',
                  )}
                >
                  <span className="text-2xl motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-105">
                    {role.icon}
                  </span>
                  <div>
                    <h3 className="font-semibold text-page-heading">{role.title}</h3>
                    <p className="mt-1 text-sm text-page-body">{role.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </InfoSection>
      </ScrollReveal>
    </InfoPageLayout>
  );
}
