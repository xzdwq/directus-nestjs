import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { SortamentEntity } from '@src/orm';

@Entity({
	synchronize: false,
	schema: 'pim',
	name: 'normative_doc',
})
export class NormativeDocEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		length: 255,
	})
	number: string;

	@Column({
		length: 500,
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

	@OneToMany(() => SortamentEntity, (sortament) => sortament.normative_doc, {
		cascade: true,
	})
	sortament: SortamentEntity[];

	@CreateDateColumn()
	date_created: Date;

	@UpdateDateColumn()
	date_updated: Date;
}
