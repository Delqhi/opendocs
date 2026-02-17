import api from '../../../lib/api/client';

export const authService = {
  login: async (credentials: unknown) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: unknown) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  registerBiometric: async () => {
    if (!window.PublicKeyCredential) {
      throw new Error('WebAuthn not supported');
    }

    const challengeResponse = await api.post('/auth/passkey/register/challenge', {});
    const { challenge, userId } = challengeResponse.data;

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: Uint8Array.from(atob(challenge), c => c.charCodeAt(0)),
        rp: {
          name: 'NEXUS AI Shop',
          id: window.location.hostname,
        },
        user: {
          id: Uint8Array.from(userId, c => c.charCodeAt(0)),
          name: 'user',
          displayName: 'NEXUS User',
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
        ],
        timeout: 60000,
        excludeCredentials: [],
        attestation: 'none',
      },
    }) as PublicKeyCredential;

    const attestationResponse = {
      id: credential.id,
      type: credential.type,
      response: {
        clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
        attestationObject: Array.from(new Uint8Array(credential.response.attestationObject)),
      },
    };

    await api.post('/auth/passkey/register/verify', attestationResponse);
    return { success: true };
  },

  biometricLogin: async () => {
    if (!window.PublicKeyCredential) {
      throw new Error('WebAuthn not supported');
    }

    const challengeResponse = await api.post('/auth/passkey/login/challenge', {});
    const { challenge, allowCredentials } = challengeResponse.data;

    const credential = await navigator.credentials.get({
      publicKey: {
        challenge: Uint8Array.from(atob(challenge), c => c.charCodeAt(0)),
        timeout: 60000,
        allowCredentials: allowCredentials.map((cred: { id: string }) => ({
          id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0)),
          type: 'public-key',
        })),
        userVerification: 'preferred',
      },
    }) as PublicKeyCredential;

    const assertionResponse = {
      id: credential.id,
      type: credential.type,
      response: {
        clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
        authenticatorData: Array.from(new Uint8Array(credential.response.authenticatorData)),
        signature: Array.from(new Uint8Array(credential.response.signature)),
      },
    };

    const { data } = await api.post('/auth/passkey/login/verify', assertionResponse);
    return data;
  },
};
