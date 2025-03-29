export interface PasswordStrength {
  score: number; // 0-4
  label: string; // 'Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'
  color: string; // Tailwind color classes
  feedback: string[];
}

export function validatePassword(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters long');
  } else {
    score += 1;
  }

  // Contains number
  if (!/\d/.test(password)) {
    feedback.push('Password should contain at least one number');
  } else {
    score += 1;
  }

  // Contains lowercase letter
  if (!/[a-z]/.test(password)) {
    feedback.push('Password should contain at least one lowercase letter');
  } else {
    score += 1;
  }

  // Contains uppercase letter
  if (!/[A-Z]/.test(password)) {
    feedback.push('Password should contain at least one uppercase letter');
  } else {
    score += 1;
  }

  // Contains special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Password should contain at least one special character');
  } else {
    score += 1;
  }

  // Determine strength label and color
  let label: string;
  let color: string;

  switch (score) {
    case 0:
      label = 'Very Weak';
      color = 'bg-red-500';
      break;
    case 1:
      label = 'Weak';
      color = 'bg-orange-500';
      break;
    case 2:
      label = 'Medium';
      color = 'bg-yellow-500';
      break;
    case 3:
      label = 'Strong';
      color = 'bg-green-500';
      break;
    default:
      label = 'Very Strong';
      color = 'bg-green-600';
  }

  return {
    score,
    label,
    color,
    feedback: feedback.length > 0 ? feedback : ['Password strength is good!'],
  };
} 