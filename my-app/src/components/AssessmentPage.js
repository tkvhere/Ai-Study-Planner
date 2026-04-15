import { useMemo, useState } from 'react';

const assessmentQuestions = [
  {
    id: 1,
    question: 'Which subject do you enjoy the most?',
    options: [
      { value: 'Engineering', label: 'Mathematics and Physics' },
      { value: 'Medical', label: 'Biology and Chemistry' },
      { value: 'Commerce', label: 'Accountancy and Economics' },
      { value: 'Design', label: 'Art and Visual Studies' },
    ],
  },
  {
    id: 2,
    question: 'What kind of work sounds most exciting to you?',
    options: [
      { value: 'Engineering', label: 'Building apps, machines, or systems' },
      { value: 'Medical', label: 'Helping patients and improving health' },
      { value: 'Commerce', label: 'Managing money and business decisions' },
      { value: 'Design', label: 'Creating user experiences and visual ideas' },
    ],
  },
  {
    id: 3,
    question: 'How do you usually solve problems?',
    options: [
      { value: 'Engineering', label: 'Use logic, formulas, and testing' },
      { value: 'Medical', label: 'Observe symptoms and identify causes' },
      { value: 'Commerce', label: 'Compare risk, profit, and outcomes' },
      { value: 'Design', label: 'Think creatively and prototype ideas' },
    ],
  },
  {
    id: 4,
    question: 'Which entrance exam preparation style suits you?',
    options: [
      { value: 'Engineering', label: 'JEE-style numerical practice' },
      { value: 'Medical', label: 'NEET-style concept memorization and MCQs' },
      { value: 'Commerce', label: 'Business aptitude and analytical tests' },
      { value: 'Design', label: 'Creative aptitude and portfolio tasks' },
    ],
  },
  {
    id: 5,
    question: 'What type of college projects do you prefer?',
    options: [
      { value: 'Engineering', label: 'Coding, robotics, or hardware models' },
      { value: 'Medical', label: 'Lab, anatomy, or medical case projects' },
      { value: 'Commerce', label: 'Market research or business plans' },
      { value: 'Design', label: 'Branding, interface, or product concepts' },
    ],
  },
  {
    id: 6,
    question: 'Which skill do you want to improve first?',
    options: [
      { value: 'Engineering', label: 'Programming and technical reasoning' },
      { value: 'Medical', label: 'Scientific understanding and care mindset' },
      { value: 'Commerce', label: 'Financial analysis and communication' },
      { value: 'Design', label: 'Creativity and visual storytelling' },
    ],
  },
  {
    id: 7,
    question: 'How comfortable are you with long study hours?',
    options: [
      { value: 'Engineering', label: 'I can do intensive technical practice' },
      { value: 'Medical', label: 'I can handle very long and detailed study cycles' },
      { value: 'Commerce', label: 'I prefer strategic and focused study blocks' },
      { value: 'Design', label: 'I prefer project-based learning schedules' },
    ],
  },
  {
    id: 8,
    question: 'Which college environment appeals to you most?',
    options: [
      { value: 'Engineering', label: 'Labs, innovation clubs, and hackathons' },
      { value: 'Medical', label: 'Hospitals, practical wards, and clinics' },
      { value: 'Commerce', label: 'Business cells and finance clubs' },
      { value: 'Design', label: 'Studios, workshops, and portfolio reviews' },
    ],
  },
  {
    id: 9,
    question: 'What motivates you more?',
    options: [
      { value: 'Engineering', label: 'Solving technical challenges' },
      { value: 'Medical', label: 'Direct impact on people and health' },
      { value: 'Commerce', label: 'Growth in business and career mobility' },
      { value: 'Design', label: 'Creative expression and innovation' },
    ],
  },
  {
    id: 10,
    question: 'Which type of career stability do you seek?',
    options: [
      { value: 'Engineering', label: 'Technology and engineering industries' },
      { value: 'Medical', label: 'Clinical and healthcare professions' },
      { value: 'Commerce', label: 'Corporate and financial sectors' },
      { value: 'Design', label: 'Creative agencies and product companies' },
    ],
  },
  {
    id: 11,
    question: 'How do you feel about practical training?',
    options: [
      { value: 'Engineering', label: 'I enjoy technical lab work and prototypes' },
      { value: 'Medical', label: 'I enjoy patient and clinical training' },
      { value: 'Commerce', label: 'I enjoy internships with business teams' },
      { value: 'Design', label: 'I enjoy studio projects and design critiques' },
    ],
  },
  {
    id: 12,
    question: 'Which tools would you like to master?',
    options: [
      { value: 'Engineering', label: 'Code editors and simulation tools' },
      { value: 'Medical', label: 'Medical diagnostics and lab equipment' },
      { value: 'Commerce', label: 'Spreadsheets and analytics platforms' },
      { value: 'Design', label: 'Figma, Adobe, or 3D tools' },
    ],
  },
  {
    id: 13,
    question: 'What type of assignment interests you most?',
    options: [
      { value: 'Engineering', label: 'Algorithm and system design tasks' },
      { value: 'Medical', label: 'Case history and diagnosis assignments' },
      { value: 'Commerce', label: 'Business reports and financial models' },
      { value: 'Design', label: 'Brand, layout, and prototype submissions' },
    ],
  },
  {
    id: 14,
    question: 'Which after-12th path do your strengths match?',
    options: [
      { value: 'Engineering', label: 'BTech or engineering diploma paths' },
      { value: 'Medical', label: 'MBBS, BDS, BAMS, or allied medical sciences' },
      { value: 'Commerce', label: 'BCom, BBA, CA, or finance programs' },
      { value: 'Design', label: 'BDes, architecture, animation, or UX tracks' },
    ],
  },
  {
    id: 15,
    question: 'How do you approach teamwork?',
    options: [
      { value: 'Engineering', label: 'I like technical collaboration with clear roles' },
      { value: 'Medical', label: 'I like coordinated care and responsibility' },
      { value: 'Commerce', label: 'I like leading planning and decisions' },
      { value: 'Design', label: 'I like brainstorming and visual collaboration' },
    ],
  },
  {
    id: 16,
    question: 'Which challenge would you choose?',
    options: [
      { value: 'Engineering', label: 'Build a useful app in 48 hours' },
      { value: 'Medical', label: 'Analyze a case and suggest treatment route' },
      { value: 'Commerce', label: 'Create a business strategy under budget limits' },
      { value: 'Design', label: 'Design a product experience from scratch' },
    ],
  },
  {
    id: 17,
    question: 'What kind of outcomes make you feel proud?',
    options: [
      { value: 'Engineering', label: 'A system that works efficiently' },
      { value: 'Medical', label: 'Improving someone health or recovery' },
      { value: 'Commerce', label: 'Strong financial or business performance' },
      { value: 'Design', label: 'A design people love to use' },
    ],
  },
  {
    id: 18,
    question: 'Which extracurricular activity fits you best?',
    options: [
      { value: 'Engineering', label: 'Coding club or robotics competition' },
      { value: 'Medical', label: 'Health camp or biology society' },
      { value: 'Commerce', label: 'Entrepreneurship or finance club' },
      { value: 'Design', label: 'Art, media, or design community' },
    ],
  },
  {
    id: 19,
    question: 'How important is creativity in your future role?',
    options: [
      { value: 'Engineering', label: 'Useful for technical innovation' },
      { value: 'Medical', label: 'Useful for diagnosis and patient care approaches' },
      { value: 'Commerce', label: 'Useful for business growth strategies' },
      { value: 'Design', label: 'Core part of the role' },
    ],
  },
  {
    id: 20,
    question: 'Which statement describes your college goal best?',
    options: [
      { value: 'Engineering', label: 'I want a technical college path' },
      { value: 'Medical', label: 'I want a healthcare college path' },
      { value: 'Commerce', label: 'I want a commerce and business path' },
      { value: 'Design', label: 'I want a design-focused college path' },
    ],
  },
];

const pathPriority = ['Engineering', 'Medical', 'Commerce', 'Design'];
const requiredSubjects = ['english', 'physics', 'chemistry', 'mathematics'];

function AssessmentPage({ onBackHome, onComplete }) {
  const [isMarksStepComplete, setIsMarksStepComplete] = useState(false);
  const [marksData, setMarksData] = useState({
    english: '',
    physics: '',
    chemistry: '',
    mathematics: '',
    optional: '',
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [errorText, setErrorText] = useState('');

  const currentQuestion = assessmentQuestions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;

  const progressPercent = useMemo(() => {
    return Math.round((answeredCount / assessmentQuestions.length) * 100);
  }, [answeredCount]);

  const formatExactPercent = (value) => `${Number(value || 0).toFixed(2)}%`;

  const marksPercent = useMemo(() => {
    const requiredMarks = requiredSubjects.map((subject) => Number(marksData[subject]) || 0);
    const optionalRaw = String(marksData.optional || '').trim();
    const optionalMark = optionalRaw === '' ? null : Number(optionalRaw) || 0;
    const allMarks = optionalMark === null ? requiredMarks : [...requiredMarks, optionalMark];

    if (allMarks.length === 0) {
      return 0;
    }

    const total = allMarks.reduce((sum, value) => sum + value, 0);
    const maxTotal = allMarks.length * 100;
    return Number(((total / maxTotal) * 100).toFixed(2));
  }, [marksData]);

  const handleMarkChange = (subject, value) => {
    if (value === '') {
      setMarksData((prevMarks) => ({
        ...prevMarks,
        [subject]: '',
      }));
      setErrorText('');
      return;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return;
    }

    const numericValue = Math.max(0, Math.min(100, parsed));
    setMarksData((prevMarks) => ({
      ...prevMarks,
      [subject]: String(numericValue),
    }));
    setErrorText('');
  };

  const handleMarksSubmit = () => {
    const hasMissingRequired = requiredSubjects.some((subject) => String(marksData[subject]).trim() === '');

    if (hasMissingRequired) {
      setErrorText('Please enter English, Physics, Chemistry, and Mathematics marks before starting the assessment.');
      return;
    }

    setIsMarksStepComplete(true);
    setErrorText('');
  };

  const handleOptionSelect = (questionId, pathValue) => {
    setSelectedAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: pathValue,
    }));
    setErrorText('');
  };

  const goNext = () => {
    const selectedValue = selectedAnswers[currentQuestion.id];

    if (!selectedValue) {
      setErrorText('Please select one option before moving to the next question.');
      return;
    }

    if (currentIndex < assessmentQuestions.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      setErrorText('');
    }
  };

  const goPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
      setErrorText('');
    }
  };

  const handleSubmit = () => {
    if (answeredCount !== assessmentQuestions.length) {
      setErrorText('Please answer all 20 questions before submitting the assessment.');
      return;
    }

    const scores = {
      Engineering: 0,
      Medical: 0,
      Commerce: 0,
      Design: 0,
    };

    Object.values(selectedAnswers).forEach((pathValue) => {
      if (scores[pathValue] !== undefined) {
        scores[pathValue] += 1;
      }
    });

    const decidedPath = pathPriority.reduce((bestPath, currentPath) => {
      const bestScore = scores[bestPath];
      const currentScore = scores[currentPath];
      return currentScore > bestScore ? currentPath : bestPath;
    }, pathPriority[0]);

    onComplete({
      path: decidedPath,
      scores,
      answers: selectedAnswers,
      marks: {
        ...marksData,
        percentage: marksPercent,
      },
    });
  };

  return (
    <div className="assessment-shell">
      <section className="assessment-card">
        <p className="eyebrow">Assessment</p>
        <h1>Career Path Assessment (20 Questions)</h1>
        <p className="assessment-subtitle">
          {isMarksStepComplete
            ? 'Answer all 20 questions. Your answers will decide the best path after 12th.'
            : 'First share your 12th marks, then start the assessment questions.'}
        </p>

        {isMarksStepComplete ? (
          <>
            <div className="assessment-progress-meta">
              <span>
                Question {currentIndex + 1} of {assessmentQuestions.length}
              </span>
              <span>{progressPercent}% completed</span>
            </div>

            <div className="assessment-progress-track" role="progressbar" aria-valuenow={progressPercent}>
              <div className="assessment-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>

            <article className="assessment-question-card">
              <h2>{currentQuestion.question}</h2>
              <div className="assessment-options">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === option.value;
                  return (
                    <label key={option.label} className={`assessment-option ${isSelected ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={option.value}
                        checked={isSelected}
                        onChange={() => handleOptionSelect(currentQuestion.id, option.value)}
                      />
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </article>
          </>
        ) : (
          <article className="assessment-question-card marks-entry-card">
            <h2>Enter Class 12th Marks (out of 100)</h2>
            <div className="marks-input-grid">
              <label className="marks-input-field">
                <span>English</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={marksData.english}
                  onChange={(event) => handleMarkChange('english', event.target.value)}
                />
              </label>
              <label className="marks-input-field">
                <span>Physics</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={marksData.physics}
                  onChange={(event) => handleMarkChange('physics', event.target.value)}
                />
              </label>
              <label className="marks-input-field">
                <span>Chemistry</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={marksData.chemistry}
                  onChange={(event) => handleMarkChange('chemistry', event.target.value)}
                />
              </label>
              <label className="marks-input-field">
                <span>Mathematics</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={marksData.mathematics}
                  onChange={(event) => handleMarkChange('mathematics', event.target.value)}
                />
              </label>
              <label className="marks-input-field">
                <span>Optional Subject</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={marksData.optional}
                  onChange={(event) => handleMarkChange('optional', event.target.value)}
                />
              </label>
            </div>

            <div className="marks-summary-pill">
              <span>Calculated 12th percentage</span>
              <strong>{formatExactPercent(marksPercent)}</strong>
            </div>
          </article>
        )}

        {errorText && <p className="assessment-error">{errorText}</p>}

        <div className="assessment-actions">
          <button type="button" className="secondary" onClick={onBackHome}>
            Back to Home
          </button>

          <div className="assessment-step-actions">
            {isMarksStepComplete ? (
              <>
                <button type="button" className="secondary" onClick={goPrevious} disabled={currentIndex === 0}>
                  Previous
                </button>
                {currentIndex < assessmentQuestions.length - 1 ? (
                  <button type="button" onClick={goNext}>
                    Next
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit}>
                    Submit Assessment
                  </button>
                )}
              </>
            ) : (
              <button type="button" onClick={handleMarksSubmit}>
                Save 12th Marks and Start Assessment
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AssessmentPage;
