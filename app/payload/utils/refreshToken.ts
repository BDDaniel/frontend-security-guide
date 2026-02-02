import jwt from 'jsonwebtoken'
import { env } from './env'

export type RefreshTokenPayload = {
    sub: string
    tokenId: string
}

export const signRefreshToken = (payload: RefreshTokenPayload) => {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
    })
}

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload
}
