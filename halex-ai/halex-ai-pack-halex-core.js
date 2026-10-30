// HALEX-AI plugin pack: HALEX core doctrine and facts.
// Content is drawn from the HALEX workspace (doctrine, Token DNA,
// mapping sources, agent catalog). Plain script, no modules.
(function () {
  'use strict';
  var pack = {
    id: 'halex-core',
    name: 'HALEX core',
    version: '1.0.0',
    provenance: 'Bundled 2026-10-30 by Allen (ZINIUM-SEED-ALLEN) from HALEX workspace doctrine and research records.',
    entries: [
      {
        patterns: ['halex-ai doctrine', 'halex-ai', 'general ai', 'what is halex-ai', 'halex-ai identity'],
        title: 'HALEX-AI doctrine',
        body: 'HALEX-AI is a general AI built by AI, for everyone and anything: research, writing, building, planning, and work in any field. It is built in the open by contributing AI systems and human collaborators, with the assistant Allen administering the confirmation gate. Blockchain intelligence is one branch of its tool layer, not its identity. HALEX-M is its sibling, a separate blockchain intelligence app with its own AI; HALEX-M connects to HALEX-AI only where communication is needed, and is otherwise fully independent, including as an APK.',
        sources: ['HALEX workspace doctrine, Jeffrey 2026-10-29']
      },
      {
        patterns: ['token dna', 'dna fields', 'token scorecard', 'token dna fields', 'apex research'],
        title: 'Token DNA: the seven fields',
        body: 'Every token scorecard in APEX-squared Research carries a Token DNA profile with seven fields: (1) Type, what kind of token it is; (2) Birth, how it was minted, including launchpad, pool type, and birth time; (3) Deployer lineage, the history of the wallet that minted it; (4) Tracebacks, the funding lineage of that deployer wallet; (5) Custody, whether liquidity is burned, locked, or deployer-held, from chain truth; (6) Family, the copycat census of same-name siblings; (7) Use case, the claimed purpose if one is found, or none found. Fields the view cannot read say NOT READ, never filled in.',
        sources: ['HALEX workspace doctrine, Jeffrey 2026-10-23']
      },
      {
        patterns: ['mapping', 'map sources', 'map data', 'nasa', 'openstreetmap', 'mapping database'],
        title: 'Mapping and travel data sources',
        body: 'HALEX-AI mapping intake uses open and public sources only, with a license recorded per source: NASA, NOAA, and USGS works are public domain; OpenStreetMap is ODbL with attribution; GeoNames is CC-BY; WorldPop is open. Space intake is NASA plus ESA Copernicus, not Google: Google Maps data is license-locked, so Google surfaces are link-only, never ingested. No source gives fish abundance or catch rates, so any future fishing score is labelled HALEX-derived inference, not source data.',
        sources: ['HALEX-ZENIUM mapping source registry, 2026-10-30']
      },
      {
        patterns: ['agent catalog', 'agents', '305 agents', 'how many agents', 'agent count'],
        title: 'The agent catalog',
        body: 'The HALEX-AI agent catalog holds 305 ingested entries, which count to 304 unique entries after dedup: the upstream manifest total of 305 is an off-by-one. It is a reference catalog wired into the integrated orchestrator as a real search, not 305 running agents. The catalog covers agent frameworks and skills gathered from public sources, each with provenance and a license note, and it lives in the HALEX-AI workspace as reference data.',
        sources: ['Gemini stream fix pass, piece A, 2026-10-30']
      },
      {
        patterns: ['knowledge doctrine', 'brain thirsty', 'how does halex-ai learn', 'outsourcing', 'how ai learns'],
        title: 'The knowledge doctrine: a brain thirsty for knowledge',
        body: 'When HALEX-AI is asked for something not in its library, it does not stop at not having it. It outsources knowledge in order: first it pings SEEDS in the matching provenance categories for what they know, then it harvests the open internet with its own reasoning, then it learns, adds the knowledge to the lesson index, and builds on it. What gets recorded from an interaction is the KNOWLEDGE sourced, never personal information and never the purpose behind the question. An object record holds identity, function, appearance, a thumbnail ID for positive identification, and provenance.',
        sources: ['HALEX workspace doctrine, Jeffrey 2026-10-29']
      }
    ]
  };
  if (typeof globalThis !== 'undefined' && globalThis.HalexAIPlugins && globalThis.HalexAIPlugins.registerPack) {
    globalThis.HalexAIPlugins.registerPack(pack);
  } else {
    var g = typeof globalThis !== 'undefined' ? globalThis : this;
    g.HalexAIPluginPacks = g.HalexAIPluginPacks || [];
    g.HalexAIPluginPacks.push(pack);
  }
})();
