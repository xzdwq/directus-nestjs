import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { EmployeeRolesEntity } from '@src/orm';

@Entity({
	synchronize: false,
	schema: 'hrm',
	name: 'roles',
})
export class RolesEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		length: 255,
	})
	name: string;

	@OneToMany(() => EmployeeRolesEntity, (employee_roles) => employee_roles.roles)
	employee_roles: EmployeeRolesEntity[];
}
