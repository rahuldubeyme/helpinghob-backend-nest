/**
 * HelpingHob - Database Seed Script
 * Run: node scripts/seed.js
 *
 * Seeds sample data into all major MongoDB collections.
 * Update MONGO_URI below if needed, or set MONGODB_URI in .env
 */

const mongoose = require('mongoose');
const path = require('path');

// Load .env from parent directory
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/helpinghob';

// ─── Schema Definitions ───────────────────────────────────────────────────────

const Banner = mongoose.model('Banner', new mongoose.Schema({
    title: String, banner: String, internal_url: String, external_url: String,
    isSuspended: { type: Boolean, default: false }, isDeleted: { type: Boolean, default: false },
}, { collection: 'banners', timestamps: true }));

const Faq = mongoose.model('Faq', new mongoose.Schema({
    question: String, answer: String,
    isSuspended: { type: Boolean, default: false }, isDeleted: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created', updatedAt: 'updated' } }));

const MasterService = mongoose.model('MasterService', new mongoose.Schema({
    serviceId: { type: Number, unique: true }, icon: String, title: String, description: String,
    isActive: { type: Boolean, default: true }, isSuspended: { type: Boolean, default: false }, isDeleted: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created', updatedAt: 'updated' } }));

const ServiceCategory = mongoose.model('ServiceCategory', new mongoose.Schema({
    masterServiceId: Number, icon: String, title: String, type: String,
    isFeatured: { type: Boolean, default: false }, emergencyServices: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false }, isDeleted: { type: Boolean, default: false },
}, { collection: 'servicecategories', timestamps: true }));

const AdminSetting = mongoose.model('AdminSetting', new mongoose.Schema({
    androidAppVersion: String, androidForceUpdate: Boolean, androidAppLink: String,
    maintenanceMode: { type: Boolean, default: false }, platformFee: Number,
    bookingFee: Number, transactionFee: Number, commission: Number,
    isSuspended: Boolean, isDeleted: Boolean, googleMapsApiKey: String,
    pickNDropIncentive: { ridesThreshold: Number, amount: Number },
}, { collection: 'admin_settings', timestamps: true }));

const VehicleType = mongoose.model('VehicleType', new mongoose.Schema({
    icon: String, type: String, title: String, capacity: Number,
    baseFare: Number, perKmRate: Number, minimumFare: Number, cancellationFee: Number,
    isSuspended: { type: Boolean, default: false }, isDeleted: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created', updatedAt: 'updated' } }));

const Zone = mongoose.model('Zone', new mongoose.Schema({
    name: String, description: String, type: { type: String, enum: ['CIRCLE', 'POLYGON'], default: 'CIRCLE' },
    center: { latitude: Number, longitude: Number }, radius: Number,
    isSuspended: { type: Boolean, default: false }, isDeleted: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created', updatedAt: 'updated' } }));

const StaticPage = mongoose.model('StaticPage', new mongoose.Schema({
    slug: String, title: String, content: String,
    isSuspended: { type: Boolean, default: false }, isDeleted: { type: Boolean, default: false },
}, { collection: 'staticpages', timestamps: true }));

const Coupon = mongoose.model('Coupon', new mongoose.Schema({
    code: String, discount: Number, discountType: { type: String, enum: ['percent', 'flat'], default: 'percent' },
    minOrderValue: Number, maxDiscount: Number, usageLimit: Number,
    expiresAt: Date, isActive: { type: Boolean, default: true }, isDeleted: { type: Boolean, default: false },
}, { timestamps: true }));

// ─── Seed Data ────────────────────────────────────────────────────────────────

const seedData = async () => {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB:', MONGO_URI);

    // ── Banners ────────────────────────────────────────────────────────────────
    await Banner.deleteMany({});
    await Banner.insertMany([
        { title: 'Summer Sale', banner: 'https://placehold.co/800x300?text=Summer+Sale', internal_url: '/deals', external_url: '' },
        { title: 'New Providers Welcome', banner: 'https://placehold.co/800x300?text=Join+Us', internal_url: '/auth/register', external_url: '' },
        { title: 'Pick-N-Drop Offer', banner: 'https://placehold.co/800x300?text=Ride+Discount', internal_url: '/pick-n-drop', external_url: '' },
    ]);
    console.log('🖼️  Banners seeded (3)');

    // ── FAQs ───────────────────────────────────────────────────────────────────
    await Faq.deleteMany({});
    await Faq.insertMany([
        { question: 'How do I book a service?', answer: 'Go to the home screen, select a category, and choose a provider.' },
        { question: 'How do I cancel a booking?', answer: 'Navigate to My Bookings and tap Cancel. Free cancellation within 5 minutes.' },
        { question: 'How do I track my ride?', answer: 'After booking a Pick-N-Drop ride, you will see a live map with driver location.' },
        { question: 'How do I become a provider?', answer: 'Register with role "Provider" and complete your profile with service details.' },
        { question: 'What payment methods are accepted?', answer: 'We accept Cash, UPI, and Wallet payments.' },
    ]);
    console.log('❓ FAQs seeded (5)');

    // ── Master Services ────────────────────────────────────────────────────────
    await MasterService.deleteMany({});
    const services = await MasterService.insertMany([
        { serviceId: 1001, title: 'Pick-N-Drop', description: 'Book a ride for you or your package.', icon: '🚗', isActive: true },
        { serviceId: 1002, title: 'Home Services', description: 'Plumbing, electrical, and cleaning at home.', icon: '🏠', isActive: true },
        { serviceId: 1003, title: 'Dairy Drop', description: 'Fresh dairy delivered daily.', icon: '🥛', isActive: true },
        { serviceId: 1004, title: 'Local Deals', description: 'Exclusive offers from local businesses.', icon: '🏷️', isActive: true },
        { serviceId: 1005, title: 'Education', description: 'Home tuitions and coaching centers.', icon: '📚', isActive: true },
    ]);
    console.log('⚙️  Master Services seeded (5)');

    // ── Service Categories (linked to master service 1002 - Home Services) ─────
    await ServiceCategory.deleteMany({});
    await ServiceCategory.insertMany([
        { masterServiceId: 1002, title: 'Electrician', type: 'home', icon: '⚡', isFeatured: true },
        { masterServiceId: 1002, title: 'Plumber', type: 'home', icon: '🚿', isFeatured: true },
        { masterServiceId: 1002, title: 'Cleaning', type: 'home', icon: '🧹', isFeatured: false },
        { masterServiceId: 1002, title: 'Carpenter', type: 'home', icon: '🪚', isFeatured: false },
        { masterServiceId: 1002, title: 'AC Repair', type: 'home', icon: '❄️', emergencyServices: true },
    ]);
    console.log('📂 Service Categories seeded (5)');

    // ── Vehicle Types (for Pick-N-Drop) ───────────────────────────────────────
    await VehicleType.deleteMany({});
    await VehicleType.insertMany([
        { type: 'bike', title: 'Bike', icon: '🏍️', capacity: 1, baseFare: 20, perKmRate: 8, minimumFare: 30, cancellationFee: 10 },
        { type: 'auto', title: 'Auto Rickshaw', icon: '🛺', capacity: 3, baseFare: 30, perKmRate: 12, minimumFare: 40, cancellationFee: 15 },
        { type: 'car', title: 'Mini Car', icon: '🚕', capacity: 4, baseFare: 50, perKmRate: 15, minimumFare: 60, cancellationFee: 25 },
        { type: 'suv', title: 'SUV', icon: '🚙', capacity: 6, baseFare: 80, perKmRate: 20, minimumFare: 100, cancellationFee: 40 },
    ]);
    console.log('🚗 Vehicle Types seeded (4)');

    // ── Zones ─────────────────────────────────────────────────────────────────
    await Zone.deleteMany({});
    await Zone.insertMany([
        { name: 'City Center', description: 'Main downtown zone', type: 'CIRCLE', center: { latitude: 25.276987, longitude: 55.296249 }, radius: 5000 },
        { name: 'Airport Zone', description: 'Airport pickup/drop area', type: 'CIRCLE', center: { latitude: 25.253174, longitude: 55.365673 }, radius: 3000 },
        { name: 'Suburb North', description: 'Northern residential area', type: 'CIRCLE', center: { latitude: 25.320000, longitude: 55.300000 }, radius: 8000 },
    ]);
    console.log('🗺️  Zones seeded (3)');

    // ── Admin Settings (single config document) ────────────────────────────────
    await AdminSetting.deleteMany({});
    await AdminSetting.create({
        androidAppVersion: '1.0.0', androidForceUpdate: false,
        androidAppLink: 'https://play.google.com/store/apps/helpinghob',
        maintenanceMode: false, platformFee: 5, bookingFee: 10, transactionFee: 2, commission: 15,
        googleMapsApiKey: 'YOUR_GOOGLE_MAPS_KEY_HERE',
        pickNDropIncentive: { ridesThreshold: 4, amount: 5 },
    });
    console.log('⚙️  Admin Settings seeded (1)');

    // ── Static Pages ──────────────────────────────────────────────────────────
    await StaticPage.deleteMany({});
    await StaticPage.insertMany([
        { slug: 'privacy-policy', title: 'Privacy Policy', content: '<h1>Privacy Policy</h1><p>We value your privacy...</p>' },
        { slug: 'terms-of-service', title: 'Terms of Service', content: '<h1>Terms of Service</h1><p>By using HelpingHob...</p>' },
        { slug: 'about-us', title: 'About Us', content: '<h1>About HelpingHob</h1><p>HelpingHob is a multi-service platform...</p>' },
    ]);
    console.log('📄 Static Pages seeded (3)');

    // ── Coupons ───────────────────────────────────────────────────────────────
    await Coupon.deleteMany({});
    await Coupon.insertMany([
        { code: 'WELCOME20', discount: 20, discountType: 'percent', minOrderValue: 100, maxDiscount: 50, usageLimit: 1000, expiresAt: new Date('2026-12-31') },
        { code: 'FLAT50', discount: 50, discountType: 'flat', minOrderValue: 200, maxDiscount: 50, usageLimit: 500, expiresAt: new Date('2026-08-31') },
        { code: 'RIDE10', discount: 10, discountType: 'percent', minOrderValue: 80, maxDiscount: 20, usageLimit: 2000, expiresAt: new Date('2026-12-31') },
    ]);
    console.log('🎟️  Coupons seeded (3)');

    console.log('\n🎉 All seed data inserted successfully!\n');
    await mongoose.disconnect();
    process.exit(0);
};

seedData().catch(err => {
    console.error('❌ Seed failed:', err.message);
    mongoose.disconnect();
    process.exit(1);
});
