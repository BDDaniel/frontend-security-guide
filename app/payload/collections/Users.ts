import { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
    slug: 'users',
    auth: true,
    admin: {
        useAsTitle: 'email',
    },
    access: {
        read: ({ req }) => !!req.user,
        create: () => true,
        update: ({ req }) => req.user?.role === 'admin',
        delete: ({ req }) => req.user?.role === 'admin',
    },
    fields: [
        {
            name: 'role',
            type: 'select',
            required: true,
            defaultValue: 'user',
            options: ['admin', 'user'],
        },
        {
            name: 'active',
            type: 'checkbox',
            defaultValue: true,
        },
        {
            name: 'lastLogin',
            type: 'date',
        },
    ],
}
