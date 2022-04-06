import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { EmployeeEntity } from '@src/orm';

@Entity({
	synchronize: false,
	schema: 'hrm',
	name: 'person',
})
export class PersonEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		length: 255,
	})
	display_name: string;

	@Column({
		length: 255,
	})
	full_name_ru: string;

	@OneToMany(() => EmployeeEntity, (orders) => orders.person)
	person: EmployeeEntity[];
}
