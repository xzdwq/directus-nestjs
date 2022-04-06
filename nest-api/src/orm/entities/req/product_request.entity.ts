import {
	Column,
	CreateDateColumn,
	Entity,
	Generated,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

import { StatusLinkEntity, PriorityEntity, EmployeeEntity, ProductListEntity, ConditionLinkEntity } from '@src/orm';

@Entity({
	schema: 'req',
	name: 'product_request',
})
export class ProductRequestEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	@Generated('increment')
	order_number: number;

	@Column({
		nullable: false,
	})
	status_link_id: string;
	@ManyToOne(() => StatusLinkEntity, (status_link) => status_link.id, { cascade: true })
	@JoinColumn({ name: 'status_link_id' })
	status_link: StatusLinkEntity;

	@Column({
		nullable: false,
	})
	priority_id: string;
	@ManyToOne(() => PriorityEntity, (priority) => priority.id)
	@JoinColumn({ name: 'priority_id' })
	priority: PriorityEntity;

	@Column({
		length: 255,
		nullable: false,
	})
	theme: string;

	@Column({
		nullable: false,
	})
	initiator_id: string;
	@ManyToOne(() => EmployeeEntity, (initiator) => initiator.id, {
		cascade: true,
	})
	@JoinColumn({ name: 'initiator_id' })
	initiator: EmployeeEntity;

	@Column({
		nullable: true,
	})
	executor_id: string;
	@ManyToOne(() => EmployeeEntity, (executor) => executor.id, { cascade: true })
	@JoinColumn({ name: 'executor_id' })
	executor: EmployeeEntity;

	@OneToMany(() => ProductListEntity, (product_list) => product_list.request, {
		cascade: true,
	})
	product_list: ProductListEntity[];

	@Column({
		nullable: false,
	})
	condition_link_id: string;
	@ManyToOne(() => ConditionLinkEntity, (condition_link) => condition_link.request)
	@JoinColumn({ name: 'condition_link_id' })
	condition_link: ConditionLinkEntity;

	@CreateDateColumn()
	create_at: Date;

	@UpdateDateColumn()
	update_at: Date;
}
