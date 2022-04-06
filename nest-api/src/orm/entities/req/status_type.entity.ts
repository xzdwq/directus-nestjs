import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { StatusLinkEntity } from '@src/orm';

@Entity({
	schema: 'req',
	name: 'status_type',
})
export class StatusTypeEntity {
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

	@OneToMany(() => StatusLinkEntity, (status_link) => status_link.status_type)
	status_link: StatusLinkEntity[];

	@CreateDateColumn()
	create_at: Date;

	@UpdateDateColumn()
	update_at: Date;
}
