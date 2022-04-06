import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { ConditionLinkEntity, StatusLinkEntity } from '@src/orm';

@Entity({
	schema: 'req',
	name: 'task_type',
})
export class TaskTypeEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		length: 255,
		nullable: false,
	})
	name: string;

	@Column({
		length: 255,
		nullable: false,
		unique: true,
	})
	code: string;

	@OneToMany(() => ConditionLinkEntity, (condition_link) => condition_link.task_type)
	condition_link: ConditionLinkEntity[];

	@OneToMany(() => StatusLinkEntity, (condition_link) => condition_link.task_type)
	status_link: StatusLinkEntity[];

	@CreateDateColumn()
	create_at: Date;

	@UpdateDateColumn()
	update_at: Date;
}
