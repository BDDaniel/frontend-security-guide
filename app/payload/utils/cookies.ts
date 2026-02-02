/**
 * Helpers for auth cookies compatible with Payload 3 (Web API Request/Response).
 * Use the returned Headers in Response or merge with req.responseHeaders.
 */

const COOKIE_OPTS = 'Path=/; HttpOnly; Secure; SameSite=Strict'

export function getAuthCookiesHeaders(
    accessToken: string,
    refreshToken: string
): Headers {
    const headers = new Headers()
    headers.append(
        'Set-Cookie',
        `accessToken=${accessToken}; ${COOKIE_OPTS}; Max-Age=${15 * 60}` // 15 min
    )
    headers.append(
        'Set-Cookie',
        `refreshToken=${refreshToken}; ${COOKIE_OPTS}; Max-Age=${30 * 24 * 60 * 60}` // 30 days
    )
    return headers
}

export function getClearAuthCookiesHeaders(): Headers {
    const headers = new Headers()
    headers.append(
        'Set-Cookie',
        `accessToken=; ${COOKIE_OPTS}; Max-Age=0`
    )
    headers.append(
        'Set-Cookie',
        `refreshToken=; ${COOKIE_OPTS}; Max-Age=0`
    )
    return headers
}

/** Parse Cookie header from Request into a map. */
export function getCookieFromRequest(headers: Headers, name: string): string | null {
    const cookieHeader = headers.get('Cookie')
    if (!cookieHeader) return null
    const parts = cookieHeader.split(';')
    for (const part of parts) {
        const [key, ...valueParts] = part.split('=')
        const keyTrim = key?.trim()
        if (keyTrim === name) {
            const value = valueParts.join('=').trim()
            try {
                return decodeURIComponent(value)
            } catch {
                return value
            }
        }
    }
    return null
}

