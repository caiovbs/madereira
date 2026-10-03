import { Module, Provider } from '@nestjs/common';
import { EntregaController } from './controllers';
import { EntregaService } from './services';
import { EntregaRepository } from './repositories';
import { EntregaUseCaseHandlers } from './use-cases';

const exposedProviders: Provider[] = [EntregaRepository];
const unexposedProviders: Provider[] = [EntregaService];

@Module({
  controllers: [EntregaController],
  providers: [...exposedProviders, ...unexposedProviders, ...EntregaUseCaseHandlers],
  exports: [...exposedProviders],
})
export class EntregaModule {}
