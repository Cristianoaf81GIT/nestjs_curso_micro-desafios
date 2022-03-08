import { Module } from '@nestjs/common';
import { DesafiosService } from './desafios.service';
import { DesafiosController } from './desafios.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DesafioSchema } from './interfaces/desafio.schema';


@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {name: 'Desafio', useFactory: () => DesafioSchema}
    ])
  ],
  providers: [DesafiosService],
  controllers: [DesafiosController],
})
export class DesafiosModule {}
