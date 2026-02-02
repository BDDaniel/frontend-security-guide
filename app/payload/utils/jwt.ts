import jwt from 'jsonwebtoken'
import { env } from './env'

export type AccessTokenPayload = {
    sub: string
    role: string
}

export const signAccessToken = (payload: AccessTokenPayload) => {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
    })
}

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload
}
