import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { ValidationPipe } from './common/pipes'
import { TransformInterceptor } from './common/interceptors'
import { AllExceptionsFilter } from './common/filters'
import { ProdutoModule } from './modules/produtos'
import { CadastrosModule } from './modules/cadastros'
import { CompraModule } from './modules/compras'
import { VendaModule } from './modules/vendas'
import { PatioModule } from './modules/patio'
import { EntregaModule } from './modules/entregas'
import { FinanceiroModule } from './modules/financeiro'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ProdutoModule,
    CadastrosModule,
    CompraModule,
    VendaModule,
    PatioModule,
    EntregaModule,
    FinanceiroModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_PIPE, useClass: ValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter }
  ]
})
export class AppModule {}
