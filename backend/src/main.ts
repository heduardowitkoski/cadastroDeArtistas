import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  await app.listen(3001);
  console.log('🎨 Cadastro de Artistas API rodando na porta 3001');
}
bootstrap();
