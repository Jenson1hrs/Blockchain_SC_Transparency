import type { UserRole } from '../types';

export type RolePageId =
  | 'transfer'
  | 'create'
  | 'verify'
  | 'location'
  | 'inventory'
  | 'expiring'
  | 'assignedProducts'
  | 'myProducts'
  | 'notifications'
  | 'adminUsers'
  | 'adminSystem'
  | 'regulatorOrgs'
  | 'regulatorProducts'
  | 'regulatorTransparency';

type PageMeta = { title: string; subtitle: string };

const PAGE_META: Record<RolePageId, Partial<Record<UserRole, PageMeta>> & { default: PageMeta }> = {
  transfer: {
    default: { title: 'Transfer custody', subtitle: 'Custody updates on-chain after the receiver accepts.' },
    manufacturer: {
      title: 'Outbound transfers',
      subtitle: 'Send blockchain custody to distributor partners — offers stay pending until accepted.',
    },
    distributor: {
      title: 'Transfer management',
      subtitle: 'Accept inbound manufacturer shipments and forward custody to retailers.',
    },
    retailer: {
      title: 'Incoming transfers',
      subtitle: 'Review incoming transfer requests and accept products into retail custody.',
    },
  },
  create: {
    default: {
      title: 'Register skincare product',
      subtitle: 'Add batch, expiry, and safety metadata on the ledger and generate a traceable QR code.',
    },
  },
  verify: {
    default: {
      title: 'Product verification',
      subtitle: 'Confirm authenticity and review ingredients, expiry, and blockchain-backed history.',
    },
    consumer: {
      title: 'Verify skincare product',
      subtitle:
        'Scan or enter a product ID to check authenticity, expiry, ingredients, and halal or allergy alerts before use.',
    },
    regulator: {
      title: 'Product verification',
      subtitle: 'Read-only inspection of on-chain records and supply-chain workflow events.',
    },
    retailer: {
      title: 'Verify before sale',
      subtitle: 'Confirm authenticity and custody history before displaying products to customers.',
    },
  },
  location: {
    default: {
      title: 'Update location',
      subtitle: 'Record the latest physical location for traceability and audits.',
    },
    distributor: {
      title: 'Logistics locations',
      subtitle: 'Update warehouses, hubs, or checkpoints along the distribution route.',
    },
    retailer: {
      title: 'Store & shelf location',
      subtitle: 'Keep aisle, backroom, and sales-floor locations current for staff and audits.',
    },
  },
  inventory: {
    default: {
      title: 'My inventory',
      subtitle: 'Personal saved products for quick access and safety reminders.',
    },
  },
  expiring: {
    default: {
      title: 'Expiring products',
      subtitle: 'Items approaching expiry within the next seven days.',
    },
    consumer: {
      title: 'Expiry alerts',
      subtitle: 'Saved inventory nearing expiry — act before products are unsafe to use.',
    },
    retailer: {
      title: 'Store expiry watch',
      subtitle: 'Products in retail custody expiring within seven days.',
    },
    distributor: {
      title: 'Logistics expiry watch',
      subtitle: 'Held inventory approaching expiry during distribution.',
    },
    admin: {
      title: 'Platform expiry watch',
      subtitle: 'Platform-wide products nearing expiry within seven days.',
    },
    regulator: {
      title: 'Oversight expiry watch',
      subtitle: 'Platform-wide expiring products for regulatory oversight.',
    },
    manufacturer: {
      title: 'Expiring batches',
      subtitle: 'Your registered skincare products approaching expiry within seven days.',
    },
  },
  assignedProducts: {
    default: {
      title: 'Assigned products',
      subtitle: 'Products currently in your organization’s blockchain custody.',
    },
    distributor: {
      title: 'Held inventory',
      subtitle: 'Products in distributor custody after accepted transfers.',
    },
    retailer: {
      title: 'Retail stock',
      subtitle: 'Products in your store’s blockchain custody — ready for verification and shelf updates.',
    },
  },
  myProducts: {
    default: {
      title: 'Product trust catalogue',
      subtitle:
        'Filter and search your skincare line — consumer trust metadata, custody, expiry, and QR readiness.',
    },
  },
  notifications: {
    default: {
      title: 'Notifications',
      subtitle: 'Transfers, inventory, compliance, and safety alerts for your account.',
    },
  },
  adminUsers: {
    default: {
      title: 'User management',
      subtitle: 'Accounts, roles, and access across the VeriChain platform.',
    },
  },
  adminSystem: {
    default: {
      title: 'System status',
      subtitle: 'API, database, and Hyperledger Fabric connectivity for operational oversight.',
    },
  },
  regulatorOrgs: {
    default: {
      title: 'Organization review',
      subtitle: 'Approve, revoke, or flag supply-chain organizations for compliance.',
    },
  },
  regulatorProducts: {
    default: {
      title: 'Product oversight',
      subtitle: 'Inspect metadata quality and traceability signals across the network.',
    },
  },
  regulatorTransparency: {
    default: {
      title: 'System transparency',
      subtitle: 'Read-only health of API, database, and blockchain services.',
    },
  },
};

export function getRolePageMeta(role: UserRole, page: RolePageId): PageMeta {
  const entry = PAGE_META[page];
  return entry[role] ?? entry.default;
}
