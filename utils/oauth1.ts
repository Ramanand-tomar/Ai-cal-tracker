import CryptoJS from 'crypto-js';

/**
 * Handles OAuth 1.0a signing for FatSecret API
 */
export const generateOAuth1Header = (
    method: string,
    url: string,
    params: Record<string, string>,
    consumerKey: string,
    consumerSecret: string
) => {
    const oauthParams: Record<string, string> = {
        ...params,
        oauth_consumer_key: consumerKey,
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_nonce: Math.random().toString(36).substring(2, 11),
        oauth_version: '1.0',
    };

    // 1. Sort parameters alphabetically by key
    const sortedKeys = Object.keys(oauthParams).sort();
    const parameterString = sortedKeys
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(oauthParams[key])}`)
        .join('&');

    // 2. Create Base String
    const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(parameterString)}`;

    // 3. Create Signing Key
    const signingKey = `${encodeURIComponent(consumerSecret)}&`;

    // 4. Generate Signature
    const signature = CryptoJS.HmacSHA1(baseString, signingKey).toString(CryptoJS.enc.Base64);

    // 5. Add Signature to params
    oauthParams.oauth_signature = signature;

    return oauthParams;
};
