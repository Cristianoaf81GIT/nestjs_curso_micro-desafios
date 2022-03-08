import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

@Injectable()
export class MongooseDatabaseConfig implements MongooseOptionsFactory {
  constructor(private configService: ConfigService) {}
  createMongooseOptions():
    | MongooseModuleOptions
    | Promise<MongooseModuleOptions> {
    return {
      uri: this.configService.get<string>('MONGO_URI'),
      useNewUrlParser:
        this.configService.get<string>('useNewUrlParser') === 'true',
      autoIndex: this.configService.get<string>('autoIndex') === 'true',
      autoCreate: this.configService.get<string>('autoCreate') === 'true',
      useUnifiedTopology:
        this.configService.get<string>('useUnifiedTopology') === 'true',
    };
  }
}
