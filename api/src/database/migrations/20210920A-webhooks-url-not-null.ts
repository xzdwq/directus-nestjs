import { Knex } from 'knex';
import { getHelpers } from '../helpers';

export async function up(knex: Knex): Promise<void> {
	const helper = getHelpers(knex).schema;

	if (helper.isOneOfClients(['oracle', 'cockroachdb'])) {
		// Oracle and Cockroach are already not nullable due to an oversight in
		// "20201105B-change-webhook-url-type.ts"
		return;
	}

	await helper.changeToText('directus_webhooks', 'url', {
		nullable: false,
	});
}

export async function down(knex: Knex): Promise<void> {
	const helper = getHelpers(knex).schema;

	if (helper.isOneOfClients(['oracle', 'cockroachdb'])) {
		// Oracle and Cockroach are already not nullable due to an oversight in
		// "20201105B-change-webhook-url-type.ts"
		return;
	}

	await helper.changeToText('directus_webhooks', 'url');
}
