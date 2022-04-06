import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

import { ProductAnalogListEntity, CodeTypeEntity, UomEntity, WarehouseControlCategoryEntity } from '@src/orm';

@Entity({
	synchronize: false,
	schema: 'pim',
	name: 'product',
})
export class ProductEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		length: 1000,
	})
	name: string;

	@Column({
		length: 511,
	})
	additional_options: string;

	@Column({
		length: 255,
	})
	class: string;

	@Column({
		length: 1000,
	})
	code: string;

	@Column({
		length: 255,
	})
	kind: string;

	@Column({
		length: 255,
	})
	status_localization: string;

	@Column({
		length: 255,
	})
	subkind: string;

	@Column({
		nullable: false,
		default: 1,
	})
	kit: boolean;

	@Column({
		nullable: true,
	})
	product_analog_list_id: string;
	@ManyToOne(() => ProductAnalogListEntity, (pal) => pal.id, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'product_analog_list_id' })
	product_analog_list: ProductAnalogListEntity;

	@Column({
		nullable: true,
	})
	code_type: string;
	@ManyToOne(() => CodeTypeEntity, (ct) => ct.id, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'code_type' })
	product_code_type: CodeTypeEntity;

	@Column({
		nullable: true,
	})
	report_uom_id: string;
	@ManyToOne(() => UomEntity, (uom) => uom.product_uom_reports, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'report_uom_id' })
	uom_reports: UomEntity;

	@Column({
		nullable: true,
	})
	base_uom_id: string;
	@ManyToOne(() => UomEntity, (uom) => uom.product_uom, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'base_uom_id' })
	base_uom: UomEntity;

	@Column({
		nullable: true,
	})
	storage_uom_id: string;
	@ManyToOne(() => UomEntity, (uom) => uom.product_uom_storage_balances, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'storage_uom_id' })
	uom_storage_balances: UomEntity;

	@Column({
		nullable: true,
	})
	warehouse_control_category_id: string;
	@ManyToOne(() => WarehouseControlCategoryEntity, (wcc) => wcc.product, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'warehouse_control_category_id' })
	warehouse_control_category: WarehouseControlCategoryEntity;

	@CreateDateColumn({ type: 'timestamptz' })
	date_created: Date;

	@UpdateDateColumn({ type: 'timestamptz' })
	date_updated: Date;
}
