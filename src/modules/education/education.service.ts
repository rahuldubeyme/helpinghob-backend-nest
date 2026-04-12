import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Institution, InstitutionDocument } from '@mongodb/schemas/institution.schema';
import { EducationInquiry, EducationInquiryDocument } from '@mongodb/schemas/education-inquiry.schema';
import { InstitutionQueryDto, CreateEducationInquiryDto } from './dto/education.dto';

@Injectable()
export class EducationService {
    constructor(
        @InjectModel(Institution.name) private institutionModel: Model<InstitutionDocument>,
        @InjectModel(EducationInquiry.name) private inquiryModel: Model<EducationInquiryDocument>,
    ) { }

    async findInstitutions(query: InstitutionQueryDto) {
        const { search, category, address, maxFee, page = 1, limit = 10 } = query;
        const skip = (+page - 1) * +limit;

        const filter: any = { isDeleted: false, isSuspended: false };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        if (category) {
            filter.category = { $in: [category] };
        }

        if (address) {
            filter.address = { $regex: address, $options: 'i' };
        }

        if (maxFee) {
            filter.fee = { $lte: maxFee };
        }

        const total = await this.institutionModel.countDocuments(filter);
        const items = await this.institutionModel.find(filter)
            .sort({ isFeatured: -1, created: -1 })
            .skip(skip)
            .limit(+limit)
            .exec();

        return { items, total, page: +page, limit: +limit };
    }

    async findOne(id: string) {
        const item = await this.institutionModel.findById(id).exec();
        if (!item || item.isDeleted) {
            throw new NotFoundException('Institution not found');
        }
        return item;
    }

    async submitInquiry(userId: string, dto: CreateEducationInquiryDto) {
        const inquiry = new this.inquiryModel({
            ...dto,
            userId: new Types.ObjectId(userId),
            institutionId: new Types.ObjectId(dto.institutionId),
        });
        return await inquiry.save();
    }

    async findMyInquiries(userId: string, query: any) {
        const { page = 1, limit = 10 } = query;
        const skip = (+page - 1) * +limit;
        const filter = { userId: new Types.ObjectId(userId) };

        const total = await this.inquiryModel.countDocuments(filter);
        const items = await this.inquiryModel.find(filter)
            .populate('institutionId', 'name image')
            .sort({ created: -1 })
            .skip(skip)
            .limit(+limit)
            .exec();

        return { items, total, page: +page, limit: +limit };
    }

    async seedData() {
        // Sample data for various categories
        const institutions = [
            {
                name: 'Bright Horizons Academy',
                category: ['school', 'academy'],
                image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d',
                address: '123 Education Lane, Mumbai',
                description: 'Premier K-12 school focusing on holistic development.',
                fee: '5000',
                feeType: 'monthly',
                timing: '8AM-2PM',
                affiliated: 'CBSE',
                facilities: ['library', 'labs', 'sports', 'canteen'],
                faculties: [
                    { name: 'Dr. Sarah Wilson', image: 'https://i.pravatar.cc/150?u=sarah', bio: 'PHD in Education, 15 years exp.' },
                    { name: 'John Doe', image: 'https://i.pravatar.cc/150?u=john', bio: 'M.Sc Physics, 10 years exp.' }
                ],
                toppers: [
                    { name: 'Alice Smith', image: 'https://i.pravatar.cc/150?u=alice', rank: '1st', year: '2023' }
                ],
                courses: [
                    { name: 'Class X', fee: '4500', duration: '1 Year', facilities: ['Smart Class'] }
                ],
                achievements: ['Best School Award 2022', '100% Result in Board Exams'],
                contactNo: '9876543210',
                email: 'info@brighthorizons.com',
                location: [19.0760, 72.8777],
                isFeatured: true,
                masterServiceId: 1001
            },
            {
                name: 'Tempo Music Classes',
                category: ['music class'],
                image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
                address: 'Bandra West, Mumbai',
                description: 'Learn guitar, piano, and violin from experts.',
                fee: '2000',
                feeType: 'monthly',
                timing: '4PM-8PM',
                affiliated: 'Trinity College London',
                facilities: ['wifi', 'ac rooms', 'instruments'],
                faculties: [
                    { name: 'Ravi Shankar', image: 'https://i.pravatar.cc/150?u=ravi', bio: 'Renowned Sitarist.' }
                ],
                courses: [
                    { name: 'Guitar Basics', fee: '1500', duration: '3 Months', facilities: ['Free Practice Sessions'] }
                ],
                achievements: ['Featured in Times Music'],
                contactNo: '9123456780',
                email: 'contact@tempomusic.com',
                location: [19.0596, 72.8295],
                masterServiceId: 1001
            }
        ];

        await this.institutionModel.insertMany(institutions);
        return { message: 'Education data seeded successfully', count: institutions.length };
    }
}
