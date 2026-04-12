
import { Sequelize, Model } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
import * as entities from '../shared/postgres/entities';
import { hashPassword } from '../common/utils/string.util';

dotenv.config();

async function bootstrap() {
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

        const commonPassword = await hashPassword('Admin@123');

        // 1. Create Super Admin
        let superAdmin = await entities.SuperAdmin.findOne({ where: { email: 'admin@fivra.com' } });
        if (!superAdmin) {
            superAdmin = await entities.SuperAdmin.create({
                email: 'admin@fivra.com',
                password: commonPassword,
                name: 'System Administrator',
                isActive: true,
            });
            console.log('SuperAdmin created:', superAdmin.id);
        }

        // 2. Create Business Industries
        const industriesList = [
            { name: 'IT Company', isActive: true },
            { name: 'Hospitality', isActive: true },
            { name: 'Healthcare', isActive: true },
            { name: 'Education', isActive: true },
            { name: 'Retail', isActive: true }
        ];
        for (const ind of industriesList) {
            const existing = await entities.BusinessIndustry.findOne({ where: { name: ind.name } });
            if (!existing) await entities.BusinessIndustry.create(ind);
        }
        console.log('Business Industries seeded');

        const itIndustry = await entities.BusinessIndustry.findOne({ where: { name: 'IT Company' } });

        // 3. Create or Find Company
        let company = await entities.Company.findOne({ where: { email: 'admin@company.com' } });
        if (!company) {
            company = await entities.Company.create({
                firstName: 'John',
                lastName: 'Doe',
                countryCode: '+973',
                phoneNumber: '12345678',
                email: 'admin@company.com',
                password: commonPassword,
                slug: 'acme-corp',
                country: 'Bahrain',
                currency: 'BHD',
                profileStatus: 'approve',
                isActive: true,
                isVerify: true,
            });
            console.log('Company created:', company.id);
        }

        // 4. Create or Find Company Details
        let companyDetails = await entities.CompanyDetails.findOne({ where: { companyId: company.id } });
        if (!companyDetails) {
            companyDetails = await entities.CompanyDetails.create({
                companyId: company.id,
                companyName: 'Acme Corp',
                companyLogo: 'logo.png',
                size: 'less_than_100',
                lat: '26.0667',
                long: '50.5577',
                address: 'Manama, Bahrain',
            } as any);
            console.log('CompanyDetails created');
        }

        if (itIndustry) {
            const existingIndustry = await entities.CompanyIndustry.findOne({
                where: { companyId: company.id, businessIndustryId: itIndustry.id }
            });
            if (!existingIndustry) {
                await entities.CompanyIndustry.create({
                    companyId: company.id,
                    businessIndustryId: itIndustry.id
                });
            }
        }

        // 5. Create Wallet for Company
        let companyWallet = await entities.Wallet.findOne({ where: { ownerId: company.id, ownerType: 'company' } });
        if (!companyWallet) {
            companyWallet = await entities.Wallet.create({
                ownerId: company.id,
                ownerType: 'company',
                balance: 1000.00,
                isActive: true
            });
            console.log('Company Wallet created');
        }

        // 6. Create Departments & Teams
        let deptHR = await entities.Department.findOne({ where: { name: 'Human Resources', companyId: company.id } });
        if (!deptHR) {
            deptHR = await entities.Department.create({ name: 'Human Resources', companyId: company.id });
        }

        let deptTech = await entities.Department.findOne({ where: { name: 'Technology', companyId: company.id } });
        if (!deptTech) {
            deptTech = await entities.Department.create({ name: 'Technology', companyId: company.id });
        }

        let teamDev = await entities.Team.findOne({ where: { name: 'Development Team', departmentId: deptTech.id } });
        if (!teamDev) {
            teamDev = await entities.Team.create({ name: 'Development Team', departmentId: deptTech.id });
        }

        let designationDev = await entities.Designation.findOne({ where: { name: 'Senior Developer', departmentId: deptTech.id } });
        if (!designationDev) {
            designationDev = await entities.Designation.create({ name: 'Senior Developer', departmentId: deptTech.id });
        }

        // 7. Create Employee
        let employee = await entities.Employee.findOne({ where: { email: 'alice@acme.com' } });
        if (!employee) {
            employee = await entities.Employee.create({
                firstName: 'Alice',
                lastName: 'Smith',
                countryCode: '+973',
                phoneNumber: '98765432',
                email: 'alice@acme.com',
                password: commonPassword,
                onBoardFeeType: 'monthly',
                isOnboardFeePaid: true,
                companyId: company.id,
                departmentId: deptTech.id,
                teamId: teamDev.id,
                designationId: designationDev.id,
                profileStatus: 'approve',
            });
            console.log('Employee created:', employee.id);
        }

        // 8. Create Wallet for Employee
        let employeeWallet = await entities.Wallet.findOne({ where: { ownerId: employee.id, ownerType: 'employee' } });
        if (!employeeWallet) {
            employeeWallet = await entities.Wallet.create({
                ownerId: employee.id,
                ownerType: 'employee',
                balance: 50.00,
                isActive: true
            });
            console.log('Employee Wallet created');
        }

        // 9. Create Merchant
        let merchant = await entities.Merchant.findOne({ where: { email: 'contact@wellnessspa.com' } });
        if (!merchant) {
            merchant = await entities.Merchant.create({
                businessName: 'Wellness Spa',
                email: 'contact@wellnessspa.com',
                phoneNumber: '11223344',
                password: commonPassword,
                location: 'Seef, Bahrain',
                verificationStatus: 'approve',
                isActive: true,
            });
            console.log('Merchant created:', merchant.id);
        }

        // 10. Create Wallet for Merchant
        let merchantWallet = await entities.Wallet.findOne({ where: { ownerId: merchant.id, ownerType: 'merchant' } });
        if (!merchantWallet) {
            merchantWallet = await entities.Wallet.create({
                ownerId: merchant.id,
                ownerType: 'merchant',
                balance: 0.00,
                isActive: true
            });
            console.log('Merchant Wallet created');
        }

        // 11. Create Service & Packages
        let category = await entities.ServiceCategory.findOne({ where: { name: 'Massage Therapy' } });
        if (!category) {
            category = await entities.ServiceCategory.create({ name: 'Massage Therapy', image: 'massage.jpg' });
        }

        let subCategory = await entities.SubCategory.findOne({ where: { name: 'Thai Massage', categoryId: category.id } });
        if (!subCategory) {
            subCategory = await entities.SubCategory.create({ name: 'Thai Massage', categoryId: category.id });
        }

        let service = await entities.Service.findOne({ where: { merchantId: merchant.id, title: 'Full Body Thai Massage' } });
        if (!service) {
            service = await entities.Service.create({
                merchantId: merchant.id,
                categoryId: category.id,
                subCategoryId: subCategory.id,
                title: 'Full Body Thai Massage',
                description: 'Relaxing traditional Thai massage',
                price: 25.0,
                isActive: true,
                status: 'approve',
            });
            console.log('Service created');

            await entities.ServicePackage.create({
                serviceId: service.id,
                name: 'Basic Package',
                description: '1 Hour Session',
                price: 25.00,
                isActive: true
            });
            await entities.ServicePackage.create({
                serviceId: service.id,
                name: 'Premium Package',
                description: '2 Hour Session + Oil',
                price: 45.00,
                isActive: true
            });
        }

        // 12. Create Booking & Transaction
        let booking = await entities.Booking.findOne({ where: { employeeId: employee.id, serviceId: service.id } });
        if (!booking) {
            const pkg = await entities.ServicePackage.findOne({ where: { serviceId: service.id } });
            booking = await entities.Booking.create({
                employeeId: employee.id,
                merchantId: merchant.id,
                serviceId: service.id,
                packageId: pkg?.id,
                bookingDate: new Date(new Date().setDate(new Date().getDate() + 1)),
                totalAmount: 25.00,
                status: 'pending',
                paymentMethod: 'wallet'
            });
            console.log('Booking created');

            await entities.Transaction.create({
                walletId: employeeWallet.id,
                amount: 25.00,
                type: 'debit',
                category: 'booking',
                description: 'Service Booking',
                status: 'success'
            });
        }

        // 13. Create Review
        const existingReview = await entities.Review.findOne({ where: { bookingId: booking.id } });
        if (!existingReview) {
            await entities.Review.create({
                employeeId: employee.id,
                merchantId: merchant.id,
                serviceId: service.id,
                bookingId: booking.id,
                rating: 5,
                comment: 'Amazing experience!'
            });
            console.log('Review created');
        }

        // 14. Create Challenge
        let challenge = await entities.Challenge.findOne({ where: { companyId: company.id, title: 'Step Challenge' } });
        if (!challenge) {
            challenge = await entities.Challenge.create({
                companyId: company.id,
                title: 'Step Challenge',
                description: 'Walk 10k steps daily',
                type: 'Steps',
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
                criteria: { target: 10000 },
            });
        }

        let participant = await entities.ChallengeParticipant.findOne({ where: { challengeId: challenge.id, employeeId: employee.id } });
        if (!participant) {
            await entities.ChallengeParticipant.create({
                challengeId: challenge.id,
                employeeId: employee.id,
                status: 'joined',
            });
        }
        console.log('Challenge and Participant seeded');

        // 15. Reward Points
        const existingPoints = await entities.UserPoints.findOne({ where: { employeeId: employee.id } });
        if (!existingPoints) {
            await entities.UserPoints.create({
                employeeId: employee.id,
                points: 100,
                type: 'welcome_bonus',
                image: 'welcome.png'
            } as any);
            console.log('Reward Points seeded');
        }

        // 16. Benefits (Linked to Company)
        if (companyDetails) {
            const benefitsData = [
                { name: 'Health Insurance', type: 'company', companyDetailsId: companyDetails.id },
                { name: 'Gym Membership', type: 'employee', companyDetailsId: companyDetails.id }
            ];
            for (const ben of benefitsData) {
                const existing = await entities.Benefits.findOne({ where: { name: ben.name, companyDetailsId: companyDetails.id } });
                if (!existing) await entities.Benefits.create(ben as any);
            }
            console.log('Benefits seeded');
        }

        // 17. FAQs & Static Pages
        const faqsData = [
            { title_en: 'How do I reset my password?', description_en: 'Go to settings...', isActive: true },
            { title_en: 'How to contact support?', description_en: 'Email support@fivra.com', isActive: true }
        ];
        for (const faq of faqsData) {
            const existing = await entities.FaqPages.findOne({ where: { title_en: faq.title_en } });
            if (!existing) await entities.FaqPages.create(faq as any);
        }

        const staticPagesData = [
            { title_en: 'Privacy Policy', slug: 'privacy-policy', role: 'employee', description_en: 'Policy content...', isActive: true },
            { title_en: 'About Us', slug: 'about-us', role: 'company', description_en: 'About content...', isActive: true }
        ];
        for (const page of staticPagesData) {
            const existing = await entities.StaticPages.findOne({ where: { slug: page.slug, role: page.role } });
            if (!existing) await entities.StaticPages.create(page as any);
        }
        console.log('FAQs and Static Pages seeded');

        // 18. Subscription Plans
        const subPlansList = [
            { planCategory: 'SME', billingCycle: 'MONTHLY', minEmployees: 1, maxEmployees: 50, baseAmount: 100.00 },
            { planCategory: 'GROWTH_SME', billingCycle: 'MONTHLY', minEmployees: 51, maxEmployees: 100, baseAmount: 200.00, perEmployeeAmount: 5.00 },
            { planCategory: 'CORPORATE', billingCycle: 'YEARLY', minEmployees: 101, maxEmployees: null, isCustom: true, contactAdmin: true }
        ];
        for (const plan of subPlansList) {
            let existing = await entities.SubscriptionPlan.findOne({ where: { planCategory: plan.planCategory, billingCycle: plan.billingCycle } });
            if (!existing) await entities.SubscriptionPlan.create({ ...plan, isActive: true, isDeleted: false } as any);
        }

        // 19. Admin Settings
        let adminSetting = await entities.AdminSetting.findOne();
        if (!adminSetting) {
            await entities.AdminSetting.create({
                platformFee: 5.0,
                transactionFee: 2.5,
                commission: 10.0,
                welcomePoints: 100,
                onboardFeeVisibility: true,
                businessIndustries: ['IT Company', 'Healthcare'],
                companySizes: ['less_than_100', '100_plus', '200_plus', '500_plus'],
                isActive: true
            } as any);
            console.log('Admin Settings seeded');
        }

        // 20. Notification
        await entities.Notification.create({
            userId: employee.id,
            role: 'employee',
            title_en: 'Welcome to Fivra!',
            description_en: 'We are happy to have you on board.',
            isRead: false
        } as any);
        console.log('Notification seeded');

        console.log('Seeding completed successfully.');
    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await sequelize.close();
    }
}

bootstrap();
