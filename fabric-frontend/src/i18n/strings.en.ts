/**
 * Base UI strings (English). Other locales merge overrides on top.
 */
export const STRINGS_EN: Record<string, string> = {
  // Nav
  'nav.home': 'Home',
  'nav.verify': 'Verify',
  'nav.users': 'Users',
  'nav.system': 'System',
  'nav.profile': 'Profile',
  'nav.login': 'Login',
  'nav.register': 'Register',
  'nav.create': 'Create',
  'nav.transfer': 'Transfer',
  'nav.location': 'Location',
  'nav.expiring': 'Expiring Soon',
  'nav.myProducts': 'My registered products',
  'nav.assignedProducts': 'Assigned Products',
  'nav.inventory': 'Inventory',
  'nav.regulatorOrgs': 'Organizations',
  'nav.regulatorProducts': 'Products',
  'nav.regulatorTransparency': 'Transparency',

  'shell.profileSettings': 'Profile / Settings',
  'shell.logout': 'Logout',
  'shell.signInBlurb':
    'to access supply-chain tools or your inventory (role-based).',
  'shell.signInLink': 'Sign in',
  'shell.themeLight': 'Light',
  'shell.themeDark': 'Dark',
  'shell.themeUseLight': 'Switch to light mode',
  'shell.themeUseDark': 'Switch to dark mode',

  // Profile
  'profile.shellTitle': 'Profile / Settings',
  'profile.shellSubtitle': 'Manage your account details and preferences',
  'profile.shellSubtitle.admin': 'Account, language, and display settings for platform administration.',
  'profile.shellSubtitle.manufacturer': 'Account and display settings for product registration.',
  'profile.shellSubtitle.distributor': 'Account and display settings for logistics workflows.',
  'profile.shellSubtitle.retailer': 'Account and display settings for retail operations.',
  'profile.shellSubtitle.consumer': 'Account, health preferences, and display settings.',
  'profile.pageTitle': 'Profile Settings',
  'profile.pageIntro': 'Update your account information and preferences',
  'profile.pageIntro.admin': 'Manage your name and how the admin workspace is displayed.',
  'profile.pageIntro.manufacturer':
    'Manage your account, public organization profile, and display options. New products are linked to your manufacturer account automatically.',
  'profile.pageIntro.distributor': 'Manage your name and display options for transfer and location workflows.',
  'profile.pageIntro.retailer': 'Manage your name and display options for store-level verification and updates.',
  'profile.pageIntro.consumer': 'Manage your account, allergy and dietary preferences for safety alerts, and display options.',
  'profile.sectionAccount': 'Account Information',
  'profile.sectionConsumerHealth': 'Health & safety',
  'profile.sectionConsumerHealthIntro':
    'Optional. Used for personalized alerts when you verify or save products to your inventory.',
  'profile.sectionDisplay': 'Display & language',
  'profile.fullName': 'Full name',
  'profile.fullNamePh': 'Enter your full name',
  'profile.email': 'Email address',
  'profile.emailHint': 'Email cannot be changed',
  'profile.role': 'Role',
  'profile.roleHint': 'Role is assigned by administrators',
  'profile.roleHint.admin': 'Administrator — user and system tools are available from the navigation bar.',
  'profile.roleHint.manufacturer':
    'Manufacturer — products you create are linked to your account and public organization profile.',
  'profile.roleHint.distributor': 'Distributor — use transfer and location pages to update custody and movement.',
  'profile.roleHint.retailer': 'Retailer — verify products and update store locations before sale.',
  'profile.roleHint.consumer': 'Consumer — scan, verify, and save products to your personal inventory.',
  'profile.workspaceNote.admin': 'Use Users and System in the menu for account oversight and health checks.',
  'profile.workspaceNote.manufacturer':
    'Set your company name and description so consumers can view your public organization page from product verification.',
  'profile.sectionOrganization': 'Organization profile',
  'profile.sectionOrganizationIntro':
    'Shown on your public organization page when consumers verify products you manufacture.',
  'profile.companyName': 'Company name',
  'profile.companyNamePh': 'e.g. Acme Foods Ltd',
  'profile.companyDescription': 'Company description',
  'profile.companyDescriptionPh': 'Tell consumers about your brand and certifications…',
  'profile.companyWebsite': 'Website',
  'profile.companyLogo': 'Company logo',
  'profile.companyLogoHint': 'PNG or JPG, max 2 MB. Shown on your public organization page after you save.',
  'profile.companyLogoEmpty': 'No logo yet',
  'profile.companyLogoRemove': 'Remove logo',
  'profile.companyLogoPreviewLink': 'Preview public organization page',
  'profile.companyLogoInvalidType': 'Please choose an image file (PNG or JPG).',
  'profile.companyLogoTooLarge': 'Image too large. Please pick a file of 2 MB or less.',
  'profile.companyLogoReadFailed': 'Could not read the selected image. Try another file.',
  'profile.companyLocation': 'Location',
  'profile.companyLocationPh': 'City, country',
  'profile.workspaceNote.distributor':
    'Record ownership transfers and location updates so downstream partners can trace shipments.',
  'profile.workspaceNote.retailer':
    'Verify products on receipt and keep shelf or store locations current for traceability.',
  'profile.sectionPrefs': 'Preferences',
  'profile.allergies': 'Allergies',
  'profile.allergiesPh': 'e.g. peanuts, shellfish',
  'profile.allergiesFormatHint':
    'Enter allergies separated by commas, e.g. milk, peanuts, soy.',
  'profile.dietary': 'Dietary preference',
  'profile.dietaryPh': 'e.g. vegetarian, halal',
  'profile.language': 'Preferred language',
  'profile.languageHint': 'Selected: {{label}} ({{code}})',
  'profile.fontSize': 'Interface font size',
  'profile.fontSizeHint': 'Applies across the app on this device.',
  'profile.fontDefault': 'Default',
  'profile.fontLarge': 'Large',
  'profile.fontLarger': 'Larger',
  'profile.fontLargest': 'Largest',
  'profile.save': 'Save changes',
  'profile.saving': 'Saving changes...',
  'profile.success': 'Profile updated successfully.',
  'profile.nameRequired': 'Name is required',

  // Workspace (signed-in home / role dashboard)
  'workspace.dashboardTitle': 'Dashboard',
  'workspace.helloUser': 'Hello, {{name}}',
  'workspace.quickActions': 'Quick actions',
  'workspace.quickActionsHint': 'Shortcuts to primary workflows for your role.',
  'workspace.refreshAnalytics': 'Refresh',
  'workspace.refreshingAnalytics': 'Refreshing…',
  'workspace.welcome': 'Welcome, {{name}}',
  'workspace.subAdmin':
    'Admin — monitor system health, manage user accounts, and use the same verification tools as other roles where permitted.',
  'workspace.subConsumer':
    'Consumer — verify authenticity, save items to your inventory, and watch expiry dates for products you care about.',
  'workspace.subManufacturer':
    'Manufacturer — register products on the ledger, generate QR codes, and trace items through the supply chain.',
  'workspace.subDistributor':
    'Distributor — record transfers between partners and update logistics locations as goods move.',
  'workspace.subRetailer':
    'Retailer — receive stock, verify before sale, and keep store or shelf locations up to date.',
  'workspace.footerConsumer':
    'Shortcuts reflect what you can do as a consumer. Anything not listed is restricted by your role or hidden in the menu.',
  'workspace.footerDistributor':
    'Transfers and location updates are recorded for traceability. Use Verify anytime to confirm a product’s history.',
  'workspace.footerRetailer':
    'Use shortcuts below for receiving, verification, and location updates. Your menu only shows actions your retailer account is allowed to perform.',

  // Dashboard (/home) cards — English defaults; other locales override by key in `strings.<locale>.ts`.
  'dash.admin.users.t': 'Manage Users',
  'dash.admin.users.d': 'View accounts, roles, and language preferences.',
  'dash.admin.dist.t': 'Role distribution',
  'dash.admin.dist.d': 'Summary of registered accounts by role (on Users page).',
  'dash.admin.chain.t': 'Blockchain status',
  'dash.admin.chain.d': 'Fabric gateway and channel connectivity.',
  'dash.admin.api.t': 'API status',
  'dash.admin.api.d': 'REST API reachability and timestamps.',
  'dash.admin.db.t': 'Database status',
  'dash.admin.db.d': 'PostgreSQL connection used for accounts.',

  'dash.regulator.orgs.t': 'Review Organizations',
  'dash.regulator.orgs.d': 'Approve or revoke verification for supply-chain organizations.',
  'dash.regulator.products.t': 'Review Products',
  'dash.regulator.products.d': 'Inspect metadata completeness and flagged traceability items.',
  'dash.regulator.transparency.t': 'System Transparency',
  'dash.regulator.transparency.d': 'Read-only API, database, and blockchain health overview.',
  'dash.regulator.verify.t': 'Verify Product',
  'dash.regulator.verify.d': 'Inspect on-chain history and product details (read-only).',
  'profile.shellSubtitle.regulator': 'Account and display settings for regulatory oversight.',
  'profile.pageIntro.regulator': 'Manage your account and display preferences for compliance workflows.',
  'profile.roleHint.regulator':
    'Regulator — oversee organization verification and product metadata quality. Cannot create or transfer products.',
  'profile.workspaceNote.regulator':
    'Use Organizations and Products in the menu to approve entities and review flagged items.',
  'dash.mfg.create.t': 'Create Product',
  'dash.mfg.create.d': 'Register on the ledger, upload metadata, and generate a QR code.',
  'dash.mfg.products.t': 'My registered products',
  'dash.mfg.products.d':
    'Products you registered on this manufacturer account — status counts and metadata completion (not matched by company name alone).',
  'dash.mfg.trace.t': 'Verify & Trace',
  'dash.mfg.trace.d': 'Look up any product — authenticity, metadata, QR, and chain history in one place.',
  'dash.mfg.profile.t': 'Profile & Settings',
  'dash.mfg.profile.d': 'Account details and preferences.',
  'mfgProducts.title': 'My registered products',
  'mfgProducts.subtitle':
    'Products linked to your manufacturer login (registered by your account only). Older items without that link do not appear here.',
  'mfgProducts.total': 'Total products',
  'mfgProducts.metaCompletion': 'Metadata completion',
  'mfgProducts.missingMeta': 'Incomplete metadata',
  'mfgProducts.qrReady': 'QR-ready',
  'mfgProducts.byStatus': 'By status',
  'mfgProducts.recentTitle': 'Recent products',
  'mfgProducts.recentHint':
    'Latest items registered under your manufacturer account (PostgreSQL cache; filtered by account, not display name).',
  'mfgProducts.empty': 'No products yet. Create your first product to get started.',
  'mfgProducts.openVerify': 'Verify & details',
  'mfgProducts.openQr': 'View QR',

  'assignedProducts.titleDistributor': 'Assigned Products',
  'assignedProducts.subtitleDistributor': 'Products currently assigned to your distributor account',
  'assignedProducts.titleRetailer': 'Assigned Products',
  'assignedProducts.subtitleRetailer': 'Products currently assigned to your retailer account',
  'assignedProducts.empty': 'No products are assigned to your organization yet.',
  'assignedProducts.count': '{count} product(s) assigned to you',

  'dash.distributor.transfer.t': 'Shipment transfer',
  'dash.distributor.transfer.d':
    'Transfer ownership to the next logistics or retail partner (warehouse handoff).',
  'dash.distributor.location.t': 'Warehouse & distribution locations',
  'dash.distributor.location.d':
    'Update docks, warehouses, hubs, or checkpoints along the distribution route.',
  'dash.distributor.verify.t': 'Verify product',
  'dash.distributor.verify.d':
    'Confirm authenticity during inbound and outbound handling.',
  'dash.distributor.history.t': 'Supply chain history',
  'dash.distributor.history.d':
    'Full timeline from manufacture—trace shipments and custody changes.',

  'dash.retailer.transfer.t': 'Receiving & ownership handoff',
  'dash.retailer.transfer.d':
    'Record transfers when goods arrive at store or move between retail locations.',
  'dash.retailer.location.t': 'Store & shelf location',
  'dash.retailer.location.d':
    'Update aisle, backroom, or sales-floor locations for staff and audits.',
  'dash.retailer.verify.t': 'Verify before sale',
  'dash.retailer.verify.d':
    'Confirm authenticity before displaying or selling to customers.',
  'dash.retailer.history.t': 'Product journey',
  'dash.retailer.history.d':
    'Review chain history on the verify screen after lookup.',

  'dash.cons.verify.t': 'Verify Product',
  'dash.cons.verify.d': 'Verify product authenticity before purchase.',
  'dash.cons.inventory.t': 'My Inventory',
  'dash.cons.inventory.d': 'Saved products from scans.',
  'dash.cons.expiring.t': 'Expiring Soon',
  'dash.cons.expiring.d': 'Countdown alerts for expiry.',
  'dash.cons.profile.t': 'Profile / Preferences',
  'dash.cons.profile.d': 'Language, dietary, and allergy preferences.',

  // Protected route
  'common.loading': 'Loading…',
  'common.loadingSession': 'Checking session',
  'common.accessDenied': 'Access denied: your role cannot use this feature.',
  'common.accessDeniedTitle': 'Access denied',
  'common.accessDeniedSub': 'Role restriction',

  // Login
  'auth.signInTitle': 'Sign in',
  'auth.signInSubtitle': 'Application account (not Fabric identity)',
  'auth.welcomeBack': 'Welcome back',
  'auth.signInContinue': 'Sign in to your account to continue',
  'auth.email': 'Email address',
  'auth.emailPh': 'Enter your email',
  'auth.password': 'Password',
  'auth.passwordPh': 'Enter your password',
  'auth.submit': 'Sign in',
  'auth.submitting': 'Signing in...',
  'auth.needAccount': "Don't have an account?",
  'auth.createAccountLink': 'Create one here',
  'auth.flashLogin': 'Welcome back, {{name}}. Login successful.',
  'auth.flashRegister': 'Registration successful. Welcome, {{name}}.',
  'auth.signInAfterRegister': 'Account created. Please sign in with your email and password.',

  // Register
  'auth.registerTitle': 'Create account',
  'auth.registerSubtitle': 'Preferences are stored for your profile only',
  'auth.createHeading': 'Create your account',
  'auth.createIntro': 'Join our supply chain transparency platform',
  'auth.accountSection': 'Account Information',
  'auth.registerSubmit': 'Create account',
  'auth.registering': 'Creating account...',
  'auth.regRole': 'Role',
  'auth.regPreferredLang': 'Preferred language',
  'auth.regAllergies': 'Allergies',
  'auth.regDietary': 'Dietary preference',
  'auth.passwordMin': 'Password (min 6 characters)',
  'auth.roleConsumer': 'Consumer',
  'auth.roleManufacturer': 'Manufacturer',
  'auth.roleDistributor': 'Distributor',
  'auth.roleRetailer': 'Retailer',
  'auth.roleAdmin': 'Admin',
  'auth.roleRegulator': 'Regulator (oversight)',
  'auth.optionalTag': '(optional)',
  'auth.regPreferences': 'Preferences',
  'auth.passwordCreatePh': 'Create a secure password',
  'auth.passwordHelper': 'At least 6 characters',
  'auth.roleWarning':
    'For prototype testing only. In real deployment, roles are approved by an administrator.',
  'auth.haveAccount': 'Already have an account?',
  'auth.signInHere': 'Sign in here',
  'auth.regLanguageHint': 'Selected: {{label}} ({{code}})',

  // Landing — nav & hero
  'landing.brand': 'BlockChain Supply',
  'landing.tagline': 'Anti-counterfeit supply chain',
  'landing.signIn': 'Sign in',
  'landing.getStarted': 'Get Started',
  'landing.welcomeUser': 'Welcome, {{name}}',
  'landing.heroLine1': 'Blockchain-powered anti-counterfeit',
  'landing.heroLine2': 'supply chain protection',
  'landing.heroSub':
    'Verify products instantly, trace every movement, and keep expiry workflow predictable with premium blockchain transparency.',
  'landing.ctaVerify': '🚀 Verify Product',
  'landing.ctaAccount': 'Create Account',
  'landing.cardScanTitle': 'Scan & Verify',
  'landing.cardScanSub': 'Instant QR verification with blockchain security.',
  'landing.cardTraceTitle': 'Traceability',
  'landing.cardTraceSub': 'Complete product journey from manufacture to sale.',
  'landing.cardExpiryTitle': 'Expiry Alerts',
  'landing.cardExpirySub': 'Stay ahead of expiry with in-app notifications.',

  'landing.featuresHeading': 'Powerful Features for Modern Supply Chains',
  'landing.featuresSub':
    'Comprehensive blockchain-powered solution for manufacturers, distributors, retailers, and consumers',

  'landing.feat1t': 'Blockchain Security',
  'landing.feat1x':
    'Tamper-resistant ledger ensures product authenticity and supply chain integrity',
  'landing.feat2t': 'QR Verification',
  'landing.feat2x':
    'Instant verification with route-safe deep links and mobile-optimized QR codes',
  'landing.feat3t': 'Expiry Alerts',
  'landing.feat3x': 'Proactive countdown reminders for expiry management and quality assurance',
  'landing.feat4t': 'Smart Inventory',
  'landing.feat4x': 'Personal inventory tracking with expiry monitoring and product history',
  'landing.feat5t': 'Supply Chain Traceability',
  'landing.feat5x': 'Complete visibility of product journey from manufacturer to consumer',
  'landing.feat6t': 'Real-time Updates',
  'landing.feat6x': 'Instant notifications for ownership transfers and location updates',

  'landing.howHeading': 'How It Works',
  'landing.howSub': 'Simple 5-step process for complete supply chain transparency',
  'landing.step1t': 'Create',
  'landing.step1d': 'Manufacturer registers product on blockchain',
  'landing.step2t': 'QR Code',
  'landing.step2d': 'Unique QR code generated for verification',
  'landing.step3t': 'Scan',
  'landing.step3d': 'Consumer scans QR to verify authenticity',
  'landing.step4t': 'Verify',
  'landing.step4d': 'Blockchain confirms product legitimacy',
  'landing.step5t': 'Track',
  'landing.step5d': 'Monitor supply chain history and expiry',

  'landing.rolesHeading': 'Built for Every Supply Chain Role',
  'landing.rolesSub':
    'Tailored experiences for manufacturers, distributors, retailers, and consumers',
  'landing.roleManu': 'Manufacturer',
  'landing.roleManuD':
    'Creates product records and generates traceable QR verification links.',
  'landing.roleDist': 'Distributor / Retailer',
  'landing.roleDistD':
    'Transfers ownership and updates product location through each logistics stage.',
  'landing.roleCons': 'Consumer',
  'landing.roleConsD':
    'Verifies authenticity, tracks product details, and manages personal inventory.',

  'landing.showHeading': 'Experience the Platform',
  'landing.showSub':
    'Discover key features that make supply chain verification effortless',
  'landing.show1t': 'QR Verification',
  'landing.show1d':
    'Scan any product QR code to instantly verify authenticity and view complete supply chain history.',
  'landing.show1f1': 'Instant verification',
  'landing.show1f2': 'Supply chain history',
  'landing.show1f3': 'Product details',
  'landing.show1f4': 'Authenticity check',
  'landing.show2t': 'Expiry Management',
  'landing.show2d':
    'Stay ahead of expiry dates with smart reminders and proactive inventory management.',
  'landing.show2f1': 'Expiry countdown',
  'landing.show2f2': 'Smart alerts',
  'landing.show2f3': 'Batch management',
  'landing.show2f4': 'Quality assurance',
  'landing.show3t': 'Inventory Control',
  'landing.show3d':
    'Manage your personal product inventory with expiry tracking and easy organization.',
  'landing.show3f1': 'Personal inventory',
  'landing.show3f2': 'Expiry tracking',
  'landing.show3f3': 'Product organization',
  'landing.show3f4': 'Quick access',

  'landing.ctaHeading': 'Ready to transform your supply chain?',
  'landing.ctaSub':
    'Join businesses ensuring product authenticity, safe inventory, and consumer trust with blockchain-powered verification.',
  'landing.ctaFree': 'Get Started Free',
  'landing.ctaTry': 'Try Verification',

  'landing.footerBlurb':
    'Revolutionizing supply chain transparency with blockchain technology. Ensuring authenticity, traceability, and consumer trust.',
  'landing.footerPlatform': 'Platform',
  'landing.footerCompany': 'Company',
  'landing.footerVerify': 'Verify Product',
  'landing.footerInventory': 'Inventory',
  'landing.footerExpiry': 'Expiry Alerts',
  'landing.footerCreate': 'Create Product',
  'landing.footerSignIn': 'Sign In',
  'landing.footerRegister': 'Register',
  'landing.footerProfile': 'Profile',
  'landing.footerFyp': 'Final Year Project',
  'landing.footerCopy':
    '© 2024 BlockChain Supply. Final Year Project Demo. Built with blockchain technology.',

  'landing.langLabel': 'Language',
};
