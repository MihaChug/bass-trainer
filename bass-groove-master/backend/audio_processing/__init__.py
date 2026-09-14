# Audio Processing Module
"""Hardware-accelerated audio processing for Bass Groove Master."""

from .analyzer import AudioAnalyzer, process_audio_file, process_audio_buffer
from .accelerator_utils import (
    get_device,
    is_cuda_available,
    is_mps_available,
    get_device_info,
    optimize_tensor_operations,
    clear_cache
)

__all__ = [
    'AudioAnalyzer',
    'process_audio_file',
    'process_audio_buffer',
    'get_device',
    'is_cuda_available',
    'is_mps_available',
    'get_device_info',
    'optimize_tensor_operations',
    'clear_cache'
]
