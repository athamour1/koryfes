import { Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { UploadsController } from './uploads.controller';
import { LegacyUploadsMigrator } from './legacy-uploads';

@Global()
@Module({
    controllers: [UploadsController],
    providers: [StorageService, LegacyUploadsMigrator],
    exports: [StorageService],
})
export class StorageModule { }
