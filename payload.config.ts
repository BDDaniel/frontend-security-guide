import sharp from 'sharp'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig } from 'payload'
import { Users } from './app/payload/collections/Users'
import { RefreshTokens } from './app/payload/collections/RefreshTokens'
import { AuditLogs } from './app/payload/collections/AuditLogs'
import { login } from './app/payload/auth/login'
import { refresh } from './app/payload/auth/refresh'
import { logout } from './app/payload/auth/logout'

export default buildConfig({
    // If you'd like to use Rich Text, pass your editor here
    editor: lexicalEditor(),

    // Define the authentication collection
    admin: {
        user: Users.slug,
    },

    // Define and configure your collections in this array
    collections: [Users, RefreshTokens, AuditLogs],

    // Define custom endpoints
    endpoints: [
        {
            path: '/auth/login',
            method: 'post',
            handler: login,
        },
        {
            path: '/auth/refresh',
            method: 'post',
            handler: refresh,
        },
        {
            path: '/auth/logout',
            method: 'post',
            handler: logout,
        },
    ],

    // Your Payload secret - should be a complex and secure string, unguessable
    secret: process.env.PAYLOAD_SECRET || '',
    // Whichever Database Adapter you're using should go here
    db: postgresAdapter({
        pool: {
            connectionString: process.env.DATABASE_URL || '',
        }
    }),
    // If you want to resize images, crop, set focal point, etc.
    // make sure to install it and pass it to the config.
    // This is optional - if you don't need to do these things,
    // you don't need it!
    sharp,
})