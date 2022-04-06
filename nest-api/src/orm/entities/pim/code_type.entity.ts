import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { ProductEntity } from '@src/orm';

@Entity({
	synchronize: false,
	schema: 'pim',
	name: 'code_type',
})
export class CodeTypeEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		length: 255,
	})
	name: string;

	@OneToMany(() => ProductEntity, (p) => p.product_code_type, { onDelete: 'CASCADE' })
	product: ProductEntity[];

	@CreateDateColumn({ type: 'timestamptz' })
	date_created: Date;

	@UpdateDateColumn({ type: 'timestamptz' })
	date_updated: Date;
}
