import { CollectionConfig } from 'payload'

export const RefreshTokens: CollectionConfig = {
    slug: 'refresh_tokens',
    access: {
        read: () => false,
        create: () => true,
        update: () => false,
        delete: () => false,
    },
    fields: [
        {
            name: 'user',
            type: 'relationship',
            relationTo: 'users',
            required: true,
        },
        {
            name: 'tokenHash',
            type: 'text',
            required: true,
        },
        {
            name: 'expiresAt',
            type: 'date',
            required: true,
        },
        {
            name: 'revoked',
            type: 'checkbox',
            defaultValue: false,
        },
    ],
    timestamps: true,
}