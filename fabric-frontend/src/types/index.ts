export type UserRole =
  | 'admin'
  | 'manufacturer'
  | 'distributor'
  | 'retailer'
  | 'consumer'
  | 'regulator';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  allergies: string | null;
  dietaryPreference: string | null;
  preferredLanguage: string;
  /** Persisted server-side per account (`theme_preference`). */
  themePreference?: 'light' | 'dark';
  companyName?: string | null;
  companyDescription?: string | null;
  companyWebsite?: string | null;
  companyLogoUrl?: string | null;
  companyLocation?: string | null;
}

export interface PublicOrganization {
  id: number;
  name: string;
  role: UserRole;
  companyName: string | null;
  companyDescription: string | null;
  companyWebsite: string | null;
  companyLogoUrl: string | null;
  companyLocation: string | null;
  displayName: string;
  createdAt?: string | null;
  totalProducts?: number;
  metadataCompletionPercent?: number | null;
  verifiedProductCount?: number | null;
  organizationVerified?: boolean;
  verifiedByRegulator?: boolean;
  verificationDate?: string | null;
  organizationFlagged?: boolean;
  organizationFlagReason?: string | null;
  organizationFlaggedAt?: string | null;
}

export interface RegulatorOrganizationRow {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  companyName: string | null;
  companyLocation: string | null;
  companyWebsite: string | null;
  organizationVerified: boolean;
  verifiedByRegulator: boolean;
  verificationDate: string | null;
  organizationFlagged: boolean;
  organizationFlagReason: string | null;
  organizationFlaggedAt: string | null;
  createdAt: string | null;
}

export interface RegulatorProductOversightRow {
  productId: string;
  name: string;
  manufacturer: string;
  manufacturerCompanyName: string;
  manufacturerUserId: number | null;
  batchNumber: string;
  status: string;
  location: string;
  owner: string;
  expiryDate: string | null;
  imageUrl?: string | null;
  metadataComplete: boolean;
  metadataCompletionPercent: number;
  manufacturerOrganizationVerified: boolean;
  manufacturerOrganizationFlagged: boolean;
  flagged: boolean;
}

export interface Product {
  productId: string;
  name: string;
  manufacturer: string;
  manufacturerUserId?: number | null;
  manufacturerCompanyName?: string | null;
  batchNumber: string;
  expiryDate?: string | null;
  imageUrl?: string | null;
  ingredients?: string | null;
  allergyInfo?: string | null;
  halalStatus?: string | null;
  usageInstructions?: string | null;
  location: string;
  owner: string;
  status: 'Manufactured' | 'In Transit' | 'Delivered';
  timestamp: string;
  metadataComplete?: boolean | null;
  metadataCompletionPercent?: number | null;
  metadataMissingFields?: string[];
  manufacturerOrganizationVerified?: boolean;
  manufacturerVerifiedByRegulator?: boolean;
  manufacturerVerificationDate?: string | null;
  manufacturerOrganizationFlagged?: boolean;
  currentOwnerUserId?: number | null;
  currentOwnerRole?: string | null;
  currentOwnerName?: string | null;
  lastTransferredToUserId?: number | null;
  lastTransferredAt?: string | null;
}

export interface ProductHistory {
  txId: string;
  /** Present when API returns protobuf-style time; chaincode may omit. */
  timestamp?: {
    seconds: number;
    nanos?: number;
  };
  data: Product;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  qrCode?: string;
  qrRaw?: string;
  verificationStatus?: 'authentic' | 'fake' | 'not_found' | 'invalid_request' | 'error';
}

export type VerificationStatus = NonNullable<ApiResponse<unknown>['verificationStatus']>;

export interface CreateProductResult {
  product: Product;
  qrCode: string;
  qrRaw: string;
}

export interface ProductQrResult {
  qrCode: string;
  qrUrl: string;
  qrRaw: string;
}

/** Account row returned by GET /admin/users (admin only). */
export interface AdminUserRow {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  preferredLanguage: string;
  createdAt: string;
}

export interface SystemStatusResponse {
  success: boolean;
  timestamp: string;
  api: string;
  database: { status: string; detail?: string };
  blockchain: { status: string; detail?: string };
}

/** GET /dashboard/summary — role-specific payload */
export interface DashboardProductSnippet {
  productId: string;
  name?: string | null;
  manufacturer?: string | null;
  manufacturerCompanyName?: string | null;
  metadataComplete?: boolean;
  metadataCompletionPercent?: number;
  status?: string | null;
  location?: string | null;
  owner?: string | null;
  timestamp?: string | null;
  expiryDate?: string | null;
  batchNumber?: string | null;
}

export interface DashboardRecentUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string | null;
}

export interface AdminDashboardSummary {
  totalUsers: number;
  usersByRole: Partial<Record<UserRole, number>>;
  totalProducts: number;
  apiStatus: string;
  databaseStatus: string;
  databaseDetail?: string;
  blockchainStatus: string;
  blockchainDetail?: string;
  recentUsers?: DashboardRecentUser[];
}

export interface ManufacturerDashboardSummary {
  totalProducts: number;
  productsByStatus: Record<string, number>;
  recentProducts: DashboardProductSnippet[];
  missingMetadataCount: number;
  metadataCompletionPercent?: number;
  recentIncompleteProducts?: DashboardProductSnippet[];
  qrSupportedProductsCount?: number;
}

export interface DashboardLocationCount {
  location: string;
  count: number;
}

export interface DistributorDashboardSummary {
  assignedProductsCount?: number;
  inTransitProductsCount: number;
  recentTransfersOrUpdatedProducts: DashboardProductSnippet[];
  productsByLocation: DashboardLocationCount[];
  transferRelatedStatusCount?: Record<string, number>;
}

export interface RetailerDashboardSummary {
  assignedProductsCount?: number;
  productsAtRetailLocationsCount: number;
  expiringSoonCount: number;
  recentlyUpdatedProducts: DashboardProductSnippet[];
  productsByStatus: Record<string, number>;
}

export interface DashboardInventoryItem {
  id: number;
  productId: string;
  addedAt: string | null;
  productName: string | null;
  status: string | null;
  expiryDate: string | null;
}

export interface ConsumerDashboardSummary {
  inventoryCount: number;
  expiringSoonCount: number;
  expiredCount: number;
  allergyAlertCount: number;
  recentInventoryItems: DashboardInventoryItem[];
}

export interface RegulatorDashboardSummary {
  verifiedOrganizationsCount: number;
  pendingOrganizationsCount: number;
  incompleteMetadataProductCount: number;
  flaggedProductCount: number;
  totalTraceableProducts: number;
  databaseStatus: string;
  blockchainStatus: string;
  apiStatus: string;
}

export type DashboardSummaryData =
  | AdminDashboardSummary
  | ManufacturerDashboardSummary
  | DistributorDashboardSummary
  | RetailerDashboardSummary
  | ConsumerDashboardSummary
  | RegulatorDashboardSummary;

export interface DashboardSummaryResponse {
  success: boolean;
  role: UserRole;
  data: DashboardSummaryData;
}