// Comprehensive generator for AgriConnect i18n locales and backward-compatible translation dictionary.
const fs = require('fs');
const path = require('path');

// Read existing translations.ts
const transPath = path.join(__dirname, '..', 'src', 'services', 'translations.ts');
const rawCode = fs.readFileSync(transPath, 'utf8');

// Parse TRANSLATIONS object entries
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

console.log(`Successfully parsed ${Object.keys(existingKeys).length} existing keys from translations.ts`);

// Namespace mappings
function getNamespace(key) {
  if (key.startsWith('nav') || key.startsWith('app') || key.startsWith('btn') || key.startsWith('footer') || key.startsWith('role') || key.startsWith('action') || key.startsWith('search') || key.startsWith('status') || key.startsWith('close') || key.startsWith('save') || key.startsWith('cancel') || key.startsWith('back') || key.startsWith('loading') || key.startsWith('confirm') || key.startsWith('delete') || key.startsWith('edit') || key.startsWith('view') || key.startsWith('filter') || key.startsWith('sort') || key.startsWith('apply') || key.startsWith('reset') || key.startsWith('select') || key.startsWith('all') || key.startsWith('date') || key.startsWith('price') || key.startsWith('quantity') || key.startsWith('total') || key.startsWith('subtotal') || key.startsWith('success') || key.startsWith('error') || key.startsWith('warning') || key.startsWith('info') || key.startsWith('hero') || key.startsWith('feat') || key.startsWith('stat') || key.startsWith('step') || key.startsWith('why') || key.startsWith('faq') || key.startsWith('contact') || key.startsWith('about') || key.startsWith('terms') || key.startsWith('privacy') || key.startsWith('rights') || key.startsWith('tagline')) {
    return 'common';
  }
  if (key.startsWith('login') || key.startsWith('register') || key.startsWith('auth') || key.startsWith('password') || key.startsWith('email') || key.startsWith('phone') || key.startsWith('google') || key.startsWith('orSign') || key.startsWith('orReg') || key.startsWith('signIn') || key.startsWith('access') || key.startsWith('remember') || key.startsWith('forgot') || key.startsWith('alreadyHave') || key.startsWith('dontHave') || key.startsWith('createAcc') || key.startsWith('join') || key.startsWith('logout')) {
    return 'auth';
  }
  if (key.startsWith('farmer') || key.startsWith('crop') || key.startsWith('myCrops') || key.startsWith('addCrop') || key.startsWith('land') || key.startsWith('harvest') || key.startsWith('sowing') || key.startsWith('yield') || key.startsWith('field') || key.startsWith('farm') || key.startsWith('soil') || key.startsWith('pest') || key.startsWith('fertilizer') || key.startsWith('stock') || key.startsWith('verify') || key.startsWith('audit') || key.startsWith('verification')) {
    return 'farmer';
  }
  if (key.startsWith('buyer') || key.startsWith('cart') || key.startsWith('checkout') || key.startsWith('order') || key.startsWith('orders') || key.startsWith('track') || key.startsWith('tracking') || key.startsWith('delivery') || key.startsWith('shipping') || key.startsWith('address') || key.startsWith('product') || key.startsWith('products') || key.startsWith('shop') || key.startsWith('payment') || key.startsWith('review') || key.startsWith('rating')) {
    return 'customer';
  }
  if (key.startsWith('admin') || key.startsWith('manage') || key.startsWith('approve') || key.startsWith('reject') || key.startsWith('suspend') || key.startsWith('analytics') || key.startsWith('revenue') || key.startsWith('dispute') || key.startsWith('platform') || key.startsWith('users') || key.startsWith('buyers') || key.startsWith('farmers')) {
    return 'admin';
  }
  if (key.startsWith('weather') || key.startsWith('temp') || key.startsWith('humidity') || key.startsWith('rain') || key.startsWith('forecast') || key.startsWith('wind') || key.startsWith('climate') || key.startsWith('cloud')) {
    return 'weather';
  }
  if (key.startsWith('market') || key.startsWith('mandi') || key.startsWith('demand') || key.startsWith('trend') || key.startsWith('priceTrend') || key.startsWith('rate')) {
    return 'market';
  }
  if (key.startsWith('chat') || key.startsWith('bot') || key.startsWith('ai') || key.startsWith('agriBot') || key.startsWith('ask') || key.startsWith('prompt') || key.startsWith('assistant')) {
    return 'chatbot';
  }
  if (key.startsWith('notif') || key.startsWith('alert') || key.startsWith('message') || key.startsWith('badge')) {
    return 'notifications';
  }
  if (key.startsWith('invoice') || key.startsWith('bill') || key.startsWith('tax') || key.startsWith('gst') || key.startsWith('hsn') || key.startsWith('receipt') || key.startsWith('downloadInvoice') || key.startsWith('printInvoice')) {
    return 'invoice';
  }
  return 'common';
}

console.log('Building dictionary with translations across all 6 supported languages...');
