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
/*    award       optional — short accolade (e.g. "Highest Honors");   */
/*                shown as an accent badge on the details page         */
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
  {
    id: 8,
    title: "The Illusion of Difference: Cultural Adaptation in European Websites",
    description:
      "What if everything we think about cultural differences in marketing is wrong? This Master's Thesis challenges the assumption that European markets require extensive localization — through comparative content analysis of five multinational companies, it shows that standardization dominates, with only 10-20% of website elements adapted across culturally distinct markets.",
    category: "Master's Thesis",
    imageUrl: "public/assets/thesis-presentation.jpg",
    link: null,
    pdfUrl: "public/assets/Jakob-Wennerqvist-Master-Thesis-Presentation.pdf",
    award: "Highest Honors",
    fullDescription: `The Question: What if everything we think about cultural differences in marketing is wrong? This Master's Thesis challenges the assumption that European markets require extensive localization.

The Research:
- Comparative content analysis of five multinational companies: IKEA, Volkswagen, Deloitte, Wix, and Verisure
- Websites compared across culturally distinct European markets, Italy and Sweden
- Traditional cultural frameworks like Hofstede's tested against actual brand behavior

Key Findings:
- Standardization dominates — only 10-20% of website elements are adapted across markets
- Traditional frameworks like Hofstede's show surprisingly weak alignment with actual brand behavior
- Most cultural differences manifest in just three high-impact elements — prestige claims, visual imagery, and multi-stimulus design
- UX remains universally standardized

The Framework: The research introduces a three-tier decision framework categorizing elements to Localize, Standardize, or Monitor, providing managers with actionable guidance instead of theoretical abstractions.

The Result: Defended with highest honors, this thesis bridges the gap between cultural theory and managerial practice in digital communication.`,
  },
  {
    id: 9,
    title: "How I Made This Website",
    description:
      "This portfolio website is a 3D interactive gallery built with Three.js, showcasing a spherical interior dome where project cards float in space. Built while learning Claude Code, it demonstrates how AI-assisted development can accelerate bringing ambitious ideas to life.",
    category: "Web Development & Claude Code",
    imageUrl: "public/assets/portfolio-website-hero.png",
    link: null,
    fullDescription: `The Concept: This portfolio website is a 3D interactive gallery built with Three.js, showcasing a spherical interior dome where project cards float in space. The experience combines smooth drag-to-rotate interactions powered by GSAP animations and Lenis scroll easing, creating a fluid, immersive interface.

Under the Hood:
- Three.js renders the wireframe dome, the floating project cards, and the particle field
- GSAP powers the animations — card fly-ins, page transitions, and drag inertia
- Lenis adds smooth scroll easing that rotates the gallery
- Multi-page navigation (Work, About, Contact) with individual project detail pages
- Embedded media on detail pages, including YouTube videos and PDF slide decks
- Consistent dark, modern aesthetics throughout

Built with Claude Code: The site was built while learning Claude Code, and it demonstrates how AI-assisted development can accelerate bringing ambitious ideas to life.

Shipping It: The entire project is version-controlled with GitHub and deployed on Netlify with a custom domain, showcasing both technical execution and deployment workflow.`,
  },
];
