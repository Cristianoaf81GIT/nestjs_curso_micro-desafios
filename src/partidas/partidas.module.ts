import { Module } from '@nestjs/common';
import { PartidasService } from './partidas.service';
import { PartidasController } from './partidas.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PartidaSchema } from './interfaces/partida.schema';
import { ProxyrmqModule } from '../proxyrmq/proxyrmq.module'; 



@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      { name: 'Partida', useFactory: () => PartidaSchema}
    ]),
    ProxyrmqModule
  ],
  providers: [PartidasService],
  controllers: [PartidasController],
})
export class PartidasModule {}
