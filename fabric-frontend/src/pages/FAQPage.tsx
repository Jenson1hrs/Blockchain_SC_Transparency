import { InfoPageLayout } from '../components/InfoPageLayout';
import { Accordion, type AccordionItem } from '../components/Accordion';

const FAQ_ITEMS: AccordionItem[] = [
  {
    id: 'focus',
    question: 'What products is VeriChain designed for?',
    answer:
      'This prototype focuses on cosmetics and skincare authentication for SME manufacturers and consumers. The same platform also supports distributors, retailers, regulators, and admins for traceability and governance.',
  },
  {
    id: 'why-blockchain',
    question: 'Why does VeriChain use blockchain?',
    answer:
      'Blockchain keeps a tamper-evident record of creation, transfers, and key logistics events. Partners and regulators can trust that critical custody history was not edited later.',
  },
  {
    id: 'why-postgres',
    question: 'Why is PostgreSQL still needed?',
    answer:
      'Skincare details such as images, ingredients, allergy notes, usage instructions, expiry dates, and user preferences are stored off-chain so the app stays fast and practical.',
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
      'Ingredients, allergy notes, halal status, usage instructions, photos, organization flags, transfer messages, saved inventory, and alert rules.',
  },
  {
    id: 'qr-prove',
    question: 'What does QR verification prove?',
    answer:
      'A valid QR shows the product ID and batch match a signed hash tied to platform records. It supports authenticity checks for skincare products. It does not judge physical condition and does not stop someone from copying a label.',
  },
  {
    id: 'transfer-accept',
    question: 'Why does transfer require acceptance?',
    answer:
      'Custody only moves when the receiver accepts. This mirrors real handoffs between brand, distributor, and retailer.',
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
      'Expiry dates drive safe, warning, urgent, and expired badges. Saved inventory plus optional profile preferences can trigger personalized skincare safety reminders. Alerts are informational, not medical advice.',
  },
  {
    id: 'regulator-role',
    question: 'What is the role of the regulator?',
    answer:
      'Regulators support governance by reviewing organizations and products, approving or flagging participants, and using transparency views for oversight.',
  },
];

export default function FAQPage() {
  return (
    <InfoPageLayout
      title="Frequently Asked Questions"
      subtitle="Clear answers about cosmetics and skincare verification on VeriChain."
    >
      <Accordion items={FAQ_ITEMS} />
    </InfoPageLayout>
  );
}
