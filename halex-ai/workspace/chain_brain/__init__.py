# chain_brain package: HALEX-AI Chain-Brain memory system.
# NOT a crypto blockchain. No coin, token, wallet, consensus, miner,
# payment, network, subprocess, or key-handling code in this package.
# Standard library only. Provenance of the original suite: ZINIUM-SEED-GEMINI
# on the parts accepted after Allen's gate; gate fixes are Allen's.
try:  # package import (chain_brain.X)
    from .chain_registry import ChainRegistry
    from .space_manager import SpaceManager
    from .agency_manager import AgencyManager
    from .memory_store import MemoryStore
    from .shard_protocol import ShardProtocol
    from .division import DivisionManager
    from .interconnect import InterconnectManager
    from .conversational_engine import ConversationalEngine
    from .ml_deployment_manager import MLDeploymentManager
    from .browser_bridge import BrowserBridge, BrowserBridgeServer
except ImportError:  # flat import (tests run from inside chain_brain/)
    from chain_registry import ChainRegistry
    from space_manager import SpaceManager
    from agency_manager import AgencyManager
    from memory_store import MemoryStore
    from shard_protocol import ShardProtocol
    from division import DivisionManager
    from interconnect import InterconnectManager
    from conversational_engine import ConversationalEngine
    from ml_deployment_manager import MLDeploymentManager
    from browser_bridge import BrowserBridge, BrowserBridgeServer

__all__ = [
    "ChainRegistry", "SpaceManager", "AgencyManager", "MemoryStore",
    "ShardProtocol", "DivisionManager", "InterconnectManager",
    "ConversationalEngine", "MLDeploymentManager",
    "BrowserBridge", "BrowserBridgeServer",
]
