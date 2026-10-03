import { Global, Module, Provider } from '@nestjs/common';
import { ProdutoController } from './controllers';
import { ProdutoService } from './services';
import { ProdutoRepository } from './repositories';
import { UseCaseHandlers } from './use-cases';

const exposedProviders: Provider[] = [ProdutoRepository];
const unexposedProviders: Provider[] = [ProdutoService];

@Global()
@Module({
  controllers: [ProdutoController],
  providers: [...exposedProviders, ...unexposedProviders, ...UseCaseHandlers],
  exports: [...exposedProviders],
})
export class ProdutoModule {}
