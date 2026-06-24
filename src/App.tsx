import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { 
  Sparkles, Mic, Play, Square, RotateCcw, Volume2, Calendar, FileText, 
  CheckCircle, AlertTriangle, Info, Award, User, Trash2, Download, 
  HelpCircle, Check, ChevronRight, PlayCircle, History, ChevronDown, 
  ChevronUp, Smile, ThumbsUp, Activity, VolumeX, Plus, X,
  Presentation, Sliders, FileImage, Layers
} from 'lucide-react';

// Script interface
interface Script {
  id: string;
  name: string;
  text: string;
  createdAt: string;
}

// Session History interface
interface HistoryEntry {
  id: string;
  scriptName: string;
  scriptId: string;
  overallScore: number;
  matchRate: number;
  continuity: number;
  speedScore: number;
  kpm: number;
  duration: number; // in seconds
  createdAt: string;
  transcript: string;
  matchedWords: string[];
  missedWords: string[];
  slideIndex?: number;
  slideTitle?: string;
}

const ANATOMY_LIST = [
  {
    id: '양순',
    name: '양순음 (입술소리)',
    scientificName: 'Bilabial',
    emoji: '👄',
    x: 152,
    y: 85,
    consonants: ['ㅁ', 'ㅂ', 'ㅍ', 'ㅃ'],
    description: '윗입술과 아랫입술을 가볍게 꼭 맞물렸다가 떼면서 내는 소리입니다. 입모양의 대조와 밀착도가 시각적으로 매우 분명하게 나타납니다.',
    tip: '두 입술을 마냥 꾹 세게 누르기보다는, 가볍고 정확하게 밀착한 뒤 성대를 거친 숨을 "파" 하고 상쾌하게 흘려보내는 타격감을 주는 것이 연습의 핵심입니다.'
  },
  {
    id: '치조',
    name: '치조음 (잇몸소리)',
    scientificName: 'Alveolar',
    emoji: '🦷',
    x: 122,
    y: 80,
    consonants: ['ㄴ', 'ㄷ', 'ㅌ', 'ㄹ', 'ㅅ', 'ㅆ', 'ㄸ'],
    description: '혀끝을 윗니 바로 뒤에 튀어나온 단단한 잇몸 뼈 부위(치조)에 바짝 밀착했다가 떨어뜨리거나, 그 틈으로 공기를 스치며 냅니다.',
    tip: '혀끝이 윗니 안쪽을 정확히 건드리는 감각에 집중해 보세요. 혀가 너무 풀려 처지거나 이빨 사이로 과하게 튀어나오지 않게 제자리에서 단단히 튕겨주는 훈련이 필수적입니다.'
  },
  {
    id: '경구개',
    name: '경구개음 (센입천장소리)',
    scientificName: 'Palatal',
    emoji: '🏛️',
    x: 98,
    y: 73,
    consonants: ['ㅈ', 'ㅊ', 'ㅉ'],
    description: '혓바닥 앞쪽 부분과 잇몸 뒤에 이어지는 단단한 입천장 뼈(경구개) 천장 사이의 공간을 좁히거나 쓸어내리며 마찰을 일으켜 냅니다.',
    tip: '혀 앞면을 입천장의 넓고 단단한 언덕에 살짝 닿게 올려 붙였다가 미끄러뜨리듯 아래로 떨어트리며 바람을 부드럽게 새어나가게 해 줍니다.'
  },
  {
    id: '연구개',
    name: '연구개음 (여린입천장소리)',
    scientificName: 'Velar',
    emoji: '🫧',
    x: 74,
    y: 86,
    consonants: ['ㄱ', 'ㅋ', 'ㄲ', 'ㅇ(받침)'],
    description: '입천장의 뒤쪽 뼈가 없는 부드럽고 깊숙한 살 부위(여린입천장)를 혀뿌리(혀의 뒷부분)와 완전히 밀착해 통로를 가두었다가 터트리며 냅니다.',
    tip: '보이지 않고 감각을 잡기 가장 어려운 부위입니다. 침을 삼키거나 목구멍을 크게 여는 하품을 할 때 목구멍 안쪽 깊숙이 부풀어 오르는 가장 부드러운 살 부위가 연구개입니다. 이 부위를 혀뿌리가 가볍게 "툭" 밀쳤다 내리는 상하 통제력이 핵심입니다.'
  },
  {
    id: '후음',
    name: '후음 (목청소리)',
    scientificName: 'Glottal',
    emoji: '🗣️',
    x: 52,
    y: 138,
    consonants: ['ㅎ'],
    description: '목구멍(성대와 성문 사이)의 깊은 통로를 살며시 좁힌 상태에서 폐의 숨결(공기 흐름)을 스치게 하여 자연스럽게 마찰을 만들어 내는 소리입니다.',
    tip: '겨울철 차가운 거울이나 손바닥에 입김을 "하아" 하고 따뜻하게 부는 것과 같은 부드럽고 가벼운 공기의 마찰 압력을 목청 깊숙한 통로에서 유지하는 것이 좋습니다.'
  }
];

const VOCAL_TARGETS: Record<string, {
  name: string;
  description: string;
  vibrationSpot: string;
  tonguePosition: string;
  jawOpening: string;
  mouthSvg: string;
  guideTip: string;
}> = {
  '으': {
    name: '평평한 소리 "으"',
    description: '입술을 양옆으로 편안하게 벌리고 혀를 납작하게 둔 채 소리를 모으는 가장 쉬운 기본 성대 울림입니다.',
    vibrationSpot: '구강 내부 중심',
    tonguePosition: '수평 낮춤',
    jawOpening: '10% (거의 다물기)',
    mouthSvg: '으',
    guideTip: '억지로 힘을 주지 말고 이빨을 가볍게 떼며 "으~" 하고 콧노래 하듯 성대만 잔잔하게 울려 보세요.'
  },
  '아': {
    name: '목청 활짝 소리 "아"',
    description: '입과 목구멍을 상하로 활짝 가장 크게 열어 소리를 시원하게 밖으로 분출하는 가장 시각적인 모음 소리입니다.',
    vibrationSpot: '후두 및 구강 전체',
    tonguePosition: '가장 낮게 깔기',
    jawOpening: '90% (최대 벌리기)',
    mouthSvg: '아',
    guideTip: '하품하듯 턱을 시원하게 아래로 툭 떨어트리고, 혀를 낮춰 목구멍을 동그랗게 열면서 "아~" 하고 뿜어냅니다.'
  },
  '우': {
    name: '오므린 둥근 소리 "우"',
    description: '입술을 둥글게 모아 앞으로 쭉 밀어내며 공기 구멍을 좁히고, 혀뿌리를 들어 울림을 뒤쪽으로 보내는 소리입니다.',
    vibrationSpot: '입술 바로 뒷공간',
    tonguePosition: '후설 높임',
    jawOpening: '20% (앞으로 돌출)',
    mouthSvg: '우',
    guideTip: '촛불을 끄듯이 입술을 오리 입처럼 둥글고 뾰족하게 내밀고, 뺨에 가벼운 압력을 주며 "우~" 하고 붑니다.'
  },
  '이': {
    name: '수평 평평 소리 "이"',
    description: '입술을 미소 짓듯 양옆으로 바짝 평평하게 당기고, 혓바닥을 위로 높여 좁은 틈새로 고압의 바람을 보내는 소리입니다.',
    vibrationSpot: '경구개 앞부분',
    tonguePosition: '전설 높임',
    jawOpening: '15% (양옆 당김)',
    mouthSvg: '이',
    guideTip: '밝은 미소를 지으며 입꼬리를 양쪽 귀 쪽으로 최대한 팽팽하게 찢고, 혀끝을 아래 잇몸에 대며 "이~" 소리를 냅니다.'
  },
  '어': {
    name: '반쯤 열린 소리 "어"',
    description: '입을 "아"보다는 약간 작게, "으"보다는 크게 벌리고 혀를 약간 뒤쪽으로 두며 소리를 퍼트리는 중간 모음입니다.',
    vibrationSpot: '인두강 근처',
    tonguePosition: '중설 중간',
    jawOpening: '50% (중간 열림)',
    mouthSvg: '어',
    guideTip: '멍하니 놀랐을 때처럼 힘을 빼고 턱을 가볍게 반쯤 벌린 뒤 편하게 "어~" 하고 가래침 뱉기 전 목안을 넓힙니다.'
  },
  '으아': {
    name: '연결 소리길 "으 ➡️ 아"',
    description: '혀를 납작하게 한 기본 울림에서 출발하여, 턱을 수직으로 툭 내리며 활짝 열린 구강 공명으로 부드럽게 전이합니다.',
    vibrationSpot: '구강 중심에서 목구멍 하부까지 하강',
    tonguePosition: '중간 ➡️ 가장 낮춤',
    jawOpening: '10% ➡️ 90% (점진적 확장)',
    mouthSvg: '으아',
    guideTip: '처음에 "으으으" 하고 작게 울리다가, 그 진동의 감각을 살린 채 아래턱을 "아아아" 하고 열며 소리를 바깥쪽으로 밀어 줍니다.'
  },
  '우이': {
    name: '돌출 ➡️ 평평 소리길 "우 ➡️ 이"',
    description: '동그랗게 내밀어 응축된 전설 원순 울림에서 출발하여, 순간적으로 입꼬리를 미소 짓듯 팽팽히 찢으며 전설 평평 울림으로 전이합니다.',
    vibrationSpot: '입술 전면에서 구강 전면 및 경구개로 수평 이동',
    tonguePosition: '후설 ➡️ 전설',
    jawOpening: '20% ➡️ 15% (수평 압박)',
    mouthSvg: '우이',
    guideTip: '휘파람 부는 기분으로 "우~" 소리를 유지하면서, 입을 떼지 않고 귀에 미소를 만들듯이 한순간에 "이~"로 부드럽게 연결해 보세요.'
  },
  '으우': {
    name: '편안 ➡️ 돌출 소리길 "으 ➡️ 우"',
    description: '가장 입 주위에 힘이 빠진 평평 소리 "으"에서 입술 근육에 살포시 힘을 모아 둥글게 동그라미를 만들며 내미는 훈련입니다.',
    vibrationSpot: '중앙 공명에서 구강 최전면으로 전진',
    tonguePosition: '수평 ➡️ 후설 수축',
    jawOpening: '10% ➡️ 20% (입술 모으기)',
    mouthSvg: '으우',
    guideTip: '가장 편한 "으으으" 성량 상태를 유지하면서 서서히 주먹을 쥐듯 입꼬리에 둥글게 힘을 모아 "우우우"로 오므립니다.'
  }
};

export default function App() {
  // Page Tab state: 'home' | 'rehearsal' | 'history' | 'info' | 'deaf-culture'
  const [activeTab, setActiveTab] = useState<'home' | 'rehearsal' | 'history' | 'info' | 'deaf-culture'>('home');

  // Scripts state
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScriptId, setSelectedScriptId] = useState<string>('');
  const [scriptNameInput, setScriptNameInput] = useState<string>('');
  const [scriptTextInput, setScriptTextInput] = useState<string>('');

  // History state
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Rehearsal Live state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [showMicBanner, setShowMicBanner] = useState<boolean>(false);
  const [sttTranscript, setSttTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  
  // Waveform visualization data state (70 bars)
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(70).fill(6));

  // Current session results state (last analysis result)
  const [currentResult, setCurrentResult] = useState<{
    score: number;
    matchRate: number;
    speedScore: number;
    continuity: number;
    kpm: number;
    duration: number;
    matchedWords: string[];
    missedWords: string[];
    originalWords: string[];
    isFinished: boolean;
  } | null>(null);

  // References
  const sttTranscriptRef = useRef<string>('');
  const interimTranscriptRef = useRef<string>('');
  const scriptTextRef = useRef<string>('');
  const scriptNameRef = useRef<string>('');
  const recordingSecondsRef = useRef<number>(0);
  const isRecordingRef = useRef<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<any>(null);
  const speechStartTimeRef = useRef<number>(0);

  // Deaf Culture & Pronunciation Trainer state
  const [deafActiveVowel, setDeafActiveVowel] = useState<'아' | '이' | '우' | '에' | '오'>('아');
  const [deafActiveWord, setDeafActiveWord] = useState<string>('안녕하세요');
  const [deafIsRecording, setDeafIsRecording] = useState<boolean>(false);
  const [deafSttTranscript, setDeafSttTranscript] = useState<string>('');
  const [deafInterimTranscript, setDeafInterimTranscript] = useState<string>('');
  const [deafMicEnergy, setDeafMicEnergy] = useState<number>(0);

  const [deafWords, setDeafWords] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('malgyeol-deaf-words');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return [
      '안녕하세요', '반갑습니다', '감사합니다', '발표 연습', '소리 자국', 
      '나비', '도서관', '기차 여행', '따뜻한 봄날', '용기와 희망', 
      '마음의 울림', '서로의 존중'
    ];
  });
  const [deafNewWordInput, setDeafNewWordInput] = useState<string>('');
  const [deafActiveAnatomyPoint, setDeafActiveAnatomyPoint] = useState<string>('연구개');
  const [deafLeftSubTab, setDeafLeftSubTab] = useState<'vowels' | 'articulation'>('vowels');

  // New Beginner Voice & Position Trainer states
  const [deafRightMode, setDeafRightMode] = useState<'word' | 'vocal'>('word');
  const [deafVocalTarget, setDeafVocalTarget] = useState<'으' | '아' | '우' | '이' | '어' | '으아' | '우이' | '으우'>('으아');
  const [deafSustainedStreak, setDeafSustainedStreak] = useState<number>(0);

  // PPT Rehearsal Mode states
  const [rehearsalMode, setRehearsalMode] = useState<'standard' | 'ppt'>('standard');
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  // Audio filtering and haptic vibration toggles
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);
  const [filterEnabled, setFilterEnabled] = useState<boolean>(true);
  const [deafVibrationEnabled, setDeafVibrationEnabled] = useState<boolean>(true);
  const [deafFilterEnabled, setDeafFilterEnabled] = useState<boolean>(true);
  const lastVibrateTimeRef = useRef<number>(0);

  // Slide images stored as base64 string or placeholder inside a Record keyed by scriptId
  const [slideImages, setSlideImages] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem('malgyeol_slide_images');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Store parsed PPT slide text contents (title, bullet points) for each script
  const [pptSlideContents, setPptSlideContents] = useState<Record<string, { title: string; content: string[] }[]>>(() => {
    try {
      const saved = localStorage.getItem('malgyeol_ppt_slide_contents');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Save slide images
  useEffect(() => {
    localStorage.setItem('malgyeol_slide_images', JSON.stringify(slideImages));
  }, [slideImages]);

  // Save ppt slide contents
  useEffect(() => {
    localStorage.setItem('malgyeol_ppt_slide_contents', JSON.stringify(pptSlideContents));
  }, [pptSlideContents]);

  // Splits script text into slides automatically by explicit markers [슬라이드 X] or by paragraphs
  const getSlidesFromText = (text: string) => {
    if (!text || !text.trim()) {
      return [{ title: '슬라이드 1', note: '대본이 아직 비어있습니다. 여기에 내용을 작성하세요.' }];
    }
    
    // Check if there are explicit slide markers like [슬라이드 X] or [Slide X]
    const markers = /\[(?:슬라이드|Slide)\s*\d+\]/gi;
    if (markers.test(text)) {
      const parts = text.split(/\[(?:슬라이드|Slide)\s*\d+\]/gi);
      const matches = [...text.matchAll(/\[((?:슬라이드|Slide)\s*\d+)\]/gi)];
      
      const slidesList = [];
      if (parts[0] && parts[0].trim()) {
        slidesList.push({
          title: '시작 안내',
          note: parts[0].trim()
        });
      }
      
      for (let i = 0; i < matches.length; i++) {
        const slideTitle = matches[i][1];
        const slideNote = (parts[i + 1] || '').trim();
        slidesList.push({
          title: slideTitle,
          note: slideNote
        });
      }
      return slidesList;
    }
    
    // Otherwise split by double line breaks (paragraphs)
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    if (paragraphs.length === 0) {
      return [{ title: '슬라이드 1', note: text }];
    }
    return paragraphs.map((para, idx) => ({
      title: `슬라이드 ${idx + 1}`,
      note: para.trim()
    }));
  };

  // Re-assembles individual slide notes back into the main script text
  const handleUpdateSlideNote = (slideIdx: number, newNote: string) => {
    const slides = getSlidesFromText(scriptTextInput);
    if (slideIdx >= 0 && slideIdx < slides.length) {
      slides[slideIdx].note = newNote;
      
      const hasMarkers = /\[(?:슬라이드|Slide)\s*\d+\]/gi.test(scriptTextInput);
      let newText = '';
      if (hasMarkers) {
        newText = slides.map(s => `[${s.title}]\n${s.note}`).join('\n\n');
      } else {
        newText = slides.map(s => s.note).join('\n\n');
      }
      handleScriptChange(newText);
    }
  };

  // Compress and upload slide images to stay below localstorage size limits
  const handleSlideImageUpload = (slideIdx: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 600;
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(img.width, maxW);
        canvas.height = img.height * (canvas.width / img.width);
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); // 70% quality JPEG
          
          setSlideImages(prev => {
            const scriptSlides = prev[selectedScriptId] ? [...prev[selectedScriptId]] : [];
            while (scriptSlides.length <= slideIdx) {
              scriptSlides.push('');
            }
            scriptSlides[slideIdx] = compressedBase64;
            return {
              ...prev,
              [selectedScriptId]: scriptSlides
            };
          });
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Parse PPTX file client-side and extract slide contents and speaker notes
  const handlePptxUpload = async (file: File) => {
    try {
      const zip = await JSZip.loadAsync(file);
      
      const slideFiles: { name: string; num: number; file: any }[] = [];
      const notesFiles: Record<number, string> = {};
      
      const promises: Promise<void>[] = [];
      
      zip.forEach((relativePath, zipEntry) => {
        const slideMatch = relativePath.match(/(?:^|\/)ppt\/slides\/slide(\d+)\.xml$/i);
        if (slideMatch) {
          const num = parseInt(slideMatch[1], 10);
          slideFiles.push({ name: relativePath, num, file: zipEntry });
        }
        
        const notesMatch = relativePath.match(/(?:^|\/)ppt\/notesSlides\/notesSlide(\d+)\.xml$/i);
        if (notesMatch) {
          const num = parseInt(notesMatch[1], 10);
          const p = zipEntry.async('string').then(text => {
            notesFiles[num] = text;
          });
          promises.push(p);
        }
      });
      
      await Promise.all(promises);
      
      slideFiles.sort((a, b) => a.num - b.num);
      
      if (slideFiles.length === 0) {
        alert('PPTX 파일에서 슬라이드를 찾을 수 없습니다. 올바른 PowerPoint (.pptx) 파일인지 확인해주세요.');
        return;
      }
      
      const parsedSlides: { title: string; content: string[]; note: string }[] = [];
      
      for (const slideInfo of slideFiles) {
        const slideXmlText = await slideInfo.file.async('string');
        
        // Match standard tags for texts: <a:t>...</a:t>
        const textMatches = slideXmlText.match(/<a:t>(.*?)<\/a:t>/g) || [];
        const rawTexts = textMatches.map(m => {
          return m.replace(/<\/?a:t>/g, '')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .trim();
        }).filter(t => t.length > 0);
        
        // Determine Title vs Content
        let slideTitle = `슬라이드 ${slideInfo.num}`;
        let slideContent: string[] = [];
        
        if (rawTexts.length > 0) {
          const firstMeaningful = rawTexts.find(t => t.length > 1);
          if (firstMeaningful) {
            slideTitle = firstMeaningful;
            slideContent = rawTexts.filter(t => t !== firstMeaningful);
          } else {
            slideTitle = rawTexts[0];
            slideContent = rawTexts.slice(1);
          }
        }
        
        // Filter out page numbers or templates
        slideContent = slideContent.filter(t => !/^(slide|page|\d+)$/i.test(t) && t.length > 1);
        
        // Notes text extraction
        const notesXmlText = notesFiles[slideInfo.num] || '';
        let slideNote = '';
        if (notesXmlText) {
          const notesMatches = notesXmlText.match(/<a:t>(.*?)<\/a:t>/g) || [];
          const notesLines = notesMatches.map(m => {
            return m.replace(/<\/?a:t>/g, '')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&apos;/g, "'")
              .trim();
          }).filter(t => t.length > 0);
          
          slideNote = notesLines
            .filter(t => !/^(slide|click\s+to\s+edit|Master\s+text\s+styles|\d+)$/i.test(t))
            .join(' ');
        }
        
        if (!slideNote || slideNote.trim().length === 0) {
          slideNote = `슬라이드 ${slideInfo.num} 대본을 작성해 주세요.`;
        }
        
        parsedSlides.push({
          title: slideTitle,
          content: slideContent.slice(0, 10), // cap content
          note: slideNote
        });
      }
      
      // Update states
      setPptSlideContents(prev => ({
        ...prev,
        [selectedScriptId]: parsedSlides.map(s => ({ title: s.title, content: s.content }))
      }));
      
      // Update main script text with Slide Markers
      const scriptTextWithMarkers = parsedSlides.map((s, idx) => `[슬라이드 ${idx + 1}]\n${s.note}`).join('\n\n');
      handleScriptChange(scriptTextWithMarkers);
      setCurrentSlideIndex(0);
      
      alert(`🎉 PowerPoint (.pptx) 파일 분석 성공!\n총 ${parsedSlides.length}개의 슬라이드와 대본(발표자 노트)을 성공적으로 불러왔습니다.`);
    } catch (e) {
      console.error(e);
      alert('PPTX 파일 분석 중 오류가 발생했습니다. 파일이 손상되었거나 형식이 다를 수 있습니다.');
    }
  };

  // Reset slide index when changing scripts
  useEffect(() => {
    setCurrentSlideIndex(0);
  }, [selectedScriptId]);

  // Vowel Geometry details for side-view (Vocal Tract) and front-view (Lips & Teeth)
  const VOWEL_GEOM: Record<string, {
    jawY: number;        // lower jaw/teeth drop (0 to 30)
    tonguePath: string;  // tongue side curve (bezier)
    lipWidth: number;    // front lips horizontal radius
    lipHeight: number;   // front lips vertical radius
    pucker: number;      // puckered (우) vs spread (이)
  }> = {
    '으': {
      jawY: 8,
      tonguePath: "M 65 130 Q 100 115 135 118",
      lipWidth: 48,
      lipHeight: 10,
      pucker: 0
    },
    '아': {
      jawY: 28,
      tonguePath: "M 65 132 Q 95 130 135 125",
      lipWidth: 40,
      lipHeight: 32,
      pucker: 0
    },
    '우': {
      jawY: 6,
      tonguePath: "M 65 125 Q 90 90 135 122",
      lipWidth: 22,
      lipHeight: 12,
      pucker: 10
    },
    '이': {
      jawY: 5,
      tonguePath: "M 65 125 Q 110 85 135 105",
      lipWidth: 55,
      lipHeight: 8,
      pucker: -5
    },
    '어': {
      jawY: 18,
      tonguePath: "M 65 128 Q 98 120 135 120",
      lipWidth: 38,
      lipHeight: 22,
      pucker: 0
    }
  };

  // Interpolates geometric transformations between vowel transitions for real-time visualization
  const getInterpolatedGeom = (target: string, energy: number) => {
    const energyFactor = Math.min(1.0, energy / 100);
    
    // For single vowel
    if (target.length === 1) {
      const base = VOWEL_GEOM[target] || VOWEL_GEOM['으'];
      return {
        jawY: base.jawY + energyFactor * 8,
        lipWidth: base.lipWidth + (base.pucker < 0 ? energyFactor * 3 : 0),
        lipHeight: base.lipHeight + energyFactor * 10,
        pucker: base.pucker,
        tonguePath: base.tonguePath
      };
    }
    
    // For double vowel paths (e.g. '으아', '우이', '으우')
    const startChar = target[0];
    const endChar = target[1];
    const startGeom = VOWEL_GEOM[startChar] || VOWEL_GEOM['으'];
    const endGeom = VOWEL_GEOM[endChar] || VOWEL_GEOM['으'];
    
    // Transition factor based on microphone sound pressure levels (reaches full transition at 35% volume)
    const t = Math.min(1.0, energy / 35);
    
    const jawY = startGeom.jawY + t * (endGeom.jawY - startGeom.jawY) + energyFactor * 6;
    const lipWidth = startGeom.lipWidth + t * (endGeom.lipWidth - startGeom.lipWidth);
    const lipHeight = startGeom.lipHeight + t * (endGeom.lipHeight - startGeom.lipHeight) + energyFactor * 8;
    const pucker = startGeom.pucker + t * (endGeom.pucker - startGeom.pucker);
    
    const getCP = (char: string) => {
      if (char === '으') return { sx: 65, sy: 130, cx: 100, cy: 115, ex: 135, ey: 118 };
      if (char === '아') return { sx: 65, sy: 132, cx: 95, cy: 130, ex: 135, ey: 125 };
      if (char === '우') return { sx: 65, sy: 125, cx: 90, cy: 90, ex: 135, ey: 122 };
      if (char === '이') return { sx: 65, sy: 125, cx: 110, cy: 85, ex: 135, ey: 105 };
      if (char === '어') return { sx: 65, sy: 128, cx: 98, cy: 120, ex: 135, ey: 120 };
      return { sx: 65, sy: 130, cx: 100, cy: 115, ex: 135, ey: 118 };
    };
    
    const cpStart = getCP(startChar);
    const cpEnd = getCP(endChar);
    
    const sx = cpStart.sx + t * (cpEnd.sx - cpStart.sx);
    const sy = cpStart.sy + t * (cpEnd.sy - cpStart.sy);
    const cx = cpStart.cx + t * (cpEnd.cx - cpStart.cx);
    const cy = cpStart.cy + t * (cpEnd.cy - cpStart.cy);
    const ex = cpStart.ex + t * (cpEnd.ex - cpStart.ex);
    const ey = cpStart.ey + t * (cpEnd.ey - cpStart.ey);
    
    const tonguePath = `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
    
    return { jawY, lipWidth, lipHeight, pucker, tonguePath };
  };

  // Save deafWords to localstorage when modified
  useEffect(() => {
    localStorage.setItem('malgyeol-deaf-words', JSON.stringify(deafWords));
  }, [deafWords]);

  // Voice sustainability tracking for absolute beginners
  useEffect(() => {
    if (!deafIsRecording || deafRightMode !== 'vocal') {
      setDeafSustainedStreak(0);
      return;
    }
    
    let interval: any = null;
    if (deafMicEnergy > 15) {
      interval = setInterval(() => {
        setDeafSustainedStreak(prev => Math.min(prev + 1, 30)); // 30 ticks = 3.0 seconds
      }, 100);
    } else {
      setDeafSustainedStreak(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [deafMicEnergy, deafIsRecording, deafRightMode]);

  // Refs for Deaf Trainer
  const deafRecognitionRef = useRef<any>(null);
  const deafAudioCtxRef = useRef<AudioContext | null>(null);
  const deafAnalyserRef = useRef<AnalyserNode | null>(null);
  const deafStreamRef = useRef<MediaStream | null>(null);
  const deafAnimRef = useRef<number | null>(null);

  // Default scripts if LocalStorage is empty
  const DEFAULT_SCRIPTS: Script[] = [
    {
      id: 'default-1',
      name: '자기소개 발표',
      text: '안녕하세요, 저는 산업디자인학과 3학년 김지수입니다. 저는 평소에 사람들의 감정과 공간을 연결하는 디자인에 관심이 많고, 특히 지속 가능한 소재를 활용한 오브제 작업을 해왔습니다.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'default-2',
      name: '팀 프로젝트 발표',
      text: '안녕하세요, 오늘은 저희 팀의 디자인 프로젝트를 발표하겠습니다. 저희 팀은 총 세 명으로 구성되었으며 각자 기획, 디자인, 개발을 담당했습니다.',
      createdAt: new Date().toISOString()
    }
  ];

  // Load scripts and history from LocalStorage on mount
  useEffect(() => {
    // 1. Load Scripts
    const savedScripts = localStorage.getItem('malgyeol_scripts');
    if (savedScripts) {
      try {
        const parsed = JSON.parse(savedScripts);
        setScripts(parsed);
        if (parsed.length > 0) {
          setSelectedScriptId(parsed[0].id);
          setScriptTextInput(parsed[0].text);
          setScriptNameInput(parsed[0].name);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('malgyeol_scripts', JSON.stringify(DEFAULT_SCRIPTS));
      setScripts(DEFAULT_SCRIPTS);
      setSelectedScriptId(DEFAULT_SCRIPTS[0].id);
      setScriptTextInput(DEFAULT_SCRIPTS[0].text);
      setScriptNameInput(DEFAULT_SCRIPTS[0].name);
    }

    // 2. Load History
    const savedHistory = localStorage.getItem('malgyeol_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error(e);
      }
    }

    // 3. Silent mic permission check
    checkMicPermission();
  }, []);

  // Synchronize state values with refs to prevent stale closure bugs in callbacks
  useEffect(() => {
    scriptTextRef.current = scriptTextInput;
  }, [scriptTextInput]);

  useEffect(() => {
    scriptNameRef.current = scriptNameInput;
  }, [scriptNameInput]);

  useEffect(() => {
    recordingSecondsRef.current = recordingSeconds;
  }, [recordingSeconds]);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Update current script text in LocalStorage and state
  const handleScriptChange = (text: string) => {
    setScriptTextInput(text);
    const updated = scripts.map(s => s.id === selectedScriptId ? { ...s, text } : s);
    setScripts(updated);
    localStorage.setItem('malgyeol_scripts', JSON.stringify(updated));
  };

  // Select script
  const handleSelectScript = (id: string) => {
    const found = scripts.find(s => s.id === id);
    if (found) {
      setSelectedScriptId(id);
      setScriptTextInput(found.text);
      setScriptNameInput(found.name);
      // Reset current results when changing scripts
      setCurrentResult(null);
    }
  };

  // Add new script
  const handleAddScript = () => {
    const name = prompt('새 스크립트의 이름을 입력하세요:', `새 스크립트 ${scripts.length + 1}`);
    if (name === null) return; // User cancelled
    const finalName = name.trim() || `새 스크립트 ${scripts.length + 1}`;
    
    const newScript: Script = {
      id: 'script-' + Date.now(),
      name: finalName,
      text: '',
      createdAt: new Date().toISOString()
    };

    const updated = [...scripts, newScript];
    setScripts(updated);
    localStorage.setItem('malgyeol_scripts', JSON.stringify(updated));
    setSelectedScriptId(newScript.id);
    setScriptTextInput('');
    setScriptNameInput(finalName);
    setCurrentResult(null);
  };

  // Delete current script
  const handleDeleteScript = (id: string) => {
    if (scripts.length <= 1) {
      alert('최소 하나의 스크립트는 존재해야 합니다.');
      return;
    }
    if (!confirm('정말 이 스크립트를 삭제하시겠습니까?')) return;

    const updated = scripts.filter(s => s.id !== id);
    setScripts(updated);
    localStorage.setItem('malgyeol_scripts', JSON.stringify(updated));

    // Select the first remaining script
    const nextScript = updated[0];
    setSelectedScriptId(nextScript.id);
    setScriptTextInput(nextScript.text);
    setScriptNameInput(nextScript.name);
    setCurrentResult(null);
  };

  // Silence check microphone permission
  const checkMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicPermission('granted');
      setShowMicBanner(false);
    } catch (err) {
      setMicPermission('denied');
      setShowMicBanner(true);
    }
  };

  // Web Audio Analyser Loop for real-time waveform animation
  const startAudioWaveform = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicPermission('granted');
      setShowMicBanner(false);

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      
      if (filterEnabled) {
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 350; // Pass speech frequencies (~80Hz - 1000Hz)
        filter.Q.value = 0.8;
        source.connect(filter);
        filter.connect(analyser);
      } else {
        source.connect(analyser);
      }
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!analyserRef.current) return;
        animationFrameRef.current = requestAnimationFrame(draw);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Normalize frequencies into 70 bars
        const barsCount = 70;
        const newBars: number[] = [];
        const step = Math.floor(bufferLength / barsCount) || 1;

        for (let i = 0; i < barsCount; i++) {
          const index = (i * step) % bufferLength;
          const val = dataArray[index];
          // Scale val (0-255) to reasonable heights (4px to 56px)
          const scaledHeight = 4 + (val / 255) * 48;
          newBars.push(scaledHeight);
        }
        setWaveformBars(newBars);
      };

      draw();
    } catch (err) {
      console.error('Error getting audio context:', err);
      setMicPermission('denied');
      setShowMicBanner(true);
    }
  };

  const stopAudioWaveform = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    // Set to smooth idle waves
    setWaveformBars(Array(70).fill(6));
  };

  // Start Speech Recognition
  const startSpeechRecognition = () => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      alert('이 브라우저는 Web Speech API를 지원하지 않습니다. 구글 크롬 브라우저를 사용해 주세요.');
      return;
    }

    // Reset STT Ref values
    sttTranscriptRef.current = '';
    interimTranscriptRef.current = '';

    const rec = new SpeechRecognitionClass();
    rec.lang = 'ko-KR';
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e: any) => {
      let finalSTT = '';
      let interimSTT = '';
      for (let i = 0; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          finalSTT += e.results[i][0].transcript + ' ';
        } else {
          interimSTT += e.results[i][0].transcript;
        }
      }
      
      sttTranscriptRef.current = finalSTT.trim();
      interimTranscriptRef.current = interimSTT.trim();

      setSttTranscript(finalSTT.trim());
      setInterimTranscript(interimSTT.trim());
    };

    rec.onerror = (e: any) => {
      console.error('Speech recognition error:', e.error);
      if (e.error === 'not-allowed') {
        setMicPermission('denied');
        setShowMicBanner(true);
      }
    };

    rec.onend = () => {
      // Auto-restart if recording is still active to maintain continuous service in Chrome
      if (isRecordingRef.current) {
        try {
          rec.start();
        } catch (err) {
          console.error('Failed to auto-restart speech recognition:', err);
        }
      }
    };

    recognitionRef.current = rec;
    rec.start();
    speechStartTimeRef.current = Date.now();
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      // Clear onend handler first to prevent auto-restart loop
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  // Start Rehearsal Recording
  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    setSttTranscript('');
    setInterimTranscript('');
    setCurrentResult(null);

    // Waveform & Web Speech Audio initiation
    startAudioWaveform();
    startSpeechRecognition();

    // Timer Interval
    timerRef.current = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);
  };

  // Stop Rehearsal Recording and Run Comparison Analysis
  const handleStopRecording = () => {
    setIsRecording(false);
    clearInterval(timerRef.current);
    stopAudioWaveform();
    stopSpeechRecognition();

    // 600ms grace period to catch any remaining final transcripts from Web Speech API
    setTimeout(() => {
      runComparisonAnalysis();
    }, 600);
  };

  // Virtual Rehearsal Simulation for Iframe / testing environments
  const handleSimulateRehearsal = (type: 'high' | 'mid' | 'low') => {
    let originalText = scriptTextRef.current.trim();
    let targetSlideTitle: string | undefined = undefined;

    if (rehearsalMode === 'ppt') {
      const slides = getSlidesFromText(originalText);
      const activeSlide = slides[currentSlideIndex];
      if (activeSlide) {
        originalText = activeSlide.note.trim();
        targetSlideTitle = activeSlide.title;
      }
    }

    if (!originalText) {
      alert('입력된 대본이 없어서 시뮬레이션을 진행할 수 없습니다.');
      return;
    }

    const words = originalText.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) {
      alert('입력된 대본 단어가 없습니다.');
      return;
    }

    setIsRecording(true);
    setRecordingSeconds(0);
    setSttTranscript('가상 발표 분석을 시작하는 중...');
    setInterimTranscript('');
    setCurrentResult(null);

    let elapsed = 0;
    // Animate a short 1.5s simulated recording for excellent UX
    const interval = setInterval(() => {
      elapsed += 1;
      setRecordingSeconds(elapsed);
      if (elapsed >= 2) {
        clearInterval(interval);
        setIsRecording(false);

        let simulatedWords: string[] = [];
        let simKpm = 135; // standard perfect pace (Korean syllables per minute)

        if (type === 'high') {
          // 92% match rate, standard optimal speed
          simulatedWords = words.map((w, idx) => {
            if (idx % 12 === 5) return ''; // omit a word occasionally
            if (idx % 15 === 8) return w.slice(0, -1) + '어'; // small typo
            return w;
          }).filter(w => w.length > 0);
          simKpm = 142;
        } else if (type === 'mid') {
          // 73% match rate, slightly fast/unsteady pace
          simulatedWords = words.map((w, idx) => {
            if (idx % 4 === 1) return ''; 
            if (idx % 7 === 3) return '음..'; 
            return w;
          }).filter(w => w.length > 0);
          simKpm = 185;
        } else {
          // 36% match rate, very slow / highly stuttered pace
          simulatedWords = words.map((w, idx) => {
            if (idx % 2 === 0) return '';
            if (idx % 5 === 1) return '어..';
            return w;
          }).filter(w => w.length > 0);
          simKpm = 45;
        }

        const simulatedSTT = simulatedWords.join(' ');
        sttTranscriptRef.current = simulatedSTT;
        interimTranscriptRef.current = '';
        setSttTranscript(simulatedSTT);
        setInterimTranscript('');

        // Score Calculation
        const originalCount = words.length || 1;
        const matchedWords: string[] = [];
        const missedWords: string[] = [];

        words.forEach(word => {
          const normalizedOriginal = normalizeWord(word);
          if (normalizedOriginal === '') return;

          const isMatch = simulatedWords.map(w => normalizeWord(w)).some(recWord => 
            recWord.includes(normalizedOriginal) || normalizedOriginal.includes(recWord)
          );

          if (isMatch) {
            matchedWords.push(word);
          } else {
            missedWords.push(word);
          }
        });

        let matchRate = Math.round((matchedWords.length / originalCount) * 100);
        let kpm = simKpm;

        let speedScore = 100;
        if (kpm < 60) {
          speedScore = Math.max(30, Math.round(kpm * 1.5));
        } else if (kpm >= 60 && kpm < 100) {
          speedScore = Math.round(70 + ((kpm - 60) / 40) * 25);
        } else if (kpm >= 100 && kpm <= 170) {
          speedScore = 95 + Math.round(((170 - kpm) / 70) * 5);
        } else if (kpm > 170 && kpm <= 230) {
          speedScore = Math.round(95 - ((kpm - 170) / 60) * 35);
        } else {
          speedScore = Math.max(20, Math.round(60 - ((kpm - 230) / 100) * 40));
        }

        let continuity = Math.min(100, Math.round((simulatedWords.length / originalCount) * 100));
        let overallScore = Math.round((matchRate * 0.6) + (speedScore * 0.2) + (continuity * 0.2));

        const duration = Math.max(3, Math.round((words.length / kpm) * 60)) || 5;

        const result = {
          score: overallScore,
          matchRate,
          speedScore,
          continuity,
          kpm,
          duration,
          matchedWords,
          missedWords,
          originalWords: words,
          isFinished: true
        };

        setCurrentResult(result);

        // Save session in History
        const newEntry: HistoryEntry = {
          id: 'history-' + Date.now(),
          scriptName: scriptNameRef.current || scriptNameInput,
          scriptId: selectedScriptId,
          slideIndex: rehearsalMode === 'ppt' ? currentSlideIndex : undefined,
          slideTitle: rehearsalMode === 'ppt' ? targetSlideTitle : undefined,
          overallScore,
          matchRate,
          speedScore,
          continuity,
          kpm,
          duration,
          createdAt: new Date().toLocaleString('ko-KR', { hour12: false }),
          transcript: simulatedSTT,
          matchedWords,
          missedWords
        };

        setHistory(prev => {
          const updated = [newEntry, ...prev];
          localStorage.setItem('malgyeol_history', JSON.stringify(updated));
          return updated;
        });
      }
    }, 700);
  };

  // Text-To-Speech (TTS) reference reader
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel ongoing speech
      window.speechSynthesis.cancel();
      
      const cleanText = text.replace(/[\[\]]/g, '').trim();
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ko-KR';
      
      // Select standard Korean voice if available
      const voices = window.speechSynthesis.getVoices();
      const koVoice = voices.find(voice => voice.lang.includes('ko-KR') || voice.lang.includes('ko_KR'));
      if (koVoice) {
        utterance.voice = koVoice;
      }
      utterance.rate = 0.85; // Slightly slower, clear speed for speech rehabilitation practice
      utterance.pitch = 1.0;
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('이 브라우저는 음성 합성(TTS) 기능을 지원하지 않습니다.');
    }
  };

  // Start Deaf Pronunciation Practice with dynamic audio volume analyser & SpeechRecognition
  const startDeafPractice = async () => {
    // Reset states
    setDeafSttTranscript('');
    setDeafInterimTranscript('');
    setDeafMicEnergy(0);
    setDeafIsRecording(true);

    try {
      // 1. Mic Stream & Web Audio Setup for Energy visualizer
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      deafStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      deafAudioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128; // Small fftSize for fast real-time feedback
      
      if (deafFilterEnabled) {
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 350;
        filter.Q.value = 0.8;
        source.connect(filter);
        filter.connect(analyser);
      } else {
        source.connect(analyser);
      }
      deafAnalyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateEnergy = () => {
        if (!deafAnalyserRef.current) return;
        deafAnimRef.current = requestAnimationFrame(updateEnergy);
        deafAnalyserRef.current.getByteFrequencyData(dataArray);

        // Compute RMS / Average volume level
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        // Map average (0-255) to 0-100 percentage
        const energyPercent = Math.min(Math.round((average / 120) * 100), 100);
        setDeafMicEnergy(energyPercent);

        // Mobile Haptic Vibration Feedback (Throttled to run at most once every 150ms)
        const now = Date.now();
        if (deafVibrationEnabled && energyPercent > 18 && navigator.vibrate && now - lastVibrateTimeRef.current > 150) {
          const vibDuration = Math.min(60, Math.floor(energyPercent / 1.5));
          navigator.vibrate(vibDuration);
          lastVibrateTimeRef.current = now;
        }
      };

      updateEnergy();

      // 2. SpeechRecognition Setup
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        const rec = new SpeechRecognitionClass();
        rec.lang = 'ko-KR';
        rec.continuous = true;
        rec.interimResults = true;

        rec.onresult = (e: any) => {
          let finalSTT = '';
          let interimSTT = '';
          for (let i = 0; i < e.results.length; ++i) {
            if (e.results[i].isFinal) {
              finalSTT += e.results[i][0].transcript + ' ';
            } else {
              interimSTT += e.results[i][0].transcript;
            }
          }
          setDeafSttTranscript(finalSTT.trim());
          setDeafInterimTranscript(interimSTT.trim());
        };

        rec.onerror = (e: any) => {
          console.error('Deaf practice Speech recognition error:', e.error);
        };

        rec.onend = () => {
          // If the user hasn't pressed stop, keep it alive
          if (deafStreamRef.current) {
            try {
              rec.start();
            } catch (err) {
              console.error('Failed to auto-restart deaf practice speech recognition:', err);
            }
          }
        };

        deafRecognitionRef.current = rec;
        rec.start();
      }
    } catch (err) {
      console.error('Error starting deaf practice:', err);
      alert('마이크를 시작할 수 없습니다. 권한 설정을 확인해 주세요.');
      setDeafIsRecording(false);
    }
  };

  const stopDeafPractice = () => {
    setDeafIsRecording(false);
    
    // Stop recognition
    if (deafRecognitionRef.current) {
      deafRecognitionRef.current.onend = null;
      deafRecognitionRef.current.stop();
      deafRecognitionRef.current = null;
    }

    // Cancel animation loop
    if (deafAnimRef.current) {
      cancelAnimationFrame(deafAnimRef.current);
      deafAnimRef.current = null;
    }

    // Stop tracks
    if (deafStreamRef.current) {
      deafStreamRef.current.getTracks().forEach(track => track.stop());
      deafStreamRef.current = null;
    }

    // Close AudioContext
    if (deafAudioCtxRef.current) {
      deafAudioCtxRef.current.close();
      deafAudioCtxRef.current = null;
    }

    setDeafMicEnergy(0);
  };

  const addDeafWord = () => {
    const trimmed = deafNewWordInput.trim();
    if (!trimmed) return;
    if (deafWords.includes(trimmed)) {
      alert('이미 등록된 단어입니다.');
      return;
    }
    setDeafWords([...deafWords, trimmed]);
    setDeafActiveWord(trimmed);
    setDeafNewWordInput('');
  };

  const removeDeafWord = (wordToRemove: string) => {
    const updated = deafWords.filter(w => w !== wordToRemove);
    setDeafWords(updated);
    if (deafActiveWord === wordToRemove) {
      if (updated.length > 0) {
        setDeafActiveWord(updated[0]);
      } else {
        setDeafActiveWord('');
      }
    }
  };

  // Normalize Korean strings for matching (removes symbols, keeps Korean/alphanumeric characters)
  const normalizeWord = (word: string): string => {
    return word.replace(/[^가-힣a-zA-Z0-9]/g, '').toLowerCase().trim();
  };

  // Comparison & Scoring Pipeline
  const runComparisonAnalysis = () => {
    const duration = recordingSecondsRef.current || 1;
    let originalText = scriptTextRef.current.trim();
    
    // If in PPT mode, evaluate only the active slide's note text
    let targetSlideTitle = undefined;
    if (rehearsalMode === 'ppt') {
      const slides = getSlidesFromText(originalText);
      const activeSlide = slides[currentSlideIndex];
      if (activeSlide) {
        originalText = activeSlide.note.trim();
        targetSlideTitle = activeSlide.title;
      }
    }
    
    const finalRecognizedText = (sttTranscriptRef.current + ' ' + interimTranscriptRef.current).trim();
    const cleanRecognized = finalRecognizedText.trim();

    if (!originalText) {
      alert('입력된 대본이 없습니다.');
      return;
    }

    // Split script into words
    const originalWords = originalText.split(/\s+/).filter(w => w.length > 0);
    const recognizedWords = cleanRecognized.split(/\s+/).filter(w => w.length > 0);

    // Normalize recognized words for searching
    const normalizedRecognized = recognizedWords.map(w => normalizeWord(w)).filter(w => w.length > 0);

    const matchedWords: string[] = [];
    const missedWords: string[] = [];

    // Check each original word
    originalWords.forEach(word => {
      const normalizedOriginal = normalizeWord(word);
      if (normalizedOriginal === '') return;

      // Check if original word is present in recognized text
      const isMatch = normalizedRecognized.some(recWord => 
        recWord.includes(normalizedOriginal) || normalizedOriginal.includes(recWord)
      );

      if (isMatch) {
        matchedWords.push(word);
      } else {
        missedWords.push(word);
      }
    });

    // Scoring metrics
    // 1. 발음 일치율 (Pronunciation match rate) (Weight 60%)
    const originalCount = originalWords.length || 1;
    let matchRate = Math.round((matchedWords.length / originalCount) * 100);

    // 2. 말 속도 (Speaking speed - KPM Korean Syllables Per Minute) (Weight 20%)
    // Syllables count: final recognized character count without spaces
    const syllableCount = cleanRecognized.replace(/\s+/g, '').length;
    const minutes = duration / 60;
    let kpm = Math.round(syllableCount / (minutes || 0.016)); // avoid division by zero

    // Ideal range: 100-170 KPM gets high score. Too fast or too slow reduces it.
    let speedScore = 100;
    if (kpm < 60) {
      speedScore = Math.max(30, Math.round(kpm * 1.5));
    } else if (kpm >= 60 && kpm < 100) {
      speedScore = Math.round(70 + ((kpm - 60) / 40) * 25); // 70 to 95
    } else if (kpm >= 100 && kpm <= 170) {
      speedScore = 95 + Math.round(((170 - kpm) / 70) * 5); // 95 to 100
    } else if (kpm > 170 && kpm <= 230) {
      speedScore = Math.round(95 - ((kpm - 170) / 60) * 35); // 60 to 95
    } else {
      speedScore = Math.max(20, Math.round(60 - ((kpm - 230) / 100) * 40));
    }

    // 3. 연속성 (Continuity - recognized word count / script word count) (Weight 20%)
    let continuity = Math.min(100, Math.round((recognizedWords.length / originalCount) * 100));

    // Overall Score (Weighted average)
    let overallScore = Math.round((matchRate * 0.6) + (speedScore * 0.2) + (continuity * 0.2));

    // If no words were recognized, score is exactly 0 instead of 6 to prevent confusion
    if (recognizedWords.length === 0) {
      matchRate = 0;
      kpm = 0;
      speedScore = 0;
      continuity = 0;
      overallScore = 0;
      
      alert('⚠️ 마이크 입력이나 음성 인식이 감지되지 않아 종합 점수가 0점 처리되었습니다.\n\n💡 원인 및 해결 방법:\n1. 브라우저/Iframe의 마이크 입력 허용 권한이 필요합니다.\n2. 실제 환경이나 권한 제약으로 직접 말하기가 안 될 경우, 녹음 버튼 아래의 [가상 발표 시뮬레이션] 기능을 클릭하여 대시보드 점수와 인포 리포트를 실시간 테스트해 보세요!');
    }

    const result = {
      score: overallScore,
      matchRate,
      speedScore,
      continuity,
      kpm,
      duration,
      matchedWords,
      missedWords,
      originalWords,
      isFinished: true
    };

    setCurrentResult(result);

    // Save session in History
    const newEntry: HistoryEntry = {
      id: 'history-' + Date.now(),
      scriptName: scriptNameRef.current || scriptNameInput,
      scriptId: selectedScriptId,
      overallScore,
      matchRate,
      continuity,
      speedScore,
      kpm,
      duration,
      createdAt: new Date().toLocaleString('ko-KR'),
      transcript: cleanRecognized,
      matchedWords,
      missedWords,
      slideIndex: rehearsalMode === 'ppt' ? currentSlideIndex : undefined,
      slideTitle: rehearsalMode === 'ppt' ? targetSlideTitle : undefined
    };

    const updatedHistory = [newEntry, ...history].slice(0, 50); // cap at 50 sessions
    setHistory(updatedHistory);
    localStorage.setItem('malgyeol_history', JSON.stringify(updatedHistory));
  };

  // Clear All Rehearsal History
  const handleClearHistory = () => {
    if (!confirm('정말로 모든 리허설 기록을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    setHistory([]);
    localStorage.removeItem('malgyeol_history');
    setCurrentResult(null);
  };

  // Format recording timer
  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Export to Single independent HTML file download
  const handleExportHTML = () => {
    const activeScript = scripts.find(s => s.id === selectedScriptId) || DEFAULT_SCRIPTS[0];
    
    // Generate static HTML string
    const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>말결 — 발표 리허설 도우미</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Gowun+Dodum&family=Nanum+Myeongjo:wght@400;700;800&family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap" rel="stylesheet">
  <!-- Tailwind CSS Play CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            cream: '#FDF6EF',
            terracotta: '#C1440E',
            'terracotta-light': '#E8693A',
            'terracotta-pale': '#F5E6D8',
            'brown-dark': '#3A2A1E',
            'brown-mid': '#7A6355',
            'brown-light': '#B09A8A',
            border: '#E8DDD3',
            'border-light': '#F0E8E0',
            'warm-white': '#FFFCF8'
          },
          fontFamily: {
            sans: ['Noto Sans KR', 'sans-serif'],
            display: ['Nanum Myeongjo', 'serif'],
            logo: ['Gowun Dodum', 'sans-serif']
          }
        }
      }
    }
  </script>
  <style>
    body {
      background-color: #FDF6EF;
      color: #3A2A1E;
    }
    .word-ok {
      background-color: #D4EDDA;
      color: #155724;
      border-bottom: 2px solid #28A745;
      font-weight: 500;
    }
    .word-miss {
      background-color: #FFF3CD;
      color: #856404;
      border-bottom: 2px solid #FFC107;
      font-weight: 500;
    }
    @keyframes pulse-red {
      0% { transform: scale(0.98); box-shadow: 0 0 0 0 rgba(193, 68, 14, 0.7); }
      70% { transform: scale(1.02); box-shadow: 0 0 0 12px rgba(193, 68, 14, 0); }
      100% { transform: scale(0.98); box-shadow: 0 0 0 0 rgba(193, 68, 14, 0); }
    }
    .animate-pulse-red {
      animation: pulse-red 1.5s infinite;
    }
  </style>
</head>
<body class="font-sans min-h-screen flex flex-col justify-between">

  <!-- NAVIGATION -->
  <nav class="sticky top-0 z-50 bg-[#FDF6EF]/90 backdrop-blur-md border-b border-[#E8DDD3] h-16 flex items-center justify-between px-6 md:px-12">
    <div class="font-logo text-2xl font-bold text-terracotta">말<span class="text-brown-dark">결</span></div>
    <div class="flex gap-4">
      <a href="#page-home" class="px-3 py-2 text-sm text-brown-mid hover:text-brown-dark">홈</a>
      <a href="#page-rehearsal" class="px-3 py-2 text-sm text-brown-mid hover:text-brown-dark font-medium text-terracotta">리허설</a>
      <a href="#page-info" class="px-3 py-2 text-sm text-brown-mid hover:text-brown-dark">인포</a>
    </div>
    <button onclick="window.location.hash = '#page-rehearsal'" class="bg-brown-dark text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-terracotta transition-all">연습 시작하기 →</button>
  </nav>

  <!-- REHEARSAL APP SHEET -->
  <main class="max-w-7xl mx-auto w-full p-6 md:p-8 flex-1">
    <div class="bg-white border border-border rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
      
      <!-- Left Sidebar: Scripts -->
      <div class="lg:col-span-3 border-r border-border-light bg-warm-white p-5 flex flex-col justify-between">
        <div>
          <div class="text-xs font-bold text-brown-light uppercase tracking-wider mb-4">내 발표 스크립트</div>
          <div class="space-y-2" id="scriptList">
            <!-- Render current script item -->
            <div class="p-3 bg-terracotta-pale/45 border border-terracotta/20 rounded-xl cursor-pointer">
              <div class="text-xs font-bold text-brown-dark truncate">${activeScript.name}</div>
              <div class="text-[10px] text-brown-light mt-1">총 ${activeScript.text.length}자 · 로컬 대본</div>
              <span class="inline-block px-1.5 py-0.5 bg-terracotta-pale text-terracotta rounded text-[9px] mt-2 font-semibold">리허설 중</span>
            </div>
          </div>
        </div>
        
        <div class="mt-8 pt-4 border-t border-border-light">
          <div class="flex items-center gap-2 px-1 py-2 text-xs text-brown-mid">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            음성 인식 준비 완료
          </div>
          <button onclick="alert('대본 편집은 본래 대본 편집 창에서 자유롭게 가능합니다. 오프라인 파일에서는 현재 대본으로 테스트해보세요!')" class="w-full py-2.5 border border-dashed border-border text-brown-mid hover:text-terracotta hover:border-terracotta rounded-lg text-xs font-medium transition-all mt-3">+ 새 스크립트 (기능 제공)</button>
        </div>
      </div>

      <!-- Center: Text Editor & Audio Capture -->
      <div class="lg:col-span-6 p-6 bg-cream/30 flex flex-col gap-6">
        <!-- Editor Content -->
        <div class="bg-white border border-border rounded-xl p-5 space-y-3">
          <div class="text-xs font-bold text-brown-light">📄 대본 내용 (${activeScript.name})</div>
          <textarea id="scriptText" class="w-full min-h-[140px] text-sm leading-relaxed text-brown-dark bg-transparent focus:outline-none resize-none" placeholder="여기에 발표 스크립트를 입력해 주세요...">${activeScript.text}</textarea>
          <div class="text-[10px] text-terracotta">🟠 대본은 오프라인에서도 실시간 비교 분석에 사용됩니다</div>
        </div>

        <!-- Recording Controls -->
        <div class="bg-white border border-border rounded-xl p-6 text-center space-y-4">
          <div class="text-xs text-brown-light" id="timer">00:00 / 03:00</div>
          
          <div class="flex flex-col items-center gap-2">
            <button id="recordBtn" onclick="toggleRecording()" class="w-14 h-14 rounded-full bg-terracotta hover:scale-105 transition-all flex items-center justify-center shadow-md">
              <div id="btnInner" class="w-5 h-5 bg-white rounded-full transition-all"></div>
            </button>
            <div id="statusText" class="text-xs text-terracotta font-semibold mt-1">▶ 눌러서 녹화 및 STT 시작</div>
            <p class="text-[10px] text-brown-light">크롬 브라우저에서 Web Speech API 음성인식이 완벽히 작동합니다</p>
          </div>

          <!-- Waveform Visualizer simulation -->
          <div class="pt-4 border-t border-border-light">
            <div class="text-[10px] font-bold text-brown-light text-left mb-2">〰️ 실시간 음파 파형 (Microphone)</div>
            <svg class="w-full h-12" id="offlineWave" viewBox="0 0 500 48" preserveAspectRatio="none">
              <!-- Render static visual lines -->
            </svg>
          </div>
        </div>

        <!-- Real-time Recognition Box -->
        <div class="bg-white border border-border rounded-xl p-5 space-y-2">
          <div class="text-xs font-bold text-brown-light">🗣 실시간 인식 텍스트 (STT Live)</div>
          <div id="sttBox" class="text-sm min-h-[60px] leading-relaxed text-brown-mid bg-cream/10 p-3 rounded-lg border border-border-light italic">
            여기에 실시간 음성 인식 텍스트가 표시됩니다. 마이크를 켜고 말씀해 보세요.
          </div>
        </div>

        <!-- Comparison Output Panel -->
        <div id="comparePanel" class="bg-white border border-border rounded-xl p-5 space-y-4 hidden">
          <div class="text-xs font-bold text-brown-light flex justify-between">
            <span>🔍 대본 vs 인식 결과 비교</span>
            <span class="text-emerald-600">녹화 완료됨</span>
          </div>
          <div class="text-sm leading-relaxed p-4 bg-cream/20 rounded-lg border border-border-light" id="wordComparisonResult">
            <!-- Dynamic comparison results go here -->
          </div>
          <div class="flex gap-4 text-xs">
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-[#D4EDDA] border border-[#28A745]"></span> 잘 전달됨</div>
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-[#FFF3CD] border border-[#FFC107]"></span> 다시 연습 필요</div>
          </div>
        </div>
      </div>

      <!-- Right: Analytical Dashboard -->
      <div class="lg:col-span-3 border-l border-border-light bg-warm-white p-5 flex flex-col justify-between">
        <div class="space-y-6">
          <div>
            <div class="text-xs font-bold text-brown-light uppercase tracking-wider mb-4">전달력 대시보드</div>
            <div class="flex justify-center py-4">
              <!-- Radial Score Circle -->
              <div class="relative w-28 h-28 flex items-center justify-center bg-cream/30 rounded-full border border-border">
                <div class="text-center">
                  <div class="text-3xl font-bold font-display text-brown-dark" id="scoreNum">--</div>
                  <div class="text-[10px] text-brown-light">종합 점수</div>
                </div>
              </div>
            </div>

            <div class="space-y-3 pt-2">
              <div class="space-y-1">
                <div class="flex justify-between text-[11px] font-medium text-brown-mid">
                  <span>발음 일치율 (60%)</span>
                  <span id="rateVal">--%</span>
                </div>
                <div class="w-full h-1.5 bg-border-light rounded-full overflow-hidden">
                  <div id="rateBar" class="h-full bg-terracotta transition-all" style="width: 0%"></div>
                </div>
              </div>

              <div class="space-y-1">
                <div class="flex justify-between text-[11px] font-medium text-brown-mid">
                  <span>말 속도 (20%)</span>
                  <span id="speedVal">-- KPM</span>
                </div>
                <div class="w-full h-1.5 bg-border-light rounded-full overflow-hidden">
                  <div id="speedBar" class="h-full bg-terracotta-light transition-all" style="width: 0%"></div>
                </div>
              </div>

              <div class="space-y-1">
                <div class="flex justify-between text-[11px] font-medium text-brown-mid">
                  <span>전체 연속성 (20%)</span>
                  <span id="contVal">--%</span>
                </div>
                <div class="w-full h-1.5 bg-border-light rounded-full overflow-hidden">
                  <div id="contBar" class="h-full bg-brown-light transition-all" style="width: 0%"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Dynamic Advice tips box -->
          <div class="p-3 bg-terracotta-pale/30 border border-border rounded-xl space-y-2">
            <div class="text-xs font-bold text-terracotta">💡 발표 팁 & 가이드</div>
            <div class="text-[11px] text-brown-mid leading-relaxed" id="adviceBox">
              발표를 완료하면 음성 속도와 발음 일치율을 정밀 비교해 맞춤형 피드백을 실시간 제공합니다.
            </div>
          </div>
        </div>

        <div class="text-center text-[10px] text-brown-light py-2 border-t border-border-light">
          오프라인 리허설 데이터는 기기 외부에 전송되지 않고 안전하게 분석됩니다.
        </div>
      </div>

    </div>
  </main>

  <footer class="bg-brown-dark text-[#FDF6EF]/50 text-xs py-8 px-12 mt-12 flex justify-between items-center">
    <div>말결 — 청각장애 대학생을 위한 발표 리허설 동반자</div>
    <div class="text-[10px]">© 2026 말결 팀. All Rights Reserved.</div>
  </footer>

  <script>
    // Initial waveform bars render
    const svgWave = document.getElementById('offlineWave');
    const totalBars = 70;
    for (let i = 0; i < totalBars; i++) {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', (i / totalBars) * 500);
      rect.setAttribute('width', (500 / totalBars) - 1.5);
      rect.setAttribute('rx', '1.5');
      rect.setAttribute('fill', '#E8DDD3');
      rect.setAttribute('y', '22');
      rect.setAttribute('height', '4');
      svgWave.appendChild(rect);
    }

    let isOfflineRecording = false;
    let offlineTimer = null;
    let secondsElapsed = 0;
    let liveSTT = '';
    let recognition = null;
    let streamMedia = null;
    let audioContext = null;
    let analyser = null;
    let animationFrame = null;

    function toggleRecording() {
      if (!isOfflineRecording) {
        // Start Recording
        isOfflineRecording = true;
        secondsElapsed = 0;
        liveSTT = '';
        document.getElementById('sttBox').textContent = '듣고 있습니다...';
        document.getElementById('comparePanel').classList.add('hidden');
        document.getElementById('timer').textContent = '00:00 / 03:00';
        document.getElementById('recordBtn').classList.add('animate-pulse-red');
        document.getElementById('btnInner').className = 'w-4 h-4 bg-white rounded-sm';
        document.getElementById('statusText').textContent = '● 녹화 중 — 눌러서 정지';

        // Timer
        offlineTimer = setInterval(() => {
          secondsElapsed++;
          const mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
          const secs = (secondsElapsed % 60).toString().padStart(2, '0');
          document.getElementById('timer').textContent = mins + ':' + secs + ' / 03:00';
        }, 1000);

        // Web Speech recognition initialization
        const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechClass) {
          recognition = new SpeechClass();
          recognition.lang = 'ko-KR';
          recognition.continuous = true;
          recognition.interimResults = true;
          
          recognition.onresult = (e) => {
            let interim = '';
            let final = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
              if (e.results[i].isFinal) {
                final += e.results[i][0].transcript;
              } else {
                interim += e.results[i][0].transcript;
              }
            }
            liveSTT = (final || interim).trim();
            document.getElementById('sttBox').textContent = liveSTT || '말을 시작해 보세요...';
          };
          recognition.start();
        }

        // Web Audio analyser animation
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            streamMedia = stream;
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContextClass();
            const source = audioContext.createMediaStreamSource(stream);
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            function animate() {
              if (!isOfflineRecording) return;
              animationFrame = requestAnimationFrame(animate);
              analyser.getByteFrequencyData(dataArray);

              const rects = svgWave.querySelectorAll('rect');
              rects.forEach((rect, idx) => {
                const step = Math.floor(bufferLength / totalBars);
                const val = dataArray[(idx * step) % bufferLength];
                const h = 4 + (val / 255) * 40;
                rect.setAttribute('height', h);
                rect.setAttribute('y', 24 - h / 2);
                rect.setAttribute('fill', h > 20 ? '#C1440E' : '#E8DDD3');
              });
            }
            animate();
          }).catch(e => console.error('No audio source', e));
        }

      } else {
        // Stop Recording
        isOfflineRecording = false;
        clearInterval(offlineTimer);
        document.getElementById('recordBtn').classList.remove('animate-pulse-red');
        document.getElementById('btnInner').className = 'w-5 h-5 bg-white rounded-full';
        document.getElementById('statusText').textContent = '▶ 눌러서 녹화 및 STT 시작';

        if (recognition) {
          recognition.stop();
        }
        if (streamMedia) {
          streamMedia.getTracks().forEach(track => track.stop());
        }
        if (audioContext) {
          audioContext.close();
        }
        cancelAnimationFrame(animationFrame);

        // Reset visual bars
        const rects = svgWave.querySelectorAll('rect');
        rects.forEach(rect => {
          rect.setAttribute('height', '4');
          rect.setAttribute('y', '22');
          rect.setAttribute('fill', '#E8DDD3');
        });

        // Run Comparison Engine
        setTimeout(runOfflineAnalysis, 500);
      }
    }

    function runOfflineAnalysis() {
      const scriptText = document.getElementById('scriptText').value.trim();
      const sttText = liveSTT.trim();

      if (!scriptText) {
        alert('대본이 없습니다.');
        return;
      }

      const scriptWords = scriptText.split(/\\s+/).filter(w => w.length > 0);
      const recognizedWords = sttText.split(/\\s+/).filter(w => w.length > 0);

      // Simple Normalizer
      const clean = (word) => word.replace(/[^가-힣a-zA-Z0-9]/g, '').toLowerCase().trim();

      const normalizedRecognized = recognizedWords.map(w => clean(w));
      const matched = [];
      const missed = [];

      const comparisonHTML = scriptWords.map(word => {
        const cleanWord = clean(word);
        if (!cleanWord) return word;

        const isMatch = normalizedRecognized.some(recWord => 
          recWord.includes(cleanWord) || cleanWord.includes(recWord)
        );

        if (isMatch) {
          matched.push(word);
          return '<span class="px-1.5 py-0.5 mx-0.5 rounded-md word-ok">' + word + '</span>';
        } else {
          missed.push(word);
          return '<span class="px-1.5 py-0.5 mx-0.5 rounded-md word-miss">' + word + '</span>';
        }
      }).join(' ');

      // Render comparisons
      document.getElementById('wordComparisonResult').innerHTML = comparisonHTML;
      document.getElementById('comparePanel').classList.remove('hidden');

      // Metric score calculator
      const scriptWordCount = scriptWords.length || 1;
      const matchRate = Math.round((matched.length / scriptWordCount) * 100);
      const continuity = Math.min(100, Math.round((recognizedWords.length / scriptWordCount) * 100));

      const characterCount = sttText.replace(/\\s+/g, '').length;
      const minutes = (secondsElapsed || 1) / 60;
      const kpm = Math.round(characterCount / (minutes || 0.016));

      // Speed check logic
      let speedScore = 100;
      if (kpm < 60) speedScore = Math.max(30, Math.round(kpm * 1.5));
      else if (kpm >= 60 && kpm < 100) speedScore = Math.round(70 + ((kpm - 60) / 40) * 25);
      else if (kpm >= 100 && kpm <= 170) speedScore = 95 + Math.round(((170 - kpm) / 70) * 5);
      else if (kpm > 170) speedScore = Math.max(20, Math.round(95 - ((kpm - 170) / 60) * 35));

      let overall = Math.round((matchRate * 0.6) + (speedScore * 0.2) + (continuity * 0.2));
      if (recognizedWords.length === 0) {
        overall = 0;
      }

      // Render dashboard values
      document.getElementById('scoreNum').textContent = overall;
      document.getElementById('rateVal').textContent = matchRate + '%';
      document.getElementById('rateBar').style.width = matchRate + '%';

      document.getElementById('speedVal').textContent = kpm + ' KPM';
      document.getElementById('speedBar').style.width = Math.min(100, Math.round((kpm / 250) * 100)) + '%';

      document.getElementById('contVal').textContent = continuity + '%';
      document.getElementById('contBar').style.width = continuity + '%';

      // Feedback advisor text
      let advice = '✅ 훌륭합니다! 발표 대본 단어가 대부분 일치하여 전달력이 우수합니다.';
      if (matchRate < 60) {
        advice = '❗ 발음 일치율이 다소 낮습니다. 한 글자씩 정확하게 또박또박 짚어 말해 보세요.';
      } else if (kpm > 180) {
        advice = '⚠️ 말하기 속도가 다소 빠릅니다. 중요 대목 앞에 1~2초 정지를 두어 청중이 소화할 틈을 주세요.';
      } else if (missed.length > 0) {
        advice = '💡 "' + clean(missed[0]) + '" 단어의 발음 정확도를 중점적으로 연습해 보세요.';
      }
      document.getElementById('adviceBox').textContent = advice;
    }
  </script>
</body>
</html>`;

    // Trigger local download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `malgyeol_app.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-cream text-brown-dark font-sans flex flex-col justify-between antialiased selection:bg-terracotta-pale selection:text-terracotta">
      
      {/* Top Banner Notice */}
      {showMicBanner && (
        <div className="bg-terracotta-light text-white px-6 py-3 text-center text-xs font-semibold flex items-center justify-center gap-2 animate-bounce">
          <AlertTriangle size={15} />
          <span>⚠️ 마이크 접근이 거부되었습니다. 브라우저 주소창의 🔒 아이콘에서 마이크 권한을 허용해주세요.</span>
          <button onClick={() => setShowMicBanner(false)} className="underline ml-4 hover:opacity-85">닫기</button>
        </div>
      )}

      {/* Modern Navigation Header */}
      <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur-md border-b border-border h-16 flex items-center justify-between px-6 md:px-12 shadow-xs">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-9 h-9 bg-terracotta text-white rounded-xl flex items-center justify-center font-logo font-bold text-lg shadow-sm">
            말
          </div>
          <span className="font-logo text-xl font-bold tracking-tight text-brown-dark">말결</span>
        </div>

        {/* Tab Buttons */}
        <div className="hidden md:flex gap-1 bg-brown-dark/5 p-1 rounded-full">
          <button 
            onClick={() => setActiveTab('home')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'home' ? 'bg-white text-terracotta shadow-xs' : 'text-brown-mid hover:text-brown-dark'
            }`}
          >
            홈
          </button>
          <button 
            onClick={() => setActiveTab('rehearsal')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'rehearsal' ? 'bg-white text-terracotta shadow-xs' : 'text-brown-mid hover:text-brown-dark'
            }`}
          >
            리허설
          </button>
          <button 
            onClick={() => setActiveTab('deaf-culture')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'deaf-culture' ? 'bg-white text-terracotta shadow-xs' : 'text-brown-mid hover:text-brown-dark'
            }`}
          >
            농인과 말결 (발음 연습)
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'history' ? 'bg-white text-terracotta shadow-xs' : 'text-brown-mid hover:text-brown-dark'
            }`}
          >
            기록실
          </button>
          <button 
            onClick={() => setActiveTab('info')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'info' ? 'bg-white text-terracotta shadow-xs' : 'text-brown-mid hover:text-brown-dark'
            }`}
          >
            인포
          </button>
        </div>

        {/* Quick Launch and Export Button */}
        <div className="flex gap-2">
          <button 
            onClick={handleExportHTML}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-border bg-white text-brown-dark hover:border-terracotta hover:text-terracotta rounded-full text-xs font-medium transition-all"
            title="독립 실행이 가능한 단일 HTML 파일로 내보냅니다."
          >
            <Download size={13} />
            <span className="hidden sm:inline">단일 HTML 내보내기</span>
          </button>
          <button 
            onClick={() => setActiveTab('rehearsal')}
            className="bg-terracotta hover:bg-terracotta-light text-white px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
          >
            <Mic size={13} />
            연습하기
          </button>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <div className="flex-1">

        {/* TAB 1: HOME PAGE */}
        {activeTab === 'home' && (
          <div className="animate-fade-in">
            {/* Hero Grid */}
            <header className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-2 items-center gap-12 md:gap-20">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-terracotta-pale text-terracotta rounded-full text-xs font-bold border border-terracotta/10">
                  <span className="w-2 h-2 rounded-full bg-terracotta animate-ping"></span>
                  청각장애 대학생을 위한 AI 발표 리허설 동반자
                </span>
                
                <h1 className="text-4xl md:text-6xl font-extrabold font-display leading-tight tracking-tight text-brown-dark">
                  내 목소리의 말결을<br />
                  <span className="text-terracotta underline decoration-terracotta-pale underline-offset-8">눈으로</span> 확인하세요
                </h1>

                <p className="text-base md:text-lg text-brown-mid leading-relaxed max-w-lg font-light">
                  말결은 발표를 준비하는 대학생들이 마이크를 통해 대본을 낭독하고, 
                  그 발음의 전달력과 속도, 연속성을 눈으로 확인하며 자신있게 대중 앞에 설 수 있도록 돕는 실시간 시각 분석 솔루션입니다.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button 
                    onClick={() => setActiveTab('rehearsal')}
                    className="px-6 py-3.5 bg-terracotta hover:bg-terracotta-light text-white font-bold text-sm rounded-full transition-all shadow-md hover:scale-101"
                  >
                    리허설 무료 시작하기
                  </button>
                  <button 
                    onClick={() => setActiveTab('info')}
                    className="px-6 py-3.5 border border-border text-brown-mid hover:border-brown-dark hover:text-brown-dark font-medium text-sm rounded-full transition-all bg-white"
                  >
                    개발 배경 & 기능 알아보기 →
                  </button>
                </div>

                {/* Micro Stats */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border">
                  <div>
                    <div className="text-2xl md:text-3xl font-bold font-display text-terracotta">100%</div>
                    <div className="text-xs text-brown-light mt-1">개인정보 로컬 분석</div>
                  </div>
                  <div>
                    <div className="text-2xl md:text-3xl font-bold font-display text-brown-dark">실시간</div>
                    <div className="text-xs text-brown-light mt-1">음파 파형 시각화</div>
                  </div>
                  <div>
                    <div className="text-2xl md:text-3xl font-bold font-display text-brown-dark">배리어프리</div>
                    <div className="text-xs text-brown-light mt-1">유니버설 디자인 인터페이스</div>
                  </div>
                </div>
              </div>

              {/* Graphic Mockup Area */}
              <div className="flex justify-center lg:justify-end">
                <div className="bg-white border border-border rounded-2xl p-6 w-full max-w-md shadow-lg space-y-5 relative">
                  <div className="flex items-center justify-between pb-3 border-b border-border-light">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FFB3A7]"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FFD9B3]"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#B3E5D1]"></div>
                    </div>
                    <div className="text-[10px] text-brown-light font-medium uppercase tracking-wider">malgyeol Rehearsal Simulation</div>
                  </div>

                  <div className="bg-cream/45 p-4 rounded-xl border border-border-light text-xs space-y-2 leading-relaxed text-brown-dark">
                    안녕하세요, 저는 <span className="px-1 bg-terracotta-pale text-terracotta rounded font-semibold border border-terracotta/20">산업디자인학과</span> 3학년 김지수입니다. 저는 평소 감성과 공간을 연결하는 디자인에 관심이 많습니다.
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-brown-light">실시간 오디오 리프레시</div>
                    <div className="flex items-center gap-1 h-12">
                      {Array.from({ length: 30 }).map((_, idx) => (
                        <div 
                          key={idx} 
                          className="flex-1 bg-terracotta rounded-sm"
                          style={{
                            height: `${4 + Math.sin(idx * 0.4) * 28 + Math.random() * 8}px`,
                            opacity: idx > 20 ? 0.35 : 1
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-cream/30 rounded-lg border border-border-light text-center">
                      <div className="text-2xl font-bold font-display text-terracotta">78%</div>
                      <div className="text-[9px] text-brown-light mt-0.5">발음 일치율</div>
                    </div>
                    <div className="p-3 bg-cream/30 rounded-lg border border-border-light text-center">
                      <div className="text-2xl font-bold font-display text-brown-dark">135</div>
                      <div className="text-[9px] text-brown-light mt-0.5">말하기 속도 (KPM)</div>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* NEW: Beginner Phonation Playground Call-To-Action Banner */}
            <section className="max-w-7xl mx-auto px-6 md:px-12 pb-16">
              <div className="bg-gradient-to-r from-[#FDFBF7] to-[#F5EBE0] border-2 border-terracotta/25 rounded-3xl p-6 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xs">
                <div className="space-y-4 max-w-2xl text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-terracotta/10 text-terracotta rounded-full text-[11px] font-bold">
                    <span>✨</span> 단어를 발음하기 힘든 초보자를 위한 특별 훈련
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-brown-dark font-display leading-tight">
                    단어 발음이 아예 어려운 입문자를 위한<br />
                    <span className="text-terracotta underline decoration-terracotta/30 underline-offset-4">첫울림 디딤터 (기초 성음 및 모음 연습)</span>
                  </h2>
                  <p className="text-sm text-brown-mid leading-relaxed font-light">
                    의미 없는 소리만 내어 발성하는 단계부터 시작해 보세요! 
                    실시간 마이크 입력과 성대 에너지를 바탕으로 <strong>'으', '아', '우', '이', '어'</strong> 등 주요 모음 간의 조음 턱 벌림도, 혀의 수직/수평 전환 경로를 직관적인 동적 글로잉(Glowing) 그래픽으로 잡아 줍니다. 
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-brown-light font-medium">
                    <span>• 👄 턱 벌림 백분율(%) 가이드</span>
                    <span className="text-terracotta/40">|</span>
                    <span>• 👅 혀의 앞/뒤 높낮이 경로 시각화</span>
                    <span className="text-terracotta/40">|</span>
                    <span>• ⏱️ 3초 성음 지속 트레이너</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    setActiveTab('deaf-culture');
                    setDeafRightMode('vocal');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full lg:w-auto px-7 py-4 bg-terracotta hover:bg-terracotta-light text-white font-bold text-sm rounded-full transition-all shrink-0 shadow-md flex items-center justify-center gap-2 hover:scale-102"
                >
                  <Mic size={16} />
                  기초 성음 연습 바로가기 →
                </button>
              </div>
            </section>

            {/* Feature Cards Grid */}
            <section className="bg-white py-16 md:py-24 border-y border-border">
              <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
                <div className="text-center space-y-3">
                  <span className="text-xs font-bold text-terracotta uppercase tracking-widest">Core values</span>
                  <h2 className="text-3xl md:text-4xl font-extrabold font-display text-brown-dark">
                    말결이 제공하는 3대 혁신적 피드백
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-8 border border-border bg-cream/15 rounded-2xl flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-xl bg-terracotta-pale text-terracotta flex items-center justify-center text-xl font-bold">
                      〰️
                    </div>
                    <h3 className="text-lg font-bold text-brown-dark">실시간 음파 파형 시각화</h3>
                    <p className="text-sm text-brown-mid leading-relaxed font-light">
                      발화와 동시에 말소리의 음량과 주파수를 실시간 그래픽 파형으로 변환합니다. 소리의 리듬과 억양을 눈으로 보며 조율해 볼 수 있습니다.
                    </p>
                  </div>

                  <div className="p-8 border border-border bg-cream/15 rounded-2xl flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-xl bg-terracotta-pale text-terracotta flex items-center justify-center text-xl">
                      👄
                    </div>
                    <h3 className="text-lg font-bold text-brown-dark">정확한 대본 비교 분석</h3>
                    <p className="text-sm text-brown-mid leading-relaxed font-light">
                      사용자가 낭독한 발화 텍스트와 원문 대본을 정확한 한글 단어 매칭 알고리즘으로 대조하고, 완벽히 매칭된 단어와 교정이 필요한 단어를 시각적으로 구별합니다.
                    </p>
                  </div>

                  <div className="p-8 border border-border bg-cream/15 rounded-2xl flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-xl bg-terracotta-pale text-terracotta flex items-center justify-center text-xl">
                      📊
                    </div>
                    <h3 className="text-lg font-bold text-brown-dark">안전한 로컬 프라이버시</h3>
                    <p className="text-sm text-brown-mid leading-relaxed font-light">
                      어떤 음성 데이터도 기기 외부 서버로 수집 또는 전송되지 않습니다. 구글 크롬의 안정적인 로컬 음성 엔진(Speech API)만을 사용해 프라이버시를 지킵니다.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA section */}
            <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
              <div className="bg-brown-dark text-white rounded-3xl p-8 md:p-16 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-10 shadow-sm">
                <div className="absolute right-0 bottom-0 opacity-5 font-logo text-9xl pointer-events-none tracking-tighter">
                  말결
                </div>
                
                <div className="space-y-4 text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-extrabold font-display">
                    두려움 대신 자신감으로<br />
                    리허설을 시작해 보세요
                  </h2>
                  <p className="text-sm text-white/60 leading-relaxed font-light">
                    모든 대학생의 배리어프리 발표 교육을 위해 제작된 말결과 함께라면,<br />
                    어느 무대에서든 떨지 않고 정확한 발표가 가능해집니다.
                  </p>
                </div>

                <button 
                  onClick={() => setActiveTab('rehearsal')}
                  className="px-8 py-4 bg-white hover:bg-cream text-brown-dark font-bold rounded-full transition-all shrink-0 shadow-sm"
                >
                  지금 연습하러 가기 →
                </button>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: REHEARSAL SCREEN (Main Application Console) */}
        {activeTab === 'rehearsal' && (
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-brown-dark font-display">발표 리허설</h1>
                <p className="text-xs text-brown-light mt-1">대본을 선택하고 마이크 녹화를 통해 발표의 정확도를 즉시 측정할 수 있습니다.</p>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-terracotta bg-terracotta-pale/50 px-3 py-1.5 rounded-lg border border-terracotta/10">
                <Info size={14} />
                <span>💡 크롬 브라우저에서 사용해주세요 (Web Speech API 최적 지원)</span>
              </div>
            </div>

            {/* Rehearsal Shell Dashboard */}
            <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
              
              {/* Left Column: Script list & selection */}
              <div className="lg:col-span-3 border-r border-border-light bg-warm-white p-5 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-bold text-brown-light uppercase tracking-wider mb-4">내 발표 스크립트</div>
                  <div className="space-y-2">
                    {scripts.map(s => (
                      <div 
                        key={s.id}
                        onClick={() => handleSelectScript(s.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                          selectedScriptId === s.id 
                            ? 'bg-terracotta-pale/40 border-terracotta/30 shadow-xs' 
                            : 'bg-white border-border-light hover:border-border hover:bg-cream/10'
                        }`}
                      >
                        <div className="text-xs font-bold text-brown-dark truncate pr-6">{s.name}</div>
                        <div className="text-[10px] text-brown-light mt-1">총 {s.text.length}자 · 자가 대본</div>
                        
                        {selectedScriptId === s.id && (
                          <span className="inline-block px-1.5 py-0.5 bg-terracotta-pale text-terracotta rounded text-[9px] mt-2 font-semibold">리허설 중</span>
                        )}

                        {/* Trash Button */}
                        {scripts.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteScript(s.id);
                            }}
                            className="absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 hover:text-red-600 text-brown-light p-1 rounded-md transition-all"
                            title="삭제"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-border-light space-y-3">
                  <div className="flex items-center gap-2 text-xs text-brown-mid px-1 py-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${micPermission === 'granted' ? 'bg-emerald-500 animate-pulse' : 'bg-brown-light'}`}></span>
                    마이크 상태: {micPermission === 'granted' ? '정상 연결됨' : '권한 확인 필요'}
                  </div>
                  
                  <button 
                    onClick={handleAddScript}
                    className="w-full py-2.5 border border-dashed border-border hover:border-terracotta hover:text-terracotta text-brown-mid rounded-xl text-xs font-semibold bg-white transition-all flex items-center justify-center gap-1.5"
                  >
                    + 새 스크립트 추가
                  </button>
                </div>
              </div>

              {/* Center Column: Text editor & live recording box */}
              <div className="lg:col-span-6 p-6 bg-cream/10 flex flex-col gap-5 overflow-y-auto">
                
                {/* Rehearsal Mode Selector: Standard Full Script vs PPT Presentation */}
                <div className="flex bg-warm-white p-1 rounded-xl border border-border shadow-3xs shrink-0">
                  <button
                    onClick={() => {
                      setRehearsalMode('standard');
                      setCurrentSlideIndex(0);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      rehearsalMode === 'standard'
                        ? 'bg-white text-brown-dark shadow-3xs border border-border/50'
                        : 'text-brown-mid hover:text-brown-dark'
                    }`}
                  >
                    <FileText size={13} className="text-terracotta" />
                    <span>📝 일반 전체 대본 모드</span>
                  </button>
                  <button
                    onClick={() => {
                      setRehearsalMode('ppt');
                      setCurrentSlideIndex(0);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      rehearsalMode === 'ppt'
                        ? 'bg-white text-brown-dark shadow-3xs border border-border/50'
                        : 'text-brown-mid hover:text-brown-dark'
                    }`}
                  >
                    <Presentation size={13} className="text-terracotta" />
                    <span>🖼️ PPT 슬라이드 발표 모드</span>
                  </button>
                </div>

                {/* MODE 1: Standard full-text script editor */}
                {rehearsalMode === 'standard' && (
                  <div className="bg-white border border-border rounded-xl p-5 space-y-3 shadow-xs animate-fade-in">
                    <div className="flex justify-between items-center pb-2 border-b border-border-light">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-brown-light">
                        <FileText size={14} className="text-terracotta" />
                        <span>📄 대본 편집기 — {scriptNameInput}</span>
                      </div>
                      <span className="text-[10px] text-brown-light">{scriptTextInput.length} 글자수</span>
                    </div>

                    <textarea
                      value={scriptTextInput}
                      onChange={(e) => handleScriptChange(e.target.value)}
                      placeholder="여기에 발표 스크립트를 작성해 주세요. 작성하는 도중 자동으로 로컬 브라우저에 실시간 저장됩니다."
                      className="w-full min-h-[140px] text-sm leading-relaxed text-brown-dark bg-transparent focus:outline-none resize-none placeholder:text-brown-light"
                    ></textarea>
                  </div>
                )}

                {/* MODE 2: PPT presentation slides with slide note manager */}
                {rehearsalMode === 'ppt' && (
                  <div className="space-y-4 animate-fade-in">
                    
                    {/* PPTX File Upload Banner */}
                    <div className="bg-gradient-to-r from-terracotta-pale/30 to-cream/20 border border-dashed border-terracotta/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-3xs select-none">
                      <div className="flex items-center gap-3 text-left">
                        <div className="p-2.5 bg-terracotta/10 text-terracotta rounded-lg shrink-0">
                          <Presentation size={18} className="animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-brown-dark tracking-wide">PowerPoint (.pptx) 대본 일괄 불러오기</h4>
                          <p className="text-[10px] text-brown-light font-light leading-relaxed">
                            실제 PPT 파일을 업로드하면 모든 슬라이드의 발표자 노트(대본)와 텍스트 내용이 페이지별로 자동 매핑됩니다!
                          </p>
                        </div>
                      </div>
                      
                      <label className="px-3 py-1.5 bg-terracotta hover:bg-terracotta-light text-white text-[11px] font-bold rounded-lg cursor-pointer transition-all shrink-0 shadow-3xs flex items-center gap-1">
                        <span>📂 PPTX 파일 선택</span>
                        <input 
                          type="file" 
                          accept=".pptx" 
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handlePptxUpload(e.target.files[0]);
                            }
                          }} 
                          className="hidden" 
                        />
                      </label>
                    </div>

                    {/* Presentation Screen Mockup with Dynamic Image Uploads / Simulators */}
                    <div className="border border-border rounded-xl bg-slate-900 overflow-hidden relative shadow-md aspect-video flex flex-col items-center justify-center">
                      {slideImages[selectedScriptId]?.[currentSlideIndex] ? (
                        <img 
                          src={slideImages[selectedScriptId][currentSlideIndex]} 
                          alt="PPT Slide Screen" 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : pptSlideContents[selectedScriptId]?.[currentSlideIndex] ? (
                        <div className="w-full h-full bg-gradient-to-br from-[#2D211A] via-[#1E1511] to-[#120C0A] flex flex-col p-8 md:p-10 text-left text-white select-none relative">
                          <div className="border-b border-white/10 pb-3.5 mb-3.5 flex justify-between items-end">
                            <div>
                              <span className="text-[9px] text-terracotta-pale bg-terracotta/30 px-2 py-0.5 rounded border border-terracotta/20 font-black tracking-widest uppercase">Slide {currentSlideIndex + 1}</span>
                              <h3 className="text-base md:text-lg font-black tracking-tight text-white/95 mt-1.5">
                                {pptSlideContents[selectedScriptId][currentSlideIndex].title}
                              </h3>
                            </div>
                            <span className="text-[8px] text-white/40 font-mono tracking-wider">PPTX AUTO PREVIEW</span>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs text-white/70">
                            {pptSlideContents[selectedScriptId][currentSlideIndex].content && pptSlideContents[selectedScriptId][currentSlideIndex].content.length > 0 ? (
                              pptSlideContents[selectedScriptId][currentSlideIndex].content.map((bullet, bidx) => (
                                <div key={bidx} className="flex items-start gap-1.5 leading-relaxed font-light">
                                  <span className="text-terracotta-light mt-1 shrink-0 text-[10px]">•</span>
                                  <p className="text-[11px] text-white/80">{bullet}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-[10px] text-white/30 italic">슬라이드 본문 텍스트가 없습니다.</p>
                            )}
                          </div>
                          
                          <div className="absolute bottom-3 left-8 text-[7px] text-white/20 uppercase tracking-widest font-mono">
                            말결 AI 프레젠테이션 시뮬레이터
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-terracotta/15 to-brown-dark/90 flex flex-col items-center justify-center p-8 text-center text-white space-y-3 select-none">
                          <Presentation size={44} className="text-terracotta-light animate-pulse" />
                          <div className="space-y-1">
                            <span className="text-[9px] text-terracotta bg-terracotta-pale/20 px-2 py-0.5 rounded-full border border-terracotta/20 font-bold tracking-wide">Slide {currentSlideIndex + 1}</span>
                            <h3 className="text-sm font-bold tracking-tight text-white/95">
                              {getSlidesFromText(scriptTextInput)[currentSlideIndex]?.title || `슬라이드 ${currentSlideIndex + 1}`}
                            </h3>
                          </div>
                          <p className="text-[10px] text-white/50 max-w-xs truncate px-4">
                            {getSlidesFromText(scriptTextInput)[currentSlideIndex]?.note || '대본 텍스트가 아직 비어있습니다.'}
                          </p>
                        </div>
                      )}

                      {/* Screen Overlays */}
                      <div className="absolute top-3 left-3 bg-black/60 px-2.5 py-1 rounded-full text-[9px] text-white font-bold backdrop-blur-xs border border-white/10 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                        <span>프레젠테이션 스크린</span>
                      </div>

                      {/* Upload Slide Cover Trigger */}
                      <label className="absolute bottom-3 right-3 bg-black/75 hover:bg-black text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer border border-white/10 transition-all flex items-center gap-1 shadow-3xs select-none">
                        <FileImage size={11} />
                        <span>슬라이드 이미지 업로드</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleSlideImageUpload(currentSlideIndex, e.target.files[0]);
                            }
                          }} 
                          className="hidden" 
                        />
                      </label>
                    </div>

                    {/* Navigation & Slides Controls row */}
                    <div className="flex items-center justify-between bg-white border border-border p-3 rounded-xl shadow-3xs select-none">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            setCurrentSlideIndex(prev => Math.max(0, prev - 1));
                            setCurrentResult(null);
                          }}
                          disabled={currentSlideIndex === 0}
                          className="p-2 border border-border rounded-lg text-xs font-bold bg-white text-brown-dark hover:border-brown-dark disabled:opacity-40 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          ◀ 이전
                        </button>
                        <button
                          onClick={() => {
                            setCurrentSlideIndex(prev => Math.min(getSlidesFromText(scriptTextInput).length - 1, prev + 1));
                            setCurrentResult(null);
                          }}
                          disabled={currentSlideIndex === getSlidesFromText(scriptTextInput).length - 1}
                          className="p-2 border border-border rounded-lg text-xs font-bold bg-white text-brown-dark hover:border-brown-dark disabled:opacity-40 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          다음 ▶
                        </button>
                      </div>

                      <span className="text-xs font-bold text-brown-mid bg-cream/30 border border-border/50 px-3 py-1.5 rounded-lg">
                        슬라이드 {currentSlideIndex + 1} / {getSlidesFromText(scriptTextInput).length}
                      </span>

                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            const total = getSlidesFromText(scriptTextInput).length;
                            const newText = scriptTextInput + `\n\n[슬라이드 ${total + 1}]\n여기에 새 슬라이드의 대본을 작성해 주세요.`;
                            handleScriptChange(newText);
                            setCurrentSlideIndex(total);
                          }}
                          className="p-1.5 border border-dashed border-border hover:border-terracotta hover:text-terracotta rounded-lg text-[10px] font-bold bg-white text-brown-mid transition-all cursor-pointer"
                          title="새 슬라이드 추가"
                        >
                          + 추가
                        </button>
                        {getSlidesFromText(scriptTextInput).length > 1 && (
                          <button
                            onClick={() => {
                              if (confirm('정말로 이 슬라이드를 삭제하시겠습니까? 해당 슬라이드의 대본도 함께 삭제됩니다.')) {
                                const slidesCopy = getSlidesFromText(scriptTextInput);
                                slidesCopy.splice(currentSlideIndex, 1);
                                
                                const hasMarkers = /\[(?:슬라이드|Slide)\s*\d+\]/gi.test(scriptTextInput);
                                let newText = '';
                                if (hasMarkers) {
                                  newText = slidesCopy.map((s, idx) => `[슬라이드 ${idx + 1}]\n${s.note}`).join('\n\n');
                                } else {
                                  newText = slidesCopy.map(s => s.note).join('\n\n');
                                }
                                
                                handleScriptChange(newText);
                                setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
                                setCurrentResult(null);
                              }
                            }}
                            className="p-1.5 border border-border hover:border-red-500 hover:text-red-500 rounded-lg text-[10px] font-bold bg-white text-brown-mid transition-all cursor-pointer"
                            title="현재 슬라이드 삭제"
                          >
                            🗑️ 삭제
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Presenter Notes Editor */}
                    <div className="bg-white border border-border rounded-xl p-5 space-y-3 shadow-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-border-light">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-brown-light">
                          <Layers size={14} className="text-terracotta" />
                          <span>📋 슬라이드 {currentSlideIndex + 1} 발표 대본 (발표자 노트)</span>
                        </div>
                        <span className="text-[10px] text-brown-light">
                          {(getSlidesFromText(scriptTextInput)[currentSlideIndex]?.note || '').length} 글자수
                        </span>
                      </div>

                      <textarea
                        value={getSlidesFromText(scriptTextInput)[currentSlideIndex]?.note || ''}
                        onChange={(e) => handleUpdateSlideNote(currentSlideIndex, e.target.value)}
                        placeholder="이 슬라이드 화면에 맞는 대본(발표자 노트)을 작성해 주세요. 작성 즉시 전체 대본 및 저장소와 실시간으로 연동되어 안전하게 자동 저장됩니다."
                        className="w-full min-h-[120px] text-sm leading-relaxed text-brown-dark bg-transparent focus:outline-none resize-none placeholder:text-brown-light"
                      ></textarea>
                    </div>
                  </div>
                )}

                {/* Microphone / Record Button Box */}
                <div className="bg-white border border-border rounded-xl p-6 text-center space-y-4 shadow-xs">
                  <div className="flex justify-between items-center text-xs text-brown-light">
                    <span>⏱ 녹화 경과 시간</span>
                    <span className="font-semibold text-brown-dark">{formatTimer(recordingSeconds)} / 03:00</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 pt-2">
                    {!isRecording ? (
                      <button 
                        onClick={handleStartRecording}
                        className="w-16 h-16 rounded-full bg-terracotta hover:bg-terracotta-light text-white transition-all flex items-center justify-center shadow-md hover:scale-105"
                        title="리허설 시작"
                      >
                        <Play size={24} className="ml-1 fill-white" />
                      </button>
                    ) : (
                      <button 
                        onClick={handleStopRecording}
                        className="w-16 h-16 rounded-full bg-terracotta text-white flex items-center justify-center shadow-lg animate-pulse-red"
                        title="리허설 정지 및 완료"
                      >
                        <Square size={20} className="fill-white text-white" />
                      </button>
                    )}

                    <div className="text-xs font-bold text-terracotta mt-2">
                      {isRecording ? '● 녹화 및 인식 진행 중 — 눌러서 분석 시작' : '▶ 녹화 버튼을 눌러 리허설을 진행하세요'}
                    </div>
                    <p className="text-[10px] text-brown-light">낭독 시 음성이 한글로 변환되며 실시간 분석을 진행합니다.</p>
                    
                    {/* Simulator fallbacks */}
                    <div className="w-full mt-3 pt-3 border-t border-dashed border-border-light/80 flex flex-col items-center gap-2">
                      <div className="flex items-center gap-1 text-[10px] text-brown-light font-medium">
                        <span>🎙️ 마이크 사용이 불가하거나 시뮬레이션 테스트를 원할 때:</span>
                      </div>
                      <div className="flex flex-wrap justify-center gap-1.5 w-full">
                        <button
                          onClick={() => handleSimulateRehearsal('high')}
                          className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                          title="92점 우수 점수 가상 테스트"
                        >
                          <span>🟢 우수 시뮬레이션 (92점)</span>
                        </button>
                        <button
                          onClick={() => handleSimulateRehearsal('mid')}
                          className="px-2.5 py-1 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/50 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                          title="73점 보통 점수 가상 테스트"
                        >
                          <span>🟡 보통 시뮬레이션 (73점)</span>
                        </button>
                        <button
                          onClick={() => handleSimulateRehearsal('low')}
                          className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/50 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                          title="36점 미흡 점수 가상 테스트"
                        >
                          <span>🔴 미흡 시뮬레이션 (36점)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Audio Processing Toggle */}
                  <div className="flex justify-between items-center bg-cream/20 px-3 py-2 rounded-lg border border-border-light/60 text-xs">
                    <div className="flex items-center gap-1.5 text-brown-mid">
                      <Sliders size={13} className="text-terracotta" />
                      <span>저대역 필터링 오디오 노이즈 캔슬링</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={filterEnabled}
                        onChange={(e) => setFilterEnabled(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-8 h-4.5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-terracotta"></div>
                    </label>
                  </div>

                  {/* SVG Waveform driven by Web Audio API */}
                  <div className="pt-4 border-t border-border-light">
                    <div className="text-[10px] font-bold text-brown-light text-left mb-2.5 flex items-center gap-1">
                      <Activity size={12} className="text-terracotta" />
                      <span>실시간 마이크 음파 주파수 파형</span>
                    </div>
                    <svg className="w-full h-12" viewBox="0 0 500 48" preserveAspectRatio="none">
                      {waveformBars.map((val, idx) => (
                        <rect 
                          key={idx}
                          x={(idx / 70) * 500}
                          width={(500 / 70) - 1.5}
                          y={24 - val / 2}
                          height={val}
                          rx={1.5}
                          fill={isRecording ? (val > 24 ? '#E8693A' : '#C1440E') : '#E8DDD3'}
                          className="transition-all duration-75"
                        />
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Live Output STT Streaming Box */}
                <div className="bg-white border border-border rounded-xl p-5 space-y-2 shadow-xs">
                  <div className="text-xs font-bold text-brown-light flex items-center gap-1">
                    <Volume2 size={13} className="text-terracotta" />
                    <span>🎙 실시간 텍스트 수신 (STT)</span>
                  </div>
                  <div className="text-sm min-h-[60px] leading-relaxed text-brown-mid bg-cream/10 p-3 rounded-lg border border-border-light italic">
                    {sttTranscript || interimTranscript ? (
                      <span>
                        <span className="text-brown-dark not-italic">{sttTranscript}</span>
                        <span className="text-terracotta ml-1">{interimTranscript}</span>
                      </span>
                    ) : (
                      <span className="text-brown-light">대본을 읽어 주시면 음성 인식을 시작하여 실시간 텍스트 스트리밍이 여기에 나타납니다.</span>
                    )}
                  </div>
                </div>

                {/* Comparison Analysis Render panel */}
                {currentResult && (
                  <div className="bg-white border border-border rounded-xl p-5 space-y-4 shadow-sm animate-fade-in">
                    <div className="flex justify-between items-center pb-2 border-b border-border-light">
                      <span className="text-xs font-bold text-brown-light">🔍 대본 vs 인식 결과 매칭 비교</span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] font-bold">비교 결과</span>
                    </div>

                    <div className="text-sm leading-relaxed p-4 bg-cream/20 rounded-xl border border-border-light tracking-wide space-y-1">
                      {currentResult.originalWords.map((word, idx) => {
                        const cleanWord = normalizeWord(word);
                        const isMatched = currentResult.matchedWords.some(matched => 
                          normalizeWord(matched) === cleanWord
                        );
                        return (
                          <span 
                            key={idx} 
                            className={`inline-block px-1.5 py-0.5 mx-0.5 my-1 rounded-md text-xs font-medium transition-colors ${
                              isMatched ? 'word-ok' : 'word-miss'
                            }`}
                          >
                            {word}
                          </span>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="flex gap-4 text-xs font-semibold">
                      <div className="flex items-center gap-1.5 text-emerald-800">
                        <span className="w-3.5 h-3.5 rounded bg-[#D4EDDA] border border-[#28A745] inline-block"></span>
                        <span>잘 전달됨</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-800">
                        <span className="w-3.5 h-3.5 rounded bg-[#FFF3CD] border border-[#FFC107] inline-block"></span>
                        <span>추가 연습 필요</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Interactive Scores, feedback advice & recent results */}
              <div className="lg:col-span-3 border-l border-border-light bg-warm-white p-5 flex flex-col justify-between">
                <div className="space-y-6">
                  
                  {/* radial & bar scores */}
                  <div>
                    <div className="text-[11px] font-bold text-brown-light uppercase tracking-wider mb-3">전달력 리포트</div>
                    
                    {/* Donut Score Circular SVG */}
                    <div className="flex justify-center py-2">
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-border"
                            strokeWidth="3"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-terracotta transition-all duration-1000"
                            strokeWidth="3"
                            strokeDasharray={`${currentResult ? currentResult.score : 0}, 100`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-3xl font-extrabold font-display text-brown-dark">
                            {currentResult ? currentResult.score : '--'}
                          </span>
                          <span className="block text-[8px] text-brown-light">종합 평가</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress score meters */}
                    <div className="space-y-3.5 mt-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-brown-mid">
                          <span>발음 일치율 (60%)</span>
                          <span>{currentResult ? `${currentResult.matchRate}%` : '--'}</span>
                        </div>
                        <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-terracotta transition-all duration-700" 
                            style={{ width: currentResult ? `${currentResult.matchRate}%` : '0%' }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-brown-mid">
                          <span>말하기 속도 (20%)</span>
                          <span>{currentResult ? `${currentResult.kpm} KPM` : '--'}</span>
                        </div>
                        <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-terracotta-light transition-all duration-700" 
                            style={{ width: currentResult ? `${Math.min(100, Math.round((currentResult.kpm / 250) * 100))}%` : '0%' }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-brown-mid">
                          <span>어휘 연속성 (20%)</span>
                          <span>{currentResult ? `${currentResult.continuity}%` : '--'}</span>
                        </div>
                        <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-brown-light transition-all duration-700" 
                            style={{ width: currentResult ? `${currentResult.continuity}%` : '0%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Smart auto-generated Advice Text Cards */}
                  <div>
                    <div className="text-[11px] font-bold text-brown-light uppercase tracking-wider mb-2">분석 맞춤 피드백</div>
                    <div className="p-3 bg-terracotta-pale/20 border border-border rounded-xl text-[11px] leading-relaxed text-brown-dark space-y-2">
                      {currentResult ? (
                        <div className="space-y-2">
                          {currentResult.matchRate >= 80 ? (
                            <div className="flex gap-1.5 text-emerald-800 font-medium">
                              <span className="shrink-0">✅</span>
                              <span>전달 일치율이 {currentResult.matchRate}%입니다. 청중에게 아주 명확하게 전달되었습니다!</span>
                            </div>
                          ) : (
                            <div className="flex gap-1.5 text-amber-800 font-medium">
                              <span className="shrink-0">❗</span>
                              <span>전달 일치율 {currentResult.matchRate}%입니다. 주요 어휘를 보다 짚어 말해보세요.</span>
                            </div>
                          )}

                          {currentResult.kpm > 180 ? (
                            <div className="flex gap-1.5 text-red-800 font-medium">
                              <span className="shrink-0">⚠️</span>
                              <span>말 속도가 다소 빠릅니다 ({currentResult.kpm} KPM). 조금 더 천천히 낭독해 보세요.</span>
                            </div>
                          ) : currentResult.kpm < 80 ? (
                            <div className="flex gap-1.5 text-amber-800 font-medium">
                              <span className="shrink-0">⚠️</span>
                              <span>말 속도가 조금 느립니다 ({currentResult.kpm} KPM). 한층 부드럽고 생동감 있게 연결해 보세요.</span>
                            </div>
                          ) : (
                            <div className="flex gap-1.5 text-emerald-800 font-medium">
                              <span className="shrink-0">✨</span>
                              <span>말 속도가 아주 이상적입니다 ({currentResult.kpm} KPM). 균형감 있는 발표입니다!</span>
                            </div>
                          )}

                          {currentResult.missedWords.length > 0 && (
                            <div className="flex gap-1.5 text-brown-mid border-t border-border-light pt-1.5 mt-1.5">
                              <span className="shrink-0">💡</span>
                              <span>'{currentResult.missedWords[0]}' 구절의 끝마무리에 주의해 보세요.</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-brown-light font-light text-center py-4">
                          녹음을 완료하면 음성 속도와 명확도를 측정해 정밀한 어드바이스를 드립니다.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Highlight word to review cards */}
                  {currentResult && currentResult.missedWords.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-brown-light uppercase tracking-wider mb-2">집중 반복 연습 단어 (최대 5개)</div>
                      <div className="flex flex-wrap gap-1.5">
                        {currentResult.missedWords.slice(0, 5).map((word, index) => (
                          <div 
                            key={index}
                            onClick={() => speakText(word)}
                            className="px-2.5 py-1.5 bg-[#FFF3CD] border border-[#FFC107]/40 rounded-lg text-xs font-semibold text-amber-900 flex items-center gap-1.5 shadow-2xs cursor-pointer hover:bg-amber-100 transition-all active:scale-95"
                            title="클릭하여 정확한 발음을 듣습니다."
                          >
                            <span>👄</span>
                            <span>{word}</span>
                            <Volume2 size={11} className="text-amber-700 shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Micro Recent History Section */}
                  <div>
                    <div className="text-[11px] font-bold text-brown-light uppercase tracking-wider mb-2">최근 발표 연습 결과</div>
                    <div className="space-y-1.5">
                      {history.slice(0, 3).map((h, i) => (
                        <div key={h.id} className="flex justify-between items-center text-xs py-1.5 border-b border-border-light">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${h.overallScore >= 70 ? 'bg-emerald-500' : h.overallScore >= 50 ? 'bg-amber-500' : 'bg-brown-light'}`}></span>
                            <span className="text-brown-mid truncate max-w-[120px]">{h.scriptName}</span>
                          </div>
                          <span className="font-bold text-brown-dark">{h.overallScore}점</span>
                        </div>
                      ))}
                      {history.length === 0 && (
                        <div className="text-[10px] text-brown-light text-center py-3">최근 연습 기록이 없습니다.</div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: RECORD ROOM & HISTORY */}
        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-brown-dark font-display">발표 리허설 기록 보관실</h1>
                <p className="text-xs text-brown-light mt-1">로컬 기기에 저장된 지금까지의 발표 세션 누적 성취도 기록입니다.</p>
              </div>

              {history.length > 0 && (
                <button 
                  onClick={handleClearHistory}
                  className="px-4 py-2 border border-border hover:border-red-400 hover:text-red-500 rounded-xl text-xs font-semibold bg-white text-brown-mid transition-all flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                  기록 전체 초기화
                </button>
              )}
            </div>

            {/* List history cards */}
            <div className="space-y-4">
              {history.map(entry => (
                <div key={entry.id} className="bg-white border border-border rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-border-light pb-3 gap-2">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-brown-dark flex items-center flex-wrap gap-2">
                        <span className={`w-2 h-2 rounded-full ${entry.overallScore >= 70 ? 'bg-emerald-500' : entry.overallScore >= 50 ? 'bg-amber-500' : 'bg-brown-light'}`}></span>
                        <span>{entry.scriptName}</span>
                        {entry.slideIndex !== undefined && (
                          <span className="px-1.5 py-0.5 bg-terracotta-pale text-terracotta text-[9px] font-black rounded border border-terracotta/20 flex items-center gap-0.5 select-none shrink-0">
                            <Presentation size={9} />
                            Slide {entry.slideIndex + 1} ({entry.slideTitle || '슬라이드'})
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-brown-light flex items-center gap-2">
                        <span>🕒 {entry.createdAt}</span>
                        <span>•</span>
                        <span>⏱ {entry.duration}초 녹음</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-extrabold font-display text-terracotta">{entry.overallScore}점</div>
                      <div className="text-[9px] text-brown-light">종합 점수</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-cream/25 p-3 rounded-xl border border-border-light">
                      <div className="text-base font-bold text-brown-dark">{entry.matchRate}%</div>
                      <div className="text-[9px] text-brown-light mt-0.5">발음 일치율</div>
                    </div>
                    <div className="bg-cream/25 p-3 rounded-xl border border-border-light">
                      <div className="text-base font-bold text-brown-dark">{entry.kpm} KPM</div>
                      <div className="text-[9px] text-brown-light mt-0.5">말 속도</div>
                    </div>
                    <div className="bg-cream/25 p-3 rounded-xl border border-border-light">
                      <div className="text-base font-bold text-brown-dark">{entry.continuity}%</div>
                      <div className="text-[9px] text-brown-light mt-0.5">연속성 지표</div>
                    </div>
                  </div>

                  {/* Matched / Missed detail details */}
                  <div className="text-xs space-y-2 pt-1">
                    <div className="flex flex-wrap gap-1 leading-relaxed">
                      <span className="font-bold text-brown-light mr-1">미인식 어휘:</span>
                      {entry.missedWords.length > 0 ? (
                        entry.missedWords.slice(0, 10).map((word, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-medium text-[10px]">
                            {word}
                          </span>
                        ))
                      ) : (
                        <span className="text-emerald-700 font-semibold">완벽한 어휘 매칭입니다! 🎉</span>
                      )}
                      {entry.missedWords.length > 10 && (
                        <span className="text-brown-light text-[10px] font-medium">외 {entry.missedWords.length - 10}개...</span>
                      )}
                    </div>

                    <div className="text-xs text-brown-mid bg-cream/15 p-3 rounded-lg border border-border-light italic">
                      <span className="font-bold text-brown-light block not-italic mb-1 text-[10px]">🗣 실제 인식 결과:</span>
                      "{entry.transcript || '음성 인식 내용 없음'}"
                    </div>
                  </div>
                </div>
              ))}

              {history.length === 0 && (
                <div className="bg-white border border-border border-dashed rounded-2xl py-16 text-center text-brown-light space-y-3 shadow-xs">
                  <div className="text-4xl">🗂</div>
                  <div className="text-sm font-semibold text-brown-dark">아직 저장된 리허설 기록이 없습니다</div>
                  <p className="text-xs max-w-xs mx-auto text-brown-light">리허설 화면에서 녹화 완료 및 분석을 성공하면 여기에 기록이 누적됩니다.</p>
                  <button 
                    onClick={() => setActiveTab('rehearsal')}
                    className="px-4 py-2 bg-terracotta hover:bg-terracotta-light text-white font-bold rounded-full text-xs transition-all mt-4"
                  >
                    첫 연습 진행하기
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* TAB 4: DEAF CULTURE & VISUAL ARTICULATION TRAINER */}
        {activeTab === 'deaf-culture' && (
          <div className="max-w-5xl mx-auto px-6 py-12 animate-fade-in space-y-12">
            
            {/* Philosophical Intro: What does "Deaf (농인)" mean? */}
            <div className="bg-white border border-border rounded-3xl p-6 md:p-10 shadow-xs space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border-light">
                <div className="space-y-2 max-w-2xl">
                  <span className="inline-block bg-terracotta-pale text-terracotta text-xs font-bold px-3 py-1 rounded-full border border-terracotta/10">
                    장애가 아닌 고유한 문화적 정체성
                  </span>
                  <h1 className="text-3xl font-bold font-display text-brown-dark leading-tight">
                    농인(聾人)과 말결의 철학
                  </h1>
                  <p className="text-xs text-brown-mid leading-relaxed font-light">
                    말결은 소리를 평가하고 단정 짓는 것이 아닙니다. 눈으로 아름답게 발음 자취를 새기며, 자신감을 가질 수 있도록 지원하는 무대입니다.
                  </p>
                </div>
                <div className="bg-cream/50 border border-border p-4 rounded-2xl md:w-80 shrink-0 text-center">
                  <span className="text-2xl font-semibold text-terracotta">聾 (농인 농)</span>
                  <div className="text-[10px] text-brown-light mt-1">귀가 어두워 소리가 마음으로 닿다</div>
                </div>
              </div>

              <div className="bg-cream/40 p-5 md:p-6 rounded-2xl border border-border-light space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-terracotta text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">💡</div>
                  <div className="space-y-2 text-sm leading-relaxed text-brown-dark">
                    <p className="font-semibold">농인(聾人)의 정의와 가치:</p>
                    <p className="text-brown-mid font-light">
                      "농인은 소리를 듣지 못하는 청각적 특성을 가졌으나, 이를 신체적 장애나 결핍으로 여기기보다 
                      <strong> '수어를 제1언어로 사용하며 농문화를 공유하는 독자적인 언어적·문화적 소수자'</strong>를 뜻합니다. 
                      단순한 질병이나 교정의 대상이 아닌, 고유한 정체성과 언어 사회를 가진 주체적인 사람들입니다."
                    </p>
                    <p className="text-brown-mid font-light text-xs mt-2 bg-white/70 p-3 rounded-lg border border-border/50">
                      이에 따라 말결의 <strong>조음(발음) 연습기</strong>는 농인들이 구어 소통 시 자신의 입안 구조와 
                      입 모양의 움직임, 음성 전달 과정을 시각적으로 인지하고 교정하여 발표 무대나 대외 소통 상황에서 
                      더 한층 당당하게 발표할 수 있도록 돕는 유니버설 시각 피드백 도구입니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vowel & Articulation (Anatomy) Guide Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Interactive Guides (Vowel Mouth and Tongue Anatomy) */}
              <div className="lg:col-span-7 bg-white border border-border rounded-3xl p-6 md:p-8 space-y-6 shadow-xs flex flex-col justify-start">
                
                {/* Header & Sub-tab bar */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-brown-dark flex items-center gap-1.5">
                      <span>🎨</span> 한글 시각 조음 학습기
                    </h2>
                    <p className="text-xs text-brown-light font-light">모음의 입안 단면 및 자음 조음점(연구개 등)의 상세 시각 자료를 학습합니다.</p>
                  </div>

                  {/* Sub-tabs selector */}
                  <div className="flex border-b border-border">
                    <button
                      onClick={() => setDeafLeftSubTab('vowels')}
                      className={`flex-1 pb-2.5 text-center text-xs font-semibold border-b-2 transition-all ${
                        deafLeftSubTab === 'vowels'
                          ? 'border-terracotta text-terracotta'
                          : 'border-transparent text-brown-mid hover:text-brown-dark'
                      }`}
                    >
                      기본 모음 입모양
                    </button>
                    <button
                      onClick={() => setDeafLeftSubTab('articulation')}
                      className={`flex-1 pb-2.5 text-center text-xs font-semibold border-b-2 transition-all ${
                        deafLeftSubTab === 'articulation'
                          ? 'border-terracotta text-terracotta'
                          : 'border-transparent text-brown-mid hover:text-brown-dark'
                      }`}
                    >
                      자음 조음점 사전 (연구개 등)
                    </button>
                  </div>
                </div>

                {/* Sub-tab 1: Vowels Mouth Shape */}
                {deafLeftSubTab === 'vowels' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Vowel Switch Buttons */}
                    <div className="grid grid-cols-5 gap-1.5 bg-cream p-1.5 rounded-xl border border-border-light">
                      {(['아', '이', '우', '에', '오'] as const).map((vowel) => (
                        <button
                          key={vowel}
                          onClick={() => {
                            setDeafActiveVowel(vowel);
                            speakText(vowel);
                          }}
                          className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                            deafActiveVowel === vowel 
                              ? 'bg-terracotta text-white shadow-xs' 
                              : 'text-brown-mid hover:bg-white hover:text-brown-dark'
                          }`}
                        >
                          {vowel}
                        </button>
                      ))}
                    </div>

                    {/* Mouth SVG Visualization Card */}
                    <div className="bg-cream/40 border border-border rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 justify-center">
                      
                      {/* Dynamic Mouth SVG */}
                      <div className="w-40 h-40 bg-white border border-border rounded-full flex items-center justify-center shadow-2xs shrink-0">
                        {deafActiveVowel === '아' && (
                          <svg viewBox="0 0 100 100" className="w-32 h-32 mx-auto">
                            <ellipse cx="50" cy="50" rx="35" ry="42" fill="none" stroke="#C1440E" strokeWidth="4" />
                            <ellipse cx="50" cy="50" rx="27" ry="34" fill="#F5E6D8" />
                            <path d="M 30 35 Q 50 39 70 35 L 70 31 Q 50 32 30 31 Z" fill="#FFF" stroke="#E8DDD3" strokeWidth="1" />
                            <path d="M 32 72 Q 50 63 68 72 Q 50 82 32 72" fill="#E8693A" opacity="0.9" />
                          </svg>
                        )}
                        {deafActiveVowel === '이' && (
                          <svg viewBox="0 0 100 100" className="w-32 h-32 mx-auto">
                            <ellipse cx="50" cy="50" rx="46" ry="14" fill="none" stroke="#C1440E" strokeWidth="4" />
                            <ellipse cx="50" cy="50" rx="40" ry="8" fill="#F5E6D8" />
                            <path d="M 16 50 Q 50 53 84 50" stroke="#FFF" strokeWidth="4" strokeLinecap="round" />
                            <path d="M 25 50 Q 50 49 75 50" stroke="#E8693A" strokeWidth="2" opacity="0.5" />
                          </svg>
                        )}
                        {deafActiveVowel === '우' && (
                          <svg viewBox="0 0 100 100" className="w-32 h-32 mx-auto">
                            <circle cx="50" cy="50" r="16" fill="none" stroke="#C1440E" strokeWidth="4" />
                            <circle cx="50" cy="50" r="11" fill="#F5E6D8" />
                            <circle cx="50" cy="50" r="6" fill="#7A6355" opacity="0.3" />
                          </svg>
                        )}
                        {deafActiveVowel === '에' && (
                          <svg viewBox="0 0 100 100" className="w-32 h-32 mx-auto">
                            <ellipse cx="50" cy="50" rx="42" ry="24" fill="none" stroke="#C1440E" strokeWidth="4" />
                            <ellipse cx="50" cy="50" rx="35" ry="17" fill="#F5E6D8" />
                            <path d="M 23 44 Q 50 48 77 44" stroke="#FFF" strokeWidth="3" strokeLinecap="round" />
                            <path d="M 25 58 Q 50 52 75 58" stroke="#E8693A" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                          </svg>
                        )}
                        {deafActiveVowel === '오' && (
                          <svg viewBox="0 0 100 100" className="w-32 h-32 mx-auto">
                            <ellipse cx="50" cy="50" rx="24" ry="32" fill="none" stroke="#C1440E" strokeWidth="4" />
                            <ellipse cx="50" cy="50" rx="18" ry="26" fill="#F5E6D8" />
                            <path d="M 38 40 Q 50 43 62 40" stroke="#FFF" strokeWidth="2" opacity="0.5" />
                            <path d="M 38 60 Q 50 54 62 60" stroke="#E8693A" strokeWidth="2" opacity="0.7" />
                          </svg>
                        )}
                      </div>

                      {/* Mouth and tongue explanation card */}
                      <div className="flex-1 space-y-3 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-terracotta">'{deafActiveVowel}'</span>
                          <span className="text-[10px] text-brown-mid font-semibold border border-border px-2 py-0.5 rounded-full bg-white">
                            {deafActiveVowel === '아' && '가장 열린 모음 (개모음)'}
                            {deafActiveVowel === '이' && '가장 평평한 전설모음'}
                            {deafActiveVowel === '우' && '둥근 오므림 모음 (원순모음)'}
                            {deafActiveVowel === '에' && '중간 열림 전설모음'}
                            {deafActiveVowel === '오' && '둥근 열림 원순모음'}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-brown-mid font-light">
                          <div>
                            <strong className="text-brown-dark font-semibold">입 벌림 지표:</strong>{' '}
                            {deafActiveVowel === '아' && '입을 상하로 활짝 크게 벌립니다 (100% 개방).'}
                            {deafActiveVowel === '이' && '입술을 양옆으로 바짝 당겨 수평으로 좁게 벌립니다.'}
                            {deafActiveVowel === '우' && '입을 거의 벌리지 않고 입술만 둥글게 앞으로 내밉니다.'}
                            {deafActiveVowel === '에' && '입을 가로와 세로 중간 크기로 부드럽게 벌립니다.'}
                            {deafActiveVowel === '오' && '입술을 둥글고 긴 세로 계란형 형태로 오므립니다.'}
                          </div>
                          <div>
                            <strong className="text-brown-dark font-semibold">혀의 위치:</strong>{' '}
                            {deafActiveVowel === '아' && '혀를 낮게 깔고 입안 공간을 최대로 넓힙니다.'}
                            {deafActiveVowel === '이' && '혀끝을 아래 잇몸 뒤쪽에 대고, 혀 중심을 입천장 쪽으로 높게 밀어 올립니다.'}
                            {deafActiveVowel === '우' && '혀를 뒤쪽 입천장 쪽으로 가장 높게 바짝 들어 올립니다.'}
                            {deafActiveVowel === '에' && '혀의 앞부분을 전설 고르게 중간 높이로 둡니다.'}
                            {deafActiveVowel === '오' && '혀를 뒤쪽으로 당겨 중간 높이에 고정시킵니다.'}
                          </div>
                        </div>

                        <button 
                          onClick={() => speakText(deafActiveVowel)}
                          className="text-[10px] font-bold text-terracotta hover:text-terracotta-light flex items-center gap-1 bg-white border border-border px-3 py-1 rounded-full transition-all shrink-0 mt-1 shadow-2xs"
                        >
                          <Volume2 size={10} />
                          표준 소리 들어보기
                        </button>
                      </div>
                    </div>

                    {/* Speech sound tips */}
                    <div className="bg-cream/20 p-4 rounded-2xl border border-border-light text-left text-[11px] leading-relaxed text-brown-mid font-light space-y-1">
                      <div className="font-semibold text-brown-dark flex items-center gap-1">
                        <span>💡</span> 자음 발화 꿀팁
                      </div>
                      <div>- <strong>ㄱ/ㅋ (어금닛소리):</strong> 혀뿌리로 입천장 뒤쪽 부드러운 부분(연구개)을 가볍게 때렸다가 내리며 뚫어줍니다.</div>
                      <div>- <strong>ㄴ/ㄷ/ㅌ (혓소리):</strong> 혀끝을 윗니 뒤쪽 잇몸 뼈 부위에 정확히 밀착했다가 떼며 공기를 튀겨 줍니다.</div>
                      <div>- <strong>ㅁ/ㅂ/ㅍ (입술소리):</strong> 두 입술을 또렷하고 가볍게 꼭 다물었다가 공기를 시원하게 모아 열어줍니다.</div>
                    </div>
                  </div>
                )}

                {/* Sub-tab 2: Articulation Anatomy Map (Soft palate / Alveolar ridge, etc.) */}
                {deafLeftSubTab === 'articulation' && (
                  <div className="space-y-6 animate-fade-in text-left">
                    <p className="text-[11px] text-brown-mid leading-relaxed font-light">
                      아래 <strong>인체 조음 기관 단면도</strong>의 반짝이는 원형 포인트를 클릭하거나 아래 버튼을 눌러, 그간 낯설게 느껴졌던 
                      <strong className="text-terracotta font-semibold"> '연구개(여린입천장)', '치조(잇몸)'</strong> 등의 조음 기제와 발음 원리를 명확한 시각 자료로 이해할 수 있습니다.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      
                      {/* Sagittal Vocal Tract Diagram SVG */}
                      <div className="md:col-span-5 flex justify-center bg-cream/30 border border-border rounded-2xl p-4 relative">
                        <svg viewBox="0 0 200 200" className="w-48 h-48 drop-shadow-sm">
                          {/* Background Skull / Head Outline */}
                          <path 
                            d="M 20 180 C 20 120, 15 80, 40 40 C 60 15, 120 10, 140 30 C 145 35, 150 45, 152 50 C 158 55, 175 60, 172 70 C 168 75, 152 75, 150 82 C 148 85, 156 89, 152 102 C 145 110, 130 115, 125 125 C 120 135, 120 180, 120 180" 
                            fill="none" 
                            stroke="#E8DDD3" 
                            strokeWidth="3" 
                            strokeLinecap="round"
                          />
                          
                          {/* Pharynx / Oral Cavity / Soft & Hard Palates */}
                          {/* Upper Tract Profile */}
                          <path 
                            d="M 50 180 L 50 130 C 50 110, 52 90, 68 85 C 74 84, 88 73, 102 73 C 114 73, 122 78, 124 82 C 124 82, 134 82, 142 82 C 145 82, 148 84, 144 87 L 142 88" 
                            fill="none" 
                            stroke="#D4C5B9" 
                            strokeWidth="4" 
                            strokeLinecap="round"
                          />

                          {/* Tongue and lower jaw profile */}
                          <path 
                            d="M 75 180 L 75 145 C 75 128, 88 118, 98 108 C 110 98, 124 94, 124 90 C 124 90, 135 90, 142 90 L 140 92" 
                            fill="none" 
                            stroke="#D4C5B9" 
                            strokeWidth="4" 
                            strokeLinecap="round"
                          />

                          {/* Interactive Highlight Paths based on active selection */}
                          {deafActiveAnatomyPoint === '양순' && (
                            <ellipse cx="143" cy="86" rx="6" ry="10" fill="#E8693A" opacity="0.3" className="animate-pulse" />
                          )}
                          {deafActiveAnatomyPoint === '치조' && (
                            <circle cx="122" cy="80" r="10" fill="#E8693A" opacity="0.3" className="animate-pulse" />
                          )}
                          {deafActiveAnatomyPoint === '경구개' && (
                            <path d="M 98 73 Q 110 73 118 78" stroke="#C1440E" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
                          )}
                          {deafActiveAnatomyPoint === '연구개' && (
                            <path d="M 72 84 Q 85 75 96 73" stroke="#C1440E" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
                          )}
                          {deafActiveAnatomyPoint === '후음' && (
                            <circle cx="52" cy="138" r="12" fill="#E8693A" opacity="0.3" className="animate-pulse" />
                          )}

                          {/* Hotspot buttons on SVG */}
                          {ANATOMY_LIST.map((pt) => {
                            const isSelected = deafActiveAnatomyPoint === pt.id;
                            return (
                              <g 
                                key={pt.id} 
                                className="cursor-pointer" 
                                onClick={() => {
                                  setDeafActiveAnatomyPoint(pt.id);
                                  speakText(pt.consonants.join(', '));
                                }}
                              >
                                <circle 
                                  cx={pt.x} 
                                  cy={pt.y} 
                                  r={isSelected ? "9" : "6"} 
                                  fill={isSelected ? "#C1440E" : "#8C6A5C"} 
                                  className="transition-all hover:r-10 duration-200"
                                />
                                <circle 
                                  cx={pt.x} 
                                  cy={pt.y} 
                                  r={isSelected ? "14" : "10"} 
                                  fill="none" 
                                  stroke={isSelected ? "#C1440E" : "transparent"} 
                                  strokeWidth="1.5" 
                                  className={isSelected ? "animate-ping opacity-60" : ""}
                                />
                                <text 
                                  x={pt.x} 
                                  y={pt.y - 12} 
                                  textAnchor="middle" 
                                  fill="#7A6355" 
                                  fontSize="7" 
                                  fontWeight="bold"
                                  className="pointer-events-none select-none bg-white/80"
                                >
                                  {pt.id}
                                </text>
                              </g>
                            );
                          })}
                        </svg>

                        {/* Interactive floating label overlay */}
                        <div className="absolute bottom-2 left-2 right-2 text-center text-[9px] text-brown-light bg-white/90 border border-border/60 py-1 rounded-md px-1 select-none">
                          기관도의 반짝이는 <span className="text-terracotta font-semibold">동그라미</span>를 누르면 해당 위치가 강조됩니다.
                        </div>
                      </div>

                      {/* Hotspot quick picker list */}
                      <div className="md:col-span-7 space-y-1.5 flex flex-col">
                        <div className="text-[10px] font-bold text-brown-light uppercase tracking-wider">부위 목록 선택</div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {ANATOMY_LIST.map((pt) => {
                            const isSelected = deafActiveAnatomyPoint === pt.id;
                            return (
                              <button
                                key={pt.id}
                                onClick={() => {
                                  setDeafActiveAnatomyPoint(pt.id);
                                  speakText(pt.consonants.join(', '));
                                }}
                                className={`py-1.5 px-3 rounded-xl border text-xs font-semibold transition-all text-left flex items-center gap-1 ${
                                  isSelected
                                    ? 'bg-terracotta border-terracotta text-white shadow-3xs'
                                    : 'bg-white border-border text-brown-mid hover:border-brown-mid'
                                }`}
                              >
                                <span>{pt.emoji}</span>
                                <span className="truncate">{pt.id}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Selected Anatomy Detail Card */}
                        {(() => {
                          const activePt = ANATOMY_LIST.find(p => p.id === deafActiveAnatomyPoint) || ANATOMY_LIST[3];
                          return (
                            <div className="mt-2 bg-cream/40 border border-border-light rounded-xl p-3.5 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <div className="text-xs font-bold text-brown-dark flex items-center gap-1">
                                    <span>{activePt.emoji}</span> {activePt.name}
                                  </div>
                                  <div className="text-[9px] font-mono text-brown-light uppercase tracking-wide">{activePt.scientificName}</div>
                                </div>
                                <div className="flex gap-1">
                                  {activePt.consonants.map((con, idx) => (
                                    <span key={idx} className="bg-white border border-border/80 text-[10px] font-bold text-terracotta px-1.5 py-0.5 rounded-md shadow-3xs">
                                      {con}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <p className="text-[11px] text-brown-mid font-light leading-relaxed">
                                {activePt.description}
                              </p>

                              <div className="bg-white border border-border/50 p-2.5 rounded-lg text-[10px] text-brown-mid font-light leading-relaxed">
                                <strong className="text-terracotta font-semibold block mb-0.5">💡 조음 훈련 가이드</strong>
                                {activePt.tip}
                              </div>

                              <button 
                                onClick={() => speakText(activePt.consonants.join(', '))}
                                className="text-[9px] font-bold text-terracotta hover:text-terracotta-light flex items-center gap-1 bg-white border border-border px-2.5 py-1 rounded-full transition-all shadow-3xs"
                              >
                                <Volume2 size={9} />
                                자음 소리 모음 들어보기
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* 💡 잔존 청력(Residual Hearing)과 소리 듣기 기능의 핵심 역할 설명 카드 */}
                <div className="bg-gradient-to-br from-cream/25 to-white border border-border p-5 rounded-2xl space-y-3.5 shadow-3xs select-none mt-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border-light/60">
                    <span className="text-base">💡</span>
                    <h3 className="text-xs font-black text-brown-dark tracking-wide">
                      잔존 청력(Residual Hearing)과 소리 듣기 기능의 역할
                    </h3>
                  </div>
                  
                  <div className="space-y-2.5 text-[11px] leading-relaxed font-light text-brown-mid">
                    <p>
                      <strong>Q. 농인(Deaf) 대상 앱인데 왜 소리 듣기(TTS) 기능이 필요한가요?</strong>
                    </p>
                    <div className="space-y-2 pl-1.5 border-l-2 border-terracotta/25">
                      <p>
                        <strong>1. 잔존 청력과 인공와우/보청기 활용:</strong> 많은 청각장애인들은 전혀 들리지 않는 것이 아니며, 보청기나 인공와우(Cochlear Implant) 등의 청각 보조기기를 착용하고 <strong>잔존 청력(Residual Hearing)</strong>을 극대화하여 조음을 학습합니다. 표준 음성을 들으며 시각 자료와 대조하는 것은 매우 강력한 발음 피드백이 됩니다.
                      </p>
                      <p>
                        <strong>2. 골도 전화기 & 촉각 트랜스듀서 연동:</strong> 귀 대신 머리뼈나 골격을 울려 소리를 전하는 <strong>골도 헤드셋(Bone Conduction)</strong>이나 촉각 변환기를 연결하여 소리 주파수를 몸의 직접적인 피부 진동(진동 촉각)으로 느끼며 훈련합니다.
                      </p>
                      <p>
                        <strong>3. 교육 보호자 및 언어재활사(SLP) 참여 가이드:</strong> 농학생을 지도하는 언어재활사, 특수교사, 혹은 가정의 보호자가 올바른 기준 발음 소리를 먼저 함께 들어보고, 학생의 조음 위치(혀, 턱 벌림도)를 비교 및 보정하여 더 나은 지도를 하도록 돕는 훌륭한 참고 기준선 역할을 합니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Word Articulation Tester & Beginner Phonation Playground */}
              <div className="lg:col-span-5 bg-white border border-border rounded-3xl p-6 md:p-8 space-y-6 shadow-xs flex flex-col justify-start text-left">
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-brown-dark flex items-center gap-1.5">
                      <span>🎙️</span> 실시간 피드백 훈련기
                    </h2>
                    <p className="text-xs text-brown-light font-light">
                      단어 연습을 하거나, 목소리 내기에 서툰 분들을 위한 '첫울림 디딤 연습'을 지원합니다.
                    </p>
                  </div>

                  {/* Right Column Mode Tab Bar */}
                  <div className="flex bg-cream p-1 rounded-xl border border-border-light">
                    <button
                      onClick={() => {
                        setDeafRightMode('word');
                        setDeafSustainedStreak(0);
                        if (deafIsRecording) {
                          stopDeafPractice();
                        }
                      }}
                      className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all ${
                        deafRightMode === 'word'
                          ? 'bg-white text-brown-dark shadow-3xs border border-border-light/40'
                          : 'text-brown-mid hover:text-brown-dark'
                      }`}
                    >
                      단어 문장 연습
                    </button>
                    <button
                      onClick={() => {
                        setDeafRightMode('vocal');
                        setDeafSustainedStreak(0);
                        if (deafIsRecording) {
                          stopDeafPractice();
                        }
                      }}
                      className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all ${
                        deafRightMode === 'vocal'
                          ? 'bg-white text-brown-dark shadow-3xs border border-border-light/40'
                          : 'text-brown-mid hover:text-brown-dark'
                      }`}
                    >
                      첫울림 디딤 연습
                    </button>
                  </div>
                </div>

                {/* MODE 1: Standard Word / Sentence Practice */}
                {deafRightMode === 'word' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Customizable words selection list */}
                    <div className="space-y-3 bg-cream/30 border border-border/70 p-4 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-brown-dark uppercase tracking-wider">연습용 단어첩</span>
                        <span className="text-[10px] text-brown-light font-light">총 {deafWords.length}개</span>
                      </div>

                      {/* Words Container */}
                      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                        {deafWords.map((word) => {
                          const isActive = deafActiveWord === word;
                          return (
                            <div
                              key={word}
                              className={`group relative pl-3 pr-2 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1 ${
                                isActive
                                  ? 'bg-terracotta border-terracotta text-white shadow-2xs'
                                  : 'bg-white border-border text-brown-mid hover:border-brown-mid'
                              }`}
                            >
                              <span 
                                onClick={() => {
                                  setDeafActiveWord(word);
                                  setDeafSttTranscript('');
                                  setDeafInterimTranscript('');
                                  speakText(word);
                                }}
                                className="cursor-pointer"
                              >
                                {word}
                              </span>
                              
                              {/* Remove button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeDeafWord(word);
                                }}
                                className={`ml-1 rounded-full p-0.5 flex items-center justify-center transition-all ${
                                  isActive 
                                    ? 'text-white/70 hover:text-white hover:bg-white/20' 
                                    : 'text-brown-light hover:text-red-500 hover:bg-red-50'
                                }`}
                                title="단어 지우기"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          );
                        })}
                        
                        {deafWords.length === 0 && (
                          <div className="text-center w-full py-4 text-xs text-brown-light italic font-light">단어첩이 비어있습니다. 직접 아래에서 추가해 보세요!</div>
                        )}
                      </div>

                      {/* Add word text form */}
                      <div className="flex gap-1.5 pt-2 border-t border-border-light">
                        <input
                          type="text"
                          value={deafNewWordInput}
                          onChange={(e) => setDeafNewWordInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addDeafWord();
                            }
                          }}
                          placeholder="단어를 직접 입력 (예: 컴퓨터, 마음)"
                          className="flex-1 bg-white border border-border rounded-xl px-3 py-1.5 text-xs text-brown-dark focus:outline-none focus:ring-1 focus:ring-terracotta/40 placeholder-brown-light/60"
                        />
                        <button
                          onClick={addDeafWord}
                          className="bg-terracotta hover:bg-terracotta-light text-white p-2 rounded-xl transition-all shadow-3xs flex items-center justify-center shrink-0"
                          title="단어첩에 추가"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Practice Interactive Playground */}
                    <div className="bg-cream/45 rounded-2xl border border-border p-5 space-y-6">
                      
                      {/* Syllable Checker Grid */}
                      <div className="text-center space-y-3">
                        <span className="text-[10px] text-brown-light font-medium uppercase tracking-wider block">음절별 시각 도달도 (Syllable Hits)</span>
                        <div className="flex justify-center gap-2 flex-wrap">
                          {deafActiveWord.split('').map((char: string, index: number) => {
                            const normalizedSTT = (deafSttTranscript + ' ' + deafInterimTranscript).replace(/[^가-힣a-zA-Z0-9]/g, '');
                            const isMatched = normalizedSTT.includes(char);
                            return (
                              <div
                                key={index}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border shadow-3xs transition-all duration-300 transform ${
                                  isMatched
                                    ? 'bg-emerald-500 border-emerald-600 text-white scale-105 shadow-sm'
                                    : 'bg-white border-border text-brown-mid'
                                }`}
                              >
                                {char}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Vocal Energy Level Indicator */}
                      <div className="space-y-2 text-left">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-brown-light font-bold">성량(Voice Energy) 게이지</span>
                          <span className="text-[10px] text-terracotta font-bold">{deafMicEnergy}%</span>
                        </div>
                        <div className="h-4 bg-white border border-border rounded-full overflow-hidden p-0.5 shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-terracotta-pale via-terracotta-light to-terracotta rounded-full transition-all duration-75"
                            style={{ width: `${deafMicEnergy}%` }}
                          ></div>
                        </div>
                        <div className="text-[9px] text-brown-light leading-relaxed text-center">
                          {deafIsRecording ? (
                            deafMicEnergy > 50 ? '🔊 좋은 크기입니다! 계속해서 또박또박 발음하세요.' : '🎤 조금 더 목소리 에너지를 높여보세요.'
                          ) : (
                            '조음 마이크를 시작하면 목소리의 실시간 세기가 게이지로 표시됩니다.'
                          )}
                        </div>
                      </div>

                      {/* STT Realtime readout text */}
                      <div className="bg-white border border-border rounded-xl p-3.5 text-center min-h-[50px] flex items-center justify-center">
                        {(deafSttTranscript || deafInterimTranscript) ? (
                          <div className="space-y-1">
                            <span className="text-[10px] text-brown-light block font-semibold uppercase tracking-wider">실시간 인식 결과</span>
                            <div className="text-sm font-semibold text-terracotta">
                              {deafSttTranscript} <span className="text-brown-light italic">{deafInterimTranscript}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-brown-light italic font-light">마이크를 켜고 단어를 읽으면 여기에 음성 인식 결과가 나타납니다.</span>
                        )}
                      </div>
                    </div>

                    {/* Play controls for Practice */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => speakText(deafActiveWord)}
                        className="flex-1 py-3 border border-border bg-white text-brown-mid hover:text-brown-dark rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                        disabled={!deafActiveWord}
                      >
                        <Volume2 size={14} />
                        표준 발음 듣기
                      </button>

                      {deafIsRecording ? (
                        <button
                          onClick={stopDeafPractice}
                          className="flex-1 py-3 bg-brown-dark hover:bg-brown-dark/95 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Square size={14} />
                          연습 종료
                        </button>
                      ) : (
                        <button
                          onClick={startDeafPractice}
                          className="flex-1 py-3 bg-terracotta hover:bg-terracotta-light text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                          disabled={!deafActiveWord}
                        >
                          <Mic size={14} />
                          마이크 시작 (연습)
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* MODE 2: 첫울림 디딤터 (기초 성음 및 모음 연습) */}
                {deafRightMode === 'vocal' && (
                  <div className="space-y-5 animate-fade-in">
                    
                    {/* Vocal Targets Grid */}
                    <div className="space-y-2 bg-cream/40 border border-border/60 p-3 rounded-2xl">
                      <div className="flex justify-between items-center text-[10px] font-bold text-brown-light uppercase">
                        <span>🎯 연습할 기초 소리 / 경로 선택</span>
                        <span className="text-terracotta text-[9px] font-medium lowercase">의미없는 순수 성대 울림</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {(['으', '아', '우', '이', '어', '으아', '우이', '으우'] as const).map((vt) => (
                          <button
                            key={vt}
                            onClick={() => {
                              setDeafVocalTarget(vt);
                              setDeafSustainedStreak(0);
                              speakText(vt.length === 1 ? vt : vt.split('').join(' '));
                            }}
                            className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                              deafVocalTarget === vt
                                ? 'bg-terracotta border-terracotta text-white shadow-3xs'
                                : 'bg-white border-border text-brown-mid hover:border-brown-mid'
                            }`}
                          >
                            {vt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Vowel Characteristic Info & Svg Position Map */}
                    {(() => {
                      const tgt = VOCAL_TARGETS[deafVocalTarget] || VOCAL_TARGETS['으아'];
                      return (
                        <div className="space-y-4">
                          {/* Interactive Dual-Profile Articulation Playground (Mouth & Vocal Tract) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            {/* 1. Vocal Tract Side-Profile Panel */}
                            <div className="bg-cream/20 border border-border rounded-2xl p-4 flex flex-col items-center justify-between relative min-h-[200px] shadow-3xs overflow-hidden">
                              <div className="w-full flex justify-between items-center text-[10px] font-black text-brown-mid mb-2">
                                <span className="flex items-center gap-1">👅 조음 단면 프로필 (Vocal Tract)</span>
                                <span className="text-terracotta bg-white px-1.5 py-0.5 rounded border border-border-light text-[9px]">측면도</span>
                              </div>

                              {(() => {
                                const geom = getInterpolatedGeom(deafVocalTarget, deafMicEnergy);
                                return (
                                  <svg viewBox="0 0 200 150" className="w-full max-w-[170px] h-36">
                                    {/* Throat wall outline */}
                                    <path d="M 40 140 C 40 100, 35 70, 60 40 C 80 20, 130 15, 150 35 C 160 45, 165 55, 165 65" fill="none" stroke="#E3D5CA" strokeWidth="2.5" strokeDasharray="3,3" />
                                    <path d="M 115 140 L 115 105" fill="none" stroke="#E3D5CA" strokeWidth="2.5" strokeDasharray="3,3" />

                                    {/* Fixed Upper Jaw and Palate */}
                                    <path d="M 60 140 L 60 110 Q 60 80 95 80 Q 130 80 155 78" fill="none" stroke="#B8A08C" strokeWidth="5" strokeLinecap="round" />
                                    
                                    {/* Moving Lower Jaw driven by speech loudness & vowel state */}
                                    <g transform={`translate(0, ${geom.jawY * 0.4})`}>
                                      <path d="M 85 140 L 85 118 Q 95 105 115 105 Q 130 105 152 101" fill="none" stroke="#9C8470" strokeWidth="5" strokeLinecap="round" />
                                    </g>

                                    {/* Dynamic Tongue path computed via Bezier Interpolation */}
                                    <path 
                                      d={geom.tonguePath} 
                                      fill="none" 
                                      stroke="#E8693A" 
                                      strokeWidth="8" 
                                      strokeLinecap="round" 
                                      className="transition-all duration-75" 
                                      opacity={0.9} 
                                    />
                                    
                                    {/* Tongue label indicator */}
                                    <text x="100" y="134" fontSize="8" fill="#C1440E" fontWeight="bold" textAnchor="middle">혀 (Tongue)</text>

                                    {/* Vocal Cord (성대) vibration pulse glow */}
                                    <g transform="translate(48, 125)">
                                      <circle cx="0" cy="0" r={4 + (deafMicEnergy / 15)} className={`transition-all duration-75 ${deafMicEnergy > 15 ? 'fill-terracotta/50 animate-pulse' : 'fill-brown-light/20'}`} />
                                      {deafMicEnergy > 15 && (
                                        <path d="M -8 -4 Q -4 4 0 -4 T 8 -4" fill="none" stroke="#C1440E" strokeWidth="1.5" className="animate-bounce" />
                                      )}
                                      <text x="12" y="3" fontSize="7" fill="#8C7355" fontWeight="bold">성대 울림</text>
                                    </g>

                                    {/* Glow spot at the target resonance zone */}
                                    {(() => {
                                      let cx = 100, cy = 80;
                                      if (deafVocalTarget === '으') { cx = 100; cy = 80; }
                                      else if (deafVocalTarget === '아') { cx = 70; cy = 115; }
                                      else if (deafVocalTarget === '우') { cx = 138; cy = 76; }
                                      else if (deafVocalTarget === '이') { cx = 118; cy = 74; }
                                      else if (deafVocalTarget === '어') { cx = 85; cy = 98; }
                                      else if (deafVocalTarget === '으아') { cx = deafMicEnergy > 30 ? 70 : 100; cy = deafMicEnergy > 30 ? 115 : 80; }
                                      else if (deafVocalTarget === '우이') { cx = deafMicEnergy > 30 ? 118 : 138; cy = deafMicEnergy > 30 ? 74 : 76; }
                                      else if (deafVocalTarget === '으우') { cx = deafMicEnergy > 30 ? 138 : 100; cy = deafMicEnergy > 30 ? 76 : 80; }

                                      const r = 5 + (deafMicEnergy / 8);
                                      return (
                                        <g>
                                          <circle cx={cx} cy={cy} r={r} fill="#E8693A" opacity={0.3 + (deafMicEnergy / 150)} className="transition-all duration-75" />
                                          <circle cx={cx} cy={cy} r={r + 3} fill="none" stroke="#C1440E" strokeWidth="1.2" opacity={0.4} className="animate-ping" />
                                        </g>
                                      );
                                    })()}
                                  </svg>
                                );
                              })()}

                              <div className="text-[8px] text-brown-mid w-full text-center mt-1">
                                성대 울림 감지 시 주황색 혀 경로가 움직입니다.
                              </div>
                            </div>

                            {/* 2. Mouth & Lips Front-Profile Panel */}
                            <div className="bg-cream/20 border border-border rounded-2xl p-4 flex flex-col items-center justify-between relative min-h-[200px] shadow-3xs overflow-hidden">
                              <div className="w-full flex justify-between items-center text-[10px] font-black text-brown-mid mb-2">
                                <span className="flex items-center gap-1">👄 입모양 정면 프로필 (Mouth & Lips)</span>
                                <span className="text-terracotta bg-white px-1.5 py-0.5 rounded border border-border-light text-[9px]">정면도</span>
                              </div>

                              {(() => {
                                const geom = getInterpolatedGeom(deafVocalTarget, deafMicEnergy);
                                const lipW = geom.lipWidth;
                                const lipH = geom.lipHeight;
                                return (
                                  <svg viewBox="0 0 200 150" className="w-full max-w-[170px] h-36">
                                    {/* Outer dark mouth cavity background */}
                                    <ellipse cx="100" cy="75" rx={lipW - 4} ry={lipH} fill="#2D2522" className="transition-all duration-75" />

                                    {/* Tongue visibility inside cavity */}
                                    {(deafVocalTarget === '아' || deafVocalTarget === '어' || deafVocalTarget === '으아') && (
                                      <ellipse cx="100" cy={75 + (lipH * 0.3)} rx={lipW * 0.7} ry={lipH * 0.4} fill="#E8693A" opacity={0.8} />
                                    )}

                                    {/* Upper Teeth Row (Fixed at top cavity border) */}
                                    <g opacity={lipH > 10 ? 1 : 0.2}>
                                      {/* Central upper teeth squares */}
                                      <rect x="84" y={75 - (lipH * 0.7)} width="7" height="8" rx="1.5" fill="#FFFFFF" stroke="#D5C3B2" strokeWidth="0.5" />
                                      <rect x="92" y={75 - (lipH * 0.7)} width="7" height="8.5" rx="1.5" fill="#FFFFFF" stroke="#D5C3B2" strokeWidth="0.5" />
                                      <rect x="100" y={75 - (lipH * 0.7)} width="7" height="8.5" rx="1.5" fill="#FFFFFF" stroke="#D5C3B2" strokeWidth="0.5" />
                                      <rect x="108" y={75 - (lipH * 0.7)} width="7" height="8" rx="1.5" fill="#FFFFFF" stroke="#D5C3B2" strokeWidth="0.5" />
                                    </g>

                                    {/* Lower Teeth Row (Moves down with lower jaw separation) */}
                                    <g opacity={lipH > 12 ? 0.9 : 0.15} transform={`translate(0, ${geom.jawY * 0.3})`}>
                                      <rect x="85" y={75 + (lipH * 0.2)} width="6.5" height="7.5" rx="1" fill="#FFFFFF" stroke="#D5C3B2" strokeWidth="0.5" />
                                      <rect x="92" y={75 + (lipH * 0.2)} width="7.5" height="8" rx="1" fill="#FFFFFF" stroke="#D5C3B2" strokeWidth="0.5" />
                                      <rect x="100" y={75 + (lipH * 0.2)} width="7.5" height="8" rx="1" fill="#FFFFFF" stroke="#D5C3B2" strokeWidth="0.5" />
                                      <rect x="108" y={75 + (lipH * 0.2)} width="6.5" height="7.5" rx="1" fill="#FFFFFF" stroke="#D5C3B2" strokeWidth="0.5" />
                                    </g>

                                    {/* Upper Lip contour path */}
                                    <path 
                                      d={`M ${100 - lipW} 75 Q 85 ${75 - lipH * 1.3} 100 ${75 - lipH * 0.9} Q 115 ${75 - lipH * 1.3} ${100 + lipW} 75 Q 100 ${75 - lipH * 0.4} ${100 - lipW} 75`} 
                                      fill="#E8693A" 
                                      stroke="#C1440E" 
                                      strokeWidth="1.5" 
                                      className="transition-all duration-75" 
                                    />

                                    {/* Lower Lip contour path */}
                                    <path 
                                      d={`M ${100 - lipW} 75 Q 100 ${75 + lipH * 1.4} ${100 + lipW} 75 Q 100 ${75 + lipH * 0.4} ${100 - lipW} 75`} 
                                      fill="#E8693A" 
                                      stroke="#C1440E" 
                                      strokeWidth="1.5" 
                                      className="transition-all duration-75" 
                                    />
                                    
                                    {/* Volume responsive dynamic mouth border ring */}
                                    <ellipse cx="100" cy="75" rx={lipW + 5} ry={lipH + 5} fill="none" stroke="#E8693A" strokeWidth="1.5" opacity={deafMicEnergy > 10 ? 0.6 : 0} className="animate-pulse" />
                                  </svg>
                                );
                              })()}

                              <div className="text-[8px] text-brown-mid w-full text-center mt-1">
                                목소리가 커질수록 입이 더 크게 벌어집니다.
                              </div>
                            </div>
                          </div>

                          {/* Dynamic Haptic & Noise-Cancelling configuration panel inside the playground */}
                          <div className="bg-white border border-border p-3 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 shadow-3xs text-xs select-none">
                            <div className="flex justify-between items-center bg-cream/15 px-3 py-2 rounded-xl border border-border-light/50">
                              <div className="flex items-center gap-1.5 text-brown-mid font-medium">
                                <span>📱 모바일 햅틱 진동 피드백</span>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={deafVibrationEnabled}
                                  onChange={(e) => setDeafVibrationEnabled(e.target.checked)}
                                  className="sr-only peer" 
                                />
                                <div className="w-8 h-4.5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-terracotta"></div>
                              </label>
                            </div>

                            <div className="flex justify-between items-center bg-cream/15 px-3 py-2 rounded-xl border border-border-light/50">
                              <div className="flex items-center gap-1.5 text-brown-mid font-medium">
                                <span>🎙️ 필터링 노이즈 캔슬링</span>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={deafFilterEnabled}
                                  onChange={(e) => setDeafFilterEnabled(e.target.checked)}
                                  className="sr-only peer" 
                                />
                                <div className="w-8 h-4.5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-terracotta"></div>
                              </label>
                            </div>
                          </div>

                          {/* Vocal target details description */}
                          <div className="bg-cream/35 border border-border-light rounded-xl p-3.5 space-y-2 text-xs">
                            <div className="flex justify-between items-center border-b border-border-light/60 pb-1.5">
                              <span className="font-bold text-brown-dark">{tgt.name}</span>
                              <span className="text-[10px] text-brown-mid bg-white border border-border px-1.5 py-0.5 rounded-md">
                                진동포인트: {tgt.vibrationSpot}
                              </span>
                            </div>
                            <p className="text-[11px] text-brown-mid leading-relaxed font-light">{tgt.description}</p>
                            
                            <div className="grid grid-cols-2 gap-2 text-[10px] text-brown-mid pt-1 font-light">
                              <div>• <strong>혀의 위치:</strong> {tgt.tonguePosition}</div>
                              <div>• <strong>턱 벌림도:</strong> {tgt.jawOpening}</div>
                            </div>

                            <div className="mt-1 bg-white border border-border/50 p-2.5 rounded-lg text-[10.5px] text-brown-mid font-light leading-relaxed">
                              <strong className="text-terracotta font-semibold block mb-0.5">💡 물리적 조음 및 소리 유도법</strong>
                              {tgt.guideTip}
                            </div>
                          </div>

                          {/* Sound Sustain Success Progress Bar */}
                          <div className="space-y-1.5 bg-cream/30 border border-border/50 p-3.5 rounded-2xl text-left">
                            <div className="flex justify-between items-center text-[10px] font-bold text-brown-dark">
                              <span>⏱️ 성량 유지 및 소리 지속 테스트 (목표 3초)</span>
                              <span className="text-terracotta">
                                {deafSustainedStreak === 30 ? '🎉 완벽한 3초 지속 성공!' : `${(deafSustainedStreak / 10).toFixed(1)}초`}
                              </span>
                            </div>
                            
                            {/* Streak Bar */}
                            <div className="h-5 bg-white border border-border rounded-full overflow-hidden p-0.5 shadow-inner relative flex items-center">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-100"
                                style={{ width: `${(deafSustainedStreak / 30) * 100}%` }}
                              ></div>
                              {/* 1s, 2s ticks */}
                              <div className="absolute left-[33.3%] top-0 bottom-0 w-[1px] bg-brown-mid/30"></div>
                              <div className="absolute left-[66.6%] top-0 bottom-0 w-[1px] bg-brown-mid/30"></div>
                            </div>

                            {/* Status label based on streak duration */}
                            <div className="text-[10px] text-center font-bold">
                              {deafSustainedStreak === 0 && (
                                <span className="text-brown-light font-light">마이크를 켜고 "{deafVocalTarget}" 소리를 연속으로 내보세요!</span>
                              )}
                              {deafSustainedStreak > 0 && deafSustainedStreak < 10 && (
                                <span className="text-emerald-600">🔈 소리가 시작되었습니다! 잘하고 계십니다!</span>
                              )}
                              {deafSustainedStreak >= 10 && deafSustainedStreak < 20 && (
                                <span className="text-emerald-600">🔉 1초 동안 유지되었습니다! 더 힘내세요!</span>
                              )}
                              {deafSustainedStreak >= 20 && deafSustainedStreak < 30 && (
                                <span className="text-emerald-600">🔊 2초를 버텄습니다! 조금만 더 길게 뻗으세요!</span>
                              )}
                              {deafSustainedStreak === 30 && (
                                <span className="text-emerald-600 animate-bounce block">✨ 축하합니다! 완벽하게 3초 이상 지속적으로 목청을 울리는 데 성공했습니다!</span>
                              )}
                            </div>
                          </div>

                        </div>
                      );
                    })()}

                    {/* Play controls for Practice */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => speakText(deafVocalTarget.length === 1 ? deafVocalTarget : deafVocalTarget.split('').join(' '))}
                        className="flex-1 py-3 border border-border bg-white text-brown-mid hover:text-brown-dark rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Volume2 size={14} />
                        기초 성음 듣기
                      </button>

                      {deafIsRecording ? (
                        <button
                          onClick={stopDeafPractice}
                          className="flex-1 py-3 bg-brown-dark hover:bg-brown-dark/95 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Square size={14} />
                          훈련 종료
                        </button>
                      ) : (
                        <button
                          onClick={startDeafPractice}
                          className="flex-1 py-3 bg-terracotta hover:bg-terracotta-light text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Mic size={14} />
                          마이크 켜기 (소리내기)
                        </button>
                      )}
                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* TAB 4: STATIC INFO PAGE */}
        {activeTab === 'info' && (
          <div className="max-w-5xl mx-auto px-6 py-12 animate-fade-in space-y-16">
            
            {/* Context Story */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="inline-block bg-terracotta-pale text-terracotta text-xs font-bold px-3 py-1 rounded-full border border-terracotta/10">개발 배경 & 철학</span>
                <h1 className="text-3xl md:text-4xl font-extrabold font-display leading-tight text-brown-dark">
                  청각장애 대학생의<br />
                  발표를 밝히는 시각 지킴이
                </h1>
                
                <p className="text-sm text-brown-mid leading-relaxed font-light space-y-4">
                  청각장애를 가졌거나 발화에 다소 불편을 지닌 대학생들은 자신의 목소리가 청중에게 어떻게 들리는지 실시간으로 점검할 방법이 없었습니다. 
                  주변 친구나 배움 도우미에게 일일이 물어보는 것도 한계가 있으며, 발표 전 극도의 심리적 고립감과 자신감 저하로 이어지곤 합니다.
                  <br /><br />
                  말결은 이러한 장벽을 완전히 허물기 위해 만들어진 <strong>배리어프리 발표 피드백 도구</strong>입니다. 
                  우리가 빚어낸 따뜻한 유니버설 디자인 인터페이스를 통해 누구나 목소리의 말결을 보며 교정하고, 
                  당당하게 자신의 철학과 학문적 가치를 설파할 수 있습니다.
                </p>
              </div>

              <div className="bg-white border border-border rounded-2xl p-6 md:p-8 space-y-6 shadow-xs">
                <div className="text-xs font-bold text-brown-light uppercase tracking-wider pb-2 border-b border-border-light">우리의 기획 3대 핵심 이념</div>
                
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-terracotta-pale text-terracotta flex items-center justify-center font-display font-bold text-sm shrink-0">01</div>
                  <div>
                    <h3 className="text-sm font-bold text-brown-dark">정답을 강요하지 않는 피드백</h3>
                    <p className="text-xs text-brown-mid leading-relaxed mt-1 font-light">"완벽한 표준 발음"을 평가하는 것이 아니라, 사용자가 말한 내용이 대중에게 실제로 도달할 가능성만을 비교 분석합니다.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-terracotta-pale text-terracotta flex items-center justify-center font-display font-bold text-sm shrink-0">02</div>
                  <div>
                    <h3 className="text-sm font-bold text-brown-dark">시각 정보로의 완전한 치환</h3>
                    <p className="text-xs text-brown-mid leading-relaxed mt-1 font-light">마이크 음파 파형, 입 모양 분석 데이터 등 들을 수 없는 음성 정보를 가장 직관적인 모션 및 컬러 하이라이트로 보여줍니다.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-terracotta-pale text-terracotta flex items-center justify-center font-display font-bold text-sm shrink-0">03</div>
                  <div>
                    <h3 className="text-sm font-bold text-brown-dark">누구나 차별 없는 유니버설 UX</h3>
                    <p className="text-xs text-brown-mid leading-relaxed mt-1 font-light">청각장애 유무에 관계없이, 목소리 전달력 강화가 필요한 일반 대중 및 면접 연습생 누구나 활용 가능한 고도의 심플함을 지향합니다.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* How to use */}
            <div className="space-y-6 pt-6 border-t border-border">
              <div className="text-center space-y-2">
                <span className="text-xs font-bold text-terracotta uppercase">Usage guide</span>
                <h2 className="text-2xl font-bold font-display text-brown-dark">이렇게 활용하세요</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white border border-border p-5 rounded-2xl text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-terracotta-pale text-terracotta flex items-center justify-center font-bold text-sm mx-auto">1</div>
                  <h4 className="text-xs font-bold text-brown-dark">대본 입력 및 선정</h4>
                  <p className="text-[11px] text-brown-mid leading-relaxed font-light">발표할 텍스트를 입력하거나 내장된 자기소개 등 템플릿 대본을 선택합니다.</p>
                </div>

                <div className="bg-white border border-border p-5 rounded-2xl text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-terracotta-pale text-terracotta flex items-center justify-center font-bold text-sm mx-auto">2</div>
                  <h4 className="text-xs font-bold text-brown-dark">실시간 리허설 낭독</h4>
                  <p className="text-[11px] text-brown-mid leading-relaxed font-light">녹화 시작을 누르고 또박또박 낭독합니다. 실시간 음파 파형 및 텍스트 수신을 관측합니다.</p>
                </div>

                <div className="bg-white border border-border p-5 rounded-2xl text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-terracotta-pale text-terracotta flex items-center justify-center font-bold text-sm mx-auto">3</div>
                  <h4 className="text-xs font-bold text-brown-dark">녹화 정지 및 자동 대조</h4>
                  <p className="text-[11px] text-brown-mid leading-relaxed font-light">정지 버튼을 누르면 대본과 실제 인식된 발화를 정확히 정밀 분석해 교정 단어를 뽑아냅니다.</p>
                </div>

                <div className="bg-white border border-border p-5 rounded-2xl text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-terracotta-pale text-terracotta flex items-center justify-center font-bold text-sm mx-auto">4</div>
                  <h4 className="text-xs font-bold text-brown-dark">리포트 진단 & 반복 연습</h4>
                  <p className="text-[11px] text-brown-mid leading-relaxed font-light">종합 점수와 피드백, 미전달 어휘 카드를 토대로 구간별 반복 훈련을 이어나갑니다.</p>
                </div>
              </div>
            </div>

            {/* Creators / Team cards */}
            <div className="space-y-6 pt-6 border-t border-border">
              <div className="text-center space-y-2">
                <span className="text-xs font-bold text-terracotta uppercase">Created by</span>
                <h2 className="text-2xl font-bold font-display text-brown-dark">기획 및 개발진 소개</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-border p-6 rounded-2xl text-center space-y-4 shadow-2xs">
                  <div className="w-16 h-16 bg-terracotta text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto shadow-xs">디</div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-brown-dark">배재대학교 디자이너</h4>
                    <div className="text-[10px] text-terracotta font-bold">UI/UX 디자인 & 서비스 기획 총괄</div>
                  </div>
                  <p className="text-xs text-brown-mid leading-relaxed font-light">
                    배재대학교 산업디자인학 전공. 감성 힐링 작가이자 대외 우수 프로젝트 경험을 바탕으로, 청각장애 대학생의 니즈에 정확히 부합하는 유니버설 UX 구조를 창출했습니다.
                  </p>
                </div>

                <div className="bg-white border border-border p-6 rounded-2xl text-center space-y-4 shadow-2xs">
                  <div className="w-16 h-16 bg-brown-mid text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto shadow-xs">개</div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-brown-dark">기술 파트너 개발자</h4>
                    <div className="text-[10px] text-terracotta font-bold">웹 프론트엔드 아키텍처 구현</div>
                  </div>
                  <p className="text-xs text-brown-mid leading-relaxed font-light">
                    Web Speech API의 SpeechRecognition 엔진 통합, Web Audio API 및 AnalyserNode를 활용한 실시간 음파 렌더러와 로컬 비교 비교 알고리즘의 완전 오프라인 프론트 구현을 담당했습니다.
                  </p>
                </div>

                <div className="bg-white border border-border p-6 rounded-2xl text-center space-y-4 shadow-2xs">
                  <div className="w-16 h-16 bg-brown-light text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto shadow-xs">자</div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-brown-dark">장애학생 자문 파트너</h4>
                    <div className="text-[10px] text-terracotta font-bold">배리어프리 접근성 자문</div>
                  </div>
                  <p className="text-xs text-brown-mid leading-relaxed font-light">
                    청각장애 당사자 지인 및 협업 파트너들의 인터뷰와 피드백을 통해 실제로 청중 앞에 설 때 어떤 부분에서 고립감을 느끼는지 수렴하여 설계 아이디어를 풍성히 뒷받침하였습니다.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* FOOTER */}
      <footer className="bg-brown-dark text-white/50 text-xs py-8 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 mt-16 border-t border-border/10">
        <div className="flex items-center gap-2">
          <span className="font-logo text-white text-base font-bold">말결</span>
          <span>•</span>
          <span>발표를 비추는 따스한 소리 자국</span>
        </div>
        
        <div className="text-[10px] text-center md:text-right space-y-1 font-light">
          <div>© 2026 말결 팀. All Rights Reserved.</div>
          <div className="text-white/30">배재대학교 산업디자인학과 우수 창업 제안 프로젝트</div>
        </div>
      </footer>

    </div>
  );
}
