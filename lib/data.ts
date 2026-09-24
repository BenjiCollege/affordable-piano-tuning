// Content data lifted from the design prototype's injectStatic().

export type Service = { num: string; title: string; copy: string };

export const services: Service[] = [
  { num: "01", title: "Piano Tuning", copy: "Concert-pitch tuning at A-440, refined unison by unison for a clear, singing tone." },
  { num: "02", title: "Pitch Correction", copy: "Bringing neglected or flat pianos back up to standard with a careful, staged raise." },
  { num: "03", title: "Maintenance", copy: "Cleaning, lubrication, and adjustment to keep the action responsive and quiet." },
  { num: "04", title: "Voicing", copy: "Shaping the hammers so the piano speaks evenly from a whisper to full volume." },
  { num: "05", title: "Tone Regulation", copy: "Balancing brightness and warmth across the keyboard to suit your room." },
  { num: "06", title: "Seasonal Care", copy: "Twice-yearly visits timed to Texas humidity swings to hold pitch year-round." },
  { num: "07", title: "Minor Repairs", copy: "Sticking keys, broken strings, and worn parts repaired on the spot when possible." },
  { num: "08", title: "Performance Prep", copy: "On-site fine tuning and voicing before recitals, services, and recordings." },
];

export const cities: string[] = [
  "San Antonio",
  "Alamo Heights",
  "Stone Oak",
  "Helotes",
  "Boerne",
  "New Braunfels",
  "Schertz",
  "Cibolo",
];

// [name, x%, y%]
export type MapPoint = [string, number, number];

export const mapPoints: MapPoint[] = [
  ["Boerne", 20, 24],
  ["Helotes", 30, 46],
  ["Stone Oak", 72, 22],
  ["Schertz", 82, 40],
  ["New Braunfels", 88, 16],
  ["Cibolo", 86, 56],
  ["Alamo Heights", 60, 58],
];

// Quarter-note positions [x, y] placed along the staff in the "Why It Matters"
// sheet-music graphic. y values land on the staff lines (90/130/170/210/250)
// and the spaces between them so the notes read as a melody on the bar.
export type SheetNote = [number, number];

export const sheetNotes: SheetNote[] = [
  [200, 210],
  [340, 130],
  [470, 170],
  [590, 150],
  [740, 210],
  [880, 190],
  [1010, 130],
  [1160, 130],
  [1300, 170],
];

// Single source of truth for prices — used by the price strip, the booking
// form options, the FAQ answer, and the JSON-LD priceRange.
export type Price = { label: string; note?: string; upright: number; grand: number };

export const prices = {
  tuning: { label: "Tuning", note: "Tuned within the last 2 years", upright: 70, grand: 85 },
  pitchRaise: { label: "Pitch raise & tuning", note: "Not tuned in 2+ years", upright: 120, grand: 135 },
  basicClean: { label: "Interior cleaning", note: "Vacuum & interior clean", upright: 50, grand: 65 },
  deepClean: { label: "Deep cleaning", note: "Interior + action cleaning", upright: 80, grand: 100 },
  polish: { label: "Exterior polish", upright: 30, grand: 40 },
} satisfies Record<string, Price>;

export const TRAVEL_NOTE = "First 20 travel miles free, then $1 per mile";
export const VETERAN_DISCOUNT = 30;

export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  {
    q: "How often should my piano be tuned?",
    a: "Typically once a year. Pianos played more often — for church services or recitals — or instruments that have gone a long time since their last servicing may need tuning more frequently.",
  },
  {
    q: "How long does a tuning take?",
    a: "Anywhere from 2 to 4 hours, depending heavily on the condition of the piano. I will let you know what to expect before I start.",
  },
  {
    q: "Do you do more than tuning?",
    a: "Yes — interior and exterior cleaning, polishing, and detailing, as well as repairs to damaged strings, keys, and other parts.",
  },
  {
    q: "Will my piano hold its tune?",
    a: "A stable, well-maintained piano in a climate-controlled room holds pitch beautifully between visits. I'm happy to share simple humidity tips for your space.",
  },
  {
    q: "What does a visit cost?",
    a: `A tuning is $${prices.tuning.upright} for an upright or $${prices.tuning.grand} for a grand if it's been tuned in the last two years. If it's been longer, a pitch raise & tuning is $${prices.pitchRaise.upright} / $${prices.pitchRaise.grand}. The first 20 travel miles are free ($1 per mile after that), and veterans with a Thank-A-Veteran Card save $${VETERAN_DISCOUNT}. Cleaning and polishing are optional add-ons.`,
  },
];
