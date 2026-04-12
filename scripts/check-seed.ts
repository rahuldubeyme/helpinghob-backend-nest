
import { Sequelize, Model } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
import * as entities from '../shared/postgres/entities';

dotenv.config();

async function check() {
    const sequelize = new Sequelize({
        dialect: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'fivra_wellness',
        models: Object.values(entities).filter((entity: any) => entity && entity.name && entity.prototype && entity.prototype instanceof Model) as any,
        logging: false,
    });

    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const counts = {
            SuperAdmin: await entities.SuperAdmin.count(),
            Company: await entities.Company.count(),
            Employee: await entities.Employee.count(),
            Merchant: await entities.Merchant.count(),
            Wallet: await entities.Wallet.count(),
            Booking: await entities.Booking.count(),
            UserPoints: await entities.UserPoints.count(),
            SubscriptionPlan: await entities.SubscriptionPlan.count(),
            Benefits: await entities.Benefits.count(),
            CompanyDetails: await entities.CompanyDetails.count(),
        };

        console.log('Record Counts:');
        console.table(counts);

    } catch (error) {
        console.error('Check failed:', error);
    } finally {
        await sequelize.close();
    }
}

check();
