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
/*    caseLabel   optional — heading for the fullDescription section   */
/*                (default "Case Study")                               */
/*    linkLabel   optional — custom text for the link button (default  */
/*                "Visit project"); also styles it as a filled CTA     */
/*    publisherLogo / publisherName                                    */
/*                optional — small publisher mark shown under the      */
/*                description on the details page                      */
/*    gallery     optional — labeled image groups shown as a grid on   */
/*                the details page:                                    */
/*                [{ label, images: ["url", ...] }, ...]               */
/*    reviews     optional — quote cards on the details page:          */
/*                [{ stars, quote, author }, ...] (stars 1-5)          */
/*    reviewsLink optional — "Read more reviews" link shown under the  */
/*                review cards                                         */
/*    tags        array of tag keys from TAG_COLORS (e.g. ["web","ai"])*/
/* ------------------------------------------------------------------ */

export const TAG_COLORS = {
  writing:          "#F59E0B",
  entrepreneurship: "#F97316",
  research:         "#60A5FA",
  design:           "#F472B6",
  web:              "#34D399",
  ai:               "#A78BFA",
  leadership:       "#4ADE80",
  advertising:      "#FB7185",
  football:         "#86EFAC",
  speaking:         "#38BDF8",
  culture:          "#FB923C",
  swedish:          "#FACC15",
  neuromarketing:   "#C084FC",
  photography:      "#2DD4BF",
  automation:       "#818CF8",
  seo:              "#84CC16",
};

export const projects = [
  {
    id: 5,
    title: "Moel the Mole",
    description:
      "I wrote and published a children's storybook that helps parents assess their kids' eyesight, and founded Wennerqvist Publishing AB to bring it to market.",
    category: "Published Book & Entrepreneurship",
    tags: ["writing", "entrepreneurship"],
    year: 2024,
    imageUrl: "public/assets/moel-cover.png",
    link: "https://a.co/d/0fCVu0nk",
    linkLabel: "View on Amazon",
    publisherLogo: "public/assets/wennerqvist-logo.png",
    publisherName: "Wennerqvist Publishing AB",
    gallery: [
      {
        label: "Inside the book",
        images: [
          "public/assets/moel-page-genie.png",
          "public/assets/moel-page-signs.png",
        ],
      },
      {
        label: "The author at work",
        images: [
          "public/assets/moel-jakob-reading.png",
          "public/assets/moel-jakob-holding.png",
        ],
      },
    ],
    reviews: [
      {
        stars: 5,
        quote:
          "It is really impressive how much is packed into this one little book. It tells a wonderful and highly imaginative tale with colorful pictures and has interactive pages. As a school professional, I know this book will keep your child engaged and entertained. I HIGHLY recommend Moel the Mole! I even bought extra copies as gifts.",
        author: "N — School Social Worker, Verified Purchase",
      },
      {
        stars: 5,
        quote:
          "As a mother of three children, I find this book super helpful to guide parents as to whether or not their children may have any visual impairments. What a fun and creative way to reach out and test children. Thank you Jakob Wennerqvist for your efforts to help seamlessly bridge the gap for those who may have an undetected visual condition.",
        author: "Helene — Mother of three, Verified Purchase",
      },
      {
        stars: 5,
        quote:
          "As an aspiring future teacher, this book opened my eyes to the different types of difficulties children can face visually. Not only did this book have an engaging and fun plot, it also assesses a child's vision in an informative way. I would highly recommend this book for any parents and teachers!",
        author: "Beata — Future teacher",
      },
    ],
    reviewsLink: "https://a.co/d/0fCVu0nk",
    caseLabel: "About the Project",
    fullDescription: `After seeing how inadequate vision screening for children is in the US, I decided to do something about it. Moel the Mole became the solution. I spent 5 months researching and writing a book that helps parents assess their children's eyesight. In November 2023, it went live on Amazon.`,
  },
  {
    id: 2,
    title: "The Illusion of Difference: Cultural Adaptation in European Websites",
    description:
      "What if everything we think about cultural differences in marketing is wrong? This Master's Thesis challenges the assumption that European markets require extensive localization — through comparative content analysis of five multinational companies, it shows that standardization dominates, with only 10-20% of website elements adapted across culturally distinct markets.",
    category: "Master's Thesis",
    tags: ["research", "design"],
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
    id: 3,
    title: "How I Made This Website",
    description:
      "This portfolio website is a 3D interactive gallery built with Three.js, showcasing a spherical interior dome where project cards float in space. Built while learning Claude Code, it demonstrates how AI-assisted development can accelerate bringing ambitious ideas to life.",
    category: "Web Development & Claude Code",
    tags: ["web", "ai", "design"],
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
  {
    id: 4,
    title: "WorldLangAmerica Website Redesign",
    description:
      "Led a remote team of 5 to completely redesign a nonprofit's website in a single day. The results after 2 weeks: +261% page views, +100% checkouts, and +480% revenue per visit.",
    category: "Website Redesign & Team Leadership",
    tags: ["web", "design", "leadership", "seo"],
    imageUrl: "public/assets/wla-screenshot-laptop.png",
    link: null,
    pdfUrl: "public/assets/WLA-Website-Evolution.pdf",
    kpiLabel: "Results after 2 weeks",
    kpis: [
      { value: "+261%", label: "Page views" },
      { value: "+11%", label: "Time on page" },
      { value: "-12%", label: "Bounce rate" },
      { value: "-20%", label: "Exit rate" },
      { value: "+67%", label: "Product page visit rate" },
      { value: "+100%", label: "Checkouts" },
      { value: "+480%", label: "Revenue per visit" },
      { value: "+7550%", label: "Button clicks" },
    ],
    fullDescription: `Context: As Deputy Director of Marketing at WorldLangAmerica, I lead a marketing team of 5 people focused on website and social media marketing. WorldLangAmerica is a nonprofit committed to providing virtual language exchanges, connecting students from different parts of the world to learn to speak each other's native language.

The Problem:
- The website looked unprofessional
- Unclear landing page with no defined path to lead visitors down
- Pricing was confusing
- No effective way to qualify visitors based on variables such as language and type of customer

The Managerial Challenge:
- Interns had no prior web design experience
- Interns work fully remote and part-time across 3 different time zones
- Changes were slow and collaboration was difficult

The Solution:
- An effective website that leads the visitor down the customer journey
- Lets the visitor self-qualify through a multiple-step journey
- Minimizes friction by lowering the sense of commitment
- Well-defined pricing that gives recommendations based on needs, making it easy for the visitor to commit

The Managerial Solution:
- Created and clearly communicated a plan to the interns for what exact changes needed to be implemented
- Conducted a sprint where the whole team came together for 8 hours over Zoom and implemented the changes
- Delegated and assisted while designing the complex pages during the downtime

The Outcome: Completely redesigned the website in one day. Only minor details needed adjusting after the sprint.`,
  },
  {
    id: 8,
    title: "Football",
    description:
      "I'm a semi-professional football player with experience from the 4th tier in Sweden, a top college program in the US, Promozione in Italy, and a professional trial in Ecuador.",
    category: "Semi-Professional Football",
    tags: ["football"],
    year: 2025,
    imageUrl: "public/assets/npu-last-game.jpg",
    link: null,
    youtubeId: "lEUGTgeKsKk",
    videoLabel: "Highlight Reel",
    stats: [
      { label: "Date of Birth", value: "June 1, 2002" },
      { label: "Position", value: "Center Back (Secondary: Right Back)" },
      { label: "Height", value: "183 cm / 6'0\"" },
      { label: "Weight", value: "83 kg / 183 lbs" },
      { label: "Preferred Foot", value: "Right" },
      { label: "Nationality", value: "Sweden (EU Passport)" },
    ],
    heroLayout: "banner",
    caseLabel: "Experience",
    sectionImages: {
      "AS Urbetevere — Italian Promozione (6th Tier)": ["public/assets/urbe-logo.jpg", "public/assets/urbe-duel.JPG"],
      "Professional Trial in Ecuador": ["public/assets/cumbre-logo.png", "public/assets/cumbre-pryse.JPG"],
      "IK Zenith — Swedish Division 2 (4th Tier)": ["public/assets/zenith-logo.png", "public/assets/zenith-ball.JPG"],
      "North Park University — NCAA Division III": ["public/assets/npu-logo.png", "public/assets/npu-first-game-back.jpg"],
    },
    fullDescription: `AS Urbetevere — Italian Promozione (6th Tier): In 2025, I played for this Roman club in the Promozione league.

Professional Trial in Ecuador: In February 2025, I went on a 10-day trial with a professional team in Ecuador's third tier (Segunda Categoría). The coach gave me direct feedback confirming I can play at that level — other uncontrollable factors prevented a contract offer.

IK Zenith — Swedish Division 2 (4th Tier):
- Went undefeated in all games played during the 2023 season
- Beat second-tier club IK Oddevold in the Swedish Cup
- Faced first-tier club IFK Göteborg in the following round

North Park University — NCAA Division III:
- Played from 2022 to 2025 for a top-ranked Division III program
- Team ranked 5th in the country in the 2022 season
- Team ranked 8th in the country in the 2024 season
- Received the 26 Elite Award for academic and athletic excellence`,
  },
  {
    id: 7,
    title: "Locked in for Life",
    description:
      "Created for Neuromarketing class at Rome City Institute, this analysis explores how Apple engineers its ecosystem to trigger loss aversion — making users feel that switching brands means losing something valuable, not just changing a product.",
    category: "Neuromarketing Research",
    tags: ["research", "neuromarketing", "design"],
    year: 2026,
    imageUrl: "public/assets/loss-aversion-cover.jpg",
    pdfUrl: "public/assets/Loss-Aversion-Apple.pdf",
    link: null,
    caseLabel: "About the Research",
    fullDescription: `The Question: Why do Apple users almost never switch — and what does neuroscience say about it?

What is Loss Aversion:
- Rooted in Kahneman & Tversky's Prospect Theory
- Losses feel approximately twice as painful as equivalent gains feel pleasurable
- We would rather avoid losing $10 than find $10 on the street

Apple's Ecosystem Strategy: Apple doesn't sell isolated products — it sells a tightly integrated system where each device deepens your reliance on the next. The entry point is the iPhone, but the ecosystem expands step by step: AirPods, Apple Watch, MacBook, iCloud, AirTag. Every addition raises the psychological and practical cost of leaving.

The Blue Bubble Effect:
- Switching to Android means losing blue bubble status, read receipts, reactions, and AirDrop
- Social losses are among the most painful: Eisenberger found that social exclusion activates the anterior cingulate cortex — the same brain region associated with physical pain
- Apple has turned leaving the ecosystem into a socially punishing experience

Key Findings:
- Apple frames switching as a loss, not a choice
- Each product increases switching costs and reinforces sunk cost bias
- The result: 90%+ brand loyalty in the US, high lifetime customer value, and antitrust scrutiny from both the EU Digital Markets Act and US lawsuits

Conclusion: Apple doesn't just build products people love — it builds an ecosystem people are afraid to leave.`,
  },
  {
    id: 6,
    type: "spotify",
    episodeId: "5uOtGikKbqv0IhUU4Lp0Zc",
    title: "Podcast Guest Appearance",
    description:
      "I joined The Josh and John Show — a podcast about cultural differences between Sweden and the US — to talk about studying at North Park University in Chicago, what makes the two cultures tick, and my soccer journey that took me all the way to Ecuador.",
    category: "Podcast",
    tags: ["speaking", "culture", "football", "swedish"],
    year: 2025,
    imageUrl: "public/assets/moel-jakob-holding.png",
    link: null,
  },
  {
    id: 1,
    title: "Ørsted Advertising Campaign",
    description:
      "Repositioned renewable energy company Ørsted from targeting environmentally-conscious consumers to positioning as the energy solution for scaling AI and cloud computing companies. Campaign emphasized the codependency between nature and human development through OOH ads and digital videos in tech hubs like San Francisco and Seattle.",
    category: "Advertising Campaign",
    tags: ["advertising", "design"],
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
    id: 9,
    title: "The Camera That Thinks It's 2003",
    description:
      "I enjoy shooting with vintage digital cameras, and my old Olympus is the most charming of the lot: a camera that thinks it's 2003 and stamps every photo accordingly. So my pal Claude and I spent an hour or two building a little Windows app that fixes the dates, straightens the sideways shots, and sends everything to Google Photos in one click.",
    category: "Desktop App & Claude Code",
    tags: ["ai", "photography", "automation"],
    year: 2026,
    imageUrl: "public/assets/olympus-cover.JPG",
    caseImage: "public/assets/photo-uploader-app.png",
    link: null,
    caseLabel: "The Story",
    kpiLabel: "The Payoff",
    kpis: [
      { value: "5 min → 30 sec", label: "Weekly routine, before and after" },
      { value: "1 click", label: "From camera to Google Photos" },
    ],
    sectionImages: {
      "The review grid": [
        { src: "public/assets/photo-rotator-before.png", label: "Before" },
        { src: "public/assets/photo-rotator-after.png", label: "After" },
      ],
    },
    sectionPills: {
      "Built with": [
        "Python",
        "tkinter",
        "OpenCV",
        "Pillow",
        "piexif",
        "Google Photos API",
        "Claude Code",
      ],
    },
    gallery: [
      {
        label: "Shot on the Olympus",
        images: [
          "public/assets/Olympus1.jpg",
          "public/assets/Olympus2.jpg",
          "public/assets/Olympus3.jpg",
        ],
      },
    ],
    fullDescription: `The problem:
- Every photo is stamped with a date in 2003, so after every single upload I sat there fixing dates on my phone by hand.
- It has no idea whether I am holding it landscape or portrait, so everything comes out sideways.
- Getting photos from camera to laptop to iPhone was a tedious multi-step routine, and it ate a chunk of time every week.

The solution:
- I plug the camera in and the app finds it on its own.
- I confirm the date and time, which defaults to right now.
- The app analyses every photo and suggests an orientation.
- I glance at the review grid and click any photo that needs a spin.
- Everything uploads straight to Google Photos with the correct date.
- The camera card itself is never modified: all edits happen on temporary copies, so the Olympus keeps living happily in 2003.
- One click, about thirty seconds, and the more photos, the bigger the time save.

The review grid: Auto-detect takes a first guess, I fix the rest with a click.

How I got there:
- The first version just fixed the dates and uploaded, and honestly that alone felt like magic.
- Then I asked whether auto-rotation was even feasible, and we tried face detection with OpenCV.
- Round one rotated the hats on my wall and left a vase alone.
- Round two got so strict it rotated nothing at all.
- Round three proudly flipped a face upside down.
- The breakthrough was to stop chasing the perfect detector and add the review grid instead: the app takes a first guess, I fix the mistakes with a single click, and we are both much happier with this division of labour.

Built with:

What I learned: Mostly how easy it has become to build a real app for an everyday and very specific problem. Nobody was ever going to ship a product for people with a 2003-obsessed Olympus, and nobody needed to: with Claude Code it took an afternoon to build one just for me. And it is not only bad, by the way. In its defence, when it gets things right, it really gets them right: the proof is in the gallery below.`,
  },
];
