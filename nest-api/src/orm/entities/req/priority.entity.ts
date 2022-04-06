import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { ProductRequestEntity } from '@src/orm';

@Entity({
	schema: 'req',
	name: 'priority',
})
export class PriorityEntity {
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

	@Column({
		nullable: true,
	})
	weight: number;

	@OneToMany(() => ProductRequestEntity, (request) => request.priority)
	request: ProductRequestEntity[];

	@CreateDateColumn()
	create_at: Date;

	@UpdateDateColumn()
	update_at: Date;
}
