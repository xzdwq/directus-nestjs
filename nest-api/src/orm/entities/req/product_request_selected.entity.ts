import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

import { ProductListEntity } from '@src/orm';

@Entity({
	schema: 'req',
	name: 'product_request_selected',
})
export class ProductRequestSelectedEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		length: 1024,
		nullable: false,
	})
	name: string;

	@Column({
		nullable: true,
	})
	article: string;

	@Column({
		nullable: true,
	})
	quantity: number;

	@Column({
		length: 64,
		nullable: true,
	})
	unit: string;

	@Column({
		length: 255,
		nullable: true,
	})
	product_group: string;

	@Column({
		length: 255,
		nullable: true,
	})
	file: string;

	@Column({
		length: 255,
		nullable: true,
	})
	comment: string;

	@Column({
		nullable: true,
	})
	product_list_id: string;
	@ManyToOne(() => ProductListEntity, (product_list) => product_list.id, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'product_list_id' })
	product_list: ProductListEntity;

	@CreateDateColumn()
	create_at: Date;

	@UpdateDateColumn()
	update_at: Date;
}
