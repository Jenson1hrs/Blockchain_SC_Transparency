import { InfoPageLayout } from '../components/InfoPageLayout';
import { Accordion, type AccordionItem } from '../components/Accordion';

const FAQ_ITEMS: AccordionItem[] = [
  {
    id: 'why-blockchain',
    question: 'Why does VeriChain use blockchain?',
    answer:
      'Blockchain keeps a tamper-evident record of creation, transfers, and key logistics events. Partners and regulators can trust that critical history was not edited later.',
  },
  {
    id: 'why-postgres',
    question: 'Why is PostgreSQL still needed?',
    answer:
      'Not every field belongs on-chain. The database stores images, user accounts, transfer workflow, inventory, expiry dates, and notifications so the app stays fast.',
  },
  {
    id: 'on-chain',
    question: 'What data is stored on-chain?',
    answer:
      'Product identity, manufacturer, batch, status, ownership changes, and location updates that form the auditable custody trail.',
  },
  {
    id: 'off-chain',
    question: 'What data is stored off-chain?',
    answer:
      'Ingredients, allergy notes, photos, organization flags, transfer messages, saved inventory, and alert rules.',
  },
  {
    id: 'qr-prove',
    question: 'What does QR verification prove?',
    answer:
      'A valid QR shows the product ID and batch match a signed hash tied to platform records. It supports authenticity checks. It does not judge physical condition.',
  },
  {
    id: 'transfer-accept',
    question: 'Why does transfer require acceptance?',
    answer:
      'Custody only moves when the receiver accepts. This mirrors real handoffs and prevents silent reassignment.',
  },
  {
    id: 'consumer-ownership',
    question: 'Can consumers change product ownership?',
    answer:
      'No. Consumers verify products and keep a personal inventory. Blockchain ownership changes only through the supply-chain workflow.',
  },
  {
    id: 'tampered-qr',
    question: 'What happens when a QR code is tampered with?',
    answer:
      'If the hash or batch fails validation, verification fails and a warning is shown. Repeated fake scans can alert regulators.',
  },
  {
    id: 'expiry-allergy',
    question: 'How do expiry and allergy alerts work?',
    answer:
      'Expiry dates drive safe, warning, urgent, and expired badges. Saved inventory plus optional profile preferences can trigger personalized reminders.',
  },
  {
    id: 'regulator-role',
    question: 'What is the role of the regulator?',
    answer:
      'Regulators review organizations and products, approve or flag participants, and use transparency views for oversight.',
  },
];

export default function FAQPage() {
  return (
    <InfoPageLayout
      title="Frequently Asked Questions"
      subtitle="Clear answers about how VeriChain works."
    >
      <Accordion items={FAQ_ITEMS} />
    </InfoPageLayout>
  );
}
