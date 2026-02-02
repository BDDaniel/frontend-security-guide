export const env = {
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    ACCESS_TOKEN_EXPIRES_IN: '15m',
    REFRESH_TOKEN_EXPIRES_IN: '30d',
} as const

if (!env.JWT_ACCESS_SECRET || !env.JWT_REFRESH_SECRET) {
    throw new Error('JWT secrets are not defined')
}
