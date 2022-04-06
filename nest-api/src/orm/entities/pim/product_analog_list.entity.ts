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

import { ProductListEntity, ProductEntity } from '@src/orm';

@Entity({
	synchronize: false,
	schema: 'pim',
	name: 'product_analog_list',
})
export class ProductAnalogListEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		length: 1024,
	})
	name: string;

	@Column({
		length: 255,
	})
	code: string;

	@Column({
		nullable: true,
	})
	product_list_id: string;
	@ManyToOne(() => ProductListEntity, (pl) => pl.id, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'product_list_id' })
	product_list: ProductListEntity;

	@OneToMany(() => ProductEntity, (p) => p.product_analog_list, { onDelete: 'CASCADE' })
	product: ProductEntity[];

	@CreateDateColumn({ type: 'timestamptz' })
	date_created: Date;

	@UpdateDateColumn({ type: 'timestamptz' })
	date_updated: Date;
}
