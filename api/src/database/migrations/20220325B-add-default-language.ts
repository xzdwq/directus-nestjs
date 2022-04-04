import { Knex } from 'knex';
import { getHelpers } from '../helpers';

export async function up(knex: Knex): Promise<void> {
	const helper = getHelpers(knex).schema;

	await knex.schema.alterTable('directus_settings', (table) => {
		table.string('default_language').notNullable().defaultTo('en-US');
	});

	await helper.changeToString('directus_users', 'language', {
		nullable: true,
		default: null,
		length: 255,
	});
}

export async function down(knex: Knex): Promise<void> {
	const helper = getHelpers(knex).schema;

	await knex.schema.alterTable('directus_settings', (table) => {
		table.dropColumn('default_language');
	});

	await helper.changeToString('directus_users', 'language', {
		nullable: true,
		default: 'en-US',
		length: 255,
	});
}
