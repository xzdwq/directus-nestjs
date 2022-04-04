import { GeometryHelper } from '../types';
import { Knex } from 'knex';

export class GeometryHelperSQLite extends GeometryHelper {
	async supported() {
		const res = await this.knex.select('name').from('pragma_function_list').where({ name: 'spatialite_version' });
		return res.length > 0;
	}
	asGeoJSON(table: string, column: string): Knex.Raw {
		return this.knex.raw('asgeojson(??.??) as ??', [table, column, column]);
	}
}
