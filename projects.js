/* ------------------------------------------------------------------ */
/*  Portfolio projects                                                 */
/*                                                                     */
/*  To add a project: copy one of the objects below, paste it at the   */
/*  end of the array, give it a new unique id, and fill in the fields. */
/*  The site picks it up automatically — no other file needs to change.*/
/*                                                                     */
/*  Fields:                                                            */
/*    id          unique number                                        */
/*    title       project name (shown large on the card)               */
/*    description short text, one or two sentences                     */
/*    category    type of work (also becomes the tag pills)            */
/*    imageUrl    link to an image (any web-accessible image works)    */
/*    link        optional — where to view the project (null = none;   */
/*                shown as a "Visit project" button on the details     */
/*                page that opens when the card is clicked)            */
/*    youtubeId   optional — YouTube video id; embeds a player on the  */
/*                details page                                         */
/*    pdfUrl      optional — path to a PDF; embeds a scrollable        */
/*                slide-deck viewer on the details page                */
/*    fullDescription                                                  */
/*                optional — long-form case study shown on the details */
/*                page. Lines ending in ":" (or "Label: text") become  */
/*                headings, lines starting with "- " become bullets.   */
/* ------------------------------------------------------------------ */

export const projects = [
  {
    id: 1,
    title: "Nebula",
    description:
      "Real-time particle installation that reacts to visitors' movement, shown at the Nordic Light festival in Kiruna.",
    category: "Interactive Installation",
    imageUrl: "https://picsum.photos/seed/nebula-installation/800/600",
    link: "https://example.com/work/nebula",
  },
  {
    id: 2,
    title: "Drift",
    description:
      "An infinite-scroll voyage across a procedurally generated ocean, built with custom Three.js shaders.",
    category: "WebGL Experience",
    imageUrl: "https://picsum.photos/seed/drift-ocean/800/600",
    link: "https://example.com/work/drift",
  },
  {
    id: 3,
    title: "Mono",
    description:
      "Minimal identity system, packaging and typography for a specialty coffee roastery in Stockholm.",
    category: "Brand Identity",
    imageUrl: "https://picsum.photos/seed/mono-brand/800/600",
    link: null,
  },
  {
    id: 4,
    title: "Pulse",
    description:
      "Music visualizer that maps live frequency data onto a pulsing geometric landscape, synced to the beat.",
    category: "Audio Visualizer",
    imageUrl: "https://picsum.photos/seed/pulse-audio/800/600",
    link: "https://example.com/work/pulse",
  },
  {
    id: 5,
    title: "Terra",
    description:
      "Interactive 3D globe visualizing a decade of global climate data for a science museum exhibit.",
    category: "Data Visualization",
    imageUrl: "https://picsum.photos/seed/terra-globe/800/600",
    link: "https://example.com/work/terra",
  },
  {
    id: 6,
    title: "Echo",
    description:
      "Kinetic typography and full motion package for an indie game studio's launch trailer.",
    category: "Motion Design",
    imageUrl: "https://picsum.photos/seed/echo-motion/800/600",
    link: null,
  },
  {
    id: 7,
    title: "Ørsted Advertising Campaign",
    description:
      "Repositioned renewable energy company Ørsted from targeting environmentally-conscious consumers to positioning as the energy solution for scaling AI and cloud computing companies. Campaign emphasized the codependency between nature and human development through OOH ads and digital videos in tech hubs like San Francisco and Seattle.",
    category: "Advertising Campaign",
    imageUrl: "public/assets/orsted-campaign.png",
    link: "https://youtu.be/5riIfXXbBmI?si=dW-0v9kB2_y0wnj1",
    youtubeId: "5riIfXXbBmI",
    pdfUrl: "public/assets/Orsted_Advertising_Campaign.pdf",
    fullDescription: `Context: Final group project in Advanced Communication Management class in my MBA at Rome City Institute.

Task: Reposition the renewable energy company Ørsted by creating an advertising campaign.

Current Ørsted Positioning:
- Broad positioning: Renewable energy leader committed to sustainability with focus on wind and solar energy
- Advertising target audience: Environmentally conscious consumers

Solution:
- Illustrate that renewable energy is the only sustainable way to expand energy consumption and the only way to bring humanity forward
- Repositioned Ørsted as the top-of-mind choice for AI and cloud computing companies

Target Audience:
- AI and cloud companies scaling up energy consumption
- Reach both lower-level tech employees and high-level management to drive bottom-up and top-down industry influence

Strategy:
- OOH ads and events in tech cities like San Francisco and Seattle to influence industry mindset towards sustainability
- Digital campaign with video ads on YouTube, X, and GitHub to reach tech workers`,
  },
];
