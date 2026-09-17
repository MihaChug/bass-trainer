# Bass Groove Master - Сжатый контекст

## Архитектура
- **Backend**: Python/FastAPI (порт 8000), PyTorch (CUDA/MPS/CPU авто-детект)
- **Frontend**: React 18 + Vite, встроен в backend через StaticFiles
- **Deployment**: Docker (Python 3.10-slim), единый контейнер

## Ключевые файлы
- `backend/api/main.py` (267 строк) - API endpoints + serve frontend
- `frontend/src/App.jsx` (~900 строк) - UI логика, метроном, упражнения
- `backend/audio_processing/analyzer.py` - AI анализ аудио
- `backend/audio_processing/accelerator_utils.py` - CUDA/MPS детект

## Функционал
### Упражнения (6 этапов × 3 упражнения)
- Этапы: quarter→eighth→16th→triplets→funk→master
- Каждое упражнение: BPM диапазон, pattern, accentPattern, beatLabels, description
- Встроенный метроном с индивидуальным звуком per exercise type
- Визуализация акцентов (кружки: размер/цвет = accent level)
- Финальные мелодии per stage (Web Audio API)

### Метроном (отдельная вкладка)
- Ритмы: quarter(4), eighth(8), sixteenth(16), triplet(12), syncopated(8), funk(16)
- Звуки: classic(sine/1kHz), electronic(square/800Hz), wood(triangle/600Hz), highhat(square/2kHz)
- Акценты: freq+300Hz, volume=0.6 vs обычные volume=0.25-0.3
- Визуализация: кол-во кружков = beatsPerBar, акценты=красные

### API Endpoints
- `GET /` - index.html
- `GET /assets/*` - static files
- `GET /health` - status + acceleration info
- `GET /device/info` - {cuda_available, mps_available, device_type, device_name, memory_*}
- `POST /analyze/audio` - upload file → {rhythm_accuracy, tempo_stability, attack_clarity, dynamics, overall_score, feedback[]}

## Ускорители (приоритет)
1. CUDA (NVIDIA) - `torch.cuda.is_available()`
2. MPS (Apple Silicon) - `torch.backends.mps.is_available()`
3. CPU fallback

## Запуск
```bash
# Локально
python backend/main.py  # авто-запуск vite dev server

# Docker
docker-compose up --build
```

## Структура данных упражнений
```js
{
  id: 'ex1_1',
  name: "Четвертные ноты",
  bpm: "60-100",
  pattern: "1 2 3 4",
  description: "...",
  soundType: "quarter",
  accentPattern: [1,0,0,0],
  beatLabels: ['1','2','3','4'],
  beatsPerBar: 4
}
```

## Логика метронома
- interval = (60/BPM)*1000ms
- playClick(beatIndex): oscillator.freq + gainNode.envelope
- Accent detection: accentPattern[beatIndex % beatsPerBar] === 1
- Visual update: setBeat(beatIndex) → CSS animation

## Анализ аудио
- Вход: WAV/MP3 buffer
- Выход: метрики (0-100) + feedback tips
- Feedback правила: <70="работай над...", >=85="отлично, попробуй..."
