import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { ConditionLinkEntity } from '@src/orm';

@Entity({
	schema: 'req',
	name: 'condition_type',
})
export class ConditionTypeEntity {
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

	@OneToMany(() => ConditionLinkEntity, (condition_link) => condition_link.condition_type)
	condition_link: ConditionLinkEntity[];

	@CreateDateColumn()
	create_at: Date;

	@UpdateDateColumn()
	update_at: Date;
}
