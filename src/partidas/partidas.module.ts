import { Module } from '@nestjs/common';
import { PartidasService } from './partidas.service';
import { PartidasController } from './partidas.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PartidaSchema } from './interfaces/partida.schema';
import { ProxyrmqModule } from '../proxyrmq/proxyrmq.module'; 
import { DesafioSchema } from '../desafios/interfaces/desafio.schema'; 



@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      { name: 'Partida', useFactory: () => PartidaSchema},
      {name: 'Desafio', useFactory: () => DesafioSchema}
    ]),
    ProxyrmqModule,    
  ],
  providers: [PartidasService],
  controllers: [PartidasController],
})
export class PartidasModule {}
