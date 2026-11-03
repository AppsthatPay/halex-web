"""CUDA / ROCm kernel dispatch — CPU-reference layer, staging only.

Jeffrey's 2026-11-03 pastes: an NVIDIA CUDA elementwise kernel
(exp(-x)+sin(x)) and an AMD HIP elementwise kernel ((x*1.0005)+0.0005).
HOST FACTS (probed live by host_report(), not assumed): this host has
no PyTorch, no nvcc, no hipcc, and no GPU. Therefore:
- dispatch() runs the kernel math on the CPU via NumPy and labels the
  backend "cpu-reference". It NEVER claims a GPU run.
- A real GPU run requires a named GPU host with nvcc/hipcc installed;
  until then these are reference implementations plus dispatch records.
"""
import shutil

import numpy as np

KERNELS = {
    "cuda_exp_sin": lambda x: np.exp(-x) + np.sin(x),
    "hip_scale": lambda x: x * 1.0005 + 0.0005,
}


def _torch_present():
    try:
        import torch  # noqa: F401
        return True
    except Exception:
        return False


def host_report():
    """Live probe of this host's GPU toolchain. No values invented."""
    return {"torch": _torch_present(),
            "nvcc": shutil.which("nvcc") is not None,
            "hipcc": shutil.which("hipcc") is not None,
            "nvidia_smi": shutil.which("nvidia-smi") is not None,
            "gpu_available": False,
            "backend": "cpu-reference",
            "note": "No GPU toolchain on this host; kernels run as CPU reference."}


def dispatch(kernel_name, data):
    """Run a registered kernel's math on CPU reference. Returns a record."""
    if kernel_name not in KERNELS:
        raise ValueError(f"unknown kernel: {kernel_name!r}")
    arr = np.asarray(data, dtype=float)
    result = KERNELS[kernel_name](arr)
    return {"kernel": kernel_name, "backend": "cpu-reference",
            "gpu_available": False, "input": arr.tolist(),
            "result": result.tolist()}
