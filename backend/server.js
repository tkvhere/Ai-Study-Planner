const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const {
  initializeDatabase,
  createUser,
  getUserByEmail,
  getAllUsers,
  getProfileByEmail,
  createOrUpdateProfile,
  getPracticeProgressByEmail,
  upsertPracticeProgressResult,
} = require('./database');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const hashPassword = (password, salt) => {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
};

const chatProvider = String(process.env.CHAT_PROVIDER || 'openai').trim().toLowerCase();
const openAiApiKey = process.env.OPENAI_API_KEY || '';
const openAiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

const isValidEmail = (value) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const careerAliases = {
  engineering: ['engineering', 'engineer', 'btech', 'technology'],
  medical: ['medical', 'doctor', 'mbbs', 'healthcare'],
  commerce: ['commerce', 'bcom', 'business', 'finance', 'accounting'],
  design: ['design', 'designer', 'architecture', 'animation', 'ui', 'ux'],
};

const recommendationTemplates = {
  Engineering: {
    baseScore: 78,
    reasons: [
      'Engineering alignment increases with problem-solving and mathematics focus.',
      'Technical pathways stay strong when you practice logic, coding, or applied science regularly.',
    ],
    questions: [
      'How confident are you in Physics and Mathematics fundamentals?',
      'Do you prefer building systems, software, or machines?',
      'How many hours per week can you commit to entrance exam practice?',
      'Which branch attracts you most: CSE, Mechanical, Civil, Electrical, or AI?',
    ],
  },
  Medical: {
    baseScore: 74,
    reasons: [
      'Medical pathways are a strong fit when biology understanding and discipline are high.',
      'Healthcare careers reward consistency, empathy, and long-term study commitment.',
    ],
    questions: [
      'How comfortable are you with Biology and Chemistry depth topics?',
      'Can you sustain a long preparation cycle for NEET-level exams?',
      'Do you enjoy patient care, diagnostics, or medical research work?',
      'Are you open to long-duration professional studies after 12th?',
    ],
  },
  Commerce: {
    baseScore: 70,
    reasons: [
      'Commerce alignment rises when you enjoy numbers, business contexts, and decision-making.',
      'This path is flexible for CA, management, banking, and entrepreneurship tracks.',
    ],
    questions: [
      'Do you enjoy accountancy, economics, and business case analysis?',
      'Are you aiming for CA, BBA, BCom, or finance-focused degrees?',
      'How interested are you in market trends and business strategy?',
      'Would you prefer corporate jobs, family business, or startup roles?',
    ],
  },
  Design: {
    baseScore: 66,
    reasons: [
      'Design alignment improves with creativity, visual communication, and portfolio strength.',
      'This track grows quickly when you combine artistic thinking with digital tools.',
    ],
    questions: [
      'Do you enjoy visual storytelling, sketching, or interface design?',
      'How strong is your current design portfolio or project collection?',
      'Are you interested in product, graphic, fashion, or UX design?',
      'Can you dedicate weekly time to portfolio and design tool practice?',
    ],
  },
};

const normalizeTargetCareer = (value) => {
  const text = String(value || '').trim().toLowerCase();

  if (!text) {
    return '';
  }

  const aliasEntry = Object.entries(careerAliases).find(([, aliases]) =>
    aliases.some((alias) => text.includes(alias)),
  );

  if (!aliasEntry) {
    return '';
  }

  const [matchedKey] = aliasEntry;

  if (matchedKey === 'engineering') {
    return 'Engineering';
  }
  if (matchedKey === 'medical') {
    return 'Medical';
  }
  if (matchedKey === 'commerce') {
    return 'Commerce';
  }
  if (matchedKey === 'design') {
    return 'Design';
  }

  return '';
};

const buildRecommendedCareers = ({ targetCareer, classLevel, interests }) => {
  const careers = {
    Engineering: recommendationTemplates.Engineering.baseScore,
    Medical: recommendationTemplates.Medical.baseScore,
    Commerce: recommendationTemplates.Commerce.baseScore,
    Design: recommendationTemplates.Design.baseScore,
  };

  const normalizedClass = String(classLevel || '').trim().toLowerCase();
  const normalizedInterests = String(interests || '').trim().toLowerCase();
  const preferredCareer = normalizeTargetCareer(targetCareer);

  if (preferredCareer) {
    careers[preferredCareer] = Math.min(careers[preferredCareer] + 16, 95);
  }

  if (normalizedClass.includes('12')) {
    careers.Engineering += 2;
    careers.Medical += 2;
  }

  if (normalizedInterests.includes('math') || normalizedInterests.includes('coding')) {
    careers.Engineering += 6;
  }
  if (normalizedInterests.includes('bio')) {
    careers.Medical += 6;
  }
  if (normalizedInterests.includes('business') || normalizedInterests.includes('finance')) {
    careers.Commerce += 6;
  }
  if (normalizedInterests.includes('design') || normalizedInterests.includes('creative')) {
    careers.Design += 6;
  }

  return Object.fromEntries(Object.entries(careers).map(([career, score]) => [career, Math.min(score, 96)]));
};

const buildRecommendationReasons = ({ targetCareer, location }) => {
  const preferredCareer = normalizeTargetCareer(targetCareer);
  const normalizedLocation = String(location || '').trim();

  if (!preferredCareer) {
    return [
      'Set your preferred college path after 12th to unlock highly personalized assessment.',
      'Current results use general aptitude and interest balancing across popular streams.',
    ];
  }

  const templateReasons = recommendationTemplates[preferredCareer].reasons;

  return [
    `Recommendations are prioritized for your selected path: ${preferredCareer}.`,
    ...templateReasons,
    normalizedLocation
      ? `College suggestions will favor institutes around your preferred location: ${normalizedLocation}.`
      : 'Add a preferred location to refine college-level suggestions further.',
  ];
};

const buildAssessmentQuestions = ({ targetCareer }) => {
  const preferredCareer = normalizeTargetCareer(targetCareer);

  if (!preferredCareer) {
    return [
      'Which stream are you targeting after 12th: Engineering, Medical, Commerce, or Design?',
      'Which 3 subjects are your strongest right now?',
      'How many hours can you consistently study on weekdays?',
      'Which city or state do you prefer for college?',
    ];
  }

  return recommendationTemplates[preferredCareer].questions;
};

// Initialize database on startup
let dbReady = false;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildStudyPlannerPrompt = (message) => {
  return [
    'You are an academic guidance assistant for students.',
    'Keep responses concise, practical, and supportive.',
    'Focus on study planning, career guidance, skill-building, and exam preparation.',
    `Student message: ${message}`,
  ].join('\n');
};

const requestOpenAiReply = async (message, history = []) => {
  if (!openAiApiKey) {
    throw new Error('OpenAI API key is missing. Set OPENAI_API_KEY in backend environment.');
  }

  const normalizedHistory = Array.isArray(history)
    ? history
        .slice(-8)
        .filter((entry) => entry && typeof entry.role === 'string' && typeof entry.text === 'string')
        .map((entry) => ({ role: entry.role === 'assistant' ? 'assistant' : 'user', content: entry.text }))
    : [];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openAiApiKey}`,
    },
    body: JSON.stringify({
      model: openAiModel,
      messages: [
        {
          role: 'system',
          content:
            'You are an AI Study Planner assistant. Give clear, step-by-step and student-friendly advice. Keep answers short unless asked for detail.',
        },
        ...normalizedHistory,
        { role: 'user', content: message },
      ],
      temperature: 0.6,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'OpenAI request failed.');
  }

  return payload?.choices?.[0]?.message?.content?.trim() || 'I could not generate a response right now.';
};

const requestGeminiReply = async (message) => {
  if (!geminiApiKey) {
    throw new Error('Gemini API key is missing. Set GEMINI_API_KEY in backend environment.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: buildStudyPlannerPrompt(message) }],
        },
      ],
      generationConfig: {
        temperature: 0.6,
      },
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Gemini request failed.');
  }

  return payload?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'I could not generate a response right now.';
};

const requestChatReply = async (message, history) => {
  if (chatProvider === 'gemini') {
    return requestGeminiReply(message);
  }

  return requestOpenAiReply(message, history);
};

const requestOfflineReply = (message) => {
  const text = String(message || '').trim();
  const lowerText = text.toLowerCase();
  const marksMatch = lowerText.match(/(\d{2,3})\s*%/);
  const detectedMarks = marksMatch ? Number(marksMatch[1]) : null;

  if (lowerText.includes('12th') && detectedMarks !== null) {
    let adviceBand = 'Your score gives you many options, but you should build stronger fundamentals to widen top-college opportunities.';

    if (detectedMarks >= 90) {
      adviceBand = 'Your score is strong for competitive tracks. Focus on entrance strategy and consistency.';
    } else if (detectedMarks >= 75) {
      adviceBand = 'You have a good base. Smart planning can still get you into strong programs.';
    }

    return [
      `Great work scoring ${detectedMarks}% in 12th. ${adviceBand}`,
      'Next 4 steps:',
      '1. Pick your target track: Engineering, Medical, Commerce, Design, or General Degree.',
      '2. Shortlist 5 to 8 colleges and note their entrance exams and cutoff trends.',
      '3. Build a 12-week study plan: 2 hours concept revision, 1 hour practice, 30 minutes mock-analysis daily.',
      '4. Start skill-building now: communication, problem-solving, and one digital skill relevant to your track.',
      'If you tell me your stream and preferred career, I will give you an exact roadmap.',
    ].join('\n');
  }

  if (lowerText.includes('career') || lowerText.includes('which field') || lowerText.includes('what should i do')) {
    return [
      'I can help you choose a direction quickly.',
      'Share these 4 things and I will suggest the best options:',
      '1. Your stream and marks.',
      '2. Subjects you enjoy most.',
      '3. Budget and preferred city/state.',
      '4. Whether you prefer job-ready path or long-term higher studies.',
    ].join('\n');
  }

  if (lowerText.includes('study plan') || lowerText.includes('timetable') || lowerText.includes('schedule')) {
    return [
      'Use this simple daily plan:',
      '1. 90 min concept learning.',
      '2. 60 min problem practice.',
      '3. 30 min revision and mistake log.',
      '4. 20 min weekly reflection every Sunday.',
      'If you share your exam name, I can convert this into a weekly subject-wise timetable.',
    ].join('\n');
  }

  return [
    'I am ready to help with your studies and career planning.',
    'Tell me your class, stream, marks, and goal, and I will create a clear step-by-step plan for you.',
  ].join('\n');
};

const startServer = async () => {
  const maxAttempts = 10;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await initializeDatabase();
      dbReady = true;
      console.log('✓ Database initialized successfully.');

      app.listen(port, '0.0.0.0', () => {
        console.log(`Backend server listening on port ${port}`);
      });
      return;
    } catch (error) {
      console.error(`Failed to initialize database (attempt ${attempt}/${maxAttempts}):`, error.message);

      if (attempt === maxAttempts) {
        process.exit(1);
      }

      await sleep(3000);
    }
  }
};

app.get('/api/health', (req, res) => {
  if (dbReady) {
    res.status(200).json({ status: 'ok', database: 'connected' });
  } else {
    res.status(503).json({ status: 'not ready', message: 'Database still initializing' });
  }
});

app.get('/', (req, res) => {
  res.status(200).type('html').send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>AI Study Planner API</title>
      </head>
      <body style="font-family: Arial, sans-serif; padding: 24px;">
        <h1>AI Study Planner backend is running</h1>
        <p>The API is available here: <a href="/api/health">/api/health</a></p>
        <p>The frontend app runs at: <a href="http://localhost:3000">http://localhost:3000</a></p>
      </body>
    </html>
  `);
});

app.get('/api/auth/status', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json({
      setupRequired: false,
      totalUsers: users.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user count.', error: error.message });
  }
});

app.get('/api/recommendations', (req, res) => {
  const targetCareer = typeof req.query.targetCareer === 'string' ? req.query.targetCareer : '';
  const classLevel = typeof req.query.classLevel === 'string' ? req.query.classLevel : '';
  const interests = typeof req.query.interests === 'string' ? req.query.interests : '';
  const location = typeof req.query.location === 'string' ? req.query.location : '';

  return res.status(200).json({
    careers: buildRecommendedCareers({ targetCareer, classLevel, interests }),
    reasons: buildRecommendationReasons({ targetCareer, location }),
    assessmentQuestions: buildAssessmentQuestions({ targetCareer }),
    generatedAt: new Date().toISOString(),
  });
});

app.get('/api/profile', async (req, res) => {
  try {
    const email = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : '';

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: 'Valid email is required to load profile.',
      });
    }

    const profileRow = await getProfileByEmail(email);
    const profile = profileRow
      ? {
          fullName: profileRow.fullName || '',
          studentId: profileRow.studentId || '',
          program: profileRow.program || '',
          fatherName: profileRow.fatherName || '',
          motherName: profileRow.motherName || '',
          permanentAddress: profileRow.permanentAddress || '',
          correspondenceAddress: profileRow.correspondenceAddress || '',
          contactNo: profileRow.contactNo || '',
          email: profileRow.email || email,
          dateOfBirth: profileRow.dateOfBirth || '',
          gender: profileRow.gender || '',
          classLevel: profileRow.classLevel || '',
          interests: profileRow.interests || '',
          targetCareer: profileRow.targetCareer || '',
          location: profileRow.location || '',
          photoUrl: profileRow.photoUrl || '',
        }
      : {
          fullName: '',
          studentId: '',
          program: '',
          fatherName: '',
          motherName: '',
          permanentAddress: '',
          correspondenceAddress: '',
          contactNo: '',
          email: email,
          dateOfBirth: '',
          gender: '',
          classLevel: '',
          interests: '',
          targetCareer: '',
          location: '',
          photoUrl: '',
        };

    return res.status(200).json({
      email,
      profile,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error loading profile.', error: error.message });
  }
});

app.post('/api/profile', async (req, res) => {
  try {
    const { email, profile } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        message: 'Valid email is required to save profile.',
      });
    }

    if (!profile || typeof profile !== 'object') {
      return res.status(400).json({
        message: 'Profile object is required.',
      });
    }

    const normalizedProfile = {
      fullName: String(profile.fullName || '').trim(),
      studentId: String(profile.studentId || '').trim(),
      program: String(profile.program || '').trim(),
      fatherName: String(profile.fatherName || '').trim(),
      motherName: String(profile.motherName || '').trim(),
      permanentAddress: String(profile.permanentAddress || '').trim(),
      correspondenceAddress: String(profile.correspondenceAddress || '').trim(),
      contactNo: String(profile.contactNo || '').trim(),
      email: String(profile.email || normalizedEmail).trim(),
      dateOfBirth: String(profile.dateOfBirth || '').trim(),
      gender: String(profile.gender || '').trim(),
      classLevel: String(profile.classLevel || '').trim(),
      interests: String(profile.interests || '').trim(),
      targetCareer: String(profile.targetCareer || '').trim(),
      location: String(profile.location || '').trim(),
      photoUrl: String(profile.photoUrl || '').trim(),
    };

    await createOrUpdateProfile(normalizedEmail, normalizedProfile);

    return res.status(200).json({
      message: 'Profile saved successfully.',
      email: normalizedEmail,
      profile: normalizedProfile,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error saving profile.', error: error.message });
  }
});

app.get('/api/practice-progress', async (req, res) => {
  try {
    const email = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : '';

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Valid email is required to load practice progress.' });
    }

    const progress = await getPracticeProgressByEmail(email);
    return res.status(200).json({ email, progress });
  } catch (error) {
    return res.status(500).json({ message: 'Error loading practice progress.', error: error.message });
  }
});

app.post('/api/practice-progress', async (req, res) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const subject = typeof req.body?.subject === 'string' ? req.body.subject.trim() : '';
    const level = Number(req.body?.level);
    const score = Number(req.body?.score);

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Valid email is required to save practice progress.' });
    }

    if (!subject) {
      return res.status(400).json({ message: 'Subject is required.' });
    }

    if (!Number.isInteger(level) || level < 1 || level > 10) {
      return res.status(400).json({ message: 'Level must be an integer between 1 and 10.' });
    }

    if (Number.isNaN(score) || score < 0 || score > 100) {
      return res.status(400).json({ message: 'Score must be between 0 and 100.' });
    }

    const saved = await upsertPracticeProgressResult({
      email,
      subject,
      level,
      score,
      passed: score >= 60,
    });

    return res.status(200).json({ message: 'Practice progress saved.', progress: saved });
  } catch (error) {
    return res.status(500).json({ message: 'Error saving practice progress.', error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        message: 'Email and password are required.',
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        message: 'Please provide a valid email address.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters.',
      });
    }

    const existingUser = await getUserByEmail(normalizedEmail);

    if (!existingUser) {
      // Create new user
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = hashPassword(password, salt);
      await createUser(normalizedEmail, salt, passwordHash);

      return res.status(200).json({
        message: `New account created and logged in as ${normalizedEmail}.`,
        email: normalizedEmail,
        rememberMe: Boolean(rememberMe),
        token: crypto.randomBytes(24).toString('hex'),
      });
    }

    // Verify existing user password
    const incomingPasswordHash = hashPassword(password, existingUser.salt);

    if (incomingPasswordHash === existingUser.passwordHash) {
      return res.status(200).json({
        message: `Login successful. Welcome ${normalizedEmail}.`,
        email: normalizedEmail,
        rememberMe: Boolean(rememberMe),
        token: crypto.randomBytes(24).toString('hex'),
      });
    }

    return res.status(401).json({
      message: 'Invalid email or password.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Login error.', error: error.message });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const incomingMessage = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    const history = Array.isArray(req.body?.history) ? req.body.history : [];

    if (!incomingMessage) {
      return res.status(400).json({
        message: 'Chat message is required.',
      });
    }

    if (incomingMessage.length > 1500) {
      return res.status(400).json({
        message: 'Message is too long. Please keep it under 1500 characters.',
      });
    }

    try {
      const reply = await requestChatReply(incomingMessage, history);

      return res.status(200).json({
        provider: chatProvider,
        fallbackUsed: false,
        reply,
      });
    } catch (providerError) {
      const fallbackReply = requestOfflineReply(incomingMessage);

      return res.status(200).json({
        provider: `${chatProvider}-fallback`,
        fallbackUsed: true,
        reply: fallbackReply,
        warning: providerError.message,
      });
    }
  } catch (error) {
    const fallbackReply = requestOfflineReply(req.body?.message || '');

    return res.status(200).json({
      provider: 'offline-fallback',
      fallbackUsed: true,
      reply: fallbackReply,
      warning: error.message,
    });
  }
});

// Start server with database initialization
startServer().catch((error) => {
  console.error('Server startup error:', error);
  process.exit(1);
});
