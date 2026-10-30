// HALEX-AI plugin pack: animals, mice. Bundled JSON knowledge pack.
// This pack exists because a live HALEX-AI question about mice returned
// only the generic fallback. Content is general reference knowledge.
// Plain script, no modules. Works in the browser and in Node for tests.
(function () {
  'use strict';
  var pack = {
    id: 'animals-mice',
    name: 'Animals: mice',
    version: '1.0.0',
    provenance: 'Bundled 2026-10-30 by Allen (ZINIUM-SEED-ALLEN). General reference knowledge about mice; no live data, no invented citations.',
    entries: [
      {
        patterns: ['mice', 'house mouse', 'mus musculus', 'mouse biology', 'what is a mouse', 'mouse facts'],
        title: 'The house mouse',
        body: 'The house mouse is Mus musculus, a small rodent that lives alongside humans on every continent except Antarctica. Adults are about 7 to 10 cm long in body, with a tail nearly as long, and weigh roughly 12 to 30 grams. They live about a year in the wild and 2 to 3 years in captivity. They breed year-round when food and shelter allow: gestation is around 20 days and a litter is typically 5 or 6 pups. They eat seeds, grains, and almost any human food they can reach, and they gnaw constantly because their front teeth grow throughout life.',
        sources: ['General reference: Mus musculus species biology']
      },
      {
        patterns: ['mouse species', 'types of mice', 'deer mouse', 'field mouse', 'kinds of mice', 'mouse vs rat'],
        title: 'House mouse vs its cousins',
        body: 'Not every small mouse is a house mouse. The deer mouse (Peromyscus) has a white belly, large eyes, and a bicoloured tail, and it prefers fields and woodland edges over houses. Field mice and voles are stockier, with shorter tails and blunter faces. Rats are much larger, with bodies over 15 cm. Telling them apart matters: deer mice in some regions can carry hantavirus, so droppings from wild mice should never be handled bare-handed or swept up dry.',
        sources: ['General reference: Peromyscus and vole identification']
      },
      {
        patterns: ['pet mouse', 'pet mice', 'mouse care', 'keeping mice', 'mouse cage', 'what do pet mice eat', 'fancy mouse'],
        title: 'Pet mouse care basics',
        body: 'Pet mice are social animals: females do best in small same-sex groups, while adult males usually fight and are kept singly. They need a ventilated cage (not a sealed tank), dust-free bedding, a solid exercise wheel, hides, and things to gnaw. Feed a commercial mouse or rat lab block as the staple, plus small amounts of seeds, vegetables, and occasional fruit. Handle them gently and often, scooping rather than grabbing the tail. Expect a lifespan of about 1.5 to 2.5 years. An exotics vet, not a general small-animal vet, is the right call when a pet mouse is ill.',
        sources: ['General reference: pet mouse husbandry guidance']
      },
      {
        patterns: ['lab mouse', 'laboratory mouse', 'research mouse', 'mouse model', 'why mice in science'],
        title: 'Why mice are used in research',
        body: 'Mice are the most used mammal in research because they breed fast, are small and cheap to house, and share a large share of their genes with humans: roughly 85 percent of protein-coding mouse genes have a human counterpart, a commonly cited figure. Standard inbred strains such as C57BL/6 let labs compare results across studies. Their use is governed by animal-welfare rules and ethics review in most countries, and alternatives such as cell models are used wherever they can answer the question.',
        sources: ['General reference: mouse genetics and research use']
      },
      {
        patterns: ['mouse pest', 'mice in house', 'get rid of mice', 'mouse traps', 'mice infestation', 'mouse droppings'],
        title: 'Dealing with house mice as pests',
        body: 'Start with exclusion and sanitation, not poison. Seal gaps larger than about 6 mm around pipes, doors, and vents, since a mouse can squeeze through a hole the width of a pencil. Store food in sealed containers and clear crumbs and pet food overnight. Snap traps placed along walls, where mice travel, work well; check them daily. Avoid poison baits where children or pets could reach them, because poisoned mice can poison pets and wildlife that eat them. For droppings, wear gloves, dampen the area with disinfectant, wipe it up, and wash hands; do not sweep dry droppings into the air.',
        sources: ['General reference: household mouse pest management']
      },
      {
        patterns: ['mouse behavior', 'are mice nocturnal', 'mouse senses', 'mouse whiskers', 'why do mice gnaw', 'mouse habits'],
        title: 'How mice live: senses and habits',
        body: 'Mice are mostly nocturnal and famously hug walls as they move, a habit called thigmotaxis, because open ground feels exposed. Their whiskers map their surroundings in the dark, and smell matters more to them than sight. They are strong climbers and good jumpers for their size. They gnaw wood, plastic, and wiring not out of spite but to wear down front teeth that never stop growing. A mouse that keeps appearing in daylight is often a sign of a large population or a disturbed nest, not a single bold animal.',
        sources: ['General reference: mouse behaviour and senses']
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
