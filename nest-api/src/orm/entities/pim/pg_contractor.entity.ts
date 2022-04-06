import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

import { ContractorEntity } from '@src/orm';

@Entity({
	synchronize: false,
	schema: 'pim',
	name: 'pg_contractor',
})
export class PgContractorEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column('uuid')
	parent_id: string;

	@Column({
		length: 255,
	})
	name: string;

	@Column({
		length: 255,
	})
	code: string;

	@Column({
		nullable: false,
	})
	contractor_id: string;
	@ManyToOne(() => ContractorEntity, (contractor) => contractor.id)
	@JoinColumn({ name: 'contractor_id' })
	contractor: ContractorEntity;

	@CreateDateColumn()
	date_created: Date;

	@UpdateDateColumn()
	date_updated: Date;
}
