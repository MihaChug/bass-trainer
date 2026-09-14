# Bass Groove Master

Обучающее приложение для развития ритмических навыков и грува на бас-гитаре с использованием аппаратного ускорения.

## Архитектура

Проект разделен на **frontend** и **backend** с оптимизацией вычислений на базе CUDA (NVIDIA GPU) или MPS (Apple Silicon).

```
bass-groove-master/
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx       # Основное React приложение
│   │   ├── App.css       # Стили
│   │   └── main.jsx      # Точка входа
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/               # FastAPI backend с hardware acceleration
│   ├── api/
│   │   └── main.py       # API endpoints
│   ├── audio_processing/
│   │   ├── __init__.py
│   │   ├── analyzer.py        # Аудио анализ на PyTorch
│   │   └── accelerator_utils.py  # Утилиты для CUDA/MPS
│   ├── models/           # ML модели (для расширения)
│   └── __init__.py
│
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
- REST API с документацией (Swagger/OpenAPI)

### Frontend (React/Vite)
- Этапы обучения от новичка до мастера
- Встроенный метроном с визуализацией
- Библиотека известных композиций
- Запись и анализ вашей игры
- Отображение типа используемого ускорителя

## Установка

### Backend

```bash
cd bass-groove-master/backend

# Создание виртуального окружения
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate  # Windows

# Установка зависимостей
pip install torch fastapi uvicorn python-multipart librosa numpy

# Запуск сервера
python -m api.main
# или
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd bass-groove-master/frontend

# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Сборка для production
npm run build
```

## API Endpoints

- `GET /` - Информация о сервисе
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

## Технологии

- **Frontend**: React 18, Vite 5
- **Backend**: Python 3.9+, FastAPI, PyTorch
- **Audio Processing**: Librosa, NumPy
- **Acceleration**: CUDA, MPS (Metal Performance Shaders)

## Лицензия

MIT
