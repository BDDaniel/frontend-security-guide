import { CollectionConfig } from 'payload'

export const AuditLogs: CollectionConfig = {
    slug: 'audit_logs',
    access: {
        read: ({ req }) => req.user?.role === 'admin',
        create: () => true,
        update: () => false,
        delete: () => false,
    },
    fields: [
        {
            name: 'user',
            type: 'relationship',
            relationTo: 'users',
        },
        {
            name: 'action',
            type: 'text',
            required: true,
        },
        {
            name: 'ip',
            type: 'text',
        },
        {
            name: 'userAgent',
            type: 'text',
        },
    ],
    timestamps: true,
}
