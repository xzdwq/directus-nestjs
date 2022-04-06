import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { ClassifierEntity } from '@src/orm';

@Entity({
	synchronize: false,
	schema: 'pim',
	name: 'classifier_type',
})
export class ClassifierTypeEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		length: 255,
	})
	name: string;

	@Column({
		length: 1000,
	})
	description: string;

	@Column({
		length: 255,
	})
	status: string;

	@OneToMany(() => ClassifierEntity, (classifier) => classifier.classifier_type)
	classifier: ClassifierEntity[];

	@CreateDateColumn()
	date_created: Date;

	@UpdateDateColumn()
	date_updated: Date;
}
