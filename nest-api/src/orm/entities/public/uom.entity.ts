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

import { UomGroupEntity, ProductEntity } from '@src/orm';

@Entity({
	synchronize: false,
	schema: 'public',
	name: 'uom',
})
export class UomEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		length: 255,
	})
	name: string;

	@Column({
		length: 63,
	})
	designation: string;

	@Column({
		nullable: false,
	})
	uom_group_id: string;
	@ManyToOne(() => UomGroupEntity, (uom_group) => uom_group.id)
	@JoinColumn({ name: 'uom_group_id' })
	uom_group: UomGroupEntity;

	@OneToMany(() => ProductEntity, (p) => p.uom_reports, { onDelete: 'CASCADE' })
	product_uom_reports: ProductEntity[];

	@OneToMany(() => ProductEntity, (p) => p.base_uom, { onDelete: 'CASCADE' })
	product_uom: ProductEntity[];

	@OneToMany(() => ProductEntity, (p) => p.uom_storage_balances, { onDelete: 'CASCADE' })
	product_uom_storage_balances: ProductEntity[];

	@CreateDateColumn()
	date_created: Date;

	@UpdateDateColumn()
	date_updated: Date;
}
