import { Controller, Get, Headers, Query } from '@nestjs/common';

import { UsersService } from '@src/users/users.service';

@Controller('nest/employee')
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Get('mydirectus')
	async getMyDirectus(@Headers() headers) {
		return await this.usersService.getMyDirectus(headers);
	}

	@Get('find')
	async getUsers(@Query('query') query: string) {
		return await this.usersService.findUsers(query);
	}
}
