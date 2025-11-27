'use client';

import { useState, useRef, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export const CATEGORY_OPTIONS = ['Hardware', 'Software', 'Network', 'Printer', 'Others'];
export const SEVERITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];

export const severityColors = {
  Low: '#27AE60',
  Medium: '#F39C12',
  High: '#D35400',
  Critical: '#C0392B',
};

export const stepOrder = ['userDetails', 'category', 'severity', 'details', 'summary'];

export function useTicketForm() {
  const [userDetails, setUserDetails] = useState({ name: '', department: '' });
  const [category, setCategory] = useState('');
  const [otherCategoryDetails, setOtherCategoryDetails] = useState('');
  const [severity, setSeverity] = useState('');
  const [details, setDetails] = useState('');
  const [detailsError, setDetailsError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const feedbackTimeout = useRef(null);
  const progressInterval = useRef(null);
  const [alertProgress, setAlertProgress] = useState(100);
  const [activeStep, setActiveStep] = useState('userDetails');
  const [maxStepIndex, setMaxStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation logic
  const isUserDetailsValid =
    userDetails.name.trim().length > 0 && userDetails.department.trim().length > 0;
  const isCategoryValid = Boolean(
    category && (category !== 'Others' || otherCategoryDetails.trim().length > 0)
  );
  const isSeverityValid = Boolean(severity);
  const isDetailsValid = details.trim().length > 0 && !detailsError;

  // Helper functions
  const getSeverityHighlightStyles = (level, isSelected) => {
    const color = severityColors[level];
    if (!isSelected || !color) {
      return undefined;
    }

    return {
      borderColor: color,
      boxShadow: `0 0 25px ${color}40`,
      backgroundColor: `${color}1A`,
    };
  };

  const handleUserDetailsChange = (event) => {
    const { name, value } = event.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetailsChange = (event) => {
    const value = event.target.value;
    if (value.length > 150) {
      setDetailsError('Details must be 150 characters or less.');
      setDetails(value.slice(0, 150));
    } else {
      setDetailsError('');
      setDetails(value);
    }
  };

  const handleOtherCategoryDetailsChange = (event) => {
    const value = event.target.value;
    if (value.length > 25) {
      setOtherCategoryDetails(value.slice(0, 25));
    } else {
      setOtherCategoryDetails(value);
    }
  };

  const resetForm = () => {
    setUserDetails({ name: '', department: '' });
    setCategory('');
    setOtherCategoryDetails('');
    setSeverity('');
    setDetails('');
    setDetailsError('');
    setActiveStep('userDetails');
    setMaxStepIndex(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimeout.current) {
        clearTimeout(feedbackTimeout.current);
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const showFeedback = (message, type) => {
    if (feedbackTimeout.current) {
      clearTimeout(feedbackTimeout.current);
    }
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    setAlertProgress(100);
    setFeedback({ message, type });
    
    // Start progress bar animation (drain over 4 seconds)
    const startTime = Date.now();
    const duration = 4000;
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setAlertProgress(remaining);
      
      if (remaining <= 0) {
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      }
    }, 16); // Update every ~16ms for smooth animation
    
    feedbackTimeout.current = setTimeout(() => {
      setFeedback(null);
      setAlertProgress(100);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }, 4000);
  };

  const dismissFeedback = () => {
    if (feedbackTimeout.current) {
      clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = null;
    }
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    setFeedback(null);
    setAlertProgress(100);
  };

  const isStepAccessible = (step) => {
    const index = stepOrder.indexOf(step);
    if (index > maxStepIndex) {
      return false;
    }

    switch (step) {
      case 'category':
        return isUserDetailsValid;
      case 'severity':
        return isUserDetailsValid && isCategoryValid;
      case 'details':
        return isUserDetailsValid && isCategoryValid && isSeverityValid;
      case 'summary':
        return (
          isUserDetailsValid &&
          isCategoryValid &&
          isSeverityValid &&
          isDetailsValid &&
          details.length <= 150
        );
      default:
        return true;
    }
  };

  const handleStepChange = (step) => {
    if (isStepAccessible(step)) {
      setActiveStep(step);
    }
  };

  const handleCardKeyDown = (event, step) => {
    if ((event.key === 'Enter' || event.key === ' ') && isStepAccessible(step)) {
      event.preventDefault();
      setActiveStep(step);
    }
  };

  const isNextDisabled = () => {
    switch (activeStep) {
      case 'userDetails':
        return !isUserDetailsValid;
      case 'category':
        return !isCategoryValid;
      case 'severity':
        return !isSeverityValid;
      case 'details':
        return !isDetailsValid;
      case 'summary':
        return !(isUserDetailsValid && isCategoryValid && isSeverityValid && isDetailsValid);
      default:
        return true;
    }
  };

  const handleBack = () => {
    const currentIndex = stepOrder.indexOf(activeStep);
    if (currentIndex > 0) {
      setActiveStep(stepOrder[currentIndex - 1]);
    }
  };

  const submitTicket = async () => {
    const categoryValue = category === 'Others' ? otherCategoryDetails.trim() : category;
    const submittedAtLocal = new Date().toLocaleString();
    await addDoc(collection(db, 'Tickets'), {
      name: userDetails.name.trim(),
      department: userDetails.department.trim(),
      category: categoryValue,
      severity,
      details: details.trim().slice(0, 150),
      submittedAt: serverTimestamp(),
      submittedAtLocal,
      status: 'unresolved',
    });
  };

  const handleNext = async (event) => {
    event.preventDefault();
    if (isNextDisabled()) {
      return;
    }

    if (activeStep === 'summary') {
      setIsSubmitting(true);
      const startTime = Date.now();
      const minDisplayTime = 4000; // 4 seconds minimum
      
      try {
        await submitTicket();
        resetForm();
        
        // Ensure loading overlay shows for at least 4 seconds
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minDisplayTime - elapsed);
        
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
        
        setIsSubmitting(false);
        showFeedback('Ticket submitted successfully!', 'success');
      } catch (error) {
        console.error('Ticket submission failed:', error);
        
        // Ensure loading overlay shows for at least 4 seconds even on error
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minDisplayTime - elapsed);
        
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
        
        setIsSubmitting(false);
        showFeedback('Failed to submit the ticket. Please try again.', 'error');
      }
      return;
    }

    const currentIndex = stepOrder.indexOf(activeStep);
    const nextStep = stepOrder[currentIndex + 1];
    if (nextStep) {
      setActiveStep(nextStep);
      setMaxStepIndex((prev) => Math.max(prev, currentIndex + 1));
    }
  };

  // Computed values
  const categorySummary = category
    ? category === 'Others'
      ? otherCategoryDetails.trim() || 'Custom category'
      : category
    : 'No category selected yet';

  const severitySummary = severity || 'No severity selected yet';

  const nextLabel = activeStep === 'summary' ? 'Submit ticket' : 'Next';

  return {
    // State
    userDetails,
    category,
    otherCategoryDetails,
    severity,
    details,
    detailsError,
    feedback,
    alertProgress,
    activeStep,
    maxStepIndex,
    isSubmitting,
    // Validation
    isUserDetailsValid,
    isCategoryValid,
    isSeverityValid,
    isDetailsValid,
    // Handlers
    handleUserDetailsChange,
    handleDetailsChange,
    handleOtherCategoryDetailsChange,
    setCategory,
    setOtherCategoryDetails,
    setSeverity,
    resetForm,
    showFeedback,
    dismissFeedback,
    isStepAccessible,
    handleStepChange,
    handleCardKeyDown,
    isNextDisabled,
    handleBack,
    handleNext,
    // Helpers
    getSeverityHighlightStyles,
    categorySummary,
    severitySummary,
    nextLabel,
  };
}

