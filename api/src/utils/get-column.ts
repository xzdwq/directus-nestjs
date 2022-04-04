import { REGEX_BETWEEN_PARENS } from '@directus/shared/constants';
import { FieldFunction, SchemaOverview } from '@directus/shared/types';
import { getFunctionsForType } from '@directus/shared/utils';
import { Knex } from 'knex';
import { getFunctions } from '../database/helpers';
import { InvalidQueryException } from '../exceptions';
import { applyFunctionToColumnName } from './apply-function-to-column-name';

/**
 * Return column prefixed by table. If column includes functions (like `year(date_created)`), the
 * column is replaced with the appropriate SQL
 *
 * @param knex Current knex / transaction instance
 * @param table Collection or alias in which column resides
 * @param column name of the column
 * @param alias Whether or not to add a SQL AS statement
 * @returns Knex raw instance
 */
export function getColumn(
	knex: Knex,
	table: string,
	column: string,
	alias: string | false = applyFunctionToColumnName(column),
	schema: SchemaOverview
): Knex.Raw {
	const fn = getFunctions(knex, schema);

	if (column.includes('(') && column.includes(')')) {
		const functionName = column.split('(')[0] as FieldFunction;
		const columnName = column.match(REGEX_BETWEEN_PARENS)![1];

		if (functionName in fn) {
			const type = schema?.collections[table]?.fields?.[columnName]?.type ?? 'unknown';
			const allowedFunctions = getFunctionsForType(type);

			if (allowedFunctions.includes(functionName) === false) {
				throw new InvalidQueryException(`Invalid function specified "${functionName}"`);
			}

			const result = fn[functionName as keyof typeof fn](table, columnName) as Knex.Raw;

			if (alias) {
				return knex.raw(result + ' AS ??', [alias]);
			}

			return result;
		} else {
			throw new InvalidQueryException(`Invalid function specified "${functionName}"`);
		}
	}

	if (alias && column !== alias) {
		return knex.ref(`${table}.${column}`).as(alias);
	}

	return knex.ref(`${table}.${column}`);
}
