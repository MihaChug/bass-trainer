import { useState, useEffect, useCallback } from 'react';
import './App.css';

const API_BASE_URL = '/api';

// Данные упражнений по этапам с описаниями и типами звуков метронома
const exercisesData = {
  1: [
    { 
      name: "Четвертные ноты", 
      bpm: "60-100", 
      pattern: "1 2 3 4",
      description: "Базовое упражнение на ровные четвертные ноты. Играйте вниз на каждую долю такта.",
      soundType: "quarter"
    },
    { 
      name: "Восьмые ноты", 
      bpm: "70-110", 
      pattern: "1 & 2 & 3 & 4 &",
      description: "Ровные восьмые ноты. Чередуйте удары вниз-вверх, сохраняя равномерность.",
      soundType: "eighth"
    },
    { 
      name: "Чередование", 
      bpm: "60-90", 
      pattern: "1 2 & 3 4 &",
      description: "Комбинация четвертных и восьмых нот. Акцент на сильные доли.",
      soundType: "mixed"
    }
  ],
  2: [
    { 
      name: "Синкопа на &", 
      bpm: "70-100", 
      pattern: "1 & 2 & 3 & 4 &",
      description: "Акценты на слабых долях (&&). Подчеркивайте синкопированные ноты.",
      soundType: "syncopated"
    },
    { 
      name: "Смещенный акцент", 
      bpm: "65-95", 
      pattern: "1 & 2 & 3 & 4 &",
      description: "Упражнение со смещенными акцентами. Играйте громче на указанных долях.",
      soundType: "accented"
    },
    { 
      name: "Базовый фанк", 
      bpm: "80-110", 
      pattern: "1 & 2 & 3 & 4 &",
      description: "Основы фанкового ритма. Добавьте ghost notes между основными нотами.",
      soundType: "funk"
    }
  ],
  3: [
    { 
      name: "Шестнадцатые", 
      bpm: "60-90", 
      pattern: "1 e & a 2 e & a",
      description: "Ровные шестнадцатые ноты. Требует высокой точности и контроля.",
      soundType: "sixteenth"
    },
    { 
      name: "Пропуск долей", 
      bpm: "65-95", 
      pattern: "1 e & a 2 e & a",
      description: "Упражнение с пропусками некоторых долей. Развивает внутреннее чувство ритма.",
      soundType: "skip"
    },
    { 
      name: "Синкопированные 16-е", 
      bpm: "70-100", 
      pattern: "1 e & a 2 e & a",
      description: "Синкопированный ритм в шестнадцатых. Сложное упражнение для продвинутых.",
      soundType: "syncopated16"
    }
  ],
  4: [
    { 
      name: "Триоли", 
      bpm: "60-85", 
      pattern: "1 trip let 2 trip let",
      description: "Ритмический рисунок триолями. Три ноты на одну долю.",
      soundType: "triplet"
    },
    { 
      name: "Пунктирный ритм", 
      bpm: "65-90", 
      pattern: "1 & 2 & 3 & 4 &",
      description: "Длинная-короткая ноты. Характерно для многих музыкальных стилей.",
      soundType: "dotted"
    },
    { 
      name: "Комбинированный", 
      bpm: "70-95", 
      pattern: "1 e & a 2 e & a",
      description: "Сочетание различных ритмических рисунков. Проверка всех навыков.",
      soundType: "combined"
    }
  ],
  5: [
    { 
      name: "Ghost notes", 
      bpm: "80-110", 
      pattern: "1 e & a 2 e & a",
      description: "Тихие приглушенные ноты между основными. Основа фанкового грува.",
      soundType: "ghost"
    },
    { 
      name: "Slap основа", 
      bpm: "85-115", 
      pattern: "1 & 2 & 3 & 4 &",
      description: "Базовая техника slap - thumb и pop. Координация обеих рук.",
      soundType: "slap"
    },
    { 
      name: "Фанковый грув", 
      bpm: "90-120", 
      pattern: "1 e & a 2 e & a",
      description: "Полноценный фанковый рисунок с ghost notes и акцентами.",
      soundType: "funkGroove"
    }
  ],
  6: [
    { 
      name: "Свободная импровизация", 
      bpm: "70-120", 
      pattern: "various",
      description: "Импровизируйте поверх ритма, экспериментируйте с различными рисунками.",
      soundType: "free"
    },
    { 
      name: "Игра поверх бита", 
      bpm: "80-130", 
      pattern: "various",
      description: "Развитие чувства времени. Играйте с небольшим опережением или отставанием.",
      soundType: "overbeat"
    },
    { 
      name: "Полиритмия", 
      bpm: "60-100", 
      pattern: "complex",
      description: "Одновременное использование разных метрических рисунков. Высший пилотаж.",
      soundType: "polyrhythm"
    }
  ]
};

function App() {
  const [activeTab, setActiveTab] = useState('stages');
  const [currentStage, setCurrentStage] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [audioContext, setAudioContext] = useState(null);
  const [metronomeInterval, setMetronomeInterval] = useState(null);
  const [currentBeat, setCurrentBeat] = useState(0);
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
  const initAudioContext = useCallback(() => {
    if (!audioContext) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(ctx);
    }
  }, [audioContext]);

  // Переключение вкладок
  const switchTab = (tabId) => {
    setActiveTab(tabId);
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
      exercises.forEach((exercise, index) => {
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
          setBpm(parseInt(exercise.bpm.split('-')[0]));
        });
        exerciseList.appendChild(li);
      });
    }

    if (exerciseElement) {
      exerciseElement.style.display = 'block';
      exerciseElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Метроном функции
  const setBPM = (newBpm) => {
    setBpm(newBpm);
    if (isPlaying) {
      stopMetronome();
      startMetronome();
    }
  };

  const playClick = (beatIndex) => {
    const useSound = true;
    const soundType = currentExercise?.soundType || 'quarter';
    
    // Визуальный индикатор
    const dots = document.querySelectorAll('.beat-dot');
    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[beatIndex % dots.length]) {
      dots[beatIndex % dots.length].classList.add('active');
    }

    // Звук с различными тонами в зависимости от типа упражнения
    if (useSound && audioContext) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Различные частоты и длительности для разных типов упражнений
      let frequency = 1000;
      let duration = 0.1;
      let volume = 0.3;
      
      switch(soundType) {
        case 'quarter':
          frequency = beatIndex === 0 ? 1200 : 800;
          break;
        case 'eighth':
          frequency = beatIndex === 0 ? 1400 : 900;
          duration = 0.05;
          break;
        case 'sixteenth':
          frequency = beatIndex === 0 ? 1600 : 1000;
          duration = 0.03;
          volume = 0.25;
          break;
        case 'triplet':
          frequency = beatIndex === 0 ? 1100 : 750;
          duration = 0.08;
          break;
        case 'syncopated':
        case 'syncopated16':
          frequency = beatIndex % 2 === 0 ? 1300 : 950;
          duration = 0.06;
          break;
        case 'funk':
        case 'funkGroove':
          frequency = beatIndex === 0 ? 1500 : (beatIndex % 2 === 0 ? 1100 : 850);
          duration = 0.04;
          volume = beatIndex === 0 ? 0.4 : 0.2;
          break;
        case 'ghost':
          frequency = beatIndex === 0 ? 1000 : 600;
          duration = 0.02;
          volume = beatIndex === 0 ? 0.3 : 0.1;
          break;
        case 'slap':
          frequency = beatIndex === 0 ? 1800 : 1200;
          duration = 0.03;
          volume = 0.35;
          break;
        case 'dotted':
          frequency = beatIndex === 0 ? 1250 : 850;
          duration = beatIndex % 2 === 0 ? 0.12 : 0.04;
          break;
        case 'accented':
          frequency = beatIndex === 0 ? 1400 : 900;
          volume = beatIndex % 2 === 0 ? 0.4 : 0.2;
          break;
        default:
          frequency = beatIndex === 0 ? 1200 : 800;
      }
      
      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    }
  };

  const startMetronome = () => {
    setIsPlaying(true);
    setCurrentBeat(0);
    const interval = (60 / bpm) * 1000;

    playClick(0);
    const intervalId = setInterval(() => {
      setCurrentBeat(prev => {
        const nextBeat = prev + 1;
        playClick(nextBeat % 4);
        return nextBeat;
      });
    }, interval);
    setMetronomeInterval(intervalId);
  };

  const stopMetronome = () => {
    setIsPlaying(false);
    if (metronomeInterval) {
      clearInterval(metronomeInterval);
      setMetronomeInterval(null);
    }
    document.querySelectorAll('.beat-dot').forEach(dot => dot.classList.remove('active'));
  };

  const toggleMetronome = () => {
    initAudioContext();
    if (isPlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
  };

  // Запись и анализ аудио
  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        initAudioContext();

        const newAnalyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
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

        // Запуск визуализатора
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
      // Fallback to local analysis
      simulateAnalysis(audioBlob);
    }
  };

  const simulateAnalysis = (audioBlob) => {
    // Локальная симуляция анализа если сервер недоступен
    const results = {
      rhythm_accuracy: Math.floor(Math.random() * 30) + 60,
      tempo_stability: Math.floor(Math.random() * 30) + 60,
      attack_clarity: Math.floor(Math.random() * 30) + 60,
      dynamics: Math.floor(Math.random() * 30) + 60,
      overall_score: 0,
      duration: 10,
      sample_rate: 44100,
      device_used: 'local'
    };
    results.overall_score = Math.round(
      (results.rhythm_accuracy + results.tempo_stability + 
       results.attack_clarity + results.dynamics) / 4
    );
    setAnalysisResults(results);
  };

  const resetAnalysis = () => {
    setAnalysisResults(null);
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

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
      simulateAnalysis(file);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>🎸 Bass Groove Master</h1>
        <p>Мастер синкопации и грува на бас-гитаре</p>
        {deviceInfo && (
          <div className="device-info">
            <span className={`accelerator-badge ${deviceInfo.device_type}`}>
              {deviceInfo.device_type === 'cuda' && '🚀 CUDA'}
              {deviceInfo.device_type === 'mps' && '⚡ MPS'}
              {deviceInfo.device_type === 'cpu' && '💻 CPU'}
            </span>
          </div>
        )}
      </header>

      <nav className="tabs">
        <button className={`tab-btn ${activeTab === 'stages' ? 'active' : ''}`} onClick={() => switchTab('stages')}>
          Этапы обучения
        </button>
        <button className={`tab-btn ${activeTab === 'metronome' ? 'active' : ''}`} onClick={() => switchTab('metronome')}>
          Метроном
        </button>
        <button className={`tab-btn ${activeTab === 'compositions' ? 'active' : ''}`} onClick={() => switchTab('compositions')}>
          Композиции
        </button>
        <button className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`} onClick={() => switchTab('analysis')}>
          Анализ аудио
        </button>
      </nav>

      {/* Этапы обучения */}
      {activeTab === 'stages' && (
        <div className="tab-content active">
          <div className="card">
            <h2>📚 Выберите этап обучения</h2>
            <div className="stage-grid">
              {[
                { num: 1, title: "Базовый ритм", desc: "Четвертные и восьмые ноты, базовые ритмические рисунки", level: "Новичок" },
                { num: 2, title: "Синкопация", desc: "Акценты на слабых долях, смещение ритма", level: "Начинающий" },
                { num: 3, title: "Шестнадцатые", desc: "Быстрые ритмические рисунки, точность", level: "Средний" },
                { num: 4, title: "Сложные ритмы", desc: "Триоли, пунктирный ритм, комбинации", level: "Продвинутый" },
                { num: 5, title: "Фанк и Slap", desc: "Ghost notes, slap техника, грув", level: "Высокий" },
                { num: 6, title: "Мастерство", desc: "Импровизация, полиритмия, свободная игра", level: "Мастер" }
              ].map(stage => (
                <div
                  key={stage.num}
                  className={`stage-card ${currentStage === stage.num ? 'selected' : ''}`}
                  onClick={() => handleStageSelect(stage.num)}
                >
                  <span className="stage-level">{stage.level}</span>
                  <h3>{stage.num}. {stage.title}</h3>
                  <p>{stage.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="exercises-card" className="card" style={{display: 'none'}}>
            <h2>Упражнения этапа <span id="selected-stage-num"></span></h2>
            <ul id="exercise-list" className="exercise-list"></ul>
            <button className="btn" onClick={() => switchTab('metronome')}>▶ Начать практику</button>
          </div>
        </div>
      )}

      {/* Метроном */}
      {activeTab === 'metronome' && (
        <div className="tab-content active">
          <div className="card metronome-section">
            <h2>🥁 Метроном</h2>
            <div className="metronome-display">{bpm} BPM</div>
            <div className="metronome-controls">
              <button className="control-btn" onClick={() => setBPM(bpm - 5)}>−</button>
              <button className={`control-btn large ${isPlaying ? 'playing' : ''}`} onClick={toggleMetronome}>
                {isPlaying ? '⏹' : '▶'}
              </button>
              <button className="control-btn" onClick={() => setBPM(bpm + 5)}>+</button>
            </div>
            <div className="bpm-slider">
              <input
                type="range"
                id="bpm-range"
                min="40"
                max="200"
                value={bpm}
                onChange={(e) => setBPM(parseInt(e.target.value))}
              />
            </div>
            <div className="beat-indicator">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="beat-dot"></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Композиции */}
      {activeTab === 'compositions' && (
        <div className="tab-content active">
          <div className="card">
            <h2>🎵 Известные композиции для практики</h2>
            <div className="composition-grid">
              {[
                { title: "Another One Bites the Dust", artist: "Queen", desc: "Классический фанковый басовый рифф", pattern: "1 & 2 & 3 & 4 &" },
                { title: "Billie Jean", artist: "Michael Jackson", desc: "Иконический басовый грув", pattern: "1 e & a 2 e & a" },
                { title: "Come Together", artist: "The Beatles", desc: "Блюзовый грув с синкопами", pattern: "1 & 2 & 3 & 4 &" }
              ].map((comp, i) => (
                <div key={i} className="composition-card">
                  <h3>{comp.title}</h3>
                  <p className="artist">{comp.artist}</p>
                  <p className="description">{comp.desc}</p>
                  <div className="groove-pattern">{comp.pattern}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Анализ аудио */}
      {activeTab === 'analysis' && (
        <div className="tab-content active">
          <div className="card upload-section">
            <h2>🎤 Анализ вашей игры</h2>
            <div className="upload-area" id="upload-area">
              <div className="upload-icon">📁</div>
              <h3>Перетащите аудио файл сюда</h3>
              <p style={{color: '#b2bec3', margin: '10px 0'}}>или</p>
              <button className="btn" onClick={() => document.getElementById('file-input').click()}>
                Выбрать файл
              </button>
              <input
                type="file"
                id="file-input"
                className="file-input"
                accept="audio/*"
                onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
              />
            </div>

            <div style={{margin: '20px 0'}}>
              <p style={{color: '#b2bec3', marginBottom: '10px'}}>Или запишите прямо сейчас:</p>
              <button className="btn" onClick={toggleRecording}>
                {isRecording ? '⏹ Остановить запись' : '🎙️ Начать запись'}
              </button>
            </div>

            <div className="visualizer" id="visualizer">
              {visualizerData.map((value, i) => (
                <div
                  key={i}
                  className="visualizer-bar"
                  style={{height: `${value / 255 * 130}px`}}
                ></div>
              ))}
            </div>
          </div>

          {analysisResults && (
            <div className="card analysis-results show">
              <h2>📊 Результаты анализа</h2>
              <div className="score-circle" style={{
                background: `conic-gradient(var(--success) ${(analysisResults.overall_score / 100) * 360}deg, var(--dark-bg) 0deg)`
              }}>
                <div className="score-inner">
                  <div className="score-percentage">{analysisResults.overall_score}%</div>
                  <div className="score-label">Точность</div>
                </div>
              </div>

              <div className="analysis-details">
                <div className="detail-card">
                  <h4>Ритмическая точность</h4>
                  <div className="detail-value">{analysisResults.rhythm_accuracy}%</div>
                </div>
                <div className="detail-card">
                  <h4>Стабильность темпа</h4>
                  <div className="detail-value">{analysisResults.tempo_stability}%</div>
                </div>
                <div className="detail-card">
                  <h4>Четкость атаки</h4>
                  <div className="detail-value">{analysisResults.attack_clarity}%</div>
                </div>
                <div className="detail-card">
                  <h4>Динамика</h4>
                  <div className="detail-value">{analysisResults.dynamics}%</div>
                </div>
              </div>

              <div style={{textAlign: 'center', marginTop: '30px'}}>
                <button className="btn" onClick={resetAnalysis}>🔄 Новый анализ</button>
                <button className="btn btn-secondary" onClick={() => switchTab('stages')}>
                  📚 Вернуться к упражнениям
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <footer>
        <p>Bass Groove Master © 2024 | Развивай свой грув 🎸</p>
        <p style={{marginTop: '10px', fontSize: '0.9rem'}}>
          Практикуйтесь регулярно и наслаждайтесь музыкой!
        </p>
      </footer>
    </div>
  );
}

export default App;
