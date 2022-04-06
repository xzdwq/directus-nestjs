import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { UsersService } from '@src/users/users.service';
import { StatusService } from '@src/status/status.service';
import { RequestDTO, OrderSearchType } from '@general-types/index';
import {
	ProductRequestEntity,
	PriorityEntity,
	StatusLinkEntity,
	StatusTypeEntity,
	EmployeeEntity,
	ConditionLinkEntity,
	TaskTypeEntity,
} from '@src/orm';

@Injectable()
export class ProductRequestService {
	constructor(
		private usersService: UsersService,
		private statusService: StatusService,
		@InjectRepository(ProductRequestEntity)
		private requestRepository: Repository<ProductRequestEntity>,
		@InjectRepository(PriorityEntity)
		private priorityRepository: Repository<PriorityEntity>,
		@InjectRepository(StatusLinkEntity)
		private statusLinkRepository: Repository<StatusLinkEntity>,
		@InjectRepository(EmployeeEntity)
		private employeeRepository: Repository<EmployeeEntity>,
		@InjectRepository(ConditionLinkEntity)
		private conditionLinkRepository: Repository<ConditionLinkEntity>,
		@InjectRepository(StatusTypeEntity)
		private statusTypeRepository: Repository<StatusTypeEntity>,
	) {}

	async findOrdersInfo(headerAuth) {
		const totalActive = await this.requestRepository
			.createQueryBuilder('request')
			.leftJoinAndSelect('request.condition_link', 'condition_link')
			.leftJoinAndSelect('condition_link.task_type', 'task_type')
			.leftJoinAndSelect('condition_link.condition_type', 'condition_type')
			.where('condition_type.code = :condition_code', { condition_code: 'active' })
			.andWhere('task_type.code = :task_type_code', { task_type_code: 'product' })
			.getCount();
		const totalArchive = await this.requestRepository
			.createQueryBuilder('request')
			.leftJoinAndSelect('request.condition_link', 'condition_link')
			.leftJoinAndSelect('condition_link.task_type', 'task_type')
			.leftJoinAndSelect('condition_link.condition_type', 'condition_type')
			.where('condition_type.code = :condition_code', { condition_code: 'archive' })
			.andWhere('task_type.code = :task_type_code', { task_type_code: 'product' })
			.getCount();
		const employee = await this.employeeRepository
			.createQueryBuilder('emploee')
			.leftJoinAndSelect('emploee.person', 'person')
			.leftJoinAndSelect('emploee.unit_position', 'unit_position')
			.leftJoinAndSelect('unit_position.position', 'position')
			.limit(10)
			.getRawMany();
		// My orders
		const myDirectusInfo: any = await this.usersService.getMyDirectus(headerAuth);
		const totalActiveMe = await this.requestRepository
			.createQueryBuilder('request')
			.where('executor_id = :executor_id', { executor_id: myDirectusInfo?.id })
			.getCount();

		return {
			success: true,
			totalActive: totalActive,
			totalArchive: totalArchive,
			totalActiveMe: totalActiveMe,
			employee: employee,
		};
	}

	async findOrders(
		headerAuth,
		page: number,
		limit: number | any,
		type: string,
		filter: string,
		searchParams: string,
	): Promise<any> {
		let searchArray: Array<OrderSearchType>;
		if (searchParams) {
			searchArray = JSON.parse(searchParams);
		}

		let queryB;
		queryB = await this.requestRepository
			.createQueryBuilder('request')
			.leftJoinAndSelect('request.status_link', 'status_link')
			.leftJoinAndSelect('status_link.status_type', 'status_type')
			.leftJoinAndSelect('request.condition_link', 'condition_link')
			.leftJoinAndSelect('condition_link.condition_type', 'condition_type')
			.leftJoinAndSelect(
				TaskTypeEntity,
				'task_type',
				'condition_link.task_type_id = task_type.id AND status_link.task_type_id = task_type.id',
			)
			.leftJoinAndSelect('request.priority', 'priority')
			.leftJoinAndSelect('request.initiator', 'initiator_join')
			.leftJoinAndSelect('initiator_join.person', 'initiator')
			.leftJoinAndSelect('initiator_join.unit_position', 'initiator_unit_position')
			.leftJoinAndSelect('initiator_unit_position.position', 'initiator_position')
			.leftJoinAndSelect('request.executor', 'executor_join')
			.leftJoinAndSelect('executor_join.person', 'executor')
			.leftJoinAndSelect('executor_join.unit_position', 'executor_unit_position')
			.leftJoinAndSelect('executor_unit_position.position', 'executor_position')
			.leftJoinAndSelect('request.product_list', 'product_list')
			// .leftJoinAndSelect('product_list.product_analog_list', 'product_analog_list')
			.leftJoinAndSelect('product_list.product_list_selected', 'product_list_selected')
			.where('condition_type.code = :condition_code', { condition_code: type })
			.andWhere('task_type.code = :task_type_code', { task_type_code: 'product' });

		const generalTotal = await queryB.getCount();

		if (searchArray?.length > 0) {
			for (const i in searchArray) {
				if (searchArray[i].type === 'number') {
					if (JSON.parse(searchArray[i].strict)) {
						const paramStrict = {},
							variable = searchArray[i].index;
						paramStrict[variable] = searchArray[i].value;
						queryB = await queryB.andWhere(`${variable} = :${variable}`, paramStrict);
					} else {
						const paramSoft = {},
							variable = searchArray[i].index;
						paramSoft[variable] = `%${searchArray[i].value}%`;
						queryB = await queryB.andWhere(`CAST(${variable} AS VARCHAR) ilike :${variable}`, paramSoft);
					}
				} else {
					const paramDef = {};
					let variable = searchArray[i].index;
					const variableArray = variable.split('.');
					if (variableArray.length > 2)
						// variable = [variableArray.shift(), variableArray.pop()].join('.');
						variableArray.shift();
					variable = variableArray.join('.');
					paramDef[variable] = `%${searchArray[i].value}%`;
					queryB = await queryB.andWhere(`${variable} ilike :${variable}`, paramDef);
				}
			}
		}

		if (filter) {
			const filterArray = filter.split(',');
			for (const i in filterArray) {
				// Все нераспределенные заявки
				if (filterArray[i] === 'all_unallocated_orders') {
					queryB = await queryB.andWhere('executor IS NULL');
				}
				// Мои заявки
				if (filterArray[i] === 'my_orders') {
					const myDirectusInfo: any = await this.usersService.getMyDirectus(headerAuth);
					queryB = await queryB.andWhere('executor_id = :my_id', {
						my_id: myDirectusInfo?.id,
					});
				}
			}
		}
		// console.log(await queryB.getQueryAndParameters())

		queryB = await queryB.orderBy('request.update_at', 'DESC');

		const total = await queryB.getCount();

		if (limit != 'All') {
			queryB = queryB.take(limit).skip(limit * (page - 1));
		}
		const dataAll = await queryB.getMany();

		const basePriority = await this.priorityRepository.find();
		const baseStatus = await this.statusTypeRepository
			.createQueryBuilder('status_type')
			.innerJoinAndSelect('status_type.status_link', 'status_link')
			.leftJoinAndSelect('status_link.task_type', 'task_type')
			.where('task_type.code = :task_type_code', { task_type_code: 'product' })
			.getMany();

		return {
			success: true,
			generalTotal: generalTotal,
			total: total,
			data: dataAll as RequestDTO[],
			basePriority: basePriority,
			baseStatus: baseStatus,
		};
	}

	async findOrder(id: string): Promise<any> {
		const queryB = await this.requestRepository
			.createQueryBuilder('request')
			.leftJoinAndSelect('request.status_link', 'status_link')
			.leftJoinAndSelect('status_link.status_type', 'status_type')
			.leftJoinAndSelect('request.condition_link', 'condition_link')
			.leftJoinAndSelect('condition_link.condition_type', 'condition_type')
			.leftJoinAndSelect(
				TaskTypeEntity,
				'task_type',
				'condition_link.task_type_id = task_type.id AND status_link.task_type_id = task_type.id',
			)
			.leftJoinAndSelect('request.priority', 'priority')
			.leftJoinAndSelect('request.initiator', 'initiator_join')
			.leftJoinAndSelect('initiator_join.person', 'initiator')
			.leftJoinAndSelect('initiator_join.unit_position', 'initiator_unit_position')
			.leftJoinAndSelect('initiator_unit_position.position', 'initiator_position')
			.leftJoinAndSelect('request.executor', 'executor_join')
			.leftJoinAndSelect('executor_join.person', 'executor')
			.leftJoinAndSelect('executor_join.unit_position', 'executor_unit_position')
			.leftJoinAndSelect('executor_unit_position.position', 'executor_position')
			.leftJoinAndSelect('request.product_list', 'product_list')
			.leftJoinAndSelect('product_list.product_list_analog', 'product_list_analog')
			.leftJoinAndSelect('product_list_analog.product', 'product')
			.leftJoinAndSelect('product_list.product_list_selected', 'product_list_selected')
			.where('request.id = :request_id', { request_id: id })
			.andWhere('task_type.code = :task_type_code', { task_type_code: 'product' })
			.getOne();
		const basePriority = await this.priorityRepository.find();
		const baseStatus = await this.statusTypeRepository
			.createQueryBuilder('status_type')
			.innerJoinAndSelect('status_type.status_link', 'status_link')
			.leftJoinAndSelect('status_link.task_type', 'task_type')
			.where('task_type.code = :task_type_code', { task_type_code: 'product' })
			.getMany();
		queryB.product_list.forEach((i) => {
			if (!i.product_list_selected.length) i.product_list_selected = [Object.create({})];
		});
		return {
			success: true,
			data: queryB as RequestDTO,
			basePriority: basePriority,
			baseStatus: baseStatus,
		};
	}

	async saveCard(id: string, params: any) {
		const orderById = await this.requestRepository.findOne({
			where: { id: id },
		});
		// Condition
		let conditionState = 'active';
		if (
			params.status.code === 'completed_successfully' ||
			params.status.code === 'partially_completed' ||
			params.status.code === 'canceled' ||
			params.status.code === 'pending'
		) {
			conditionState = 'archive';
		}

		const condition = await this.conditionLinkRepository
			.createQueryBuilder('condition_link')
			.leftJoinAndSelect('condition_link.task_type', 'task_type')
			.leftJoinAndSelect('condition_link.condition_type', 'condition_type')
			.where('condition_type.code = :condition_type_code', { condition_type_code: conditionState })
			.andWhere('task_type.code = :task_type_code', { task_type_code: 'product' })
			.getOne();

		const status = await this.statusLinkRepository
			.createQueryBuilder('status_link')
			.leftJoinAndSelect('status_link.task_type', 'task_type')
			.leftJoinAndSelect('status_link.status_type', 'status_type')
			.where('status_type.id = :status_type_id', { status_type_id: params.status.id })
			.andWhere('task_type.code = :task_type_code', { task_type_code: 'product' })
			.getOne();

		orderById.condition_link_id = condition.id;
		orderById.order_number = params.order_number;
		orderById.priority_id = params.priority.id;
		orderById.status_link_id = status.id;
		orderById.initiator_id = params.initiator.employee_id || null;
		orderById.executor_id = params.executor.employee_id || null;
		const data = await this.requestRepository.save(orderById);
		return data;
	}

	async updateOrders(params: any): Promise<any> {
		const orders_id = params.orders,
			data = params.data;
		const msg = [];
		let successCount = 0,
			isExecutor = false;
		for (let i = 0; i < orders_id.length; i++) {
			const request = await this.requestRepository
				.createQueryBuilder('request')
				.leftJoinAndSelect('request.status_link', 'status_link')
				.leftJoinAndSelect('status_link.task_type', 'task_type')
				.leftJoinAndSelect('status_link.status_type', 'status_type')
				.leftJoinAndSelect('request.executor', 'executor')
				.leftJoinAndSelect('executor.person', 'person')
				.where('task_type .code = :task_type_code', { task_type_code: 'product' })
				.andWhere('request.id = :id', { id: orders_id[i] })
				.getOne();
			if (request.executor?.person?.id) isExecutor = true;
			// Смена исполнителя
			if (data.delete_executor && !data.executor?.full_name_ru?.emploee_id) {
				// Удалить исполнителя можно только у зявки со статусом "Новая"
				const requestStatus = await this.statusTypeRepository.findOne({
					where: { id: data.status_id },
				});
				if (request.status_link?.status_type?.code === 'new' || requestStatus?.code === 'new') {
					request.executor = null;
					successCount++;
					isExecutor = false;
				} else {
					msg.push(`№${request.order_number}: невозможно удалить исполнителя, т.к. статус не "Новая"`);
				}
			} else if (data.executor?.full_name_ru?.emploee_id) {
				const executor = await this.employeeRepository.findOne({
					where: { id: data.executor.full_name_ru.emploee_id },
				});
				request.executor = executor;
				successCount++;
				isExecutor = true;
			}
			// Смена статуса
			if (data.status_id) {
				const changeStatus = await this.statusService.checkUpdateStatus(request, data.status_id, isExecutor);
				if (changeStatus.success) {
					request.status_link = await this.statusLinkRepository.findOne(changeStatus.status.id);
					successCount++;
					// Ушла ли завка в архив
					let conditionState = 'active';
					if (
						changeStatus.newStatusCode === 'completed_successfully' ||
						changeStatus.newStatusCode === 'partially_completed' ||
						changeStatus.newStatusCode === 'canceled' ||
						changeStatus.newStatusCode === 'pending'
					) {
						conditionState = 'archive';
					}
					const condition = await this.conditionLinkRepository
						.createQueryBuilder('condition_link')
						.leftJoinAndSelect('condition_link.task_type', 'task_type')
						.leftJoinAndSelect('condition_link.condition_type', 'condition_type')
						.where('condition_type.code = :code', { code: conditionState })
						.andWhere('task_type.code = :task_type_code', { task_type_code: 'product' })
						.getOne();
					request.condition_link_id = condition.id;
				} else {
					msg.push(
						`№${request.order_number}: невозможно изменить статус с "${changeStatus.currentStatus}" на "${
							changeStatus.newStatus
						}" ${changeStatus.msg || ''}`,
					);
				}
			}
			// Приоритет
			if (data.priority_id) {
				request.priority_id = data.priority_id;
				successCount++;
			}
			await this.requestRepository.save(request);
		}
		const orders = await this.requestRepository.find({
			relations: [
				'status_link',
				'status_link.status_type',
				'priority',
				'initiator',
				'initiator.person',
				'initiator.unit_position',
				'initiator.unit_position.position',
				'executor',
				'executor.person',
				'executor.unit_position',
				'executor.unit_position.position',
				'condition_link',
				'condition_link.condition_type',
			],
			where: { id: In(orders_id) },
		});
		return {
			success: true,
			data: orders,
			message: msg,
			successCount: successCount,
		};
	}

	async removeOrder(orders_id) {
		const order = await this.requestRepository.find({
			where: { id: In(orders_id) },
		});
		await this.requestRepository.remove(order);
		return {
			success: true,
			removeOrder: order,
		};
	}
}
