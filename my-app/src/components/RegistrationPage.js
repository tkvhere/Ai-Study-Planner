import { useState } from 'react';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

function RegistrationPage({ onBackHome, onRegistrationSuccess }) {
  const [currentStep, setCurrentStep] = useState('credentials');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    studentId: '',
    program: '',
    fatherName: '',
    motherName: '',
    permanentAddress: '',
    correspondenceAddress: '',
    contactNo: '',
    dateOfBirth: '',
    gender: '',
    classLevel: '',
    interests: '',
    targetCareer: '',
    location: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    return '';
  };

  const handleCredentialsSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const { email, password, confirmPassword } = formData;

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMessage('Please fill in all credential fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, rememberMe: false }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Unable to register.');
        return;
      }

      setSuccessMessage('Account created successfully! Now fill in your profile.');
      setErrorMessage('');
      setTimeout(() => {
        setCurrentStep('profile');
      }, 1000);
    } catch (requestError) {
      setErrorMessage('Cannot reach server. Make sure backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          profile: {
            fullName: formData.fullName,
            studentId: formData.studentId,
            program: formData.program,
            fatherName: formData.fatherName,
            motherName: formData.motherName,
            permanentAddress: formData.permanentAddress,
            correspondenceAddress: formData.correspondenceAddress,
            contactNo: formData.contactNo,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            classLevel: formData.classLevel,
            interests: formData.interests,
            targetCareer: formData.targetCareer,
            location: formData.location,
            photoUrl: '',
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Unable to save profile.');
        return;
      }

      setSuccessMessage('Profile created successfully! You can update it later.');
      setErrorMessage('');

      setTimeout(() => {
        onRegistrationSuccess({
          message: `Welcome ${formData.fullName}`,
          email: formData.email.trim().toLowerCase(),
        });
      }, 1500);
    } catch (requestError) {
      setErrorMessage('Cannot reach server. Make sure backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToCredentials = () => {
    setCurrentStep('credentials');
    setErrorMessage('');
    setSuccessMessage('');
  };

  if (currentStep === 'credentials') {
    return (
      <main className="login-route-shell">
        <section className="login-route-card">
          <p className="eyebrow">Create Account</p>
          <h1>Join AI Study Planner</h1>
          <p className="muted-line">
            Create an account with your email and password. You can set up your profile next.
          </p>

          {errorMessage && <p className="login-error">{errorMessage}</p>}
          {successMessage && <p className="login-success">{successMessage}</p>}

          <form className="login-route-form" onSubmit={handleCredentialsSubmit}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
            />

            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
            />

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="footer-text">
            Already have an account?{' '}
            <button type="button" className="link-button" onClick={onBackHome}>
              Back to Home
            </button>
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="login-route-shell">
      <section className="login-route-card">
        <p className="eyebrow">Complete Your Profile</p>
        <h1>Set Up Your Profile</h1>
        <p className="muted-line">
          Tell us about yourself. You can update your profile anytime later.
        </p>

        {errorMessage && <p className="login-error">{errorMessage}</p>}
        {successMessage && <p className="login-success">{successMessage}</p>}

        <form className="login-route-form" onSubmit={handleProfileSubmit}>
          <label htmlFor="fullName">Full Name *</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />

          <label htmlFor="studentId">Student ID</label>
          <input
            id="studentId"
            name="studentId"
            type="text"
            value={formData.studentId}
            onChange={handleChange}
            placeholder="Your registration number"
          />

          <label htmlFor="program">Program</label>
          <input
            id="program"
            name="program"
            type="text"
            value={formData.program}
            onChange={handleChange}
            placeholder="Example: M.Sc (Data Science)(2025)"
          />

          <label htmlFor="fatherName">Father's Name</label>
          <input
            id="fatherName"
            name="fatherName"
            type="text"
            value={formData.fatherName}
            onChange={handleChange}
            placeholder="Enter father's name"
          />

          <label htmlFor="motherName">Mother's Name</label>
          <input
            id="motherName"
            name="motherName"
            type="text"
            value={formData.motherName}
            onChange={handleChange}
            placeholder="Enter mother's name"
          />

          <label htmlFor="permanentAddress">Permanent Address</label>
          <input
            id="permanentAddress"
            name="permanentAddress"
            type="text"
            value={formData.permanentAddress}
            onChange={handleChange}
            placeholder="Enter your permanent address"
          />

          <label htmlFor="correspondenceAddress">Correspondence Address</label>
          <input
            id="correspondenceAddress"
            name="correspondenceAddress"
            type="text"
            value={formData.correspondenceAddress}
            onChange={handleChange}
            placeholder="Enter correspondence address"
          />

          <label htmlFor="contactNo">Contact No.</label>
          <input
            id="contactNo"
            name="contactNo"
            type="text"
            value={formData.contactNo}
            onChange={handleChange}
            placeholder="Enter your phone number"
          />

          <label htmlFor="dateOfBirth">Date of Birth</label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="text"
            value={formData.dateOfBirth}
            onChange={handleChange}
            placeholder="Example: 01 Nov 2003"
          />

          <label htmlFor="gender">Gender</label>
          <input
            id="gender"
            name="gender"
            type="text"
            value={formData.gender}
            onChange={handleChange}
            placeholder="Example: Male"
          />

          <label htmlFor="classLevel">Current Class Level</label>
          <input
            id="classLevel"
            name="classLevel"
            type="text"
            value={formData.classLevel}
            onChange={handleChange}
            placeholder="Example: 12th"
          />

          <label htmlFor="interests">Interests</label>
          <input
            id="interests"
            name="interests"
            type="text"
            value={formData.interests}
            onChange={handleChange}
            placeholder="Example: Maths, coding, robotics"
          />

          <label htmlFor="targetCareer">Preferred Career Path</label>
          <input
            id="targetCareer"
            name="targetCareer"
            type="text"
            value={formData.targetCareer}
            onChange={handleChange}
            placeholder="Example: Engineering"
          />

          <label htmlFor="location">Preferred Location</label>
          <input
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
            placeholder="Example: Delhi NCR"
          />

          <div className="button-group">
            <button type="button" className="secondary" onClick={handleBackToCredentials}>
              Back
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Profile...' : 'Complete Registration'}
            </button>
          </div>
        </form>

        <p className="footer-text">
          <button type="button" className="link-button" onClick={onBackHome}>
            Back to Home
          </button>
        </p>
      </section>
    </main>
  );
}

export default RegistrationPage;
