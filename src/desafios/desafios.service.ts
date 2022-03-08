import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DesafioStatus } from './desafio-status.enum';
import { Desafio } from './interfaces/desafio.interface';
import * as momentTimezone from 'moment-timezone';

@Injectable()
export class DesafiosService {

  private readonly logger = new Logger(DesafiosService.name);

  constructor(@InjectModel('Desafio') private readonly desafioModel: Model<Desafio>) {}

  async criarDesafio(desafio: Desafio): Promise<Desafio> {
    try {
      const desafioCriado = new this.desafioModel(desafio);
      desafioCriado.dataHoraDesafio = new Date();
      desafioCriado.status = DesafioStatus.PENDENTE;
      this.logger.log(`desafioCriado: ${JSON.stringify(desafioCriado)}`);
      return (await desafioCriado.save());
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
       const dataRefNew = `${dataRef} 23:59:59:999`;
       const date =  momentTimezone(dataRefNew).tz('UTC')
       .format('YYYY-MM-DD HH:mm:ss.SSS+00:00')
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
       await this.desafioModel.findOneAndUpdate({_id: desafio._id}, {$set: desafio}).exec();
     } catch (error) {
       this.logger.error(`error: ${JSON.stringify(error.message)}`);
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
