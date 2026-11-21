export async function copyTextToClipboard(text) {
  if (typeof text !== 'string') {
    throw new TypeError('Clipboard text must be a string.');
  }

  const canUseClipboardApi =
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    typeof navigator !== 'undefined' &&
    typeof navigator.clipboard?.writeText === 'function';

  if (canUseClipboardApi) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to the legacy copy method when clipboard permissions fail.
    }
  }

  if (typeof document === 'undefined' || !document.body || typeof document.execCommand !== 'function') {
    throw new Error('Clipboard access is unavailable.');
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);

  try {
    textarea.focus();
    textarea.select();
    if (!document.execCommand('copy')) {
      throw new Error('Clipboard copy was rejected.');
    }
  } finally {
    document.body.removeChild(textarea);
  }
}
