# Bass Groove Master

Обучающее приложение для развития ритмических навыков и грува на бас-гитаре с использованием аппаратного ускорения.

## Архитектура

Проект представляет собой единый веб-сервер на Python (FastAPI), который обслуживает как API, так и React frontend. Оптимизация вычислений выполняется на базе CUDA (NVIDIA GPU) или MPS (Apple Silicon).

```
bass-groove-master/
├── backend/               # FastAPI backend + frontend build
│   ├── api/
│   │   └── main.py       # API endpoints + serving frontend
│   ├── audio_processing/
│   │   ├── __init__.py
│   │   ├── analyzer.py        # Аудио анализ на PyTorch
│   │   └── accelerator_utils.py  # Утилиты для CUDA/MPS
│   ├── frontend_build/   # Собранный React frontend (auto-generated)
│   ├── models/           # ML модели (для расширения)
│   └── requirements.txt
│
├── frontend/              # React + Vite исходники
│   ├── src/
│   │   ├── App.jsx       # Основное React приложение
│   │   ├── App.css       # Стили
│   │   └── main.jsx      # Точка входа
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── Dockerfile            # Docker образ для контейнеризации
├── docker-compose.yml    # Docker Compose конфигурация
└── README.md
```

## Возможности

### Backend (Python/FastAPI)
- **Hardware Acceleration**: Автоматическое определение и использование:
  - 🚀 CUDA для NVIDIA GPU
  - ⚡ MPS для Apple Silicon (M1/M2/M3)
  - 💻 CPU fallback если нет ускорителя
- **Анализ аудио**:
  - Ритмическая точность
  - Стабильность темпа
  - Четкость атаки
  - Динамика звука
- **Serving Frontend**: Встроенная раздача статических файлов React приложения
- REST API с документацией (Swagger/OpenAPI)

### Frontend (React/Vite)
- Этапы обучения от новичка до мастера
- Встроенный метроном с визуализацией ритмических рисунков
- Финальные мелодии для каждого этапа
- Библиотека известных композиций
- Запись и анализ вашей игры
- Отображение типа используемого ускорителя

## Быстрый старт

### Вариант 1: Локальный запуск (рекомендуется для разработки)

```bash
cd bass-groove-master/frontend
npm install
npm run build

cp -r dist ../backend/frontend_build

cd ../backend
pip install -r requirements.txt

uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

Откройте http://localhost:8000 в браузере.

### Вариант 2: Docker (рекомендуется для production)

```bash
cd bass-groove-master
docker-compose up --build
```

Или вручную:
```bash
docker build -t bass-groove-master .
docker run -p 8000:8000 bass-groove-master
```

Откройте http://localhost:8000 в браузере.

### Вариант 3: Раздельный запуск (для активной разработки frontend)

```bash
# Backend (API только)
cd bass-groove-master/backend
pip install -r requirements.txt
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (dev server)
cd bass-groove-master/frontend
npm install
npm run dev
```

Frontend будет доступен на http://localhost:5173, API на http://localhost:8000.

## API Endpoints

- `GET /` - Сервис React frontend
- `GET /health` - Проверка здоровья сервиса
- `GET /device/info` - Информация об аппаратном ускорителе
- `POST /analyze/audio` - Анализ аудио файла

## Проверка доступного ускорителя

Backend автоматически определяет доступный ускоритель:

```python
from backend.audio_processing import get_device_info

info = get_device_info()
print(info)
# {'cuda_available': True, 'device_type': 'cuda', 'device_name': 'NVIDIA GeForce RTX 3080', ...}
# или
# {'mps_available': True, 'device_type': 'mps', 'device_name': 'Apple Silicon', ...}
# или
# {'device_type': 'cpu', 'device_name': 'CPU', ...}
```

## Docker

### Сборка образа

```bash
docker build -t bass-groove-master .
```

### Запуск контейнера

```bash
docker run -p 8000:8000 bass-groove-master
```

### Docker Compose

```bash
docker-compose up --build
```

Для остановки:
```bash
docker-compose down
```

### GPU поддержка (NVIDIA)

В `docker-compose.yml` раскомментируйте секцию `deploy` для доступа к GPU:

```yaml
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

## Технологии

- **Frontend**: React 18, Vite 5
- **Backend**: Python 3.9+, FastAPI, PyTorch
- **Audio Processing**: Librosa, NumPy
- **Acceleration**: CUDA, MPS (Metal Performance Shaders)
- **Deployment**: Docker, Docker Compose

## Лицензия

MIT
