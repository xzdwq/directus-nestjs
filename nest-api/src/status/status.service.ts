import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StatusLinkEntity } from '@src/orm';

@Injectable()
export class StatusService {
	constructor(
		@InjectRepository(StatusLinkEntity)
		private statusLinkRepository: Repository<StatusLinkEntity>,
	) {}

	async checkUpdateStatus(order: any, status_id: string, isExecutor = false): Promise<any> {
		const response = {
			success: false,
			currentStatus: '',
			currentStatusCode: '',
			newStatus: '',
			newStatusCode: '',
			status: null,
			msg: null,
		};

		const requestStatus = await this.statusLinkRepository
			.createQueryBuilder('status_link')
			.innerJoinAndSelect('status_link.status_type', 'status_type')
			.leftJoinAndSelect('status_link.task_type', 'task_type')
			.where('status_type.id = :id', { id: status_id })
			.andWhere('task_type.code = :task_type_code', { task_type_code: 'product' })
			.getOne();
		response.currentStatus = order.status_link.status_type.name;
		response.newStatus = requestStatus.status_type.name;
		response.currentStatusCode = order.status_link.status_type.code;
		response.newStatusCode = requestStatus.status_type.code;
		response.status = requestStatus;
		if (order.status_link.status_type.code === 'new') {
			if (
				(requestStatus.status_type.code === 'performed' && isExecutor) ||
				(requestStatus.status_type.code === 'pending' && isExecutor) ||
				requestStatus.status_type.code === 'canceled'
			) {
				response.success = true;
			} else {
				response.success = false;
			}
		}
		if (order.status_link.status_type.code === 'performed') {
			if (
				requestStatus.status_type.code === 'new' ||
				(requestStatus.status_type.code === 'pending' && isExecutor) ||
				(requestStatus.status_type.code === 'completed_successfully' && isExecutor) ||
				(requestStatus.status_type.code === 'partially_completed' && isExecutor) ||
				(requestStatus.status_type.code === 'canceled' && isExecutor)
			) {
				response.success = true;
			} else {
				response.success = false;
			}
		}
		if (order.status_link.status_type.code === 'pending') {
			if (
				requestStatus.status_type.code === 'new' ||
				(requestStatus.status_type.code === 'performed' && isExecutor) ||
				(requestStatus.status_type.code === 'completed_successfully' && isExecutor) ||
				(requestStatus.status_type.code === 'partially_completed' && isExecutor) ||
				(requestStatus.status_type.code === 'canceled' && isExecutor)
			) {
				response.success = true;
			} else {
				response.success = false;
			}
		}
		if (order.status_link.status_type.code === 'completed_successfully' && isExecutor) {
			if (requestStatus.status_type.code === 'returned_revision_mvp2') {
				response.success = true;
			} else {
				response.success = false;
			}
		}
		if (order.status_link.status_type.code === 'partially_completed' && isExecutor) {
			if (requestStatus.status_type.code === 'returned_revision_mvp2') {
				response.success = true;
			} else {
				response.success = false;
			}
		}
		if (order.status_link.status_type.code === 'canceled' && isExecutor) {
			if (requestStatus.status_type.code === 'returned_revision_mvp2') {
				response.success = true;
			} else {
				response.success = false;
			}
		}
		if (order.status_link.status_type.code === 'returned_revision_mvp2' && isExecutor) {
			if (
				requestStatus.status_type.code === 'completed_successfully' ||
				requestStatus.status_type.code === 'partially_completed' ||
				requestStatus.status_type.code === 'canceled'
			) {
				response.success = true;
			} else {
				response.success = false;
			}
		}
		return response;
	}
}
