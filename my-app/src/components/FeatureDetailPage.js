import { useEffect, useMemo, useState } from 'react';

const careerPriority = ['Engineering', 'Medical', 'Commerce', 'Design'];

const featureCopy = {
  'Smart Career Recommendation': {
    eyebrow: 'Recommendation Engine',
    title: 'Smart Career Recommendation',
    description:
      'See your strongest career fit, compare alternatives, and refresh the recommendation after any profile update.',
  },
  'Explainable AI': {
    eyebrow: 'Transparent AI',
    title: 'Explainable AI',
    description:
      'Inspect why a path is recommended and review the strongest signals behind the decision.',
  },
  'Aptitude and Personality Test': {
    eyebrow: 'Assessment',
    title: 'Aptitude and Personality Test',
    description:
      'Launch the 20-question assessment and view how the app turns answers into a future path.',
  },
  'Multi-Career Comparison': {
    eyebrow: 'Path Comparison',
    title: 'Multi-Career Comparison',
    description:
      'Compare multiple career tracks side by side and decide using the current score distribution.',
  },
  'College Recommendation': {
    eyebrow: 'College Finder',
    title: 'College Recommendation',
    description:
      'Use your preferred location and top match to shortlist colleges that fit your plan.',
  },
  'Study Planner': {
    eyebrow: 'Study Roadmap',
    title: 'Study Planner',
    description:
      'Generate a focused seven-day study plan built around your current top career match.',
  },
  'What-If Analysis': {
    eyebrow: 'Scenario Explorer',
    title: 'What-If Analysis',
    description:
      'Test how changed marks or interest levels can reshape the recommendation outcome.',
  },
  'Career Details': {
    eyebrow: 'Career Guide',
    title: 'Career Details',
    description:
      'Review skills, learning steps, and future scope for the currently strongest career path.',
  },
};

const careerDetailLibrary = {
  Engineering: {
    tagline: 'Build technology, systems, and products that solve real problems.',
    degreePaths: ['BTech or BE in core branch', 'Diploma to degree lateral path', 'BSc Computer Science with skill certifications'],
    entranceExams: ['JEE Main', 'JEE Advanced', 'State CET exams'],
    afterStudy: ['Software engineer', 'Data analyst', 'Core engineer (mechanical/electrical/civil)', 'Product or QA engineer'],
    firstFiveYears: ['Year 1: strengthen math, coding, and core science', 'Year 2: internships and project portfolio', 'Year 3: choose specialization and exam/career track', 'Year 4-5: placement prep, interviews, and industry transition'],
    lifeOutcomes: ['High demand in technology and infrastructure sectors', 'Opportunity to work in startups, MNCs, or government roles', 'Long-term growth into architect, tech lead, or manager roles'],
    supportPlan: ['Daily coding + problem solving block', 'Weekly project milestone', 'Monthly mock interview and resume update'],
  },
  Medical: {
    tagline: 'Serve people through healthcare, diagnosis, and clinical excellence.',
    degreePaths: ['MBBS', 'BDS/BAMS/BHMS based on preference', 'Allied health sciences (BPT, nursing, lab sciences)'],
    entranceExams: ['NEET UG', 'State counseling pathways'],
    afterStudy: ['Doctor (after MBBS and specialization)', 'Dentist', 'Clinical researcher', 'Healthcare specialist roles'],
    firstFiveYears: ['Year 1: biology and chemistry mastery', 'Year 2: NEET pattern deep practice', 'Year 3: college academics + clinical exposure', 'Year 4-5: specialization planning and exam preparation'],
    lifeOutcomes: ['Stable and respected profession', 'Direct social impact through patient care', 'Long-term growth through specialization and super-specialization'],
    supportPlan: ['Daily NCERT revision with MCQs', 'Weekly clinical/current affairs reading', 'Monthly full-length NEET or subject mocks'],
  },
  Commerce: {
    tagline: 'Master business, finance, and decision-making for strong career mobility.',
    degreePaths: ['BCom (General/Hons)', 'BBA for management pathway', 'Integrated CA/CS/CMA preparation with graduation'],
    entranceExams: ['CUET UG', 'University entrance tests', 'CA Foundation'],
    afterStudy: ['Accountant or financial analyst', 'Business operations associate', 'Investment and banking roles', 'Entrepreneurship and startup execution'],
    firstFiveYears: ['Year 1: accounts, economics, and business fundamentals', 'Year 2: Excel, analytics, and internships', 'Year 3: certification track (CA/CS/CMA/finance)', 'Year 4-5: corporate role growth or higher studies (MBA)'],
    lifeOutcomes: ['Strong opportunities in banking, consulting, and corporate finance', 'Clear ladder toward leadership roles', 'Flexible path toward MBA, business ownership, or global finance careers'],
    supportPlan: ['Daily accounting and economics practice', 'Weekly case-study analysis', 'Monthly aptitude + interview readiness sessions'],
  },
  Design: {
    tagline: 'Create meaningful visual and product experiences people love.',
    degreePaths: ['BDes', 'Bachelor in Visual Communication/Animation', 'UX/UI certification plus portfolio pathway'],
    entranceExams: ['NID DAT', 'NIFT', 'UCEED/CEED'],
    afterStudy: ['UI/UX designer', 'Product designer', 'Visual communication designer', 'Motion graphics or brand designer'],
    firstFiveYears: ['Year 1: sketching, fundamentals, and creative aptitude', 'Year 2: portfolio projects and software mastery', 'Year 3: internships with agencies/startups', 'Year 4-5: specialization in UX, product, fashion, or communication design'],
    lifeOutcomes: ['Creative career with high impact in digital products and brands', 'Freelance + full-time flexibility', 'Growth into lead designer, design strategist, or creative director'],
    supportPlan: ['Daily design practice and critique loop', 'Weekly portfolio updates', 'Monthly mock studio challenge'],
  },
};

function formatPercent(value) {
  return `${Math.max(0, Math.min(100, Math.round(Number(value) || 0)))}%`;
}

function getTopCareer(careerData) {
  const sortedEntries = Object.entries(careerData || {}).sort((first, second) => second[1] - first[1]);
  return sortedEntries[0] || ['Engineering', 0];
}

function buildStudyPlan(topCareer) {
  const steps = {
    Engineering: ['Math foundations', 'Coding drill', 'Physics practice', 'Project work', 'Mock test', 'Error review', 'Rest and recap'],
    Medical: ['Biology revision', 'Chemistry MCQs', 'Anatomy notes', 'Clinical concepts', 'Mock test', 'Weak topic revision', 'Rest and recap'],
    Commerce: ['Accounts basics', 'Business concepts', 'Economics revision', 'Case study work', 'Mock test', 'Formula review', 'Rest and recap'],
    Design: ['Sketch warm-up', 'Tool practice', 'Visual study', 'Portfolio work', 'Critique review', 'Mock task', 'Rest and recap'],
  };

  return steps[topCareer] || steps.Engineering;
}

function resolveEbookAsset(book) {
  const assetMap = {
    'eng-jee-physics': {
      pdfPath: '/ebooks/engineering/concepts-of-physics.pdf',
      sourceDescription: 'Physics foundation aligned with NCERT and JEE',
    },
    'eng-jee-math': {
      pdfPath: '/ebooks/engineering/objective-mathematics.pdf',
      sourceDescription: 'Mathematics practice and concept support for JEE',
    },
    'eng-jee-chem': {
      pdfPath: '/ebooks/engineering/chemical-calculations.pdf',
      sourceDescription: 'Chemistry core theory and solved practice',
    },
    'eng-programming': {
      pdfPath: '/ebooks/engineering/programming-through-c-and-python.pdf',
      sourceDescription: 'Coding basics and beginner projects',
    },
    'eng-electronics': {
      pdfPath: '/ebooks/engineering/basic-electronics.pdf',
      sourceDescription: 'Circuit basics and IIT lecture support',
    },
    'med-neet-bio': {
      pdfPath: '/ebooks/medical/ncert-biology.pdf',
      sourceDescription: 'Line-by-line NEET biology foundation',
    },
    'med-neet-chem': {
      pdfPath: '/ebooks/medical/physical-chemistry.pdf',
      sourceDescription: 'Chemistry foundation for NEET',
    },
    'med-neet-physics': {
      pdfPath: '/ebooks/medical/neet-physics-booster.pdf',
      sourceDescription: 'Physics practice and exam setup',
    },
    'med-botany': {
      pdfPath: '/ebooks/medical/botany-and-plant-physiology.pdf',
      sourceDescription: 'Botany and plant physiology for NEET',
    },
    'med-zoology': {
      pdfPath: '/ebooks/medical/zoology-and-human-physiology.pdf',
      sourceDescription: 'Human physiology and zoology revision',
    },
    'com-cuets-accounts': {
      pdfPath: '/ebooks/commerce/accountancy-masterbook.pdf',
      sourceDescription: 'Accountancy and BCom entrance practice',
    },
    'com-econ': {
      pdfPath: '/ebooks/commerce/micro-and-macro-economics.pdf',
      sourceDescription: 'Economics chapters for CUET and BBA',
    },
    'com-business': {
      pdfPath: '/ebooks/commerce/business-studies-fast-track.pdf',
      sourceDescription: 'Business concepts and case work',
    },
    'com-statistics': {
      pdfPath: '/ebooks/commerce/business-statistics-essentials.pdf',
      sourceDescription: 'Statistics for business decision making',
    },
    'com-computer-applications': {
      pdfPath: '/ebooks/commerce/computer-applications-for-commerce.pdf',
      sourceDescription: 'Practical computer skills for commerce students',
    },
    'des-uceed': {
      pdfPath: '/ebooks/design/uceed-and-ceed-preparation-guide.pdf',
      sourceDescription: 'Design aptitude and problem solving',
    },
    'des-nid': {
      pdfPath: '/ebooks/design/nid-dat-handbook.pdf',
      sourceDescription: 'Creative ability and sketching',
    },
    'des-nift': {
      pdfPath: '/ebooks/design/nift-exam-studio-book.pdf',
      sourceDescription: 'Fashion and creative aptitude',
    },
    'des-ux-ui': {
      pdfPath: '/ebooks/design/ui-ux-and-interaction-design.pdf',
      sourceDescription: 'Interaction design and portfolio support',
    },
    'des-drawing': {
      pdfPath: '/ebooks/design/drawing-and-visual-composition.pdf',
      sourceDescription: 'Drawing, composition, and observation practice',
    },
  };

  return assetMap[book?.id] || {
    pdfPath: '',
    sourceDescription: book?.source?.description || 'Source page included inside the app',
  };
}

function buildLocalPdfUrl(book) {
  const asset = resolveEbookAsset(book);
  const localPath = asset.pdfPath;

  if (localPath) {
    return `${process.env.PUBLIC_URL || ''}${localPath}`;
  }

  return '';
}

function buildFallbackPdfUrl(book) {
  return book?.pdfUrl || book?.source?.url || '#';
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function buildGoogleMapsSearchUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || '')}`;
}

function buildGoogleMapsEmbedUrl(query, zoom = 14) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query || '')}&z=${zoom}&output=embed`;
}

function buildBrochureSearchUrl(collegeName) {
  return `https://www.google.com/search?q=${encodeURIComponent(`${collegeName || ''} brochure pdf`)}`;
}

function getSourceBadge(label, url) {
  const text = `${String(label || '')} ${String(url || '')}`.toLowerCase();

  if (text.includes('nta')) return 'NTA';
  if (text.includes('ncert')) return 'NCERT';
  if (text.includes('swayam')) return 'SWY';
  if (text.includes('nptel')) return 'NPTEL';
  if (text.includes('diksha')) return 'DIKSHA';
  if (text.includes('jee')) return 'JEE';
  if (text.includes('neet')) return 'NEET';
  if (text.includes('uceed')) return 'UCEED';
  if (text.includes('nift')) return 'NIFT';
  if (text.includes('nid')) return 'NID';
  if (text.includes('iit')) return 'IIT';
  if (text.includes('spoken-tutorial')) return 'IITB';

  return 'IND';
}

function getSourceBadgeClass(badge) {
  const normalized = String(badge || 'IND').toUpperCase();

  if (normalized === 'NTA' || normalized === 'JEE' || normalized === 'NEET' || normalized === 'UCEED') {
    return 'source-logo-exam';
  }

  if (normalized === 'NCERT') {
    return 'source-logo-ncert';
  }

  if (normalized === 'SWY' || normalized === 'DIKSHA') {
    return 'source-logo-learning';
  }

  if (normalized === 'NPTEL') {
    return 'source-logo-nptel';
  }

  if (normalized === 'IIT' || normalized === 'IITB') {
    return 'source-logo-iit';
  }

  if (normalized === 'NID' || normalized === 'NIFT') {
    return 'source-logo-design';
  }

  return 'source-logo-india';
}

function getSourceIconType(badge) {
  const normalized = String(badge || 'IND').toUpperCase();

  if (normalized === 'NTA' || normalized === 'JEE' || normalized === 'NEET' || normalized === 'UCEED') {
    return 'exam';
  }

  if (normalized === 'NCERT') {
    return 'book';
  }

  if (normalized === 'SWY' || normalized === 'DIKSHA' || normalized === 'NPTEL') {
    return 'learning';
  }

  if (normalized === 'IIT' || normalized === 'IITB') {
    return 'institute';
  }

  if (normalized === 'NID' || normalized === 'NIFT') {
    return 'design';
  }

  return 'india';
}

function SourceLogo({ badge }) {
  const safeBadge = String(badge || 'IND').toUpperCase();
  const iconType = getSourceIconType(safeBadge);

  return (
    <span className={`source-logo ${getSourceBadgeClass(safeBadge)}`} aria-hidden="true">
      <svg className="source-logo-icon" viewBox="0 0 16 16" fill="none" focusable="false">
        {iconType === 'exam' && (
          <path d="M8 1.5l1.7 3.4 3.8.5-2.8 2.7.7 3.9L8 10.2 4.6 12l.7-3.9L2.5 5.4l3.8-.5L8 1.5z" fill="currentColor" />
        )}
        {iconType === 'book' && (
          <path d="M3 2.5h7.5A2.5 2.5 0 0113 5v8H5.2A2.2 2.2 0 013 10.8V2.5zm2 2v5.8c0 .4.3.7.7.7H11V5a1 1 0 00-1-1H5z" fill="currentColor" />
        )}
        {iconType === 'learning' && (
          <path d="M8 2l6 3-6 3-6-3 6-3zm-4.8 5.2L8 9.5l4.8-2.3V11L8 13.5 3.2 11V7.2z" fill="currentColor" />
        )}
        {iconType === 'institute' && (
          <path d="M8 1.8L1.5 5.3h13L8 1.8zm-4.8 4.6h1.6v5H3.2v-5zm4 0h1.6v5H7.2v-5zm4 0h1.6v5h-1.6v-5zM2 12.4h12v1.8H2v-1.8z" fill="currentColor" />
        )}
        {iconType === 'design' && (
          <path d="M8 1.8a6.2 6.2 0 100 12.4h.6c1 0 1.8-.8 1.8-1.8 0-.5-.2-1-.5-1.3a2 2 0 01-.5-1.3c0-1 .8-1.8 1.8-1.8h.7a2.6 2.6 0 002.6-2.6A6.2 6.2 0 008 1.8zm-3 4a1 1 0 110-2 1 1 0 010 2zm-1 3a1 1 0 110-2 1 1 0 010 2zm4 0a1 1 0 110-2 1 1 0 010 2z" fill="currentColor" />
        )}
        {iconType === 'india' && (
          <path d="M8 1.8a6.2 6.2 0 100 12.4A6.2 6.2 0 008 1.8zm0 1.8c1 0 1.9.3 2.7.8H5.3c.8-.5 1.7-.8 2.7-.8zm-4.2 2.2h8.4c.4.4.7.9.9 1.4H2.9c.2-.5.5-1 .9-1.4zm-.9 3.2h10.2c-.2.5-.5 1-.9 1.4H3.8a4.6 4.6 0 01-.9-1.4zm2.4 3.2h5.4A4.4 4.4 0 018 12.4c-1 0-1.9-.3-2.7-.8z" fill="currentColor" />
        )}
      </svg>
      <span className="source-logo-text">{safeBadge}</span>
    </span>
  );
}

const ebookCatalog = {
  Engineering: [
    {
      id: 'eng-jee-physics',
      title: 'Concepts of Physics Vol 1 and 2',
      subject: 'Physics',
      exam: 'JEE Main and Advanced',
      author: 'H.C. Verma',
      level: 'Intermediate to advanced',
      coverTone: 'blue',
        pdfUrl: 'https://www.google.com/search?q=Concepts+of+Physics+HC+Verma+pdf',
        source: { label: 'IIT JEE / NCERT aligned', url: 'https://ncert.nic.in/textbook.php' },
      requirements: {
        topics: ['Kinematics', 'Work, energy and power', 'Electrostatics', 'Modern physics'],
        resources: ['NCERT Physics', 'PYQ chapter-wise sheets', 'Formula notebook'],
        strategy: ['Read theory daily', 'Solve 30 mixed numericals', 'Maintain error log'],
        mockPlan: ['2 subject tests per week', '1 full mock every Sunday'],
      },
    },
    {
      id: 'eng-jee-math',
      title: 'Objective Mathematics for JEE',
      subject: 'Mathematics',
      exam: 'JEE Main and Advanced',
      author: 'R.D. Sharma',
      level: 'Beginner to advanced',
      coverTone: 'teal',
        pdfUrl: 'https://www.google.com/search?q=Objective+Mathematics+for+JEE+RD+Sharma+pdf',
        source: { label: 'IIT Bombay SWAYAM / NCERT', url: 'https://swayam.gov.in/' },
      requirements: {
        topics: ['Algebra', 'Trigonometry', 'Coordinate geometry', 'Calculus'],
        resources: ['NCERT Mathematics', 'JEE PYQ sets', 'Topic-wise short notes'],
        strategy: ['Daily 2-hour math drill', 'Revise weak chapters every third day', 'Timed quizzes'],
        mockPlan: ['Alternate-day section tests', 'Weekly mixed mock'],
      },
    },
    {
      id: 'eng-jee-chem',
      title: 'Modern Approach to Chemical Calculations',
      subject: 'Chemistry',
      exam: 'JEE Main and Advanced',
      author: 'R.C. Mukherjee',
      level: 'Intermediate',
      coverTone: 'amber',
        pdfUrl: 'https://www.google.com/search?q=R+C+Mukherjee+chemical+calculations+pdf',
        source: { label: 'NCERT Chemistry', url: 'https://ncert.nic.in/textbook.php' },
      requirements: {
        topics: ['Mole concept', 'Thermodynamics', 'Equilibrium', 'Electrochemistry'],
        resources: ['NCERT Chemistry', 'Coaching sheets', 'Reaction map charts'],
        strategy: ['Morning concept revision', 'Evening question blocks', 'Reaction mechanism practice'],
        mockPlan: ['3 chemistry chapter tests per week', '1 complete chemistry mock'],
      },
    },
    {
      id: 'eng-programming',
      title: 'Programming Through C and Python',
      subject: 'Programming',
      exam: 'Engineering Foundation and coding tests',
      author: 'IIT Bombay Spoken Tutorial',
      level: 'Foundation',
      coverTone: 'indigo',
      source: { label: 'IIT Bombay Spoken Tutorial', url: 'https://spoken-tutorial.org/' },
      pdfUrl: 'https://www.google.com/search?q=IIT+Bombay+spoken+tutorial+python+pdf',
      requirements: {
        topics: ['Variables and loops', 'Functions', 'Problem solving', 'Data structures basics'],
        resources: ['Spoken Tutorial videos', 'Coding practice sheets', 'Sample problems'],
        strategy: ['Daily coding practice', 'One small project per week', 'Error fixing log'],
        mockPlan: ['2 coding quizzes weekly', '1 mini-project demo every week'],
      },
    },
    {
      id: 'eng-electronics',
      title: 'Basic Electronics and Circuits',
      subject: 'Electronics',
      exam: 'JEE / engineering semester base',
      author: 'NPTEL and IIT resources',
      level: 'Intermediate',
      coverTone: 'emerald',
      source: { label: 'NPTEL by IITs', url: 'https://nptel.ac.in/' },
      pdfUrl: 'https://www.google.com/search?q=basic+electronics+engineering+pdf+nptel',
      requirements: {
        topics: ['Current and voltage', 'Diodes', 'Transistors', 'Logic gates'],
        resources: ['NPTEL video lectures', 'Lab notes', 'Circuit diagrams'],
        strategy: ['Diagram-first study', 'Concept + practice alternation', 'Regular revision'],
        mockPlan: ['Weekly circuit quiz', 'One theory test every weekend'],
      },
    },
  ],
  Medical: [
    {
      id: 'med-neet-bio',
      title: 'NCERT Biology Complete Guide',
      subject: 'Biology',
      exam: 'NEET UG',
      author: 'NCERT',
      level: 'Core',
      coverTone: 'green',
        pdfUrl: 'https://www.google.com/search?q=NCERT+Biology+class+11+12+pdf',
        source: { label: 'NCERT Biology', url: 'https://ncert.nic.in/textbook.php' },
      requirements: {
        topics: ['Human physiology', 'Genetics', 'Plant kingdom', 'Ecology'],
        resources: ['NCERT line-by-line notes', 'NEET PYQ booklet', 'Diagram practice sheet'],
        strategy: ['Daily chapter reading', 'MCQ drill by unit', 'Memory revision cycles'],
        mockPlan: ['Daily 90-question biology practice', 'Weekly full biology mock'],
      },
    },
    {
      id: 'med-neet-chem',
      title: 'Physical Chemistry for Competitive Exams',
      subject: 'Chemistry',
      exam: 'NEET UG',
      author: 'O.P. Tandon',
      level: 'Intermediate',
      coverTone: 'mint',
        pdfUrl: 'https://www.google.com/search?q=OP+Tandon+chemistry+pdf+neet',
        source: { label: 'NCERT Chemistry', url: 'https://ncert.nic.in/textbook.php' },
      requirements: {
        topics: ['Atomic structure', 'Chemical bonding', 'Solutions', 'Organic basics'],
        resources: ['NCERT chemistry', 'NEET chemistry PYQ', 'Reaction cards'],
        strategy: ['Concept session + MCQ set', 'Formula recap', 'Weak-topic correction'],
        mockPlan: ['3 chemistry drills weekly', 'One full NEET mock every week'],
      },
    },
    {
      id: 'med-neet-physics',
      title: 'NEET Physics Booster',
      subject: 'Physics',
      exam: 'NEET UG',
      author: 'D.C. Pandey',
      level: 'Intermediate',
      coverTone: 'emerald',
        pdfUrl: 'https://www.google.com/search?q=DC+Pandey+physics+for+neet+pdf',
        source: { label: 'AIIMS and NEET study material', url: 'https://neet.nta.nic.in/' },
      requirements: {
        topics: ['Mechanics', 'Current electricity', 'Ray optics', 'Semiconductors'],
        resources: ['Formula sheet', 'Assertion-reason bank', 'PYQ patterns'],
        strategy: ['Numerical-first approach', 'Mistake journal', 'Timed daily practice'],
        mockPlan: ['4 mini tests weekly', 'Weekly complete test'],
      },
    },
    {
      id: 'med-botany',
      title: 'Botany and Plant Physiology',
      subject: 'Botany',
      exam: 'NEET UG',
      author: 'NCERT + AIIMS notes',
      level: 'Core',
      coverTone: 'green',
      source: { label: 'NCERT Botany', url: 'https://ncert.nic.in/textbook.php' },
      pdfUrl: 'https://www.google.com/search?q=NCERT+Botany+pdf+neet',
      requirements: {
        topics: ['Plant kingdom', 'Photosynthesis', 'Plant anatomy', 'Transport in plants'],
        resources: ['NCERT line-by-line', 'Diagram practice', 'PYQ flashcards'],
        strategy: ['Daily 1 chapter scan', 'Diagram reproduction', 'MCQ revision'],
        mockPlan: ['3 botany tests weekly', 'One full biology mock'],
      },
    },
    {
      id: 'med-zoology',
      title: 'Zoology and Human Physiology',
      subject: 'Zoology',
      exam: 'NEET UG',
      author: 'NCERT + AFMC notes',
      level: 'Core',
      coverTone: 'emerald',
      source: { label: 'AFMC Pune / NCERT', url: 'https://ncert.nic.in/textbook.php' },
      pdfUrl: 'https://www.google.com/search?q=NCERT+zoology+pdf+neet',
      requirements: {
        topics: ['Human physiology', 'Genetics', 'Biotechnology', 'Evolution'],
        resources: ['NCERT tables and diagrams', 'PYQ sets', 'Human-body maps'],
        strategy: ['Compare systems daily', 'Revision through charts', 'Timed MCQ blocks'],
        mockPlan: ['3 zoology tests weekly', '1 mixed full mock'],
      },
    },
  ],
  Commerce: [
    {
      id: 'com-cuets-accounts',
      title: 'Accountancy Masterbook',
      subject: 'Accountancy',
      exam: 'CUET and BCom entrances',
      author: 'T.S. Grewal',
      level: 'Core',
      coverTone: 'violet',
        pdfUrl: 'https://www.google.com/search?q=TS+Grewal+accountancy+pdf',
        source: { label: 'NTA CUET / NCERT', url: 'https://cuet.nta.nic.in/' },
      requirements: {
        topics: ['Partnership', 'Company accounts', 'Cash flow', 'Financial statements'],
        resources: ['Board sample papers', 'CUET mock sets', 'Formula and format notes'],
        strategy: ['Daily ledger and journal practice', 'Speed drills', 'Error analysis'],
        mockPlan: ['2 chapter tests weekly', '1 full paper on weekend'],
      },
    },
    {
      id: 'com-econ',
      title: 'Introductory Micro and Macro Economics',
      subject: 'Economics',
      exam: 'CUET and BBA entrances',
      author: 'NCERT',
      level: 'Foundation',
      coverTone: 'indigo',
        pdfUrl: 'https://www.google.com/search?q=NCERT+economics+class+12+pdf',
        source: { label: 'NCERT Economics', url: 'https://ncert.nic.in/textbook.php' },
      requirements: {
        topics: ['Demand and supply', 'National income', 'Money and banking', 'Balance of payments'],
        resources: ['NCERT chapter notes', 'Graphs workbook', 'Case-based MCQ pack'],
        strategy: ['Concept reading with graphs', 'Daily 25 MCQs', 'Weekly revision loops'],
        mockPlan: ['3 mixed quizzes weekly', 'One complete mock per week'],
      },
    },
    {
      id: 'com-business',
      title: 'Business Studies Fast Track',
      subject: 'Business Studies',
      exam: 'CUET and board-linked entrances',
      author: 'Poonam Gandhi',
      level: 'Foundation to intermediate',
      coverTone: 'rose',
        pdfUrl: 'https://www.google.com/search?q=Business+Studies+Poonam+Gandhi+pdf',
        source: { label: 'Delhi University / NCERT', url: 'https://ncert.nic.in/textbook.php' },
      requirements: {
        topics: ['Principles of management', 'Marketing', 'Finance', 'Entrepreneurship'],
        resources: ['Mind maps', 'Case study workbook', 'Sample papers'],
        strategy: ['Topic map revision', 'Case answer writing practice', 'Weekly recap tests'],
        mockPlan: ['2 case-based tests weekly', '1 full-length paper'],
      },
    },
    {
      id: 'com-statistics',
      title: 'Business Statistics Essentials',
      subject: 'Statistics',
      exam: 'CUET, BCom, BBA',
      author: 'Indian commerce faculty notes',
      level: 'Foundation',
      coverTone: 'teal',
      source: { label: 'IIM / University commerce resources', url: 'https://swayam.gov.in/' },
      pdfUrl: 'https://www.google.com/search?q=business+statistics+commerce+pdf+india',
      requirements: {
        topics: ['Mean, median and mode', 'Correlation', 'Index numbers', 'Probability basics'],
        resources: ['Solved examples', 'Formula sheet', 'Dataset practice'],
        strategy: ['Daily formula recall', 'Graph interpretation', 'Speed calculations'],
        mockPlan: ['2 statistics drills weekly', '1 full mixed math-commerce mock'],
      },
    },
    {
      id: 'com-computer-applications',
      title: 'Computer Applications for Commerce Students',
      subject: 'Computer Applications',
      exam: 'CUET and BCom',
      author: 'IIT Bombay Spoken Tutorial',
      level: 'Foundation',
      coverTone: 'blue',
      source: { label: 'IIT Bombay Spoken Tutorial', url: 'https://spoken-tutorial.org/' },
      pdfUrl: 'https://www.google.com/search?q=computer+applications+commerce+book+pdf+india',
      requirements: {
        topics: ['MS Office basics', 'Internet and email', 'Databases', 'Coding awareness'],
        resources: ['Spoken tutorial videos', 'Practical exercises', 'Project worksheets'],
        strategy: ['Hands-on lab practice', 'Short concept blocks', 'Weekly practical task'],
        mockPlan: ['One lab test weekly', 'One practical revision cycle'],
      },
    },
  ],
  Design: [
    {
      id: 'des-uceed',
      title: 'UCEED and CEED Preparation Guide',
      subject: 'Design Aptitude',
      exam: 'UCEED and CEED',
      author: 'R.S. Aggarwal and design faculty notes',
      level: 'Beginner to advanced',
      coverTone: 'orange',
        pdfUrl: 'https://www.google.com/search?q=UCEED+preparation+book+pdf',
        source: { label: 'IIT Bombay UCEED', url: 'https://www.uceed.iitb.ac.in/' },
      requirements: {
        topics: ['Visual perception', 'Spatial ability', 'Design thinking', 'Problem solving'],
        resources: ['Sketchbook', 'Daily observation log', 'Previous year papers'],
        strategy: ['Daily sketch and idea drill', 'Situation-based solution writing', 'Portfolio curation'],
        mockPlan: ['3 aptitude drills weekly', 'One timed design test'],
      },
    },
    {
      id: 'des-nid',
      title: 'NID DAT Handbook',
      subject: 'Creative Ability',
      exam: 'NID DAT',
      author: 'Design entrance mentors',
      level: 'Intermediate',
      coverTone: 'coral',
        pdfUrl: 'https://www.google.com/search?q=NID+DAT+preparation+book+pdf',
        source: { label: 'NID Admissions', url: 'https://admissions.nid.edu/' },
      requirements: {
        topics: ['Sketching', 'Storyboarding', 'Color theory', 'Observation drawing'],
        resources: ['Portfolio templates', 'Material toolkit', 'Design challenge prompts'],
        strategy: ['Concept to sketch in 20 minutes', 'Daily object study', 'Interview question prep'],
        mockPlan: ['2 studio tasks weekly', '1 full NID-style test'],
      },
    },
    {
      id: 'des-nift',
      title: 'NIFT Exam Studio Book',
      subject: 'Fashion and Visual Design',
      exam: 'NIFT Entrance',
      author: 'NIFT preparation team',
      level: 'Intermediate',
      coverTone: 'magenta',
        pdfUrl: 'https://www.google.com/search?q=NIFT+entrance+preparation+book+pdf',
        source: { label: 'NIFT Admissions', url: 'https://www.nift.ac.in/' },
      requirements: {
        topics: ['Fashion fundamentals', 'General ability', 'Creative composition', 'Material awareness'],
        resources: ['Style boards', 'Current affairs notes', 'Drawing kit'],
        strategy: ['Alternate-day design exercises', 'Vocabulary and GK revision', 'Timed creativity drills'],
        mockPlan: ['3 sectional tests weekly', 'One complete NIFT mock'],
      },
    },
    {
      id: 'des-ux-ui',
      title: 'UI/UX and Interaction Design Basics',
      subject: 'UI/UX Design',
      exam: 'Design entrance and portfolio building',
      author: 'Srishti Manipal / design faculty notes',
      level: 'Foundation',
      coverTone: 'violet',
      source: { label: 'Srishti Manipal', url: 'https://srishtimanipalinstitute.in/' },
      pdfUrl: 'https://www.google.com/search?q=ui+ux+design+basics+pdf+india',
      requirements: {
        topics: ['User research', 'Wireframing', 'Prototyping', 'Design systems'],
        resources: ['Figma basics', 'Case studies', 'Portfolio references'],
        strategy: ['Observe daily products', 'Sketch interfaces', 'Build small case study'],
        mockPlan: ['2 portfolio tasks weekly', '1 critique session per week'],
      },
    },
    {
      id: 'des-drawing',
      title: 'Drawing and Visual Composition Handbook',
      subject: 'Drawing',
      exam: 'NID / NIFT / UCEED',
      author: 'Indian design academy notes',
      level: 'Foundation',
      coverTone: 'indigo',
      source: { label: 'Pearl Academy', url: 'https://www.pearlacademy.com/' },
      pdfUrl: 'https://www.google.com/search?q=drawing+and+visual+composition+pdf+india',
      requirements: {
        topics: ['Perspective', 'Shading', 'Object drawing', 'Human figure basics'],
        resources: ['Sketchbook', 'Graphite pencils', 'Daily object observation'],
        strategy: ['Draw one object daily', 'Practice perspective lines', 'Keep observation notes'],
        mockPlan: ['3 drawing studies weekly', 'One time-bound composition test'],
      },
    },
  ],
};

const coverToneClass = {
  blue: 'book-tone-blue',
  teal: 'book-tone-teal',
  amber: 'book-tone-amber',
  green: 'book-tone-green',
  mint: 'book-tone-mint',
  emerald: 'book-tone-emerald',
  violet: 'book-tone-violet',
  indigo: 'book-tone-indigo',
  rose: 'book-tone-rose',
  orange: 'book-tone-orange',
  coral: 'book-tone-coral',
  magenta: 'book-tone-magenta',
};

const collegeDirectory = [
  {
    id: 'iit-bombay',
    type: 'Institute',
    stream: 'Engineering',
    name: 'IIT Bombay',
    city: 'Mumbai',
    state: 'Maharashtra',
    imageUrl: 'https://images.unsplash.com/photo-1504704911899-2756e8d4b5e0?auto=format&fit=crop&w=900&q=80',
    highlights: 'Computer science, core engineering, innovation, and strong placements.',
  },
  {
    id: 'iit-delhi',
    type: 'Institute',
    stream: 'Engineering',
    name: 'IIT Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=900&q=80',
    highlights: 'Research-led engineering programs and a strong startup ecosystem.',
  },
  {
    id: 'nit-trichy',
    type: 'Institute',
    stream: 'Engineering',
    name: 'NIT Trichy',
    city: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80',
    highlights: 'High placement support across mechanical, ECE, and computer branches.',
  },
  {
    id: 'iit-madras',
    type: 'Institute',
    stream: 'Engineering',
    name: 'IIT Madras',
    city: 'Chennai',
    state: 'Tamil Nadu',
    imageUrl: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=900&q=80',
    highlights: 'Strong research ecosystem, interdisciplinary engineering, and innovation labs.',
  },
  {
    id: 'bits-pilani',
    type: 'University',
    stream: 'Engineering',
    name: 'BITS Pilani',
    city: 'Pilani',
    state: 'Rajasthan',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=900&q=80',
    highlights: 'Private university known for engineering, placements, and flexible academics.',
  },
  {
    id: 'iiit-hyderabad',
    type: 'Institute',
    stream: 'Engineering',
    name: 'IIIT Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80',
    highlights: 'Computer science, AI, and research-heavy engineering programs.',
  },
  {
    id: 'iit-kanpur',
    type: 'Institute',
    stream: 'Engineering',
    name: 'IIT Kanpur',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    imageUrl: 'https://images.unsplash.com/photo-1472289065668-ce650ac443d2?auto=format&fit=crop&w=900&q=80',
    highlights: 'Strong core engineering, computing, and research-driven learning.',
  },
  {
    id: 'vit-vellore',
    type: 'University',
    stream: 'Engineering',
    name: 'VIT Vellore',
    city: 'Vellore',
    state: 'Tamil Nadu',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80',
    highlights: 'Large private university with engineering options and broad placement reach.',
  },
  {
    id: 'manipal-engineering',
    type: 'University',
    stream: 'Engineering',
    name: 'Manipal Institute of Technology',
    city: 'Manipal',
    state: 'Karnataka',
    imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
    highlights: 'Flexible engineering choices with a strong campus ecosystem.',
  },
  {
    id: 'aiims-delhi',
    type: 'Institute',
    stream: 'Medical',
    name: 'AIIMS New Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80',
    highlights: 'Premier medical institute with top clinical training and research exposure.',
  },
  {
    id: 'cmc-vellore',
    type: 'University',
    stream: 'Medical',
    name: 'CMC Vellore',
    city: 'Vellore',
    state: 'Tamil Nadu',
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=80',
    highlights: 'Strong patient-care training, clinical learning, and healthcare service.',
  },
  {
    id: 'jipmer',
    type: 'Institute',
    stream: 'Medical',
    name: 'JIPMER',
    city: 'Puducherry',
    state: 'Puducherry',
    imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=900&q=80',
    highlights: 'Excellent for MBBS and allied health sciences with hospital-based exposure.',
  },
  {
    id: 'afmc-pune',
    type: 'Institute',
    stream: 'Medical',
    name: 'AFMC Pune',
    city: 'Pune',
    state: 'Maharashtra',
    imageUrl: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80',
    highlights: 'Medical education with defense-oriented discipline and clinical training.',
  },
  {
    id: 'kgmu-lucknow',
    type: 'University',
    stream: 'Medical',
    name: 'King George’s Medical University',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    imageUrl: 'https://images.unsplash.com/photo-1580281657527-47f249e8f1f5?auto=format&fit=crop&w=900&q=80',
    highlights: 'One of the major medical universities for MBBS and postgraduate study.',
  },
  {
    id: 'grant-medical-mumbai',
    type: 'College',
    stream: 'Medical',
    name: 'Grant Medical College',
    city: 'Mumbai',
    state: 'Maharashtra',
    imageUrl: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=900&q=80',
    highlights: 'Historic medical college with strong clinical teaching and hospital access.',
  },
  {
    id: 'amrita-medical',
    type: 'University',
    stream: 'Medical',
    name: 'Amrita Vishwa Vidyapeetham Medical Campus',
    city: 'Kochi',
    state: 'Kerala',
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=80',
    highlights: 'Private university with modern hospitals, research, and medical training.',
  },
  {
    id: 'srcc',
    type: 'College',
    stream: 'Commerce',
    name: 'SRCC',
    city: 'New Delhi',
    state: 'Delhi',
    imageUrl: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80',
    highlights: 'Top commerce college for economics, finance, business, and analytics.',
  },
  {
    id: 'st-xaviers-mumbai',
    type: 'College',
    stream: 'Commerce',
    name: "St. Xavier's College",
    city: 'Mumbai',
    state: 'Maharashtra',
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80',
    highlights: 'Strong commerce, management, and interdisciplinary academic culture.',
  },
  {
    id: 'christ-bengaluru',
    type: 'University',
    stream: 'Commerce',
    name: 'Christ University',
    city: 'Bengaluru',
    state: 'Karnataka',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80',
    highlights: 'Business, commerce, and finance with strong internship opportunities.',
  },
  {
    id: 'nmims-mumbai',
    type: 'University',
    stream: 'Commerce',
    name: 'NMIMS',
    city: 'Mumbai',
    state: 'Maharashtra',
    imageUrl: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=900&q=80',
    highlights: 'Business, finance, and commerce-focused university with industry links.',
  },
  {
    id: 'symbiosis-pune',
    type: 'University',
    stream: 'Commerce',
    name: 'Symbiosis International University',
    city: 'Pune',
    state: 'Maharashtra',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80',
    highlights: 'Strong business, commerce, and management pathways with broad exposure.',
  },
  {
    id: 'loyola-chennai',
    type: 'College',
    stream: 'Commerce',
    name: 'Loyola College',
    city: 'Chennai',
    state: 'Tamil Nadu',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80',
    highlights: 'Strong commerce, management, and arts options with a broad campus environment.',
  },
  {
    id: 'nid-ahmedabad',
    type: 'Institute',
    stream: 'Design',
    name: 'NID Ahmedabad',
    city: 'Ahmedabad',
    state: 'Gujarat',
    imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80',
    highlights: 'Premier design school for product, communication, and interaction design.',
  },
  {
    id: 'nift-delhi',
    type: 'Institute',
    stream: 'Design',
    name: 'NIFT Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    imageUrl: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=900&q=80',
    highlights: 'Fashion, textile, and design programs with industry-linked portfolio work.',
  },
];

function FeatureDetailPage({
  featureTitle,
  careerData = {},
  reasonData = [],
  profileData = {},
  assessmentPerformance = {},
  isLoadingData = false,
  onBackHome,
  onStartAssessment,
  onRefreshRecommendation,
}) {
  const [selectedStream, setSelectedStream] = useState(profileData.targetCareer || careerPriority[0]);
  const [selectedInstitutionType, setSelectedInstitutionType] = useState('All');
  const [collegeLocation, setCollegeLocation] = useState('');
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [mapZoom, setMapZoom] = useState(14);
  const [plannerGoal, setPlannerGoal] = useState(profileData.targetCareer || careerPriority[0]);
  const [ebookStreamFilter, setEbookStreamFilter] = useState('All Streams');
  const [plannerSubject, setPlannerSubject] = useState('All Subjects');
  const [ebookSearchQuery, setEbookSearchQuery] = useState('');
  const [activeEbookId, setActiveEbookId] = useState('');
  const [isEbookPrepOpen, setIsEbookPrepOpen] = useState(false);
  const [scenarioShift, setScenarioShift] = useState(10);
  const [studyHours, setStudyHours] = useState(2);
  const [syllabusDone, setSyllabusDone] = useState(25);
  const [completedPlanItems, setCompletedPlanItems] = useState([]);
  const [subjectScores, setSubjectScores] = useState({});

  const openBestPdf = async (book) => {
    const localPdfUrl = buildLocalPdfUrl(book);

    if (localPdfUrl) {
      try {
        const response = await fetch(localPdfUrl, { method: 'HEAD' });
        if (response.ok) {
          window.open(localPdfUrl, '_blank', 'noopener,noreferrer');
          return;
        }
      } catch (error) {
        // Ignore network/file check errors and use the fallback source below.
      }
    }

    const fallbackPdfUrl = buildFallbackPdfUrl(book);
    window.open(fallbackPdfUrl, '_blank', 'noopener,noreferrer');
  };

  const topCareerEntry = getTopCareer(careerData);
  const topCareer = topCareerEntry[0];
  const topScore = topCareerEntry[1];
  const copy = featureCopy[featureTitle] || featureCopy['Smart Career Recommendation'];
  const assessmentTopPath = assessmentPerformance?.topPath || topCareer;
  const assessmentMarksPercent = assessmentPerformance?.marks?.percentage;
  const rankedCareers = useMemo(
    () =>
      careerPriority
        .map((career) => ({
          career,
          score: Number(careerData?.[career]) || 0,
        }))
        .sort((first, second) => second.score - first.score),
    [careerData],
  );

  useEffect(() => {
    setSelectedStream(profileData.targetCareer || topCareer);
  }, [profileData.targetCareer, topCareer]);

  const collegeSearchTerm = normalizeText(collegeLocation);
  const activeStream = selectedStream || topCareer;
  const matchingColleges = useMemo(
    () =>
      collegeDirectory
        .filter((college) => !activeStream || college.stream === activeStream)
        .filter((college) => selectedInstitutionType === 'All' || college.type === selectedInstitutionType)
        .filter((college) => {
          if (!collegeSearchTerm) {
            return true;
          }

          const searchable = [college.name, college.city, college.state, college.stream, college.highlights]
            .join(' ')
            .toLowerCase();
          return searchable.includes(collegeSearchTerm);
        })
        .sort((firstCollege, secondCollege) => {
          const firstScore = [firstCollege.name, firstCollege.city, firstCollege.state]
            .join(' ')
            .toLowerCase()
            .includes(collegeSearchTerm)
            ? 0
            : 1;
          const secondScore = [secondCollege.name, secondCollege.city, secondCollege.state]
            .join(' ')
            .toLowerCase()
            .includes(collegeSearchTerm)
            ? 0
            : 1;

          return firstScore - secondScore;
        }),
      [activeStream, collegeSearchTerm, selectedInstitutionType],
  );

  const selectedCollege = useMemo(() => {
    const exactCollege = matchingColleges.find((college) => college.id === selectedCollegeId);
    return exactCollege || matchingColleges[0] || null;
  }, [matchingColleges, selectedCollegeId]);

  useEffect(() => {
    if (selectedCollege && selectedCollege.id !== selectedCollegeId) {
      setSelectedCollegeId(selectedCollege.id);
    }
  }, [selectedCollege, selectedCollegeId]);

  const comparisonPair = rankedCareers.slice(0, 2);
  const studyPlan = buildStudyPlan(plannerGoal || topCareer);
  const trackerSubjects = useMemo(
    () => [...new Set((ebookCatalog[plannerGoal] || []).map((book) => book.subject))].slice(0, 6),
    [plannerGoal],
  );
  const weakSubjects = useMemo(
    () =>
      Object.entries(subjectScores)
        .filter(([, score]) => Number(score) < 60)
        .sort((first, second) => Number(first[1]) - Number(second[1])),
    [subjectScores],
  );
  const completionPercent = studyPlan.length === 0 ? 0 : Math.round((completedPlanItems.length / studyPlan.length) * 100);
  const remainingTaskCount = Math.max(0, studyPlan.length - completedPlanItems.length);
  const dailyProgressMessage = remainingTaskCount === 0 ? 'All daily tasks completed' : `${remainingTaskCount} task(s) remaining`;

  const togglePlanItem = (item) => {
    setCompletedPlanItems((prev) => (prev.includes(item) ? prev.filter((value) => value !== item) : [...prev, item]));
  };

  const allEbooks = useMemo(() => Object.values(ebookCatalog).flat(), []);
  const ebookStreamOptions = ['All Streams', ...Object.keys(ebookCatalog)];
  const streamEbooks = useMemo(
    () => (ebookStreamFilter === 'All Streams' ? allEbooks : ebookCatalog[ebookStreamFilter] || []),
    [allEbooks, ebookStreamFilter],
  );
  const subjectOptions = useMemo(() => ['All Subjects', ...new Set(streamEbooks.map((book) => book.subject))], [streamEbooks]);
  const normalizedEbookSearch = normalizeText(ebookSearchQuery);
  const filteredEbooks = streamEbooks.filter((book) => {
    const matchesSubject = plannerSubject === 'All Subjects' || book.subject === plannerSubject;

    if (!matchesSubject) {
      return false;
    }

    if (!normalizedEbookSearch) {
      return true;
    }

    const searchableText = [
      book.title,
      book.subject,
      book.exam,
      book.author,
      book.source?.label,
      book.source?.url,
      ...(book.requirements?.topics || []),
      ...(book.requirements?.resources || []),
    ]
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedEbookSearch);
  });
  const activeEbook = filteredEbooks.find((book) => book.id === activeEbookId) || null;
  const streamResourcesByGoal = {
    Engineering: [
      { label: 'NTA JEE Main', url: 'https://jeemain.nta.ac.in/' },
      { label: 'JEE Advanced', url: 'https://jeeadv.ac.in/' },
      { label: 'NCERT Textbooks', url: 'https://ncert.nic.in/textbook.php' },
      { label: 'SWAYAM Free Courses', url: 'https://swayam.gov.in/' },
    ],
    Medical: [
      { label: 'NTA NEET UG', url: 'https://neet.nta.nic.in/' },
      { label: 'NCERT Textbooks', url: 'https://ncert.nic.in/textbook.php' },
      { label: 'NMC Updates', url: 'https://www.nmc.org.in/' },
      { label: 'DIKSHA Learning', url: 'https://diksha.gov.in/' },
    ],
    Commerce: [
      { label: 'NTA CUET UG', url: 'https://cuet.nta.nic.in/' },
      { label: 'NCERT Commerce Books', url: 'https://ncert.nic.in/textbook.php' },
      { label: 'NISM Investor Modules', url: 'https://www.nism.ac.in/' },
      { label: 'SWAYAM Commerce Courses', url: 'https://swayam.gov.in/' },
    ],
    Design: [
      { label: 'UCEED Official', url: 'https://www.uceed.iitb.ac.in/' },
      { label: 'NID Admissions', url: 'https://admissions.nid.edu/' },
      { label: 'NIFT Admissions', url: 'https://www.nift.ac.in/' },
      { label: 'Design Foundation Courses (SWAYAM)', url: 'https://swayam.gov.in/' },
    ],
  };
  const streamResources = streamResourcesByGoal[plannerGoal] || [];
  const activeExamPlaybook = useMemo(() => {
    const normalizedExam = String(activeEbook?.exam || '').toLowerCase();

    if (normalizedExam.includes('jee')) {
      return {
        title: 'JEE Crack Blueprint',
        monthlyPlan: ['Days 1-10: NCERT + formulas', 'Days 11-20: PYQs + timed numericals', 'Days 21-30: full mocks + error fix'],
        toolkit: ['Formula handbook', 'Chapter PYQ tracker', 'Mock analysis notebook', 'Daily revision timer'],
        testDay: ['Attempt easy-first in each section', 'Keep 15 minutes final review', 'Avoid blind guesses'],
      };
    }

    if (normalizedExam.includes('neet')) {
      return {
        title: 'NEET Crack Blueprint',
        monthlyPlan: ['Days 1-10: Biology NCERT line-by-line', 'Days 11-20: Chemistry + Physics mixed MCQs', 'Days 21-30: full paper drills'],
        toolkit: ['NCERT highlight notes', 'Assertion-reason practice bank', 'OMR practice sheet', 'Weak-topic flashcards'],
        testDay: ['Start with strongest section', 'Keep strict per-section timing', 'Bubble OMR in disciplined blocks'],
      };
    }

    if (normalizedExam.includes('cuet')) {
      return {
        title: 'CUET Crack Blueprint',
        monthlyPlan: ['Week 1: domain concept revision', 'Week 2: case and objective drills', 'Week 3: speed and accuracy tests', 'Week 4: full mocks + recap'],
        toolkit: ['Domain-wise short notes', 'MCQ speed sheet', 'Section strategy table', 'Current affairs capsule'],
        testDay: ['Attempt known questions first', 'Use elimination for close options', 'Reserve 10 minutes for review'],
      };
    }

    if (normalizedExam.includes('nid') || normalizedExam.includes('nift') || normalizedExam.includes('uceed') || normalizedExam.includes('ceed')) {
      return {
        title: 'Design Entrance Blueprint',
        monthlyPlan: ['Week 1: sketch basics + observation', 'Week 2: aptitude and creativity drills', 'Week 3: portfolio and studio tasks', 'Week 4: timed mock and interview prep'],
        toolkit: ['Sketchbook and markers', 'Portfolio board templates', 'Design challenge prompts', 'Creativity journal'],
        testDay: ['Plan layout before drawing', 'Keep ideas original and practical', 'Manage time per problem statement'],
      };
    }

    return {
      title: `${plannerGoal} Exam Blueprint`,
      monthlyPlan: ['Week 1: concept build', 'Week 2: focused practice', 'Week 3: mocks + corrections', 'Week 4: final revision'],
      toolkit: ['Syllabus checklist', 'Question bank', 'Error notebook', 'Revision timetable'],
      testDay: ['Easy questions first', 'Track time every 30 minutes', 'Final quick review before submit'],
    };
  }, [activeEbook?.exam, plannerGoal]);
  const matchingEbookSources = useMemo(() => {
    const sourceMap = new Map();

    filteredEbooks.forEach((book) => {
      if (book.source?.label && book.source?.url && !sourceMap.has(book.source.url)) {
        sourceMap.set(book.source.url, {
          label: book.source.label,
          url: book.source.url,
          badge: getSourceBadge(book.source.label, book.source.url),
          subject: book.subject,
          description: book.source.description || resolveEbookAsset(book).sourceDescription,
        });
      }
    });

    return Array.from(sourceMap.values());
  }, [filteredEbooks]);
  const displayedEbooks = filteredEbooks;

  useEffect(() => {
    if (plannerSubject !== 'All Subjects' && !subjectOptions.includes(plannerSubject)) {
      setPlannerSubject('All Subjects');
    }
  }, [plannerSubject, subjectOptions]);

  useEffect(() => {
    setEbookStreamFilter('All Streams');
    setPlannerSubject('All Subjects');
    setEbookSearchQuery('');
    setActiveEbookId('');
    setIsEbookPrepOpen(false);
    setCompletedPlanItems([]);
    setStudyHours(2);
    setSyllabusDone(25);
  }, [plannerGoal]);

  useEffect(() => {
    setSubjectScores((prev) => {
      const next = {};

      trackerSubjects.forEach((subject) => {
        if (typeof prev[subject] === 'number') {
          next[subject] = prev[subject];
          return;
        }

        next[subject] = subject.toLowerCase().includes('math') ? 58 : 72;
      });

      return next;
    });
  }, [trackerSubjects]);

  useEffect(() => {
    if (displayedEbooks.length === 0) {
      setActiveEbookId('');
      return;
    }

    if (!activeEbookId || !displayedEbooks.some((book) => book.id === activeEbookId)) {
      setActiveEbookId(displayedEbooks[0].id);
    }
  }, [activeEbookId, displayedEbooks]);
  useEffect(() => {
    if (activeEbook && isEbookPrepOpen) {
      return;
    }

    if (displayedEbooks.length === 0) {
      setIsEbookPrepOpen(false);
    }
  }, [activeEbook, displayedEbooks.length, isEbookPrepOpen]);
  const scenarioMap = useMemo(
    () => ({
      Engineering: Math.min(100, (Number(careerData.Engineering) || 40) + scenarioShift),
      Medical: Math.min(100, (Number(careerData.Medical) || 35) + Math.max(0, 10 - scenarioShift)),
      Commerce: Math.min(100, (Number(careerData.Commerce) || 30) + Math.max(0, 8 - scenarioShift / 2)),
      Design: Math.min(100, (Number(careerData.Design) || 25) + Math.max(0, scenarioShift / 2)),
    }),
    [careerData, scenarioShift],
  );
  const scenarioRanking = Object.entries(scenarioMap)
    .map(([career, score]) => ({ career, score }))
    .sort((first, second) => second.score - first.score);

  const collegeMapQuery = selectedCollege
    ? `${selectedCollege.name}, ${selectedCollege.city}, ${selectedCollege.state}`
    : `${activeStream} colleges in India`;
  const collegeMapUrl = buildGoogleMapsEmbedUrl(collegeMapQuery, mapZoom);
  const collegeMapSearchUrl = buildGoogleMapsSearchUrl(collegeMapQuery);

  const currentReasons = reasonData && reasonData.length > 0 ? reasonData : [`${topCareer} currently has the strongest score match.`];
  const detailsCareer = assessmentTopPath || topCareer;
  const activeCareerDetails = careerDetailLibrary[detailsCareer] || careerDetailLibrary.Engineering;
  const topRecommendations = rankedCareers.slice(0, 4);
  const topRecommendation = topRecommendations[0] || { career: topCareer, score: Number(topScore) || 0 };
  const secondRecommendation = topRecommendations[1] || null;
  const recommendationGap = secondRecommendation ? Number(topRecommendation.score) - Number(secondRecommendation.score) : Number(topRecommendation.score);
  const recommendationConfidence = recommendationGap >= 12 ? 'High confidence fit' : recommendationGap >= 6 ? 'Stable fit' : 'Close competition';
  const recommendationMessage =
    recommendationGap >= 12
      ? `${topRecommendation.career} is clearly the best option for this student right now.`
      : recommendationGap >= 6
        ? `${topRecommendation.career} is currently the better path, with a meaningful lead.`
        : `${topRecommendation.career} is best for now, but ${secondRecommendation?.career || 'the next option'} is close.`;

  const getReadinessTag = (score) => {
    const value = Number(score) || 0;

    if (value >= 75) return 'Strong Ready';
    if (value >= 60) return 'Growth Ready';
    return 'Needs Foundation';
  };

  if (featureTitle === 'Study Planner' && isEbookPrepOpen && activeEbook) {
    return (
      <main className="feature-page-shell">
        <section className="feature-page-hero">
          <div>
            <p className="eyebrow">E-Book Preparation Page</p>
            <h1>{activeEbook.title}</h1>
            <p>
              {activeEbook.subject} for {activeEbook.exam} ({plannerGoal} stream)
            </p>
          </div>
          <div className="feature-page-summary">
            <span>Current focus</span>
            <strong>{activeEbook.exam}</strong>
            <p>Use this page to prepare everything needed to crack the selected exam.</p>
          </div>
        </section>

        <section className="feature-page-actions">
          <button type="button" className="secondary" onClick={() => setIsEbookPrepOpen(false)}>
            Back to E-Books
          </button>
          <button type="button" className="map-link-button" onClick={() => openBestPdf(activeEbook)}>
            Open E-Book PDF
          </button>
          <a href={activeEbook.source?.url} target="_blank" rel="noreferrer" className="map-link-button secondary-link">
            {activeEbook.source?.label || 'Source'}
          </a>
          <button type="button" className="secondary" onClick={() => window.print()}>
            Print Prep Plan
          </button>
        </section>

        <section className="feature-detail-grid">
          <article className="feature-detail-panel">
            <h2>{activeExamPlaybook.title}</h2>
            <ul className="feature-list-grid stacked">
              {activeExamPlaybook.monthlyPlan.map((point) => (
                <li key={point}>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="feature-detail-panel soft-panel">
            <h2>All-in-one source hub</h2>
            <p>
              Selected source: <strong>{activeEbook.source?.label || 'Indian institutional source'}</strong>
            </p>
            <div className="prep-link-grid">
              {matchingEbookSources.map((source) => (
                <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="prep-link-chip">
                  <SourceLogo badge={source.badge || 'IND'} />
                  {source.label}
                </a>
              ))}
              {streamResources.map((source) => (
                <a key={source.label} href={source.url} target="_blank" rel="noreferrer" className="prep-link-chip">
                  <SourceLogo badge={getSourceBadge(source.label, source.url)} />
                  {source.label}
                </a>
              ))}
            </div>
            <p>These are official or free learning sources aligned with your selected stream and exam path.</p>
          </article>
        </section>

        <section className="feature-detail-grid">
          <article className="feature-detail-panel">
            <h2>Topics to master</h2>
            <ul className="feature-list-grid stacked">
              {activeEbook.requirements.topics.map((topic) => (
                <li key={topic}>
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="feature-detail-panel soft-panel">
            <h2>Required resources</h2>
            <ul className="feature-list-grid stacked">
              {activeEbook.requirements.resources.map((resource) => (
                <li key={resource}>
                  <span>{resource}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="feature-detail-grid">
          <article className="feature-detail-panel">
            <h2>Execution strategy</h2>
            <ol className="plan-list">
              {activeEbook.requirements.strategy.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>

          <article className="feature-detail-panel soft-panel">
            <h2>Mock test rhythm</h2>
            <ul className="feature-list-grid stacked">
              {activeEbook.requirements.mockPlan.map((item) => (
                <li key={item}>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <h2>Exam day strategy</h2>
            <ul className="feature-list-grid stacked">
              {activeExamPlaybook.testDay.map((item) => (
                <li key={item}>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <h2>Required toolkit</h2>
            <ul className="feature-list-grid stacked">
              {activeExamPlaybook.toolkit.map((item) => (
                <li key={item}>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>
              Author: <strong>{activeEbook.author}</strong> | Level: <strong>{activeEbook.level}</strong>
            </p>
          </article>
        </section>
      </main>
    );
  }

  return (
    <main className="feature-page-shell">
      <section className="feature-page-hero">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </div>
        <div className="feature-page-summary">
          <span>Current Top Match</span>
          <strong>
            {isLoadingData ? 'Loading...' : `${topCareer} (${formatPercent(topScore)})`}
          </strong>
          <p>Open this page to use the feature instead of only reading about it.</p>
        </div>
      </section>

      <section className="feature-page-actions">
        <button type="button" onClick={onBackHome} className="secondary">
          Back to Home
        </button>
        <button type="button" onClick={onRefreshRecommendation} disabled={isLoadingData}>
          {isLoadingData ? 'Refreshing...' : 'Refresh Recommendation'}
        </button>
      </section>

      {featureTitle === 'Smart Career Recommendation' && (
        <section className="feature-detail-grid">
          <article className="feature-detail-panel">
            <h2>Best career for this student</h2>
            <p>
              Based on the latest assessment, <strong>{topRecommendation.career}</strong> is currently the best-fit path with{' '}
              <strong>{formatPercent(topRecommendation.score)}</strong>.
            </p>
            <div className="assessment-focus-card">
              <div className="assessment-focus-head">
                <span>Suggested after assessment</span>
                <strong>{recommendationConfidence}</strong>
              </div>
              <p>{recommendationMessage}</p>
              <div className="metric-row">
                <div>
                  <span>Top fit score</span>
                  <strong>{formatPercent(topRecommendation.score)}</strong>
                </div>
                <div>
                  <span>Lead over next option</span>
                  <strong>{formatPercent(Math.max(0, recommendationGap))}</strong>
                </div>
              </div>
            </div>

            <ul className="feature-list-grid recommendation-rank-list">
              {topRecommendations.map((entry, index) => (
                <li key={entry.career}>
                  <div className="recommendation-rank-left">
                    <span className="rank-chip">#{index + 1}</span>
                    <span>{entry.career}</span>
                  </div>
                  <div className="recommendation-rank-right">
                    <em>{getReadinessTag(entry.score)}</em>
                    <strong>{formatPercent(entry.score)}</strong>
                  </div>
                </li>
              ))}
            </ul>
          </article>
          <article className="feature-detail-panel soft-panel">
            <h2>Recommendation guidance</h2>
            <p>
              Current assessment best fit: <strong>{assessmentTopPath}</strong>. Use this as the primary track.
            </p>
            {assessmentMarksPercent !== undefined && assessmentMarksPercent !== null && (
              <p>
                Recorded 12th marks percentage: <strong>{Number(assessmentMarksPercent).toFixed(2)}%</strong>
              </p>
            )}
            <p>Start preparation for the top fit first, and keep the second fit as backup if the gap is small.</p>
            <button type="button" onClick={onStartAssessment}>
              Start Assessment
            </button>
          </article>
        </section>
      )}

      {featureTitle === 'Explainable AI' && (
        <section className="feature-detail-grid">
          <article className="feature-detail-panel">
            <h2>Why the app picked this path</h2>
            <ul className="reason-chip-list">
              {currentReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </article>
          <article className="feature-detail-panel soft-panel">
            <h2>Explainability tip</h2>
            <p>Update interests, class level, or target career and refresh the recommendation to compare reasons again.</p>
          </article>
        </section>
      )}

      {featureTitle === 'Aptitude and Personality Test' && (
        <section className="feature-detail-grid">
          <article className="feature-detail-panel">
            <h2>Assessment preview</h2>
            <p>This test includes 20 guided questions that score engineering, medical, commerce, and design paths.</p>
            <div className="metric-row">
              <div>
                <span>Questions</span>
                <strong>20</strong>
              </div>
              <div>
                <span>Best current path</span>
                <strong>{assessmentTopPath}</strong>
              </div>
            </div>
          </article>
          <article className="feature-detail-panel soft-panel">
            <h2>Take the test</h2>
            <p>Open the assessment page to answer all questions and see the score breakdown.</p>
            <button type="button" onClick={onStartAssessment}>
              Open Assessment Page
            </button>
          </article>
        </section>
      )}

      {featureTitle === 'Multi-Career Comparison' && (
        <section className="feature-detail-grid">
          <article className="feature-detail-panel">
            <h2>Comparison view</h2>
            <div className="comparison-list">
              {comparisonPair.map((entry) => (
                <div key={entry.career}>
                  <div className="score-meta">
                    <span>{entry.career}</span>
                    <strong>{formatPercent(entry.score)}</strong>
                  </div>
                  <div className="score-track">
                    <div className="score-fill" style={{ width: formatPercent(entry.score) }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
          <article className="feature-detail-panel soft-panel">
            <h2>Decision help</h2>
            <p>Use the highest bar as the recommended path and the second bar as the backup option.</p>
          </article>
        </section>
      )}

      {featureTitle === 'College Recommendation' && (
        <section className="feature-detail-grid">
          <article className="feature-detail-panel">
            <div className="feature-panel-heading">
              <div>
                <h2>College shortlist</h2>
                <p>Search colleges by stream, location, and recommendation fit.</p>
              </div>
              <span className="count-pill">{matchingColleges.length} colleges</span>
            </div>

            <div className="college-filters">
              <div>
                <label className="field-label" htmlFor="collegeStream">
                  Stream
                </label>
                <select
                  id="collegeStream"
                  className="feature-input"
                  value={selectedStream}
                  onChange={(event) => setSelectedStream(event.target.value)}
                >
                  {[...new Set(collegeDirectory.map((college) => college.stream))].map((stream) => (
                    <option key={stream} value={stream}>
                      {stream}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label" htmlFor="institutionType">
                  College or university
                </label>
                <select
                  id="institutionType"
                  className="feature-input"
                  value={selectedInstitutionType}
                  onChange={(event) => setSelectedInstitutionType(event.target.value)}
                >
                  <option value="All">All India choices</option>
                  <option value="College">College</option>
                  <option value="University">University</option>
                  <option value="Institute">Institute</option>
                </select>
              </div>

              <div>
                <label className="field-label" htmlFor="collegeLocation">
                  Preferred location or college name
                </label>
                <input
                  id="collegeLocation"
                  className="feature-input"
                  type="text"
                  value={collegeLocation}
                  onChange={(event) => setCollegeLocation(event.target.value)}
                  placeholder="Enter a city, state, or college name"
                />
              </div>
            </div>

            <div className="college-results">
              {matchingColleges.length === 0 ? (
                <p className="muted">
                  No colleges matched this search. Try another city, state, or stream.
                </p>
              ) : (
                matchingColleges.map((college) => {
                  const isSelected = selectedCollege?.id === college.id;
                  const collegeMapLink = buildGoogleMapsSearchUrl(`${college.name}, ${college.city}, ${college.state}`);

                  return (
                    <button
                      type="button"
                      key={college.id}
                      className={`college-card ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedCollegeId(college.id)}
                    >
                      <img className="college-card-image" src={college.imageUrl} alt={college.name} />
                      <div className="college-card-body">
                        <div className="college-card-topline">
                          <span>{college.stream}</span>
                          <strong>
                            {college.city}, {college.state}
                          </strong>
                        </div>
                        <h3>{college.name}</h3>
                        <p>{college.highlights}</p>
                        <div className="college-card-links">
                          <a href={collegeMapLink} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
                            Google Map
                          </a>
                          <a href={buildBrochureSearchUrl(college.name)} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
                            Brochure PDF
                          </a>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </article>
          <article className="feature-detail-panel soft-panel college-map-panel">
            <div className="feature-panel-heading">
              <div>
                <h2>Use your profile location</h2>
                <p>Linked to Google Maps with zoom control and selected college preview.</p>
              </div>
              <span className="count-pill light">{profileData.location || 'Profile location not set'}</span>
            </div>

            <div className="selected-college-card">
              {selectedCollege ? (
                <>
                  <img src={selectedCollege.imageUrl} alt={selectedCollege.name} className="selected-college-image" />
                  <div>
                    <p className="eyebrow">Selected college</p>
                    <h3>{selectedCollege.name}</h3>
                    <p>
                      {selectedCollege.city}, {selectedCollege.state}
                    </p>
                    <p>{selectedCollege.highlights}</p>
                  </div>
                </>
              ) : (
                <p className="muted">Start searching to see a college preview here.</p>
              )}
            </div>

            <div className="college-map-toolbar">
              <label className="field-label" htmlFor="collegeZoom">
                Zoom level: {mapZoom}
              </label>
              <input
                id="collegeZoom"
                className="feature-slider"
                type="range"
                min="6"
                max="18"
                value={mapZoom}
                onChange={(event) => setMapZoom(Number(event.target.value))}
              />
            </div>

            <iframe
              title="College map preview"
              src={collegeMapUrl}
              className="college-map-frame"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            <div className="college-map-actions">
              <a href={collegeMapSearchUrl} target="_blank" rel="noreferrer" className="map-link-button">
                Open in Google Maps
              </a>
              {selectedCollege && (
                <a
                  href={buildBrochureSearchUrl(selectedCollege.name)}
                  target="_blank"
                  rel="noreferrer"
                  className="map-link-button secondary-link"
                >
                  Find Brochure PDF
                </a>
              )}
            </div>

            <p className="college-map-note">
              Recommended stream: <strong>{topCareer}</strong>. Use your profile location and search field to find colleges by city, state, or college name.
            </p>
          </article>
        </section>
      )}

      {featureTitle === 'Study Planner' && (
        <>
          <section className="feature-detail-grid study-planner-grid">
            <article className="feature-detail-panel">
              <h2>Weekly study plan</h2>
              <label className="field-label" htmlFor="plannerGoal">
                Focus path
              </label>
              <select
                id="plannerGoal"
                className="feature-input"
                value={plannerGoal}
                onChange={(event) => setPlannerGoal(event.target.value)}
              >
                {careerPriority.map((career) => (
                  <option key={career} value={career}>
                    {career}
                  </option>
                ))}
              </select>
              <ol className="plan-list">
                {studyPlan.map((item, index) => (
                  <li key={item}>
                    <strong>Day {index + 1}:</strong> {item}
                  </li>
                ))}
              </ol>
            </article>
            <article className="feature-detail-panel soft-panel">
              <h2>E-Books</h2>
              <label className="field-label" htmlFor="ebookStreamFilter">
                Stream choice
              </label>
              <select
                id="ebookStreamFilter"
                className="feature-input"
                value={ebookStreamFilter}
                onChange={(event) => setEbookStreamFilter(event.target.value)}
              >
                {ebookStreamOptions.map((stream) => (
                  <option key={stream} value={stream}>
                    {stream}
                  </option>
                ))}
              </select>
              <label className="field-label" htmlFor="plannerSubject">
                Subject choice
              </label>
              <select
                id="plannerSubject"
                className="feature-input"
                value={plannerSubject}
                onChange={(event) => setPlannerSubject(event.target.value)}
              >
                {subjectOptions.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>

              <label className="field-label" htmlFor="ebookSearchQuery">
                Search books, exam names, or sources
              </label>
              <input
                id="ebookSearchQuery"
                className="feature-input"
                type="text"
                value={ebookSearchQuery}
                onChange={(event) => setEbookSearchQuery(event.target.value)}
                placeholder="Example: NCERT, JEE, NIFT, IIT Bombay"
              />

              <div className="ebook-grid" role="list">
                {displayedEbooks.length === 0 ? (
                  <div className="ebook-empty" role="status" aria-live="polite">
                    <h3>No books found for this selection</h3>
                    <p>Try another subject or clear search to see available books for this stream.</p>
                    <div className="ebook-empty-suggestions">
                      {subjectOptions
                        .filter((subject) => subject !== 'All Subjects')
                        .map((subject) => (
                          <button key={subject} type="button" className="secondary" onClick={() => setPlannerSubject(subject)}>
                            {subject}
                          </button>
                        ))}
                    </div>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => {
                        setPlannerSubject('All Subjects');
                        setEbookSearchQuery('');
                      }}
                    >
                      Reset Subject and Search
                    </button>
                  </div>
                ) : (
                  displayedEbooks.map((book) => (
                    <button
                      key={book.id}
                      type="button"
                      className={`ebook-card ${coverToneClass[book.coverTone] || 'book-tone-blue'}`}
                      onClick={() => {
                        setActiveEbookId(book.id);
                        setIsEbookPrepOpen(true);
                      }}
                    >
                      <span className="ebook-spine" aria-hidden="true" />
                      <div className="ebook-content">
                        <p className="ebook-subject">{book.subject}</p>
                        <h3>{book.title}</h3>
                        <p>{book.exam}</p>
                        <span className="ebook-source">
                          <SourceLogo badge={getSourceBadge(book.source?.label, book.source?.url)} />
                          {book.source?.label || 'Indian source'}
                        </span>
                        <span className="ebook-source-detail">{book.source?.description || resolveEbookAsset(book).sourceDescription}</span>
                        <span className="ebook-open">Open preparation page</span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="ebook-source-summary">
                <h3>All matching sources</h3>
                {normalizedEbookSearch ? (
                  matchingEbookSources.length === 0 ? (
                    <p className="muted">No source matched this search. Try a different keyword or stream.</p>
                  ) : (
                    <div className="prep-link-grid">
                      {matchingEbookSources.map((source) => (
                        <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="prep-link-chip">
                          <SourceLogo badge={source.badge || 'IND'} />
                          {source.label}
                        </a>
                      ))}
                      {streamResources.map((source) => (
                        <a key={source.label} href={source.url} target="_blank" rel="noreferrer" className="prep-link-chip">
                          <SourceLogo badge={getSourceBadge(source.label, source.url)} />
                          {source.label}
                        </a>
                      ))}
                    </div>
                  )
                ) : matchingEbookSources.length === 0 ? (
                  <p className="muted">No source matched this search. Try a different subject or keyword.</p>
                ) : (
                  <div className="prep-link-grid">
                    {matchingEbookSources.map((source) => (
                      <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="prep-link-chip">
                        <SourceLogo badge={source.badge || 'IND'} />
                        {source.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </article>
          </section>
        </>
      )}

      {featureTitle === 'What-If Analysis' && (
        <>
          <section className="feature-detail-grid">
            <article className="feature-detail-panel">
              <h2>Scenario simulator</h2>
              <label className="field-label" htmlFor="scenarioShift">
                Interest boost
              </label>
              <input
                id="scenarioShift"
                className="feature-slider"
                type="range"
                min="0"
                max="30"
                value={scenarioShift}
                onChange={(event) => setScenarioShift(Number(event.target.value))}
              />
              <div className="metric-row scenario-metrics">
                <div>
                  <span>Boost</span>
                  <strong>{scenarioShift}</strong>
                </div>
                <div>
                  <span>New top path</span>
                  <strong>{scenarioRanking[0]?.career}</strong>
                </div>
              </div>
              <ul className="feature-list-grid stacked">
                {scenarioRanking.map((entry) => (
                  <li key={entry.career}>
                    <span>{entry.career}</span>
                    <strong>{formatPercent(entry.score)}</strong>
                  </li>
                ))}
              </ul>
            </article>
            <article className="feature-detail-panel soft-panel">
              <h2>How to use it</h2>
              <p>Change the slider to simulate a stronger interest in a subject cluster and compare the outcome.</p>
            </article>
          </section>

          <section className="feature-detail-grid">
            <article className="feature-detail-panel tracker-panel">
              <div className="feature-panel-heading">
                <div>
                  <h2>Progress Tracker</h2>
                  <p>Track completed tasks, study hours, and syllabus progress for your active plan.</p>
                </div>
                <span className="count-pill">{completionPercent}% task completion</span>
              </div>

              <div className="daily-task-progress">
                <div className="daily-progress-head">
                  <span>Daily task progress</span>
                  <strong>{completionPercent}%</strong>
                </div>
                <div className="daily-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completionPercent}>
                  <div className="daily-progress-fill" style={{ width: `${completionPercent}%` }} />
                </div>
                <p className="daily-progress-note">{dailyProgressMessage}</p>
              </div>

              <div className="tracker-metrics">
                <div className="tracker-metric-card">
                  <span>Completed tasks</span>
                  <strong>
                    {completedPlanItems.length}/{studyPlan.length}
                  </strong>
                </div>
                <div className="tracker-metric-card">
                  <span>Study hours today</span>
                  <strong>{studyHours}h</strong>
                </div>
                <div className="tracker-metric-card">
                  <span>Syllabus done</span>
                  <strong>{syllabusDone}%</strong>
                </div>
              </div>

              <div className="tracker-controls">
                <label className="field-label" htmlFor="studyHoursWhatIf">
                  Study hours (today)
                </label>
                <input
                  id="studyHoursWhatIf"
                  className="feature-input"
                  type="number"
                  min="0"
                  max="16"
                  value={studyHours}
                  onChange={(event) => setStudyHours(Math.max(0, Math.min(16, Number(event.target.value) || 0)))}
                />

                <label className="field-label" htmlFor="syllabusDoneWhatIf">
                  Syllabus completion
                </label>
                <input
                  id="syllabusDoneWhatIf"
                  className="feature-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={syllabusDone}
                  onChange={(event) => setSyllabusDone(Number(event.target.value))}
                />
              </div>

              <div className="tracker-checklist">
                {studyPlan.map((task, index) => {
                  const planKey = `Day ${index + 1}: ${task}`;
                  const isDone = completedPlanItems.includes(planKey);

                  return (
                    <label key={planKey} className={`tracker-task ${isDone ? 'done' : ''}`}>
                      <input type="checkbox" checked={isDone} onChange={() => togglePlanItem(planKey)} />
                      <span>
                        <strong>Day {index + 1}</strong> {task}
                      </span>
                    </label>
                  );
                })}
              </div>
            </article>

            <article className="feature-detail-panel soft-panel weakness-panel">
              <div className="feature-panel-heading">
                <div>
                  <h2>Weakness Analyzer</h2>
                  <p>Subjects with score below 60 are marked as weak and prioritized for recovery.</p>
                </div>
                <span className={`count-pill ${weakSubjects.length > 0 ? 'weak' : 'strong'}`}>
                  {weakSubjects.length > 0 ? `${weakSubjects.length} weak subject(s)` : 'No weak subjects'}
                </span>
              </div>

              <div className="weakness-input-grid">
                {trackerSubjects.map((subject) => {
                  const score = Number(subjectScores[subject] ?? 0);
                  const isWeak = score < 60;

                  return (
                    <div key={subject} className={`weakness-input-card ${isWeak ? 'is-weak' : 'is-strong'}`}>
                      <div className="score-meta">
                        <span>{subject}</span>
                        <strong>{score}%</strong>
                      </div>
                      <input
                        className="feature-slider"
                        type="range"
                        min="0"
                        max="100"
                        value={score}
                        onChange={(event) => {
                          const nextScore = Number(event.target.value);
                          setSubjectScores((prev) => ({ ...prev, [subject]: nextScore }));
                        }}
                      />
                      <p className="weakness-status">{isWeak ? 'Weak: needs daily revision focus' : 'Healthy: maintain momentum'}</p>
                    </div>
                  );
                })}
              </div>

              {weakSubjects.length > 0 ? (
                <div className="weakness-alert-box">
                  <p>
                    <strong>Detected weakness:</strong> {weakSubjects.map(([subject, score]) => `${subject} (${score}%)`).join(', ')}.
                  </p>
                  <p>Example rule applied: Maths less than 60 is marked weak and added to your priority revision queue.</p>
                </div>
              ) : (
                <p className="muted">All tracked subjects are at or above 60. Keep weekly mocks running.</p>
              )}
            </article>
          </section>
        </>
      )}

      {featureTitle === 'Career Details' && (
        <section className="feature-detail-grid">
          <article className="feature-detail-panel">
            <h2>{detailsCareer} career guide</h2>
            <p className="career-details-intro">
              Based on the latest assessment result, <strong>{detailsCareer}</strong> is your best-fit path.
            </p>
            <div className="assessment-focus-card">
              <div className="assessment-focus-head">
                <span>Connected to assessment result</span>
                <strong>{assessmentTopPath}</strong>
              </div>
              <p>{activeCareerDetails.tagline}</p>
              <p>
                If you consistently follow this track after 12th, you can build a strong long-term career in <strong>{detailsCareer}</strong>.
              </p>
            </div>
            <ul className="feature-list-grid stacked">
              <li>
                <span>Best degree paths</span>
                <strong>{activeCareerDetails.degreePaths.join(' | ')}</strong>
              </li>
              <li>
                <span>Main entrance exams</span>
                <strong>{activeCareerDetails.entranceExams.join(' | ')}</strong>
              </li>
              <li>
                <span>What you can become after study</span>
                <strong>{activeCareerDetails.afterStudy.join(' | ')}</strong>
              </li>
            </ul>
          </article>
          <article className="feature-detail-panel soft-panel">
            <h2>Life and growth roadmap</h2>
            <ul className="feature-list-grid stacked">
              {activeCareerDetails.firstFiveYears.map((step) => (
                <li key={step}>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
            <h2>Life outcomes if you follow this path</h2>
            <ul className="feature-list-grid stacked">
              {activeCareerDetails.lifeOutcomes.map((item) => (
                <li key={item}>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <h2>Helping details and support plan</h2>
            <ul className="feature-list-grid stacked">
              {activeCareerDetails.supportPlan.map((item) => (
                <li key={item}>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>
      )}
    </main>
  );
}

export default FeatureDetailPage;