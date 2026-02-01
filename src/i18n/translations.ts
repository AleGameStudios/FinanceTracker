export type Language = 'en' | 'es';

export const translations = {
  en: {
    // App
    appName: 'Finance Tracker',
    loading: 'Loading...',
    loadingData: 'Loading your data...',
    syncing: 'Syncing...',

    // Navigation
    transactions: 'Transactions',
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
    newMonth: '+ New Month',
    deleteSheet: 'Delete Sheet',
    sheetName: 'Sheet Name',
    total: 'Total',
    monthTotal: 'Month Total:',
    currentBalance: 'Current Balance:',
    started: 'Started:',
    deleteSheetConfirm: 'Are you sure you want to delete this sheet? This action cannot be undone.',

    // Categories
    addCategory: '+ Add Category',
    addNewCategory: 'Add New Category',
    categoryName: 'Category Name',
    categoryNamePlaceholder: 'Category name',
    amount: 'Amount',
    initialAmount: 'Initial amount',
    color: 'Color',
    removeCategory: 'Remove Category',
    editCategory: 'Edit Category',
    editAmount: 'Edit Amount',
    createCategories: 'Create Categories',
    createCustomCategories: 'Create Custom Categories',
    removeCategoryConfirm: 'Are you sure you want to remove',
    reasonForRemoval: 'Reason for removal (optional)',
    remove: 'Remove',
    quickAdjust: 'Quick Adjust',
    addNoteOptional: 'Add a note (optional)',
    noteOptional: 'Note (optional)',
    noCategoryHistory: 'No history for this category.',
    categoryHistoryTitle: 'History',

    // Transactions
    incoming: 'Incoming',
    outgoing: 'Outgoing',
    addTransaction: 'Add Transaction',
    transactionName: 'Name',
    completed: 'Completed',
    pending: 'Pending',
    moveTo: 'Move to',
    linkedTo: 'Linked to',
    noIncomingTransactions: 'No incoming transactions',
    noOutgoingTransactions: 'No outgoing transactions',
    addIncoming: '+ Add Incoming',
    addOutgoing: '+ Add Outgoing',
    description: 'Description',
    noCategoryLink: 'No category link',
    moveTransaction: 'Move Transaction',
    selectSheetOption: 'Select a sheet...',
    moveToSheet: 'Select a sheet to move this transaction to:',
    move: 'Move',
    expectedBalance: 'Expected Balance:',
    actualBalance: 'Actual Balance:',
    dollarBlue: 'Dollar Blue:',
    clickToEdit: 'Click to edit',
    moveToAnotherSheet: 'Move to another sheet',
    removeTransaction: 'Remove transaction',

    // Templates
    templateManager: 'Template Manager',
    createTemplate: 'Create Template',
    createNewTemplate: 'Create New Template',
    createFromSheet: 'Create from Sheet',
    saveSheetAsTemplate: 'Save Sheet as Template',
    templateName: 'Template Name',
    useTemplate: 'Use Template',
    deleteTemplate: 'Delete Template',
    noTemplates: 'No templates yet',
    noTemplatesMessage: 'No templates yet. Create one to get started!',
    categories: 'categories',
    transactionsCount: 'transactions',
    saveAsTemplate: 'Save as Template',
    templateSaveDescription: 'This will save the sheet\'s categories and transactions as a reusable template.',
    back: 'Back',

    // History
    changeHistory: 'Change History',
    filterBySheet: 'Filter by Sheet',
    filterByCategory: 'Filter by Category',
    sheet: 'Sheet',
    type: 'Type',
    currentSheet: 'Current Sheet',
    allSheets: 'All Sheets',
    allCategories: 'All Categories',
    allTypes: 'All Types',
    noHistory: 'No history entries yet',
    noHistoryFound: 'No history entries found.',
    adjustment: 'Adjustment',
    adjustments: 'Adjustments',
    initialValues: 'Initial Values',
    categoriesAdded: 'Categories Added',
    categoriesRemoved: 'Categories Removed',
    sheetsCreated: 'Sheets Created',
    categoryAdded: 'Category Added',
    categoryRemoved: 'Category Removed',
    newSheetCreated: 'New sheet created',
    initializedWith: 'initialized with',
    unknownAction: 'Unknown action',
    unknown: 'Unknown',

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
    continue: 'Continue',
    yes: 'Yes',
    no: 'No',
    name: 'Name',
    note: 'Note',
    optional: 'optional',
    createSheet: 'Create Sheet',

    // New Sheet Modal
    newSheetTitle: 'New Sheet',
    sheetNameQuestion: 'What would you like to name this sheet?',
    sheetNamePlaceholder: 'Sheet name',
    templateOrCustom: 'Would you like to use a template or create custom categories?',
    useATemplate: 'Use a Template',
    createFromTemplate: 'Create from Template',
    transactionNamePlaceholder: 'Transaction name',

    // Dollar Blue
    dollarBlueRate: 'Dollar Blue Rate',

    // Errors
    error: 'Error',
    failedToSignIn: 'Failed to sign in',

    // Help
    help: 'Help',
    helpTitle: 'How to Use Finance Tracker',
    helpIntro: 'Welcome! This app helps you track your money by organizing it into sheets, categories, and transactions. Here\'s how everything works:',

    helpSheetsTitle: 'Sheets',
    helpSheetsDesc: 'Think of sheets like monthly budgets. Create a new sheet for each month (e.g., "January 2026") to start fresh while keeping your history. You can switch between sheets using the tabs at the top.',

    helpCategoriesTitle: 'Categories',
    helpCategoriesDesc: 'Categories are your budget buckets - like "Groceries", "Rent", or "Entertainment". Each category shows how much money you\'ve allocated. Use the quick adjust buttons (-10, -50, +50, +100) to quickly update amounts, or click "Edit Amount" for custom changes.',

    helpTransactionsTitle: 'Transactions',
    helpTransactionsDesc: 'Track money coming in (Incoming) and going out (Outgoing). Check the box when a transaction is complete. You can link transactions to categories to see where your money goes. The progress bars show how much of your expected income/expenses have been completed.',

    helpTemplatesTitle: 'Templates',
    helpTemplatesDesc: 'Save time by creating templates! If you have the same categories and transactions each month, save them as a template. Next month, just apply the template to set everything up instantly.',

    helpCalculatorTitle: 'Calculator',
    helpCalculatorDesc: 'A handy calculator built right in! Use it for quick math without leaving the app. Your calculation history is saved for 24 hours.',

    helpNotesTitle: 'Notes',
    helpNotesDesc: 'A simple notepad for any financial notes, reminders, or thoughts you want to keep handy.',

    helpHistoryTitle: 'History',
    helpHistoryDesc: 'See a log of all changes you\'ve made - category adjustments, new categories added, sheets created, and more. Great for tracking when and why you made changes.',

    helpDollarBlueTitle: 'Dollar Blue Rate',
    helpDollarBlueDesc: 'For users dealing with multiple currencies (especially ARS), you can set the Dollar Blue exchange rate. Transactions in ARS will automatically show their USD equivalent.',

    helpCurrentBalanceTitle: 'Current Balance',
    helpCurrentBalanceDesc: 'Click on the Current Balance number at the top to manually set your actual bank/wallet balance. This helps you compare what you expect to have vs. what you actually have.',

    helpTipsTitle: 'Pro Tips',
    helpTip1: 'Use the grid/list view toggle to switch between card and compact views',
    helpTip2: 'Click on any transaction to edit its details',
    helpTip3: 'Move transactions between sheets if you need to reorganize',
    helpTip4: 'Export your data regularly as a backup from Settings',
    helpTip5: 'Each category remembers its change history - click the clock icon to see it',

    // PWA Install
    installAppTitle: 'Install Finance Tracker',
    installAppDescription: 'Get the full app experience on your device!',
    installBenefit1: 'Works offline',
    installBenefit2: 'Faster loading',
    installBenefit3: 'Easy access from home screen',
    installNow: 'Install Now',
    maybeLater: 'Maybe Later',
    dontShowAgain: "Don't show this again",
    installApp: 'Install App',
    appAlreadyInstalled: 'App is already installed',
  },
  es: {
    // App
    appName: 'Gestor de Finanzas',
    loading: 'Cargando...',
    loadingData: 'Cargando tus datos...',
    syncing: 'Sincronizando...',

    // Navigation
    transactions: 'Transacciones',
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
    newMonth: '+ Nuevo Mes',
    deleteSheet: 'Eliminar Hoja',
    sheetName: 'Nombre de Hoja',
    total: 'Total',
    monthTotal: 'Total del Mes:',
    currentBalance: 'Saldo Actual:',
    started: 'Iniciado:',
    deleteSheetConfirm: 'Estas seguro que deseas eliminar esta hoja? Esta accion no se puede deshacer.',

    // Categories
    addCategory: '+ Agregar Categoria',
    addNewCategory: 'Agregar Nueva Categoria',
    categoryName: 'Nombre de Categoria',
    categoryNamePlaceholder: 'Nombre de categoria',
    amount: 'Monto',
    initialAmount: 'Monto inicial',
    color: 'Color',
    removeCategory: 'Eliminar Categoria',
    editCategory: 'Editar Categoria',
    editAmount: 'Editar Monto',
    createCategories: 'Crear Categorias',
    createCustomCategories: 'Crear Categorias Personalizadas',
    removeCategoryConfirm: 'Estas seguro que deseas eliminar',
    reasonForRemoval: 'Razon de la eliminacion (opcional)',
    remove: 'Eliminar',
    quickAdjust: 'Ajuste Rapido',
    addNoteOptional: 'Agregar una nota (opcional)',
    noteOptional: 'Nota (opcional)',
    noCategoryHistory: 'Sin historial para esta categoria.',
    categoryHistoryTitle: 'Historial',

    // Transactions
    incoming: 'Ingreso',
    outgoing: 'Egreso',
    addTransaction: 'Agregar Transaccion',
    transactionName: 'Nombre',
    completed: 'Completado',
    pending: 'Pendiente',
    moveTo: 'Mover a',
    linkedTo: 'Vinculado a',
    noIncomingTransactions: 'Sin transacciones de ingreso',
    noOutgoingTransactions: 'Sin transacciones de egreso',
    addIncoming: '+ Agregar Ingreso',
    addOutgoing: '+ Agregar Egreso',
    description: 'Descripcion',
    noCategoryLink: 'Sin categoria vinculada',
    moveTransaction: 'Mover Transaccion',
    selectSheetOption: 'Seleccionar hoja...',
    moveToSheet: 'Selecciona una hoja para mover esta transaccion:',
    move: 'Mover',
    expectedBalance: 'Saldo Esperado:',
    actualBalance: 'Saldo Actual:',
    dollarBlue: 'Dolar Blue:',
    clickToEdit: 'Click para editar',
    moveToAnotherSheet: 'Mover a otra hoja',
    removeTransaction: 'Eliminar transaccion',

    // Templates
    templateManager: 'Gestor de Plantillas',
    createTemplate: 'Crear Plantilla',
    createNewTemplate: 'Crear Nueva Plantilla',
    createFromSheet: 'Crear desde Hoja',
    saveSheetAsTemplate: 'Guardar Hoja como Plantilla',
    templateName: 'Nombre de Plantilla',
    useTemplate: 'Usar Plantilla',
    deleteTemplate: 'Eliminar Plantilla',
    noTemplates: 'Sin plantillas aun',
    noTemplatesMessage: 'Sin plantillas aun. Crea una para comenzar!',
    categories: 'categorias',
    transactionsCount: 'transacciones',
    saveAsTemplate: 'Guardar como Plantilla',
    templateSaveDescription: 'Esto guardara las categorias y transacciones de la hoja como una plantilla reutilizable.',
    back: 'Atras',

    // History
    changeHistory: 'Historial de Cambios',
    filterBySheet: 'Filtrar por Hoja',
    filterByCategory: 'Filtrar por Categoria',
    sheet: 'Hoja',
    type: 'Tipo',
    currentSheet: 'Hoja Actual',
    allSheets: 'Todas las Hojas',
    allCategories: 'Todas las Categorias',
    allTypes: 'Todos los Tipos',
    noHistory: 'Sin entradas de historial aun',
    noHistoryFound: 'No se encontraron entradas de historial.',
    adjustment: 'Ajuste',
    adjustments: 'Ajustes',
    initialValues: 'Valores Iniciales',
    categoriesAdded: 'Categorias Agregadas',
    categoriesRemoved: 'Categorias Eliminadas',
    sheetsCreated: 'Hojas Creadas',
    categoryAdded: 'Categoria Agregada',
    categoryRemoved: 'Categoria Eliminada',
    newSheetCreated: 'Nueva hoja creada',
    initializedWith: 'inicializado con',
    unknownAction: 'Accion desconocida',
    unknown: 'Desconocido',

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
    continue: 'Continuar',
    yes: 'Si',
    no: 'No',
    name: 'Nombre',
    note: 'Nota',
    optional: 'opcional',
    createSheet: 'Crear Hoja',

    // New Sheet Modal
    newSheetTitle: 'Nueva Hoja',
    sheetNameQuestion: 'Como te gustaria nombrar esta hoja?',
    sheetNamePlaceholder: 'Nombre de hoja',
    templateOrCustom: 'Te gustaria usar una plantilla o crear categorias personalizadas?',
    useATemplate: 'Usar una Plantilla',
    createFromTemplate: 'Crear desde Plantilla',
    transactionNamePlaceholder: 'Nombre de transaccion',

    // Dollar Blue
    dollarBlueRate: 'Cotizacion Dolar Blue',

    // Errors
    error: 'Error',
    failedToSignIn: 'Error al iniciar sesion',

    // Help
    help: 'Ayuda',
    helpTitle: 'Como Usar el Gestor de Finanzas',
    helpIntro: 'Bienvenido! Esta app te ayuda a rastrear tu dinero organizandolo en hojas, categorias y transacciones. Asi es como funciona todo:',

    helpSheetsTitle: 'Hojas',
    helpSheetsDesc: 'Piensa en las hojas como presupuestos mensuales. Crea una nueva hoja para cada mes (ej: "Enero 2026") para empezar de nuevo manteniendo tu historial. Puedes cambiar entre hojas usando las pestanas arriba.',

    helpCategoriesTitle: 'Categorias',
    helpCategoriesDesc: 'Las categorias son tus "cajones" de presupuesto - como "Comida", "Alquiler", o "Entretenimiento". Cada categoria muestra cuanto dinero has asignado. Usa los botones de ajuste rapido (-10, -50, +50, +100) para actualizar rapidamente, o haz clic en "Editar Monto" para cambios personalizados.',

    helpTransactionsTitle: 'Transacciones',
    helpTransactionsDesc: 'Rastrea el dinero que entra (Ingreso) y sale (Egreso). Marca la casilla cuando una transaccion se complete. Puedes vincular transacciones a categorias para ver a donde va tu dinero. Las barras de progreso muestran cuanto de tus ingresos/gastos esperados se han completado.',

    helpTemplatesTitle: 'Plantillas',
    helpTemplatesDesc: 'Ahorra tiempo creando plantillas! Si tienes las mismas categorias y transacciones cada mes, guardalas como plantilla. El proximo mes, solo aplica la plantilla para configurar todo al instante.',

    helpCalculatorTitle: 'Calculadora',
    helpCalculatorDesc: 'Una calculadora practica integrada! Usala para calculos rapidos sin salir de la app. Tu historial de calculos se guarda por 24 horas.',

    helpNotesTitle: 'Notas',
    helpNotesDesc: 'Un bloc de notas simple para cualquier nota financiera, recordatorio o pensamiento que quieras tener a mano.',

    helpHistoryTitle: 'Historial',
    helpHistoryDesc: 'Ve un registro de todos los cambios que has hecho - ajustes de categorias, nuevas categorias agregadas, hojas creadas, y mas. Genial para rastrear cuando y por que hiciste cambios.',

    helpDollarBlueTitle: 'Cotizacion Dolar Blue',
    helpDollarBlueDesc: 'Para usuarios que manejan multiples monedas (especialmente ARS), puedes configurar la cotizacion del Dolar Blue. Las transacciones en ARS mostraran automaticamente su equivalente en USD.',

    helpCurrentBalanceTitle: 'Saldo Actual',
    helpCurrentBalanceDesc: 'Haz clic en el numero de Saldo Actual arriba para establecer manualmente tu saldo real de banco/billetera. Esto te ayuda a comparar lo que esperas tener vs. lo que realmente tienes.',

    helpTipsTitle: 'Consejos Pro',
    helpTip1: 'Usa el boton de vista grilla/lista para cambiar entre tarjetas y vista compacta',
    helpTip2: 'Haz clic en cualquier transaccion para editar sus detalles',
    helpTip3: 'Mueve transacciones entre hojas si necesitas reorganizar',
    helpTip4: 'Exporta tus datos regularmente como respaldo desde Ajustes',
    helpTip5: 'Cada categoria recuerda su historial de cambios - haz clic en el icono de reloj para verlo',

    // PWA Install
    installAppTitle: 'Instalar Gestor de Finanzas',
    installAppDescription: 'Obtene la experiencia completa de la app en tu dispositivo!',
    installBenefit1: 'Funciona sin conexion',
    installBenefit2: 'Carga mas rapida',
    installBenefit3: 'Acceso facil desde la pantalla de inicio',
    installNow: 'Instalar Ahora',
    maybeLater: 'Quizas Despues',
    dontShowAgain: 'No mostrar de nuevo',
    installApp: 'Instalar App',
    appAlreadyInstalled: 'La app ya esta instalada',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
