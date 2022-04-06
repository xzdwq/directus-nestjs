import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { ProductEntity } from '@src/orm';

@Entity({
	synchronize: false,
	schema: 'pim',
	name: 'warehouse_control_category',
})
export class WarehouseControlCategoryEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		length: 255,
	})
	name: string;

	@Column({
		length: 255,
	})
	code: string;

	@Column({
		length: 255,
	})
	description: string;

	@OneToMany(() => ProductEntity, (p) => p.warehouse_control_category, { onDelete: 'CASCADE' })
	product: ProductEntity[];

	@CreateDateColumn({ type: 'timestamptz' })
	date_created: Date;

	@UpdateDateColumn({ type: 'timestamptz' })
	date_updated: Date;
}
