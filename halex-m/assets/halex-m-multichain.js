/* HALEX-M multi-chain adapters (STAGING 2026-11-03).
 *
 * Wires ALL chains to trade on besides Solana into HALEX-M. Each
 * adapter is a chain descriptor: its DexScreener chain id, its public
 * explorer URL template, and its trading modes.
 *
 * Trading modes (unchanged from the Skills Lab gate):
 * - paper: default on every chain. Paper trades never touch funds.
 * - visitor: live execution ONLY through the visitor's own wallet,
 *   client-side signing, after a confirmed review of exact amount /
 *   token / slippage / fees. HALEX-M holds no keys, never signs
 *   server-side, and never invents a quote, route, or fee.
 * - reownProjectId stays EMPTY until Jeffrey supplies his own from
 *   his account. Without it, WalletConnect stays disabled.
 *
 * Explorer URL templates use each chain's well-known public explorer.
 * The {address} placeholder is filled by the caller with a real
 * address; nothing here invents an address.
 *
 * Pure logic, no DOM, no network. Browser global
 * window.HalexMMultichain; node via module.exports.
 */
(function (root) {
  'use strict';

  var CHAINS = [
    { chainId: 'solana', name: 'Solana', dexChainId: 'solana', explorer: 'https://solscan.io/account/{address}', native: 'SOL' },
    { chainId: 'base', name: 'Base', dexChainId: 'base', explorer: 'https://basescan.org/address/{address}', native: 'ETH' },
    { chainId: 'ethereum', name: 'Ethereum', dexChainId: 'ethereum', explorer: 'https://etherscan.io/address/{address}', native: 'ETH' },
    { chainId: 'bsc', name: 'BNB Chain', dexChainId: 'bsc', explorer: 'https://bscscan.com/address/{address}', native: 'BNB' },
    { chainId: 'arbitrum', name: 'Arbitrum', dexChainId: 'arbitrum', explorer: 'https://arbiscan.io/address/{address}', native: 'ETH' },
    { chainId: 'optimism', name: 'Optimism', dexChainId: 'optimism', explorer: 'https://optimistic.etherscan.io/address/{address}', native: 'ETH' },
    { chainId: 'polygon', name: 'Polygon', dexChainId: 'polygon', explorer: 'https://polygonscan.com/address/{address}', native: 'POL' },
    { chainId: 'avalanche', name: 'Avalanche', dexChainId: 'avalanche', explorer: 'https://snowtrace.io/address/{address}', native: 'AVAX' },
    { chainId: 'linea', name: 'Linea', dexChainId: 'linea', explorer: 'https://lineascan.build/address/{address}', native: 'ETH' },
    { chainId: 'blast', name: 'Blast', dexChainId: 'blast', explorer: 'https://blastscan.io/address/{address}', native: 'ETH' },
    { chainId: 'zksync', name: 'ZKsync', dexChainId: 'zksync', explorer: 'https://explorer.zksync.io/address/{address}', native: 'ETH' },
    { chainId: 'ink', name: 'Ink', dexChainId: 'ink', explorer: 'https://explorer.inkonchain.com/address/{address}', native: 'ETH' }
  ];

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function listChains() { return clone(CHAINS); }
  function getChain(chainId) {
    var found = null;
    CHAINS.forEach(function (c) { if (c.chainId === chainId) found = c; });
    return found ? clone(found) : null;
  }
  function explorerUrl(chainId, address) {
    var c = getChain(chainId);
    if (!c || !address) return null;
    return c.explorer.replace('{address}', encodeURIComponent(String(address)));
  }
  function tradingModes(chainId) {
    if (!getChain(chainId)) return null;
    return {
      chainId: chainId, paper: true,
      visitor: { enabled: true, requires: 'visitor wallet + confirmed review (exact amount/token/slippage/fees), one submission per review' },
      walletConnect: { enabled: false, reason: 'Reown project ID is empty (owner supplies it); WalletConnect renders "WalletConnect needs a project ID (owner supplies it)" and stays disabled' },
      serverSide: { enabled: false, reason: 'HALEX-M holds no keys and never signs server-side' },
      quoteSupplier: null // never invented; route-less reviews are refused
    };
  }
  function canTradeLive(chainId, opts) {
    // Live trading is allowed ONLY with a connected visitor wallet AND
    // a confirmed review. Everything else is paper or refused.
    opts = opts || {};
    if (!getChain(chainId)) return { ok: false, reason: 'unknown chain: ' + chainId };
    if (!opts.visitorWalletConnected) return { ok: false, reason: 'no visitor wallet connected; paper mode only' };
    if (!opts.reviewConfirmed) return { ok: false, reason: 'no confirmed review; paper mode only' };
    if (opts.viaWalletConnect) return { ok: false, reason: 'WalletConnect disabled: Reown project ID is empty (owner supplies it)' };
    return { ok: true, mode: 'visitor', chainId: chainId };
  }

  var api = {
    CHAINS: CHAINS, listChains: listChains, getChain: getChain,
    explorerUrl: explorerUrl, tradingModes: tradingModes,
    canTradeLive: canTradeLive, REOWN_PROJECT_ID: ''
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HalexMMultichain = api;
})(typeof window !== 'undefined' ? window : this);
