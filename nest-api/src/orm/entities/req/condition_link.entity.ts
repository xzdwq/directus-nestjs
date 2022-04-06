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

import { ConditionTypeEntity, TaskTypeEntity, ProductRequestEntity } from '@src/orm';

@Entity({
	schema: 'req',
	name: 'condition_link',
})
export class ConditionLinkEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		nullable: true,
	})
	condition_type_id: string;
	@ManyToOne(() => ConditionTypeEntity, (condition_type) => condition_type.id, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'condition_type_id' })
	condition_type: ConditionTypeEntity;

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
