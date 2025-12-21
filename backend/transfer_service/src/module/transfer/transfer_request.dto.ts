import { IsNumber, IsString, Max, Min } from 'class-validator';

export class TransferRequestDto {
  @IsString()
  addressFrom: string;

  @IsString()
  addressTo: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.05)
  @Max(100000000)
  amount: number;
}
