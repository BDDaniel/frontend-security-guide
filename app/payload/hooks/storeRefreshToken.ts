import type { PayloadRequest } from 'payload'
import { hashToken } from '../utils/hash'
import { addDays } from '../utils/dates'

type ReqWithRefreshToken = PayloadRequest & { refreshToken?: string }
type UserDoc = { id: string }

/**
 * Stores a refresh token for a user. Call from your custom login handler
 * after creating the refresh token, e.g.:
 *   req.refreshToken = refreshToken
 *   await storeRefreshToken({ req, doc: user })
 */
export const storeRefreshToken = async ({
    req,
    doc,
}: {
    req: ReqWithRefreshToken
    doc: UserDoc
}): Promise<void> => {
    const token = req.refreshToken
    if (!token) return

    await req.payload.create({
        collection: 'refresh_tokens',
        data: {
            user: doc.id,
            tokenHash: hashToken(token),
            expiresAt: addDays(30),
        },
        req,
    })
}
