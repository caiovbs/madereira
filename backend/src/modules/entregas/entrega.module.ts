import { Module, Provider } from '@nestjs/common';
import { EntregaController } from './controllers';
import { EntregaService } from './services';
import { EntregaRepository } from './repositories';
import { EntregaUseCaseHandlers } from './use-cases';
import { RotaController } from './rota/rota.controller';
import { RotaService } from './rota/rota.service';
import { GeocodingService } from './rota/geocoding.service';
import { RoutingService } from './rota/routing.service';

const exposedProviders: Provider[] = [EntregaRepository];
const unexposedProviders: Provider[] = [EntregaService, RotaService, GeocodingService, RoutingService];

@Module({
  controllers: [RotaController, EntregaController],
  providers: [...exposedProviders, ...unexposedProviders, ...EntregaUseCaseHandlers],
  exports: [...exposedProviders],
})
export class EntregaModule {}
