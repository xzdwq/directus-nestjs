import { BaseException } from '@directus/shared/exceptions';

export class GraphQLValidationException extends BaseException {
	constructor(extensions: Record<string, any>) {
		super('GraphQL validation error.', 400, 'GRAPHQL_VALIDATION_EXCEPTION', extensions);
	}
}
