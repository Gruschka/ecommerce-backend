import { ProductImage } from './schemas/ProductImage';
import { createAuth } from '@keystone-next/auth';
import { config, createSchema } from '@keystone-next/keystone/schema';
import { Product } from './schemas/Product';
import { User } from './schemas/User';
import 'dotenv/config';
import { withItemData, statelessSessions } from '@keystone-next/keystone/session';
import { insertSeedData } from './seed-data';

const databaseURL = process.env.DATABASE_URL || 'mongodb://localhost/keystone-ecommerce';
const sessionConfig = {
    maxAge: 60 * 60 * 24 * 360, //How long a user stays signed in
    secret: process.env.COOKIE_SECRET,
};
const { withAuth } = createAuth({
    listKey: 'User',
    identityField: 'email',
    secretField: 'password',
    initFirstItem: {
        fields: ['name', 'email', 'password'],

    }
})
export default withAuth(config({
    server: {
        cors: {
            origin: [process.env.FRONTEND_URL],
            credentials: true,
        },
    },
    db: {
        adapter: 'mongoose',
        url: databaseURL,
        async onConnect(keystone){
            if(process.argv.includes('--seed-data')){
                await insertSeedData(keystone);
            }
        }
    },
    lists: createSchema({
        User,
        Product,
        ProductImage
    }),
    ui: {
        //Show keystone UI only for people who passes the following test
        isAccessAllowed: ({ session }) => {
            return !!session?.data;
        },
    },
    session: withItemData(statelessSessions(sessionConfig), {
        User: 'id'
    })
}));