import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { NomenclatureService } from '@src/nomenclature/nomenclature.service';

@Controller('nest/nomenclature')
export class NomenclatureController {
	constructor(private nomenclatureService: NomenclatureService) {}

	@Get()
	async getPreNomenclature(
		@Query('productId') productId: string,
		@Query('containerId') containerId: string | number,
	): Promise<any> {
		return await this.nomenclatureService.getNomenclature({ productId, containerId });
	}

	@Get('trademark')
	async getTrademark(@Query('value') value: string, @Query('searchQuery') searchQuery: string): Promise<any> {
		return await this.nomenclatureService.getTrademark(value, searchQuery);
	}

	@Get('contractor-name')
	async getContractorByName(@Query('searchName') searchName: string): Promise<any> {
		return await this.nomenclatureService.getContractorByName(searchName);
	}

	@Get('contractor')
	async getContractor(): Promise<any> {
		return await this.nomenclatureService.getContractor();
	}

	@Get('generate-sn-code')
	getSNCode(): string {
		const snCode = 'SN' + this.nomenclatureService.getRandomNumberBetween(1, 999999);
		return snCode;
	}

	@Get('classifier-type')
	async findClassifierType(@Query('searchCode') searchCode: string, @Query('typeId') typeId: string): Promise<any> {
		return await this.nomenclatureService.classifierType(typeId, searchCode);
	}

	@Get('pg-contracrot')
	async findPgCodeByContractorId(
		@Query('contractorId') contractorId: string,
		@Query('searchCode') searchCode: string,
	): Promise<any> {
		return await this.nomenclatureService.findPgCodeByContractorId(contractorId, searchCode);
	}

	@Get('pg-suplr')
	async findPgContractor(
		@Query('contractorId') contractorId: string,
		@Query('searchCode') searchCode: string,
	): Promise<any> {
		return await this.nomenclatureService.findPgContractor(contractorId, searchCode);
	}

	@Post('save')
	async onSave(@Body() body: any) {
		return await this.nomenclatureService.onSave(body.params);
	}
}
