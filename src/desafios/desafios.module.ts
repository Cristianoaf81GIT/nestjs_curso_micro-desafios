import { Module } from '@nestjs/common';
import { DesafiosService } from './desafios.service';
import { DesafiosController } from './desafios.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DesafioSchema } from './interfaces/desafio.schema';
import { ProxyrmqModule } from '../proxyrmq/proxyrmq.module'; 

// https://gitlab.com/dfs-treinamentos/smart-ranking/smart-ranking-microservices/micro-desafios/-/tree/aula-micro-notificacoes/src

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {name: 'Desafio', useFactory: () => DesafioSchema}
    ]),  
    ProxyrmqModule
  ],
  providers: [DesafiosService],
  controllers: [DesafiosController], 
})
export class DesafiosModule {}
