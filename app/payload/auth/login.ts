import type { PayloadRequest } from 'payload'
import { signAccessToken } from '../utils/jwt'
import { signRefreshToken } from '../utils/refreshToken'
import { getAuthCookiesHeaders } from '../utils/cookies'
import { hashToken } from '../utils/hash'

export const login = async (req: PayloadRequest): Promise<Response> => {
    let body: { email?: string; password?: string }
    try {
        body = (await req.json?.()) as { email?: string; password?: string }
    } catch {
        return Response.json(
            { message: 'Invalid JSON body' },
            { status: 400 }
        )
    }

    const { email, password } = body
    if (!email || !password) {
        return Response.json(
            { message: 'Missing credentials' },
            { status: 400 }
        )
    }

    const payload = req.payload
    let result: Awaited<ReturnType<typeof payload.login>>
    try {
        result = await payload.login({
            collection: 'users',
            data: { email, password },
            req,
        })
    } catch {
        return Response.json(
            { message: 'Invalid credentials' },
            { status: 401 }
        )
    }

    const user = result?.user
    if (!user || !(user as { active?: boolean }).active) {
        return Response.json(
            { message: 'Invalid credentials' },
            { status: 401 }
        )
    }

    const userWithRole = user as { id: string; email?: string; role?: string }
    const accessToken = signAccessToken({
        sub: userWithRole.id,
        role: userWithRole.role ?? 'user',
    })

    const refreshToken = signRefreshToken({
        sub: userWithRole.id,
        tokenId: crypto.randomUUID(),
    })

    await payload.create({
        collection: 'refresh_tokens',
        data: {
            user: userWithRole.id,
            tokenHash: hashToken(refreshToken),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        req,
    })

    const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        req.headers.get('x-real-ip') ??
        undefined
    const userAgent = req.headers.get('user-agent') ?? undefined

    await payload.create({
        collection: 'audit_logs',
        data: {
            user: userWithRole.id,
            action: 'LOGIN',
            ip,
            userAgent,
        },
        req,
    })

    const cookieHeaders = getAuthCookiesHeaders(accessToken, refreshToken)
    const responseHeaders = req.responseHeaders
        ? new Headers(req.responseHeaders)
        : new Headers()
    cookieHeaders.forEach((value, key) => responseHeaders.append(key, value))

    return Response.json(
        {
            user: {
                id: userWithRole.id,
                email: userWithRole.email,
                role: userWithRole.role,
            },
        },
        { status: 200, headers: responseHeaders }
    )
}
