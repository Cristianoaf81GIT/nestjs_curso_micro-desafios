import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Partida } from './interfaces/partida.interface';
import { PartidasService } from './partidas.service';

// continua aqui
// file:///C:/Users/cristiano.alexandre/Desktop/studies/js/curso_microservicos_nestjs_rabbitmq/material/Roteiro+-+Migrar+entidades+Desafios+e+Partidas+[API+Gateway+e+Desafios].pdf
// https://gitlab.com/dfs-treinamentos/smart-ranking/smart-ranking-microservices/micro-desafios/-/blob/aula-micro-rankings/src/partidas/partidas.module.ts

const ackErrors: string[] = ['E11000'];

@Controller('partidas')
export class PartidasController {
  private readonly logger = new Logger(PartidasController.name);
  constructor(private readonly partidaService: PartidasService) {}

  @EventPattern('criar-partida')
  async criarPartida(
    @Payload() partida: Partida, 
    @Ctx() context: RmqContext
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    
    try {
      this.logger.log(`partida: ${JSON.stringify(partida)}`);  
      await this.partidaService.criarPartida(partida);
      await channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      const filterAckError = ackErrors.filter(
        (ackError) => error.message.includes(ackError)
      );

      if (filterAckError.length > 0) {
        await channel.ack(originalMsg);
      }

    }
  }
}
