import { useCallback, useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar';
import FeatureCard from './components/FeatureCard';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import RegistrationPage from './components/RegistrationPage';
import AssessmentPage from './components/AssessmentPage';
import FeatureDetailPage from './components/FeatureDetailPage';
import LandingPage from './components/LandingPage';
import MyClassroom from './components/MyClassroom';
import './App.css';

const featureData = [
  {
    icon: '🧭',
    title: 'Smart Career Recommendation',
    description: 'Suggests careers using marks, interests, and aptitude outcomes.',
  },
  {
    icon: '🧠',
    title: 'Aptitude and Personality Test',
    description: 'Combines logical assessment with personality insight questions.',
  },
  {
    icon: '📊',
    title: 'Multi-Career Comparison',
    description: 'Displays match percentages for multiple career tracks.',
  },
  {
    icon: '🏫',
    title: 'College Recommendation',
    description: 'Suggests colleges by location preference and cutoff trends.',
  },
  {
    icon: '📅',
    title: 'Study Planner',
    description: 'Builds a personalized roadmap for your chosen career path.',
  },
  {
    icon: '🔍',
    title: 'What-If Analysis',
    description: 'Adjust marks and see how recommendations change in real time.',
  },
  {
    icon: '📘',
    title: 'Career Details',
    description: 'View required skills, salary outlook, and future opportunities.',
  },
  {
    icon: '🎓',
    title: 'My Classroom',
    description: 'Access personalized learning dashboard with lectures, progress tracking, and practice.',
  },
];

const howItWorksSteps = [
  'Enter your academic details',
  'Take 20-question aptitude test',
  'Get AI-based recommendation',
  'Explore careers and colleges',
];

const chatStarterPrompts = [
  'Help me build a 7-day study plan.',
  'Which career fits my marks and interests?',
  'Make my revision routine more effective.',
  'What should I focus on before exams?',
];

const careerOrder = ['Engineering', 'Medical', 'Commerce', 'Design'];

const careerPieColors = {
  Engineering: '#1f73e2',
  Medical: '#2ca58d',
  Commerce: '#f59e0b',
  Design: '#ef4444',
};

const featureRouteSlugs = {
  'Smart Career Recommendation': 'smart-career-recommendation',
  'Explainable AI': 'explainable-ai',
  'Aptitude and Personality Test': 'aptitude-and-personality-test',
  'Multi-Career Comparison': 'multi-career-comparison',
  'College Recommendation': 'college-recommendation',
  'Study Planner': 'study-planner',
  'What-If Analysis': 'what-if-analysis',
  'Career Details': 'career-details',
  'My Classroom': 'my-classroom',
};

const featureTitleBySlug = Object.fromEntries(
  Object.entries(featureRouteSlugs).map(([title, slug]) => [slug, title]),
);

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
const aboutText = 'About the Application AI Study Planner is an intelligent career guidance and personalized learning platform designed to assist students in making informed academic and career decisions after completing their 12th grade. The application leverages a rule-based AI system with weighted scoring to analyze student performance, interests, and aptitude, providing explainable and data-driven career recommendations. In addition to career guidance, the platform offers a smart study planner that generates personalized daily and weekly schedules, tracks progress, identifies weak areas, and provides actionable suggestions for improvement. It also integrates college recommendations based on user preferences such as stream, location, and cutoff criteria. The system is built using modern full-stack technologies including Java (Spring Boot), React, and MySQL, delivering a scalable, user-friendly, and interactive experience';

function App() {
  const [routePath, setRoutePath] = useState(window.location.pathname || '/');
  const [currentUserEmail, setCurrentUserEmail] = useState(localStorage.getItem('asp_user_email') || '');
  const [landingVisited, setLandingVisited] = useState(localStorage.getItem('asp_landing_visited') === 'true');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [careerData, setCareerData] = useState({});
  const [reasonData, setReasonData] = useState([]);
  const [, setAssessmentQuestions] = useState([]);
  const [profileData, setProfileData] = useState({
    fullName: '',
    studentId: '',
    program: '',
    fatherName: '',
    motherName: '',
    permanentAddress: '',
    correspondenceAddress: '',
    contactNo: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    classLevel: '',
    interests: '',
    targetCareer: '',
    location: '',
    photoUrl: '',
  });
  const [isProfileEditMode, setIsProfileEditMode] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [assessmentPerformance, setAssessmentPerformance] = useState(null);
  const [toastState, setToastState] = useState({
    isVisible: false,
    text: '',
    type: 'success',
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome-message',
      role: 'assistant',
      text: 'Hi, I’m your study buddy. Tell me what you’re working on, and I’ll help you figure it out step by step.',
    },
  ]);
  const chatScrollRef = useRef(null);
  const chatRevealTimerRef = useRef(null);

  // eslint-disable-next-line no-unused-vars
  const showToast = (text, type = 'success') => {
    setToastState({
      isVisible: true,
      text,
      type,
    });
  };

  const navigateTo = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setRoutePath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openFeaturePage = (featureTitle) => {
    const featureSlug = featureRouteSlugs[featureTitle];

    if (!featureSlug) {
      return;
    }

    navigateTo(`/feature/${featureSlug}`);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNavClick = (sectionId) => {
    if (sectionId === 'about') {
      setIsPanelOpen(false);
      navigateTo('/about');
      return;
    }

    if (sectionId === 'profile') {
      if (routePath !== '/') {
        navigateTo('/');
      }

      setIsPanelOpen(true);
      return;
    }

    setIsPanelOpen(false);

    if (routePath !== '/') {
      navigateTo('/');
      setTimeout(() => scrollToSection(sectionId), 50);
      return;
    }

    scrollToSection(sectionId);
  };

  const handleStartAssessment = () => {
    setStatusMessage('Assessment page opened. Please answer all 20 questions to decide your best path.');
    navigateTo('/assessment');
  };

  const handleAssessmentComplete = async (assessmentResult) => {
    const decidedPath = String(assessmentResult?.path || '').trim();
    const marksPayload = assessmentResult?.marks || null;

    if (!decidedPath) {
      setStatusMessage('Assessment completed, but path could not be decided. Please retake the assessment.');
      return;
    }

    setProfileData((prevData) => ({
      ...prevData,
      targetCareer: decidedPath,
    }));

    const rawScores = assessmentResult?.scores || {};
    const normalizedScores = careerOrder.reduce((result, career) => {
      result[career] = Number(rawScores[career]) || 0;
      return result;
    }, {});

    const totalScore = Object.values(normalizedScores).reduce((sum, value) => sum + value, 0);
    const percentages = careerOrder.reduce((result, career) => {
      result[career] = totalScore > 0 ? Math.round((normalizedScores[career] / totalScore) * 100) : 0;
      return result;
    }, {});

    setAssessmentPerformance({
      scores: normalizedScores,
      percentages,
      topPath: decidedPath,
      totalQuestions: totalScore,
      marks: marksPayload,
    });

    await fetchCareerData(decidedPath);
    const marksSuffix = marksPayload?.percentage !== undefined ? ` 12th percentage recorded: ${Number(marksPayload.percentage).toFixed(2)}%.` : '';
    setStatusMessage(`Assessment completed. Your recommended path is ${decidedPath}.${marksSuffix}`);
    navigateTo('/');
    setTimeout(() => {
      scrollToSection('dashboard');
    }, 80);
  };

  const refreshRecommendation = async () => {
    await fetchCareerData();
    setStatusMessage('Recommendations generated from current profile data.');
  };

  const handleGetRecommendation = async () => {
    await refreshRecommendation();
    scrollToSection('dashboard');
  };

  const handleFeatureAction = (featureTitle) => {
    if (featureTitle === 'Aptitude and Personality Test') {
      handleStartAssessment();
      return;
    }

    if (featureTitle === 'My Classroom') {
      if (!profileData.targetCareer) {
        setStatusMessage('Please complete the assessment to access your classroom.');
        handleStartAssessment();
        return;
      }
      navigateTo('/classroom');
      return;
    }

    if (featureTitle === 'Study Planner') {
      setChatInput('Create a personalized 7-day study plan for my top career match.');
      setIsChatOpen(true);
      openFeaturePage(featureTitle);
      return;
    }

    if (featureTitle === 'College Recommendation') {
      setIsPanelOpen(true);
      setStatusMessage('Open profile and set preferred location to get better college recommendation.');
      openFeaturePage(featureTitle);
      return;
    }

    if (featureTitle === 'What-If Analysis') {
      openFeaturePage(featureTitle);
      return;
    }

    openFeaturePage(featureTitle);
  };

  const getFeatureActionLabel = (featureTitle) => {
    if (featureTitle === 'Aptitude and Personality Test') {
      return 'Take Test';
    }
    if (featureTitle === 'Explainable AI') {
      return 'View Reasons';
    }
    if (featureTitle === 'Multi-Career Comparison') {
      return 'Compare Paths';
    }
    if (featureTitle === 'Smart Career Recommendation') {
      return 'See Top Match';
    }
    if (featureTitle === 'What-If Analysis') {
      return 'Run Analysis';
    }
    if (featureTitle === 'College Recommendation') {
      return 'Set Location';
    }
    if (featureTitle === 'Study Planner') {
      return 'Build Plan';
    }
    if (featureTitle === 'My Classroom') {
      return 'Open Dashboard';
    }
    return 'Open Feature';
  };

  const handleLoginRedirect = () => {
    setIsPanelOpen(false);
    navigateTo('/login');
  };

  const handleRegisterRedirect = () => {
    setIsPanelOpen(false);
    navigateTo('/register');
  };

  const handleSignInFromLanding = () => {
    setLandingVisited(true);
    localStorage.setItem('asp_landing_visited', 'true');
    navigateTo('/login');
  };

  const handleSignUpFromLanding = () => {
    setLandingVisited(true);
    localStorage.setItem('asp_landing_visited', 'true');
    navigateTo('/register');
  };

  const handleSignOut = () => {
    setCurrentUserEmail('');
    localStorage.removeItem('asp_user_email');
    setLandingVisited(false);
    localStorage.removeItem('asp_landing_visited');
    setAssessmentPerformance(null);
    setProfileData({
      fullName: '',
      studentId: '',
      program: '',
      fatherName: '',
      motherName: '',
      permanentAddress: '',
      correspondenceAddress: '',
      contactNo: '',
      email: '',
      dateOfBirth: '',
      gender: '',
      classLevel: '',
      interests: '',
      targetCareer: '',
      location: '',
      photoUrl: '',
    });
    setIsPanelOpen(false);
    setStatusMessage('You have been signed out successfully.');
    navigateTo('/');
  };

  const handleMenuToggle = () => {
    setIsPanelOpen((prevState) => !prevState);
  };

  const handleProfileToggle = () => {
    setIsPanelOpen(true);
  };

  const handleProfilePhotoSelect = (event) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (!selectedFile) {
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = () => {
      setProfileData((prevData) => ({
        ...prevData,
        photoUrl: String(fileReader.result || ''),
      }));
    };
    fileReader.readAsDataURL(selectedFile);
  };

  const profilePhotoInputRef = useRef(null);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  function handleProfileSave() {
    if (!currentUserEmail) {
      setStatusMessage('Please login first to save your profile.');
      navigateTo('/login');
      return;
    }
    setIsSavingProfile(true);
    const onSuccess = (data) => {
      if (data.email) {
        setStatusMessage('Profile saved successfully.');
        setIsProfileEditMode(false);
      }
      setIsSavingProfile(false);
    };
    const onError = () => {
      setStatusMessage('Unable to save profile.');
      setIsSavingProfile(false);
    };
    fetch(`${apiBaseUrl}/api/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUserEmail, profile: profileData }),
    })
      .then((r) => r.json())
      .then(onSuccess)
      .catch(onError);
  }

  const fetchCareerData = useCallback(async (preferenceOverride = '') => {
    setIsLoadingData(true);

    try {
      const params = new URLSearchParams();
      const targetCareer = String(preferenceOverride || profileData.targetCareer || '').trim();

      if (targetCareer) {
        params.set('targetCareer', targetCareer);
      }
      if (profileData.classLevel) {
        params.set('classLevel', profileData.classLevel.trim());
      }
      if (profileData.interests) {
        params.set('interests', profileData.interests.trim());
      }
      if (profileData.location) {
        params.set('location', profileData.location.trim());
      }

      const queryString = params.toString();
      const response = await fetch(`${apiBaseUrl}/api/recommendations${queryString ? `?${queryString}` : ''}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to fetch recommendations.');
      }

      setCareerData(data.careers || {});
      setReasonData(Array.isArray(data.reasons) ? data.reasons : []);
      setAssessmentQuestions(Array.isArray(data.assessmentQuestions) ? data.assessmentQuestions : []);
    } catch (requestError) {
      setStatusMessage('Could not fetch recommendation data from backend.');
    } finally {
      setIsLoadingData(false);
    }
  }, [profileData.classLevel, profileData.interests, profileData.location, profileData.targetCareer]);

  const displayCareerScores = () => {
    const scoreEntries = Object.entries(careerData);

    if (scoreEntries.length === 0) {
      return <p className="muted">No score data yet. Click Get Recommendation.</p>;
    }

    return (
      <div className="score-list">
        {scoreEntries.map(([career, score]) => (
          <div className="score-row" key={career}>
            <div className="score-meta">
              <span>{career}</span>
              <strong>{score}%</strong>
            </div>
            <div className="score-track" role="progressbar" aria-valuenow={score}>
              <div className="score-fill" style={{ width: `${score}%` }} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const displayAssessmentPieChart = () => {
    if (!assessmentPerformance) {
      return <p className="muted">Complete the assessment to view performance analysis as a pie chart.</p>;
    }

    const percentageEntries = careerOrder.map((career) => ({
      career,
      percentage: assessmentPerformance.percentages?.[career] || 0,
      score: assessmentPerformance.scores?.[career] || 0,
      color: careerPieColors[career],
    }));

    let cumulative = 0;
    const segments = percentageEntries.map((entry) => {
      const start = cumulative;
      cumulative += entry.percentage;
      return `${entry.color} ${start}% ${cumulative}%`;
    });

    const pieBackground = cumulative > 0 ? `conic-gradient(${segments.join(', ')})` : '#dce4f2';

    return (
      <div className="assessment-pie-wrap">
        <div className="assessment-pie-chart" style={{ background: pieBackground }} aria-label="Assessment career match pie chart">
          <div className="assessment-pie-center">
            <strong>{assessmentPerformance.topPath}</strong>
            <span>{assessmentPerformance.percentages?.[assessmentPerformance.topPath] || 0}%</span>
          </div>
        </div>

        <div>
          <p className="assessment-summary">
            Based on your assessment performance, <strong>{assessmentPerformance.topPath}</strong> is the strongest future path.
          </p>
          <ul className="pie-legend">
            {percentageEntries.map((entry) => (
              <li key={entry.career}>
                <span className="legend-dot" style={{ backgroundColor: entry.color }} aria-hidden="true" />
                <span>{entry.career}</span>
                <strong>{entry.percentage}%</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const displayReasonExplanation = () => {
    if (reasonData.length === 0) {
      return <p className="muted">Reason explanation will appear after recommendation.</p>;
    }

    return (
      <ul className="reason-list">
        {reasonData.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    );
  };

  useEffect(() => {
    const handlePopState = () => {
      setRoutePath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);

    if (routePath === '/' || routePath === '/profile') {
      fetchCareerData();
    }

    if (routePath === '/profile') {
      setTimeout(() => {
        setIsPanelOpen(true);
      }, 50);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [fetchCareerData, routePath]);

  useEffect(() => {
    if (!currentUserEmail) {
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/profile?email=${encodeURIComponent(currentUserEmail)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load profile.');
        }

        setProfileData((prevData) => ({
          ...prevData,
          fullName: data.profile?.fullName || '',
          studentId: data.profile?.studentId || '',
          program: data.profile?.program || '',
          fatherName: data.profile?.fatherName || '',
          motherName: data.profile?.motherName || '',
          permanentAddress: data.profile?.permanentAddress || '',
          correspondenceAddress: data.profile?.correspondenceAddress || '',
          contactNo: data.profile?.contactNo || '',
          email: data.profile?.email || currentUserEmail,
          dateOfBirth: data.profile?.dateOfBirth || '',
          gender: data.profile?.gender || '',
          classLevel: data.profile?.classLevel || '',
          interests: data.profile?.interests || '',
          targetCareer: data.profile?.targetCareer || '',
          location: data.profile?.location || '',
          photoUrl: data.profile?.photoUrl || '',
        }));
      } catch (requestError) {
        setStatusMessage('Could not load saved profile for this account.');
      }
    };

    loadProfile();
  }, [currentUserEmail]);

  useEffect(() => {
    if (!toastState.isVisible) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setToastState((prevToast) => ({
        ...prevToast,
        isVisible: false,
      }));
    }, 2200);

    return () => clearTimeout(timeoutId);
  }, [toastState.isVisible]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isChatOpen]);

  useEffect(() => {
    return () => {
      if (chatRevealTimerRef.current) {
        clearInterval(chatRevealTimerRef.current);
      }
    };
  }, []);

  const revealAssistantReply = (messageId, replyText) => {
    if (chatRevealTimerRef.current) {
      clearInterval(chatRevealTimerRef.current);
    }

    const fullText = String(replyText || '').trim() || 'I could not generate a response right now.';
    const characters = Array.from(fullText);
    let index = 0;

    setChatMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.id === messageId
          ? {
              id: messageId,
              role: 'assistant',
              text: '',
              isRevealing: true,
            }
          : message,
      ),
    );

    chatRevealTimerRef.current = setInterval(() => {
      index += 2;
      const nextText = characters.slice(0, index).join('');

      setChatMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === messageId
            ? {
                ...message,
                text: nextText,
                isRevealing: index < characters.length,
              }
            : message,
        ),
      );

      if (index >= characters.length) {
        clearInterval(chatRevealTimerRef.current);
        chatRevealTimerRef.current = null;
      }
    }, 18);
  };

  const handleChatSubmit = async (event) => {
    event.preventDefault();

    const nextMessage = chatInput.trim();

    if (!nextMessage || isSendingChat) {
      return;
    }

    const userMessageId = `user-${Date.now()}`;
    const typingMessageId = `typing-${Date.now()}`;
    const updatedMessages = [...chatMessages, { id: userMessageId, role: 'user', text: nextMessage }];
    setChatMessages(updatedMessages);
    setChatInput('');
    setIsSendingChat(true);
    setChatMessages((prevMessages) => [
      ...prevMessages,
      {
        id: typingMessageId,
        role: 'assistant',
        status: 'typing',
        text: 'Thinking with you...',
      },
    ]);

    try {
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: nextMessage,
          history: updatedMessages.slice(-8),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Unable to get chat response.');
      }

      await new Promise((resolve) => setTimeout(resolve, 420));
      revealAssistantReply(typingMessageId, data.reply || 'I could not generate a response right now.');
    } catch (requestError) {
      await new Promise((resolve) => setTimeout(resolve, 320));
      revealAssistantReply(
        typingMessageId,
        'I could not connect right now, but I am still here. Try again in a moment or tell me your class, goal, and exam date.',
      );
    } finally {
      setIsSendingChat(false);
    }
  };

  // Show landing page on first visit (only once)
  if (!landingVisited && routePath === '/') {
    return <LandingPage onSignIn={handleSignInFromLanding} onSignUp={handleSignUpFromLanding} />;
  }

  if (routePath === '/login') {
    return (
      <LoginPage
        onBackHome={() => navigateTo('/')}
        onRegisterClick={() => navigateTo('/register')}
        onLoginSuccess={({ message, email, rememberMe }) => {
          const normalizedEmail = (email || '').trim().toLowerCase();
          setCurrentUserEmail(normalizedEmail);

          if (rememberMe && normalizedEmail) {
            localStorage.setItem('asp_user_email', normalizedEmail);
          } else {
            localStorage.removeItem('asp_user_email');
          }

          setStatusMessage(message);
          navigateTo('/');
        }}
      />
    );
  }

  if (routePath === '/register') {
    return (
      <RegistrationPage
        onBackHome={() => navigateTo('/')}
        onRegistrationSuccess={({ message, email }) => {
          const normalizedEmail = (email || '').trim().toLowerCase();
          setCurrentUserEmail(normalizedEmail);
          localStorage.setItem('asp_user_email', normalizedEmail);
          setStatusMessage(message);
          navigateTo('/');
        }}
      />
    );
  }

  if (routePath === '/assessment') {
    return <AssessmentPage onBackHome={() => navigateTo('/')} onComplete={handleAssessmentComplete} />;
  }

  if (routePath === '/classroom') {
    return (
      <MyClassroom 
        onBackHome={() => navigateTo('/')} 
        profileData={profileData}
        assessmentPerformance={assessmentPerformance}
        currentUserEmail={currentUserEmail}
      />
    );
  }

  if (routePath === '/about') {
    return (
      <div className="page-shell">
        <Navbar
          onNavClick={handleNavClick}
          onLoginClick={handleLoginRedirect}
          onRegisterClick={handleRegisterRedirect}
          onSignOut={handleSignOut}
          currentUserEmail={currentUserEmail}
          onMenuToggle={handleMenuToggle}
          onProfileToggle={handleProfileToggle}
        />

        <section className="about-page" id="about-page">
          <article className="panel about-page-hero">
            <p className="eyebrow">Platform Overview</p>
            <h1>AI Study Planner</h1>
            <p className="about-hero-subtitle">
              Intelligent career guidance and personalized learning support for students after 12th grade.
            </p>
            <div className="about-badge-row" aria-label="Key platform strengths">
              <span className="about-badge">Explainable AI</span>
              <span className="about-badge">Personalized Roadmaps</span>
              <span className="about-badge">College Fit Insights</span>
            </div>
          </article>

          <div className="about-page-layout">
            <article className="panel about-story-card">
              <h2>About the Application</h2>
              <p>{aboutText}</p>
            </article>

            <aside className="panel about-pillars" aria-label="About page highlights">
              <h3>What This Platform Delivers</h3>
              <ul>
                <li>Explainable career recommendations based on aptitude, interests, and academic profile.</li>
                <li>Personalized daily and weekly study planning with progress tracking support.</li>
                <li>Focused improvement suggestions to address weaker areas effectively.</li>
                <li>College recommendations aligned to stream, location, and cutoff preferences.</li>
              </ul>
            </aside>
          </div>

          <section className="panel about-value-grid" aria-label="Core value highlights">
            <article className="about-value-card">
              <span className="about-value-icon" aria-hidden="true">🧠</span>
              <h3>Smart Decision Support</h3>
              <p>Transforms student data into clear, weighted, and explainable guidance.</p>
            </article>
            <article className="about-value-card">
              <span className="about-value-icon" aria-hidden="true">📅</span>
              <h3>Structured Study Planning</h3>
              <p>Builds practical daily and weekly routines with progress-focused momentum.</p>
            </article>
            <article className="about-value-card">
              <span className="about-value-icon" aria-hidden="true">🎯</span>
              <h3>Career + College Alignment</h3>
              <p>Matches recommendations with stream preference, location, and cutoff expectations.</p>
            </article>
          </section>

          <section className="panel about-timeline" aria-label="How it works timeline">
            <h3>How It Works</h3>
            <ol>
              <li>
                <span className="timeline-dot" aria-hidden="true">1</span>
                <div>
                  <strong>Profile and Inputs</strong>
                  <p>Students add academic details, interests, and preferences.</p>
                </div>
              </li>
              <li>
                <span className="timeline-dot" aria-hidden="true">2</span>
                <div>
                  <strong>Weighted AI Analysis</strong>
                  <p>The platform evaluates aptitude and profile indicators with explainable scoring.</p>
                </div>
              </li>
              <li>
                <span className="timeline-dot" aria-hidden="true">3</span>
                <div>
                  <strong>Actionable Roadmap</strong>
                  <p>Students receive study plans, improvement tips, and career-college direction.</p>
                </div>
              </li>
            </ol>
          </section>
        </section>

        <Footer />
      </div>
    );
  }

  if (routePath.startsWith('/feature/')) {
    const featureSlug = routePath.replace('/feature/', '');
    const featureTitle = featureTitleBySlug[featureSlug] || 'Smart Career Recommendation';

    return (
      <FeatureDetailPage
        featureTitle={featureTitle}
        careerData={careerData}
        reasonData={reasonData}
        profileData={profileData}
        assessmentPerformance={assessmentPerformance}
        isLoadingData={isLoadingData}
        onBackHome={() => navigateTo('/')}
        onStartAssessment={handleStartAssessment}
        onRefreshRecommendation={refreshRecommendation}
      />
    );
  }

  const topCareerEntry = Object.entries(careerData).sort((firstItem, secondItem) => secondItem[1] - firstItem[1])[0];
  const topCareerLabel = topCareerEntry ? `${topCareerEntry[0]} (${topCareerEntry[1]}%)` : 'No recommendation yet';

  return (
    <div className="page-shell" id="home">
      <Navbar
        onNavClick={handleNavClick}
        onLoginClick={handleLoginRedirect}
        onRegisterClick={handleRegisterRedirect}
        onSignOut={handleSignOut}
        currentUserEmail={currentUserEmail}
        onMenuToggle={handleMenuToggle}
        onProfileToggle={handleProfileToggle}
      />

      {toastState.isVisible && (
        <div className={`toast ${toastState.type === 'error' ? 'error' : ''}`} role="status" aria-live="polite">
          {toastState.text}
        </div>
      )}

      {isPanelOpen && <div className="panel-backdrop" onClick={() => setIsPanelOpen(false)} aria-hidden="true" />}

      <aside className={`side-panel ${isPanelOpen ? 'open' : ''}`} aria-label="Student profile panel">
        <div className="side-panel-header">
          <h3>Student Profile</h3>
          <button className="close-btn" type="button" onClick={() => setIsPanelOpen(false)}>
            X
          </button>
        </div>

        <div className="side-profile-section">
          <p className="eyebrow">Student Profile</p>
          <div className="profile-top-card">
            <button
              type="button"
              className="profile-photo-btn"
              onClick={() => profilePhotoInputRef.current && profilePhotoInputRef.current.click()}
              title="Choose profile picture"
            >
              {profileData.photoUrl ? (
                <img src={profileData.photoUrl} alt="Profile" className="profile-photo" />
              ) : (
                <span>{(profileData.fullName || 'P').slice(0, 1).toUpperCase()}</span>
              )}
            </button>
            <input
              ref={profilePhotoInputRef}
              type="file"
              accept="image/*"
              className="photo-input-hidden"
              onChange={handleProfilePhotoSelect}
            />

            <h3>{profileData.fullName || 'Your Name'}</h3>
            <p>{profileData.studentId || 'Student ID'}</p>
            <p>{profileData.program || 'Program details'}</p>

            <div className="profile-action-bar">
              <button type="button" className="secondary" onClick={() => setIsProfileEditMode((prev) => !prev)}>
                {isProfileEditMode ? 'Close Edit' : 'Edit Profile'}
              </button>
              <button type="button" onClick={handleProfileSave} disabled={isSavingProfile}>
                {isSavingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>

          <div className="basic-bar">Essential Details</div>

          <div className="basic-details-view">
            <div>
              <span>Email</span>
              <strong>{profileData.email || currentUserEmail || 'Not set'}</strong>
            </div>
            <div>
              <span>Class Level</span>
              <strong>{profileData.classLevel || 'Not set'}</strong>
            </div>
            <div>
              <span>Interests</span>
              <strong>{profileData.interests || 'Not set'}</strong>
            </div>
            <div>
              <span>Preferred College Path After 12th</span>
              <strong>{profileData.targetCareer || 'Not set'}</strong>
            </div>
            <div>
              <span>Preferred Location</span>
              <strong>{profileData.location || 'Not set'}</strong>
            </div>
          </div>

          {isProfileEditMode && (
            <div className="profile-form-grid">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={profileData.fullName}
                onChange={handleProfileChange}
                placeholder="Enter your name"
              />

              <label htmlFor="studentId">Student ID</label>
              <input
                id="studentId"
                name="studentId"
                type="text"
                value={profileData.studentId}
                onChange={handleProfileChange}
                placeholder="Enter registration number"
              />

              <label htmlFor="program">Program</label>
              <input
                id="program"
                name="program"
                type="text"
                value={profileData.program}
                onChange={handleProfileChange}
                placeholder="Example: M.Sc (Data Science)(2025)"
              />

              <label htmlFor="fatherName">Father's Name</label>
              <input
                id="fatherName"
                name="fatherName"
                type="text"
                value={profileData.fatherName}
                onChange={handleProfileChange}
                placeholder="Enter father name"
              />

              <label htmlFor="motherName">Mother's Name</label>
              <input
                id="motherName"
                name="motherName"
                type="text"
                value={profileData.motherName}
                onChange={handleProfileChange}
                placeholder="Enter mother name"
              />

              <label htmlFor="permanentAddress">Permanent Address</label>
              <input
                id="permanentAddress"
                name="permanentAddress"
                type="text"
                value={profileData.permanentAddress}
                onChange={handleProfileChange}
                placeholder="Enter permanent address"
              />

              <label htmlFor="correspondenceAddress">Correspondence Address</label>
              <input
                id="correspondenceAddress"
                name="correspondenceAddress"
                type="text"
                value={profileData.correspondenceAddress}
                onChange={handleProfileChange}
                placeholder="Enter correspondence address"
              />

              <label htmlFor="contactNo">Contact No.</label>
              <input
                id="contactNo"
                name="contactNo"
                type="text"
                value={profileData.contactNo}
                onChange={handleProfileChange}
                placeholder="Enter contact number"
              />

              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleProfileChange}
                placeholder="Enter email"
              />

              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="text"
                value={profileData.dateOfBirth}
                onChange={handleProfileChange}
                placeholder="Example: 01 Nov 2003"
              />

              <label htmlFor="gender">Gender</label>
              <input
                id="gender"
                name="gender"
                type="text"
                value={profileData.gender}
                onChange={handleProfileChange}
                placeholder="Example: Male"
              />

              <label htmlFor="classLevel">Class Level</label>
              <input
                id="classLevel"
                name="classLevel"
                type="text"
                value={profileData.classLevel}
                onChange={handleProfileChange}
                placeholder="Example: 12th"
              />

              <label htmlFor="interests">Interests</label>
              <input
                id="interests"
                name="interests"
                type="text"
                value={profileData.interests}
                onChange={handleProfileChange}
                placeholder="Example: Maths, coding, robotics"
              />

              <label htmlFor="targetCareer">Preferred College Path After 12th</label>
              <input
                id="targetCareer"
                name="targetCareer"
                type="text"
                value={profileData.targetCareer}
                onChange={handleProfileChange}
                placeholder="Example: Engineering"
              />

              <label htmlFor="location">Preferred Location</label>
              <input
                id="location"
                name="location"
                type="text"
                value={profileData.location}
                onChange={handleProfileChange}
                placeholder="Example: Delhi NCR"
              />
            </div>
          )}
        </div>
      </aside>

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">AI Driven Academic Planning</p>
          <h1>AI-Based Career Guidance System</h1>
          <p>
            Helping students choose the right career based on performance, interests, and aptitude.
          </p>
          <div className="hero-actions">
            <button type="button" onClick={handleStartAssessment}>
              Get Started
            </button>
            <button type="button" className="secondary" onClick={handleStartAssessment}>
              Take Assessment
            </button>
          </div>
        </div>
        <div className="hero-card">
          <p>Live Recommendation Snapshot</p>
          <strong>{isLoadingData ? 'Loading...' : `Top Match: ${topCareerLabel}`}</strong>
          <span>Confidence score updates after each assessment phase.</span>
        </div>
      </section>

      <section className="status-banner" aria-live="polite">
        {statusMessage || 'Plan smart, compare careers, and prepare your future roadmap.'}
        {currentUserEmail && <span className="status-email"> Logged in as: {currentUserEmail}</span>}
      </section>

      <section className="section" id="features">
        <h2>Core Features</h2>
        <p className="section-subtitle">
          Everything needed to move from confusion to confident career decisions.
        </p>
        <div className="feature-grid">
          {featureData.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              actionLabel={getFeatureActionLabel(feature.title)}
              onAction={() => handleFeatureAction(feature.title)}
              onCardClick={() => openFeaturePage(feature.title)}
            />
          ))}
        </div>
      </section>

      <section className="section" id="how-it-works">
        <article className="panel">
          <h2>How It Works</h2>
          <ol className="step-list">
            {howItWorksSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
      </section>

      <section className="section" id="dashboard">
        <h2>Dashboard Preview</h2>
        <p className="section-subtitle">Career match scores with explainable recommendation reasons.</p>
        <div className="dashboard-grid">
          <article className="panel">
            <h3>Career Match Percentage</h3>
            {displayAssessmentPieChart()}
            <h4 className="sub-panel-title">Recommendation Comparison</h4>
            {displayCareerScores()}
          </article>
          <article className="panel">
            <h3>Why These Results</h3>
            {displayReasonExplanation()}
          </article>
        </div>
      </section>

      <section className="cta" id="contact">
        <h2>Start your career journey today</h2>
        <button type="button" onClick={handleGetRecommendation} disabled={isLoadingData}>
          {isLoadingData ? 'Calculating...' : 'Get Recommendation'}
        </button>
      </section>

      <button
        type="button"
        className="chat-fab"
        onClick={() => setIsChatOpen((prevState) => !prevState)}
        aria-label="Open study assistant chat"
      >
        {isChatOpen ? 'Close Chat' : 'Study Chat'}
      </button>

      {isChatOpen && (
        <section className="chat-widget" aria-label="Study assistant chat panel">
          <header className="chat-header">
            <div>
              <h3>Study Buddy</h3>
              <span className="chat-header-subtitle">Talk naturally, like a quick study check-in.</span>
            </div>
            <span className={`chat-status ${isSendingChat ? 'thinking' : 'online'}`}>
              <span className="status-dot" />
              {isSendingChat ? 'Typing...' : 'Online'}
            </span>
          </header>

          <div className="chat-body" ref={chatScrollRef}>
            {chatMessages.map((entry, index) => (
              <div
                key={entry.id || `${entry.role}-${index}`}
                className={`chat-bubble ${entry.role === 'user' ? 'user' : 'assistant'} ${entry.isRevealing ? 'revealing' : ''}`}
              >
                <div className="chat-bubble-meta">
                  <span className={`chat-avatar ${entry.role === 'user' ? 'user' : 'assistant'}`}>
                    {entry.role === 'user' ? 'You' : 'SB'}
                  </span>
                  <span>{entry.role === 'user' ? 'You' : 'Study Buddy'}</span>
                </div>
                {entry.status === 'typing' ? (
                  <div className="typing-indicator" aria-label="Assistant typing">
                    <span />
                    <span />
                    <span />
                  </div>
                ) : (
                  <div className="chat-bubble-text">{entry.text}</div>
                )}
              </div>
            ))}
          </div>

          <div className="chat-quick-actions" aria-label="Suggested chat prompts">
            {chatStarterPrompts.map((prompt) => (
              <button key={prompt} type="button" className="chat-chip" onClick={() => setChatInput(prompt)}>
                {prompt}
              </button>
            ))}
          </div>

          <form className="chat-input-row" onSubmit={handleChatSubmit}>
            <input
              type="text"
              placeholder="Ask about careers, skills, exams..."
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              maxLength={1500}
            />
            <button type="submit" disabled={isSendingChat || !chatInput.trim()}>
              Send
            </button>
          </form>
        </section>
      )}

      <div id="privacy" />
      <Footer />
    </div>
  );
}

export default App;
