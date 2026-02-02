import type { PayloadRequest } from 'payload'
import { hashToken } from '../utils/hash'
import { getClearAuthCookiesHeaders, getCookieFromRequest } from '../utils/cookies'

export const logout = async (req: PayloadRequest): Promise<Response> => {
    const token = getCookieFromRequest(req.headers, 'refreshToken')
    const payload = req.payload

    if (token) {
        await payload.update({
            collection: 'refresh_tokens',
            where: {
                tokenHash: { equals: hashToken(token) },
            },
            data: { revoked: true },
            overrideAccess: true,
            req,
        })
    }

    await payload.create({
        collection: 'audit_logs',
        data: {
            user: req.user?.id,
            action: 'LOGOUT',
            ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? undefined,
            userAgent: req.headers.get('user-agent') ?? undefined,
        },
        req,
    })

    const responseHeaders = req.responseHeaders
        ? new Headers(req.responseHeaders)
        : new Headers()
    getClearAuthCookiesHeaders().forEach((value, key) =>
        responseHeaders.append(key, value)
    )

    return Response.json(
        { ok: true },
        { status: 200, headers: responseHeaders }
    )
}
