import { Body, Controller, Delete, Get, Headers, Param, Post, Query } from '@nestjs/common';

import { ProductRequestService } from '@src/product-request/product-request.service';

@Controller('nest/product-request')
export class ProductRequestController {
	constructor(private productRequestService: ProductRequestService) {}

	@Get('ordersinfo')
	async getOrdersInfo(@Headers() headers): Promise<any> {
		return await this.productRequestService.findOrdersInfo(headers.authorization);
	}

	@Get()
	async gatOrders(
		@Headers() headers,
		@Query('page') page: number,
		@Query('limit') limit: number,
		@Query('type') type: string,
		@Query('filter') filter: string,
		@Query('search') search: string,
	): Promise<any> {
		return await this.productRequestService.findOrders(headers.authorization, page, limit, type, filter, search);
	}

	@Get(':id')
	async gatOrder(@Param() params): Promise<any> {
		return await this.productRequestService.findOrder(params.id);
	}

	@Post(':id')
	async saveCard(@Param() params, @Body() body): Promise<any> {
		const bodyParams = body.params;
		return this.productRequestService.saveCard(params.id, bodyParams);
	}

	@Delete('order/:id')
	async removeOrder(@Param() params): Promise<any> {
		return this.productRequestService.removeOrder([params.id]);
	}

	@Post('orders/delete')
	async removeOrders(@Body() body): Promise<any> {
		const bodyParams = body.params;
		return this.productRequestService.removeOrder(bodyParams.orders);
	}

	@Post('update/orders')
	async updateOrders(@Body() body): Promise<any> {
		const bodyParams = body.params;
		return this.productRequestService.updateOrders(bodyParams);
	}
}
