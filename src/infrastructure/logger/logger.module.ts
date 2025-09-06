import { Module } from '@nestjs/common';
import { NativeLoggerService } from './native-logger.service';

@Module({
  providers: [NativeLoggerService],
  exports: [NativeLoggerService],
})
export class LoggerModule {}
