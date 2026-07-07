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
];
