import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class WebService {
 

    async getWebServiceList() {
        
    }

    async saveWebInquiry(body: any) {
        // Log or save web inquiry
        return { success: true, message: 'Web inquiry handled' };
    }
}
