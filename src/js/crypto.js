/**
 * Generate a random password using the Web Crypto API.
 * @param {number} length - Length of the desired password.
 * @param {string} pool - Set of characters to use.
 * @returns {string} Generated password.
 */
export function generatePassword(length, pool) {
    if (!pool || length <= 0) return '';
    
    let pass = '';
    const maxValidByte = Math.floor(4294967296 / pool.length) * pool.length;
    const buffer = new Uint32Array(1);

    while (pass.length < length) {
        window.crypto.getRandomValues(buffer);
        const randomValue = buffer[0];
        
        // Rejection Sampling
        if (randomValue < maxValidByte) {
            pass += pool[randomValue % pool.length];
        }
    }
    return pass;
}

/**
 * Calculate the entropy of the password in bits. Formula: E = L * log2(R)
 * @param {number} length - Length of the password.
 * @param {number} poolSize - Size of the character pool.
 * @returns {number} Integer value of the entropy.
 */
export function calculateEntropy(length, poolSize) {
    if (poolSize <= 0 || length <= 0) return 0;
    return Math.floor(length * Math.log2(poolSize));
}
