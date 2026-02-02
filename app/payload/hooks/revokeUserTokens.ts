import type { Payload } from 'payload'

export const revokeUserTokens = async (
    payload: Payload,
    userId: string
): Promise<void> => {
    const tokens = await payload.find({
        collection: 'refresh_tokens',
        where: {
            user: { equals: userId },
            revoked: { equals: false },
        },
    })

    for (const token of tokens.docs) {
        await payload.update({
            collection: 'refresh_tokens',
            id: token.id,
            data: { revoked: true },
        })
    }
}
