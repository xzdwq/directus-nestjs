import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

import { ClassifierTypeEntity } from '@src/orm';

@Entity({
	synchronize: false,
	schema: 'pim',
	name: 'classifier',
})
export class ClassifierEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		length: 255,
	})
	name: string;

	@Column({
		nullable: true,
	})
	type_id: string;
	@ManyToOne(() => ClassifierTypeEntity, (classifier_type) => classifier_type.id, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'type_id' })
	classifier_type: ClassifierTypeEntity;

	@Column({
		length: 255,
	})
	code: string;

	@Column({
		length: 1000,
	})
	description: string;

	@Column({
		length: 255,
	})
	status: string;

	@CreateDateColumn()
	date_created: Date;

	@UpdateDateColumn()
	date_updated: Date;
}
