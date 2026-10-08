# Bass Groove Master

Обучающее приложение для развития ритмических навыков и грува на бас-гитаре. Единый Python-сервер (FastAPI): API + статика фронтенда. Аудиоанализ с автовыбором ускорителя: CUDA → MPS → CPU.

## Структура

```
bass-groove-master/
├── backend/
│   ├── main.py                 # Точка входа: монтирует /api и frontend_build
│   ├── api/main.py             # REST API (health, device/info, analyze/audio)
│   ├── audio_processing/
│   │   ├── analyzer.py         # Анализ аудио на PyTorch
│   │   └── accelerator_utils.py# Детект CUDA/MPS/CPU
│   ├── frontend_build/         # Статика фронтенда (раздаётся сервером)
│   └── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Быстрый старт (локально)

```bash
cd bass-groove-master/backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Открыть http://localhost:8000  
Swagger: http://localhost:8000/api/docs

Альтернатива через uvicorn:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Запуск в Docker

```bash
cd bass-groove-master
docker build -t bass-groove-master .
docker run -p 8000:8000 bass-groove-master
```

Через docker-compose:

```bash
docker-compose up --build      # сборка и запуск
docker-compose down            # остановка
```

### GPU в Docker (NVIDIA)

Требуется [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/). Раскомментируйте в `docker-compose.yml`:

```yaml
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

Или запуск напрямую:

```bash
docker run --gpus all -p 8000:8000 bass-groove-master
```

MPS (Apple Silicon) работает без дополнительных настроек.

## API Endpoints

| Метод | Путь | Описание |
|---|---|---|
| GET | `/` | Фронтенд |
| GET | `/api/health` | Проверка сервиса |
| GET | `/api/device/info` | Тип ускорителя (cuda/mps/cpu) |
| POST | `/api/analyze/audio` | Анализ записанного аудио |

## Возможности

- 6 этапов обучения, упражнения с индивидуальными ритмическими рисунками и акцентами
- Метроном: выбор ритма (четверти, восьмые, шестнадцатые, триоли, синкопа, фанк), типа звука, визуализация долей
- Финальные мелодии для каждого этапа — для оценки игры
- Запись и анализ аудио: ритмическая точность, стабильность темпа, атака, динамика
- Автоопределение ускорителя: 🚀 CUDA (NVIDIA) / ⚡ MPS (Apple Silicon) / 💻 CPU

## Технологии

Python 3.10+, FastAPI, Uvicorn, PyTorch/torchaudio, Librosa, NumPy, SciPy · Docker · CUDA/MPS

## Лицензия

MIT
