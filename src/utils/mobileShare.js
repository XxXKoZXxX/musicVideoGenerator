// Mobile Web Share API Utility

export async function shareCosmicContent({ title, text, url }) {
  const shareData = {
    title: title || 'Astraea Cosmic Reading',
    text: text || 'Check out my cosmic blueprint on Astraea!',
    url: url || window.location.href
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return { success: true, method: 'native' };
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
      return { success: false, error: err.name };
    }
  } else if (navigator.clipboard) {
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n${shareData.url}`);
      return { success: true, method: 'clipboard' };
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      return { success: false, error: 'clipboard_failed' };
    }
  }
  return { success: false, error: 'unsupported' };
}
