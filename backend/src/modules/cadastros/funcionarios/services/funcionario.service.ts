import { Injectable } from '@nestjs/common';
import {
  CreateFuncionarioUseCase,
  GetFuncionariosUseCase,
  GetFuncionarioByIdUseCase,
  UpdateFuncionarioUseCase,
} from '../use-cases';
import { GetFuncionariosFilter } from '../repositories';
import { CreateFuncionarioDto, UpdateFuncionarioDto } from '../dto';
import { Funcionario } from '../models';

@Injectable()
export class FuncionarioService {
  constructor(
    private readonly createUseCase: CreateFuncionarioUseCase,
    private readonly getManyUseCase: GetFuncionariosUseCase,
    private readonly getByIdUseCase: GetFuncionarioByIdUseCase,
    private readonly updateUseCase: UpdateFuncionarioUseCase,
  ) {}

  create(input: CreateFuncionarioDto): Promise<Funcionario> {
    return this.createUseCase.execute(input);
  }

  getMany(filter: GetFuncionariosFilter): Promise<Funcionario[]> {
    return this.getManyUseCase.execute(filter);
  }

  getById(id: string): Promise<Funcionario> {
    return this.getByIdUseCase.execute(id);
  }

  update(id: string, data: UpdateFuncionarioDto): Promise<Funcionario> {
    return this.updateUseCase.execute({ id, data });
  }
}
