import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import { Desafio } from '../desafios/interfaces/desafio.interface';
import { ClientProxySmartRanking } from '../proxyrmq/proxyrmq.service'; 
import { Partida } from './interfaces/partida.interface';


@Injectable()
export class PartidasService {
  
  private readonly logger = new Logger(PartidasService.name);
  
  constructor(
    @InjectModel('Partida') private readonly partidaModel: Model<Partida>, 
    private clientProxySmartRanking: ClientProxySmartRanking
  ) {}

  private clientDesafios = this.clientProxySmartRanking.getClientDesafiosInstance();
  private clientRanking = this.clientProxySmartRanking.getClientProxyRankingsInstance();


  async criarPartida(partida: Partida): Promise<Partida> {
    try {
      const partidaCriada = new this.partidaModel(partida);
      this.logger.log(`partidaCriada: ${JSON.stringify(partidaCriada)}`);
      const result = await partidaCriada.save();
      this.logger.log(`result: ${JSON.stringify(result)}`);
      const idPartida = result._id;
      const desafio: Desafio = await lastValueFrom(
        this.clientDesafios.send(
          'consultar-desafios', 
          { 
            idJogador: '', 
            _id: partida.desafio
          }
        )
      );
    
      await lastValueFrom(
        this.clientDesafios.emit(
        'atualizar-partida', {
          idPartida,
          desafio,
        }
      ));


      return await lastValueFrom(
        this.clientDesafios.emit(
          'processar-partida', 
          { 
            idPartida , 
            partida
          }
        )
      );

    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }


}
