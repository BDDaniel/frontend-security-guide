import type { PayloadRequest } from 'payload'
import { verifyRefreshToken } from '../utils/refreshToken'
import { signAccessToken } from '../utils/jwt'
import { signRefreshToken } from '../utils/refreshToken'
import { getAuthCookiesHeaders, getClearAuthCookiesHeaders, getCookieFromRequest } from '../utils/cookies'
import { hashToken } from '../utils/hash'

export const refresh = async (req: PayloadRequest): Promise<Response> => {
    const token = getCookieFromRequest(req.headers, 'refreshToken')
    if (!token) {
        return Response.json(
            { message: 'No refresh token' },
            { status: 401 }
        )
    }

    let payload: { sub: string; tokenId: string }
    try {
        payload = verifyRefreshToken(token)
    } catch {
        const responseHeaders = req.responseHeaders
            ? new Headers(req.responseHeaders)
            : new Headers()
        getClearAuthCookiesHeaders().forEach((value, key) =>
            responseHeaders.append(key, value)
        )
        return Response.json(
            { message: 'Invalid refresh token' },
            { status: 401, headers: responseHeaders }
        )
    }

    const tokenHash = hashToken(token)
    const pl = req.payload

    const storedResult = await pl.find({
        collection: 'refresh_tokens',
        where: {
            and: [
                { tokenHash: { equals: tokenHash } },
                { revoked: { equals: false } },
            ],
        },
        limit: 1,
        overrideAccess: true,
        req,
    })

    if (!storedResult.docs.length) {
        await pl.update({
            collection: 'refresh_tokens',
            where: { user: { equals: payload.sub } },
            data: { revoked: true },
            overrideAccess: true,
            req,
        })

        const responseHeaders = req.responseHeaders
            ? new Headers(req.responseHeaders)
            : new Headers()
        getClearAuthCookiesHeaders().forEach((value, key) =>
            responseHeaders.append(key, value)
        )
        return Response.json(
            { message: 'Token reuse detected' },
            { status: 401, headers: responseHeaders }
        )
    }

    const storedToken = storedResult.docs[0]
    await pl.update({
        collection: 'refresh_tokens',
        id: storedToken.id,
        data: { revoked: true },
        overrideAccess: true,
        req,
    })

    const user = await pl.findByID({
        collection: 'users',
        id: payload.sub,
        overrideAccess: true,
        req,
    })
    const role = (user as { role?: string })?.role ?? 'user'

    const newAccessToken = signAccessToken({
        sub: payload.sub,
        role,
    })

    const newRefreshToken = signRefreshToken({
        sub: payload.sub,
        tokenId: crypto.randomUUID(),
    })

    await pl.create({
        collection: 'refresh_tokens',
        data: {
            user: payload.sub,
            tokenHash: hashToken(newRefreshToken),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        req,
    })

    const responseHeaders = req.responseHeaders
        ? new Headers(req.responseHeaders)
        : new Headers()
    getAuthCookiesHeaders(newAccessToken, newRefreshToken).forEach(
        (value, key) => responseHeaders.append(key, value)
    )

    return Response.json(
        { ok: true },
        { status: 200, headers: responseHeaders }
    )
}
