/**
 * Healthcare Helpline Direct Calling Service
 *
 * Directly redirects/initiates phone call to the official 24/7 Healthcare Coordination Helpline:
 * +91 6205844155
 */

export const HELPLINE_PHONE_NUMBER = '+91 6205844155';
export const HELPLINE_DISPLAY_NUMBER = '+91 6205844155';
export const HELPLINE_TEL_URI = 'tel:+916205844155';

export const initiateHelplineCall = (): void => {
  try {
    window.location.href = HELPLINE_TEL_URI;
  } catch {
    window.open(HELPLINE_TEL_URI, '_self');
  }
};

export const openHelplineDialer = (): void => {
  initiateHelplineCall();
};
