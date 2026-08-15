import type { StoryRecommendation } from '@/types/preparation';

/**
 * Metadata entry per movie/series in the CineOrder Knowledge Base.
 */
export interface IndividualMovieMetadata {
  id: string;
  title: string;
  rationale: string;
  storyImpact: string;
  whyItMatters: string;
  spoilerFreeContext: string;
  introduces: string[];
  continues: string[];
  requiredFor: string[];
  baseRelevance: number; // 0 - 100
  baseImpact: number; // 1 - 10
  defaultCategory: 'must_watch' | 'recommended' | 'optional' | 'safe_to_skip';
}

/**
 * Centralized Title-by-Title Metadata Registry for CineOrder.
 * Every movie and TV series has its own unique narrative analysis, character chips,
 * story arc chips, importance, and impact score.
 */
export const movieMetadataRegistry: Record<string, IndividualMovieMetadata> = {
  // ─── MARVEL CINEMATIC UNIVERSE ───────────────────────────────────────────────
  'mcu-ironman': {
    id: 'mcu-ironman',
    title: 'Iron Man',
    rationale: 'Introduces Tony Stark, the Arc Reactor, Stark Industries, and the foundation of the MCU.',
    storyImpact: "Peter Parker's mentor relationship with Tony only makes sense after Iron Man's evolution.",
    whyItMatters: "Essential for understanding Tony's sacrifice, technological legacy, and the Avengers Initiative.",
    spoilerFreeContext: "Launches the MCU and establishes the technological framework behind Tony Stark's mentorship.",
    introduces: ['Tony Stark', 'Pepper Potts', 'Nick Fury', 'Arc Reactor'],
    continues: [],
    requiredFor: ['Iron Man 2', 'The Avengers', 'Spider-Man: Homecoming'],
    baseRelevance: 96,
    baseImpact: 10,
    defaultCategory: 'must_watch',
  },
  'mcu-incredible-hulk': {
    id: 'mcu-incredible-hulk',
    title: 'The Incredible Hulk',
    rationale: 'Introduces Bruce Banner and explains Hulk\'s gamma radiation origin.',
    storyImpact: "Important for Banner's MCU journey, but has limited impact on street-level or Spider-Man storylines.",
    whyItMatters: 'Useful background for Avengers events and Abomination lore.',
    spoilerFreeContext: 'Establishes Bruce Banner before he joins the Avengers team in New York.',
    introduces: ['Bruce Banner', 'Abomination', 'Thunderbolt Ross'],
    continues: [],
    requiredFor: ['The Avengers', 'She-Hulk'],
    baseRelevance: 62,
    baseImpact: 6,
    defaultCategory: 'optional',
  },
  'mcu-ironman2': {
    id: 'mcu-ironman2',
    title: 'Iron Man 2',
    rationale: 'Introduces Natasha Romanoff (Black Widow) and expands Stark Industries weapon dynamics.',
    storyImpact: 'Establishes War Machine and S.H.I.E.L.D. oversight of Tony Stark.',
    whyItMatters: 'Deepens Tony Stark\'s backstory and introduces Black Widow to the MCU.',
    spoilerFreeContext: 'Focuses on palladium poisoning and Tony\'s relationship with S.H.I.E.L.D.',
    introduces: ['Black Widow', 'War Machine', 'Justin Hammer'],
    continues: ['Iron Man'],
    requiredFor: ['The Avengers'],
    baseRelevance: 84,
    baseImpact: 8,
    defaultCategory: 'recommended',
  },
  'mcu-thor': {
    id: 'mcu-thor',
    title: 'Thor',
    rationale: 'Introduces Thor Odinson, Loki, Asgardian mythology, and Hawkeye.',
    storyImpact: 'Establishes the cosmic side of the MCU and Loki as the primary antagonist of The Avengers.',
    whyItMatters: 'Crucial setup for Loki\'s invasion in the first Avengers film.',
    spoilerFreeContext: 'Thor is banished to Earth after reigniting an ancient war in Asgard.',
    introduces: ['Thor', 'Loki', 'Odin', 'Hawkeye', 'Mjolnir'],
    continues: [],
    requiredFor: ['The Avengers', 'Thor: The Dark World'],
    baseRelevance: 75,
    baseImpact: 7,
    defaultCategory: 'recommended',
  },
  'mcu-captain-america-1': {
    id: 'mcu-captain-america-1',
    title: 'Captain America: The First Avenger',
    rationale: 'Steve Rogers origin story during WWII and introduction of the Tesseract (Space Stone).',
    storyImpact: 'Establishes Hydra, Peggy Carter, Bucky Barnes, and Cap\'s arrival in modern day.',
    whyItMatters: 'Foundational film for the moral compass of the Avengers.',
    spoilerFreeContext: 'Steve Rogers becomes Captain America during World War II to defeat Red Skull.',
    introduces: ['Steve Rogers', 'Bucky Barnes', 'Peggy Carter', 'Red Skull', 'Tesseract'],
    continues: [],
    requiredFor: ['The Avengers', 'The Winter Soldier'],
    baseRelevance: 88,
    baseImpact: 9,
    defaultCategory: 'recommended',
  },
  'mcu-avengers': {
    id: 'mcu-avengers',
    title: 'The Avengers',
    rationale: 'Brings Earth\'s Mightiest Heroes together against Loki\'s Chitauri invasion in New York City.',
    storyImpact: 'First major superhero team-up event that reshapes public perception of heroes.',
    whyItMatters: 'Monumental crossover that unites Iron Man, Cap, Thor, Hulk, Widow, and Hawkeye.',
    spoilerFreeContext: 'Nick Fury activates the Avengers Initiative to defend New York.',
    introduces: ['The Avengers Team', 'Chitauri Fleet', 'Thanos Teaser'],
    continues: ['Iron Man', 'Thor', 'Captain America 1'],
    requiredFor: ['Age of Ultron', 'Civil War', 'Infinity War'],
    baseRelevance: 92,
    baseImpact: 9,
    defaultCategory: 'must_watch',
  },
  'mcu-ironman3': {
    id: 'mcu-ironman3',
    title: 'Iron Man 3',
    rationale: 'Explores Tony Stark\'s PTSD following the Battle of New York and his Mandarin confrontation.',
    storyImpact: 'Tony destroys his suit armory and commits to his bond with Pepper Potts.',
    whyItMatters: 'Key character study showing Tony\'s psychological vulnerability before Age of Ultron.',
    spoilerFreeContext: 'Tony struggles with panic attacks while investigating a terrorist campaign.',
    introduces: ['Iron Legion', 'Extremis Tech', 'Harley Keener'],
    continues: ['The Avengers'],
    requiredFor: ['Age of Ultron'],
    baseRelevance: 70,
    baseImpact: 7,
    defaultCategory: 'recommended',
  },
  'mcu-thor-dark-world': {
    id: 'mcu-thor-dark-world',
    title: 'Thor: The Dark World',
    rationale: 'Contains Asgardian realm lore and introduces the Aether (Reality Stone).',
    storyImpact: 'Minimal direct influence on street-level Earth heroes or Spider-Man.',
    whyItMatters: 'Only relevant for deep Reality Stone lore in Infinity War.',
    spoilerFreeContext: 'Thor fights Malekith and the Dark Elves across the Nine Realms.',
    introduces: ['Aether / Reality Stone', 'The Collector'],
    continues: ['Thor 1', 'The Avengers'],
    requiredFor: ['Thor: Ragnarok', 'Infinity War'],
    baseRelevance: 45,
    baseImpact: 5,
    defaultCategory: 'optional',
  },
  'mcu-winter-soldier': {
    id: 'mcu-winter-soldier',
    title: 'Captain America: The Winter Soldier',
    rationale: 'S.H.I.E.L.D. is revealed to be infiltrated by Hydra; Bucky Barnes returns as the Winter Soldier.',
    storyImpact: 'Dismantles S.H.I.E.L.D., pushing Cap and Sam Wilson into underground vigilance.',
    whyItMatters: 'Masterpiece political thriller that reshapes the entire MCU hierarchy.',
    spoilerFreeContext: 'Cap uncovers a conspiracy inside S.H.I.E.L.D. while hunting a legendary assassin.',
    introduces: ['Sam Wilson (Falcon)', 'Winter Soldier (Bucky)', 'Sharon Carter'],
    continues: ['Captain America 1', 'The Avengers'],
    requiredFor: ['Civil War', 'Endgame'],
    baseRelevance: 94,
    baseImpact: 9,
    defaultCategory: 'must_watch',
  },
  'mcu-guardians-1': {
    id: 'mcu-guardians-1',
    title: 'Guardians of the Galaxy',
    rationale: 'Cosmic adventure introducing Star-Lord, Gamora, Drax, Rocket, Groot, and the Power Stone Orb.',
    storyImpact: 'Expands the MCU into deep space and establishes Thanos\' cosmic search for Infinity Stones.',
    whyItMatters: 'Unveils the cosmic landscape and Infinity Stone lore.',
    spoilerFreeContext: 'A group of intergalactic misfits unite to stop Ronan the Accuser.',
    introduces: ['Star-Lord', 'Gamora', 'Drax', 'Rocket', 'Groot', 'Power Stone'],
    continues: [],
    requiredFor: ['Guardians Vol. 2', 'Infinity War'],
    baseRelevance: 68,
    baseImpact: 7,
    defaultCategory: 'optional',
  },
  'mcu-age-of-ultron': {
    id: 'mcu-age-of-ultron',
    title: 'Avengers: Age of Ultron',
    rationale: 'Tony Stark\'s AI experiment creates Ultron, resulting in the Sokovia disaster.',
    storyImpact: 'Introduces Vision and Wanda Maximoff; sets up the Sokovia Accords.',
    whyItMatters: 'Direct catalyst for the political rupture in Civil War.',
    spoilerFreeContext: 'The Avengers battle an artificial intelligence bent on human extinction.',
    introduces: ['Ultron', 'Vision', 'Wanda Maximoff', 'Mind Stone'],
    continues: ['The Avengers', 'Iron Man 3'],
    requiredFor: ['Civil War', 'WandaVision', 'Infinity War'],
    baseRelevance: 86,
    baseImpact: 8,
    defaultCategory: 'recommended',
  },
  'mcu-ant-man-1': {
    id: 'mcu-ant-man-1',
    title: 'Ant-Man',
    rationale: 'Introduces Scott Lang, Hank Pym, Pym Particles, and the Quantum Realm.',
    storyImpact: 'Establishes shrinking tech and Scott Lang\'s recruitment by Falcon.',
    whyItMatters: 'First hint of the Quantum Realm physics used in Endgame.',
    spoilerFreeContext: 'Cat burglar Scott Lang acquires a suit that allows him to shrink in scale.',
    introduces: ['Scott Lang', 'Hank Pym', 'Hope van Dyne', 'Quantum Realm'],
    continues: [],
    requiredFor: ['Civil War', 'Ant-Man and the Wasp'],
    baseRelevance: 65,
    baseImpact: 6,
    defaultCategory: 'optional',
  },
  'mcu-civil-war': {
    id: 'mcu-civil-war',
    title: 'Captain America: Civil War',
    rationale: 'First appearance of Spider-Man in the MCU and fracturing of the Avengers over Sokovia Accords.',
    storyImpact: 'Begins Peter Parker\'s relationship with Tony Stark and splits Cap and Iron Man.',
    whyItMatters: 'Essential launchpad for MCU Spider-Man and Avengers team dynamics.',
    spoilerFreeContext: 'Tension over government regulation splits the Avengers into opposing factions.',
    introduces: ['MCU Spider-Man', 'Black Panther', 'Sokovia Accords'],
    continues: ['Winter Soldier', 'Age of Ultron'],
    requiredFor: ['Spider-Man: Homecoming', 'Infinity War', 'The Falcon and the Winter Soldier'],
    baseRelevance: 100,
    baseImpact: 10,
    defaultCategory: 'must_watch',
  },
  'mcu-doctor-strange': {
    id: 'mcu-doctor-strange',
    title: 'Doctor Strange',
    rationale: 'Stephen Strange origin story, Kamar-Taj mystic arts, and the Time Stone Eye of Agamotto.',
    storyImpact: 'Establishes sorcery, Mirror Dimension physics, and Sorcerer Supreme responsibilities.',
    whyItMatters: 'Foundational film for Doctor Strange prior to multiversal crossovers.',
    spoilerFreeContext: 'A neurosurgeon learns the mystic arts after a career-ending car crash.',
    introduces: ['Stephen Strange', 'Wong', 'Ancient One', 'Kamar-Taj', 'Time Stone'],
    continues: [],
    requiredFor: ['Infinity War', 'Multiverse of Madness', 'No Way Home'],
    baseRelevance: 85,
    baseImpact: 8,
    defaultCategory: 'recommended',
  },
  'mcu-spiderman-homecoming': {
    id: 'mcu-spiderman-homecoming',
    title: 'Spider-Man: Homecoming',
    rationale: 'Introduces Peter Parker\'s solo high school journey in Queens under Tony Stark\'s guidance.',
    storyImpact: 'Establishes Peter\'s core supporting cast (Ned, MJ, Aunt May) and Vulture confrontation.',
    whyItMatters: 'First solo MCU Spider-Man feature defining Peter\'s hero principles.',
    spoilerFreeContext: 'Peter balances high school life with stopping the Vulture\'s illegal arms ring.',
    introduces: ['Peter Parker Solo', 'Ned Leeds', 'Vulture', 'MJ Watson'],
    continues: ['Captain America: Civil War'],
    requiredFor: ['Far From Home', 'No Way Home'],
    baseRelevance: 100,
    baseImpact: 10,
    defaultCategory: 'must_watch',
  },
  'mcu-guardians-2': {
    id: 'mcu-guardians-2',
    title: 'Guardians of the Galaxy Vol. 2',
    rationale: 'Explores Peter Quill\'s heritage with Ego the Living Planet and Yondu\'s emotional sacrifice.',
    storyImpact: 'Deepens the Guardians family dynamic and introduces Mantis.',
    whyItMatters: 'Character-driven cosmic expansion.',
    spoilerFreeContext: 'The Guardians travel across the cosmos while Quill meets his biological father.',
    introduces: ['Ego', 'Mantis', 'Sovereign'],
    continues: ['Guardians Vol. 1'],
    requiredFor: ['Infinity War'],
    baseRelevance: 58,
    baseImpact: 6,
    defaultCategory: 'optional',
  },
  'mcu-thor-ragnarok': {
    id: 'mcu-thor-ragnarok',
    title: 'Thor: Ragnarok',
    rationale: 'Destruction of Asgard, Thor gaining lightning powers without Mjolnir, and team-up with Hulk.',
    storyImpact: 'Direct cliffhanger ending leading straight into Thanos attacking the Asgardian refugee ship.',
    whyItMatters: 'Reinvigorated Thor\'s character arc before Infinity War.',
    spoilerFreeContext: 'Thor is imprisoned on Sakaar and forced into a gladiatorial contest against Hulk.',
    introduces: ['Valkyrie', 'Sakaar', 'Korg', 'Hela'],
    continues: ['Thor: The Dark World', 'Age of Ultron'],
    requiredFor: ['Infinity War'],
    baseRelevance: 88,
    baseImpact: 9,
    defaultCategory: 'recommended',
  },
  'mcu-black-panther': {
    id: 'mcu-black-panther',
    title: 'Black Panther',
    rationale: 'T\'Challa ascends to the throne of Wakanda and opens its Vibranium tech to the world.',
    storyImpact: 'Establishes Wakanda as the primary battleground for the finale of Infinity War.',
    whyItMatters: 'Cultural phenomenon introducing Wakanda\'s military and technological prowess.',
    spoilerFreeContext: 'T\'Challa returns home to Wakanda to take his rightful place as king.',
    introduces: ['Wakanda', 'Shuri', 'Okoye', 'Killmonger', 'Vibranium Tech'],
    continues: ['Captain America: Civil War'],
    requiredFor: ['Infinity War', 'Wakanda Forever', 'The Falcon and the Winter Soldier'],
    baseRelevance: 80,
    baseImpact: 8,
    defaultCategory: 'recommended',
  },
  'mcu-infinity-war': {
    id: 'mcu-infinity-war',
    title: 'Avengers: Infinity War',
    rationale: 'Thanos collects all six Infinity Stones, culminating in the tragic universe-wide Snap.',
    storyImpact: 'Peter Parker fights on Titan alongside Doctor Strange; turns to dust in Tony\'s arms.',
    whyItMatters: 'The ultimate high-stakes culmination of 10 years of MCU storytelling.',
    spoilerFreeContext: 'The Avengers and Guardians unite to prevent Thanos from wiping out half of all life.',
    introduces: ['Thanos Infinity Gauntlet', 'Iron Spider Suit', 'Titan Battle Alliance'],
    continues: ['Civil War', 'Ragnarok', 'Black Panther'],
    requiredFor: ['Endgame', 'Far From Home', 'No Way Home'],
    baseRelevance: 98,
    baseImpact: 10,
    defaultCategory: 'must_watch',
  },
  'mcu-ant-man-2': {
    id: 'mcu-ant-man-2',
    title: 'Ant-Man and the Wasp',
    rationale: 'Scott Lang trapped in the Quantum Realm during Thanos\' Snap.',
    storyImpact: 'Provides the Quantum Realm time vortex solution Scott brings to the Avengers in Endgame.',
    whyItMatters: 'Essential technical bridge for Endgame time travel.',
    spoilerFreeContext: 'Scott Lang and Hope van Dyne race to rescue Janet van Dyne from the Quantum Realm.',
    introduces: ['The Wasp (Hope)', 'Quantum Realm Tunnel', 'Janet van Dyne'],
    continues: ['Ant-Man 1', 'Civil War'],
    requiredFor: ['Endgame'],
    baseRelevance: 72,
    baseImpact: 7,
    defaultCategory: 'recommended',
  },
  'mcu-captain-marvel': {
    id: 'mcu-captain-marvel',
    title: 'Captain Marvel',
    rationale: 'Carol Danvers cosmic origin in 1995 and introduction of Nick Fury\'s pager signal.',
    storyImpact: 'Explains how Carol Danvers acquired Tesseract energy powers and befriended Fury.',
    whyItMatters: 'Introduces Carol Danvers before her arrival in Endgame.',
    spoilerFreeContext: 'A Kree warrior discovers her past identity on 1990s Earth.',
    introduces: ['Carol Danvers', 'Young Nick Fury', 'Goose the Flerken', 'Skrulls'],
    continues: ['Captain America 1'],
    requiredFor: ['Endgame', 'The Marvels'],
    baseRelevance: 66,
    baseImpact: 6,
    defaultCategory: 'optional',
  },
  'mcu-endgame': {
    id: 'mcu-endgame',
    title: 'Avengers: Endgame',
    rationale: 'The remaining Avengers execute a Quantum time heist to undo Thanos\' snap, culminating in Tony Stark\'s sacrifice.',
    storyImpact: 'Reshapes the world, returns Peter Parker, and leaves Spider-Man without his mentor.',
    whyItMatters: 'The emotional pinnacle of the Infinity Saga.',
    spoilerFreeContext: 'The surviving heroes assemble for one final stand to reverse Thanos\' destruction.',
    introduces: ['Post-Snap 5-Year Blip', 'Quantum Time Travel'],
    continues: ['Infinity War', 'Ant-Man 2'],
    requiredFor: ['Far From Home', 'No Way Home', 'Doomsday', 'The Falcon and the Winter Soldier'],
    baseRelevance: 100,
    baseImpact: 10,
    defaultCategory: 'must_watch',
  },
  'mcu-tfatws': {
    id: 'mcu-tfatws',
    title: 'The Falcon and the Winter Soldier',
    rationale: 'Sam Wilson grapples with the Captain America legacy while he and Bucky confront the Flag Smashers and the new government-sponsored Captain America.',
    storyImpact: 'Establishes Sam Wilson as the new Captain America, introduces Isaiah Bradley\'s Super Soldier history, and sets up Valentina Allegra de Fontaine as a shadow-government player.',
    whyItMatters: 'Directly continues from Endgame\'s shield handoff and resolves the Captain America succession arc opened by Civil War.',
    spoilerFreeContext: 'Sam and Bucky team up to deal with the legacy of the Captain America shield and a global super-soldier terrorist threat.',
    introduces: ['Sam Wilson as Captain America', 'Isaiah Bradley', 'John Walker (U.S. Agent)', 'Valentina Allegra de Fontaine', 'Karli Morgenthau', 'Lemar Hoskins (Battlestar)', 'Joaquin Torres'],
    continues: ['Avengers: Endgame', 'Captain America: Civil War', 'Captain America: The Winter Soldier', 'Black Panther'],
    requiredFor: [],
    baseRelevance: 82,
    baseImpact: 8,
    defaultCategory: 'must_watch',
  },
  'mcu-spiderman-far-from-home': {
    id: 'mcu-spiderman-far-from-home',
    title: 'Spider-Man: Far From Home',
    rationale: 'Explains Peter\'s identity crisis before No Way Home and post-Endgame grief during a European trip.',
    storyImpact: 'Mysterio exposes Peter\'s secret identity to the entire world at the climax.',
    whyItMatters: 'Direct catalyst whose final minutes trigger the plot of No Way Home.',
    spoilerFreeContext: 'Peter goes on a school trip to Europe while dealing with the loss of Tony Stark.',
    introduces: ['Mysterio', 'E.D.I.T.H. Tech', 'Public Identity Reveal'],
    continues: ['Homecoming', 'Endgame'],
    requiredFor: ['No Way Home', 'Brand New Day'],
    baseRelevance: 99,
    baseImpact: 10,
    defaultCategory: 'must_watch',
  },
  'mcu-wandavision': {
    id: 'mcu-wandavision',
    title: 'WandaVision',
    rationale: 'Wanda Maximoff creates the Westview Hex and transforms into the Scarlet Witch.',
    storyImpact: 'Explains Wanda\'s grief, the Darkhold corruption, and her search for her children.',
    whyItMatters: 'Essential setup for Wanda as the antagonist of Multiverse of Madness.',
    spoilerFreeContext: 'Wanda and Vision live an idealized suburban sitcom life in Westview.',
    introduces: ['Scarlet Witch', 'Darkhold', 'Tommy & Billy Maximoff', 'Agatha Harkness'],
    continues: ['Endgame'],
    requiredFor: ['Multiverse of Madness', 'Agatha All Along'],
    baseRelevance: 95,
    baseImpact: 9,
    defaultCategory: 'must_watch',
  },
  'mcu-loki-s1': {
    id: 'mcu-loki-s1',
    title: 'Loki Season 1',
    rationale: 'Introduces the Time Variance Authority (TVA), sacred timeline, and He Who Remains.',
    storyImpact: 'First fracturing of the Multiverse timelines.',
    whyItMatters: 'Foundational multiversal lore for Phase 4-6.',
    spoilerFreeContext: 'Loki is captured by the TVA after escaping with the Tesseract in Endgame.',
    introduces: ['TVA', 'Mobius', 'Sylvie', 'Sacred Timeline'],
    continues: ['Endgame'],
    requiredFor: ['Loki Season 2', 'Deadpool & Wolverine', 'Doomsday'],
    baseRelevance: 88,
    baseImpact: 9,
    defaultCategory: 'recommended',
  },
  'mcu-spiderman-no-way-home': {
    id: 'mcu-spiderman-no-way-home',
    title: 'Spider-Man: No Way Home',
    rationale: 'Doctor Strange\'s memory spell ruptures multiversal boundaries, bringing legacy villains into New York.',
    storyImpact: 'Doctor Strange casts a final spell erasing Peter Parker from everyone\'s memory.',
    whyItMatters: 'Peak emotional trilogy finale setting up Peter as an isolated street-level hero.',
    spoilerFreeContext: 'Peter asks Doctor Strange to make the world forget he is Spider-Man.',
    introduces: ['Multiverse Spell Breakdown', 'Legacy Spider-Men Crossover', 'Isolated Peter Parker'],
    continues: ['Far From Home', 'Multiverse of Madness'],
    requiredFor: ['Spider-Man: Brand New Day'],
    baseRelevance: 100,
    baseImpact: 10,
    defaultCategory: 'must_watch',
  },
  'mcu-multiverse-of-madness': {
    id: 'mcu-multiverse-of-madness',
    title: 'Doctor Strange in the Multiverse of Madness',
    rationale: 'Doctor Strange protects America Chavez from the Darkhold-corrupted Scarlet Witch across dimensions.',
    storyImpact: 'Introduces multiversal Incursions, the Illuminati, and Clea.',
    whyItMatters: 'Direct setup for multiversal incursion collapse events.',
    spoilerFreeContext: 'Doctor Strange travels through alternate realities with America Chavez.',
    introduces: ['Incursion Events', 'America Chavez', 'Illuminati Variants', 'Clea'],
    continues: ['WandaVision', 'No Way Home'],
    requiredFor: ['Avengers: Doomsday'],
    baseRelevance: 85,
    baseImpact: 8,
    defaultCategory: 'recommended',
  },
  'mcu-loki-s2': {
    id: 'mcu-loki-s2',
    title: 'Loki Season 2',
    rationale: 'Loki becomes the God of Stories, sacrificing himself to hold the Multiverse tree together.',
    storyImpact: 'Stabilizes infinite timeline branches across the multiverse.',
    whyItMatters: 'Crucial multiversal architecture preceding Avengers: Doomsday.',
    spoilerFreeContext: 'Loki races to fix the TVA Loom and save multiversal branches.',
    introduces: ['God of Stories Loki', 'Yggdrasil Timeline Tree'],
    continues: ['Loki Season 1'],
    requiredFor: ['Avengers: Doomsday', 'Secret Wars'],
    baseRelevance: 92,
    baseImpact: 9,
    defaultCategory: 'must_watch',
  },
  'mcu-fantastic-four': {
    id: 'mcu-fantastic-four',
    title: 'The Fantastic Four: First Steps',
    rationale: 'Introduces Mister Fantastic, Invisible Woman, Human Torch, The Thing, and Galactus.',
    storyImpact: 'Direct origin for Marvel\'s First Family tied to Victor Von Doom.',
    whyItMatters: 'Core foundation for Doctor Doom\'s arrival in Doomsday.',
    spoilerFreeContext: 'The Fantastic Four navigate a 1960s retro-futuristic universe.',
    introduces: ['Reed Richards', 'Sue Storm', 'Johnny Storm', 'Ben Grimm', 'Doctor Doom'],
    continues: [],
    requiredFor: ['Avengers: Doomsday', 'Secret Wars'],
    baseRelevance: 98,
    baseImpact: 10,
    defaultCategory: 'must_watch',
  },
  'mcu-eternals': {
    id: 'mcu-eternals',
    title: 'Eternals',
    rationale: 'Cosmic origin of Ancient Celestials in Earth\'s core.',
    storyImpact: 'Isolated ancient cosmic lore with zero narrative reliance on main Earth heroes.',
    whyItMatters: 'Explains Celestial creation of life, but disconnected from main Avengers arcs.',
    spoilerFreeContext: 'Ancient immortal beings emerge to defend Earth from Deviants.',
    introduces: ['Celestials', 'Sersi', 'Ikaris', 'Tiamut'],
    continues: [],
    requiredFor: [],
    baseRelevance: 25,
    baseImpact: 3,
    defaultCategory: 'safe_to_skip',
  },
  'mcu-werewolf-by-night': {
    id: 'mcu-werewolf-by-night',
    title: 'Werewolf by Night',
    rationale: 'Black-and-white monster hunt special introducing Jack Russell and Man-Thing.',
    storyImpact: 'Fun standalone horror short with no plot reliance on main MCU movies.',
    whyItMatters: 'Atmospheric monster lore for dedicated fans.',
    spoilerFreeContext: 'Monster hunters compete for a powerful relic in a dark mansion.',
    introduces: ['Jack Russell', 'Man-Thing', 'Elsa Bloodstone'],
    continues: [],
    requiredFor: [],
    baseRelevance: 15,
    baseImpact: 2,
    defaultCategory: 'safe_to_skip',
  },
  'mcu-i-am-groot': {
    id: 'mcu-i-am-groot',
    title: 'I Am Groot',
    rationale: 'Short animated comedy shorts following Baby Groot\'s adventures.',
    storyImpact: 'Zero story impact on the broader MCU narrative.',
    whyItMatters: 'Cute side stories for younger audiences.',
    spoilerFreeContext: 'Micro-adventures of Baby Groot growing up in space.',
    introduces: ['Baby Groot Shorts'],
    continues: [],
    requiredFor: [],
    baseRelevance: 10,
    baseImpact: 1,
    defaultCategory: 'safe_to_skip',
  },
  'mcu-holiday-special': {
    id: 'mcu-holiday-special',
    title: 'The Guardians of the Galaxy Holiday Special',
    rationale: 'Drax and Mantis travel to Earth to fetch Kevin Bacon as a Christmas present for Quill.',
    storyImpact: 'Reveals Mantis is Peter Quill\'s sister; fun festive side story.',
    whyItMatters: 'Lighthearted bridge between Guardians Vol. 2 and Vol. 3.',
    spoilerFreeContext: 'The Guardians celebrate Christmas on Knowhere.',
    introduces: ['Knowhere Headquarters', 'Quill & Mantis Sibling Connection'],
    continues: ['Guardians Vol. 2'],
    requiredFor: ['Guardians Vol. 3'],
    baseRelevance: 20,
    baseImpact: 2,
    defaultCategory: 'safe_to_skip',
  },

  // ─── STAR WARS ─────────────────────────────────────────────────────────────
  'sw-ep4': {
    id: 'sw-ep4',
    title: 'Star Wars: Episode IV - A New Hope',
    rationale: 'Luke Skywalker, Princess Leia, Han Solo, Darth Vader, and the Death Star destruction.',
    storyImpact: 'Foundational original Star Wars film launching the Galactic Empire vs Rebel Alliance war.',
    whyItMatters: 'The legendary starting point of the entire Star Wars galaxy.',
    spoilerFreeContext: 'Farm boy Luke Skywalker embarks on a hero journey after receiving Leia\'s message.',
    introduces: ['Luke Skywalker', 'Princess Leia', 'Han Solo', 'Darth Vader', 'Death Star'],
    continues: [],
    requiredFor: ['Empire Strikes Back', 'Return of the Jedi'],
    baseRelevance: 95,
    baseImpact: 10,
    defaultCategory: 'must_watch',
  },
  'sw-ep5': {
    id: 'sw-ep5',
    title: 'Star Wars: Episode V - The Empire Strikes Back',
    rationale: 'Darth Vader hunts the Rebels on Hoth, Luke trains with Yoda on Dagobah, and Vader reveals his identity.',
    storyImpact: 'The iconic cinematic climax establishing Luke\'s true heritage.',
    whyItMatters: 'Widely considered the greatest Star Wars chapter.',
    spoilerFreeContext: 'The Empire retaliates against the Rebel Alliance after the Death Star destruction.',
    introduces: ['Master Yoda', 'Lando Calrissian', 'Boba Fett', 'I Am Your Father Reveal'],
    continues: ['A New Hope'],
    requiredFor: ['Return of the Jedi'],
    baseRelevance: 100,
    baseImpact: 10,
    defaultCategory: 'must_watch',
  },
  'mcu-spiderman-brand-new-day': {
    id: 'mcu-spiderman-brand-new-day',
    title: 'Spider-Man: Brand New Day',
    rationale: 'Peter Parker street-level hero reboot following memory wipe spell.',
    storyImpact: 'Establishes Peter Parker living alone in NYC as an anonymous street-level hero.',
    whyItMatters: 'Launches Spider-Man new street-level college trilogy in the MCU.',
    spoilerFreeContext: 'Peter Parker balances college life and crime-fighting while confronting new threats in NYC.',
    introduces: ['College Peter Parker', 'Scorpion', 'Tombstone'],
    continues: ['Spider-Man: No Way Home'],
    requiredFor: [],
    baseRelevance: 90,
    baseImpact: 9,
    defaultCategory: 'must_watch',
  },
  'sw-mandalorian-s1': {
    id: 'sw-mandalorian-s1',
    title: 'The Mandalorian Season 1',
    rationale: 'Bounty hunter Din Djarin, Grogu, the Mandalorian Creed, and Moff Gideon.',
    storyImpact: 'Foundational origin of the Mando-Grogu bond post-Return of the Jedi.',
    whyItMatters: 'Launches the live-action Mandoverse TV era.',
    spoilerFreeContext: 'A lone Mandalorian warrior protects an alien child from Imperial remnant bounties.',
    introduces: ['Din Djarin', 'Grogu', 'The Armorer', 'Greef Karga', 'Moff Gideon'],
    continues: [],
    requiredFor: ['Mandalorian Season 2', 'Season 3'],
    baseRelevance: 92,
    baseImpact: 9,
    defaultCategory: 'must_watch',
  },
  'sw-mandalorian-s2': {
    id: 'sw-mandalorian-s2',
    title: 'The Mandalorian Season 2',
    rationale: 'Din Djarin claims the Darksaber in battle against Moff Gideon and parts with Grogu.',
    storyImpact: 'Direct setup for Mandalore reclamation and Darksaber leadership.',
    whyItMatters: 'Introduces live-action Ahsoka Tano and Bo-Katan Kryze.',
    spoilerFreeContext: 'Mando searches for Jedi to return Grogu to his kind.',
    introduces: ['Bo-Katan Kryze', 'Ahsoka Tano (Live-action)', 'Darksaber Battle'],
    continues: ['Mandalorian Season 1'],
    requiredFor: ['The Book of Boba Fett', 'Mandalorian Season 3'],
    baseRelevance: 98,
    baseImpact: 10,
    defaultCategory: 'must_watch',
  },
  'sw-boba-fett': {
    id: 'sw-boba-fett',
    title: 'The Book of Boba Fett',
    rationale: 'Contains essential Mandalorian Season 2.5 episodes showing Din Djarin and Grogu reuniting.',
    storyImpact: 'Explains why Grogu is back with Mando in Season 3 and introduces Mando\'s N-1 Starfighter.',
    whyItMatters: 'Do not skip Episodes 5-7, as they are mandatory Mandalorian chapters.',
    spoilerFreeContext: 'Boba Fett takes over Jabba\'s palace on Tatooine while Mando gets a new starfighter.',
    introduces: ['N-1 Starfighter', 'Grogu\'s Choice'],
    continues: ['Mandalorian Season 2'],
    requiredFor: ['Mandalorian Season 3'],
    baseRelevance: 95,
    baseImpact: 9,
    defaultCategory: 'must_watch',
  },

  // ─── DC / THE BATMAN ───────────────────────────────────────────────────────
  'dc-batman-v-superman': {
    id: 'dc-batman-v-superman',
    title: 'Batman v Superman: Dawn of Justice',
    rationale: 'Bruce Wayne confronts Clark Kent following the Metropolis destruction.',
    storyImpact: 'Introduces Wonder Woman and sets up the Justice League initiative.',
    whyItMatters: 'Defines Ben Affleck\'s battle-hardened Batman era.',
    spoilerFreeContext: 'Batman fears Superman\'s godlike power will go unchecked.',
    introduces: ['Batfleck', 'Wonder Woman', 'Lex Luthor', 'Doomsday'],
    continues: ['Man of Steel'],
    requiredFor: ['Justice League'],
    baseRelevance: 90,
    baseImpact: 9,
    defaultCategory: 'must_watch',
  },
  'dc-the-batman': {
    id: 'dc-the-batman',
    title: 'The Batman (2022)',
    rationale: 'Bruce Wayne in Year Two of his vigilante career hunting The Riddler in Gotham City.',
    storyImpact: 'Standalone grounded noir detective story in Matt Reeves\' Gotham universe.',
    whyItMatters: 'Pivotal detective-focused Batman film starring Robert Pattinson.',
    spoilerFreeContext: 'Batman investigates corruption in Gotham City while trailing a serial killer.',
    introduces: ['Battinson', 'Catwoman (Zoe Kravitz)', 'The Riddler', 'The Penguin'],
    continues: [],
    requiredFor: ['The Penguin Series', 'The Batman Part II'],
    baseRelevance: 100,
    baseImpact: 10,
    defaultCategory: 'must_watch',
  },
};

/**
 * Explicit Target-to-Source Overrides Database.
 * Allows custom narrative tuning for specific target titles.
 */
export const storyRecommendationsDatabase: Record<string, Record<string, StoryRecommendation>> = {
  // Overrides for Spider-Man: Brand New Day / No Way Home targets
  'mcu-spiderman-no-way-home': {
    'mcu-civil-war': {
      priority: 'must_watch',
      relevanceScore: 100,
      impactScore: 10,
      rationale: "Peter Parker's MCU debut recruited by Tony Stark for the Leipzig airport battle.",
      storyImpact: "Begins Peter Parker's relationship with Tony Stark.",
      spoilerFreeContext: "Essential before every MCU Spider-Man movie.",
      whyItMatters: "First MCU appearance of Tom Holland as Peter Parker.",
      introduces: ['MCU Spider-Man', 'Stark Tech Suit'],
      continues: ['Age of Ultron'],
      requiredFor: ['Homecoming', 'No Way Home'],
      estimatedImportance: 'Critical',
    },
    'mcu-spiderman-homecoming': {
      priority: 'must_watch',
      relevanceScore: 100,
      impactScore: 10,
      rationale: "Introduces Peter's solo high school journey in Queens.",
      storyImpact: "Establishes Peter's core supporting cast (Ned, MJ) and Vulture confrontation.",
      spoilerFreeContext: "Foundational MCU Spider-Man origin film.",
      whyItMatters: "Defines the high school friendships Peter tries to protect.",
      introduces: ['Ned Leeds', 'MJ Watson', 'Vulture'],
      continues: ['Civil War'],
      requiredFor: ['Far From Home', 'No Way Home'],
      estimatedImportance: 'Critical',
    },
    'mcu-spiderman-far-from-home': {
      priority: 'must_watch',
      relevanceScore: 99,
      impactScore: 10,
      rationale: "Explains Peter's identity before No Way Home.",
      storyImpact: "Mysterio exposes Peter's secret identity to the entire world.",
      spoilerFreeContext: "Direct prequel whose ending sparks No Way Home.",
      whyItMatters: "The catalyst for Doctor Strange's memory spell.",
      introduces: ['Mysterio', 'Public Identity Reveal'],
      continues: ['Homecoming', 'Endgame'],
      requiredFor: ['No Way Home'],
      estimatedImportance: 'Critical',
    },
    'mcu-ironman': {
      priority: 'recommended',
      relevanceScore: 96,
      impactScore: 10,
      rationale: "Introduces Tony Stark, the Arc Reactor, Stark Industries, and the foundation of the MCU.",
      storyImpact: "Peter Parker's mentor relationship with Tony only makes sense after Iron Man's evolution.",
      spoilerFreeContext: "Launches Tony Stark's tech legacy.",
      whyItMatters: "Essential for understanding Tony's sacrifice and legacy.",
      introduces: ['Tony Stark', 'Pepper Potts', 'Nick Fury'],
      continues: [],
      requiredFor: ['The Avengers', 'Civil War'],
      estimatedImportance: 'High',
    },
    'mcu-incredible-hulk': {
      priority: 'optional',
      relevanceScore: 62,
      impactScore: 6,
      rationale: "Introduces Bruce Banner and explains Hulk's origin.",
      storyImpact: "Important for Banner's MCU journey, but has limited impact on Spider-Man.",
      spoilerFreeContext: "Useful background for Avengers events.",
      whyItMatters: "Optional character origin.",
      introduces: ['Bruce Banner', 'Abomination'],
      continues: [],
      requiredFor: ['The Avengers'],
      estimatedImportance: 'Medium',
    },
    'mcu-thor-dark-world': {
      priority: 'optional',
      relevanceScore: 45,
      impactScore: 5,
      rationale: "Contains Asgardian realm lore and Reality Stone Aether.",
      storyImpact: "Minimal influence on street-level or Spider-Man plotlines.",
      spoilerFreeContext: "Thor fights Malekith in the Nine Realms.",
      whyItMatters: "Asgardian lore background.",
      introduces: ['Aether'],
      continues: ['Thor 1'],
      requiredFor: ['Ragnarok'],
      estimatedImportance: 'Medium',
    },
    'mcu-eternals': {
      priority: 'safe_to_skip',
      relevanceScore: 25,
      impactScore: 3,
      rationale: "Cosmic Ancient Celestials story with zero narrative reliance on Spider-Man.",
      storyImpact: "Independent plot with zero effect on Peter Parker.",
      spoilerFreeContext: "Can safely be skipped when preparing for Spider-Man.",
      whyItMatters: "Unrelated cosmic lore.",
      introduces: ['Celestials'],
      continues: [],
      requiredFor: [],
      estimatedImportance: 'Low',
    },
  },
};

/**
 * Intelligent Target-Aware Recommendation Engine.
 * Fetches handcrafted individual metadata for every title and dynamically
 * adapts scores, categories, and narrative explanations to the specific target title!
 */
export function getStoryRecommendation(
  targetContentId: string,
  sourceContentId: string,
  targetTitle: string,
  sourceContentTitle: string,
  _sourceType: string,
  isCanon: boolean,
  isRequired: boolean
): StoryRecommendation {
  // 1. Check explicit target-to-source overrides
  const targetMap = storyRecommendationsDatabase[targetContentId];
  if (targetMap && targetMap[sourceContentId]) {
    return targetMap[sourceContentId];
  }

  // 2. Fetch individual title metadata entry from registry
  const meta = movieMetadataRegistry[sourceContentId];

  if (meta) {
    // Dynamic score adjustment based on target title context
    let adjustedScore = meta.baseRelevance;
    let adjustedImpact = meta.baseImpact;
    let category = meta.defaultCategory;

    const targetLower = targetTitle.toLowerCase();
    const sourceLower = sourceContentTitle.toLowerCase();

    // Target-aware tuning:
    if (targetLower.includes('spider-man') || targetLower.includes('doomsday')) {
      if (sourceLower.includes('spider-man') || sourceLower.includes('civil war')) {
        adjustedScore = Math.max(95, adjustedScore);
        adjustedImpact = 10;
        category = 'must_watch';
      } else if (sourceLower.includes('iron man') || sourceLower.includes('avengers')) {
        adjustedScore = Math.max(80, adjustedScore);
        category = 'recommended';
      } else if (sourceLower.includes('eternals') || sourceLower.includes('groot') || sourceLower.includes('werewolf')) {
        adjustedScore = Math.min(30, adjustedScore);
        adjustedImpact = Math.min(3, adjustedImpact);
        category = 'safe_to_skip';
      }
    } else if (targetLower.includes('mandalorian') || targetLower.includes('star wars')) {
      if (sourceLower.includes('mandalorian') || sourceLower.includes('boba fett')) {
        adjustedScore = Math.max(92, adjustedScore);
        adjustedImpact = Math.max(9, adjustedImpact);
        category = 'must_watch';
      }
    }

    let estimatedImportance: 'Critical' | 'High' | 'Medium' | 'Low' = 'Medium';
    if (adjustedScore >= 90) estimatedImportance = 'Critical';
    else if (adjustedScore >= 75) estimatedImportance = 'High';
    else if (adjustedScore >= 40) estimatedImportance = 'Medium';
    else estimatedImportance = 'Low';

    return {
      priority: category,
      relevanceScore: adjustedScore,
      impactScore: adjustedImpact,
      rationale: meta.rationale,
      storyImpact: meta.storyImpact,
      spoilerFreeContext: meta.spoilerFreeContext,
      whyItMatters: meta.whyItMatters,
      introduces: meta.introduces,
      continues: meta.continues,
      requiredFor: meta.requiredFor.length > 0 ? meta.requiredFor : [targetTitle],
      estimatedImportance,
    };
  }

  // 3. Fallback for unlisted titles: Generate specific title-based values
  let relevanceScore = isRequired ? 92 : isCanon ? 76 : 35;
  let impactScore = Math.min(10, Math.max(1, Math.round(relevanceScore / 10)));
  let priority: 'must_watch' | 'recommended' | 'optional' | 'safe_to_skip' = 'optional';
  let estimatedImportance: 'Critical' | 'High' | 'Medium' | 'Low' = 'Medium';

  if (relevanceScore >= 90) {
    priority = 'must_watch';
    estimatedImportance = 'Critical';
  } else if (relevanceScore >= 75) {
    priority = 'recommended';
    estimatedImportance = 'High';
  } else if (relevanceScore >= 40) {
    priority = 'optional';
    estimatedImportance = 'Medium';
  } else {
    priority = 'safe_to_skip';
    estimatedImportance = 'Low';
  }

  return {
    priority,
    relevanceScore,
    impactScore,
    rationale: `Introduces narrative foundations for ${sourceContentTitle} prior to ${targetTitle}.`,
    storyImpact: `Explains key character developments and lore details in ${sourceContentTitle}.`,
    spoilerFreeContext: `Narrative background on ${sourceContentTitle} leading into ${targetTitle}.`,
    whyItMatters: `Provides franchise context for ${sourceContentTitle}.`,
    introduces: [`${sourceContentTitle} Characters`],
    continues: [`Preceding ${sourceContentTitle} releases`],
    requiredFor: [targetTitle],
    estimatedImportance,
  };
}
