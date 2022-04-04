import axios from 'axios';
import getDatabase from './database';
import emitter from './emitter';
import logger from './logger';
import { Webhook, WebhookHeader } from './types';
import { WebhooksService } from './services';
import { getSchema } from './utils/get-schema';
import { ActionHandler } from '@directus/shared/types';

let registered: { event: string; handler: ActionHandler }[] = [];

export async function register(): Promise<void> {
	unregister();

	const webhookService = new WebhooksService({ knex: getDatabase(), schema: await getSchema() });

	const webhooks = await webhookService.readByQuery({ filter: { status: { _eq: 'active' } } });
	for (const webhook of webhooks) {
		for (const action of webhook.actions) {
			const event = `items.${action}`;
			const handler = createHandler(webhook, event);
			emitter.onAction(event, handler);
			registered.push({ event, handler });
		}
	}
}

export function unregister(): void {
	for (const { event, handler } of registered) {
		emitter.offAction(event, handler);
	}

	registered = [];
}

function createHandler(webhook: Webhook, event: string): ActionHandler {
	return async (meta, context) => {
		if (webhook.collections.includes(meta.collection) === false) return;

		const webhookPayload = {
			event,
			accountability: context.accountability
				? {
						user: context.accountability.user,
						role: context.accountability.role,
				  }
				: null,
			...meta,
		};

		try {
			await axios({
				url: webhook.url,
				method: webhook.method,
				data: webhook.data ? webhookPayload : null,
				headers: mergeHeaders(webhook.headers),
			});
		} catch (error: any) {
			logger.warn(`Webhook "${webhook.name}" (id: ${webhook.id}) failed`);
			logger.warn(error);
		}
	};
}

function mergeHeaders(headerArray: WebhookHeader[]) {
	const headers: Record<string, string> = {};

	for (const { header, value } of headerArray ?? []) {
		headers[header] = value;
	}

	return headers;
}
