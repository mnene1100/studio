
'use server';

/**
 * @fileOverview Server Action for generating Agora RTC tokens securely.
 * Optimized for reliability and clear error reporting.
 */

import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

export async function getAgoraToken(channelName: string, uid: string) {
  const appId = process.env.AGORA_APP_ID || process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  // 1. Check for basic configuration
  if (!appId || !appCertificate) {
    console.error('Agora credentials missing on server');
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
    // buildTokenWithUserAccount is the correct method for string-based UIDs (Firebase UIDs)
    const token = RtcTokenBuilder.buildTokenWithUserAccount(
      appId,
      appCertificate,
      channelName,
      uid, // Account string
      role,
      privilegeExpiredTs
    );

    if (!token) {
      throw new Error('Builder returned empty token');
    }

    return { token };
  } catch (error: any) {
    console.error('Agora Token Builder Error:', error);
    return { 
      error: 'TOKEN_GENERATION_FAILED', 
      details: error.message || 'Unknown generation error' 
    };
  }
}
