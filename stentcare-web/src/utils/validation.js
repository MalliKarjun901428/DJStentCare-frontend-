/**
 * Centralized validation logic for StentCare
 */

export const validatePhone = (value) => {
  // Allow only digits
  const numericValue = value.replace(/\D/g, '');
  
  // Strictly enforce 10 digits max
  const truncatedValue = numericValue.slice(0, 10);
  
  let error = '';
  if (!truncatedValue) {
    error = 'Phone number is required';
  } else if (truncatedValue.length < 10) {
    error = 'Phone number must be exactly 10 digits';
  }

  return {
    value: truncatedValue,
    error: error
  };
};

export const validateAge = (value) => {
  // Allow only digits
  const numericValue = value.replace(/\D/g, '');
  
  // Strictly enforce 2 digits max (0-99)
  const truncatedValue = numericValue.slice(0, 2);
  
  let error = '';
  if (!truncatedValue) {
    error = 'Age is required';
  } else {
    const ageNum = parseInt(truncatedValue);
    if (ageNum < 0 || ageNum > 99) {
      error = 'Age must be between 0 and 99';
    }
  }

  return {
    value: truncatedValue,
    error: error
  };
};

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) ? '' : 'Please enter a valid email address';
};

/**
 * Formats a 10-digit phone number string into: 98765 43210
 */
export const formatPhoneNumber = (value) => {
  if (!value) return '';
  const numericValue = value.replace(/\D/g, '').slice(0, 10);
  if (numericValue.length > 5) {
    return `${numericValue.slice(0, 5)} ${numericValue.slice(5)}`;
  }
  return numericValue;
};
