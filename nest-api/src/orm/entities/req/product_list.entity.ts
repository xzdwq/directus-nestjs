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

import { ProductRequestEntity, ProductRequestSelectedEntity, ProductAnalogListEntity } from '@src/orm';

@Entity({
	schema: 'req',
	name: 'product_list',
})
export class ProductListEntity {
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
	// TODO relation table "pg"
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
		nullable: false,
		default: 1,
	})
	active: boolean;

	@Column({
		nullable: true,
	})
	request_id: string;
	@ManyToOne(() => ProductRequestEntity, (request) => request.id, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'request_id' })
	request: ProductRequestEntity;

	@OneToMany(() => ProductRequestSelectedEntity, (selected) => selected.product_list, { cascade: true })
	product_list_selected: ProductRequestSelectedEntity[];

	@OneToMany(() => ProductAnalogListEntity, (pal) => pal.product_list, { onDelete: 'CASCADE' })
	product_list_analog: ProductAnalogListEntity[];

	@CreateDateColumn()
	create_at: Date;

	@UpdateDateColumn()
	update_at: Date;
}
