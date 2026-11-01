import { ApiProperty } from '@nestjs/swagger';

/** I1 health response — OpenAPI contract. */
export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({ example: 'ppc-api' })
  service!: string;
}
