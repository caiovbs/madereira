import { GetTarefasUseCase } from './get-tarefas/get-tarefas.use-case';
import { GetTarefaByIdUseCase } from './get-tarefa-by-id/get-tarefa-by-id.use-case';
import { ConcluirTarefaUseCase } from './concluir-tarefa/concluir-tarefa.use-case';

export * from './get-tarefas/get-tarefas.use-case';
export * from './get-tarefa-by-id/get-tarefa-by-id.use-case';
export * from './concluir-tarefa/concluir-tarefa.use-case';

export const PatioUseCaseHandlers = [
  GetTarefasUseCase,
  GetTarefaByIdUseCase,
  ConcluirTarefaUseCase,
];
