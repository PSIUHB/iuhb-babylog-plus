import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feed } from './entities/feed.entity';
import { Sleep } from './entities/sleep.entity';
import { Diaper } from './entities/diaper.entity';
import { Temperature } from './entities/temperature.entity';
import { Weight } from './entities/weight.entity';
import { Bath } from './entities/bath.entity';
import { FeedsService } from './services/feeds.service';
import { SleepsService } from './services/sleeps.service';
import { DiapersService } from './services/diapers.service';
import { TemperaturesService } from './services/temperatures.service';
import { WeightsService } from './services/weights.service';
import { BathsService } from './services/baths.service';
import { FeedsController } from './controllers/feeds.controller';
import { SleepsController } from './controllers/sleeps.controller';
import { DiapersController } from './controllers/diapers.controller';
import { TemperaturesController } from './controllers/temperatures.controller';
import { WeightsController } from './controllers/weights.controller';
import { BathsController } from './controllers/baths.controller';
import { ChildrenModule } from '../children/children.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Feed,
      Sleep,
      Diaper,
      Temperature,
      Weight,
      Bath
    ]),
    ChildrenModule,
    EventEmitterModule.forRoot()
  ],
  controllers: [
    FeedsController,
    SleepsController,
    DiapersController,
    TemperaturesController,
    WeightsController,
    BathsController
  ],
  providers: [
    FeedsService,
    SleepsService,
    DiapersService,
    TemperaturesService,
    WeightsService,
    BathsService
  ],
  exports: [
    FeedsService,
    SleepsService,
    DiapersService,
    TemperaturesService,
    WeightsService,
    BathsService
  ]
})
export class TrackablesModule {}