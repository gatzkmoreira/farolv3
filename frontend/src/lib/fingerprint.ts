// Farol Rural — Anonymous user fingerprinting via persistent cookie
// LGPD-compliant: functional/technical cookie, no consent required

const COOKIE_NAME = "farol_uid";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

/**
 * Generates a unique device ID (UUID v4-like)
 */
function generateUID(): string {
    const hex = () => Math.random().toString(16).slice(2, 10);
    return `fr_${hex()}${hex()}${hex()}${hex()}`;
}

/**
 * Gets or creates the persistent farol_uid cookie.
 * Returns the UID string.
 */
export function getFarolUID(): string {
    // Try to read existing cookie
    const match = document.cookie.match(
        new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`)
    );

    if (match?.[1]) {
        return match[1];
    }

    // Generate new UID and set cookie
    const uid = generateUID();
    document.cookie = [
        `${COOKIE_NAME}=${uid}`,
        `max-age=${COOKIE_MAX_AGE}`,
        `path=/`,
        `SameSite=Lax`,
    ].join("; ");

    return uid;
}
