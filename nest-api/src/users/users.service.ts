import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { ConfigService } from '@nestjs/config';
import { EmployeeEntity } from '@src/orm';

import logger from '@src/core/logger';

@Injectable()
export class UsersService {
	constructor(
		private configService: ConfigService,
		private httpService: HttpService,
		@InjectRepository(EmployeeEntity)
		private employeeRepository: Repository<EmployeeEntity>,
	) {}

	async getMyDirectus(headerAuth) {
		try {
			const userInfo = new Promise<any>((res) => {
				const directus_api = this.configService.get('directus_api');
				const headersRequest = {
					Authorization: `${headerAuth.split(' ')[0]} ${headerAuth.split(' ')[1]}`,
				};
				this.httpService.get(`${directus_api}/users/me`, { headers: headersRequest }).subscribe((resp) => {
					res(resp.data.data);
				});
			});
			return userInfo;
		} catch (e) {
			logger.error(`${UsersService.name}: ${e.toString()}`, 'NestApp');
			return null;
		}
	}

	async findUsers(query) {
		const employee = await this.employeeRepository
			.createQueryBuilder('emploee')
			.leftJoinAndSelect('emploee.employee_roles', 'employee_roles')
			.leftJoinAndSelect('employee_roles.roles', 'roles')
			.leftJoinAndSelect('emploee.person', 'person')
			.leftJoinAndSelect('emploee.unit_position', 'unit_position')
			.leftJoinAndSelect('unit_position.position', 'position')
			.where('person.full_name_ru ilike :full_name_ru', {
				full_name_ru: `%${query}%`,
			})
			.andWhere('roles.id = :roles_id', { roles_id: 'b362f67d-891a-43b7-9c5e-33aeed0b7ba7' })
			.getRawMany();
		return employee;
	}
}
