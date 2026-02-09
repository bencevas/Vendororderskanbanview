export type Locale = 'en' | 'hu';

export const translations = {
  en: {
    // Header & Navigation
    orderManagement: 'Order Management',
    byOrder: 'By Order',
    byItem: 'By Item',
    testOrder: '+ Test Order',
    test: '+ Test',
    refreshOrders: 'Refresh orders',
    showing: 'Showing',
    
    // Days
    today: 'Today',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    
    // Order Card
    items: 'items',
    item: 'item',
    noOrdersScheduled: 'No orders scheduled',
    
    // Status
    pending: 'pending',
    confirmed: 'confirmed',
    processing: 'processing',
    ready: 'ready',
    
    // Order Details Modal
    customer: 'Customer',
    deliveryDate: 'Delivery Date',
    loadingOrderItems: 'Loading order items...',
    errorLoadingItems: 'Error Loading Items',
    price: 'Price',
    total: 'Total',
    was: 'was',
    confirmAvailability: 'Confirm availability',
    denyAvailability: 'Deny availability',
    clickToRevert: 'Click to revert',
    ok: 'OK',
    no: 'No',
    denied: 'Denied',
    itemsConfirmed: 'items confirmed',
    of: 'of',
    itemsDenied: 'item(s) denied',
    orderTotal: 'Order Total',
    close: 'Close',
    saveChanges: 'Save Changes',
    
    // Batch View
    batchProcessing: 'Batch Processing',
    itemsGroupedByType: 'Items grouped by type for batch preparation',
    loadingBatchItems: 'Loading batch items...',
    noItemsFound: 'No items found for this date',
    orders: 'orders',
    order: 'order',
    confirmAll: 'Confirm All',
    confirm: 'Confirm',
    deny: 'Deny',
    
    // Profile Menu
    guestUser: 'Guest User',
    notSignedIn: 'Not signed in',
    superAdmin: 'Super Admin',
    storeOwner: 'Store Owner',
    teamMember: 'Team Member',
    myProfile: 'My Profile',
    settings: 'Settings',
    helpSupport: 'Help & Support',
    signOut: 'Sign Out',
    welcome: 'Welcome',
    signInToManage: 'Sign in to manage orders',
    signIn: 'Sign In',
    authNotConfigured: 'Authentication not configured.',
    setupSupabase: 'Set up Supabase to enable login.',
    
    // Login Form
    signInTitle: 'Sign In',
    createAccount: 'Create Account',
    email: 'Email',
    password: 'Password',
    fullName: 'Full Name',
    signingIn: 'Signing in...',
    creatingAccount: 'Creating account...',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    supabaseNotConfigured: 'Supabase is not configured',
    createEnvFile: 'Please create a',
    fileWith: 'file with',
    
    // Test Generator
    testPayloadGenerator: 'Test Payload Generator',
    generateShopifyOrders: 'Generate Shopify-like test orders',
    store: 'Store',
    selectStore: 'Select a store',
    noStoresAvailable: 'No stores available',
    customerName: 'Customer Name',
    customerEmail: 'Customer Email',
    optional: 'optional',
    orderItems: 'Order Items',
    productName: 'Product Name',
    quantity: 'Quantity',
    unit: 'Unit',
    pricePerUnit: 'Price per Unit',
    addItem: 'Add Item',
    removeItem: 'Remove Item',
    deliveryDateLabel: 'Delivery Date',
    generatedPayload: 'Generated Payload',
    copyPayload: 'Copy Payload',
    copied: 'Copied!',
    submitToSupabase: 'Submit to Supabase',
    submitting: 'Submitting...',
    orderCreatedSuccess: 'Order created successfully!',
    
    // Loading & Errors
    loadingOrders: 'Loading orders...',
    errorLoadingOrders: 'Error Loading Orders',
    retry: 'Retry',
    failedToSave: 'Failed to save changes. Please try again.',
    
    // Settings
    language: 'Language',
    english: 'English',
    hungarian: 'Magyar',
    saveSettings: 'Save',
    settingsTitle: 'Settings',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    auto: 'Auto',
  },
  
  hu: {
    // Header & Navigation
    orderManagement: 'Rendeléskezelés',
    byOrder: 'Rendelés szerint',
    byItem: 'Termék szerint',
    testOrder: '+ Teszt rendelés',
    test: '+ Teszt',
    refreshOrders: 'Rendelések frissítése',
    showing: 'Megjelenítve',
    
    // Days
    today: 'Ma',
    monday: 'Hétfő',
    tuesday: 'Kedd',
    wednesday: 'Szerda',
    thursday: 'Csütörtök',
    friday: 'Péntek',
    saturday: 'Szombat',
    sunday: 'Vasárnap',
    
    // Order Card
    items: 'termék',
    item: 'termék',
    noOrdersScheduled: 'Nincs ütemezett rendelés',
    
    // Status
    pending: 'függőben',
    confirmed: 'megerősítve',
    processing: 'feldolgozás alatt',
    ready: 'kész',
    
    // Order Details Modal
    customer: 'Vevő',
    deliveryDate: 'Szállítási dátum',
    loadingOrderItems: 'Rendelési tételek betöltése...',
    errorLoadingItems: 'Hiba a tételek betöltésekor',
    price: 'Ár',
    total: 'Összesen',
    was: 'eredetileg:',
    confirmAvailability: 'Elérhetőség megerősítése',
    denyAvailability: 'Elérhetőség elutasítása',
    clickToRevert: 'Kattints a visszavonáshoz',
    ok: 'OK',
    no: 'Nem',
    denied: 'Elutasítva',
    itemsConfirmed: 'tétel megerősítve',
    of: '/',
    itemsDenied: 'tétel elutasítva',
    orderTotal: 'Rendelés összesen',
    close: 'Bezárás',
    saveChanges: 'Változások mentése',
    
    // Batch View
    batchProcessing: 'Kötegelt feldolgozás',
    itemsGroupedByType: 'Tételek típus szerint csoportosítva a kötegelt előkészítéshez',
    loadingBatchItems: 'Kötegelt tételek betöltése...',
    noItemsFound: 'Nem található tétel erre a napra',
    orders: 'rendelés',
    order: 'rendelés',
    confirmAll: 'Összes megerősítése',
    confirm: 'Megerősít',
    deny: 'Elutasít',
    
    // Profile Menu
    guestUser: 'Vendég',
    notSignedIn: 'Nincs bejelentkezve',
    superAdmin: 'Szuper Admin',
    storeOwner: 'Bolt tulajdonos',
    teamMember: 'Csapattag',
    myProfile: 'Profilom',
    settings: 'Beállítások',
    helpSupport: 'Súgó és támogatás',
    signOut: 'Kijelentkezés',
    welcome: 'Üdvözöljük',
    signInToManage: 'Jelentkezz be a rendelések kezeléséhez',
    signIn: 'Bejelentkezés',
    authNotConfigured: 'Hitelesítés nincs beállítva.',
    setupSupabase: 'Állítsd be a Supabase-t a bejelentkezéshez.',
    
    // Login Form
    signInTitle: 'Bejelentkezés',
    createAccount: 'Fiók létrehozása',
    email: 'E-mail',
    password: 'Jelszó',
    fullName: 'Teljes név',
    signingIn: 'Bejelentkezés...',
    creatingAccount: 'Fiók létrehozása...',
    noAccount: 'Nincs még fiókod?',
    haveAccount: 'Már van fiókod?',
    supabaseNotConfigured: 'A Supabase nincs beállítva',
    createEnvFile: 'Kérlek hozz létre egy',
    fileWith: 'fájlt a következő tartalommal',
    
    // Test Generator
    testPayloadGenerator: 'Teszt adat generátor',
    generateShopifyOrders: 'Shopify-szerű teszt rendelések generálása',
    store: 'Bolt',
    selectStore: 'Válassz boltot',
    noStoresAvailable: 'Nincs elérhető bolt',
    customerName: 'Vevő neve',
    customerEmail: 'Vevő e-mail címe',
    optional: 'opcionális',
    orderItems: 'Rendelési tételek',
    productName: 'Termék neve',
    quantity: 'Mennyiség',
    unit: 'Egység',
    pricePerUnit: 'Egységár',
    addItem: 'Tétel hozzáadása',
    removeItem: 'Tétel eltávolítása',
    deliveryDateLabel: 'Szállítási dátum',
    generatedPayload: 'Generált adat',
    copyPayload: 'Másolás',
    copied: 'Másolva!',
    submitToSupabase: 'Küldés Supabase-be',
    submitting: 'Küldés...',
    orderCreatedSuccess: 'Rendelés sikeresen létrehozva!',
    
    // Loading & Errors
    loadingOrders: 'Rendelések betöltése...',
    errorLoadingOrders: 'Hiba a rendelések betöltésekor',
    retry: 'Újra',
    failedToSave: 'A mentés sikertelen. Kérlek próbáld újra.',
    
    // Settings
    language: 'Nyelv',
    english: 'English',
    hungarian: 'Magyar',
    saveSettings: 'Mentés',
    settingsTitle: 'Beállítások',
    theme: 'Téma',
    light: 'Világos',
    dark: 'Sötét',
    auto: 'Automatikus',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

// Helper function to get translation
export function getTranslation(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] || translations.en[key] || key;
}
