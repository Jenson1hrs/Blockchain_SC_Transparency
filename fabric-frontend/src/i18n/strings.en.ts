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
  'nav.inventory': 'Inventory',

  'shell.profileSettings': 'Profile / Settings',
  'shell.logout': 'Logout',
  'shell.signInBlurb':
    'to access supply-chain tools or your inventory (role-based).',
  'shell.signInLink': 'Sign in',

  // Profile
  'profile.shellTitle': 'Profile / Settings',
  'profile.shellSubtitle': 'Manage your account details and preferences',
  'profile.pageTitle': 'Profile Settings',
  'profile.pageIntro': 'Update your account information and preferences',
  'profile.sectionAccount': 'Account Information',
  'profile.fullName': 'Full name',
  'profile.fullNamePh': 'Enter your full name',
  'profile.email': 'Email address',
  'profile.emailHint': 'Email cannot be changed',
  'profile.role': 'Role',
  'profile.roleHint': 'Role is assigned by administrators',
  'profile.sectionPrefs': 'Preferences',
  'profile.allergies': 'Allergies',
  'profile.allergiesPh': 'e.g. peanuts, shellfish',
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

  // Workspace
  'workspace.welcome': 'Welcome, {{name}}',
  'workspace.subAdmin': 'Administrator workspace — platform health and user management',
  'workspace.subRole': 'Your workspace ({{role}}) — quick links to features you can use',
  'workspace.subDistributor':
    'Distribution workspace — warehouse movement, shipment transfers, and logistics locations.',
  'workspace.subRetailer':
    'Retail workspace — receiving, verifying before sale, and store or shelf locations.',
  'workspace.footerAdmin':
    'Administrator shortcuts focus on platform operations and health. Product-chain routes remain available by URL when needed; permissions are unchanged.',
  'workspace.footerUser':
    'One signed-in home for everyone: shortcuts here match your role. Routes and permissions still enforce what you can open (navbar + API).',

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
  'dash.admin.audit.t': 'System audit / logs',
  'dash.admin.audit.d': 'Placeholder for future audit trail integration.',
  'dash.admin.config.t': 'Configuration notes',
  'dash.admin.config.d': 'Operator notes for deployment and Fabric setup.',

  'dash.mfg.create.t': 'Create Product',
  'dash.mfg.create.d': 'Register product metadata and generate QR.',
  'dash.mfg.qr.t': 'View Product QR',
  'dash.mfg.qr.d': 'Verify by product ID, then open QR view.',
  'dash.mfg.meta.t': 'Product Metadata',
  'dash.mfg.meta.d': 'Inspect registered fields after verification.',
  'dash.mfg.verify.t': 'Verify Product',
  'dash.mfg.verify.d': 'Check authenticity and supply-chain history.',

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
  'landing.cardExpirySub': 'Stay ahead of expiry with email-ready reminders.',

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
