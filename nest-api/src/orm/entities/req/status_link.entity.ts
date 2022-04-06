import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

import { StatusTypeEntity, TaskTypeEntity, ProductRequestEntity } from '@src/orm';

@Entity({
	schema: 'req',
	name: 'status_link',
})
export class StatusLinkEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		nullable: true,
	})
	status_type_id: string;
	@ManyToOne(() => StatusTypeEntity, (status_type) => status_type.id, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'status_type_id' })
	status_type: StatusTypeEntity;

	@Column({
		nullable: true,
	})
	task_type_id: string;
	@ManyToOne(() => TaskTypeEntity, (task_type) => task_type.id, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'task_type_id' })
	task_type: TaskTypeEntity;

	@OneToMany(() => ProductRequestEntity, (request) => request.condition_link)
	request: ProductRequestEntity[];

	@CreateDateColumn()
	create_at: Date;

	@UpdateDateColumn()
	update_at: Date;
}
