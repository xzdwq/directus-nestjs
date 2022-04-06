import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { UomEntity } from '@src/orm';

@Entity({
	synchronize: false,
	schema: 'public',
	name: 'uom_group',
})
export class UomGroupEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		length: 255,
	})
	name: string;

	@OneToMany(() => UomEntity, (uom) => uom.uom_group)
	uom: UomEntity[];

	@CreateDateColumn()
	date_created: Date;

	@UpdateDateColumn()
	date_updated: Date;
}
