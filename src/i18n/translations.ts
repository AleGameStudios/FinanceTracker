export type Language = 'en' | 'es';

export const translations = {
  en: {
    // App
    appName: 'Finance Tracker',
    loading: 'Loading...',
    loadingData: 'Loading your data...',
    syncing: 'Syncing...',

    // Navigation
    marks: 'Marks',
    calculator: 'Calculator',
    notes: 'Notes',
    templates: 'Templates',
    history: 'History',
    settings: 'Settings',
    menu: 'Menu',

    // Welcome Screen
    welcome: 'Welcome',
    welcomeTitle: 'Welcome to Finance Tracker',
    welcomeDescription: 'Start by creating your first monthly sheet to track your finances.',
    createFirstSheet: 'Create Your First Sheet',
    or: 'or',
    createTemplateFirst: 'Create a Template First',
    importExistingData: 'Import Existing Data',

    // Login
    signInWithGoogle: 'Sign in with Google',
    signingIn: 'Signing in...',
    signInToSync: 'Sign in to sync your data across devices',
    dataStoredSecurely: 'Your data is stored securely in the cloud',
    signOut: 'Sign out',

    // Sheets
    selectSheet: 'Select a sheet or create a new one to get started.',
    newSheet: 'New Sheet',
    deleteSheet: 'Delete Sheet',
    sheetName: 'Sheet Name',
    total: 'Total',
    currentBalance: 'Current Balance',

    // Categories
    addCategory: 'Add Category',
    categoryName: 'Category Name',
    amount: 'Amount',
    color: 'Color',
    removeCategory: 'Remove Category',
    editCategory: 'Edit Category',

    // Marks
    incoming: 'Incoming',
    outgoing: 'Outgoing',
    addMark: 'Add Mark',
    markName: 'Name',
    completed: 'Completed',
    pending: 'Pending',
    moveTo: 'Move to',
    linkedTo: 'Linked to',

    // Templates
    templateManager: 'Template Manager',
    createTemplate: 'Create Template',
    createFromSheet: 'Create from Sheet',
    templateName: 'Template Name',
    useTemplate: 'Use Template',
    deleteTemplate: 'Delete Template',
    noTemplates: 'No templates yet',
    categories: 'categories',

    // History
    changeHistory: 'Change History',
    filterBySheet: 'Filter by Sheet',
    filterByCategory: 'Filter by Category',
    allSheets: 'All Sheets',
    allCategories: 'All Categories',
    noHistory: 'No history entries yet',
    adjustment: 'Adjustment',
    categoryAdded: 'Category Added',
    categoryRemoved: 'Category Removed',

    // Settings
    dataManagement: 'Data Management',
    exportDescription: 'Export your data to create a backup or import previously exported data.',
    exportData: 'Export Data',
    importData: 'Import Data',
    importSuccess: 'Data imported successfully!',
    importError: 'Failed to import data. Please check the file format.',
    statistics: 'Statistics',
    sheets: 'Sheets',
    historyEntries: 'History Entries',
    about: 'About',
    version: 'Version',
    appDescription: 'Track your finances with categories, templates, and monthly sheets.',

    // Appearance
    appearance: 'Appearance',
    theme: 'Theme',
    lightMode: 'Light',
    darkMode: 'Dark',
    systemTheme: 'System',
    language: 'Language',
    english: 'English',
    spanish: 'Spanish',
    colorPalette: 'Color Palette',
    primaryColor: 'Primary Color',
    accentColor: 'Accent Color',

    // Calculator
    clear: 'Clear',
    clearHistory: 'Clear History',
    noCalculations: 'No calculations yet',

    // Notes
    notesPlaceholder: 'Write your notes here...',
    characters: 'characters',

    // Common
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    create: 'Create',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    name: 'Name',
    note: 'Note',
    optional: 'optional',

    // Dollar Blue
    dollarBlueRate: 'Dollar Blue Rate',

    // Errors
    error: 'Error',
    failedToSignIn: 'Failed to sign in',
  },
  es: {
    // App
    appName: 'Gestor de Finanzas',
    loading: 'Cargando...',
    loadingData: 'Cargando tus datos...',
    syncing: 'Sincronizando...',

    // Navigation
    marks: 'Marcas',
    calculator: 'Calculadora',
    notes: 'Notas',
    templates: 'Plantillas',
    history: 'Historial',
    settings: 'Ajustes',
    menu: 'Menu',

    // Welcome Screen
    welcome: 'Bienvenido',
    welcomeTitle: 'Bienvenido a Gestor de Finanzas',
    welcomeDescription: 'Comienza creando tu primera hoja mensual para gestionar tus finanzas.',
    createFirstSheet: 'Crear Tu Primera Hoja',
    or: 'o',
    createTemplateFirst: 'Crear una Plantilla Primero',
    importExistingData: 'Importar Datos Existentes',

    // Login
    signInWithGoogle: 'Iniciar sesion con Google',
    signingIn: 'Iniciando sesion...',
    signInToSync: 'Inicia sesion para sincronizar tus datos entre dispositivos',
    dataStoredSecurely: 'Tus datos se almacenan de forma segura en la nube',
    signOut: 'Cerrar sesion',

    // Sheets
    selectSheet: 'Selecciona una hoja o crea una nueva para comenzar.',
    newSheet: 'Nueva Hoja',
    deleteSheet: 'Eliminar Hoja',
    sheetName: 'Nombre de Hoja',
    total: 'Total',
    currentBalance: 'Saldo Actual',

    // Categories
    addCategory: 'Agregar Categoria',
    categoryName: 'Nombre de Categoria',
    amount: 'Monto',
    color: 'Color',
    removeCategory: 'Eliminar Categoria',
    editCategory: 'Editar Categoria',

    // Marks
    incoming: 'Ingreso',
    outgoing: 'Egreso',
    addMark: 'Agregar Marca',
    markName: 'Nombre',
    completed: 'Completado',
    pending: 'Pendiente',
    moveTo: 'Mover a',
    linkedTo: 'Vinculado a',

    // Templates
    templateManager: 'Gestor de Plantillas',
    createTemplate: 'Crear Plantilla',
    createFromSheet: 'Crear desde Hoja',
    templateName: 'Nombre de Plantilla',
    useTemplate: 'Usar Plantilla',
    deleteTemplate: 'Eliminar Plantilla',
    noTemplates: 'Sin plantillas aun',
    categories: 'categorias',

    // History
    changeHistory: 'Historial de Cambios',
    filterBySheet: 'Filtrar por Hoja',
    filterByCategory: 'Filtrar por Categoria',
    allSheets: 'Todas las Hojas',
    allCategories: 'Todas las Categorias',
    noHistory: 'Sin entradas de historial aun',
    adjustment: 'Ajuste',
    categoryAdded: 'Categoria Agregada',
    categoryRemoved: 'Categoria Eliminada',

    // Settings
    dataManagement: 'Gestion de Datos',
    exportDescription: 'Exporta tus datos para crear una copia de seguridad o importa datos previamente exportados.',
    exportData: 'Exportar Datos',
    importData: 'Importar Datos',
    importSuccess: 'Datos importados exitosamente!',
    importError: 'Error al importar datos. Por favor verifica el formato del archivo.',
    statistics: 'Estadisticas',
    sheets: 'Hojas',
    historyEntries: 'Entradas de Historial',
    about: 'Acerca de',
    version: 'Version',
    appDescription: 'Gestiona tus finanzas con categorias, plantillas y hojas mensuales.',

    // Appearance
    appearance: 'Apariencia',
    theme: 'Tema',
    lightMode: 'Claro',
    darkMode: 'Oscuro',
    systemTheme: 'Sistema',
    language: 'Idioma',
    english: 'Ingles',
    spanish: 'Espanol',
    colorPalette: 'Paleta de Colores',
    primaryColor: 'Color Primario',
    accentColor: 'Color de Acento',

    // Calculator
    clear: 'Limpiar',
    clearHistory: 'Limpiar Historial',
    noCalculations: 'Sin calculos aun',

    // Notes
    notesPlaceholder: 'Escribe tus notas aqui...',
    characters: 'caracteres',

    // Common
    save: 'Guardar',
    cancel: 'Cancelar',
    close: 'Cerrar',
    delete: 'Eliminar',
    edit: 'Editar',
    add: 'Agregar',
    create: 'Crear',
    confirm: 'Confirmar',
    yes: 'Si',
    no: 'No',
    name: 'Nombre',
    note: 'Nota',
    optional: 'opcional',

    // Dollar Blue
    dollarBlueRate: 'Cotizacion Dolar Blue',

    // Errors
    error: 'Error',
    failedToSignIn: 'Error al iniciar sesion',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
