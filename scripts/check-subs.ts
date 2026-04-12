
import { Sequelize, Model } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
import * as entities from '../shared/postgres/entities';

dotenv.config();

async function checkSubscriptions() {
    const sequelize = new Sequelize({
        dialect: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'fivra_wellness',
        models: Object.values(entities).filter((entity: any) => entity && entity.name && entity.prototype && entity.prototype instanceof Model),
        logging: false,
    });

    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const plans = await entities.SubscriptionPlan.findAll();
        console.log('Total Plans:', plans.length);
        plans.forEach(p => {
            console.log(`Plan: ${p.planCategory}, Cycle: ${p.billingCycle}, Active: ${p.isActive}, Deleted: ${p.isDeleted}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkSubscriptions();
