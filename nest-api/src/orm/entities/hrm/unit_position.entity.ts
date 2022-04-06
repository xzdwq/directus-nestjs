import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { EmployeeEntity, PositionEntity } from '@src/orm';

@Entity({
	synchronize: false,
	schema: 'hrm',
	name: 'unit_position',
})
export class UnitPositionEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@OneToMany(() => EmployeeEntity, (employee) => employee.unit_position)
	unit_position: EmployeeEntity[];

	@Column({
		nullable: false,
	})
	position_id: string;
	@ManyToOne(() => PositionEntity, (position) => position.id)
	@JoinColumn({ name: 'position_id' })
	position: PositionEntity;
}
