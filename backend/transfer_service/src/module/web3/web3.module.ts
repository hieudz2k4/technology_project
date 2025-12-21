import { Module } from "@nestjs/common";
import { Web3Service } from "./web3.service";
import { Web3Provider } from "./web3_provider";

@Module({
    imports: [],
    controllers: [],
    providers: [Web3Service, Web3Provider],
    exports: [Web3Service],
})
export class Web3Module { }