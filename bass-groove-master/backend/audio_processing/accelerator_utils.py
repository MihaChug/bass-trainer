"""
Accelerator Utility Module

Provides automatic detection and selection of hardware accelerators:
- CUDA for NVIDIA GPUs
- MPS (Metal Performance Shaders) for Apple Silicon
- CPU fallback when no accelerator is available
"""

import torch


def is_cuda_available() -> bool:
    """Check if CUDA is available."""
    return torch.cuda.is_available()


def is_mps_available() -> bool:
    """Check if MPS (Apple Silicon) is available."""
    return torch.backends.mps.is_available()


def get_device() -> torch.device:
    """
    Get the best available device for computation.
    
    Priority order:
    1. CUDA (NVIDIA GPU)
    2. MPS (Apple Silicon)
    3. CPU
    
    Returns:
        torch.device: The best available device
    """
    if is_cuda_available():
        device = torch.device('cuda')
        print(f"Using CUDA accelerator: {torch.cuda.get_device_name(0)}")
    elif is_mps_available():
        device = torch.device('mps')
        print("Using MPS accelerator (Apple Silicon)")
    else:
        device = torch.device('cpu')
        print("No hardware accelerator available, using CPU")
    
    return device


def get_device_info() -> dict:
    """
    Get detailed information about available accelerators.
    
    Returns:
        Dictionary containing device information
    """
    info = {
        'cuda_available': False,
        'mps_available': False,
        'device_type': 'cpu',
        'device_name': 'CPU',
        'memory_total': None,
        'memory_allocated': None
    }
    
    # Check CUDA
    if torch.cuda.is_available():
        info['cuda_available'] = True
        info['device_type'] = 'cuda'
        info['device_name'] = torch.cuda.get_device_name(0)
        info['memory_total'] = torch.cuda.get_device_properties(0).total_memory / 1024**3  # GB
        info['memory_allocated'] = torch.cuda.memory_allocated(0) / 1024**3  # GB
    
    # Check MPS
    elif torch.backends.mps.is_available():
        info['mps_available'] = True
        info['device_type'] = 'mps'
        info['device_name'] = 'Apple Silicon'
    
    return info


def optimize_tensor_operations(tensor: torch.Tensor) -> torch.Tensor:
    """
    Optimize tensor operations for the current device.
    
    Args:
        tensor: Input tensor
        
    Returns:
        Optimized tensor on the best available device
    """
    device = get_device()
    
    # Move tensor to optimal device
    optimized = tensor.to(device)
    
    # Enable TF32 for CUDA (Ampere architecture and newer)
    if device.type == 'cuda':
        torch.backends.cuda.matmul.allow_tf32 = True
        torch.backends.cudnn.allow_tf32 = True
    
    # Enable benchmark mode for cuDNN
    if device.type == 'cuda':
        torch.backends.cudnn.benchmark = True
    
    return optimized


def clear_cache():
    """Clear device cache to free memory."""
    device = get_device()
    
    if device.type == 'cuda':
        torch.cuda.empty_cache()
    elif device.type == 'mps':
        torch.mps.empty_cache()
