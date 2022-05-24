import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { format } from 'date-fns-tz';
import ptBR from 'date-fns/locale/pt-BR';


async function bootstrap() {
  const config = new ConfigService();
  const logger = new Logger('Main');
  const app = await NestFactory.create(AppModule);
  
  app.connectMicroservice({
    transport: Number(config.get<string>('TRANSPORT_LOCAL')),
      options: {
      urls: [`${config.get<string>('SERVER_URL_LOCAL')}`],
      noAck: config.get<string>('NOACK') === 'true',
      queue: config.get<string>('CHALLENGES_QUEUE_NAME'),        
    }
  });

  Date.prototype.toJSON = (): string => {
    try {
      return format(this, 'yyyy-MM-dd HH:mm:ss.SS', {
        timeZone: 'America/Sao_Paulo',
        locale: ptBR,
      });
    } catch (error: unknown) {
      return this;
    }
  };
  
  
  logger.log('Microservice is listening')
  await app.startAllMicroservices();
  await app.listen(Number(config.get<string>('APP_PORT')));
}
bootstrap();
