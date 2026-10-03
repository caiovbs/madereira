import { Module, Provider } from '@nestjs/common';
import { TarefaPatioController } from './controllers';
import { TarefaPatioService } from './services';
import { TarefaPatioRepository } from './repositories';
import { PatioUseCaseHandlers } from './use-cases';

const exposedProviders: Provider[] = [TarefaPatioRepository];
const unexposedProviders: Provider[] = [TarefaPatioService];

@Module({
  controllers: [TarefaPatioController],
  providers: [...exposedProviders, ...unexposedProviders, ...PatioUseCaseHandlers],
  exports: [...exposedProviders],
})
export class PatioModule {}
