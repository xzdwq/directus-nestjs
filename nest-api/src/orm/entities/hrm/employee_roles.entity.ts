import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { EmployeeEntity, RolesEntity } from '@src/orm';

@Entity({
	synchronize: false,
	schema: 'hrm',
	name: 'employee_roles',
})
export class EmployeeRolesEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		nullable: false,
	})
	employee_id: string;
	@ManyToOne(() => EmployeeEntity, (employee) => employee.id)
	@JoinColumn({ name: 'employee_id' })
	employee: EmployeeEntity;

	@Column({
		nullable: false,
	})
	roles_id: string;
	@ManyToOne(() => RolesEntity, (roles) => roles.id)
	@JoinColumn({ name: 'roles_id' })
	roles: RolesEntity;
}
