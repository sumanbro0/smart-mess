// Generate a random code verifier (base64url encoded)
export function generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// Generate code challenge from verifier
export async function generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// Store code verifier in localStorage with timestamp
export function storeCodeVerifier(verifier: string): void {
    if (typeof window !== "undefined") {
        const data = {
            verifier,
            timestamp: Date.now()
        };
        localStorage.setItem("oauth_code_verifier", JSON.stringify(data));
        console.log("Stored code verifier with timestamp");
    }
}

// Get stored code verifier
export function getStoredCodeVerifier(): string | null {
    if (typeof window !== "undefined") {
        const stored = localStorage.getItem("oauth_code_verifier");
        if (!stored) {
            console.log("No code verifier found in storage");
            return null;
        }

        try {
            const data = JSON.parse(stored);
            // Check if the code verifier is less than 10 minutes old
            if (Date.now() - data.timestamp > 10 * 60 * 1000) {
                console.log("Code verifier expired");
                // clearStoredCodeVerifier();
                return null;
            }
            console.log("Retrieved valid code verifier");
            return data.verifier;
        } catch (e) {
            console.error("Error parsing stored code verifier:", e);
            // clearStoredCodeVerifier();
            return null;
        }
    }
    return null;
}

// Clear stored code verifier
export function clearStoredCodeVerifier(): void {
    if (typeof window !== "undefined") {
        localStorage.removeItem("oauth_code_verifier");
        console.log("Cleared code verifier from storage");
    }
}

// Complete OAuth flow helper
export async function initiatePKCEFlow(): Promise<{ verifier: string; challenge: string }> {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    storeCodeVerifier(verifier);
    return { verifier, challenge };
}