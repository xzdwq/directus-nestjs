import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { ProductRequestEntity, PersonEntity, UnitPositionEntity, EmployeeRolesEntity } from '@src/orm';

@Entity({
	synchronize: false,
	schema: 'hrm',
	name: 'employee',
})
export class EmployeeEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		length: 255,
	})
	domain_name: string;

	@Column({
		length: 255,
	})
	email: string;

	@OneToMany(() => ProductRequestEntity, (request) => request.initiator)
	initiator: ProductRequestEntity[];

	@OneToMany(() => ProductRequestEntity, (request) => request.executor)
	executor: ProductRequestEntity[];

	@Column({
		nullable: false,
	})
	person_id: string;
	@ManyToOne(() => PersonEntity, (person) => person.id)
	@JoinColumn({ name: 'person_id' })
	person: PersonEntity;

	@Column({
		nullable: false,
	})
	position_id: string;
	@ManyToOne(() => UnitPositionEntity, (position) => position.id)
	@JoinColumn({ name: 'position_id' })
	unit_position: UnitPositionEntity;

	@OneToMany(() => EmployeeRolesEntity, (roles) => roles.employee)
	employee_roles: EmployeeRolesEntity[];
}
