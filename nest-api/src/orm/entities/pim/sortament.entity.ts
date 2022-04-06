import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

import { TrademarkEntity, NormativeDocEntity } from '@src/orm';

@Entity({
	synchronize: false,
	schema: 'pim',
	name: 'sortament',
})
export class SortamentEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		length: 500,
	})
	name: string;

	@Column({
		length: 1000,
	})
	full_name: string;

	@Column({
		nullable: true,
	})
	trademark_id: string;
	@ManyToOne(() => TrademarkEntity, (trademark) => trademark.id, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'trademark_id' })
	trademark: TrademarkEntity;

	@Column({
		nullable: true,
	})
	normative_doc_id: string;
	@ManyToOne(() => NormativeDocEntity, (normative_doc) => normative_doc.id, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'normative_doc_id' })
	normative_doc: NormativeDocEntity;

	@CreateDateColumn()
	date_created: Date;

	@UpdateDateColumn()
	date_updated: Date;
}
