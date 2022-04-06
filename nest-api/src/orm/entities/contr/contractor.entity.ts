import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { TrademarkEntity, PgEntity, PgContractorEntity } from '@src/orm';

@Entity({
	synchronize: false,
	schema: 'contr',
	name: 'contractor',
})
export class ContractorEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		length: 500,
	})
	name: string;

	@Column({
		length: 500,
	})
	short_name: string;

	@Column({
		length: 500,
	})
	international_name: string;

	@Column({
		length: 255,
	})
	key: string;

	@OneToMany(() => TrademarkEntity, (trademark) => trademark.contractor, {
		cascade: true,
	})
	trademark: TrademarkEntity[];

	@OneToMany(() => PgEntity, (pg) => pg.contractor, {
		cascade: true,
	})
	pg: PgEntity[];

	@OneToMany(() => PgContractorEntity, (pg_contractor) => pg_contractor.contractor, {
		cascade: true,
	})
	pg_contractor: PgContractorEntity[];

	@CreateDateColumn()
	date_created: Date;

	@UpdateDateColumn()
	date_updated: Date;
}
