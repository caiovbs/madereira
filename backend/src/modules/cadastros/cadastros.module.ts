import { Global, Module, Provider } from '@nestjs/common';

import { TipoMadeiraController } from './tipos-madeira/controllers';
import { TipoMadeiraService } from './tipos-madeira/services';
import { TipoMadeiraRepository } from './tipos-madeira/repositories';
import { TipoMadeiraUseCaseHandlers } from './tipos-madeira/use-cases';

import { ClienteController } from './clientes/controllers';
import { ClienteService } from './clientes/services';
import { ClienteRepository } from './clientes/repositories';
import { ClienteUseCaseHandlers } from './clientes/use-cases';

import { FornecedorController } from './fornecedores/controllers';
import { FornecedorService } from './fornecedores/services';
import { FornecedorRepository } from './fornecedores/repositories';
import { FornecedorUseCaseHandlers } from './fornecedores/use-cases';

import { FuncionarioController } from './funcionarios/controllers';
import { FuncionarioService } from './funcionarios/services';
import { FuncionarioRepository } from './funcionarios/repositories';
import { FuncionarioUseCaseHandlers } from './funcionarios/use-cases';

import { CaminhaoController } from './caminhoes/controllers';
import { CaminhaoService } from './caminhoes/services';
import { CaminhaoRepository } from './caminhoes/repositories';
import { CaminhaoUseCaseHandlers } from './caminhoes/use-cases';

const exposedProviders: Provider[] = [
  TipoMadeiraRepository,
  ClienteRepository,
  FornecedorRepository,
  FuncionarioRepository,
  CaminhaoRepository,
];

const unexposedProviders: Provider[] = [
  TipoMadeiraService,
  ClienteService,
  FornecedorService,
  FuncionarioService,
  CaminhaoService,
];

@Global()
@Module({
  controllers: [
    TipoMadeiraController,
    ClienteController,
    FornecedorController,
    FuncionarioController,
    CaminhaoController,
  ],
  providers: [
    ...exposedProviders,
    ...unexposedProviders,
    ...TipoMadeiraUseCaseHandlers,
    ...ClienteUseCaseHandlers,
    ...FornecedorUseCaseHandlers,
    ...FuncionarioUseCaseHandlers,
    ...CaminhaoUseCaseHandlers,
  ],
  exports: [...exposedProviders],
})
export class CadastrosModule {}
