import { Global, Module, Provider } from '@nestjs/common';
import { CompraController } from './controllers';
import { CompraService } from './services';
import { CompraRepository } from './repositories';
import { CompraUseCaseHandlers } from './use-cases';

const exposedProviders: Provider[] = [CompraRepository];
const unexposedProviders: Provider[] = [CompraService];

@Global()
@Module({
  controllers: [CompraController],
  providers: [...exposedProviders, ...unexposedProviders, ...CompraUseCaseHandlers],
  exports: [...exposedProviders],
})
export class CompraModule {}
