import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

import { ContractorEntity, SortamentEntity } from '@src/orm';

@Entity({
	synchronize: false,
	schema: 'contr',
	name: 'trademark',
})
export class TrademarkEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		length: 500,
	})
	name: string;

	@Column({
		nullable: true,
	})
	contractor_id: string;
	@ManyToOne(() => ContractorEntity, (contractor) => contractor.id, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'contractor_id' })
	contractor: ContractorEntity;

	@OneToMany(() => SortamentEntity, (sortament) => sortament.trademark, {
		cascade: true,
	})
	sortament: SortamentEntity[];

	@CreateDateColumn()
	date_created: Date;

	@UpdateDateColumn()
	date_updated: Date;
}
