import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseDatabaseConfig } from './config/database/mongoose.config';
import { DesafiosModule } from './desafios/desafios.module';
import { PartidasModule } from './partidas/partidas.module';
import { ProxyrmqModule } from './proxyrmq/proxyrmq.module';

// file:///C:/Users/cristiano.alexandre/Downloads/Roteiro+-+Migrar+entidades+Desafios+e+Partidas+[API+Gateway+e+Desafios]%20(2).pdf
// repositório: https://gitlab.com/dfs-treinamentos/smart-ranking/smart-ranking-microservices/micro-desafios/-/tree/aula-micro-rankings/src/proxyrmq

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({ useClass: MongooseDatabaseConfig }),
    ProxyrmqModule,
    DesafiosModule,
    PartidasModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
