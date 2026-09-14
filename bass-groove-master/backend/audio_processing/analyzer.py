"""
Audio Processing Module for Bass Groove Master

This module provides hardware-accelerated audio analysis using CUDA or MPS
depending on the available accelerator.
"""

import torch
import numpy as np
from typing import Dict, Tuple, Optional
import librosa
from .accelerator_utils import get_device, is_cuda_available, is_mps_available


class AudioAnalyzer:
    """
    Hardware-accelerated audio analyzer for rhythm, tempo, attack, and dynamics analysis.
    Automatically uses CUDA if available, falls back to MPS (Apple Silicon), 
    or CPU if no accelerator is present.
    """
    
    def __init__(self, sample_rate: int = 44100):
        self.device = get_device()
        self.sample_rate = sample_rate
        self.model = None
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize the audio processing model on the appropriate device."""
        # Simple feature extraction model - can be extended with neural networks
        self.model = {
            'device': self.device,
            'is_accelerated': self.device != 'cpu'
        }
    
    def analyze(self, audio_data: np.ndarray) -> Dict[str, float]:
        """
        Perform comprehensive audio analysis using hardware acceleration.
        
        Args:
            audio_data: Audio waveform as numpy array
            
        Returns:
            Dictionary containing analysis metrics
        """
        # Convert to torch tensor and move to accelerator
        audio_tensor = torch.from_numpy(audio_data).float().to(self.device)
        
        # Extract features using accelerated operations
        features = self._extract_features(audio_tensor)
        
        # Calculate metrics
        results = self._calculate_metrics(features, audio_tensor)
        
        return results
    
    def _extract_features(self, audio: torch.Tensor) -> Dict[str, torch.Tensor]:
        """Extract audio features using GPU-accelerated operations."""
        
        # Onset detection using spectrogram analysis
        spec = torch.stft(
            audio, 
            n_fft=2048, 
            hop_length=512, 
            win_length=2048,
            window=torch.hann_window(2048, device=self.device),
            return_complex=True
        )
        magnitude = torch.abs(spec)
        
        # Spectral flux for onset detection
        spectral_flux = torch.diff(magnitude, dim=-1)
        spectral_flux = torch.relu(spectral_flux).sum(dim=0)
        
        # RMS energy
        frame_size = 2048
        hop_length = 512
        num_frames = (len(audio) - frame_size) // hop_length + 1
        
        rms = torch.zeros(num_frames, device=self.device)
        for i in range(num_frames):
            start = i * hop_length
            end = start + frame_size
            if end <= len(audio):
                frame = audio[start:end]
                rms[i] = torch.sqrt(torch.mean(frame ** 2))
        
        # Zero crossing rate
        zcr = self._compute_zcr(audio, frame_size, hop_length)
        
        return {
            'spectral_flux': spectral_flux,
            'rms': rms,
            'zcr': zcr,
            'magnitude': magnitude
        }
    
    def _compute_zcr(self, audio: torch.Tensor, frame_size: int, hop_length: int) -> torch.Tensor:
        """Compute zero-crossing rate for each frame."""
        num_frames = (len(audio) - frame_size) // hop_length + 1
        zcr = torch.zeros(num_frames, device=self.device)
        
        for i in range(num_frames):
            start = i * hop_length
            end = start + frame_size
            if end <= len(audio):
                frame = audio[start:end]
                sign_changes = torch.diff((frame > 0).int())
                zcr[i] = torch.sum(sign_changes != 0).float() / frame_size
        
        return zcr
    
    def _calculate_metrics(
        self, 
        features: Dict[str, torch.Tensor], 
        audio: torch.Tensor
    ) -> Dict[str, float]:
        """Calculate final metrics from extracted features."""
        
        spectral_flux = features['spectral_flux'].cpu().numpy()
        rms = features['rms'].cpu().numpy()
        zcr = features['zcr'].cpu().numpy()
        
        # Rhythm accuracy based on onset regularity
        rhythm_accuracy = self._calculate_rhythm_accuracy(spectral_flux)
        
        # Tempo stability from inter-onset intervals
        tempo_stability = self._calculate_tempo_stability(spectral_flux)
        
        # Attack clarity from onset sharpness
        attack_clarity = self._calculate_attack_clarity(spectral_flux, rms)
        
        # Dynamics from RMS variance
        dynamics = self._calculate_dynamics(rms)
        
        return {
            'rhythm_accuracy': float(rhythm_accuracy),
            'tempo_stability': float(tempo_stability),
            'attack_clarity': float(attack_clarity),
            'dynamics': float(dynamics),
            'overall_score': float(np.mean([
                rhythm_accuracy, 
                tempo_stability, 
                attack_clarity, 
                dynamics
            ]))
        }
    
    def _calculate_rhythm_accuracy(self, spectral_flux: np.ndarray) -> float:
        """Calculate rhythm accuracy score (0-100)."""
        # Detect onsets
        threshold = np.mean(spectral_flux) + 0.5 * np.std(spectral_flux)
        onsets = spectral_flux > threshold
        
        # Analyze regularity of onsets
        onset_indices = np.where(onsets)[0]
        if len(onset_indices) < 2:
            return 50.0
        
        intervals = np.diff(onset_indices)
        median_interval = np.median(intervals)
        if median_interval == 0:
            return 50.0
        
        # Score based on consistency of intervals
        interval_variance = np.std(intervals) / median_interval
        accuracy = max(0, min(100, 100 - interval_variance * 50))
        
        return accuracy
    
    def _calculate_tempo_stability(self, spectral_flux: np.ndarray) -> float:
        """Calculate tempo stability score (0-100)."""
        threshold = np.mean(spectral_flux) + 0.3 * np.std(spectral_flux)
        onsets = spectral_flux > threshold
        onset_indices = np.where(onsets)[0]
        
        if len(onset_indices) < 3:
            return 60.0
        
        intervals = np.diff(onset_indices)
        
        # Calculate tempo consistency
        mean_interval = np.mean(intervals)
        std_interval = np.std(intervals)
        
        # Coefficient of variation (lower is better)
        cv = std_interval / mean_interval if mean_interval > 0 else 1
        stability = max(0, min(100, 100 - cv * 100))
        
        return stability
    
    def _calculate_attack_clarity(
        self, 
        spectral_flux: np.ndarray, 
        rms: np.ndarray
    ) -> float:
        """Calculate attack clarity score (0-100)."""
        # Sharp attacks have high spectral flux relative to RMS
        if len(rms) == 0 or np.max(rms) == 0:
            return 50.0
        
        normalized_flux = spectral_flux / (np.max(spectral_flux) + 1e-8)
        normalized_rms = rms / (np.max(rms) + 1e-8)
        
        # Attack ratio
        attack_ratio = np.mean(normalized_flux) / (np.mean(normalized_rms) + 1e-8)
        
        # Normalize to 0-100 scale
        clarity = min(100, max(0, attack_ratio * 100))
        
        return clarity
    
    def _calculate_dynamics(self, rms: np.ndarray) -> float:
        """Calculate dynamics score (0-100)."""
        if len(rms) < 2:
            return 50.0
        
        # Good dynamics have variance in amplitude
        rms_normalized = rms / (np.max(rms) + 1e-8)
        
        # Calculate dynamic range
        dynamic_range = np.percentile(rms_normalized, 90) - np.percentile(rms_normalized, 10)
        
        # Optimal dynamic range is around 0.3-0.7
        optimal_center = 0.5
        deviation = abs(dynamic_range - optimal_center)
        
        dynamics_score = max(0, min(100, 100 - deviation * 150))
        
        return dynamics_score


def process_audio_file(
    file_path: str, 
    target_sr: int = 44100
) -> Dict[str, float]:
    """
    Process an audio file and return analysis results.
    
    Args:
        file_path: Path to the audio file
        target_sr: Target sample rate
        
    Returns:
        Dictionary containing analysis metrics
    """
    # Load audio file
    audio, sr = librosa.load(file_path, sr=target_sr)
    
    # Create analyzer and process
    analyzer = AudioAnalyzer(sample_rate=target_sr)
    results = analyzer.analyze(audio)
    
    # Add metadata
    results['duration'] = float(len(audio) / target_sr)
    results['sample_rate'] = target_sr
    results['device_used'] = str(analyzer.device)
    
    return results


def process_audio_buffer(
    audio_buffer: bytes,
    target_sr: int = 44100
) -> Dict[str, float]:
    """
    Process audio from a buffer (for API uploads).
    
    Args:
        audio_buffer: Raw audio bytes
        target_sr: Target sample rate
        
    Returns:
        Dictionary containing analysis metrics
    """
    import io
    
    # Load audio from buffer
    audio, sr = librosa.load(io.BytesIO(audio_buffer), sr=target_sr)
    
    # Create analyzer and process
    analyzer = AudioAnalyzer(sample_rate=target_sr)
    results = analyzer.analyze(audio)
    
    # Add metadata
    results['duration'] = float(len(audio) / target_sr)
    results['sample_rate'] = target_sr
    results['device_used'] = str(analyzer.device)
    
    return results
