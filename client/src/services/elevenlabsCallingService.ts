/**
 * ElevenLabs Calling Service
 * Directly opens and triggers the official ElevenLabs Conversational AI calling widget.
 */
export const openElevenLabsCalling = (): void => {
  const widget = document.querySelector('elevenlabs-convai');
  if (widget) {
    // Check shadowRoot for the main call trigger button
    if (widget.shadowRoot) {
      const callBtn = widget.shadowRoot.querySelector('button');
      if (callBtn) {
        callBtn.click();
        return;
      }
    }
    // Fallback click on widget element itself
    (widget as HTMLElement).click();
  } else {
    // If widget not mounted yet, scroll to bottom or click any existing convai element
    const el = document.getElementsByTagName('elevenlabs-convai')[0];
    if (el) {
      (el as HTMLElement).click();
    }
  }
};
