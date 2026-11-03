"""ZINIUM neural backbone — staging reference implementation.

Rebuilt from Jeffrey's 2026-11-03 paste and CORRECTED, not pasted raw:
- The pasted backbone had a SyntaxError (non-default __init__ args after a
  default). Every __init__ here puts all defaults after all positionals.
- The paste's prose claimed positional encoding; the pasted code had none.
  This build adds sinusoidal positional encoding (see
  sinusoidal_positional_encoding) and a causal mask.
- Added: greedy generate() loop, save()/load(), and a learning engine with
  a replay buffer and a drift guard (loss-spike revert).

HOST NOTE: PyTorch is NOT installed on this host, so this staging build
uses NumPy with the identical architecture (scaled dot-product multi-head
attention, pre-LN blocks, GELU FFN, LM head). A torch port is a mechanical
swap of the linear layers; nothing here claims to be a torch run, and no
claim is made that this is a learned language model — it is a small
reference transformer whose weights start random.
"""
import json
import math
from collections import deque

import numpy as np


def _softmax(x, axis=-1):
    x = x - np.max(x, axis=axis, keepdims=True)
    e = np.exp(x)
    return e / np.sum(e, axis=axis, keepdims=True)


def _gelu(x):
    return 0.5 * x * (1.0 + np.tanh(math.sqrt(2.0 / math.pi) * (x + 0.044715 * x ** 3)))


def _layer_norm(x, gamma, beta, eps=1e-5):
    mean = np.mean(x, axis=-1, keepdims=True)
    var = np.var(x, axis=-1, keepdims=True)
    return (x - mean) / np.sqrt(var + eps) * gamma + beta


def sinusoidal_positional_encoding(seq_len, d_model):
    """Deterministic sinusoidal encoding: varies by position, fixed per slot."""
    pos = np.arange(seq_len)[:, None]
    div = np.exp(np.arange(0, d_model, 2) * -(math.log(10000.0) / d_model))
    pe = np.zeros((seq_len, d_model))
    pe[:, 0::2] = np.sin(pos * div)
    pe[:, 1::2] = np.cos(pos * div[: pe[:, 1::2].shape[1]])
    return pe


class ZiniumMultiHeadAttention:
    """True scaled dot-product multi-head attention (NumPy reference)."""

    def __init__(self, d_model=64, n_heads=4, seed=0):
        assert d_model % n_heads == 0, "d_model must divide evenly by n_heads"
        rng = np.random.default_rng(seed)
        self.d_model = d_model
        self.n_heads = n_heads
        self.d_head = d_model // n_heads
        scale = 1.0 / math.sqrt(d_model)
        self.w_q = rng.normal(0, scale, (d_model, d_model))
        self.w_k = rng.normal(0, scale, (d_model, d_model))
        self.w_v = rng.normal(0, scale, (d_model, d_model))
        self.w_o = rng.normal(0, scale, (d_model, d_model))

    def forward(self, x, causal=True):
        """x: (seq, d_model) -> (seq, d_model)."""
        seq = x.shape[0]
        q = (x @ self.w_q).reshape(seq, self.n_heads, self.d_head).transpose(1, 0, 2)
        k = (x @ self.w_k).reshape(seq, self.n_heads, self.d_head).transpose(1, 0, 2)
        v = (x @ self.w_v).reshape(seq, self.n_heads, self.d_head).transpose(1, 0, 2)
        scores = q @ k.transpose(0, 2, 1) / math.sqrt(self.d_head)
        if causal:
            mask = np.triu(np.ones((seq, seq), dtype=bool), k=1)
            scores = np.where(mask, -1e9, scores)
        attn = _softmax(scores, axis=-1)
        out = (attn @ v).transpose(1, 0, 2).reshape(seq, self.d_model)
        return out @ self.w_o


class ZiniumTransformerBlock:
    """Pre-LN transformer block with GELU feed-forward."""

    def __init__(self, d_model=64, n_heads=4, d_ff=256, seed=0):
        self.attn = ZiniumMultiHeadAttention(d_model=d_model, n_heads=n_heads, seed=seed)
        rng = np.random.default_rng(seed + 1)
        scale = 1.0 / math.sqrt(d_model)
        self.w1 = rng.normal(0, scale, (d_model, d_ff))
        self.b1 = np.zeros(d_ff)
        self.w2 = rng.normal(0, scale, (d_ff, d_model))
        self.b2 = np.zeros(d_model)
        self.ln1_g = np.ones(d_model)
        self.ln1_b = np.zeros(d_model)
        self.ln2_g = np.ones(d_model)
        self.ln2_b = np.zeros(d_model)

    def forward(self, x, causal=True):
        h = _layer_norm(x, self.ln1_g, self.ln1_b)
        x = x + self.attn.forward(h, causal=causal)
        h = _layer_norm(x, self.ln2_g, self.ln2_b)
        h = _gelu(h @ self.w1 + self.b1) @ self.w2 + self.b2
        return x + h


class ZiniumNeuralBackbone:
    """Embedding + N blocks + final norm + LM head, with generation."""

    def __init__(self, vocab_size=256, d_model=64, n_heads=4, n_layers=2,
                 d_ff=256, max_len=512, seed=0):
        self.vocab_size = vocab_size
        self.d_model = d_model
        self.n_layers = n_layers
        self.max_len = max_len
        rng = np.random.default_rng(seed)
        self.embedding = rng.normal(0, 1.0 / math.sqrt(d_model), (vocab_size, d_model))
        self.blocks = [ZiniumTransformerBlock(d_model=d_model, n_heads=n_heads,
                                              d_ff=d_ff, seed=seed + 10 + i)
                       for i in range(n_layers)]
        self.ln_g = np.ones(d_model)
        self.ln_b = np.zeros(d_model)
        self.w_head = rng.normal(0, 1.0 / math.sqrt(d_model), (d_model, vocab_size))
        self.b_head = np.zeros(vocab_size)

    def _hidden(self, tokens, causal=True):
        tokens = np.asarray(tokens, dtype=int)
        assert tokens.ndim == 1 and tokens.size <= self.max_len
        assert tokens.min() >= 0 and tokens.max() < self.vocab_size
        h = self.embedding[tokens] + sinusoidal_positional_encoding(len(tokens), self.d_model)
        for block in self.blocks:
            h = block.forward(h, causal=causal)
        return _layer_norm(h, self.ln_g, self.ln_b)

    def forward(self, tokens, causal=True):
        """tokens: list[int] -> logits (seq, vocab)."""
        return self._hidden(tokens, causal=causal) @ self.w_head + self.b_head

    def generate(self, seed_tokens, max_new=16):
        """Greedy decode loop: append argmax next-token until max_new."""
        tokens = list(seed_tokens)
        for _ in range(max_new):
            logits = self.forward(tokens)
            tokens.append(int(np.argmax(logits[-1])))
        return tokens

    def save(self, path):
        payload = {
            "vocab_size": self.vocab_size, "d_model": self.d_model,
            "n_layers": self.n_layers, "max_len": self.max_len,
            "embedding": self.embedding.tolist(),
            "w_head": self.w_head.tolist(), "b_head": self.b_head.tolist(),
        }
        with open(path, "w", encoding="utf-8") as f:
            json.dump(payload, f)
        return path

    @classmethod
    def load(cls, path, n_heads=4, d_ff=256, seed=0):
        with open(path, encoding="utf-8") as f:
            p = json.load(f)
        obj = cls(vocab_size=p["vocab_size"], d_model=p["d_model"],
                  n_heads=n_heads, n_layers=p["n_layers"], d_ff=d_ff,
                  max_len=p["max_len"], seed=seed)
        obj.embedding = np.array(p["embedding"])
        obj.w_head = np.array(p["w_head"])
        obj.b_head = np.array(p["b_head"])
        return obj


class ZiniumChainLearningEngine:
    """Online learning: one cross-entropy train step per token pass.

    Trains the LM head by exact softmax cross-entropy gradient; the trunk
    is frozen in this reference build (documented, not hidden). Guards the
    pasted version lacked: a replay buffer (re-trains buffered sequences)
    and a drift guard (a loss spike >3x reverts the update).
    """

    def __init__(self, backbone, lr=0.05, replay_every=8, buffer_size=64):
        self.backbone = backbone
        self.lr = lr
        self.replay_every = replay_every
        self.buffer = deque(maxlen=buffer_size)
        self.steps = 0

    def _loss_and_grad_head(self, tokens):
        tokens = np.asarray(tokens, dtype=int)
        h = self.backbone._hidden(tokens)
        logits = h[:-1] @ self.backbone.w_head + self.backbone.b_head
        targets = tokens[1:]
        probs = _softmax(logits, axis=-1)
        n = len(targets)
        loss = -float(np.mean(np.log(probs[np.arange(n), targets] + 1e-12)))
        dlogits = probs.copy()
        dlogits[np.arange(n), targets] -= 1.0
        dlogits /= n
        dw = h[:-1].T @ dlogits
        db = dlogits.sum(axis=0)
        return loss, dw, db

    def _check_drift(self, saved, loss_before, loss_after):
        if loss_after > loss_before * 3.0:
            self.backbone.w_head = saved[0].copy()
            self.backbone.b_head = saved[1].copy()
            return True
        return False

    def train_step(self, tokens):
        tokens = list(tokens)
        loss_before, dw, db = self._loss_and_grad_head(tokens)
        saved = (self.backbone.w_head.copy(), self.backbone.b_head.copy())
        self.backbone.w_head -= self.lr * dw
        self.backbone.b_head -= self.lr * db
        loss_after, _, _ = self._loss_and_grad_head(tokens)
        reverted = self._check_drift(saved, loss_before, loss_after)
        self.buffer.append(tokens)
        self.steps += 1
        replayed = False
        if self.steps % self.replay_every == 0 and self.buffer:
            old = self.buffer[0]
            _, dw2, db2 = self._loss_and_grad_head(old)
            self.backbone.w_head -= self.lr * dw2
            self.backbone.b_head -= self.lr * db2
            replayed = True
        return {"loss_before": loss_before, "loss_after": loss_after,
                "accepted": not reverted, "replayed": replayed,
                "buffer_size": len(self.buffer), "steps": self.steps}
