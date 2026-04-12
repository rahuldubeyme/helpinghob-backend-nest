import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StaticPages, StaticPagesDocument } from '@mongodb/schemas/static-pages.schema';
import { CreateStaticPagesDto, UpdateStaticPagesDto } from './dto/static-pages.dto';

@Injectable()
export class StaticService {
    constructor(
        @InjectModel(StaticPages.name)
        private staticModel: Model<StaticPagesDocument>,
    ) { }

    async create(createStaticPagesDto: CreateStaticPagesDto) {
        return this.staticModel.create({
            ...createStaticPagesDto
        });
    }

    async findAll() {
        return this.staticModel.find({ isDeleted: false }).sort({ createdAt: -1 });
    }

    async findOne(id: string) {
        const page = await this.staticModel.findOne({ isDeleted: false, _id: id });
        if (!page) {
            throw new NotFoundException(`Static Page with ID ${id} not found`);
        }
        return page;
    }

    async findByType(type: string, role: string) {
        const whereQuery: any = {
            isDeleted: false,
            role
        };

        if (type !== 'all') {
            whereQuery.slug = type;
        }

        const [rows, count] = await Promise.all([
            this.staticModel.find(whereQuery).sort({ createdAt: -1 }),
            this.staticModel.countDocuments(whereQuery)
        ]);

        if (count === 0) {
            throw new NotFoundException(`Static Page with Type ${type} not found`);
        }

        return { rows, count };
    }

    async update(id: string, updateDTO: UpdateStaticPagesDto) {
        const updatedPage = await this.staticModel.findByIdAndUpdate(
            id,
            { $set: updateDTO },
            { new: true }
        );
        if (!updatedPage) {
            throw new NotFoundException(`Static Page with ID ${id} not found`);
        }
        return updatedPage;
    }
}
