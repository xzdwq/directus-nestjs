import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { UnitPositionEntity } from '@src/orm';

@Entity({
	synchronize: false,
	schema: 'hrm',
	name: 'position',
})
export class PositionEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		length: 255,
	})
	name: string;

	@OneToMany(() => UnitPositionEntity, (unit_position) => unit_position.position)
	position: UnitPositionEntity[];
}
