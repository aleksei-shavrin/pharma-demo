import { Global, Module } from '@nestjs/common';
import { DEMO_DATA_SOURCE } from './demo-data-source';
import { MockDemoDataSource } from './mock-demo-data-source';

@Global()
@Module({
  providers: [
    MockDemoDataSource,
    { provide: DEMO_DATA_SOURCE, useExisting: MockDemoDataSource },
  ],
  exports: [DEMO_DATA_SOURCE, MockDemoDataSource],
})
export class DataModule {}
