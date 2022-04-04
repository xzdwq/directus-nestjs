import { ForbiddenException, UnprocessableEntityException } from '../exceptions';
import { AbstractServiceOptions, MutationOptions, PrimaryKey, Alterations, Item } from '../types';
import { Query } from '@directus/shared/types';
import { ItemsService } from './items';
import { PermissionsService } from './permissions';
import { PresetsService } from './presets';
import { UsersService } from './users';

export class RolesService extends ItemsService {
	constructor(options: AbstractServiceOptions) {
		super('directus_roles', options);
	}

	private async checkForOtherAdminRoles(excludeKeys: PrimaryKey[]): Promise<void> {
		// Make sure there's at least one admin role left after this deletion is done
		const otherAdminRoles = await this.knex
			.count('*', { as: 'count' })
			.from('directus_roles')
			.whereNotIn('id', excludeKeys)
			.andWhere({ admin_access: true })
			.first();

		const otherAdminRolesCount = +(otherAdminRoles?.count || 0);
		if (otherAdminRolesCount === 0) throw new UnprocessableEntityException(`You can't delete the last admin role.`);
	}

	private async checkForOtherAdminUsers(key: PrimaryKey, users: Alterations | Item[]): Promise<void> {
		const role = await this.knex.select('admin_access').from('directus_roles').where('id', '=', key).first();

		if (!role) throw new ForbiddenException();

		// The users that will now be in this new non-admin role
		let userKeys: PrimaryKey[] = [];

		if (Array.isArray(users)) {
			userKeys = users.map((user) => (typeof user === 'string' ? user : user.id)).filter((id) => id);
		} else {
			userKeys = users.update.map((user) => user.id).filter((id) => id);
		}

		const usersThatWereInRoleBefore = (await this.knex.select('id').from('directus_users').where('role', '=', key)).map(
			(user) => user.id
		);
		const usersThatAreRemoved = usersThatWereInRoleBefore.filter((id) => userKeys.includes(id) === false);

		const usersThatAreAdded = Array.isArray(users) ? users : users.create;

		// If the role the users are moved to is an admin-role, and there's at least 1 (new) admin
		// user, we don't have to check for other admin
		// users
		if ((role.admin_access === true || role.admin_access === 1) && usersThatAreAdded.length > 0) return;

		const otherAdminUsers = await this.knex
			.count('*', { as: 'count' })
			.from('directus_users')
			.whereNotIn('directus_users.id', [...userKeys, ...usersThatAreRemoved])
			.andWhere({ 'directus_roles.admin_access': true })
			.leftJoin('directus_roles', 'directus_users.role', 'directus_roles.id')
			.first();

		const otherAdminUsersCount = +(otherAdminUsers?.count || 0);

		if (otherAdminUsersCount === 0) {
			throw new UnprocessableEntityException(`You can't remove the last admin user from the admin role.`);
		}

		return;
	}

	async updateOne(key: PrimaryKey, data: Record<string, any>, opts?: MutationOptions): Promise<PrimaryKey> {
		if ('admin_access' in data && data.admin_access === false) {
			await this.checkForOtherAdminRoles([key]);
		}

		if ('users' in data) {
			await this.checkForOtherAdminUsers(key, data.users);
		}

		return super.updateOne(key, data, opts);
	}

	async updateMany(keys: PrimaryKey[], data: Record<string, any>, opts?: MutationOptions): Promise<PrimaryKey[]> {
		if ('admin_access' in data && data.admin_access === false) {
			await this.checkForOtherAdminRoles(keys);
		}

		return super.updateMany(keys, data, opts);
	}

	async deleteOne(key: PrimaryKey): Promise<PrimaryKey> {
		await this.deleteMany([key]);
		return key;
	}

	async deleteMany(keys: PrimaryKey[]): Promise<PrimaryKey[]> {
		await this.checkForOtherAdminRoles(keys);

		await this.knex.transaction(async (trx) => {
			const itemsService = new ItemsService('directus_roles', {
				knex: trx,
				accountability: this.accountability,
				schema: this.schema,
			});

			const permissionsService = new PermissionsService({
				knex: trx,
				accountability: this.accountability,
				schema: this.schema,
			});

			const presetsService = new PresetsService({
				knex: trx,
				accountability: this.accountability,
				schema: this.schema,
			});

			const usersService = new UsersService({
				knex: trx,
				accountability: this.accountability,
				schema: this.schema,
			});

			// Delete permissions/presets for this role, suspend all remaining users in role

			await permissionsService.deleteByQuery({
				filter: { role: { _in: keys } },
			});

			await presetsService.deleteByQuery({
				filter: { role: { _in: keys } },
			});

			await usersService.updateByQuery(
				{
					filter: { role: { _in: keys } },
				},
				{
					status: 'suspended',
					role: null,
				}
			);

			await itemsService.deleteMany(keys);
		});

		return keys;
	}

	deleteByQuery(query: Query, opts?: MutationOptions): Promise<PrimaryKey[]> {
		return super.deleteByQuery(query, opts);
	}
}
