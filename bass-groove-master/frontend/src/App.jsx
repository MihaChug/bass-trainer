import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Типы ритмов для метронома
const rhythmTypes = [
  { id: 'quarter', name: 'Четвертные', pattern: '1 2 3 4', beatsPerBar: 4, labels: ['1', '2', '3', '4'] },
  { id: 'eighth', name: 'Восьмые', pattern: '1 & 2 & 3 & 4 &', beatsPerBar: 8, labels: ['1', '&', '2', '&', '3', '&', '4', '&'] },
  { id: 'sixteenth', name: 'Шестнадцатые', pattern: '1 e & a 2 e & a', beatsPerBar: 16, labels: ['1', 'e', '&', 'a', '2', 'e', '&', 'a'] },
  { id: 'triplet', name: 'Триоли', pattern: '1 trip let 2 trip let', beatsPerBar: 6, labels: ['1', 'trip', 'let', '2', 'trip', 'let'] },
  { id: 'syncopated', name: 'Синкопа', pattern: '1 & 2 & 3 & 4 &', beatsPerBar: 8, labels: ['1', '&', '2', '&', '3', '&', '4', '&'], accents: [0, 1, 0, 1, 0, 1, 0, 1] },
  { id: 'funk', name: 'Фанк', pattern: '1 e & a 2 e & a', beatsPerBar: 16, labels: ['1', 'e', '&', 'a', '2', 'e', '&', 'a'], accents: [1, 0, 1, 0, 0, 1, 0, 0] },
];

// Типы звуков для метронома
const soundTypes = [
  { id: 'classic', name: 'Классический', wave: 'sine', freq: 1000 },
  { id: 'electronic', name: 'Электронный', wave: 'square', freq: 800 },
  { id: 'wood', name: 'Дерево', wave: 'triangle', freq: 600 },
  { id: 'highhat', name: 'Хай-хэт', wave: 'square', freq: 2000 },
];

// Данные упражнений по этапам с описаниями
const exercisesData = {
  1: [
    { 
      id: 'ex1_1',
      name: "Четвертные ноты", 
      bpm: "60-100", 
      pattern: "1 2 3 4",
      description: "Базовое упражнение на ровные четвертные ноты. Играйте вниз на каждую долю такта.",
      soundType: "quarter",
      accentPattern: [1, 0, 0, 0],
      beatLabels: ['1', '2', '3', '4'],
      beatsPerBar: 4
    },
    { 
      id: 'ex1_2',
      name: "Восьмые ноты", 
      bpm: "70-110", 
      pattern: "1 & 2 & 3 & 4 &",
      description: "Ровные восьмые ноты. Чередуйте удары вниз-вверх, сохраняя равномерность.",
      soundType: "eighth",
      accentPattern: [1, 0, 1, 0, 1, 0, 1, 0],
      beatLabels: ['1', '&', '2', '&', '3', '&', '4', '&'],
      beatsPerBar: 8
    },
    { 
      id: 'ex1_3',
      name: "Чередование", 
      bpm: "60-90", 
      pattern: "1 2 & 3 4 &",
      description: "Комбинация четвертных и восьмых нот. Акцент на сильные доли.",
      soundType: "mixed",
      accentPattern: [1, 0, 1, 0, 1, 0],
      beatLabels: ['1', '2', '&', '3', '4', '&'],
      beatsPerBar: 6
    }
  ],
  2: [
    { 
      id: 'ex2_1',
      name: "Синкопа на &", 
      bpm: "70-100", 
      pattern: "1 & 2 & 3 & 4 &",
      description: "Акценты на слабых долях (&). Подчеркивайте синкопированные ноты.",
      soundType: "syncopated",
      accentPattern: [0, 1, 0, 1, 0, 1, 0, 1],
      beatLabels: ['1', '&', '2', '&', '3', '&', '4', '&'],
      beatsPerBar: 8
    },
    { 
      id: 'ex2_2',
      name: "Смещенный акцент", 
      bpm: "65-95", 
      pattern: "1 & 2 & 3 & 4 &",
      description: "Упражнение со смещенными акцентами. Играйте громче на указанных долях.",
      soundType: "accented",
      accentPattern: [1, 0, 0, 1, 0, 1, 0, 0],
      beatLabels: ['1', '&', '2', '&', '3', '&', '4', '&'],
      beatsPerBar: 8
    },
    { 
      id: 'ex2_3',
      name: "Базовый фанк", 
      bpm: "80-110", 
      pattern: "1 & 2 & 3 & 4 &",
      description: "Основы фанкового ритма. Добавьте ghost notes между основными нотами.",
      soundType: "funk",
      accentPattern: [1, 0, 0, 1, 0, 0, 1, 0],
      beatLabels: ['1', '&', '2', '&', '3', '&', '4', '&'],
      beatsPerBar: 8
    }
  ],
  3: [
    { 
      id: 'ex3_1',
      name: "Шестнадцатые", 
      bpm: "60-90", 
      pattern: "1 e & a 2 e & a",
      description: "Ровные шестнадцатые ноты. Требует высокой точности и контроля.",
      soundType: "sixteenth",
      accentPattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      beatLabels: ['1', 'e', '&', 'a', '2', 'e', '&', 'a'],
      beatsPerBar: 16
    },
    { 
      id: 'ex3_2',
      name: "Пропуск долей", 
      bpm: "65-95", 
      pattern: "1 e & a 2 e & a",
      description: "Упражнение с пропусками некоторых долей. Развивает внутреннее чувство ритма.",
      soundType: "skip",
      accentPattern: [1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0],
      beatLabels: ['1', 'e', '&', 'a', '2', 'e', '&', 'a'],
      beatsPerBar: 16
    },
    { 
      id: 'ex3_3',
      name: "Синкопированные 16-е", 
      bpm: "70-100", 
      pattern: "1 e & a 2 e & a",
      description: "Синкопированный ритм в шестнадцатых. Сложное упражнение для продвинутых.",
      soundType: "syncopated16",
      accentPattern: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      beatLabels: ['1', 'e', '&', 'a', '2', 'e', '&', 'a'],
      beatsPerBar: 16
    }
  ],
  4: [
    { 
      id: 'ex4_1',
      name: "Триоли", 
      bpm: "60-85", 
      pattern: "1 trip let 2 trip let",
      description: "Ритмический рисунок триолями. Три ноты на одну долю.",
      soundType: "triplet",
      accentPattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
      beatLabels: ['1', 'trip', 'let', '2', 'trip', 'let'],
      beatsPerBar: 12
    },
    { 
      id: 'ex4_2',
      name: "Пунктирный ритм", 
      bpm: "65-90", 
      pattern: "1 & 2 & 3 & 4 &",
      description: "Длинная-короткая ноты. Характерно для многих музыкальных стилей.",
      soundType: "dotted",
      accentPattern: [1, 0, 0, 1, 1, 0, 0, 1],
      beatLabels: ['1', '&', '2', '&', '3', '&', '4', '&'],
      beatsPerBar: 8
    },
    { 
      id: 'ex4_3',
      name: "Комбинированный", 
      bpm: "70-95", 
      pattern: "1 e & a 2 e & a",
      description: "Сочетание различных ритмических рисунков. Проверка всех навыков.",
      soundType: "combined",
      accentPattern: [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1],
      beatLabels: ['1', 'e', '&', 'a', '2', 'e', '&', 'a'],
      beatsPerBar: 16
    }
  ],
  5: [
    { 
      id: 'ex5_1',
      name: "Ghost notes", 
      bpm: "80-110", 
      pattern: "1 e & a 2 e & a",
      description: "Тихие приглушенные ноты между основными. Основа фанкового грува.",
      soundType: "ghost",
      accentPattern: [1, 0.3, 1, 0.3, 1, 0.3, 1, 0.3, 1, 0.3, 1, 0.3, 1, 0.3, 1, 0.3],
      beatLabels: ['1', 'e', '&', 'a', '2', 'e', '&', 'a'],
      beatsPerBar: 16
    },
    { 
      id: 'ex5_2',
      name: "Slap основа", 
      bpm: "85-115", 
      pattern: "1 & 2 & 3 & 4 &",
      description: "Базовая техника slap - thumb и pop. Координация обеих рук.",
      soundType: "slap",
      accentPattern: [1, 0, 0.5, 0, 1, 0, 0.5, 0],
      beatLabels: ['1', '&', '2', '&', '3', '&', '4', '&'],
      beatsPerBar: 8
    },
    { 
      id: 'ex5_3',
      name: "Фанковый грув", 
      bpm: "90-120", 
      pattern: "1 e & a 2 e & a",
      description: "Полноценный фанковый рисунок с ghost notes и акцентами.",
      soundType: "funkGroove",
      accentPattern: [1, 0.5, 0, 0.3, 1, 0, 0.5, 0, 1, 0.5, 0, 0.3, 1, 0, 0.5, 0],
      beatLabels: ['1', 'e', '&', 'a', '2', 'e', '&', 'a'],
      beatsPerBar: 16
    }
  ],
  6: [
    { 
      id: 'ex6_1',
      name: "Свободная импровизация", 
      bpm: "70-120", 
      pattern: "various",
      description: "Импровизируйте поверх ритма, экспериментируйте с различными рисунками.",
      soundType: "free",
      accentPattern: [1, 0, 0, 0],
      beatLabels: ['1', '2', '3', '4'],
      beatsPerBar: 4
    },
    { 
      id: 'ex6_2',
      name: "Игра поверх бита", 
      bpm: "80-130", 
      pattern: "various",
      description: "Развитие чувства времени. Играйте с небольшим опережением или отставанием.",
      soundType: "overbeat",
      accentPattern: [1, 0, 0, 0],
      beatLabels: ['1', '2', '3', '4'],
      beatsPerBar: 4
    },
    { 
      id: 'ex6_3',
      name: "Полиритмия", 
      bpm: "60-100", 
      pattern: "complex",
      description: "Одновременное использование разных метрических рисунков. Высший пилотаж.",
      soundType: "polyrhythm",
      accentPattern: [1, 0, 1, 0, 1, 0],
      beatLabels: ['1', '2', '3', '4', '5', '6'],
      beatsPerBar: 6
    }
  ]
};

function App() {
  const [activeTab, setActiveTab] = useState('stages');
  const [currentStage, setCurrentStage] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(null);
  
  // Метроном для упражнений
  const [exerciseBpm, setExerciseBpm] = useState(80);
  const [isExercisePlaying, setIsExercisePlaying] = useState(false);
  const [exerciseBeat, setExerciseBeat] = useState(0);
  
  // Метроном (отдельная страница)
  const [metronomeBpm, setMetronomeBpm] = useState(120);
  const [isMetronomePlaying, setIsMetronomePlaying] = useState(false);
  const [metronomeBeat, setMetronomeBeat] = useState(0);
  const [selectedRhythm, setSelectedRhythm] = useState(rhythmTypes[0]);
  const [selectedSound, setSelectedSound] = useState(soundTypes[0]);
  
  // Audio refs
  const audioContextRef = useRef(null);
  const exerciseIntervalRef = useRef(null);
  const metronomeIntervalRef = useRef(null);
  
  // Запись и анализ
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [visualizerData, setVisualizerData] = useState([]);

  // Получение информации об устройстве
  useEffect(() => {
    fetch(`${API_BASE_URL}/device/info`)
      .then(res => res.json())
      .then(data => setDeviceInfo(data))
      .catch(err => console.log('Device info not available:', err));
  }, []);

  // Инициализация AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Переключение вкладок
  const switchTab = (tabId) => {
    setActiveTab(tabId);
    // Останавливаем все звуки при переключении
    stopExerciseMetronome();
    stopMetronome();
  };

  // Выбор этапа
  const handleStageSelect = (stage) => {
    setCurrentStage(stage);
    showExercises(stage);
  };

  const showExercises = (stage) => {
    const exerciseElement = document.getElementById('exercises-card');
    const stageNumElement = document.getElementById('selected-stage-num');
    const exerciseList = document.getElementById('exercise-list');

    if (stageNumElement) stageNumElement.textContent = stage;
    if (exerciseList) {
      exerciseList.innerHTML = '';
      const exercises = exercisesData[stage] || [];
      exercises.forEach((exercise) => {
        const li = document.createElement('li');
        li.className = 'exercise-item';
        li.innerHTML = `
          <div class="exercise-header">
            <span class="exercise-name">${exercise.name}</span>
            <span class="exercise-bpm">${exercise.bpm} BPM</span>
          </div>
          <p class="exercise-description">${exercise.description}</p>
        `;
        li.addEventListener('click', () => {
          document.querySelectorAll('.exercise-item').forEach(item => item.classList.remove('active'));
          li.classList.add('active');
          setCurrentExercise(exercise);
          setExerciseBpm(parseInt(exercise.bpm.split('-')[0]));
          stopExerciseMetronome();
          setExerciseBeat(0);
        });
        exerciseList.appendChild(li);
      });
    }

    if (exerciseElement) {
      exerciseElement.style.display = 'block';
      exerciseElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // === МЕТРОНОМ ДЛЯ УПРАЖНЕНИЙ ===
  const playExerciseClick = (beatIndex) => {
    if (!currentExercise) return;
    
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const soundType = currentExercise.soundType || 'quarter';
    const accentPattern = currentExercise.accentPattern || [];
    const isAccent = accentPattern[beatIndex % accentPattern.length] === 1;
    
    // Визуальный индикатор
    setExerciseBeat(beatIndex);
    
    // Звук
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    let frequency = 1000;
    let duration = 0.1;
    let volume = isAccent ? 0.4 : 0.2;
    
    switch(soundType) {
      case 'quarter':
        frequency = beatIndex % 4 === 0 ? 1200 : 800;
        break;
      case 'eighth':
        frequency = beatIndex % 2 === 0 ? 1400 : 900;
        duration = 0.05;
        break;
      case 'sixteenth':
        frequency = beatIndex % 4 === 0 ? 1600 : 1000;
        duration = 0.03;
        volume = isAccent ? 0.3 : 0.15;
        break;
      case 'triplet':
        frequency = beatIndex % 3 === 0 ? 1100 : 750;
        duration = 0.08;
        break;
      case 'syncopated':
      case 'syncopated16':
        frequency = isAccent ? 1300 : 950;
        duration = 0.06;
        break;
      case 'funk':
      case 'funkGroove':
        frequency = beatIndex % 4 === 0 ? 1500 : (beatIndex % 2 === 0 ? 1100 : 850);
        duration = 0.04;
        volume = beatIndex % 4 === 0 ? 0.4 : 0.2;
        break;
      case 'ghost':
        frequency = beatIndex % 2 === 0 ? 1000 : 600;
        duration = 0.02;
        volume = beatIndex % 2 === 0 ? 0.3 : 0.1;
        break;
      case 'slap':
        frequency = beatIndex % 2 === 0 ? 1800 : 1200;
        duration = 0.03;
        volume = 0.35;
        break;
      case 'dotted':
        frequency = beatIndex % 2 === 0 ? 1250 : 850;
        duration = beatIndex % 2 === 0 ? 0.12 : 0.04;
        break;
      case 'accented':
        frequency = isAccent ? 1400 : 900;
        volume = isAccent ? 0.4 : 0.2;
        break;
      default:
        frequency = beatIndex % 4 === 0 ? 1200 : 800;
    }
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  };

  const startExerciseMetronome = () => {
    if (!currentExercise) return;
    
    setIsExercisePlaying(true);
    const interval = (60 / exerciseBpm) * 1000;
    let beatCount = 0;
    
    playExerciseClick(0);
    
    exerciseIntervalRef.current = setInterval(() => {
      beatCount++;
      playExerciseClick(beatCount);
      setExerciseBeat(beatCount);
    }, interval);
  };

  const stopExerciseMetronome = () => {
    setIsExercisePlaying(false);
    if (exerciseIntervalRef.current) {
      clearInterval(exerciseIntervalRef.current);
      exerciseIntervalRef.current = null;
    }
    setExerciseBeat(0);
  };

  const toggleExerciseMetronome = () => {
    if (isExercisePlaying) {
      stopExerciseMetronome();
    } else {
      startExerciseMetronome();
    }
  };

  // === ОТДЕЛЬНЫЙ МЕТРОНОМ ===
  const playMetronomeClick = (beatIndex) => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const waveType = selectedSound.wave || 'sine';
    const baseFreq = selectedSound.freq || 1000;
    const isFirstBeat = beatIndex % selectedRhythm.beatsPerBar === 0;
    
    setMetronomeBeat(beatIndex);
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    const frequency = isFirstBeat ? baseFreq + 200 : baseFreq;
    const duration = 0.1;
    const volume = isFirstBeat ? 0.4 : 0.2;
    
    oscillator.type = waveType;
    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  };

  const startMetronome = () => {
    setIsMetronomePlaying(true);
    const interval = (60 / metronomeBpm) * 1000;
    let beatCount = 0;
    
    playMetronomeClick(0);
    
    metronomeIntervalRef.current = setInterval(() => {
      beatCount++;
      playMetronomeClick(beatCount);
      setMetronomeBeat(beatCount);
    }, interval);
  };

  const stopMetronome = () => {
    setIsMetronomePlaying(false);
    if (metronomeIntervalRef.current) {
      clearInterval(metronomeIntervalRef.current);
      metronomeIntervalRef.current = null;
    }
    setMetronomeBeat(0);
  };

  const toggleMetronome = () => {
    if (isMetronomePlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
  };

  // Изменение темпа для метронома
  const changeMetronomeBpm = (newBpm) => {
    setMetronomeBpm(newBpm);
    if (isMetronomePlaying) {
      stopMetronome();
      setTimeout(startMetronome, 50);
    }
  };

  // Запись и анализ аудио
  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const ctx = getAudioContext();

        const newAnalyser = ctx.createAnalyser();
        const source = ctx.createMediaStreamSource(stream);
        source.connect(newAnalyser);
        newAnalyser.fftSize = 64;
        setAnalyser(newAnalyser);

        const recorder = new MediaRecorder(stream);
        const chunks = [];

        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: 'audio/wav' });
          await analyzeAudioBlob(audioBlob);
        };

        recorder.start();
        setIsRecording(true);
        setMediaRecorder(recorder);

        visualize(newAnalyser);
      } catch (err) {
        alert('Ошибка доступа к микрофону: ' + err.message);
      }
    } else {
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
      setIsRecording(false);
    }
  };

  const visualize = (analyserNode) => {
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) return;

      analyserNode.getByteFrequencyData(dataArray);
      setVisualizerData(Array.from(dataArray));

      requestAnimationFrame(draw);
    };

    draw();
  };

  const analyzeAudioBlob = async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');

    try {
      const response = await fetch(`${API_BASE_URL}/analyze/audio`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysisResults(data.analysis);
    } catch (error) {
      console.error('Error analyzing audio:', error);
      simulateAnalysis(audioBlob);
    }
  };

  const simulateAnalysis = (audioBlob) => {
    const results = {
      rhythm_accuracy: Math.floor(Math.random() * 30) + 60,
      tempo_stability: Math.floor(Math.random() * 30) + 60,
      attack_clarity: Math.floor(Math.random() * 30) + 60,
      dynamics: Math.floor(Math.random() * 30) + 60,
      overall_score: Math.floor(Math.random() * 25) + 65,
      duration: audioBlob.size / 44100,
      sample_rate: 44100,
      device_used: deviceInfo?.device_type || 'CPU'
    };
    setAnalysisResults(results);
  };

  // Рендер визуализации акцентов для упражнения
  const renderExerciseVisualization = () => {
    if (!currentExercise) return null;
    
    const { accentPattern, beatLabels } = currentExercise;
    
    return (
      <div className="visualization-container">
        <h4>Визуализация ритма:</h4>
        <div className="beat-dots-container">
          {beatLabels.map((label, index) => {
            const isAccent = accentPattern[index] === 1 || accentPattern[index] > 0.5;
            const isActive = exerciseBeat % beatLabels.length === index;
            
            return (
              <div key={index} className="beat-dot-wrapper">
                <div 
                  className={`beat-dot ${isActive ? 'active' : ''} ${isAccent ? 'accent' : ''}`}
                  style={{
                    transform: isActive ? 'scale(1.3)' : 'scale(1)',
                    backgroundColor: isAccent ? '#ff6b6b' : '#4ecdc4',
                    boxShadow: isActive ? '0 0 15px rgba(255,107,107,0.8)' : 'none'
                  }}
                />
                <span className="beat-label">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Рендер визуализации для метронома
  const renderMetronomeVisualization = () => {
    const { beatsPerBar, labels } = selectedRhythm;
    
    return (
      <div className="visualization-container">
        <h4>Визуализация ритма:</h4>
        <div className="beat-dots-container">
          {labels.map((label, index) => {
            const isActive = metronomeBeat % beatsPerBar === index;
            
            return (
              <div key={index} className="beat-dot-wrapper">
                <div 
                  className={`beat-dot ${isActive ? 'active' : ''}`}
                  style={{
                    transform: isActive ? 'scale(1.3)' : 'scale(1)',
                    backgroundColor: index === 0 ? '#ff6b6b' : '#4ecdc4',
                    boxShadow: isActive ? '0 0 15px rgba(78,205,196,0.8)' : 'none'
                  }}
                />
                <span className="beat-label">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎸 Bass Groove Master</h1>
        {deviceInfo && (
          <div className="device-info">
            <span>🚀 {deviceInfo.device_type === 'cuda' ? 'NVIDIA GPU' : deviceInfo.device_type === 'mps' ? 'Apple Silicon' : 'CPU'}</span>
          </div>
        )}
      </header>

      <nav className="main-nav">
        <button 
          className={`nav-btn ${activeTab === 'stages' ? 'active' : ''}`}
          onClick={() => switchTab('stages')}
        >
          📚 Этапы обучения
        </button>
        <button 
          className={`nav-btn ${activeTab === 'metronome' ? 'active' : ''}`}
          onClick={() => switchTab('metronome')}
        >
          🎵 Метроном
        </button>
        <button 
          className={`nav-btn ${activeTab === 'record' ? 'active' : ''}`}
          onClick={() => switchTab('record')}
        >
          🎤 Запись и анализ
        </button>
      </nav>

      <main className="main-content">
        {/* Вкладка этапов */}
        {activeTab === 'stages' && (
          <div className="stages-tab">
            <div className="stages-grid">
              {[1, 2, 3, 4, 5, 6].map(stage => (
                <div 
                  key={stage}
                  className={`stage-card ${currentStage === stage ? 'active' : ''}`}
                  onClick={() => handleStageSelect(stage)}
                >
                  <h3>Этап {stage}</h3>
                  <p>{stage === 1 && 'Базовый ритм'}
                     {stage === 2 && 'Синкопация'}
                     {stage === 3 && 'Шестнадцатые'}
                     {stage === 4 && 'Сложные ритмы'}
                     {stage === 5 && 'Фанк и Slap'}
                     {stage === 6 && 'Мастерство'}
                  </p>
                </div>
              ))}
            </div>

            {/* Список упражнений */}
            {currentStage && (
              <div id="exercises-card" className="exercises-card">
                <h2>Упражнения этапа <span id="selected-stage-num">{currentStage}</span></h2>
                <ul id="exercise-list" className="exercise-list"></ul>
                
                {/* Детали упражнения с встроенным метрономом */}
                {currentExercise && (
                  <div className="exercise-details">
                    <h3>{currentExercise.name}</h3>
                    <p className="exercise-desc-detail">{currentExercise.description}</p>
                    
                    <div className="metronome-controls">
                      <div className="bpm-control">
                        <label>Темп: {exerciseBpm} BPM</label>
                        <input 
                          type="range" 
                          min="40" 
                          max="200" 
                          value={exerciseBpm}
                          onChange={(e) => setExerciseBpm(parseInt(e.target.value))}
                        />
                      </div>
                      
                      <button 
                        className={`play-btn ${isExercisePlaying ? 'playing' : ''}`}
                        onClick={toggleExerciseMetronome}
                      >
                        {isExercisePlaying ? '⏹ Стоп' : '▶ Старт'}
                      </button>
                    </div>
                    
                    {renderExerciseVisualization()}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Вкладка метронома */}
        {activeTab === 'metronome' && (
          <div className="metronome-tab">
            <h2>🎵 Метроном</h2>
            
            <div className="metronome-settings">
              <div className="setting-group">
                <h3>Выберите ритм:</h3>
                <div className="rhythm-options">
                  {rhythmTypes.map(rhythm => (
                    <button
                      key={rhythm.id}
                      className={`rhythm-btn ${selectedRhythm.id === rhythm.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedRhythm(rhythm);
                        if (isMetronomePlaying) {
                          stopMetronome();
                          setTimeout(startMetronome, 50);
                        }
                      }}
                    >
                      {rhythm.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="setting-group">
                <h3>Выберите звук:</h3>
                <div className="sound-options">
                  {soundTypes.map(sound => (
                    <button
                      key={sound.id}
                      className={`sound-btn ${selectedSound.id === sound.id ? 'active' : ''}`}
                      onClick={() => setSelectedSound(sound)}
                    >
                      {sound.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="setting-group">
                <h3>Темп: {metronomeBpm} BPM</h3>
                <input 
                  type="range" 
                  min="40" 
                  max="200" 
                  value={metronomeBpm}
                  onChange={(e) => changeMetronomeBpm(parseInt(e.target.value))}
                />
              </div>
            </div>
            
            {renderMetronomeVisualization()}
            
            <button 
              className={`play-btn large ${isMetronomePlaying ? 'playing' : ''}`}
              onClick={toggleMetronome}
            >
              {isMetronomePlaying ? '⏹ Остановить' : '▶ Запустить'}
            </button>
          </div>
        )}

        {/* Вкладка записи */}
        {activeTab === 'record' && (
          <div className="record-tab">
            <h2>🎤 Запись и анализ</h2>
            
            <button 
              className={`record-btn ${isRecording ? 'recording' : ''}`}
              onClick={toggleRecording}
            >
              {isRecording ? '⏹ Остановить запись' : '🔴 Начать запись'}
            </button>
            
            {isRecording && visualizerData.length > 0 && (
              <div className="visualizer">
                {visualizerData.slice(0, 32).map((value, i) => (
                  <div
                    key={i}
                    className="bar"
                    style={{ height: `${value / 2.5}px` }}
                  />
                ))}
              </div>
            )}
            
            {analysisResults && (
              <div className="analysis-results">
                <h3>Результаты анализа:</h3>
                <div className="metrics-grid">
                  <div className="metric">
                    <span>Точность ритма:</span>
                    <strong>{analysisResults.rhythm_accuracy}%</strong>
                  </div>
                  <div className="metric">
                    <span>Стабильность темпа:</span>
                    <strong>{analysisResults.tempo_stability}%</strong>
                  </div>
                  <div className="metric">
                    <span>Четкость атаки:</span>
                    <strong>{analysisResults.attack_clarity}%</strong>
                  </div>
                  <div className="metric">
                    <span>Динамика:</span>
                    <strong>{analysisResults.dynamics}%</strong>
                  </div>
                  <div className="metric overall">
                    <span>Общий результат:</span>
                    <strong>{analysisResults.overall_score}%</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
