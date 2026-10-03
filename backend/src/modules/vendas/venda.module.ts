import { Global, Module, Provider } from '@nestjs/common'
import { VendaController } from './controllers'
import { VendaService } from './services'
import { VendaRepository } from './repositories'
import { VendaUseCaseHandlers } from './use-cases'

const exposedProviders: Provider[] = [VendaRepository]
const unexposedProviders: Provider[] = [VendaService]

@Global()
@Module({
  controllers: [VendaController],
  providers: [...exposedProviders, ...unexposedProviders, ...VendaUseCaseHandlers],
  exports: [...exposedProviders]
})
export class VendaModule {}
