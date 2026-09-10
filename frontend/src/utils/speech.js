// Web Speech Recognition & Web Speech Synthesis Utilities for WeatherGPT

// Weather Condition Translations across supported Indian languages
export const CONDITION_TRANSLATIONS = {
  hi: {
    "Clear Sky": "साफ़ आसमान",
    "Mainly Clear": "मुख्य रूप से साफ़",
    "Partly Cloudy": "आंशिक रूप से बादल",
    "Overcast": "घने बादल",
    "Foggy": "कोहरा",
    "Depositing Rime Fog": "घना कोहरा",
    "Light Drizzle": "हल्की बूंदाबांदी",
    "Moderate Drizzle": "बूंदाबांदी",
    "Dense Drizzle": "तेज़ बूंदाबांदी",
    "Slight Rain": "हल्की बारिश",
    "Moderate Rain": "मध्यम बारिश",
    "Heavy Rain": "भारी बारिश",
    "Thunderstorm": "आंधी-तूफान",
    "Thunderstorm with Slight Hail": "ओलावृष्टि के साथ तूफान",
    "Thunderstorm with Heavy Hail": "भारी ओलावृष्टि के साथ भीषण तूफान"
  },
  or: {
    "Clear Sky": "ପରିଷ୍କାର ଆକାଶ",
    "Mainly Clear": "ପ୍ରାୟତଃ ସଫା ଆକାଶ",
    "Partly Cloudy": "ଆଂଶିକ ମେଘୁଆ",
    "Overcast": "ମେଘାଚ୍ଛନ୍ନ ବାଦଲ",
    "Foggy": "କୁହୁଡ଼ି",
    "Depositing Rime Fog": "ଘନ କୁହୁଡ଼ି",
    "Light Drizzle": "ହାଲୁକା ଛିଟା ବର୍ଷା",
    "Moderate Drizzle": "ଛିଟା ବର୍ଷା",
    "Dense Drizzle": "ଝିପିଝିପି ବର୍ଷା",
    "Slight Rain": "ହାଲୁକା ବର୍ଷା",
    "Moderate Rain": "ମଧ୍ୟମ ଧରଣର ବର୍ଷା",
    "Heavy Rain": "ପ୍ରବଳ ବର୍ଷା",
    "Thunderstorm": "ଘଡ଼ଘଡ଼ି ଏବଂ ବିଜୁଳି ସହ ଝଡ଼ବର୍ଷା",
    "Thunderstorm with Slight Hail": "କୁଆପଥର ସହ ଘଡ଼ଘଡ଼ି ବର୍ଷା",
    "Thunderstorm with Heavy Hail": "ପ୍ରବଳ କୁଆପଥର ସହ ଝଡ଼ବର୍ଷା"
  },
  bn: {
    "Clear Sky": "পরিষ্কার আকাশ",
    "Mainly Clear": "মূলত পরিষ্কার আকাশ",
    "Partly Cloudy": "আংশিক মেঘলা",
    "Overcast": "মেঘলা আকাশ",
    "Foggy": "কুয়াশাচ্ছন্ন",
    "Depositing Rime Fog": "ঘন কুয়াশা",
    "Light Drizzle": "হালকা গুঁড়ি গুঁড়ি বৃষ্টি",
    "Moderate Drizzle": "গুঁড়ি গুঁড়ি বৃষ্টি",
    "Dense Drizzle": "ঘন গুঁড়ি গুঁড়ি বৃষ্টি",
    "Slight Rain": "হালকা বৃষ্টি",
    "Moderate Rain": "মাঝারি বৃষ্টি",
    "Heavy Rain": "ভারী বৃষ্টি",
    "Thunderstorm": "বজ্রবিদ্যুৎ সহ ঝড়বৃষ্টি",
    "Thunderstorm with Slight Hail": "শিলাবৃষ্টি সহ ঝড়বৃষ্টি",
    "Thunderstorm with Heavy Hail": "ভারী শিলাবৃষ্টি সহ তীব্র ঝড়"
  },
  te: {
    "Clear Sky": "స్వచ్ఛమైన ఆకాశం",
    "Mainly Clear": "చాలావరకు స్వచ్ఛమైన ఆకాశం",
    "Partly Cloudy": "పాక్షికంగా మేఘావృతం",
    "Overcast": "దట్టమైన మేఘాలు",
    "Foggy": "పొగమంచు",
    "Depositing Rime Fog": "దట్టమైన పొగమంచు",
    "Light Drizzle": "తేలికపాటి చినుకులు",
    "Moderate Drizzle": "చినుకులు",
    "Dense Drizzle": "దట్టమైన చినుకులు",
    "Slight Rain": "తేలికపాటి వర్షం",
    "Moderate Rain": "మధ్యస్థ వర్షం",
    "Heavy Rain": "భారీ వర్షం",
    "Thunderstorm": "ఉరుములు మెరుపులతో కూడిన తుఫాను",
    "Thunderstorm with Slight Hail": "వడగండ్ల వానతో కూడిన తుఫాను",
    "Thunderstorm with Heavy Hail": "భారీ వడగండ్ల తుఫాను"
  },
  ta: {
    "Clear Sky": "தெளிவான வானம்",
    "Mainly Clear": "பெரும்பாலும் தெளிவான வானம்",
    "Partly Cloudy": "பகுதி மேகமூட்டம்",
    "Overcast": "முழு மேகமூட்டம்",
    "Foggy": "பனிமூட்டம்",
    "Depositing Rime Fog": "அடர்ந்த பனிமூட்டம்",
    "Light Drizzle": "லேசான தூறல்",
    "Moderate Drizzle": "தூறல்",
    "Dense Drizzle": "அடர்ந்த தூறல்",
    "Slight Rain": "லேசான மழை",
    "Moderate Rain": "மிதமான மழை",
    "Heavy Rain": "கனமழை",
    "Thunderstorm": "இடி மின்னலுடன் கூடிய புயல்",
    "Thunderstorm with Slight Hail": "ஆலங்கட்டி மழையுடன் கூடிய புயல்",
    "Thunderstorm with Heavy Hail": "கடுமையான ஆலங்கட்டி புயல்"
  }
};

export const RISK_TRANSLATIONS = {
  hi: { LOW: "कम जोखिम", MODERATE: "मध्यम जोखिम", HIGH: "उच्च जोखिम", EXTREME: "अत्यधिक जोखिम" },
  or: { LOW: "କମ୍ ବିପଦ", MODERATE: "ମଧ୍ୟମ ବିପଦ", HIGH: "ଉଚ୍ଚ ବିପଦ", EXTREME: "ଅତ୍ୟଧିକ ବିପଦ" },
  bn: { LOW: "কম ঝুঁকি", MODERATE: "মাঝারি ঝুঁকি", HIGH: "উচ্চ ঝুঁকি", EXTREME: "চরম ঝুঁকি" },
  te: { LOW: "తక్కువ ప్రమాదం", MODERATE: "మధ్యస్థ ప్రమాదం", HIGH: "ఎక్కువ ప్రమాదం", EXTREME: "తీవ్రమైన ప్రమాదం" },
  ta: { LOW: "குறைந்த ஆபத்து", MODERATE: "மிதமான ஆபத்து", HIGH: "அதிக ஆபத்து", EXTREME: "தீவிர ஆபத்து" }
};

export const getVoiceSafetyAdvisory = (riskLevel, rainProb, temp, lang = 'en') => {
  if (lang === 'hi') {
    if (riskLevel === 'EXTREME' || riskLevel === 'HIGH') return 'सुरक्षित स्थान पर रहें और स्थानीय आपदा निर्देशों का पालन करें।';
    if (rainProb > 60) return 'बाहर जाते समय छाता या रेनकोट साथ रखें।';
    if (temp >= 38) return 'खूब पानी पिएं और दोपहर में सीधी धूप से बचें।';
    return 'दैनिक गतिविधियों के लिए मौसम सामान्य और अनुकूल है।';
  }
  if (lang === 'or') {
    if (riskLevel === 'EXTREME' || riskLevel === 'HIGH') return 'ସୁରକ୍ଷିତ ସ୍ଥାନରେ ରୁହନ୍ତୁ ଏବଂ ବିପର୍ଯ୍ୟୟ ପରିଚାଳନା ନିର୍ଦ୍ଦେଶ ପାଳନ କରନ୍ତୁ।';
    if (rainProb > 60) return 'ବାହାରକୁ ଯିବା ସମୟରେ ଛତା କିମ୍ବା ରେନକୋଟ୍ ସାଥିରେ ନିଅନ୍ତୁ।';
    if (temp >= 38) return 'ପ୍ରଚୁର ପାଣି ପିଅନ୍ତୁ ଏବଂ ଟାଣ ଖରାରୁ ନିଜକୁ ରକ୍ଷା କରନ୍ତୁ।';
    return 'ଦୈନନ୍ଦିନ କାର୍ଯ୍ୟ ପାଇଁ ପାଣିପାଗ ସ୍ୱାଭାବିକ ଏବଂ ଅନୁକୂଳ ଅଛି।';
  }
  if (lang === 'bn') {
    if (riskLevel === 'EXTREME' || riskLevel === 'HIGH') return 'নিরাপদ স্থানে থাকুন এবং স্থানীয় দুর্যোগ নির্দেশিকা মেনে চলুন।';
    if (rainProb > 60) return 'বাইরে বেরোনোর সময় ছাতা বা রেইনকোট সাথে রাখুন।';
    if (temp >= 38) return 'পর্যাপ্ত জল পান করুন এবং কড়া রোদ এড়িয়ে চলুন।';
    return 'দৈনন্দিন কাজের জন্য আবহাওয়া স্বাভাবিক ও অনুকূল রয়েছে।';
  }
  if (lang === 'te') {
    if (riskLevel === 'EXTREME' || riskLevel === 'HIGH') return 'సురక్షిత ప్రదేశంలో ఉండండి మరియు విపత్తు హెచ్చరికలను పాటించండి.';
    if (rainProb > 60) return 'బయటకు వెళ్ళేటప్పుడు గొడుగు లేదా రెయిన్‌కోట్ తీసుకెళ్ళండి.';
    if (temp >= 38) return 'మంచి నీరు ఎక్కువగా తాగండి మరియు ఎండలో తిరగవద్దు.';
    return 'రోజువారీ కార్యకలాపాలకు వాతావరణం అనుకూలంగా ఉంది.';
  }
  if (lang === 'ta') {
    if (riskLevel === 'EXTREME' || riskLevel === 'HIGH') return 'பாதுகாப்பான இடத்தில் இருங்கள் மற்றும் பேரிடர் வழிகாட்டுதல்களைப் பின்பற்றுங்கள்.';
    if (rainProb > 60) return 'வெளியே செல்லும்போது குடை அல்லது மழைக்கோட் எடுத்துச் செல்லுங்கள்.';
    if (temp >= 38) return 'நிறைய தண்ணீர் குடியுங்கள் மற்றும் வெயிலைத் தவிர்க்கவும்.';
    return 'அன்றாட நடவடிக்கைகளுக்கு வானிலை சாதகமாக உள்ளது.';
  }
  // Default English
  if (riskLevel === 'EXTREME' || riskLevel === 'HIGH') return 'Stay indoors and follow local disaster management instructions.';
  if (rainProb > 60) return 'Please carry an umbrella or raincoat before heading out.';
  if (temp >= 38) return 'Stay hydrated and avoid direct sunlight during peak daylight hours.';
  return 'Conditions are pleasant and suitable for outdoor activities.';
};

// Clean location query from natural voice command phrases in all project languages
export const cleanVoiceLocation = (rawText) => {
  if (!rawText) return '';
  let text = rawText.trim();

  // Strip common command preambles across English, Hindi, Odia, Bengali, Telugu, Tamil
  const prefixes = [
    // English
    'what is the weather in',
    'what is the weather of',
    'what is the weather for',
    'what\'s the weather in',
    'what\'s the weather of',
    'what\'s the weather for',
    'how is the weather in',
    'how is the weather of',
    'tell me the weather in',
    'tell me weather of',
    'tell me weather in',
    'check weather in',
    'check weather for',
    'check weather of',
    'show me weather in',
    'show weather in',
    'weather in',
    'weather of',
    'weather for',
    'weather at',
    
    // Hindi
    'मौसम बताओ',
    'का मौसम कैसा है',
    'में मौसम कैसा है',
    'का मौसम',
    'में मौसम',
    'मौसम कैसा रहेगा',
    'आज का मौसम',
    'मौसम',

    // Odia
    'ର ପାଣିପାଗ କୁହ',
    'ର ପାଣିପାଗ କଣ',
    'ର ପାଣିପାଗ କେମିତି ଅଛି',
    'ରେ ପାଣିପାଗ',
    'ର ପାଣିପାଗ',
    'ପାଣିପାଗ କୁହ',
    'ପାଣିପାଗ କଣ',
    'ପାଣିପାଗ ଦେଖାଅ',
    'ପାଣିପାଗ',

    // Bengali
    'এর আবহাওয়া কেমন',
    'এর আবহাওয়া বলো',
    'এর আবহাওয়া',
    'আবহাওয়া কেমন',
    'আবহাওয়া বলো',
    'আবহাওয়া দেখাও',
    'আবহাওয়া',

    // Telugu
    'యొక్క వాతావరణం ఎలా ఉంది',
    'వాతావరణం ఎలా ఉంది',
    'వాతావరణం చెప్పు',
    'యొక్క వాతావరణం',
    'వాతావరణం',

    // Tamil
    'வானிலை எப்படி இருக்கு',
    'வானிலை சொல்லு',
    'வானிலை என்ன',
    'வானிலை'
  ];

  let lower = text.toLowerCase();
  for (const p of prefixes) {
    if (lower.includes(p.toLowerCase())) {
      text = text.replace(new RegExp(p, 'gi'), '').trim();
      lower = text.toLowerCase();
    }
  }

  // Remove trailing punctuations or filler words
  text = text.replace(/[?.!,।]/g, '').trim();
  return text || rawText.trim();
};

// Check if Speech Recognition is supported by browser
export const isVoiceRecognitionSupported = () => {
  return typeof window !== 'undefined' && (
    'SpeechRecognition' in window || 
    'webkitSpeechRecognition' in window
  );
};

// Start listening for voice command in the active project language
export const startVoiceRecognition = ({ onResult, onError, onStart, onEnd, lang = 'en' }) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (onError) onError('Speech recognition is not supported in this browser.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  // Set accurate BCP 47 language code
  const langMap = {
    en: 'en-IN',
    hi: 'hi-IN',
    bn: 'bn-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    or: 'or-IN'
  };
  recognition.lang = langMap[lang] || 'en-IN';

  recognition.onstart = () => {
    if (onStart) onStart();
  };

  recognition.onresult = (event) => {
    if (event.results && event.results[0] && event.results[0][0]) {
      const transcript = event.results[0][0].transcript;
      const cleaned = cleanVoiceLocation(transcript);
      if (onResult) onResult(cleaned, transcript);
    }
  };

  recognition.onerror = (event) => {
    console.warn('Speech recognition error:', event.error);
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  try {
    recognition.start();
    return recognition;
  } catch (err) {
    console.warn('Failed to start recognition:', err);
    if (onError) onError(err);
    return null;
  }
};

// Generate comprehensive spoken weather summary script based on project language
export const generateWeatherSpeechText = (weatherData, lang = 'en') => {
  if (!weatherData || !weatherData.location || !weatherData.current) return '';
  const { location, current, alerts } = weatherData;
  const city = location.name;
  const country = location.country || '';
  const temp = Math.round(current.temperature);
  const rawCondition = current.weather_condition || 'Partly Cloudy';
  const feelsLike = Math.round(current.apparent_temperature || temp + 2);
  const humidity = current.humidity;
  const wind = Math.round(current.wind_speed);
  const rainProb = current.rain_probability_ml !== undefined ? current.rain_probability_ml : 25;
  const risk = alerts?.risk_assessment?.risk_level || 'LOW';

  const translatedCondition = CONDITION_TRANSLATIONS[lang]?.[rawCondition] || rawCondition;
  const translatedRisk = RISK_TRANSLATIONS[lang]?.[risk] || risk;
  const advisory = getVoiceSafetyAdvisory(risk, rainProb, temp, lang);

  if (lang === 'hi') {
    return `${city} में मौसम की जानकारी। वर्तमान तापमान ${temp} डिग्री सेल्सियस है, जो ${feelsLike} डिग्री जैसा महसूस हो रहा है। आकाश में ${translatedCondition} है। आर्द्रता ${humidity} प्रतिशत, हवा की गति ${wind} किलोमीटर प्रति घंटा, और बारिश की संभावना ${rainProb} प्रतिशत है। आपदा जोखिम: ${translatedRisk}। सुरक्षा सलाह: ${advisory}`;
  }

  if (lang === 'or') {
    return `${city} ର ପାଣିପାଗ ସୂଚନା। ବର୍ତ୍ତମାନ ତାପମାତ୍ରା ${temp} ଡିଗ୍ରୀ ସେଲସିୟସ, ଅନୁଭୂତ ତାପମାତ୍ରା ${feelsLike} ଡିଗ୍ରୀ। ଆକାଶ ${translatedCondition} ଅଛି। ଆର୍ଦ୍ରତା ${humidity} ପ୍ରତିଶତ, ପବନର ବେଗ ଘଣ୍ଟା ପ୍ରତି ${wind} କିଲୋମିଟର, ଏବଂ ବର୍ଷା ସମ୍ଭାବନା ${rainProb} ପ୍ରତିଶତ। ବିପଦ ସ୍ତର: ${translatedRisk}। ସୁରକ୍ଷା ପରାମର୍ଶ: ${advisory}`;
  }

  if (lang === 'bn') {
    return `${city}-র আবহাওয়ার রিপোর্ট। বর্তমান তাপমাত্রা ${temp} ডিগ্রি সেলসিয়াস, অনুভূত তাপমাত্রা ${feelsLike} ডিগ্রি। আকাশ ${translatedCondition}। আর্দ্রতা ${humidity} শতাংশ, বাতাসের গতি প্রতি ঘণ্টায় ${wind} কিলোমিটার, এবং বৃষ্টির সম্ভাবনা ${rainProb} শতাংশ। দুর্যোগ ঝুঁকি: ${translatedRisk}। সুরক্ষা পরামর্শ: ${advisory}`;
  }

  if (lang === 'te') {
    return `${city} వాతావరణ సమాచారం। ప్రస్తుత ఉష్ణోగ్రత ${temp} డిగ్రీల సెల్సియస్, ${feelsLike} డిగ్రీలుగా అనిపిస్తోంది. ఆకాశం ${translatedCondition}గా ఉంది. తేమ ${humidity} శాతం, గాలి వేగం గంటకు ${wind} కిలోమీటర్లు, మరియు వర్షం అవకాశం ${rainProb} శాతం. ప్రమాద స్థాయి: ${translatedRisk}। భద్రతా సలహా: ${advisory}`;
  }

  if (lang === 'ta') {
    return `${city} வானிலை அறிக்கை. தற்போதைய வெப்பநிலை ${temp} டிகிரி செல்சியஸ், ${feelsLike} டிகிரியாக உணரப்படுகிறது. வானிலை ${translatedCondition} ஆக உள்ளது. ஈரப்பதம் ${humidity} சதவீதம், காற்றின் வேகம் மணிக்கு ${wind} கிலோமீட்டர், மற்றும் மழை வாய்ப்பு ${rainProb} சதவீதம். ஆபத்து நிலை: ${translatedRisk}. பாதுகாப்பு ஆலோசனை: ${advisory}`;
  }

  // Default English
  return `Weather report for ${city}, ${country}. It is currently ${temp} degrees Celsius with ${rawCondition}. Feels like ${feelsLike} degrees. Humidity is ${humidity} percent, wind speed is ${wind} kilometers per hour, with a ${rainProb} percent chance of rain. Disaster risk is ${risk.toLowerCase()}. Safety advisory: ${advisory}`;
};

// Clean markdown text for fluid, natural speech narration
export const cleanMarkdownForSpeech = (text) => {
  if (!text) return '';
  return text
    .replace(/[*_~`#>]/g, '') // remove markdown marks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // convert markdown links to text
    .replace(/[-+•]\s+/g, ', ') // convert bullet list to natural pauses
    .replace(/\n+/g, '. ') // convert newlines to sentence pauses
    .replace(/\s+/g, ' ') // collapse multi-spaces
    .trim();
};

// Transliterate Odia script to Devanagari phonemes for Hindi TTS fallback when browser lacks native Odia voice
export const transliterateOdiaToDevanagari = (text) => {
  if (!text) return '';
  return text.replace(/[\u0B00-\u0B7F]/g, (char) => {
    const code = char.charCodeAt(0);
    if (code === 0x0B5C) return '\u0933'; // ଳ -> ळ
    if (code === 0x0B5F) return '\u092F'; // ୟ -> य
    if (code === 0x0B71) return '\u0935'; // ୱ -> व
    const devCode = code - 0x0200;
    return String.fromCharCode(devCode);
  });
};

// Speak arbitrary text using Web Speech Synthesis in the requested language
export const speakText = ({ text, lang = 'en', onStart, onEnd, onError }) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onError) onError('Speech synthesis is not supported on this browser.');
    return;
  }

  // Stop any active speech first
  window.speechSynthesis.cancel();

  const cleanedText = cleanMarkdownForSpeech(text);
  if (!cleanedText) return;

  const utterance = new SpeechSynthesisUtterance(cleanedText);
  const langMap = {
    en: 'en-IN',
    hi: 'hi-IN',
    bn: 'bn-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    or: 'or-IN'
  };
  const targetCode = langMap[lang] || 'en-IN';
  utterance.lang = targetCode;
  utterance.rate = 0.92; // Natural, clear pace for Indian languages & rural contexts
  utterance.pitch = 1.0;

  const pickVoiceAndSpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    // 1. Exact match (e.g. "hi-IN", "bn-IN", "ta-IN", "te-IN", "or-IN")
    let matchedVoice = voices.find(v => v.lang === targetCode || v.lang.replace('_', '-') === targetCode);
    
    // 2. Language prefix match (e.g. "hi", "bn", "ta", "te", "or")
    if (!matchedVoice) {
      const prefix = targetCode.slice(0, 2);
      matchedVoice = voices.find(v => v.lang.startsWith(prefix));
    }

    // 3. For Odia: if browser lacks native Odia voice, fall back to Hindi voice with Devanagari transliterated phonetics
    if (!matchedVoice && lang === 'or') {
      const hiVoice = voices.find(v => v.lang === 'hi-IN' || v.lang.startsWith('hi') || v.lang.includes('Hindi'));
      if (hiVoice) {
        utterance.text = transliterateOdiaToDevanagari(cleanedText);
        utterance.lang = 'hi-IN';
        utterance.voice = hiVoice;
      }
    } else if (matchedVoice) {
      utterance.voice = matchedVoice;
    } else if (lang === 'en') {
      const enVoice = voices.find(v => v.lang === 'en-IN' || v.lang === 'en-GB' || v.lang === 'en-US');
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      if (onError) onError(e);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    pickVoiceAndSpeak();
  } else {
    // Wait for voices to be loaded asynchronously by the browser
    window.speechSynthesis.onvoiceschanged = () => {
      pickVoiceAndSpeak();
    };
    // Fallback trigger if onvoiceschanged doesn't fire
    setTimeout(() => {
      if (!window.speechSynthesis.speaking) {
        pickVoiceAndSpeak();
      }
    }, 200);
  }
};

// Speak weather report
export const speakWeatherReport = ({ text, lang = 'en', onStart, onEnd, onError }) => {
  speakText({ text, lang, onStart, onEnd, onError });
};

// Stop speech synthesis
export const stopSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
