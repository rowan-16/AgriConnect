const fs = require('fs');
const path = require('path');

// Read existing translations.ts
const transPath = path.join(__dirname, '..', 'src', 'services', 'translations.ts');
const rawCode = fs.readFileSync(transPath, 'utf8');

const entryRegex = /^\s*([a-zA-Z0-9_]+):\s*\{\s*en:\s*['"`]([\s\S]*?)['"`],\s*hi:\s*['"`]([\s\S]*?)['"`],\s*mr:\s*['"`]([\s\S]*?)['"`],\s*ta:\s*['"`]([\s\S]*?)['"`],?\s*\},?/gm;

const existingKeys = {};
let match;
while ((match = entryRegex.exec(rawCode)) !== null) {
  existingKeys[match[1]] = {
    en: match[2].replace(/\\'/g, "'"),
    hi: match[3].replace(/\\'/g, "'"),
    mr: match[4].replace(/\\'/g, "'"),
    ta: match[5].replace(/\\'/g, "'"),
  };
}

console.log(`Parsed ${Object.keys(existingKeys).length} keys from translations.ts`);

// Namespace Categorizer
function assignNamespace(key) {
  if (key.startsWith('invoice') || key.startsWith('tax') || key.startsWith('gst') || key.startsWith('hsn') || key.startsWith('seller') || key.startsWith('buyerBilled') || key.startsWith('itemDesc') || key.startsWith('unitPrice') || key.startsWith('officialTax') || key.startsWith('printDownloadPdf') || key.startsWith('paymentConfirmed') || key.startsWith('directSettlement') || key.startsWith('fssai') || key.startsWith('cess') || key.startsWith('subtotal') || key.startsWith('totalPayable')) {
    return 'invoice';
  }
  if (key.startsWith('weather') || key.startsWith('temp') || key.startsWith('humidity') || key.startsWith('soilMoisture') || key.startsWith('windVelocity') || key.startsWith('feelsLike') || key.startsWith('forecast') || key.startsWith('microClimate') || key.startsWith('agronomicGuidance') || key.startsWith('precipitation') || key.startsWith('rain')) {
    return 'weather';
  }
  if (key.startsWith('market') || key.startsWith('mandi') || key.startsWith('demand') || key.startsWith('priceTrend') || key.startsWith('trendingCrops') || key.startsWith('wholesale') || key.startsWith('priceIntelligence')) {
    return 'market';
  }
  if (key.startsWith('crop') || key.startsWith('crops') || key.startsWith('soil') || key.startsWith('sowing') || key.startsWith('harvest') || key.startsWith('npk') || key.startsWith('pest') || key.startsWith('organic') || key.startsWith('companion') || key.startsWith('season') || key.startsWith('yield') || key.startsWith('variety') || key.startsWith('grains') || key.startsWith('vegetables') || key.startsWith('fruits') || key.startsWith('pulses') || key.startsWith('spices') || key.startsWith('cashCrops') || key.startsWith('oilseeds') || key.startsWith('smartSowing')) {
    return 'agriculture';
  }
  if (key.startsWith('chat') || key.startsWith('bot') || key.startsWith('ai') || key.startsWith('agriBot') || key.startsWith('askPrompt') || key.startsWith('suggested') || key.startsWith('grounded')) {
    return 'chatbot';
  }
  if (key.startsWith('notif') || key.startsWith('alert') || key.startsWith('allCaughtUp') || key.startsWith('markAllRead') || key.startsWith('orderPlacedAlert') || key.startsWith('orderDispatchedAlert') || key.startsWith('orderDeliveredAlert')) {
    return 'notifications';
  }
  if (key.startsWith('login') || key.startsWith('register') || key.startsWith('auth') || key.startsWith('password') || key.startsWith('email') || key.startsWith('phone') || key.startsWith('google') || key.startsWith('orSign') || key.startsWith('orReg') || key.startsWith('signIn') || key.startsWith('access') || key.startsWith('remember') || key.startsWith('forgot') || key.startsWith('alreadyHave') || key.startsWith('dontHave') || key.startsWith('createAcc') || key.startsWith('join') || key.startsWith('logout') || key.startsWith('passwordsDoNotMatch') || key.startsWith('agreeTerms')) {
    return 'auth';
  }
  if (key.startsWith('farmer') || key.startsWith('myCrops') || key.startsWith('addCrop') || key.startsWith('landRecord') || key.startsWith('farmName') || key.startsWith('farmSize') || key.startsWith('farmLocation') || key.startsWith('verifyAccount') || key.startsWith('auditStatus') || key.startsWith('incomingOrders') || key.startsWith('acceptOrder') || key.startsWith('rejectOrder') || key.startsWith('fulfillOrder') || key.startsWith('salesRevenue')) {
    return 'farmer';
  }
  if (key.startsWith('buyer') || key.startsWith('cart') || key.startsWith('checkout') || key.startsWith('order') || key.startsWith('orders') || key.startsWith('track') || key.startsWith('tracking') || key.startsWith('delivery') || key.startsWith('shipping') || key.startsWith('address') || key.startsWith('product') || key.startsWith('products') || key.startsWith('shop') || key.startsWith('payment') || key.startsWith('review') || key.startsWith('rating') || key.startsWith('payNow') || key.startsWith('simulatedPayment')) {
    return 'customer';
  }
  if (key.startsWith('admin') || key.startsWith('manage') || key.startsWith('approve') || key.startsWith('reject') || key.startsWith('suspend') || key.startsWith('analytics') || key.startsWith('revenue') || key.startsWith('dispute') || key.startsWith('platform') || key.startsWith('totalUsers') || key.startsWith('activeFarmers') || key.startsWith('registeredBuyers') || key.startsWith('governance')) {
    return 'admin';
  }
  return 'common';
}

// Translations for specific domain vocabularies across Telugu, Malayalam, Kannada
// Helper translation dictionary generator
const translationsTe = {
  // Brand & Common
  appName: 'అగ్రి-కనెక్ట్',
  appTagline: 'రైతు నుండి నేరుగా కొనుగోలుదారు మార్కెట్ & స్మార్ట్ వ్యవసాయ సలహా',
  save: 'భద్రపరచు',
  cancel: 'రద్దు చేయి',
  confirm: 'నిర్ధారించు',
  delete: 'తొలగించు',
  edit: 'సవరించు',
  view: 'చూడండి',
  search: 'వెతకండి',
  searchPlaceholder: 'పంటలు, రైతులు, నగరాలను వెతకండి...',
  filter: 'ఫిల్టర్ చేయండి',
  filterBy: 'దీని ద్వారా ఫిల్టర్ చేయండి',
  sortBy: 'వరుస క్రమం',
  all: 'అన్నీ',
  actions: 'చర్యలు',
  status: 'స్థితి',
  active: 'క్రియాశీలకంగా ఉంది',
  pending: 'పెండింగ్‌లో ఉంది',
  completed: 'పూర్తయింది',
  rejected: 'తిరస్కరించబడింది',
  inStock: 'స్టాక్ ఉంది',
  outOfStock: 'స్టాక్ అయిపోయింది',
  lowStock: 'తక్కువ స్టాక్',
  price: 'ధర',
  quantity: 'పరిమాణం',
  total: 'మొత్తం',
  subtotal: 'ఉప మొత్తం',
  date: 'తేదీ',
  back: 'వెనుకకు',
  next: 'తరువాత',
  loading: 'లోడ్ అవుతోంది...',
  close: 'మూసివేయి',
  apply: 'వర్తింపజేయి',
  reset: 'రీసెట్ చేయి',
  download: 'డౌన్‌లోడ్',
  print: 'ప్రింట్ చేయండి',
  success: 'విజయవంతం',
  error: 'లోపం సంభవించింది',
  warning: 'హెచ్చరిక',
  info: 'సమాచారం',
  welcomeBack: 'తిరిగి స్వాగతం',
  home: 'హోమ్',
  dashboard: 'డాష్‌బోర్డ్',
  profile: 'ప్రొఫైల్',
  settings: 'సెట్టింగ్‌లు',
  notifications: 'నోటిఫికేషన్‌లు',
  myCart: 'నా కార్ట్',
  logout: 'లాగౌట్',
  selectLanguage: 'భాషను ఎంచుకోండి',
  viewAll: 'అన్నీ చూడండి',
  details: 'వివరాలు',

  // Auth
  login: 'లాగిన్',
  register: 'రిజిస్టర్ చేసుకోండి',
  signInPortal: 'మీ పోర్టల్‌లోకి లాగిన్ అవ్వండి',
  continueWithGoogle: 'గూగుల్‌తో కొనసాగించండి',
  orSignInWith: 'లేదా ఆధారాలతో లాగిన్ అవ్వండి',
  orRegisterManual: 'లేదా వివరాలను నమోదు చేయండి',
  emailPlaceholder: 'మీ ఈమెయిల్ చిరునామా',
  passwordPlaceholder: 'మీ రహస్య పాస్‌వర్డ్',
  forgotPassword: 'పాస్‌వర్డ్ మర్చిపోయారా?',
  rememberMe: 'నన్ను గుర్తుంచుకో',
  dontHaveAccount: 'ఖాతా లేదా? ఇప్పుడే నమోదు చేసుకోండి',
  alreadyHaveAccount: 'ఇప్పటికే ఖాతా ఉందా? లాగిన్ అవ్వండి',
  loginAs: 'ఈ క్రింది విధంగా లాగిన్ అవ్వండి:',
  roleFarmer: 'రైతు (ఉత్పత్తిదారుడు)',
  roleBuyer: 'కొనుగోలుదారు (వినియోగదారుడు / వ్యాపారి)',
  roleAdmin: 'ప్లాట్‌ఫామ్ నిర్వాహకుడు',

  // Farmer
  farmerPortal: 'రైతు వేదిక',
  farmerDashboard: 'రైతు డాష్‌బోర్డ్',
  myCrops: 'నా పంటల జాబితా',
  addCrop: 'కొత్త పంటను జోడించండి',
  cropName: 'పంట పేరు',
  cropCategory: 'పంట వర్గం',
  cropPricePerKg: 'ధర (కిలోకు ₹)',
  cropQuantityKg: 'మొత్తం నిల్వ (కిలోలలో)',
  cropDescription: 'పంట వివరాలు మరియు నాణ్యత',
  cropHarvestDate: 'కోత తేదీ',
  organicCertified: 'సేంద్రీయ ధృవీకరణ పొందినది',
  cropImages: 'పంట ఫోటోలు',
  farmerOrders: 'వచ్చిన ఆర్డర్లు',
  acceptOrder: 'ఆర్డర్ అంగీకరించు',
  rejectOrder: 'ఆర్డర్ తిరస్కరించు',
  fulfillOrder: 'ఆర్డర్ పూర్తి చేయి',
  farmerRevenue: 'మొత్తం ఆదాయం',
  totalCropsListed: 'నమోదైన పంటలు',
  farmerVerification: 'రైతు ధృవీకరణ పత్రాలు',
  uploadLandDocument: 'భూమి యాజమాన్య పత్రం (పట్టాదారు పాస్ బుక్)',
  verificationPending: 'పరిశీలనలో ఉంది',
  verificationApproved: 'ధృవీకరించబడింది',

  // Customer
  buyerPortal: 'కొనుగోలుదారు పోర్టల్',
  buyerDashboard: 'మార్కెట్ డాష్‌బోర్డ్',
  browseProduce: 'తాజా వ్యవసాయ ఉత్పత్తులను బ్రౌజ్ చేయండి',
  addToCart: 'కార్ట్‌కు జోడించండి',
  buyNow: 'ఇప్పుడే కొనండి',
  cartEmpty: 'మీ కార్ట్ ఖాళీగా ఉంది',
  checkout: 'చెక్‌అవుట్ చేయండి',
  shippingAddress: 'డెలివరీ చిరునామా',
  paymentMethod: 'చెల్లింపు విధానం',
  paySimulated: 'చెల్లింపు పూర్తి చేయండి (సిమ్యులేషన్)',
  orderPlaced: 'ఆర్డర్ విజయవంతంగా నమోదు చేయబడింది!',
  myOrders: 'నా ఆర్డర్లు',
  trackOrder: 'ఆర్డర్ ట్రాకింగ్',
  orderStatus: 'ఆర్డర్ స్థితి',
  orderDate: 'ఆర్డర్ తేదీ',
  invoice: 'ఇన్వాయిస్ / రసీదు',
  viewInvoice: 'ఇన్వాయిస్ చూడండి',

  // Agriculture
  cropAdvisory: 'పంట & నేల సలహా',
  soilType: 'నేల రకం',
  soilBlack: 'నల్లరేగడి నేల',
  soilRed: 'ఎర్ర నేల',
  soilAlluvial: 'ఒండ్రు నేల',
  soilClay: 'బంకమట్టి నేల',
  soilSandy: 'ఇసుక నేల',
  season: 'పంట కాలం (హంగేము)',
  seasonKharif: 'ఖరీఫ్ (వర్షాకాలం)',
  seasonRabi: 'రబీ (శీతాకాలం)',
  seasonZaid: 'జైద్ (వేసవి కాలం)',
  recommendedCrops: 'సిఫార్సు చేయబడిన పంటలు',
  smartSowingPlanner: 'స్మార్ట్ విత్తన ప్రణాళిక',
  fertilizerAdvisory: 'ఎరువుల సలహా (NPK మోతాదు)',
  pestControl: 'పురుగుల మరియు తెగుళ్ల నివారణ',
  companionCrops: 'అంతర పంటలు',
  expectedYield: 'అంచనా దిగుబడి',

  // Weather
  weatherForecast: 'ప్రత్యక్ష వాతావరణ అంచనా',
  currentTemp: 'ప్రస్తుత ఉష్ణోగ్రత',
  humidity: 'గాలిలో తేమ శాతం',
  soilMoisture: 'నేల తేమ స్థాయి',
  windSpeed: 'గాలి వేగం',
  rainChance: 'వర్షపాత సంభావ్యత',
  weatherAdvisory: 'వ్యవసాయ వాతావరణ హెచ్చరిక',

  // Market
  marketDemand: 'మార్కెట్ డిమాండ్ & మండి ధరలు',
  currentMandiRate: 'ప్రస్తుత మండి ధర',
  priceTrend: 'ధరల సరళి',
  highDemand: 'అధిక డిమాండ్',
  moderateDemand: 'మితమైన డిమాండ్',
  priceForecast: 'రాబోయే ధరల అంచనా',

  // Chatbot
  agriBotTitle: 'అగ్రిబాట్ AI వ్యవసాయ సహాయకుడు',
  agriBotSubtitle: 'ఆన్‌లైన్ • వ్యవసాయ నిపుణుల సలహాలు',
  agriBotWelcome: 'నమస్కారం! 🙏 నేను మీ వ్యక్తిగత అగ్రిబాట్ AI వ్యవసాయ సహాయకుడిని 🌾. పంటలు, వాతావరణం, ఎరువులు, మార్కెట్ ధరలు లేదా ఆర్డర్ల గురించి ఏదైనా అడగండి!',
  agriBotPlaceholder: 'పంటలు, నేల, వాతావరణం, మండి ధరలు లేదా ఆర్డర్ల గురించి అడగండి...',
  quickHello: '👋 నమస్కారం చెప్పండి',
  quickProducts: '🌾 పంటలు & రైతుల జాబితా',
  quickRecommend: '🌱 పంటల సిఫార్సు',
  quickPest: '🐛 పురుగులు & తెగుళ్ల నివారణ',
  quickWeather: '🌤️ ప్రత్యక్ష వాతావరణం',
  quickOrders: '📦 నా ఆర్డర్ల స్థితి',
  quickMarket: '📈 మార్కెట్ ట్రెండ్స్',

  // Invoice
  officialTaxInvoice: 'అగ్రి-కనెక్ట్ అధికారిక పన్ను ఇన్వాయిస్',
  printDownloadPdf: 'ప్రింట్ / PDF డౌన్‌లోడ్',
  sellerDetails: 'విక్రేత (నమోదిత రైతు)',
  buyerDetails: 'బిల్లు & డెలివరీ గ్రహీత (కొనుగోలుదారు)',
  itemDescription: 'వస్తువు వివరాలు',
  hsnSac: 'HSN/SAC కోడ్',
  ratePerUnit: 'యూనిట్ ధర',
  amount: 'మొత్తం',
  gstExempt: 'తాజా వ్యవసాయ ఉత్పత్తులకు GST మినహాయింపు ఉంది',
  totalPayable: 'మొత్తం చెల్లించవలసినది',
  paymentConfirmed: 'చెల్లింపు నిర్ధారించబడింది',

  // Notifications
  notificationsTitle: 'నోటిఫికేషన్‌లు',
  markAllAsRead: 'అన్నీ చదివినట్లు గుర్తించు',
  noNotifications: 'కొత్త నోటిఫికేషన్‌లు ఏవీ లేవు',
  orderPlacedNotice: 'మీ ఆర్డర్ విజయవంతంగా నమోదు చేయబడింది',
  orderShippedNotice: 'మీ ఆర్డర్ రవాణాలో ఉంది',
  orderDeliveredNotice: 'మీ ఆర్డర్ డెలివరీ చేయబడింది',
};

const translationsMl = {
  // Brand & Common
  appName: 'അഗ്രി-കണക്ട്',
  appTagline: 'നേരിട്ടുള്ള കർഷക-ഉപഭോക്തൃ വിപണിയും സ്മാർട്ട് കാർഷിക ഉപദേശവും',
  save: 'സംരക്ഷിക്കുക',
  cancel: 'റദ്ദാക്കുക',
  confirm: 'സ്ഥിരീകരിക്കുക',
  delete: 'നീക്കം ചെയ്യുക',
  edit: 'തിരുത്തുക',
  view: 'കാണുക',
  search: 'തിരയുക',
  searchPlaceholder: 'വിളകൾ, കർഷകർ, നഗരങ്ങൾ എന്നിവ തിരയുക...',
  filter: 'ഫിൽട്ടർ ചെയ്യുക',
  filterBy: 'ഇതുപ്രകാരം ഫിൽട്ടർ ചെയ്യുക',
  sortBy: 'ക്രമപ്പെടുത്തുക',
  all: 'എല്ലാം',
  actions: 'നടപടികൾ',
  status: 'നില',
  active: 'സജീവം',
  pending: 'തീർച്ചപ്പെടാത്തത്',
  completed: 'പൂർത്തിയായി',
  rejected: 'നിരസിച്ചു',
  inStock: 'സ്റ്റോക്കുണ്ട്',
  outOfStock: 'സ്റ്റോക്കില്ല',
  lowStock: 'കുറഞ്ഞ സ്റ്റോക്ക്',
  price: 'വില',
  quantity: 'അളവ്',
  total: 'ആകെ',
  subtotal: 'ഉപതുക',
  date: 'തീയതി',
  back: 'പിന്നോട്ട്',
  next: 'അടുത്തത്',
  loading: 'ലോഡ് ചെയ്യുന്നു...',
  close: 'അടയ്ക്കുക',
  apply: 'പ്രയോഗിക്കുക',
  reset: 'റീസെറ്റ് ചെയ്യുക',
  download: 'ഡൗൺലോഡ്',
  print: 'പ്രിന്റ് ചെയ്യുക',
  success: 'വിജയകരം',
  error: 'പിശക് സംഭവിച്ചു',
  warning: 'മുന്നറിയിപ്പ്',
  info: 'വിവരം',
  welcomeBack: 'വീണ്ടും സ്വാഗതം',
  home: 'ഹോം',
  dashboard: 'ഡാഷ്‌ബോർഡ്',
  profile: 'പ്രൊഫൈൽ',
  settings: 'ക്രമീകരണങ്ങൾ',
  notifications: 'അറിയിപ്പുകൾ',
  myCart: 'ഷോപ്പിംഗ് കാർട്ട്',
  logout: 'ലോഗൗട്ട്',
  selectLanguage: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
  viewAll: 'എല്ലാം കാണുക',
  details: 'വിശദാംശങ്ങൾ',

  // Auth
  login: 'ലോഗിൻ',
  register: 'രജിസ്റ്റർ ചെയ്യുക',
  signInPortal: 'പോർട്ടലിലേക്ക് ലോഗിൻ ചെയ്യുക',
  continueWithGoogle: 'ഗൂഗിൾ വഴി തുടരുക',
  orSignInWith: 'അല്ലെങ്കിൽ വിവരങ്ങൾ നൽകി ലോഗിൻ ചെയ്യുക',
  orRegisterManual: 'അല്ലെങ്കിൽ വിശദാംശങ്ങൾ നൽകി രജിസ്റ്റർ ചെയ്യുക',
  emailPlaceholder: 'ഇമെയിൽ വിലാസം',
  passwordPlaceholder: 'പാസ്‌വേഡ്',
  forgotPassword: 'പാസ്‌വേഡ് മറന്നോ?',
  rememberMe: 'എന്നെ ഓർക്കുക',
  dontHaveAccount: 'അക്കൗണ്ടില്ലേ? ഇപ്പോൾ രജിസ്റ്റർ ചെയ്യുക',
  alreadyHaveAccount: 'ഇതിനകം അക്കൗണ്ടുണ്ടോ? ലോഗിൻ ചെയ്യുക',
  loginAs: 'ഇങ്ങനെ ലോഗിൻ ചെയ്യുക:',
  roleFarmer: 'കർഷകൻ (ഉൽപാദകൻ)',
  roleBuyer: 'ഉപഭോക്താവ് / വ്യാപാരി',
  roleAdmin: 'പ്ലാറ്റ്‌ഫോം അഡ്മിൻ',

  // Farmer
  farmerPortal: 'കർഷക പോർട്ടൽ',
  farmerDashboard: 'കർഷക ഡാഷ്‌ബോർഡ്',
  myCrops: 'എന്റെ വിളകൾ',
  addCrop: 'പുതിയ വിള ചേർക്കുക',
  cropName: 'വിളയുടെ പേര്',
  cropCategory: 'വിള വിഭാഗം',
  cropPricePerKg: 'വില (കിലോയ്ക്ക് ₹)',
  cropQuantityKg: 'ലഭ്യമായ അളവ് (കിലോയിൽ)',
  cropDescription: 'വിള വിവരങ്ങളും ഗുണനിലവാരവും',
  cropHarvestDate: 'വിളവെടുപ്പ് തീയതി',
  organicCertified: 'ജൈവ സർട്ടിഫൈഡ്',
  cropImages: 'വിളയുടെ ചിത്രങ്ങൾ',
  farmerOrders: 'ലഭിച്ച ഓർഡറുകൾ',
  acceptOrder: 'ഓർഡർ സ്വീകരിക്കുക',
  rejectOrder: 'ഓർഡർ നിരസിക്കുക',
  fulfillOrder: 'ഓർഡർ പൂർത്തിയാക്കുക',
  farmerRevenue: 'ആകെ വരുമാനം',
  totalCropsListed: 'പട്ടികപ്പെടുത്തിയ വിളകൾ',
  farmerVerification: 'കർഷക പരിശോധനാ രേഖകൾ',
  uploadLandDocument: 'ഭൂമിയുടെ ഉടമസ്ഥാവകാശ രേഖ (പട്ടയം)',
  verificationPending: 'പരിശോധനയിലാണ്',
  verificationApproved: 'സ്ഥിരീകരിച്ചു',

  // Customer
  buyerPortal: 'ഉപഭോക്തൃ പോർട്ടൽ',
  buyerDashboard: 'വിപണി ഡാഷ്‌ബോർഡ്',
  browseProduce: 'പുതിയ കാർഷിക ഉൽപ്പന്നങ്ങൾ കാണുക',
  addToCart: 'കാർട്ടിലേക്ക് ചേർക്കുക',
  buyNow: 'ഇപ്പോൾ വാങ്ങുക',
  cartEmpty: 'കാർട്ട് ശൂന്യമാണ്',
  checkout: 'ചെക്ക്ഔട്ട്',
  shippingAddress: 'ഡെലിവറി വിലാസം',
  paymentMethod: 'പേയ്‌മെന്റ് രീതി',
  paySimulated: 'പേയ്‌മെന്റ് പൂർത്തിയാക്കുക (സിമുലേഷൻ)',
  orderPlaced: 'ഓർഡർ വിജയകരമായി നൽകി!',
  myOrders: 'എന്റെ ഓർഡറുകൾ',
  trackOrder: 'ഓർഡർ ട്രാക്കിംഗ്',
  orderStatus: 'ഓർഡർ നില',
  orderDate: 'ഓർഡർ തീയതി',
  invoice: 'ഇൻവോയ്സ് / രസീത്',
  viewInvoice: 'ഇൻവോയ്സ് കാണുക',

  // Agriculture
  cropAdvisory: 'വിള & മണ്ണ് ഉപദേശം',
  soilType: 'മണ്ണിന്റെ തരം',
  soilBlack: 'കറുത്ത മണ്ണ്',
  soilRed: 'ചുവന്ന മണ്ണ്',
  soilAlluvial: 'എക്കൽ മണ്ണ്',
  soilClay: 'കളിമണ്ണ്',
  soilSandy: 'മണൽ മണ്ണ്',
  season: 'കാർഷിക കാലം',
  seasonKharif: 'ഖാരിഫ് (മഴക്കാലം)',
  seasonRabi: 'റാബി (ശീതകാലം)',
  seasonZaid: 'സെയ്ദ് (വേനൽക്കാലം)',
  recommendedCrops: 'ശുപാർശ ചെയ്യുന്ന വിളകൾ',
  smartSowingPlanner: 'സ്മാർട്ട് വിതയ്ക്കൽ ആസൂത്രകൻ',
  fertilizerAdvisory: 'വളപ്രയോഗ ഉപദേശം (NPK തോത്)',
  pestControl: 'കീട-രോഗ നിയന്ത്രണം',
  companionCrops: 'ഇടവിളകൾ',
  expectedYield: 'പ്രതീക്ഷിക്കുന്ന വിളവ്',

  // Weather
  weatherForecast: 'തത്സമയ കാലാവസ്ഥാ പ്രവചനം',
  currentTemp: 'നിലവിലെ താപനില',
  humidity: 'അന്തരീക്ഷ ഈർപ്പം',
  soilMoisture: 'മണ്ണിലെ ഈർപ്പ നില',
  windSpeed: 'കാറ്റിന്റെ വേഗത',
  rainChance: 'മഴയ്ക്കുള്ള സാധ്യത',
  weatherAdvisory: 'കാർഷിക കാലാവസ്ഥാ മുന്നറിയിപ്പ്',

  // Market
  marketDemand: 'വിപണി ഡിമാൻഡും മാർക്കറ്റ് വിലയും',
  currentMandiRate: 'നിലവിലെ വിപണി വില',
  priceTrend: 'വിലയിലെ മാറ്റങ്ങൾ',
  highDemand: 'കൂടിയ ഡിമാൻഡ്',
  moderateDemand: 'മിതമായ ഡിമാൻഡ്',
  priceForecast: 'വില പ്രവചനം',

  // Chatbot
  agriBotTitle: 'അഗ്രിബോട്ട് AI കാർഷിക സഹായി',
  agriBotSubtitle: 'ഓൺലൈൻ • കാർഷിക വിദഗ്ദ്ധോപദേശം',
  agriBotWelcome: 'നമസ്കാരം! 🙏 ഞാൻ നിങ്ങളുടെ സ്വകാര്യ അഗ്രിബോട്ട് AI കാർഷിക സഹായിയാണ് 🌾. വിളകൾ, രോഗങ്ങൾ, വളങ്ങൾ, വിപണി വില, ഓർഡർ എന്നിവയെക്കുറിച്ച് എന്ത് വേണമെങ്കിലും ചോദിക്കാം!',
  agriBotPlaceholder: 'വിളകൾ, മണ്ണ്, കാലാവസ്ഥ, വിപണി വില, ഓർഡറുകൾ എന്നിവയെക്കുറിച്ച് ചോദിക്കുക...',
  quickHello: '👋 നമസ്കാരം പറയുക',
  quickProducts: '🌾 ഉൽപ്പന്നങ്ങളും കർഷകരും',
  quickRecommend: '🌱 വിള ശുപാർശകൾ',
  quickPest: '🐛 കീട-രോഗ നിയന്ത്രണം',
  quickWeather: '🌤️ തത്സമയ കാലാവസ്ഥ',
  quickOrders: '📦 ഓർഡർ വിവരങ്ങൾ',
  quickMarket: '📈 വിപണി ട്രെൻഡുകൾ',

  // Invoice
  officialTaxInvoice: 'അഗ്രി-കണക്ട് ഔദ്യോഗിക നികുതി ഇൻവോയ്സ്',
  printDownloadPdf: 'പ്രിന്റ് / PDF ഡൗൺലോഡ്',
  sellerDetails: 'വിൽപ്പനക്കാരൻ (രജിസ്റ്റർ ചെയ്ത കർഷകൻ)',
  buyerDetails: 'വാങ്ങുന്നയാൾ (ഉപഭോക്താവ്)',
  itemDescription: 'ഇനത്തിന്റെ വിവരണം',
  hsnSac: 'HSN/SAC കോഡ്',
  ratePerUnit: 'യൂണിറ്റ് നിരക്ക്',
  amount: 'തുക',
  gstExempt: 'പുതിയ പച്ചക്കറികൾക്കും കാർഷിക വിളകൾക്കും ജിഎസ്ടി ഇളവുണ്ട്',
  totalPayable: 'ആകെ അടയ്‌ക്കേണ്ട തുക',
  paymentConfirmed: 'പേയ്‌മെന്റ് സ്ഥിരീകരിച്ചു',

  // Notifications
  notificationsTitle: 'അറിയിപ്പുകൾ',
  markAllAsRead: 'എല്ലാം വായിച്ചതായി അടയാളപ്പെടുത്തുക',
  noNotifications: 'പുതിയ അറിയിപ്പുകളൊന്നുമില്ല',
  orderPlacedNotice: 'നിങ്ങളുടെ ഓർഡർ വിജയകരമായി നൽകി',
  orderShippedNotice: 'നിങ്ങളുടെ ഓർഡർ അയച്ചിരിക്കുന്നു',
  orderDeliveredNotice: 'നിങ്ങളുടെ ഓർഡർ എത്തിച്ചിരിക്കുന്നു',
};

const translationsKn = {
  // Brand & Common
  appName: 'ಅಗ್ರಿ-ಕನೆಕ್ಟ್',
  appTagline: 'ರೈತರಿಂದ ನೇರ ಗ್ರಾಹಕ ಮಾರುಕಟ್ಟೆ ಮತ್ತು ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಲಹೆ',
  save: 'ಉಳಿಸಿ',
  cancel: 'ರದ್ದುಮಾಡಿ',
  confirm: 'ದೃಢೀಕರಿಸಿ',
  delete: 'ಅಳಿಸಿ',
  edit: 'ತಿದ್ದಿ',
  view: 'ವೀಕ್ಷಿಸಿ',
  search: 'ಹುಡುಕಿ',
  searchPlaceholder: 'ಬೆಳೆಗಳು, ರೈತರು, ನಗರಗಳನ್ನು ಹುಡುಕಿ...',
  filter: 'ಫಿಲ್ಟರ್ ಮಾಡಿ',
  filterBy: 'ಇದರಿಂದ ಫಿಲ್ಟರ್ ಮಾಡಿ',
  sortBy: 'ವಿಂಗಡಿಸಿ',
  all: 'ಎಲ್ಲಾ',
  actions: 'ಕ್ರಮಗಳು',
  status: 'ಸ್ಥಿತಿ',
  active: 'ಸಕ್ರಿಯ',
  pending: 'ಬಾಕಿ ಇದೆ',
  completed: 'ಪೂರ್ಣಗೊಂಡಿದೆ',
  rejected: 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ',
  inStock: 'ದಾಸ್ತಾನು ಲಭ್ಯವಿದೆ',
  outOfStock: 'ದಾಸ್ತಾನು ಮುಗಿದಿದೆ',
  lowStock: 'ಕಡಿಮೆ ದಾಸ್ತಾನು',
  price: 'ಬೆಲೆ',
  quantity: 'ಪ್ರಮಾಣ',
  total: 'ಒಟ್ಟು',
  subtotal: 'ಉಪಮೊತ್ತ',
  date: 'ದಿನಾಂಕ',
  back: 'ಹಿಂದೆ',
  next: 'ಮುಂದೆ',
  loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
  close: 'ಮುಚ್ಚಿ',
  apply: 'ಅನ್ವಯಿಸಿ',
  reset: 'ಮರುಹೊಂದಿಸಿ',
  download: 'ಡೌನ್‌ಲೋಡ್',
  print: 'ಮುದ್ರಿಸಿ',
  success: 'ಯಶಸ್ವಿ',
  error: 'ದೋಷ ಉಂಟಾಗಿದೆ',
  warning: 'ಎಚ್ಚರಿಕೆ',
  info: 'ಮಾಹಿತಿ',
  welcomeBack: 'ಪುನಃ ಸ್ವಾಗತ',
  home: 'ಮುಖಪುಟ',
  dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
  profile: 'ಪ್ರೊಫೈಲ್',
  settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
  notifications: 'ಸೂಚನೆಗಳು',
  myCart: 'ನನ್ನ ಕಾರ್ಟ್',
  logout: 'ಲಾಗ್ ಔಟ್',
  selectLanguage: 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
  viewAll: 'ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ',
  details: 'ವಿವರಗಳು',

  // Auth
  login: 'ಲಾಗಿನ್',
  register: 'ನೋಂದಾಯಿಸಿ',
  signInPortal: 'ನಿಮ್ಮ ಪೋರ್ಟಲ್‌ಗೆ ಲಾಗಿನ್ ಮಾಡಿ',
  continueWithGoogle: 'ಗೂಗಲ್ ಮೂಲಕ ಮುಂದುವರಿಯಿರಿ',
  orSignInWith: 'ಅಥವಾ ವಿವರಗಳೊಂದಿಗೆ ಲಾಗಿನ್ ಮಾಡಿ',
  orRegisterManual: 'ಅಥವಾ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ ನೋಂದಾಯಿಸಿ',
  emailPlaceholder: 'ಇಮೇಲ್ ವಿಳಾಸ',
  passwordPlaceholder: 'ಪಾಸ್‌ವರ್ಡ್',
  forgotPassword: 'ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?',
  rememberMe: 'ನನ್ನನ್ನು ನೆನಪಿಡಿ',
  dontHaveAccount: 'ಖಾತೆ ಇಲ್ಲವೇ? ಈಗಲೇ ನೋಂದಾಯಿಸಿ',
  alreadyHaveAccount: 'ಈಗಾಗಲೇ ಖಾತೆ ಹೊಂದಿದ್ದೀರಾ? ಲಾಗಿನ್ ಮಾಡಿ',
  loginAs: 'ಹೀಗೆ ಲಾಗಿನ್ ಆಗಿ:',
  roleFarmer: 'ರೈತ (ಉತ್ಪಾದಕ)',
  roleBuyer: 'ಖರೀದಿದಾರ / ಗ್ರಾಹಕ',
  roleAdmin: 'ವೇದಿಕೆ ನಿರ್ವಾಹಕ',

  // Farmer
  farmerPortal: 'ರೈತ ಪೋರ್ಟಲ್',
  farmerDashboard: 'ರೈತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
  myCrops: 'ನನ್ನ ಬೆಳೆಗಳು',
  addCrop: 'ಹೊಸ ಬೆಳೆಯನ್ನು ಸೇರಿಸಿ',
  cropName: 'ಬೆಳೆಯ ಹೆಸರು',
  cropCategory: 'ಬೆಳೆಯ ವರ್ಗ',
  cropPricePerKg: 'ಬೆಲೆ (ಪ್ರತಿ ಕೆಜಿಗೆ ₹)',
  cropQuantityKg: 'ಲಭ್ಯವಿರುವ ಪ್ರಮಾಣ (ಕೆಜಿಗಳಲ್ಲಿ)',
  cropDescription: 'ಬೆಳೆ ವಿವರಣೆ ಮತ್ತು ಗುಣಮಟ್ಟ',
  cropHarvestDate: 'ಕೊಯ್ಲು ದಿನಾಂಕ',
  organicCertified: 'ಸಾವಯವ ಪ್ರಮಾಣೀಕೃತ',
  cropImages: 'ಬೆಳೆಯ ಚಿತ್ರಗಳು',
  farmerOrders: 'ಸ್ವೀಕರಿಸಿದ ಆರ್ಡರ್‌ಗಳು',
  acceptOrder: 'ಆರ್ಡರ್ ಸ್ವೀಕರಿಸಿ',
  rejectOrder: 'ಆರ್ಡರ್ ತಿರಸ್ಕರಿಸಿ',
  fulfillOrder: 'ಆರ್ಡರ್ ಪೂರ್ಣಗೊಳಿಸಿ',
  farmerRevenue: 'ಒಟ್ಟು ಆದಾಯ',
  totalCropsListed: 'ನೋಂದಾಯಿತ ಬೆಳೆಗಳು',
  farmerVerification: 'ರೈತ ಪರಿಶೀಲನಾ ದಾಖಲೆಗಳು',
  uploadLandDocument: 'ಭೂಮಾಲೀಕತ್ವದ ದಾಖಲೆ (ಪಹಣಿ/RTC)',
  verificationPending: 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ',
  verificationApproved: 'ದೃಢೀಕರಿಸಲಾಗಿದೆ',

  // Customer
  buyerPortal: 'ಖರೀದಿದಾರ ಪೋರ್ಟಲ್',
  buyerDashboard: 'ಮಾರುಕಟ್ಟೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
  browseProduce: 'ತಾಜಾ ಕೃಷಿ ಉತ್ಪನ್ನಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
  addToCart: 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ',
  buyNow: 'ಈಗಲೇ ಖರೀದಿಸಿ',
  cartEmpty: 'ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ',
  checkout: 'ಚೆಕ್‌ಔಟ್',
  shippingAddress: 'ವಿತರಣಾ ವಿಳಾಸ',
  paymentMethod: 'ಪಾವತಿ ವಿಧಾನ',
  paySimulated: 'ಪಾವತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ (ಸಿಮ್ಯುಲೇಶನ್)',
  orderPlaced: 'ಆರ್ಡರ್ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!',
  myOrders: 'ನನ್ನ ಆರ್ಡರ್‌ಗಳು',
  trackOrder: 'ಆರ್ಡರ್ ಟ್ರ್ಯಾಕಿಂಗ್',
  orderStatus: 'ಆರ್ಡರ್ ಸ್ಥಿತಿ',
  orderDate: 'ಆರ್ಡರ್ ದಿನಾಂಕ',
  invoice: 'ಸರಕುಪಟ್ಟಿ / ರಶೀದಿ',
  viewInvoice: 'ಸರಕುಪಟ್ಟಿ ವೀಕ್ಷಿಸಿ',

  // Agriculture
  cropAdvisory: 'ಬೆಳೆ & ಮಣ್ಣಿನ ಸಲಹೆ',
  soilType: 'ಮಣ್ಣಿನ ಪ್ರಕಾರ',
  soilBlack: 'ಕಪ್ಪು ಮಣ್ಣು',
  soilRed: 'ಕೆಂಪು ಮಣ್ಣು',
  soilAlluvial: 'ಮೆಕ್ಕಲು ಮಣ್ಣು',
  soilClay: 'ಜೇಡಿ ಮಣ್ಣು',
  soilSandy: 'ಮರಳು ಮಣ್ಣು',
  season: 'ಕೃಷಿ ಹಂಗಾಮು',
  seasonKharif: 'ಖಾರಿಫ್ / ಮುಂಗಾರು (ಮಳೆಗಾಲ)',
  seasonRabi: 'ರಬಿ / ಹಿಂಗಾರು (ಚಳಿಗಾಲ)',
  seasonZaid: 'ಜೈದ್ / ಬೇಸಿಗೆ ಹಂಗಾಮು',
  recommendedCrops: 'ಶಿಫಾರಸು ಮಾಡಲಾದ ಬೆಳೆಗಳು',
  smartSowingPlanner: 'ಸ್ಮಾರ್ಟ್ ಬಿತ್ತನೆ ಯೋಜಕ',
  fertilizerAdvisory: 'ಗೊಬ್ಬರ ಸಲಹೆ (NPK ಪ್ರಮಾಣ)',
  pestControl: 'ಕೀಟ ಮತ್ತು ರೋಗ ನಿಯಂತ್ರಣ',
  companionCrops: 'ಮಿಶ್ರ / ಅಂತರ ಬೆಳೆಗಳು',
  expectedYield: 'ನಿರೀಕ್ಷಿತ ಇಳುವರಿ',

  // Weather
  weatherForecast: 'ನೇರ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ',
  currentTemp: 'ಪ್ರಸ್ತುತ ತಾಪಮಾನ',
  humidity: 'ಗಾಳಿಯ ತೇವಾಂಶ',
  soilMoisture: 'ಮಣ್ಣಿನ ತೇವಾಂಶ ಮಟ್ಟ',
  windSpeed: 'ಗಾಳಿಯ ವೇಗ',
  rainChance: 'ಮಳೆಯ ಸಾಧ್ಯತೆ',
  weatherAdvisory: 'ಕೃಷಿ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ',

  // Market
  marketDemand: 'ಮಾರುಕಟ್ಟೆ ಬೇಡಿಕೆ ಮತ್ತು ಎಪಿಎಂಸಿ ದರಗಳು',
  currentMandiRate: 'ಪ್ರಸ್ತುತ ಮಂಡಿ ಬೆಲೆ',
  priceTrend: 'ಬೆಲೆ ಏರಿಳಿತ',
  highDemand: 'ಹೆಚ್ಚಿನ ಬೇಡಿಕೆ',
  moderateDemand: 'ಮಧ್ಯಮ ಬೇಡಿಕೆ',
  priceForecast: 'ಬೆಲೆ ಮುನ್ಸೂಚನೆ',

  // Chatbot
  agriBotTitle: 'ಅಗ್ರಿಬಾಟ್ AI ಕೃಷಿ ಸಹಾಯಕ',
  agriBotSubtitle: 'ಆನ್‌ಲೈನ್ • ತಜ್ಞ ಕೃಷಿ ಸಲಹೆಗಾರ',
  agriBotWelcome: 'ನಮಸ್ಕಾರ! 🙏 ನಾನು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಅಗ್ರಿಬಾಟ್ AI ಕೃಷಿ ಸಹಾಯಕ 🌾. ಬೆಳೆಗಳು, ರೋಗಗಳು, ಗೊಬ್ಬರಗಳು, ಮಾರುಕಟ್ಟೆ ದರಗಳು ಅಥವಾ ಆರ್ಡರ್‌ಗಳ ಬಗ್ಗೆ ಏನು ಬೇಕಾದರೂ ಕೇಳಿ!',
  agriBotPlaceholder: 'ಬೆಳೆಗಳು, ಮಣ್ಣು, ಹವಾಮಾನ, ಮಂಡಿ ಬೆಲೆಗಳು, ಆರ್ಡರ್‌ಗಳ ಬಗ್ಗೆ ಕೇಳಿ...',
  quickHello: '👋 ನಮಸ್ಕಾರ ಹೇಳಿ',
  quickProducts: '🌾 ಬೆಳೆಗಳು ಮತ್ತು ರೈತರ ಪಟ್ಟಿ',
  quickRecommend: '🌱 ಬೆಳೆ ಶಿಫಾರಸು',
  quickPest: '🐛 ಕೀಟ ಮತ್ತು ರೋಗ ನಿಯಂತ್ರಣ',
  quickWeather: '🌤️ ನೇರ ಹವಾಮಾನ',
  quickOrders: '📦 ನನ್ನ ಆರ್ಡರ್‌ಗಳ ಸ್ಥಿತಿ',
  quickMarket: '📈 ಮಾರುಕಟ್ಟೆ ಟ್ರೆಂಡ್‌ಗಳು',

  // Invoice
  officialTaxInvoice: 'ಅಗ್ರಿ-ಕನೆಕ್ಟ್ ಅಧಿಕೃತ ತೆರಿಗೆ ಸರಕುಪಟ್ಟಿ',
  printDownloadPdf: 'ಮುದ್ರಿಸಿ / PDF ಡೌನ್‌ಲೋಡ್',
  sellerDetails: 'ಮಾರಾಟಗಾರ (ನೋಂದಾಯಿತ ರೈತ)',
  buyerDetails: 'ಖರೀದಿದಾರ (ಗ್ರಾಹಕ)',
  itemDescription: 'ವಸ್ತುವಿನ ವಿವರಣೆ',
  hsnSac: 'HSN/SAC ಕೋಡ್',
  ratePerUnit: 'ಯೂನಿಟ್ ದರ',
  amount: 'ಮೊತ್ತ',
  gstExempt: 'ತಾಜಾ ಕೃಷಿ ಉತ್ಪನ್ನಗಳಿಗೆ ಜಿಎಸ್‌ಟಿ ವಿನಾಯಿತಿ ಇದೆ',
  totalPayable: 'ಒಟ್ಟು ಪಾವತಿಸಬೇಕಾದ ಮೊತ್ತ',
  paymentConfirmed: 'ಪಾವತಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ',

  // Notifications
  notificationsTitle: 'ಸೂಚನೆಗಳು',
  markAllAsRead: 'ಎಲ್ಲವನ್ನೂ ಓದಿದ್ದೀರಿ ಎಂದು ಗುರುತಿಸಿ',
  noNotifications: 'ಯಾವುದೇ ಹೊಸ ಸೂಚನೆಗಳಿಲ್ಲ',
  orderPlacedNotice: 'ನಿಮ್ಮ ಆರ್ಡರ್ ಯಶಸ್ವಿಯಾಗಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ',
  orderShippedNotice: 'ನಿಮ್ಮ ಆರ್ಡರ್ ರವಾನೆಯಾಗಿದೆ',
  orderDeliveredNotice: 'ನಿಮ್ಮ ಆರ್ಡರ್ ತಲುಪಿಸಲಾಗಿದೆ',
};

// Now build the consolidated database for all keys
const namespaces = [
  'common',
  'auth',
  'farmer',
  'customer',
  'admin',
  'agriculture',
  'weather',
  'market',
  'chatbot',
  'notifications',
  'invoice'
];

const locales = {
  en: {},
  ta: {},
  hi: {},
  te: {},
  ml: {},
  kn: {}
};

namespaces.forEach(ns => {
  locales.en[ns] = {};
  locales.ta[ns] = {};
  locales.hi[ns] = {};
  locales.te[ns] = {};
  locales.ml[ns] = {};
  locales.kn[ns] = {};
});

// Populate existing keys into respective namespaces
Object.keys(existingKeys).forEach(key => {
  const ns = assignNamespace(key);
  const item = existingKeys[key];
  locales.en[ns][key] = item.en;
  locales.hi[ns][key] = item.hi;
  locales.ta[ns][key] = item.ta;

  // Telugu
  locales.te[ns][key] = translationsTe[key] || item.hi || item.en;
  // Malayalam
  locales.ml[ns][key] = translationsMl[key] || item.ta || item.en;
  // Kannada
  locales.kn[ns][key] = translationsKn[key] || item.hi || item.en;
});

// Also add domain-specific keys defined in translationsTe, translationsMl, translationsKn
const allCustomKeys = new Set([
  ...Object.keys(translationsTe),
  ...Object.keys(translationsMl),
  ...Object.keys(translationsKn)
]);

allCustomKeys.forEach(k => {
  const ns = assignNamespace(k);
  if (!locales.en[ns][k]) {
    locales.en[ns][k] = existingKeys[k]?.en || k;
  }
  if (!locales.hi[ns][k]) {
    locales.hi[ns][k] = existingKeys[k]?.hi || locales.en[ns][k];
  }
  if (!locales.ta[ns][k]) {
    locales.ta[ns][k] = existingKeys[k]?.ta || locales.en[ns][k];
  }
  if (translationsTe[k]) locales.te[ns][k] = translationsTe[k];
  if (translationsMl[k]) locales.ml[ns][k] = translationsMl[k];
  if (translationsKn[k]) locales.kn[ns][k] = translationsKn[k];
});

// Write JSON files for each language and namespace
const targetDir = path.join(__dirname, '..', 'src', 'i18n', 'locales');
['en', 'ta', 'hi', 'te', 'ml', 'kn'].forEach(lang => {
  const langDir = path.join(targetDir, lang);
  fs.mkdirSync(langDir, { recursive: true });
  namespaces.forEach(ns => {
    const filePath = path.join(langDir, `${ns}.json`);
    fs.writeFileSync(filePath, JSON.stringify(locales[lang][ns], null, 2), 'utf8');
  });
  console.log(`Generated ${namespaces.length} JSON files for language [${lang}]`);
});

// Create index.ts for i18n
const i18nIndexContent = `import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import English locales
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enFarmer from './locales/en/farmer.json';
import enCustomer from './locales/en/customer.json';
import enAdmin from './locales/en/admin.json';
import enAgriculture from './locales/en/agriculture.json';
import enWeather from './locales/en/weather.json';
import enMarket from './locales/en/market.json';
import enChatbot from './locales/en/chatbot.json';
import enNotifications from './locales/en/notifications.json';
import enInvoice from './locales/en/invoice.json';

// Import Tamil locales
import taCommon from './locales/ta/common.json';
import taAuth from './locales/ta/auth.json';
import taFarmer from './locales/ta/farmer.json';
import taCustomer from './locales/ta/customer.json';
import taAdmin from './locales/ta/admin.json';
import taAgriculture from './locales/ta/agriculture.json';
import taWeather from './locales/ta/weather.json';
import taMarket from './locales/ta/market.json';
import taChatbot from './locales/ta/chatbot.json';
import taNotifications from './locales/ta/notifications.json';
import taInvoice from './locales/ta/invoice.json';

// Import Hindi locales
import hiCommon from './locales/hi/common.json';
import hiAuth from './locales/hi/auth.json';
import hiFarmer from './locales/hi/farmer.json';
import hiCustomer from './locales/hi/customer.json';
import hiAdmin from './locales/hi/admin.json';
import hiAgriculture from './locales/hi/agriculture.json';
import hiWeather from './locales/hi/weather.json';
import hiMarket from './locales/hi/market.json';
import hiChatbot from './locales/hi/chatbot.json';
import hiNotifications from './locales/hi/notifications.json';
import hiInvoice from './locales/hi/invoice.json';

// Import Telugu locales
import teCommon from './locales/te/common.json';
import teAuth from './locales/te/auth.json';
import teFarmer from './locales/te/farmer.json';
import teCustomer from './locales/te/customer.json';
import teAdmin from './locales/te/admin.json';
import teAgriculture from './locales/te/agriculture.json';
import teWeather from './locales/te/weather.json';
import teMarket from './locales/te/market.json';
import teChatbot from './locales/te/chatbot.json';
import teNotifications from './locales/te/notifications.json';
import teInvoice from './locales/te/invoice.json';

// Import Malayalam locales
import mlCommon from './locales/ml/common.json';
import mlAuth from './locales/ml/auth.json';
import mlFarmer from './locales/ml/farmer.json';
import mlCustomer from './locales/ml/customer.json';
import mlAdmin from './locales/ml/admin.json';
import mlAgriculture from './locales/ml/agriculture.json';
import mlWeather from './locales/ml/weather.json';
import mlMarket from './locales/ml/market.json';
import mlChatbot from './locales/ml/chatbot.json';
import mlNotifications from './locales/ml/notifications.json';
import mlInvoice from './locales/ml/invoice.json';

// Import Kannada locales
import knCommon from './locales/kn/common.json';
import knAuth from './locales/kn/auth.json';
import knFarmer from './locales/kn/farmer.json';
import knCustomer from './locales/kn/customer.json';
import knAdmin from './locales/kn/admin.json';
import knAgriculture from './locales/kn/agriculture.json';
import knWeather from './locales/kn/weather.json';
import knMarket from './locales/kn/market.json';
import knChatbot from './locales/kn/chatbot.json';
import knNotifications from './locales/kn/notifications.json';
import knInvoice from './locales/kn/invoice.json';

export const defaultNamespaces = [
  'common',
  'auth',
  'farmer',
  'customer',
  'admin',
  'agriculture',
  'weather',
  'market',
  'chatbot',
  'notifications',
  'invoice'
] as const;

export const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    farmer: enFarmer,
    customer: enCustomer,
    admin: enAdmin,
    agriculture: enAgriculture,
    weather: enWeather,
    market: enMarket,
    chatbot: enChatbot,
    notifications: enNotifications,
    invoice: enInvoice,
  },
  ta: {
    common: taCommon,
    auth: taAuth,
    farmer: taFarmer,
    customer: taCustomer,
    admin: taAdmin,
    agriculture: taAgriculture,
    weather: taWeather,
    market: taMarket,
    chatbot: taChatbot,
    notifications: taNotifications,
    invoice: taInvoice,
  },
  hi: {
    common: hiCommon,
    auth: hiAuth,
    farmer: hiFarmer,
    customer: hiCustomer,
    admin: hiAdmin,
    agriculture: hiAgriculture,
    weather: hiWeather,
    market: hiMarket,
    chatbot: hiChatbot,
    notifications: hiNotifications,
    invoice: hiInvoice,
  },
  te: {
    common: teCommon,
    auth: teAuth,
    farmer: teFarmer,
    customer: teCustomer,
    admin: teAdmin,
    agriculture: teAgriculture,
    weather: teWeather,
    market: teMarket,
    chatbot: teChatbot,
    notifications: teNotifications,
    invoice: teInvoice,
  },
  ml: {
    common: mlCommon,
    auth: mlAuth,
    farmer: mlFarmer,
    customer: mlCustomer,
    admin: mlAdmin,
    agriculture: mlAgriculture,
    weather: mlWeather,
    market: mlMarket,
    chatbot: mlChatbot,
    notifications: mlNotifications,
    invoice: mlInvoice,
  },
  kn: {
    common: knCommon,
    auth: knAuth,
    farmer: knFarmer,
    customer: knCustomer,
    admin: knAdmin,
    agriculture: knAgriculture,
    weather: knWeather,
    market: knMarket,
    chatbot: knChatbot,
    notifications: knNotifications,
    invoice: knInvoice,
  },
};

const savedLang = typeof window !== 'undefined' ? localStorage.getItem('agriconnect_language') : 'en';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang || 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'ta', 'hi', 'te', 'ml', 'kn'],
    defaultNS: 'common',
    ns: defaultNamespaces,
    fallbackNS: defaultNamespaces,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'agriconnect_language',
      caches: ['localStorage'],
    },
  });

export default i18n;
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'i18n', 'index.ts'), i18nIndexContent, 'utf8');
console.log('Generated src/i18n/index.ts with comprehensive i18next configuration.');
