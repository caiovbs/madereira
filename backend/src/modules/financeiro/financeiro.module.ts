import { Module, Provider } from '@nestjs/common';
import { FinanceiroController } from './controllers';
import { FinanceiroService } from './services';
import { LancamentoFinanceiroRepository } from './repositories';
import { FinanceiroUseCaseHandlers } from './use-cases';

const exposedProviders: Provider[] = [LancamentoFinanceiroRepository];
const unexposedProviders: Provider[] = [FinanceiroService];

@Module({
  controllers: [FinanceiroController],
  providers: [...exposedProviders, ...unexposedProviders, ...FinanceiroUseCaseHandlers],
  exports: [...exposedProviders],
})
export class FinanceiroModule {}
