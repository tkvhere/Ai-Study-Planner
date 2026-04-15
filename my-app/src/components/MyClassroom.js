import { useCallback, useEffect, useMemo, useState } from 'react';
import './MyClassroom.css';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
const difficultyLabels = ['Beginner', 'Easy', 'Medium', 'Medium-Hard', 'Hard', 'Very Hard', 'Expert', 'Advanced', 'Master', 'Championship'];
const difficultyColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#dc2626', '#991b1b', '#7c2d12', '#1e40af', '#0c4a6e'];
const passingPercent = 60;

const buildEmptyLevelState = () => {
  const levels = {};
  for (let level = 1; level <= 10; level += 1) {
    levels[level] = {
      level,
      attempts: 0,
      bestScore: null,
      latestScore: null,
      unlocked: level === 1,
      completed: false,
    };
  }
  return levels;
};

function MyClassroom({
  onBackHome,
  profileData,
  assessmentPerformance,
  currentUserEmail,
}) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [expandedClass, setExpandedClass] = useState(null);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [practiceProgress, setPracticeProgress] = useState({});
  const [isProgressLoading, setIsProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState('');

  const careerPath = profileData?.targetCareer || 'General';
  const marksPercentage = assessmentPerformance?.marks?.percentage || 0;
  const normalizedEmail = String(currentUserEmail || profileData?.email || '').trim().toLowerCase();

  // Sample curriculum data based on career path
  const curriculumData = useMemo(() => {
    const curricula = {
      Engineering: {
        subjects: ['Mathematics', 'Physics', 'Chemistry'],
        topicCount: 42,
        practiceProblems: 156,
      },
      Medical: {
        subjects: ['Biology', 'Chemistry', 'Physics'],
        topicCount: 38,
        practiceProblems: 124,
      },
      Commerce: {
        subjects: ['Accountancy', 'Economics', 'Business Studies'],
        topicCount: 36,
        practiceProblems: 98,
      },
      Design: {
        subjects: ['Design Fundamentals', 'Color Theory', 'Composition'],
        topicCount: 28,
        practiceProblems: 87,
      },
    };
    return curricula[careerPath] || curricula.Engineering;
  }, [careerPath]);

  const defaultProgress = useMemo(() => {
    const output = {};
    curriculumData.subjects.forEach((subject) => {
      output[subject] = buildEmptyLevelState();
    });
    return output;
  }, [curriculumData.subjects]);

  const mergeProgressRows = useCallback((rows) => {
    const merged = JSON.parse(JSON.stringify(defaultProgress));

    if (!Array.isArray(rows)) {
      return merged;
    }

    rows.forEach((row) => {
      const subject = String(row.subject || '');
      const level = Number(row.level);
      if (!merged[subject] || level < 1 || level > 10) {
        return;
      }

      merged[subject][level] = {
        level,
        attempts: Number(row.attempts) || 0,
        bestScore: row.bestScore === null || row.bestScore === undefined ? null : Number(row.bestScore),
        latestScore: row.latestScore === null || row.latestScore === undefined ? null : Number(row.latestScore),
        unlocked: Boolean(Number(row.unlocked)),
        completed: Boolean(Number(row.completed)),
      };
    });

    return merged;
  }, [defaultProgress]);

  const loadPracticeProgress = useCallback(async () => {
    if (!normalizedEmail) {
      setPracticeProgress(defaultProgress);
      setProgressError('Please log in to save and unlock practice levels.');
      return;
    }

    setIsProgressLoading(true);
    setProgressError('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/practice-progress?email=${encodeURIComponent(normalizedEmail)}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Unable to load practice progress.');
      }

      setPracticeProgress(mergeProgressRows(payload.progress));
    } catch (error) {
      setPracticeProgress(defaultProgress);
      setProgressError('Could not load saved progress. Local progression is active for now.');
    } finally {
      setIsProgressLoading(false);
    }
  }, [defaultProgress, mergeProgressRows, normalizedEmail]);

  useEffect(() => {
    loadPracticeProgress();
  }, [loadPracticeProgress]);

  // Generate MCQ questions for each difficulty level
  const generateMCQQuestions = (subject, level) => {
    const difficulties = ['Beginner', 'Easy', 'Medium', 'Medium-Hard', 'Hard', 'Very Hard', 'Expert', 'Advanced', 'Master', 'Championship'];
    const difficultyLabel = difficulties[level - 1];
    
    const questionBases = {
      Mathematics: [
        { q: 'What is 2+2?', opts: ['3', '4', '5', '6'], ans: 1 },
        { q: 'Solve: 5x + 10 = 30', opts: ['x=2', 'x=3', 'x=4', 'x=5'], ans: 3 },
        { q: 'Find the area of a circle with radius 5cm', opts: ['78.5 cm²', '70.5 cm²', '85.5 cm²', '65.5 cm²'], ans: 0 },
        { q: 'What is the derivative of x²?', opts: ['x', '2x', 'x/2', '2'], ans: 1 },
        { q: 'Solve: sin(90°) = ?', opts: ['0', '0.5', '1', '-1'], ans: 2 },
        { q: 'Find the root of x² - 4 = 0', opts: ['±1', '±2', '±3', '±4'], ans: 1 },
        { q: 'Integrate: ∫x dx', opts: ['x²', 'x²/2 + C', 'x + C', '2x + C'], ans: 1 },
        { q: 'What is log(100) to base 10?', opts: ['1', '2', '3', '10'], ans: 1 },
        { q: 'Solve: 2^x = 8', opts: ['2', '3', '4', '5'], ans: 1 },
        { q: 'Find the sum of an infinite geometric series with a=1, r=0.5', opts: ['2', '1', '0.5', 'Infinity'], ans: 0 },
      ],
      Physics: [
        { q: 'What is the SI unit of force?', opts: ['Gram', 'Newton', 'Joule', 'Pascal'], ans: 1 },
        { q: 'At what speed does light travel?', opts: ['3×10⁸ m/s', '3×10⁷ m/s', '3×10⁹ m/s', '3×10⁶ m/s'], ans: 0 },
        { q: 'What is the acceleration due to gravity?', opts: ['8.8 m/s²', '9.8 m/s²', '10.8 m/s²', '11.8 m/s²'], ans: 1 },
        { q: 'Calculate velocity of object after 5s with initial velocity 10 m/s and acceleration 2 m/s²', opts: ['20 m/s', '30 m/s', '40 m/s', '50 m/s'], ans: 0 },
        { q: 'What is the kinetic energy of a 2kg object moving at 5 m/s?', opts: ['15 J', '20 J', '25 J', '30 J'], ans: 2 },
        { q: 'Find the resistance when V=10V and I=2A', opts: ['2 Ω', '5 Ω', '10 Ω', '20 Ω'], ans: 1 },
        { q: 'What is the angle of refraction if incident angle is 30° and refractive index is 1.5?', opts: ['19.47°', '18.42°', '20.55°', '21.30°'], ans: 0 },
        { q: 'Calculate the work done by a 50N force over 10m distance', opts: ['400 J', '500 J', '600 J', '700 J'], ans: 1 },
        { q: 'Find the frequency of a wave with wavelength 2m and speed 10 m/s', opts: ['2 Hz', '3 Hz', '5 Hz', '10 Hz'], ans: 2 },
        { q: 'What is the period of oscillation for a spring with k=100 N/m and m=1kg?', opts: ['0.628s', '0.314s', '1.256s', '2.0s'], ans: 0 },
      ],
      Chemistry: [
        { q: 'What is the atomic number of Carbon?', opts: ['4', '6', '8', '12'], ans: 1 },
        { q: 'How many electrons does Oxygen have?', opts: ['6', '8', '10', '16'], ans: 1 },
        { q: 'What is the valency of Chlorine?', opts: ['1', '3', '5', '7'], ans: 0 },
        { q: 'Balance: H₂ + O₂ → H₂O', opts: ['1:1:2', '2:1:2', '3:1:3', '1:2:1'], ans: 1 },
        { q: 'What is the pH of pure water at 25°C?', opts: ['5', '6', '7', '8'], ans: 2 },
        { q: 'Calculate molarity of 58.5g NaCl dissolved in 1L water', opts: ['0.5 M', '1 M', '1.5 M', '2 M'], ans: 1 },
        { q: 'What is the oxidation state of chromium in K₂Cr₂O₇?', opts: ['+3', '+4', '+5', '+6'], ans: 3 },
        { q: 'How many moles of O₂ are produced from 2 moles of KMnO₄ decomposition?', opts: ['0.4 mol', '0.6 mol', '0.8 mol', '1.0 mol'], ans: 0 },
        { q: 'What is the hybridization of carbon in C₂H₄?', opts: ['sp', 'sp²', 'sp³', 'sp³d'], ans: 1 },
        { q: 'Calculate the solubility product (Ksp) given ion concentrations', opts: ['10⁻⁴', '10⁻⁶', '10⁻⁸', '10⁻¹⁰'], ans: 1 },
      ],
      Biology: [
        { q: 'What is the basic unit of life?', opts: ['Atom', 'Molecule', 'Cell', 'Organ'], ans: 2 },
        { q: 'How many chromosomes do humans have?', opts: ['23', '46', '48', '50'], ans: 1 },
        { q: 'Which organelle is responsible for energy production?', opts: ['Nucleus', 'Mitochondria', 'Ribosome', 'Lysosome'], ans: 1 },
        { q: 'What is the process by which plants make their own food?', opts: ['Respiration', 'Photosynthesis', 'Fermentation', 'Digestion'], ans: 1 },
        { q: 'How many stages does Mitosis have?', opts: ['2', '3', '4', '5'], ans: 2 },
        { q: 'What is the function of hemoglobin?', opts: ['Digestion', 'Oxygen transport', 'Immunity', 'Storage'], ans: 1 },
        { q: 'Which hormone regulates blood glucose levels?', opts: ['Thyroxine', 'Insulin', 'Adrenaline', 'Estrogen'], ans: 1 },
        { q: 'What is the genotype ratio in a monohybrid cross?', opts: ['1:1', '1:2:1', '3:1', '9:3:3:1'], ans: 2 },
        { q: 'What is the main function of the Golgi apparatus?', opts: ['Protein synthesis', 'Packaging proteins', 'Energy production', 'Waste removal'], ans: 1 },
        { q: 'How many ATP molecules are produced per glucose in aerobic respiration?', opts: ['4', '18', '30-32', '50'], ans: 2 },
      ],
    };

    const baseQuestions = questionBases[subject] || [];
    const questions = [];
    
    for (let i = 0; i < 10; i++) {
      const qBase = baseQuestions[i % baseQuestions.length];
      questions.push({
        id: i + 1,
        question: `[${difficultyLabel} Level] ${qBase.q}`,
        options: qBase.opts,
        correctAnswer: qBase.ans,
      });
    }
    
    return questions;
  };

  const handleStartPractice = (subject, level) => {
    const levelState = practiceProgress?.[subject]?.[level];
    if (levelState && !levelState.unlocked) {
      return;
    }

    setActiveAssessment({ subject, level });
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setAssessmentStarted(true);
    setAssessmentCompleted(false);
    setScore(0);
    setCorrectAnswersCount(0);
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleNextQuestion = () => {
    const questions = generateMCQQuestions(activeAssessment.subject, activeAssessment.level);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitAssessment = async () => {
    const questions = generateMCQQuestions(activeAssessment.subject, activeAssessment.level);
    let correctCount = 0;

    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    setScore(calculatedScore);
    setCorrectAnswersCount(correctCount);
    setAssessmentCompleted(true);

    setPracticeProgress((prevProgress) => {
      const nextProgress = JSON.parse(JSON.stringify(prevProgress || defaultProgress));
      const subject = activeAssessment.subject;
      const level = activeAssessment.level;

      const existing = nextProgress?.[subject]?.[level] || {
        level,
        attempts: 0,
        bestScore: null,
        latestScore: null,
        unlocked: level === 1,
        completed: false,
      };

      const passed = calculatedScore >= passingPercent;
      const bestScore = existing.bestScore === null ? calculatedScore : Math.max(existing.bestScore, calculatedScore);

      nextProgress[subject][level] = {
        ...existing,
        attempts: (existing.attempts || 0) + 1,
        latestScore: calculatedScore,
        bestScore,
        completed: existing.completed || passed,
        unlocked: true,
      };

      if (passed && level < 10) {
        nextProgress[subject][level + 1].unlocked = true;
      }

      return nextProgress;
    });

    if (!normalizedEmail) {
      return;
    }

    try {
      await fetch(`${apiBaseUrl}/api/practice-progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          subject: activeAssessment.subject,
          level: activeAssessment.level,
          score: calculatedScore,
          correctAnswers: correctCount,
          totalQuestions: questions.length,
        }),
      });
    } catch (error) {
      setProgressError('Progress was updated locally but could not be saved to backend.');
    }
  };

  const closeAssessment = () => {
    setActiveAssessment(null);
    setAssessmentStarted(false);
    setAssessmentCompleted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
  };

  const PracticeTest = () => {
    if (!activeAssessment) return null;

    if (!assessmentStarted) return null;

    const questions = generateMCQQuestions(activeAssessment.subject, activeAssessment.level);
    const currentQuestion = questions[currentQuestionIndex];
    const answered = selectedAnswers[currentQuestionIndex] !== undefined;

    if (assessmentCompleted) {
      return (
        <div className="assessment-modal-overlay" onClick={closeAssessment}>
          <div className="assessment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="assessment-result">
              <h2>Assessment Complete!</h2>
              <div className="result-score-circle">
                <span className="result-score">{score}%</span>
              </div>
              <p className="result-message">
                {score >= 80 ? 'Excellent result' : score >= passingPercent ? 'Good result' : 'Keep practicing'}
              </p>
              <div className="result-details">
                <p><strong>Subject:</strong> {activeAssessment.subject}</p>
                <p><strong>Level:</strong> {difficultyLabels[activeAssessment.level - 1]}</p>
                <p><strong>Correct Answers:</strong> {correctAnswersCount}/10</p>
                <p><strong>Status:</strong> {score >= passingPercent ? 'Passed' : 'Not Passed'}</p>
              </div>
              <button className="result-btn" onClick={closeAssessment}>Back to Practice</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="assessment-modal-overlay" onClick={closeAssessment}>
        <div className="assessment-modal" onClick={(e) => e.stopPropagation()}>
          <div className="assessment-header">
            <h2>{activeAssessment.subject} - Level {activeAssessment.level}</h2>
            <button className="close-modal-btn" onClick={closeAssessment}>×</button>
          </div>

          <div className="assessment-progress">
            <span>Question {currentQuestionIndex + 1}/10</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((currentQuestionIndex + 1) / 10) * 100}%` }} />
            </div>
          </div>

          <div className="question-container">
            <h3>{currentQuestion.question}</h3>
            <div className="options-grid">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  className={`option-btn ${selectedAnswers[currentQuestionIndex] === idx ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(currentQuestionIndex, idx)}
                >
                  <span className="option-letter">{String.fromCharCode(65 + idx)}.</span>
                  <span className="option-text">{option}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="assessment-actions">
            <button 
              className="nav-btn secondary" 
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              ← Previous
            </button>
            
            {currentQuestionIndex < 9 ? (
              <button 
                className="nav-btn"
                onClick={handleNextQuestion}
                disabled={!answered}
              >
                Next →
              </button>
            ) : (
              <button 
                className="nav-btn submit"
                onClick={handleSubmitAssessment}
              >
                Submit Test
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Today's lectures/classes
  const todaysLectures = [
    {
      id: 1,
      subject: curriculumData.subjects[0],
      time: '09:30-10:30',
      topic: `Advanced ${curriculumData.subjects[0]} Concepts`,
      type: 'video',
    },
    {
      id: 2,
      subject: curriculumData.subjects[1],
      time: '10:45-11:45',
      topic: `${curriculumData.subjects[1]} Problem Solving`,
      type: 'interactive',
    },
    {
      id: 3,
      subject: curriculumData.subjects[2],
      time: '13:30-14:30',
      topic: `${curriculumData.subjects[2]} Practical Session`,
      type: 'practical',
    },
  ];

  // Learning progress data (mock)
  const learningCurveData = [
    { month: 'Jan', [curriculumData.subjects[0]]: 60, [curriculumData.subjects[1]]: 55 },
    { month: 'Feb', [curriculumData.subjects[0]]: 70, [curriculumData.subjects[1]]: 65 },
    { month: 'Mar', [curriculumData.subjects[0]]: 75, [curriculumData.subjects[1]]: 72 },
    { month: 'Apr', [curriculumData.subjects[0]]: 82, [curriculumData.subjects[1]]: 78 },
    { month: 'May', [curriculumData.subjects[0]]: 88, [curriculumData.subjects[1]]: 85 },
  ];

  // Statistics
  const stats = {
    videoLectures: Math.floor(curriculumData.topicCount * 3.5),
    practiceQuestions: curriculumData.practiceProblems,
    answers: Math.floor(curriculumData.practiceProblems * 0.7),
    completedPercent: Math.floor(marksPercentage * 0.8),
    yourAverage: Math.floor(marksPercentage * 0.85),
  };

  const renderLearningCurve = () => {
    const maxValue = 100;
    const barWidth = 100 / learningCurveData.length;

    return (
      <div className="learning-curve-chart">
        <div className="chart-bars">
          {learningCurveData.map((data, idx) => {
            const value1 = data[curriculumData.subjects[0]];
            const value2 = data[curriculumData.subjects[1]];
            
            return (
              <div key={idx} className="bar-group" style={{ width: `${barWidth}%` }}>
                <div className="bar-pair">
                  <div 
                    className="bar subject-1" 
                    style={{ height: `${(value1 / maxValue) * 100}%` }}
                    title={`${curriculumData.subjects[0]}: ${value1}%`}
                  />
                  <div 
                    className="bar subject-2" 
                    style={{ height: `${(value2 / maxValue) * 100}%` }}
                    title={`${curriculumData.subjects[1]}: ${value2}%`}
                  />
                </div>
                <span className="bar-label">{data.month}</span>
              </div>
            );
          })}
        </div>
        <div className="chart-legend">
          <span><span className="dot subject-1-dot" />{curriculumData.subjects[0]}</span>
          <span><span className="dot subject-2-dot" />{curriculumData.subjects[1]}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="my-classroom-shell">
      <header className="classroom-header">
        <div className="header-content">
          <h1>My Classroom</h1>
          <p className="stream-label">{careerPath} Stream</p>
        </div>
        <button className="back-btn" onClick={onBackHome}>Back to Home</button>
      </header>

      <div className="classroom-container">
        {/* Left Sidebar Navigation */}
        <aside className="classroom-sidebar">
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveSection('dashboard')}
            >
              <span className="nav-icon">📊</span>
              Dashboard
            </button>
            <button
              className={`nav-item ${activeSection === 'progress' ? 'active' : ''}`}
              onClick={() => setActiveSection('progress')}
            >
              <span className="nav-icon">📈</span>
              Progress
            </button>
            <button
              className={`nav-item ${activeSection === 'practice' ? 'active' : ''}`}
              onClick={() => setActiveSection('practice')}
            >
              <span className="nav-icon">✏️</span>
              Practice
            </button>
            <button
              className={`nav-item ${activeSection === 'goals' ? 'active' : ''}`}
              onClick={() => setActiveSection('goals')}
            >
              <span className="nav-icon">🎯</span>
              Goals
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="classroom-main">
          {activeSection === 'dashboard' && (
            <div className="dashboard-section">
              {/* Today's Lectures */}
              <article className="content-card">
                <h2>Today's Lectures</h2>
                <div className="lectures-list">
                  {todaysLectures.map((lecture) => (
                    <div key={lecture.id} className="lecture-item">
                      <div className="lecture-meta">
                        <span className="lecture-subject">{lecture.subject}</span>
                        <span className="lecture-time">{lecture.time}</span>
                      </div>
                      <h4>{lecture.topic}</h4>
                      <button className="lecture-join-btn">Join Now →</button>
                    </div>
                  ))}
                </div>
              </article>

              {/* Learning Curve */}
              <article className="content-card wide">
                <h2>Learning Curve</h2>
                <p className="card-subtitle">Progress tracking across subjects</p>
                {renderLearningCurve()}
              </article>

              {/* Today's Classes */}
              <article className="content-card">
                <h2>Today's Classes</h2>
                <div className="classes-list">
                  {todaysLectures.map((lecture, idx) => (
                    <div key={lecture.id} className="class-item">
                      <div className="class-header">
                        <h4>{lecture.subject}</h4>
                        <span className="class-type">{lecture.type}</span>
                      </div>
                      <p className="class-topic">{lecture.topic}</p>
                      <div className="class-meta">
                        <span>{lecture.time}</span>
                        <button className="expand-btn" onClick={() => setExpandedClass(expandedClass === lecture.id ? null : lecture.id)}>
                          {expandedClass === lecture.id ? '−' : '+'}
                        </button>
                      </div>
                      {expandedClass === lecture.id && (
                        <div className="class-details">
                          <p>Topics covered: Introduction, Core concepts, Practice problems</p>
                          <button className="secondary-btn">View Materials</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </article>

              {/* Statistics */}
              <article className="content-card">
                <h2>Statistics</h2>
                <div className="stats-grid">
                  <div className="stat-block">
                    <div className="stat-icon">📹</div>
                    <div className="stat-content">
                      <p className="stat-label">Video Lectures</p>
                      <strong className="stat-value">{stats.videoLectures}</strong>
                    </div>
                  </div>
                  <div className="stat-block">
                    <div className="stat-icon">❓</div>
                    <div className="stat-content">
                      <p className="stat-label">Questions</p>
                      <strong className="stat-value">{stats.practiceQuestions}</strong>
                    </div>
                  </div>
                  <div className="stat-block">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                      <p className="stat-label">Answers</p>
                      <strong className="stat-value">{stats.answers}</strong>
                    </div>
                  </div>
                </div>
              </article>

              {/* Performance Metrics */}
              <article className="content-card">
                <h2>Performance</h2>
                <div className="performance-metrics">
                  <div className="metric-card orange">
                    <div className="metric-circle">
                      <span className="metric-value">{stats.completedPercent}%</span>
                    </div>
                    <p className="metric-label">Completed</p>
                  </div>
                  <div className="metric-card blue">
                    <div className="metric-circle">
                      <span className="metric-value">{stats.yourAverage}%</span>
                    </div>
                    <p className="metric-label">Your Average</p>
                  </div>
                </div>
              </article>
            </div>
          )}

          {activeSection === 'progress' && (
            <div className="progress-section">
              <article className="content-card wide">
                <h2>Learning Progress</h2>
                <p className="card-subtitle">Detailed progress across all subjects</p>
                {renderLearningCurve()}
                
                <div className="progress-details">
                  <h3>Subject-wise Progress</h3>
                  {curriculumData.subjects.map((subject, idx) => {
                    const latestData = learningCurveData[learningCurveData.length - 1];
                    const progress = latestData[subject] || 0;
                    return (
                      <div key={idx} className="progress-bar-item">
                        <div className="progress-header">
                          <span>{subject}</span>
                          <strong>{progress}%</strong>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            </div>
          )}

          {activeSection === 'practice' && (
            <div className="practice-section">
              {isProgressLoading && <p className="card-subtitle">Loading your saved practice progress...</p>}
              {progressError && <p className="practice-error-text">{progressError}</p>}
              {curriculumData.subjects.map((subject, subIdx) => (
                <article key={subIdx} className="content-card wide">
                  <h2>{subject} - Practice Levels</h2>
                  <p className="card-subtitle">10 progressive difficulty levels. Unlock next level by scoring {passingPercent}% or above.</p>
                  
                  <div className="difficulty-levels-grid">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
                      const levelState = practiceProgress?.[subject]?.[level] || defaultProgress?.[subject]?.[level];
                      const isUnlocked = Boolean(levelState?.unlocked);
                      const isCompleted = Boolean(levelState?.completed);
                      const attempts = Number(levelState?.attempts) || 0;
                      const bestScore = levelState?.bestScore;
                      
                      return (
                        <div
                          key={level}
                          className={`difficulty-card ${isUnlocked ? '' : 'locked'} ${isCompleted ? 'completed' : ''}`}
                          style={{ borderLeftColor: difficultyColors[level - 1] }}
                        >
                          <div className="level-badge" style={{ backgroundColor: difficultyColors[level - 1] }}>
                            Level {level}
                          </div>
                          <h3>{difficultyLabels[level - 1]}</h3>
                          <div className="level-info">
                            <p>10 MCQ Questions</p>
                            <p className="level-description">
                              {level <= 3 ? 'Foundation' : level <= 6 ? 'Intermediate' : 'Advanced'}
                            </p>
                            <p>Attempts: {attempts}</p>
                            <p>Best Score: {bestScore === null || bestScore === undefined ? '-' : `${bestScore}%`}</p>
                            <p>Status: {isCompleted ? 'Passed' : isUnlocked ? 'Unlocked' : 'Locked'}</p>
                          </div>
                          <button 
                            className="start-level-btn"
                            onClick={() => handleStartPractice(subject, level)}
                            disabled={!isUnlocked}
                            style={{ borderColor: difficultyColors[level - 1], color: difficultyColors[level - 1] }}
                          >
                            {isUnlocked ? 'Start Test ->' : 'Locked'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          )}

          {activeSection === 'goals' && (
            <div className="goals-section">
              <article className="content-card wide">
                <h2>Learning Goals</h2>
                <p className="card-subtitle">Week 2 Goals - {careerPath}</p>
                
                <div className="goals-container">
                  <div className="goal-item completed">
                    <h3>Complete Advanced Mathematics</h3>
                    <p>Finish chapter 5-7 with practice problems</p>
                    <span className="goal-status">✓ Completed</span>
                  </div>
                  <div className="goal-item in-progress">
                    <h3>Physics Laboratory Work</h3>
                    <p>5 experiments + comprehensive reports</p>
                    <span className="goal-status">In Progress (60%)</span>
                  </div>
                  <div className="goal-item pending">
                    <h3>Chemistry Revision Test</h3>
                    <p>Mock exam covering all topics</p>
                    <span className="goal-status">Upcoming</span>
                  </div>
                  <div className="goal-item pending">
                    <h3>Project Submission</h3>
                    <p>Career path related project work</p>
                    <span className="goal-status">Upcoming</span>
                  </div>
                </div>
              </article>
            </div>
          )}
        </main>
      </div>
      <PracticeTest />
    </div>
  );
}

export default MyClassroom;
