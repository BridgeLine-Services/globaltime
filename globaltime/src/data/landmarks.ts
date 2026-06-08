export interface Landmark {
  id: string;
  name: string;
  emoji: string;
  lat: number;
  lng: number;
  country: string;
  type: 'wonder' | 'nature' | 'city' | 'quirky' | 'space';
  fact: string;
  color: string; // hex for marker glow
}

export const LANDMARKS: Landmark[] = [
  // Wonders & Icons
  { id: 'eiffel',      name: 'Eiffel Tower',        emoji: '🗼', lat: 48.858,  lng: 2.295,    country: 'France',        type: 'wonder',  fact: 'Grows 15cm taller in summer due to thermal expansion!', color: '#ffd700' },
  { id: 'great-wall',  name: 'Great Wall of China',  emoji: '🏯', lat: 40.432,  lng: 116.570,  country: 'China',         type: 'wonder',  fact: 'Long enough to circle Earth\'s equator 1.5 times.', color: '#ff8800' },
  { id: 'pyramids',    name: 'Pyramids of Giza',      emoji: '🔺', lat: 29.976,  lng: 31.131,   country: 'Egypt',         type: 'wonder',  fact: 'Built with 2.3 million stone blocks, each ~2.5 tons.', color: '#ffcc00' },
  { id: 'colosseum',   name: 'The Colosseum',         emoji: '🏛️', lat: 41.890,  lng: 12.492,   country: 'Italy',         type: 'wonder',  fact: 'Could hold 80,000 spectators — bigger than many NFL stadiums.', color: '#e8b89a' },
  { id: 'machu',       name: 'Machu Picchu',          emoji: '🏔️', lat: -13.163, lng: -72.545,  country: 'Peru',          type: 'wonder',  fact: 'Sits at 2,430m altitude — a lost city rediscovered in 1911.', color: '#00cc88' },
  { id: 'tajmahal',    name: 'Taj Mahal',             emoji: '🕌', lat: 27.175,  lng: 78.042,   country: 'India',         type: 'wonder',  fact: 'Built by 20,000 workers over 22 years as a monument to love.', color: '#ffffff' },
  { id: 'petra',       name: 'Petra',                 emoji: '🏺', lat: 30.329,  lng: 35.444,   country: 'Jordan',        type: 'wonder',  fact: 'A rose-red city half as old as time — carved into cliffs.', color: '#ff6644' },
  { id: 'chichen',     name: 'Chichén Itzá',          emoji: '🗿', lat: 20.683,  lng: -88.569,  country: 'Mexico',        type: 'wonder',  fact: 'On each equinox, a snake-shadow slithers down its steps.', color: '#ddaa44' },
  { id: 'christ',      name: 'Christ the Redeemer',   emoji: '✝️', lat: -22.952, lng: -43.211,  country: 'Brazil',        type: 'wonder',  fact: 'Struck by lightning an average of 3-6 times per year.', color: '#ffffff' },
  { id: 'colossus',    name: 'Statue of Liberty',     emoji: '🗽', lat: 40.690,  lng: -74.045,  country: 'USA',           type: 'wonder',  fact: 'Her crown\'s 7 spikes represent the 7 seas and continents.', color: '#00aa88' },
  { id: 'stonehenge',  name: 'Stonehenge',            emoji: '🪨', lat: 51.179,  lng: -1.826,   country: 'UK',            type: 'wonder',  fact: 'Some stones were transported 200 miles — prehistoric mystery!', color: '#aaaaaa' },
  { id: 'burj',        name: 'Burj Khalifa',          emoji: '🏙️', lat: 25.197,  lng: 55.274,   country: 'UAE',           type: 'city',    fact: 'The top floors experience sunrise ~3 minutes later than the ground!', color: '#00ccff' },
  { id: 'sydney-opera',name: 'Sydney Opera House',    emoji: '🎭', lat: -33.857, lng: 151.215,  country: 'Australia',     type: 'wonder',  fact: 'The roof tiles are self-cleaning, washed by rain.', color: '#ffffff' },
  { id: 'big-ben',     name: 'Big Ben',               emoji: '🕰️', lat: 51.500,  lng: -0.124,   country: 'UK',           type: 'city',    fact: 'The real name is the Elizabeth Tower — Big Ben is just the bell.', color: '#ffd700' },
  { id: 'acropolis',   name: 'Acropolis of Athens',   emoji: '🏛️', lat: 37.971,  lng: 23.726,   country: 'Greece',        type: 'wonder',  fact: 'Has survived earthquakes, sieges, and a gunpowder explosion.', color: '#ffe4b5' },

  // Nature wonders
  { id: 'everest',     name: 'Mount Everest',         emoji: '🏔️', lat: 27.986,  lng: 86.923,   country: 'Nepal',         type: 'nature',  fact: 'Grows about 4mm every year as tectonic plates push up.', color: '#aaddff' },
  { id: 'amazon',      name: 'Amazon Rainforest',     emoji: '🌿', lat: -3.465,  lng: -62.215,  country: 'Brazil',        type: 'nature',  fact: 'Produces 20% of the world\'s oxygen — the lungs of the Earth.', color: '#00ff44' },
  { id: 'aurora',      name: 'Northern Lights Zone',  emoji: '🌌', lat: 69.660,  lng: 18.956,   country: 'Norway',        type: 'nature',  fact: 'Best seen between 10pm–2am when the sky is darkest.', color: '#44ffaa' },
  { id: 'niagara',     name: 'Niagara Falls',         emoji: '💦', lat: 43.082,  lng: -79.074,  country: 'Canada/USA',    type: 'nature',  fact: 'Moves ~3 feet upstream every year due to erosion.', color: '#00aaff' },
  { id: 'grand-canyon',name: 'Grand Canyon',          emoji: '🏜️', lat: 36.106,  lng: -112.113, country: 'USA',           type: 'nature',  fact: '277 miles long, up to 18 miles wide, over a mile deep.', color: '#cc4400' },
  { id: 'sahara',      name: 'Sahara Desert',         emoji: '🏜️', lat: 23.416,  lng: 25.663,   country: 'Africa',        type: 'nature',  fact: 'It snowed in the Sahara in 2018 — the third time in 40 years!', color: '#ffdd44' },
  { id: 'dead-sea',    name: 'Dead Sea',              emoji: '🧂', lat: 31.500,  lng: 35.500,   country: 'Jordan/Israel', type: 'nature',  fact: 'So salty you float without effort — 34% salinity vs 3.5% ocean.', color: '#aaddff' },
  { id: 'victoria',    name: 'Victoria Falls',        emoji: '🌊', lat: -17.924, lng: 25.857,   country: 'Zimbabwe',      type: 'nature',  fact: 'Widest waterfall on Earth — 1,708m across!', color: '#0088ff' },
  { id: 'great-barrier',name:'Great Barrier Reef',    emoji: '🐠', lat: -18.286, lng: 147.700,  country: 'Australia',     type: 'nature',  fact: 'Visible from space — the largest living structure on Earth.', color: '#ff6688' },
  { id: 'kilimanjaro', name: 'Mt. Kilimanjaro',       emoji: '⛰️', lat: -3.065,  lng: 37.359,   country: 'Tanzania',      type: 'nature',  fact: 'Africa\'s highest peak — a free-standing volcano with 3 cones.', color: '#ffffff' },
  { id: 'antarctica',  name: 'South Pole',            emoji: '🧊', lat: -90.0,   lng: 0.0,      country: 'Antarctica',    type: 'nature',  fact: '98% of Antarctica is covered by ice averaging 1.9km thick.', color: '#cceeff' },
  { id: 'galap',       name: 'Galápagos Islands',     emoji: '🦎', lat: -0.900,  lng: -89.600,  country: 'Ecuador',       type: 'nature',  fact: 'Darwin\'s lab — species here found nowhere else on Earth.', color: '#00dd88' },
  { id: 'ayers-rock',  name: 'Uluru (Ayers Rock)',    emoji: '🏔️', lat: -25.344, lng: 131.036,  country: 'Australia',     type: 'nature',  fact: 'Changes color dramatically at sunrise and sunset.', color: '#ff4400' },

  // Cities & culture
  { id: 'tokyo',       name: 'Tokyo, Japan',          emoji: '🗾', lat: 35.690,  lng: 139.692,  country: 'Japan',         type: 'city',    fact: 'World\'s largest metro area — 37 million people!', color: '#ff66aa' },
  { id: 'venice',      name: 'Venice Canals',         emoji: '🚣', lat: 45.434,  lng: 12.338,   country: 'Italy',         type: 'city',    fact: 'Built on 118 small islands connected by 400+ bridges.', color: '#0077ff' },
  { id: 'dubai-palm',  name: 'Palm Jumeirah',         emoji: '🌴', lat: 25.112,  lng: 55.139,   country: 'UAE',           type: 'city',    fact: 'Man-made island visible from space — shaped like a palm tree.', color: '#ffaa00' },
  { id: 'rio',         name: 'Rio de Janeiro',        emoji: '🌴', lat: -22.906, lng: -43.172,  country: 'Brazil',        type: 'city',    fact: 'Carnival attracts 2 million people per day for 5 days.', color: '#ff6600' },
  { id: 'angkor',      name: 'Angkor Wat',            emoji: '🛕', lat: 13.412,  lng: 103.867,  country: 'Cambodia',      type: 'wonder',  fact: 'World\'s largest religious monument — built in the 12th century.', color: '#ffaa44' },
  { id: 'alhambra',    name: 'Alhambra Palace',       emoji: '🏰', lat: 37.176,  lng: -3.588,   country: 'Spain',         type: 'wonder',  fact: 'A Moorish palace built entirely without nails — interlocking stone.', color: '#dd8833' },

  // Quirky & fun
  { id: 'area51',      name: 'Area 51',               emoji: '👽', lat: 37.235,  lng: -115.811, country: 'USA',           type: 'quirky',  fact: 'The CIA didn\'t officially acknowledge its existence until 2013!', color: '#44ff44' },
  { id: 'bermuda',     name: 'Bermuda Triangle',      emoji: '🔺', lat: 25.000,  lng: -71.000,  country: 'Atlantic',      type: 'quirky',  fact: 'Lloyd\'s of London doesn\'t charge extra insurance for ships here.', color: '#8844ff' },
  { id: 'magnetic',    name: 'Magnetic Hill',         emoji: '🧲', lat: 46.293,  lng: -64.868,  country: 'Canada',        type: 'quirky',  fact: 'Cars appear to roll uphill on their own — it\'s an optical illusion!', color: '#ff44aa' },
  { id: 'darvaza',     name: 'Door to Hell',          emoji: '🔥', lat: 40.252,  lng: 58.440,   country: 'Turkmenistan',  type: 'quirky',  fact: 'A burning gas crater that\'s been on fire since 1971!', color: '#ff3300' },
  { id: 'easter',      name: 'Easter Island',         emoji: '🗿', lat: -27.112, lng: -109.349, country: 'Chile',         type: 'quirky',  fact: 'The statues (Moai) have full buried bodies — not just heads!', color: '#aa8866' },
  { id: 'crooked-forest',name:'Crooked Forest',       emoji: '🌲', lat: 53.350,  lng: 14.470,   country: 'Poland',        type: 'quirky',  fact: '400 pine trees bent at 90° — nobody knows why!', color: '#00aa44' },
  { id: 'spotted-lake',name: 'Spotted Lake',         emoji: '🎨', lat: 49.083,  lng: -119.583, country: 'Canada',        type: 'quirky',  fact: 'Dries into colorful spots in summer — each a different mineral.', color: '#aadd00' },
  { id: 'socotra',     name: 'Socotra Island',        emoji: '🌳', lat: 12.463,  lng: 53.823,   country: 'Yemen',         type: 'quirky',  fact: 'Home to the dragon blood tree — looks like it\'s from another planet!', color: '#ff2244' },
  { id: 'gnomepark',   name: 'Gnome Village',         emoji: '🧙', lat: 51.107,  lng: 17.038,   country: 'Poland',        type: 'quirky',  fact: 'Wrocław has 350+ tiny bronze gnome statues hidden around the city.', color: '#ff6644' },
  { id: 'salar',       name: 'Salar de Uyuni',        emoji: '🪞', lat: -20.143, lng: -67.489,  country: 'Bolivia',       type: 'nature',  fact: 'World\'s largest salt flat — becomes a giant mirror when flooded.', color: '#ffffff' },
  { id: 'richat',      name: 'Eye of Africa',         emoji: '👁️', lat: 21.124,  lng: -11.399,  country: 'Mauritania',    type: 'quirky',  fact: 'A 50km wide geological bullseye visible from the ISS.', color: '#cc8800' },
  { id: 'tianzi',      name: 'Tianzi Mountains',      emoji: '🏔️', lat: 29.325,  lng: 110.436,  country: 'China',         type: 'nature',  fact: 'Inspired the floating mountains in Avatar — and they actually float in fog!', color: '#88ffaa' },
  { id: 'cappadocia',  name: 'Cappadocia',            emoji: '🎈', lat: 38.643,  lng: 34.829,   country: 'Turkey',        type: 'quirky',  fact: 'Fairy chimney rock formations — people lived inside them!', color: '#ffaa44' },
  { id: 'pamukkale',   name: 'Pamukkale Terraces',    emoji: '🤍', lat: 37.920,  lng: 29.119,   country: 'Turkey',        type: 'nature',  fact: 'Thermal pools over white calcium terraces — Cotton Castle.', color: '#eeeeff' },

  // Space / extreme
  { id: 'ksc',         name: 'Kennedy Space Center',  emoji: '🚀', lat: 28.524,  lng: -80.651,  country: 'USA',           type: 'space',   fact: 'Launch point for the Moon missions — and the ISS resupply runs.', color: '#00aaff' },
  { id: 'baikonur',    name: 'Baikonur Cosmodrome',   emoji: '🛸', lat: 45.965,  lng: 63.305,   country: 'Kazakhstan',    type: 'space',   fact: 'World\'s first spaceport — Yuri Gagarin launched from here in 1961.', color: '#8866ff' },
  { id: 'arecibo',     name: 'Arecibo (old site)',    emoji: '📡', lat: 18.344,  lng: -66.752,  country: 'Puerto Rico',   type: 'space',   fact: 'The giant radio telescope that searched for alien signals for 57 years.', color: '#44ddff' },
  { id: 'cerro',       name: 'ALMA Observatory',      emoji: '🔭', lat: -23.029, lng: -67.755,  country: 'Chile',         type: 'space',   fact: 'Highest major telescope on Earth at 5,000m — needs oxygen for staff!', color: '#aaaaff' },
];
