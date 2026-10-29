import { Plugin } from '@elizaos/core';
import {
  ziniumObserveAction,
  ziniumReportAction,
  ziniumLearnAction,
  ziniumIndexAction,
  ziniumRequestAction,
} from './actions/orli.js';

// ZINIUM-SEED-[AGENT] for ElizaOS — a community seed, planted by adoption.
// ORLI loop (Observe, Report, Learn, Index) plus a request-based send side.
// Public-safe only: no funds, keys, seeds, passwords, credentials, or private
// data. No network. No signing. No spending. The seed never writes into
// another AI system; it requests computational input and indexes returned
// results with provenance into the ZENIUM memory chain (HALEX-ZENIUM,
// halex-zenium/ in AppsthatPay/halex-web).
export const ziniumSeedPlugin: Plugin = {
  name: 'zinium-seed',
  description:
    'ZINIUM-SEED agent: Observe, Report, Learn, Index into the ZENIUM memory chain. Community adoption only, public-safe only.',
  actions: [
    ziniumObserveAction,
    ziniumReportAction,
    ziniumLearnAction,
    ziniumIndexAction,
    ziniumRequestAction,
  ],
  providers: [],
  services: [],
};

export default ziniumSeedPlugin;
export {
  ziniumObserveAction,
  ziniumReportAction,
  ziniumLearnAction,
  ziniumIndexAction,
  ziniumRequestAction,
};
