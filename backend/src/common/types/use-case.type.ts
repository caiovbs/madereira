export interface IUseCase<T = any, TRes = any> {
  execute(params: T): Promise<TRes>;
}
