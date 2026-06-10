import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Trinket {
  id: string;          // e.g. "gh-001"
  countryCode: string;
  emoji: string;
  name: string;
  hint: string;        // shown before finding
  fact: string;        // shown after finding
  lat: number;
  lng: number;
}

export interface CollectionEntry {
  trinketId: string;
  foundAt: number;     // timestamp
}

export interface TreasureLeaderboardEntry {
  id: string;
  name: string;
  count: number;
  timestamp: number;
}

interface TreasureStore {
  // Identity
  playerName: string;
  lastActive: number;
  setPlayerName: (name: string) => void;

  // Collection
  found: CollectionEntry[];
  claimTrinket: (trinketId: string) => void;
  isFound: (trinketId: string) => boolean;
  getFoundForCountry: (countryCode: string) => CollectionEntry[];
  getTotalFound: () => number;

  // Leaderboard
  leaderboard: TreasureLeaderboardEntry[];
  submitToLeaderboard: (name: string) => void;
  getTopLeaders: (n?: number) => TreasureLeaderboardEntry[];

  // Expiry
  checkExpiry: () => void;
}

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

export const useTreasureStore = create<TreasureStore>()(
  persist(
    (set, get) => ({
      playerName: '',
      lastActive: Date.now(),
      found: [],
      leaderboard: [],

      setPlayerName: (name) => set({ playerName: name.trim().slice(0, 20), lastActive: Date.now() }),

      claimTrinket: (trinketId) => {
        const already = get().found.some(f => f.trinketId === trinketId);
        if (already) return;
        const newFound = [...get().found, { trinketId, foundAt: Date.now() }];
        set({ found: newFound, lastActive: Date.now() });
        // Auto-update leaderboard
        const name = get().playerName || 'Explorer';
        get().submitToLeaderboard(name);
      },

      isFound: (trinketId) => get().found.some(f => f.trinketId === trinketId),

      getFoundForCountry: (countryCode) => {
        const ids = COUNTRY_TRINKETS[countryCode]?.map(t => t.id) ?? [];
        return get().found.filter(f => ids.includes(f.trinketId));
      },

      getTotalFound: () => get().found.length,

      submitToLeaderboard: (name) => {
        const count = get().found.length;
        if (count === 0) return;
        const cleanName = name.trim().slice(0, 20) || 'Explorer';
        const existing = get().leaderboard;
        // Remove old entry for this player, add updated one
        const filtered = existing.filter(e => e.name.toLowerCase() !== cleanName.toLowerCase());
        const newEntry: TreasureLeaderboardEntry = {
          id: `${cleanName.toLowerCase()}-treasure`,
          name: cleanName,
          count,
          timestamp: Date.now(),
        };
        const sorted = [...filtered, newEntry].sort((a, b) => b.count - a.count).slice(0, 75);
        set({ leaderboard: sorted });
      },

      getTopLeaders: (n = 75) => get().leaderboard.slice(0, n),

      checkExpiry: () => {
        const lastActive = get().lastActive;
        if (Date.now() - lastActive > TWO_WEEKS_MS) {
          set({ found: [], lastActive: Date.now() });
        } else {
          set({ lastActive: Date.now() });
        }
      },
    }),
    { name: 'worldclock-treasure-v1' }
  )
);

// ─── Trinket Data (10 per country for key countries) ─────────────────────────

export const COUNTRY_TRINKETS: Record<string, Trinket[]> = {
  // USA
  US: [
    { id: 'us-001', countryCode: 'US', emoji: '🗽', name: 'Liberty Torch',     hint: 'Near a famous harbor statue',           fact: 'The Statue of Liberty was a gift from France in 1886.',           lat: 40.689, lng: -74.044 },
    { id: 'us-002', countryCode: 'US', emoji: '🦅', name: 'Bald Eagle Feather',hint: 'Found in the national bird\'s territory',fact: 'The bald eagle became the U.S. national bird in 1782.',             lat: 38.897, lng: -77.036 },
    { id: 'us-003', countryCode: 'US', emoji: '🎸', name: 'Nashville Riff',    hint: 'In the home of country music',          fact: 'Nashville has over 180 live music venues.',                        lat: 36.166, lng: -86.781 },
    { id: 'us-004', countryCode: 'US', emoji: '🏔️', name: 'Grand Canyon Rock',  hint: 'At the world\'s most famous gorge',     fact: 'The Grand Canyon is over 6 million years old.',                   lat: 36.106, lng: -112.113 },
    { id: 'us-005', countryCode: 'US', emoji: '🌽', name: 'Corn Belt Token',   hint: 'In America\'s agricultural heartland',  fact: 'Iowa alone produces 20% of U.S. corn output.',                    lat: 41.878, lng: -93.097 },
    { id: 'us-006', countryCode: 'US', emoji: '🎬', name: 'Hollywood Star',    hint: 'Where movies are made',                 fact: 'Hollywood sign was originally "HOLLYWOODLAND" — a real estate ad.',lat: 34.092, lng: -118.321 },
    { id: 'us-007', countryCode: 'US', emoji: '🎰', name: 'Lucky Chip',        hint: 'City of lights in the desert',          fact: 'Las Vegas means "The Meadows" in Spanish.',                        lat: 36.114, lng: -115.172 },
    { id: 'us-008', countryCode: 'US', emoji: '🚀', name: 'Space Shuttle Pin', hint: 'Where rockets launch into space',       fact: 'Kennedy Space Center has launched every U.S. crewed mission.',    lat: 28.573, lng: -80.648 },
    { id: 'us-009', countryCode: 'US', emoji: '🎷', name: 'Jazz Token',        hint: 'The birthplace of jazz music',          fact: 'New Orleans invented jazz in the early 1900s.',                   lat: 29.951, lng: -90.071 },
    { id: 'us-010', countryCode: 'US', emoji: '🍎', name: 'Big Apple Badge',   hint: 'The city that never sleeps',            fact: 'New York City has 8.3 million people — more than 39 U.S. states.', lat: 40.712, lng: -74.006 },
  ],
  // UK
  GB: [
    { id: 'gb-001', countryCode: 'GB', emoji: '👑', name: 'Crown Jewel Shard', hint: 'Near the royal palace',                 fact: 'The Crown Jewels include 23,578 gems.',                           lat: 51.500, lng: -0.124 },
    { id: 'gb-002', countryCode: 'GB', emoji: '🎡', name: 'London Eye Token',  hint: 'On the South Bank of the Thames',       fact: 'The London Eye rotates at 2 rotations per hour — you barely feel it.', lat: 51.503, lng: -0.119 },
    { id: 'gb-003', countryCode: 'GB', emoji: '🧙', name: 'Wizard\'s Wand',    hint: 'At a famous wizarding school location', fact: 'Alnwick Castle was used as Hogwarts in the Harry Potter films.',  lat: 55.415, lng: -1.702 },
    { id: 'gb-004', countryCode: 'GB', emoji: '🪨', name: 'Stonehenge Stone',  hint: 'At a prehistoric mystery site',         fact: 'Stonehenge\'s builders are still unknown — built ~3000 BC.',       lat: 51.179, lng: -1.826 },
    { id: 'gb-005', countryCode: 'GB', emoji: '🎭', name: 'Shakespeare\'s Quill',hint:'In the birthplace of the Bard',        fact: 'Shakespeare wrote 37 plays and 154 sonnets.',                     lat: 52.191, lng: -1.708 },
    { id: 'gb-006', countryCode: 'GB', emoji: '🏰', name: 'Castle Key',        hint: 'At an ancient Scottish fortress',       fact: 'Edinburgh Castle has been a fortress since at least the 12th century.', lat: 55.948, lng: -3.199 },
    { id: 'gb-007', countryCode: 'GB', emoji: '🎸', name: 'Beatles Record',    hint: 'In the hometown of the Fab Four',       fact: 'The Beatles sold over 800 million records worldwide.',            lat: 53.408, lng: -2.991 },
    { id: 'gb-008', countryCode: 'GB', emoji: '🫖', name: 'Tea Leaf Token',    hint: 'In the heart of England',               fact: 'Britain drinks 100 million cups of tea every day.',               lat: 52.481, lng: -1.899 },
    { id: 'gb-009', countryCode: 'GB', emoji: '⚽', name: 'Football Medal',    hint: 'Where football was first codified',      fact: 'The world\'s first football club was Sheffield FC, founded 1857.', lat: 53.381, lng: -1.470 },
    { id: 'gb-010', countryCode: 'GB', emoji: '🌊', name: 'Coastal Pearl',     hint: 'Along the white cliffs',                fact: 'The White Cliffs of Dover are up to 350 feet tall.',              lat: 51.131, lng: 1.336 },
  ],
  // Japan
  JP: [
    { id: 'jp-001', countryCode: 'JP', emoji: '⛩️', name: 'Torii Gate Charm', hint: 'At the most famous shrine gate',        fact: 'Fushimi Inari has over 10,000 torii gates donated by businesses.', lat: 34.967, lng: 135.772 },
    { id: 'jp-002', countryCode: 'JP', emoji: '🍣', name: 'Sushi Roll Token',  hint: 'At Tsukiji fish market area',           fact: 'Japan eats 7.5 billion pieces of sushi per year.',                lat: 35.665, lng: 139.770 },
    { id: 'jp-003', countryCode: 'JP', emoji: '🌸', name: 'Cherry Blossom',    hint: 'In the park famous for hanami',         fact: 'Cherry blossom season lasts only about 2 weeks.',                lat: 35.682, lng: 139.769 },
    { id: 'jp-004', countryCode: 'JP', emoji: '🏔️', name: 'Mt. Fuji Coin',    hint: 'Near Japan\'s sacred volcano',         fact: 'Mt. Fuji is a stratovolcano and last erupted in 1707.',           lat: 35.360, lng: 138.727 },
    { id: 'jp-005', countryCode: 'JP', emoji: '🤖', name: 'Akihabara Circuit', hint: 'In the tech district of Tokyo',         fact: 'Akihabara has over 250 electronics stores in just a few blocks.', lat: 35.702, lng: 139.774 },
    { id: 'jp-006', countryCode: 'JP', emoji: '🦌', name: 'Sacred Deer Tag',   hint: 'In the deer park of an ancient city',  fact: 'Nara\'s 1,200 deer are considered sacred messengers of the gods.', lat: 34.681, lng: 135.844 },
    { id: 'jp-007', countryCode: 'JP', emoji: '🏯', name: 'Samurai Crest',     hint: 'At the most beautiful castle in Japan',fact: 'Himeji Castle is nicknamed "White Heron Castle" for its white walls.',lat: 34.839, lng: 134.693 },
    { id: 'jp-008', countryCode: 'JP', emoji: '🌊', name: 'Tsunami Bell',      hint: 'On the coast of Hokkaido',             fact: 'Japan experiences about 1,500 earthquakes every year.',           lat: 43.064, lng: 141.347 },
    { id: 'jp-009', countryCode: 'JP', emoji: '🎎', name: 'Kokeshi Doll',      hint: 'In traditional Kyoto',                 fact: 'Kyoto was Japan\'s capital for over 1,000 years.',               lat: 35.011, lng: 135.768 },
    { id: 'jp-010', countryCode: 'JP', emoji: '🚅', name: 'Shinkansen Ticket', hint: 'Where bullet trains depart',            fact: 'Japan\'s Shinkansen has carried 10 billion passengers with zero fatal accidents.', lat: 34.733, lng: 135.500 },
  ],
  // France
  FR: [
    { id: 'fr-001', countryCode: 'FR', emoji: '🗼', name: 'Eiffel Rivet',      hint: 'At the iron lady',                     fact: 'The Eiffel Tower was supposed to be torn down in 1909.',          lat: 48.858, lng: 2.295 },
    { id: 'fr-002', countryCode: 'FR', emoji: '🥐', name: 'Croissant Charm',   hint: 'In a Parisian boulangerie',             fact: 'France bakes 6 billion croissants per year.',                     lat: 48.860, lng: 2.340 },
    { id: 'fr-003', countryCode: 'FR', emoji: '🍷', name: 'Bordeaux Cork',     hint: 'In France\'s wine capital',             fact: 'Bordeaux produces over 700 million bottles of wine per year.',    lat: 44.838, lng: -0.578 },
    { id: 'fr-004', countryCode: 'FR', emoji: '🏖️', name: 'Riviera Pebble',   hint: 'On the glamorous Côte d\'Azur',         fact: 'Nice Carnival is France\'s largest festival.',                    lat: 43.710, lng: 7.261 },
    { id: 'fr-005', countryCode: 'FR', emoji: '🎨', name: 'Impressionist Brush',hint:'Near Monet\'s famous garden',           fact: 'Monet painted his Water Lilies series over 30 years.',           lat: 49.076, lng: 1.535 },
    { id: 'fr-006', countryCode: 'FR', emoji: '⚜️', name: 'Fleur-de-Lis',     hint: 'In the royal palace of Versailles',    fact: 'The Palace of Versailles has 2,300 rooms and 67 staircases.',    lat: 48.804, lng: 2.120 },
    { id: 'fr-007', countryCode: 'FR', emoji: '🏔️', name: 'Alpine Crystal',   hint: 'Near the highest peak in Europe',      fact: 'Mont Blanc at 4,808m is the Alps\' highest summit.',              lat: 45.833, lng: 6.865 },
    { id: 'fr-008', countryCode: 'FR', emoji: '🦁', name: 'Lion Coin',         hint: 'At the world\'s most visited museum',  fact: 'The Louvre has 35,000 works — it would take 100 days to see all.', lat: 48.860, lng: 2.337 },
    { id: 'fr-009', countryCode: 'FR', emoji: '🧀', name: 'Camembert Wheel',   hint: 'In the cheese heartland of Normandy',  fact: 'France produces over 1,000 types of cheese.',                    lat: 49.181, lng: -0.371 },
    { id: 'fr-010', countryCode: 'FR', emoji: '🚴', name: 'Tour de France Cap',hint: 'At the finish line in Paris',          fact: 'Tour de France covers ~3,500 km in 3 weeks.',                    lat: 48.873, lng: 2.295 },
  ],
  // Germany
  DE: [
    { id: 'de-001', countryCode: 'DE', emoji: '🍺', name: 'Oktoberfest Stein', hint: 'At the world\'s biggest beer festival', fact: 'Oktoberfest serves 7 million liters of beer every year.',         lat: 48.130, lng: 11.550 },
    { id: 'de-002', countryCode: 'DE', emoji: '🏰', name: 'Neuschwanstein Key',hint: 'At the fairytale castle',              fact: 'Neuschwanstein inspired Disney\'s Sleeping Beauty Castle.',        lat: 47.557, lng: 10.750 },
    { id: 'de-003', countryCode: 'DE', emoji: '🎄', name: 'Christmas Market Token',hint:'At Germany\'s oldest Christmas market',fact:'Nuremberg Christmas Market has existed since the 1600s.',        lat: 49.454, lng: 11.078 },
    { id: 'de-004', countryCode: 'DE', emoji: '🎻', name: 'Bach\'s Bow',       hint: 'In Leipzig, home of classical music',  fact: 'Johann Sebastian Bach worked in Leipzig for 27 years.',          lat: 51.340, lng: 12.374 },
    { id: 'de-005', countryCode: 'DE', emoji: '🚗', name: 'Autobahn Badge',    hint: 'On the world\'s most famous highway',  fact: 'About 30% of the Autobahn has no speed limit.',                   lat: 50.110, lng: 8.682 },
    { id: 'de-006', countryCode: 'DE', emoji: '🔬', name: 'Einstein\'s Formula',hint:'In Einstein\'s birthplace',            fact: 'Albert Einstein was born in Ulm, Germany in 1879.',              lat: 48.399, lng: 9.991 },
    { id: 'de-007', countryCode: 'DE', emoji: '🪖', name: 'Berlin Wall Chip', hint: 'At the most famous wall in history',    fact: 'The Berlin Wall fell on November 9, 1989.',                       lat: 52.535, lng: 13.390 },
    { id: 'de-008', countryCode: 'DE', emoji: '🌲', name: 'Black Forest Pine',hint: 'In the enchanted Black Forest',         fact: 'The Black Forest covers 6,009 km² and inspired fairy tales.',    lat: 48.060, lng: 8.160 },
    { id: 'de-009', countryCode: 'DE', emoji: '📖', name: 'Gutenberg Bible Page',hint:'Where printing was invented',         fact: 'Gutenberg\'s printing press revolutionized information in 1440.', lat: 49.999, lng: 8.274 },
    { id: 'de-010', countryCode: 'DE', emoji: '⚽', name: 'World Cup Trophy',  hint: 'At Germany\'s football stadium',       fact: 'Germany has won the FIFA World Cup 4 times.',                     lat: 52.520, lng: 13.405 },
  ],
  // Ghana
  GH: [
    { id: 'gh-001', countryCode: 'GH', emoji: '🌍', name: 'Kente Cloth Swatch',hint: 'At the center of Ghanaian culture',   fact: 'Kente cloth was originally woven only for Ashanti royalty.',     lat: 6.688, lng: -1.624 },
    { id: 'gh-002', countryCode: 'GH', emoji: '🏰', name: 'Cape Coast Stone',  hint: 'At the historic slave fort',          fact: 'Cape Coast Castle was a major transshipment point in the slave trade.', lat: 5.103, lng: -1.246 },
    { id: 'gh-003', countryCode: 'GH', emoji: '🌰', name: 'Cocoa Bean',         hint: 'In the cocoa-growing heartland',      fact: 'Ghana is the world\'s 2nd largest cocoa producer.',              lat: 7.946, lng: -1.023 },
    { id: 'gh-004', countryCode: 'GH', emoji: '⚫⭐', name: 'Black Star Token', hint: 'At the independence monument',         fact: 'Ghana became the first sub-Saharan African country to gain independence in 1957.', lat: 5.560, lng: -0.197 },
    { id: 'gh-005', countryCode: 'GH', emoji: '🐘', name: 'Elephant Tusk',     hint: 'In Mole National Park',               fact: 'Mole is Ghana\'s largest wildlife sanctuary with 90+ mammals.',   lat: 9.260, lng: -1.850 },
    { id: 'gh-006', countryCode: 'GH', emoji: '🎵', name: 'Highlife Record',    hint: 'In the music capital, Accra',         fact: 'Highlife music was born in Ghana in the early 20th century.',    lat: 5.559, lng: -0.197 },
    { id: 'gh-007', countryCode: 'GH', emoji: '🌊', name: 'Volta Lake Shell',  hint: 'At the world\'s largest man-made lake',fact: 'Lake Volta covers 3.6% of Ghana\'s total land area.',             lat: 7.000, lng: 0.500 },
    { id: 'gh-008', countryCode: 'GH', emoji: '🌿', name: 'Rainforest Leaf',    hint: 'In Kakum National Park canopy walk',  fact: 'Kakum has the only canopy walkway in Africa.',                    lat: 5.350, lng: -1.380 },
    { id: 'gh-009', countryCode: 'GH', emoji: '🥁', name: 'Fontomfrom Drum',   hint: 'In the royal Ashanti palace',         fact: 'The Fontomfrom drum is used at Ashanti royal ceremonies.',        lat: 6.691, lng: -1.615 },
    { id: 'gh-010', countryCode: 'GH', emoji: '🏖️', name: 'Labadi Beach Shell',hint: 'At Ghana\'s most famous beach',        fact: 'Labadi beach hosts Ghana\'s biggest outdoor concerts.',           lat: 5.564, lng: -0.140 },
  ],
  // Brazil
  BR: [
    { id: 'br-001', countryCode: 'BR', emoji: '✝️', name: 'Christ Blessing',   hint: 'At the famous mountain statue',        fact: 'Christ the Redeemer is struck by lightning up to 6 times per year.', lat: -22.952, lng: -43.211 },
    { id: 'br-002', countryCode: 'BR', emoji: '🎭', name: 'Carnival Mask',     hint: 'At Rio\'s famous festival site',       fact: 'Rio Carnival is the world\'s largest carnival — 2 million per day.', lat: -22.906, lng: -43.172 },
    { id: 'br-003', countryCode: 'BR', emoji: '🌿', name: 'Amazon Orchid',     hint: 'Deep in the Amazon jungle',            fact: 'The Amazon contains 10% of all species on Earth.',               lat: -3.465, lng: -62.215 },
    { id: 'br-004', countryCode: 'BR', emoji: '💧', name: 'Iguazu Droplet',    hint: 'At the widest waterfall system',       fact: 'Iguazu Falls is wider than Niagara and higher than Victoria Falls.', lat: -25.695, lng: -54.436 },
    { id: 'br-005', countryCode: 'BR', emoji: '⚽', name: 'Maracana Trophy',   hint: 'At the world\'s most famous stadium',  fact: 'Maracanã once held 200,000 fans — now limited to 78,000.',       lat: -22.912, lng: -43.230 },
    { id: 'br-006', countryCode: 'BR', emoji: '🐆', name: 'Pantanal Paw',      hint: 'In the world\'s largest wetland',      fact: 'The Pantanal has the world\'s highest concentration of jaguars.', lat: -16.350, lng: -56.450 },
    { id: 'br-007', countryCode: 'BR', emoji: '🏖️', name: 'Copacabana Sand',  hint: 'At Rio\'s most famous beach',          fact: 'Copacabana Beach is 4km long and hosts New Year\'s Eve for 2 million.', lat: -22.971, lng: -43.182 },
    { id: 'br-008', countryCode: 'BR', emoji: '🍊', name: 'Caipirinha Lime',   hint: 'In São Paulo\'s vibrant district',     fact: 'Brazil produces 97% of the world\'s açaí berries.',              lat: -23.549, lng: -46.633 },
    { id: 'br-009', countryCode: 'BR', emoji: '🌅', name: 'Salvador Dawn Stone',hint:'In the Afro-Brazilian cultural heart', fact: 'Salvador was Brazil\'s first capital city.',                      lat: -12.977, lng: -38.501 },
    { id: 'br-010', countryCode: 'BR', emoji: '🔭', name: 'Equator Marker',    hint: 'Where the equator crosses Brazil',     fact: 'Brazil is the only country to straddle both the equator and tropics.', lat: 0.0, lng: -51.066 },
  ],
  // India
  IN: [
    { id: 'in-001', countryCode: 'IN', emoji: '🕌', name: 'Taj Mahal Marble',  hint: 'At the monument to eternal love',      fact: 'The Taj Mahal took 22 years to build with 20,000 workers.',      lat: 27.175, lng: 78.042 },
    { id: 'in-002', countryCode: 'IN', emoji: '🐯', name: 'Bengal Tiger Claw', hint: 'In Jim Corbett National Park',          fact: 'India has 75% of the world\'s wild tiger population.',            lat: 29.531, lng: 78.774 },
    { id: 'in-003', countryCode: 'IN', emoji: '🧘', name: 'Yoga Stone',        hint: 'In the yoga capital of the world',      fact: 'Rishikesh is known as the "World Capital of Yoga."',             lat: 30.087, lng: 78.268 },
    { id: 'in-004', countryCode: 'IN', emoji: '🎆', name: 'Diwali Lamp',       hint: 'In Varanasi, city of lights',           fact: 'Varanasi is one of the world\'s oldest continuously inhabited cities.', lat: 25.317, lng: 83.013 },
    { id: 'in-005', countryCode: 'IN', emoji: '💎', name: 'Kohinoor Replica',  hint: 'Near the old imperial capital',         fact: 'The Kohinoor diamond was mined in India and is now in the British Crown.', lat: 28.514, lng: 77.220 },
    { id: 'in-006', countryCode: 'IN', emoji: '🌶️', name: 'Masala Spice',     hint: 'In the spice markets of Kerala',        fact: 'India produces 70% of the world\'s spices.',                     lat: 9.931, lng: 76.267 },
    { id: 'in-007', countryCode: 'IN', emoji: '🏔️', name: 'Himalayan Ice',    hint: 'At the base of the world\'s tallest mountains', fact: 'The Himalayas are rising 5mm per year.',               lat: 27.986, lng: 86.923 },
    { id: 'in-008', countryCode: 'IN', emoji: '🐘', name: 'Elephant Anklet',   hint: 'At the famous Jaipur elephant parade',  fact: 'The Jaipur Elephant Festival was celebrated for centuries.',      lat: 26.924, lng: 75.827 },
    { id: 'in-009', countryCode: 'IN', emoji: '🌅', name: 'Golden Temple Token',hint:'At the Sikh Golden Temple',             fact: 'The Golden Temple serves free meals to 100,000 people every day.', lat: 31.620, lng: 74.876 },
    { id: 'in-010', countryCode: 'IN', emoji: '🚀', name: 'ISRO Mission Patch',hint: 'At India\'s space research centre',     fact: 'India\'s Chandrayaan-3 made India the 4th country to land on the Moon.', lat: 12.977, lng: 77.591 },
  ],
  // China
  CN: [
    { id: 'cn-001', countryCode: 'CN', emoji: '🏯', name: 'Great Wall Brick',  hint: 'At the most iconic wall on Earth',     fact: 'The Great Wall stretches 13,171 miles — longer than the Earth\'s diameter.', lat: 40.432, lng: 116.570 },
    { id: 'cn-002', countryCode: 'CN', emoji: '🐉', name: 'Dragon Pearl',      hint: 'In the Forbidden City',                fact: 'The Forbidden City has 9,999 rooms — 1 less than heaven\'s 10,000.', lat: 39.916, lng: 116.390 },
    { id: 'cn-003', countryCode: 'CN', emoji: '🐼', name: 'Panda Bamboo',      hint: 'In Chengdu\'s Panda Research Base',    fact: 'Giant pandas eat 12-38kg of bamboo per day.',                     lat: 30.729, lng: 104.140 },
    { id: 'cn-004', countryCode: 'CN', emoji: '🍜', name: 'Peking Duck Stamp', hint: 'In Beijing\'s hutong streets',         fact: 'Peking Duck has been served in Beijing for over 600 years.',      lat: 39.928, lng: 116.388 },
    { id: 'cn-005', countryCode: 'CN', emoji: '🏔️', name: 'Li River Stone',   hint: 'Among the karst peaks of Guilin',      fact: 'Guilin\'s limestone mountains appear on the 20 Yuan banknote.',   lat: 25.274, lng: 110.290 },
    { id: 'cn-006', countryCode: 'CN', emoji: '🧧', name: 'Red Lantern',       hint: 'At Shanghai\'s Bund waterfront',       fact: 'Shanghai\'s Bund was once called "the Wall Street of Asia."',     lat: 31.240, lng: 121.490 },
    { id: 'cn-007', countryCode: 'CN', emoji: '🎋', name: 'Bamboo Strip',      hint: 'In the Sichuan highlands',             fact: 'China has 500+ species of bamboo — 50% of the world\'s total.',   lat: 30.059, lng: 103.792 },
    { id: 'cn-008', countryCode: 'CN', emoji: '🫖', name: 'Longjing Tea Leaf', hint: 'In the tea gardens of Hangzhou',       fact: 'China invented tea over 5,000 years ago.',                        lat: 30.243, lng: 120.155 },
    { id: 'cn-009', countryCode: 'CN', emoji: '⚔️', name: 'Terracotta Fragment',hint:'At the ancient tomb of Qin Shi Huang', fact: 'The Terracotta Army has 8,000+ warriors, each with a unique face.', lat: 34.384, lng: 109.278 },
    { id: 'cn-010', countryCode: 'CN', emoji: '🌃', name: 'Neon Sign',         hint: 'In Hong Kong\'s Kowloon district',     fact: 'Hong Kong had 100,000+ neon signs at its peak in the 1970s.',     lat: 22.317, lng: 114.171 },
  ],
  // Australia
  AU: [
    { id: 'au-001', countryCode: 'AU', emoji: '🦘', name: 'Kangaroo Token',    hint: 'On the outback plains',                fact: 'There are 2x more kangaroos than people in Australia.',           lat: -25.344, lng: 131.036 },
    { id: 'au-002', countryCode: 'AU', emoji: '🏄', name: 'Bondi Surf Badge',  hint: 'At Australia\'s most famous beach',    fact: 'Bondi Beach gets 2.5 million visitors per year.',                lat: -33.891, lng: 151.275 },
    { id: 'au-003', countryCode: 'AU', emoji: '🐠', name: 'Reef Coral',        hint: 'At the world\'s largest reef',         fact: 'The Great Barrier Reef is visible from space.',                   lat: -18.286, lng: 147.700 },
    { id: 'au-004', countryCode: 'AU', emoji: '🎭', name: 'Opera House Tile',  hint: 'At the iconic harbor building',        fact: 'Sydney Opera House has 1,056,006 ceramic tiles on its roof.',     lat: -33.857, lng: 151.215 },
    { id: 'au-005', countryCode: 'AU', emoji: '🌵', name: 'Uluru Ochre',       hint: 'At the sacred red monolith',           fact: 'Uluru is 348m tall and 9.4km around — mostly underground.',       lat: -25.344, lng: 131.036 },
    { id: 'au-006', countryCode: 'AU', emoji: '🐨', name: 'Koala Eucalyptus',  hint: 'In Queensland\'s rainforest',           fact: 'Koalas sleep 18-22 hours a day — eucalyptus is hard to digest.',  lat: -16.923, lng: 145.770 },
    { id: 'au-007', countryCode: 'AU', emoji: '⚡', name: 'Lightning Badge',   hint: 'In the lightning capital of Australia', fact: 'Darwin averages 80 thunderstorm days per year.',                 lat: -12.462, lng: 130.844 },
    { id: 'au-008', countryCode: 'AU', emoji: '🍷', name: 'Barossa Cork',      hint: 'In Australia\'s wine valley',          fact: 'Barossa Valley has vines over 150 years old.',                    lat: -34.529, lng: 138.956 },
    { id: 'au-009', countryCode: 'AU', emoji: '🌈', name: 'Rainbow Serpent Scale',hint:'In Aboriginal sacred country',       fact: 'The Rainbow Serpent is one of the oldest religious beliefs on Earth.', lat: -23.700, lng: 133.880 },
    { id: 'au-010', countryCode: 'AU', emoji: '🎠', name: 'Melbourne Tram Token',hint:'On Melbourne\'s iconic tram network', fact: 'Melbourne has the world\'s largest tram network outside Europe.',  lat: -37.814, lng: 144.963 },
  ],
  // Canada
  CA: [
    { id: 'ca-001', countryCode: 'CA', emoji: '🍁', name: 'Maple Leaf',        hint: 'In the autumn forests of Ontario',     fact: 'Canada produces 71% of the world\'s pure maple syrup.',           lat: 45.421, lng: -75.697 },
    { id: 'ca-002', countryCode: 'CA', emoji: '💦', name: 'Niagara Stone',     hint: 'At the thundering falls',              fact: 'Niagara Falls moves 3 feet upstream every year due to erosion.',  lat: 43.082, lng: -79.074 },
    { id: 'ca-003', countryCode: 'CA', emoji: '🧊', name: 'Glacial Ice',       hint: 'In the Rocky Mountain national parks', fact: 'The Athabasca Glacier retreats 5m per year due to climate change.', lat: 52.185, lng: -117.152 },
    { id: 'ca-004', countryCode: 'CA', emoji: '🐻', name: 'Grizzly Claw',      hint: 'In the wilderness of British Columbia', fact: 'Canada has more bears per capita than any other country.',         lat: 51.046, lng: -114.058 },
    { id: 'ca-005', countryCode: 'CA', emoji: '🏒', name: 'Hockey Puck',       hint: 'In the birthplace of hockey',          fact: 'Ice hockey was first played in Windsor, Nova Scotia in 1800.',    lat: 44.646, lng: -63.598 },
    { id: 'ca-006', countryCode: 'CA', emoji: '🌌', name: 'Aurora Token',      hint: 'Under the northern lights in Yukon',   fact: 'Yukon sees northern lights on average 240 nights per year.',      lat: 60.721, lng: -135.057 },
    { id: 'ca-007', countryCode: 'CA', emoji: '🦦', name: 'Otter Shell',       hint: 'On the Pacific coast of Vancouver Island', fact: 'Sea otters hold hands while sleeping so they don\'t drift apart.', lat: 49.160, lng: -123.937 },
    { id: 'ca-008', countryCode: 'CA', emoji: '🌾', name: 'Wheat Grain',       hint: 'In the vast Saskatchewan prairies',    fact: 'Saskatchewan produces 50% of Canada\'s wheat.',                  lat: 52.133, lng: -106.670 },
    { id: 'ca-009', countryCode: 'CA', emoji: '🎺', name: 'Jazz Token',        hint: 'At the Montreal Jazz Festival',        fact: 'Montreal International Jazz Festival is the world\'s largest jazz event.', lat: 45.509, lng: -73.554 },
    { id: 'ca-010', countryCode: 'CA', emoji: '🗼', name: 'CN Tower Key',     hint: 'At Toronto\'s iconic tower',            fact: 'CN Tower was the world\'s tallest free-standing structure for 32 years.', lat: 43.642, lng: -79.387 },
  ],
  // Mexico
  MX: [
    { id: 'mx-001', countryCode: 'MX', emoji: '🗿', name: 'Mayan Obsidian',    hint: 'At Chichén Itzá pyramid',              fact: 'Chichén Itzá was a UNESCO World Heritage site since 1988.',        lat: 20.683, lng: -88.569 },
    { id: 'mx-002', countryCode: 'MX', emoji: '🌵', name: 'Cactus Spine',      hint: 'In the Sonoran Desert',                fact: 'The saguaro cactus grows just 1 inch in its first 10 years.',    lat: 29.200, lng: -110.300 },
    { id: 'mx-003', countryCode: 'MX', emoji: '🎨', name: 'Frida\'s Palette',  hint: 'At La Casa Azul in Mexico City',       fact: 'Frida Kahlo made 143 paintings, 55 of which are self-portraits.', lat: 19.355, lng: -99.163 },
    { id: 'mx-004', countryCode: 'MX', emoji: '🦋', name: 'Monarch Butterfly', hint: 'At the Monarch Butterfly Biosphere',   fact: '1 billion monarch butterflies migrate to Mexico each winter.',    lat: 19.636, lng: -100.273 },
    { id: 'mx-005', countryCode: 'MX', emoji: '🌮', name: 'Taco Token',        hint: 'In the street food capital',           fact: 'Mexico City has more taco stands than any other city on Earth.',  lat: 19.432, lng: -99.133 },
    { id: 'mx-006', countryCode: 'MX', emoji: '🐋', name: 'Gray Whale Fin',   hint: 'In Baja California lagoons',           fact: 'Baja lagoons are the only place gray whales let humans touch them.', lat: 27.650, lng: -114.150 },
    { id: 'mx-007', countryCode: 'MX', emoji: '🏝️', name: 'Cenote Crystal',   hint: 'In the Yucatán underground pools',     fact: 'The Yucatán has 6,000+ cenotes — sacred to the ancient Maya.',    lat: 20.450, lng: -87.450 },
    { id: 'mx-008', countryCode: 'MX', emoji: '🎉', name: 'Día de Muertos Marigold',hint:'During the Day of the Dead festival',fact:'Day of the Dead predates Spanish colonization by 3,000 years.',  lat: 19.436, lng: -99.132 },
    { id: 'mx-009', countryCode: 'MX', emoji: '🌋', name: 'Popocatépetl Ash', hint: 'Near the active volcano',               fact: 'Popocatépetl erupts thousands of times per year.',                lat: 19.023, lng: -98.627 },
    { id: 'mx-010', countryCode: 'MX', emoji: '🎭', name: 'Lucha Libre Mask',  hint: 'At the wrestling arena in Mexico City', fact: 'Lucha Libre has been part of Mexican culture since the 1860s.',   lat: 19.451, lng: -99.148 },
  ],
  // South Africa
  ZA: [
    { id: 'za-001', countryCode: 'ZA', emoji: '🦁', name: 'Lion Pride Token',  hint: 'In Kruger National Park',              fact: 'Kruger National Park is home to the Big Five: lion, leopard, rhino, elephant, buffalo.', lat: -23.992, lng: 31.556 },
    { id: 'za-002', countryCode: 'ZA', emoji: '💎', name: 'Diamond Rough',     hint: 'In Kimberley, the diamond capital',    fact: 'The Kimberley Big Hole was dug entirely by hand — 50,000 miners.', lat: -28.734, lng: 24.762 },
    { id: 'za-003', countryCode: 'ZA', emoji: '🌊', name: 'Cape Storm Stone',  hint: 'At the Cape of Good Hope',             fact: 'The Cape of Good Hope is NOT Africa\'s southernmost point — Cape Agulhas is.', lat: -34.357, lng: 18.472 },
    { id: 'za-004', countryCode: 'ZA', emoji: '🦓', name: 'Zebra Stripe',      hint: 'In the mountain zebra national park',  fact: 'No two zebras have the same stripe pattern — like human fingerprints.', lat: -31.683, lng: 25.433 },
    { id: 'za-005', countryCode: 'ZA', emoji: '🏔️', name: 'Table Mountain Rock',hint:'At the flat-topped mountain in Cape Town',fact:'Table Mountain is one of the world\'s oldest mountains — 600 million years old.', lat: -33.963, lng: 18.404 },
    { id: 'za-006', countryCode: 'ZA', emoji: '✊', name: 'Mandela Freedom Key',hint:'At Robben Island',                     fact: 'Nelson Mandela was imprisoned on Robben Island for 18 years.',    lat: -33.806, lng: 18.367 },
    { id: 'za-007', countryCode: 'ZA', emoji: '🌺', name: 'Protea Flower',     hint: 'In the Cape Floral Kingdom',           fact: 'The Cape Floral Kingdom is the world\'s smallest but richest plant kingdom.', lat: -34.354, lng: 18.474 },
    { id: 'za-008', countryCode: 'ZA', emoji: '🎵', name: 'Zulu Drum',         hint: 'In KwaZulu-Natal highlands',           fact: 'The Zulu nation has a vibrant oral tradition spanning centuries.',lat: -29.116, lng: 31.549 },
    { id: 'za-009', countryCode: 'ZA', emoji: '🌍', name: 'Cradle of Humankind Fossil',hint:'At the cradle of humanity',    fact: 'South Africa\'s Cradle of Humankind has the densest collection of human ancestor fossils.', lat: -26.025, lng: 27.758 },
    { id: 'za-010', countryCode: 'ZA', emoji: '🍷', name: 'Stellenbosch Grape',hint: 'In the Cape Winelands',               fact: 'South Africa has been making wine since 1659.',                   lat: -33.935, lng: 18.860 },
  ],
  // Italy
  IT: [
    { id: 'it-001', countryCode: 'IT', emoji: '🏛️', name: 'Colosseum Coin',   hint: 'At ancient Rome\'s grand arena',       fact: 'The Colosseum could fill or drain its water for mock naval battles.', lat: 41.890, lng: 12.492 },
    { id: 'it-002', countryCode: 'IT', emoji: '🍕', name: 'Neapolitan Token',  hint: 'In the birthplace of pizza',           fact: 'Pizza was invented in Naples in the late 1800s.',                 lat: 40.851, lng: 14.268 },
    { id: 'it-003', countryCode: 'IT', emoji: '🎨', name: 'Da Vinci Brush',    hint: 'In Florence\'s Uffizi Gallery',        fact: 'The Mona Lisa is actually quite small — 77cm × 53cm.',           lat: 43.768, lng: 11.256 },
    { id: 'it-004', countryCode: 'IT', emoji: '🚣', name: 'Gondola Oar',       hint: 'In Venice\'s Grand Canal',             fact: 'Venice is sinking at about 1-2mm per year.',                     lat: 45.434, lng: 12.338 },
    { id: 'it-005', countryCode: 'IT', emoji: '🌋', name: 'Vesuvius Ash',      hint: 'Near the volcano that buried Pompeii', fact: 'Vesuvius buried Pompeii under 6m of ash in just 24 hours in 79 AD.', lat: 40.821, lng: 14.426 },
    { id: 'it-006', countryCode: 'IT', emoji: '⛪', name: 'Vatican Coin',      hint: 'In the world\'s smallest country',     fact: 'Vatican City is the smallest country in the world at 0.44 km².',  lat: 41.902, lng: 12.453 },
    { id: 'it-007', countryCode: 'IT', emoji: '🍝', name: 'Bologna Recipe',    hint: 'In the food capital of Italy',         fact: 'Bolognese sauce (ragù) has a protected recipe registered with the Chamber of Commerce.', lat: 44.494, lng: 11.342 },
    { id: 'it-008', countryCode: 'IT', emoji: '🏰', name: 'Doge\'s Key',       hint: 'At Venice\'s Palace of the Doges',     fact: 'The Doge\'s Palace was home to Venice\'s rulers for 1,000 years.',lat: 45.434, lng: 12.340 },
    { id: 'it-009', countryCode: 'IT', emoji: '⚽', name: 'Azzurri Badge',     hint: 'At the San Siro stadium',              fact: 'Italy has won the FIFA World Cup 4 times.',                       lat: 45.478, lng: 9.124 },
    { id: 'it-010', countryCode: 'IT', emoji: '🍋', name: 'Amalfi Lemon',      hint: 'On the Amalfi Coast cliff roads',      fact: 'Amalfi Coast lemons are so big they\'re called "sfusato amalfitano."', lat: 40.634, lng: 14.603 },
  ],
  // Nigeria
  NG: [
    { id: 'ng-001', countryCode: 'NG', emoji: '🌍', name: 'Nollywood Clapboard',hint:'In Lagos, the film capital',           fact: 'Nollywood is the world\'s 2nd largest film industry by volume.', lat: 6.455, lng: 3.384 },
    { id: 'ng-002', countryCode: 'NG', emoji: '🥁', name: 'Talking Drum',      hint: 'In the Yoruba cultural heartland',     fact: 'Talking drums can communicate messages miles away.',              lat: 7.388, lng: 3.897 },
    { id: 'ng-003', countryCode: 'NG', emoji: '🫒', name: 'Niger Delta Drop',  hint: 'At the Niger River delta',             fact: 'The Niger Delta is one of the world\'s largest river deltas.',   lat: 5.350, lng: 5.700 },
    { id: 'ng-004', countryCode: 'NG', emoji: '🏟️', name: 'Abuja Stadium Badge',hint:'At the Nigerian capital\'s stadium',  fact: 'Abuja became Nigeria\'s capital in 1991, replacing Lagos.',       lat: 9.082, lng: 7.491 },
    { id: 'ng-005', countryCode: 'NG', emoji: '🦅', name: 'Eagle of Nigeria',  hint: 'At Zuma Rock, the face of Nigeria',    fact: 'Zuma Rock is a 725m monolith and appears on the 100 Naira note.', lat: 9.279, lng: 7.192 },
    { id: 'ng-006', countryCode: 'NG', emoji: '🌿', name: 'Okomu Leaf',        hint: 'In Okomu National Park',               fact: 'Okomu is home to the highly endangered white-throated monkey.',   lat: 6.272, lng: 5.462 },
    { id: 'ng-007', countryCode: 'NG', emoji: '🎵', name: 'Afrobeats Record',   hint: 'In Lagos music scene',                fact: 'Nigerian Afrobeats reached #1 in 50+ countries in the 2020s.',   lat: 6.524, lng: 3.379 },
    { id: 'ng-008', countryCode: 'NG', emoji: '🏺', name: 'Nok Terracotta',    hint: 'At the Nok archaeological site',       fact: 'The Nok civilization made terracotta sculptures 2,500 years ago.', lat: 9.874, lng: 8.436 },
    { id: 'ng-009', countryCode: 'NG', emoji: '🌊', name: 'Lagos Lagoon Shell',hint: 'On Lagos Island waterfront',            fact: 'Lagos Lagoon is the largest lagoon in West Africa.',              lat: 6.453, lng: 3.396 },
    { id: 'ng-010', countryCode: 'NG', emoji: '⛪', name: 'Benin Bronze Head',  hint: 'At the ancient Benin City palace',     fact: 'Benin City\'s Benin Bronzes are considered masterpieces of world art.', lat: 6.336, lng: 5.628 },
  ],
  // Egypt
  EG: [
    { id: 'eg-001', countryCode: 'EG', emoji: '🔺', name: 'Pyramid Stone',     hint: 'At the Great Pyramid of Giza',         fact: 'The Great Pyramid was the world\'s tallest structure for 3,800 years.', lat: 29.976, lng: 31.131 },
    { id: 'eg-002', countryCode: 'EG', emoji: '🐱', name: 'Sphinx Riddle',     hint: 'Beside the limestone giant',           fact: 'The Sphinx\'s nose was likely damaged by target practice centuries ago.', lat: 29.975, lng: 31.137 },
    { id: 'eg-003', countryCode: 'EG', emoji: '🌊', name: 'Nile Reed',         hint: 'Along the life-giving river',          fact: 'The Nile is the world\'s longest river at 6,650km.',              lat: 30.064, lng: 31.249 },
    { id: 'eg-004', countryCode: 'EG', emoji: '📜', name: 'Papyrus Scroll',    hint: 'At the Egyptian Museum',               fact: 'The Egyptian Museum holds 120,000+ artifacts.',                   lat: 30.048, lng: 31.233 },
    { id: 'eg-005', countryCode: 'EG', emoji: '🏛️', name: 'Alexandria Column', hint: 'At the ancient lighthouse site',       fact: 'The Library of Alexandria once held 500,000 scrolls.',            lat: 31.200, lng: 29.919 },
    { id: 'eg-006', countryCode: 'EG', emoji: '🌅', name: 'Desert Rose Crystal',hint:'In the Western Desert',                fact: 'Egypt\'s Western Desert contains over a million square kilometers of sand.', lat: 27.250, lng: 28.210 },
    { id: 'eg-007', countryCode: 'EG', emoji: '⚓', name: 'Suez Canal Token',   hint: 'At the crossroads of continents',     fact: 'The Suez Canal carries 12% of global trade.',                    lat: 30.583, lng: 32.265 },
    { id: 'eg-008', countryCode: 'EG', emoji: '🦅', name: 'Horus Eye',         hint: 'At the Temple of Edfu',                fact: 'The Temple of Edfu is the best-preserved ancient Egyptian temple.', lat: 24.977, lng: 32.874 },
    { id: 'eg-009', countryCode: 'EG', emoji: '🏺', name: 'Canopic Jar',       hint: 'In Luxor\'s Valley of the Kings',      fact: 'Over 60 pharaohs were buried in the Valley of the Kings.',        lat: 25.740, lng: 32.601 },
    { id: 'eg-010', countryCode: 'EG', emoji: '🐊', name: 'Crocodile Scale',   hint: 'Near the temples of Abu Simbel',       fact: 'Crocodiles were sacred to the god Sobek in ancient Egypt.',       lat: 22.337, lng: 31.626 },
  ],
  // Russia
  RU: [
    { id: 'ru-001', countryCode: 'RU', emoji: '🏯', name: 'Kremlin Brick',     hint: 'At the heart of Moscow',               fact: 'The Moscow Kremlin has 20 towers and 4 gates.',                   lat: 55.752, lng: 37.615 },
    { id: 'ru-002', countryCode: 'RU', emoji: '🎨', name: 'Matryoshka Doll',   hint: 'In a Moscow souvenir market',          fact: 'The largest matryoshka nesting doll set has 51 pieces.',          lat: 55.754, lng: 37.620 },
    { id: 'ru-003', countryCode: 'RU', emoji: '🌊', name: 'Baikal Water',      hint: 'At the world\'s deepest lake',         fact: 'Lake Baikal holds 20% of the world\'s unfrozen fresh water.',     lat: 53.500, lng: 108.000 },
    { id: 'ru-004', countryCode: 'RU', emoji: '🐻', name: 'Siberian Bear Claw',hint: 'In the taiga forest of Siberia',        fact: 'Siberia covers 77% of Russia — 9% of the world\'s land area.',   lat: 60.000, lng: 100.000 },
    { id: 'ru-005', countryCode: 'RU', emoji: '🚅', name: 'Trans-Siberian Ticket',hint:'On the world\'s longest railway',    fact: 'Trans-Siberian Railway is 9,289km long — takes 7 days.',         lat: 55.797, lng: 49.106 },
    { id: 'ru-006', countryCode: 'RU', emoji: '🎭', name: 'Bolshoi Ballet Slipper',hint:'At the Bolshoi Theatre',            fact: 'The Bolshoi Theatre was founded in 1776.',                        lat: 55.760, lng: 37.619 },
    { id: 'ru-007', countryCode: 'RU', emoji: '🚀', name: 'Sputnik Replica',   hint: 'At the Baikonur space launch site',    fact: 'Sputnik was the first satellite — launched Oct 4, 1957.',         lat: 45.920, lng: 63.342 },
    { id: 'ru-008', countryCode: 'RU', emoji: '❄️', name: 'Permafrost Crystal',hint: 'In Norilsk, the world\'s coldest city',fact: 'Norilsk reaches -55°C in winter — permanently frozen ground.', lat: 69.332, lng: 88.215 },
    { id: 'ru-009', countryCode: 'RU', emoji: '🌋', name: 'Kamchatka Ember',   hint: 'At Kamchatka\'s volcanic peninsula',  fact: 'Kamchatka has 160 volcanoes, 29 active.',                        lat: 53.007, lng: 158.701 },
    { id: 'ru-010', countryCode: 'RU', emoji: '🎯', name: 'Chess King',        hint: 'In the chess capital of the world',    fact: 'Russia has produced more world chess champions than any other country.', lat: 59.938, lng: 30.314 },
  ],
};

// Get all trinkets for a country (returns empty array if not in database)
export function getTrinketsForCountry(code: string): Trinket[] {
  return COUNTRY_TRINKETS[code] ?? [];
}

// Get total number of trinkets across all countries
export function getTotalTrinketCount(): number {
  return Object.values(COUNTRY_TRINKETS).reduce((sum, arr) => sum + arr.length, 0);
}
