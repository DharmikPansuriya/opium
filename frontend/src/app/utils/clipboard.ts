export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text:', err);
    return false;
  }
}

export function showCopyFeedback(element: HTMLElement, success: boolean) {
  const originalText = element.textContent;
  const originalClasses = element.className;

  // Update text and style
  element.textContent = success ? 'Copied!' : 'Failed to copy';
  element.className = `${originalClasses} ${
    success ? 'text-green-500' : 'text-red-500'
  }`;

  // Reset after 2 seconds
  setTimeout(() => {
    element.textContent = originalText;
    element.className = originalClasses;
  }, 2000);
} 