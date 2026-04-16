
'use server';

/**
 * @fileOverview Server Action for generating Agora RTC tokens securely.
 * Updated for maximum compatibility with string-based user accounts (Firebase UIDs).
 */

import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

export async function getAgoraToken(channelName: string, uid: string) {
  const appId = process.env.AGORA_APP_ID || process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  // 1. Check for configuration
  if (!appId || !appCertificate || appId.trim() === '' || appCertificate.trim() === '') {
    console.error('Agora credentials missing or empty on server');
    return { error: 'AGORA_CONFIGURATION_MISSING' };
  }

  // 2. Validate inputs
  if (!channelName || !uid) {
    console.error('Invalid token request params:', { channelName, uid });
    return { error: 'INVALID_PARAMETERS' };
  }

  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  try {
    /**
     * Use buildTokenWithAccount for string-based UIDs (User Accounts).
     * This is the standard method for Firebase-integrated Agora apps.
     */
    const token = RtcTokenBuilder.buildTokenWithAccount(
      appId,
      appCertificate,
      channelName,
      uid, // The user's account string (Firebase UID)
      role,
      privilegeExpiredTs
    );

    if (!token || token.trim() === '') {
      throw new Error('Agora builder returned an empty token');
    }

    return { token };
  } catch (error: any) {
    console.error('Agora Token Builder Critical Error:', error);
    return { 
      error: 'TOKEN_GENERATION_FAILED', 
      details: error.message || 'The token generator encountered an internal error. Please verify your App ID and Certificate.' 
    };
  }
}
