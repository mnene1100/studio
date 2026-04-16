
'use server';

/**
 * @fileOverview Server Action for generating Agora RTC tokens securely.
 * Updated to return a result object instead of throwing to prevent Next.js 15 SSR crashes.
 */

import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

export async function getAgoraToken(channelName: string, uid: string) {
  const appId = process.env.AGORA_APP_ID || process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate) {
    console.error('Agora credentials missing on server');
    return { error: 'AGORA_CONFIGURATION_MISSING' };
  }

  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  try {
    // buildTokenWithUserAccount is used for string UIDs (like Firebase UIDs)
    const token = RtcTokenBuilder.buildTokenWithUserAccount(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpiredTs
    );

    return { token };
  } catch (error) {
    console.error('Failed to generate Agora token:', error);
    return { error: 'TOKEN_GENERATION_FAILED' };
  }
}
