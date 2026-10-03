import { CreateCaminhaoUseCase } from './create-caminhao/create-caminhao.use-case';
import { GetCaminhoesUseCase } from './get-caminhoes/get-caminhoes.use-case';
import { GetCaminhaoByIdUseCase } from './get-caminhao-by-id/get-caminhao-by-id.use-case';
import { UpdateCaminhaoUseCase } from './update-caminhao/update-caminhao.use-case';

export * from './create-caminhao/create-caminhao.use-case';
export * from './get-caminhoes/get-caminhoes.use-case';
export * from './get-caminhao-by-id/get-caminhao-by-id.use-case';
export * from './update-caminhao/update-caminhao.use-case';

export const CaminhaoUseCaseHandlers = [
  CreateCaminhaoUseCase,
  GetCaminhoesUseCase,
  GetCaminhaoByIdUseCase,
  UpdateCaminhaoUseCase,
];
