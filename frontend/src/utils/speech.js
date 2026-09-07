// Web Speech Recognition & Web Speech Synthesis Utilities for WeatherGPT

// Clean location query from natural voice command phrases
export const cleanVoiceLocation = (rawText) => {
  if (!rawText) return '';
  let text = rawText.toLowerCase().trim();

  // Strip common command preambles in English and Indian languages
  const prefixes = [
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
    'मौसम बताओ',
    'का मौसम',
    'में मौसम'
  ];

  for (const p of prefixes) {
    if (text.includes(p)) {
      text = text.replace(p, '').trim();
      break;
    }
  }

  // Remove trailing punctuations or filler words
  text = text.replace(/[?.!,]/g, '').trim();
  return text || rawText.trim();
};

// Check if Speech Recognition is supported by browser
export const isVoiceRecognitionSupported = () => {
  return typeof window !== 'undefined' && (
    'SpeechRecognition' in window || 
    'webkitSpeechRecognition' in window
  );
};

// Start listening for voice command
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

  // Set language code
  const langMap = {
    en: 'en-US',
    hi: 'hi-IN',
    bn: 'bn-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    or: 'or-IN'
  };
  recognition.lang = langMap[lang] || 'en-US';

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

// Generate spoken weather summary script based on language
export const generateWeatherSpeechText = (weatherData, lang = 'en') => {
  if (!weatherData || !weatherData.location || !weatherData.current) return '';
  const { location, current, alerts } = weatherData;
  const city = location.name;
  const country = location.country || '';
  const temp = Math.round(current.temperature);
  const condition = current.weather_condition;
  const feelsLike = Math.round(current.apparent_temperature);
  const humidity = current.humidity;
  const wind = Math.round(current.wind_speed);
  const rainProb = current.rain_probability_ml !== undefined ? current.rain_probability_ml : 0;
  const risk = alerts?.risk_assessment?.risk_level || 'LOW';

  if (lang === 'hi') {
    return `${city} में मौसम की जानकारी। वर्तमान तापमान ${temp} डिग्री सेल्सियस है और ${condition} है। यह ${feelsLike} डिग्री जैसा महसूस हो रहा है। आर्द्रता ${humidity} प्रतिशत, हवा की गति ${wind} किलोमीटर प्रति घंटा है, और बारिश की संभावना ${rainProb} प्रतिशत है। आपदा जोखिम ${risk === 'LOW' ? 'कम' : risk} है।`;
  }

  if (lang === 'bn') {
    return `${city} এর আবহাওয়ার রিপোর্ট। বর্তমান তাপমাত্রা ${temp} ডিগ্রি সেলসিয়াস এবং ${condition}। আর্দ্রতা ${humidity} শতাংশ, বাতাসের গতি ${wind} কিলোমিটার প্রতি ঘণ্টা।`;
  }

  if (lang === 'ta') {
    return `${city} வானிலை அறிக்கை. தற்போதைய வெப்பநிலை ${temp} டிகிரி செல்சியஸ், ${condition}. காற்றின் வேகம் ${wind} கிமீ/மணி.`;
  }

  if (lang === 'te') {
    return `${city} వాతావరణ సమాచారం. ప్రస్తుత ఉష్ణోగ్రత ${temp} డిగ్రీల సెల్సియస్, ${condition}. గాలి వేగం గంటకు ${wind} కిలోమీటర్లు.`;
  }

  if (lang === 'or') {
    return `${city} ର ପାଣିପାଗ ସୂଚନା। ବର୍ତ୍ତମାନ ତାପମାତ୍ରା ${temp} ଡିଗ୍ରୀ ସେଲସିୟସ ଏବଂ ${condition}।`;
  }

  // Default English
  return `Weather report for ${city}, ${country}. It is currently ${temp} degrees Celsius with ${condition}. Feels like ${feelsLike} degrees. Humidity is ${humidity} percent, wind speed is ${wind} kilometers per hour, with a ${rainProb} percent chance of rain. Disaster risk is ${risk.toLowerCase()}.`;
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

// Speak arbitrary text using Web Speech Synthesis
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
  const targetCode = langMap[lang] || 'en-US';
  utterance.lang = targetCode;
  utterance.rate = 0.95; // Slightly measured pace for better comprehension in rural contexts
  utterance.pitch = 1.0;

  // Select best matching voice
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang === targetCode || v.lang.startsWith(targetCode.slice(0, 2)));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
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

