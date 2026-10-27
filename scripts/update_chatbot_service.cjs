const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'src', 'services', 'aiChatbotService.ts');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Update LanguageCode type
content = content.replace(
  "export type LanguageCode = 'en' | 'hi' | 'mr' | 'ta';",
  "export type LanguageCode = 'en' | 'ta' | 'hi' | 'te' | 'ml' | 'kn' | 'mr';"
);

// Helper function to append te, ml, kn branches right after ta branch
function addSouthIndianLanguages(source, searchPattern, teCode, mlCode, knCode) {
  return source.replace(searchPattern, (match) => {
    return `${match} else if (language === 'te') {\n        botResponseText = ${teCode};\n      } else if (language === 'ml') {\n        botResponseText = ${mlCode};\n      } else if (language === 'kn') {\n        botResponseText = ${knCode};\n      }`;
  });
}

// 2. Greetings branch
content = content.replace(
  /\} else if \(language === 'ta'\) \{\s*botResponseText = `வணக்கம் \$\{userName\}![\s\S]*?`\s*;\s*\}/,
  `} else if (language === 'ta') {
        botResponseText = \`வணக்கம் \${userName}! 🙏 உங்களை சந்திப்பதில் மிக்க மகிழ்ச்சி!\\n\` +
          \`எப்படி இருக்கிறீர்கள்? நான் உங்கள் தனிப்பட்ட அக்ரிபாட் நண்பன் 🌾.\\n\\n\` +
          \`பயிர்கள், வானிலை, சந்தை விலை அல்லது ஆர்டர்கள் பற்றி என்னிடம் கேட்கலாம்!\`;
      } else if (language === 'te') {
        botResponseText = \`నమస్కారం \${userName}! 🙏 మిమ్మల్ని కలవడం చాలా సంతోషంగా ఉంది!\\n\` +
          \`మీరు ఎలా ఉన్నారు? నేను మీ వ్యక్తిగత అగ్రిబాట్ AI వ్యవసాయ సహాయకుడిని 🌾.\\n\\n\` +
          \`పంటల సలహా, తెగుళ్ల నివారణ, \${userLocation} వాతావరణం, మండి ధరలు లేదా ఆర్డర్ల వివరాలు—ఏదైనా నన్ను అడగవచ్చు!\`;
      } else if (language === 'ml') {
        botResponseText = \`നമസ്കാരം \${userName}! 🙏 നിങ്ങളോട് സംസാരിക്കുന്നതിൽ വലിയ സന്തോഷം!\\n\` +
          \`സുഖമാണോ? ഞാൻ നിങ്ങളുടെ സ്വകാര്യ അഗ്രിബോട്ട് AI കാർഷിക സഹായിയാണ് 🌾.\\n\\n\` +
          \`വിളകൾ, രോഗങ്ങൾ, \${userLocation} കാലാവസ്ഥ, വിപണി വില, ഓർഡർ നില എന്നിവയെക്കുറിച്ച് എന്ത് വേണമെങ്കിലും ചോദിക്കാം!\`;
      } else if (language === 'kn') {
        botResponseText = \`ನಮಸ್ಕಾರ \${userName}! 🙏 ನಿಮ್ಮೊಂದಿಗೆ ಮಾತನಾಡಲು ನನಗೆ ಸಂತೋಷವಾಗಿದೆ!\\n\` +
          \`ಹೇಗಿದ್ದೀರಿ? ನಾನು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಅಗ್ರಿಬಾಟ್ AI ಕೃಷಿ ಸಹಾಯಕ 🌾.\\n\\n\` +
          \`ಬೆಳೆ ಸಲಹೆ, ಕೀಟ ನಿಯಂತ್ರಣ, \${userLocation} ಹವಾಮಾನ, ಮಾರುಕಟ್ಟೆ ದರಗಳು ಅಥವಾ ಆರ್ಡರ್ ಸ್ಥಿತಿಯ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ!\`;
      }`
);

// 3. Small talk "how are you"
content = content.replace(
  /\} else if \(language === 'ta'\) \{\s*botResponseText = `நான் மிகவும் நன்றாக இருக்கிறேன்[\s\S]*?`\s*;\s*\}/,
  `} else if (language === 'ta') {
        botResponseText = \`நான் மிகவும் நன்றாக இருக்கிறேன், கேட்டதற்கு நன்றி \${userName}! 😊\\n\` +
          \`உங்கள் நாள் எப்படி போகிறது?\`;
      } else if (language === 'te') {
        botResponseText = \`నేను చాలా బాగున్నాను, అడిగినందుకు ధన్యవాదాలు \${userName}! 😊\\n\` +
          \`మీ వ్యవసాయ పనులకు సహాయం చేయడానికి నేను ఎల్లప్పుడూ సిద్ధంగా ఉన్నాను. మీ రోజు ఎలా గడుస్తోంది?\`;
      } else if (language === 'ml') {
        botResponseText = \`ഞാൻ സുഖമായിരിക്കുന്നു, ചോദിച്ചതിന് നന്ദി \${userName}! 😊\\n\` +
          \`നിങ്ങളെ സഹായിക്കാൻ ഞാൻ സദാ സന്നദ്ധനാണ്. നിങ്ങളുടെ ഇന്നത്തെ ദിവസം എങ്ങനെയുണ്ട്?\`;
      } else if (language === 'kn') {
        botResponseText = \`ನಾನು ತುಂಬಾ ಚೆನ್ನಾಗಿದ್ದೇನೆ, ವಿಚಾರಿಸಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು \${userName}! 😊\\n\` +
          \`ನಿಮ್ಮ ಕೃಷಿ ಕಾರ್ಯಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಲು ಸದಾ ಸಿದ್ಧ. ನಿಮ್ಮ ದಿನ ಹೇಗಿದೆ?\`;
      }`
);

// 4. "Thank you"
content = content.replace(
  /\} else if \(language === 'ta'\) \{\s*botResponseText = `மிக்க மகிழ்ச்சி \$\{userName\}! 🌟[\s\S]*?`\s*;\s*\}/,
  `} else if (language === 'ta') {
        botResponseText = \`மிக்க மகிழ்ச்சி \${userName}! 🌟 உங்களுக்கு உதவ முடிந்தது மகிழ்ச்சி!\`;
      } else if (language === 'te') {
        botResponseText = \`మీకు చాలా స్వాగతం, \${userName}! 🌟\\n\` +
          \`మీకు సహాయపడటం నాకు ఎంతో ఆనందంగా ఉంది. ఎప్పుడైనా మళ్లీ అడగండి!\`;
      } else if (language === 'ml') {
        botResponseText = \`സ്വാഗതം, \${userName}! 🌟\\n\` +
          \`നിങ്ങളെ സഹായിക്കാൻ കഴിഞ്ഞതിൽ സന്തോഷം. ആവശ്യമുള്ളപ്പോൾ വീണ്ടും ചോദിക്കൂ!\`;
      } else if (language === 'kn') {
        botResponseText = \`ನಿಮಗೆ ಹೃತ್ಪೂರ್ವಕ ಸ್ವಾಗತ, \${userName}! 🌟\\n\` +
          \`ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಸಂತೋಷವಾಗಿದೆ. ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ಮತ್ತೆ ಕೇಳಿ!\`;
      }`
);

// 5. Products & Farmers list
content = content.replace(
  /\} else if \(language === 'ta'\) \{\s*botResponseText = `🌾 \*\*MongoDB-ல் இருந்து நேரடியாக[\s\S]*?`\s*;\s*\}/,
  `} else if (language === 'ta') {
        botResponseText = \`🌾 **MongoDB-ல் இருந்து நேரடியாக பெறப்பட்ட விளைபொருட்கள் மற்றும் விவசாயிகள் பட்டியல்**:\\n\\n\` +
          mongoCrops.map((c, i) => 
            \`### \${i + 1}. **\${c.name}**\\n\` +
            \`• **விவசாயி பெயர்**: \${c.farmerName} (⭐ \${c.farmerRating} / 5.0)\\n\` +
            \`• **இடம்**: \${c.farmLocation || c.farmerLocation}\\n\` +
            \`• **விலை**: ₹\${c.pricePerUnit.toLocaleString('en-IN')}/\${c.unit} | **இருப்பு**: \${c.quantity.toLocaleString('en-IN')} \${c.unit}\\n\` +
            \`• **தொடர்பு**: \${c.farmerPhone || '+91 98765 43210'}\`
          ).join('\\n\\n---\\n\\n');
      } else if (language === 'te') {
        botResponseText = \`🌾 **మాంగోడిబి (MongoDB Atlas) నుండి ప్రత్యక్ష పంటలు మరియు రైతుల జాబితా**:\\n\\n\` +
          mongoCrops.map((c, i) => 
            \`### \${i + 1}. **\${c.name}**\\n\` +
            \`• **రైతు పేరు**: \${c.farmerName} (⭐ \${c.farmerRating} / 5.0)\\n\` +
            \`• **పొలం ప్రాంతం**: \${c.farmLocation || c.farmerLocation}\\n\` +
            \`• **ధర**: ₹\${c.pricePerUnit.toLocaleString('en-IN')}/\${c.unit} | **స్టాక్**: \${c.quantity.toLocaleString('en-IN')} \${c.unit}\\n\` +
            \`• **రైతు ఫోన్**: \${c.farmerPhone || '+91 98765 43210'}\`
          ).join('\\n\\n---\\n\\n');
      } else if (language === 'ml') {
        botResponseText = \`🌾 **മോംഗോഡിബിയിൽ നിന്നുള്ള തത്സമയ വിളകളും കർഷകരും**:\\n\\n\` +
          mongoCrops.map((c, i) => 
            \`### \${i + 1}. **\${c.name}**\\n\` +
            \`• **കർഷകന്റെ പേര്**: \${c.farmerName} (⭐ \${c.farmerRating} / 5.0)\\n\` +
            \`• **സ്ഥലം**: \${c.farmLocation || c.farmerLocation}\\n\` +
            \`• **വില**: ₹\${c.pricePerUnit.toLocaleString('en-IN')}/\${c.unit} | **ലഭ്യത**: \${c.quantity.toLocaleString('en-IN')} \${c.unit}\\n\` +
            \`• **ബന്ധപ്പെടുക**: \${c.farmerPhone || '+91 98765 43210'}\`
          ).join('\\n\\n---\\n\\n');
      } else if (language === 'kn') {
        botResponseText = \`🌾 **ಮೋಂಗೋಡಿಬಿಯಿಂದ ನೇರ ಬೆಳೆಗಳು ಮತ್ತು ರೈತರ ಪಟ್ಟಿ**:\\n\\n\` +
          mongoCrops.map((c, i) => 
            \`### \${i + 1}. **\${c.name}**\\n\` +
            \`• **ರೈತರ ಹೆಸರು**: \${c.farmerName} (⭐ \${c.farmerRating} / 5.0)\\n\` +
            \`• **ಸ್ಥಳ**: \${c.farmLocation || c.farmerLocation}\\n\` +
            \`• **ಬೆಲೆ**: ₹\${c.pricePerUnit.toLocaleString('en-IN')}/\${c.unit} | **ದಾಸ್ತಾನು**: \${c.quantity.toLocaleString('en-IN')} \${c.unit}\\n\` +
            \`• **ಸಂಪರ್ಕ**: \${c.farmerPhone || '+91 98765 43210'}\`
          ).join('\\n\\n---\\n\\n');
      }`
);

// 6. Yellowing leaves pest diagnostic
content = content.replace(
  /\} else if \(language === 'ta'\) \{\s*botResponseText = `🍂 \*\*அக்ரிபாட் நோய் கண்டறிதல்[\s\S]*?`\s*;\s*\}/,
  `} else if (language === 'ta') {
          botResponseText = \`🍂 **அக்ரிபாட் நோய் கண்டறிதல் (Gemini Diagnostic Engine)**:\\n\` +
            \`• **காரணம்**: இலைகள் மஞ்சள் நிறமாதல் (நைட்ரஜன் குறைபாடு அல்லது அதிக நீர் தேங்குதல்).\\n\` +
            \`• **உடனடி தீர்வு**: ஏக்கருக்கு 15-20 கிலோ யூரியா உரமிட்டு பாசனம் சீர்செய்யவும்.\\n\` +
            \`• **இயற்கை முறை**: பூச்சிகளைக் கட்டுப்படுத்த 5% வேப்ப எண்ணெய் தெளிக்கவும்.\`;
        } else if (language === 'te') {
          botResponseText = \`🍂 **అగ్రిబాట్ తెగుళ్ల నిర్ధారణ (Gemini Diagnostic Engine)**:\\n\` +
            \`• **కారణం**: ఆకులు పసుపు రంగులోకి మారడం (నైట్రోజన్ లోపం లేదా వేర్లలో నీరు నిల్వ ఉండటం).\\n\` +
            \`• **చికిత్స**: నేల ఆరిన తర్వాత ఎకరానికి 15-20 కిలోల యూరియా వేయండి.\\n\` +
            \`• **సేంద్రీయ రక్షణ**: రసం పీల్చే పురుగుల నివారణకు 5% వేపనూనె పిచికారీ చేయండి.\`;
        } else if (language === 'ml') {
          botResponseText = \`🍂 **അഗ്രിബോട്ട് രോഗനിർണ്ണയം (Gemini Diagnostic Engine)**:\\n\` +
            \`• **കാരണം**: ഇലകൾ മഞ്ഞനിറമാകുന്നത് (നൈട്രജന്റെ കുറവ് അല്ലെങ്കിൽ വേരുകളിൽ വെള്ളം കെട്ടിക്കിടക്കുന്നത്).\\n\` +
            \`• **പരിഹാരം**: ഏക്കറിന് 15-20 കിലോഗ്രാം യൂറിയ നൽകുക.\\n\` +
            \`• **ജൈവ നിയന്ത്രണം**: 5% വേപ്പെണ്ണ സ്പ്രേ ചെയ്യുക.\`;
        } else if (language === 'kn') {
          botResponseText = \`🍂 **ಅಗ್ರಿಬಾಟ್ ರೋಗ ನಿರ್ಣಯ (Gemini Diagnostic Engine)**:\\n\` +
            \`• **ಕಾರಣ**: ಎಲೆಗಳು ಹಳದಿಯಾಗುವುದು (ಸಾರಜನಕದ ಕೊರತೆ ಅಥವಾ ಬೇರುಗಳಲ್ಲಿ ನೀರು ನಿಲ್ಲುವುದು).\\n\` +
            \`• **ಪರಿಹಾರ**: ನೀರು ಸರಾಗವಾಗಿ ಹರಿದುಹೋದ ನಂತರ ಎಕರೆಗೆ 15-20 ಕೆಜಿ ಯೂರಿಯಾ ಸಿಂಪಡಿಸಿ.\\n\` +
            \`• **ಸಾವಯವ ರಕ್ಷಣೆ**: ಕೀಟಗಳ ನಿಯಂತ್ರಣಕ್ಕಾಗಿ 5% ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ.\`;
        }`
);

// 7. NPK advisory
content = content.replace(
  /\} else if \(language === 'ta'\) \{\s*botResponseText = `🧪 \*\*NPK மண் உரம் மற்றும் ஊட்டச்சத்து மேலாண்மை\*\*[\s\S]*?`\s*;\s*\}/,
  `} else if (language === 'ta') {
        botResponseText = \`🧪 **NPK மண் உரம் மற்றும் ஊட்டச்சத்து மேலாண்மை**:\\n\` +
          \`• **விகிதம்**: 4:2:1 (நைட்ரஜன் : பாஸ்பரஸ் : பொட்டாஷ்)\\n\` +
          \`• **அடி உரம்**: 100% பாஸ்பரஸ், பொட்டாஷ் மற்றும் 50% நைட்ரஜன் நில தயாரிப்பின் போது இடவும்.\\n\` +
          \`• **மேல் உரம்**: மீதி 50% நைட்ரஜனை 30 மற்றும் 50 நாட்களில் யூரியாவாக இடவும்.\`;
      } else if (language === 'te') {
        botResponseText = \`🧪 **ఎన్‌పికె (NPK) నేల సారవంతం & ఎరువుల యాజమాన్యం**:\\n\` +
          \`• **ప్రామాణిక నిష్పత్తి**: 4:2:1 (నత్రజని : భాస్వరం : పొటాష్)\\n\` +
          \`• **దుక్కిలో వేయవలసిన ఎరువు**: పొలం తయారుచేసేటప్పుడు 100% భాస్వరం, పొటాష్ మరియు 50% నత్రజని వేయండి.\\n\` +
          \`• **పైపాటు ఎరువు**: మిగిలిన 50% నత్రజనిని పంట 30 మరియు 50 రోజుల దశలో యూరియా రూపంలో వేయండి.\`;
      } else if (language === 'ml') {
        botResponseText = \`🧪 **NPK വളപ്രയോഗവും മണ്ണ് പരിപാലനവും**:\\n\` +
          \`• **അനുപാതം**: 4:2:1 (നൈട്രജൻ : ഫോസ്ഫറസ് : പൊട്ടാഷ്)\\n\` +
          \`• **അടിവളം**: നിലമൊരുക്കുമ്പോൾ 100% ഫോസ്ഫറസ്, പൊട്ടാഷ് എന്നിവയും 50% നൈട്രജനും നൽകുക.\\n\` +
          \`• **മേൽവളം**: ബാക്കി 50% നൈട്രജൻ 30, 50 ദിവസങ്ങളിൽ യൂറിയയായി നൽകുക.\`;
      } else if (language === 'kn') {
        botResponseText = \`🧪 **ಎನ್‌ಪಿಕೆ (NPK) ಸಮತೋಲಿತ ಗೊಬ್ಬರ ನಿರ್ವಹಣೆ**:\\n\` +
          \`• **ಪ್ರಮಾಣ**: 4:2:1 (ಸಾರಜನಕ : ರಂಜಕ : ಪೊಟ್ಯಾಷ್)\\n\` +
          \`• **ಬುಡಗೊಬ್ಬರ**: ಜಮೀನು ಸಿದ್ಧಪಡಿಸುವಾಗ 100% ರಂಜಕ ಮತ್ತು ಪೊಟ್ಯಾಷ್ ಹಾಗೂ 50% ಸಾರಜನಕ ನೀಡಿ.\\n\` +
          \`• **ಮೇಲುಗೊಬ್ಬರ**: ಉಳಿದ 50% ಸಾರಜನಕವನ್ನು ಬೆಳೆಯು 30 ಮತ್ತು 50 ದಿನಗಳಾಗಿದ್ದಾಗ ಯೂರಿಯಾ ರೂಪದಲ್ಲಿ ನೀಡಿ.\`;
      }`
);

// 8. Order tracking
content = content.replace(
  /\} else if \(language === 'ta'\) \{\s*botResponseText = `📦 \*\*ஆணை கண்காணிப்பு விவரம் \(#\$\{matchedOrder\.id\}\)\*\*[\s\S]*?`\s*;\s*\}/,
  `} else if (language === 'ta') {
          botResponseText = \`📦 **ஆணை கண்காணிப்பு விவரம் (#\${matchedOrder.id})**:\\n\` +
            \`• **நிலை**: **\${matchedOrder.orderStatus.toUpperCase()}**\\n\` +
            \`• **பொருட்கள்**: \${matchedOrder.items.map(i => \`\${i.quantity} \${i.unit} \${i.cropName}\`).join(', ')}\\n\` +
            \`• **மொத்த தொகை**: ₹\${matchedOrder.totalAmount.toLocaleString('en-IN')}\\n\` +
            \`• **டிரேக்கிங் எண்**: \${matchedOrder.trackingNumber}\`;
        } else if (language === 'te') {
          botResponseText = \`📦 **ఆర్డర్ ట్రాకింగ్ వివరాలు (#\${matchedOrder.id})**:\\n\` +
            \`• **స్థితి**: **\${matchedOrder.orderStatus.toUpperCase()}**\\n\` +
            \`• **పంటలు**: \${matchedOrder.items.map(i => \`\${i.quantity} \${i.unit} \${i.cropName}\`).join(', ')}\\n\` +
            \`• **మొత్తం చెల్లింపు**: ₹\${matchedOrder.totalAmount.toLocaleString('en-IN')}\\n\` +
            \`• **ట్రాకింగ్ సంఖ్య**: \${matchedOrder.trackingNumber}\`;
        } else if (language === 'ml') {
          botResponseText = \`📦 **ഓർഡർ വിവരങ്ങൾ (#\${matchedOrder.id})**:\\n\` +
            \`• **നില**: **\${matchedOrder.orderStatus.toUpperCase()}**\\n\` +
            \`• **ഇനങ്ങൾ**: \${matchedOrder.items.map(i => \`\${i.quantity} \${i.unit} \${i.cropName}\`).join(', ')}\\n\` +
            \`• **ആകെ തുക**: ₹\${matchedOrder.totalAmount.toLocaleString('en-IN')}\\n\` +
            \`• **ട്രാക്കിംഗ് നമ്പർ**: \${matchedOrder.trackingNumber}\`;
        } else if (language === 'kn') {
          botResponseText = \`📦 **ಆರ್ಡರ್ ಟ್ರ್ಯಾಕಿಂಗ್ ವಿವರಗಳು (#\${matchedOrder.id})**:\\n\` +
            \`• **ಸ್ಥಿತಿ**: **\${matchedOrder.orderStatus.toUpperCase()}**\\n\` +
            \`• **ಬೆಳೆಗಳು**: \${matchedOrder.items.map(i => \`\${i.quantity} \${i.unit} \${i.cropName}\`).join(', ')}\\n\` +
            \`• **ಒಟ್ಟು ಮೊತ್ತ**: ₹\${matchedOrder.totalAmount.toLocaleString('en-IN')}\\n\` +
            \`• **ಟ್ರ್ಯಾಕಿಂಗ್ ಸಂಖ್ಯೆ**: \${matchedOrder.trackingNumber}\`;
        }`
);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully updated aiChatbotService.ts with multilingual responses for Telugu, Malayalam, and Kannada.');
