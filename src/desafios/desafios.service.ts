import { Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { format } from 'date-fns-tz';
import ptBR from 'date-fns/locale/pt-BR';
import { DesafioStatus } from './desafio-status.enum';
import { Desafio } from './interfaces/desafio.interface';
import { parseISO } from 'date-fns';
import { ClientProxySmartRanking } from '../proxyrmq/proxyrmq.service';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class DesafiosService {

  private readonly logger = new Logger(DesafiosService.name);
  private clientNotificacoes: ClientProxy;

  constructor(
    @InjectModel('Desafio') private readonly desafioModel: Model<Desafio>,
    private clientProxySmartRanking: ClientProxySmartRanking
   ) {
     this.clientNotificacoes = this.clientProxySmartRanking.getClientProxyNotificacoesInstance();
   }

  async criarDesafio(desafio: Desafio): Promise<Desafio> {
    try {
      const desafioCriado = new this.desafioModel(desafio);
      desafioCriado.dataHoraDesafio = new Date();
      desafioCriado.status = DesafioStatus.PENDENTE;
      this.logger.log(`desafioCriado: ${JSON.stringify(desafioCriado)}`);
      await desafioCriado.save();
      return (await lastValueFrom(this.clientNotificacoes.emit('notificacao-novo-desafio', desafio))); 
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async consultarTodosDesafios(): Promise<Desafio[]> {
    try {
      return (await this.desafioModel.find({}).exec());
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async consultarDesafiosDeUmJogador(_id: any): Promise<Desafio[] | Desafio> {
    try {
      return (await this.desafioModel.find().where('jogadores').in(_id).exec());
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async consultarDesafioPeloId(_id: any): Promise<Desafio> {
    try {
      return (await this.desafioModel.findOne({_id}).exec());
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async consultarDesafiosRealizados(idCategoria: string): Promise<Desafio[]> {
    try {
      return (await this.desafioModel.find()
        .where('categoria')
        .equals(idCategoria)
        .where('status')
        .equals(DesafioStatus.REALIZADO)
        .exec()
      );
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }


   async consultarDesafiosRealizadosPelaData(idCategoria: string, dataRef: string): Promise<Desafio[]> {
     try {
       const dataRefNew = parseISO(`${dataRef}T23:59:59.999`);      
       const date =  format(dataRefNew,'yyyy-MM-dd HH:mm:ss.SSS', {
        timeZone: 'America/Sao_Paulo',
        locale: ptBR,
      });     
       return (await this.desafioModel
          .find()
          .where('categoria')
          .equals(idCategoria)
          .where('status')
          .equals(DesafioStatus.REALIZADO)
          .where('dataHoraDesafio')
          .lte(new Date(date).getTime()) 
          .exec()
        );
     } catch (error) {
       this.logger.error(`error: ${JSON.stringify(error.message)}`);
       throw new RpcException(error.message);
     }
   }

   async atualizarDesafio(_id: string, desafio: Desafio): Promise<void> {
     try {
       desafio.dataHoraDesafio = new Date();
       await this.desafioModel.findByIdAndUpdate({ _id }, { $set: desafio }).exec();
     } catch (error) {
       this.logger.error(`error: ${JSON.stringify(error.message)}`);
       throw new RpcException(error.message);
     }
   }

   async atualizarDesafioPartida(idPartida: string, desafio: Desafio): Promise<void> {
     try {
       desafio.status = DesafioStatus.REALIZADO;
       desafio.partida = idPartida;       
      await this.desafioModel.findOneAndUpdate({_id: desafio._id}, { $set: desafio}).exec();      
     } catch (error) {
       console.log(error, 'erro')
       this.logger.error(`error_aqui: ${JSON.stringify(error.message)}`);
   
       throw new RpcException(error.message);
     }
   }

   async deletarDesafio(desafio: Desafio): Promise<void> {
     try {
       const { _id } = desafio;
       desafio.status = DesafioStatus.CANCELADO;
       this.logger.log(`desafio: ${JSON.stringify(desafio)}`);
       await this.desafioModel.findOneAndUpdate({ _id }, { $set: desafio }).exec();
     } catch (error) {
       this.logger.error(`error: ${JSON.stringify(error.message)}`);
       throw new RpcException(error.message);
     }
   }
}
