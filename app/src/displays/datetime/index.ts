import { defineDisplay } from '@directus/shared/utils';
import DisplayDateTime from './datetime.vue';

export default defineDisplay({
	id: 'datetime',
	name: '$t:displays.datetime.datetime',
	description: '$t:displays.datetime.description',
	icon: 'query_builder',
	component: DisplayDateTime,
	options: [
		{
			field: 'format',
			name: '$t:displays.datetime.format',
			type: 'string',
			meta: {
				interface: 'select-dropdown',
				width: 'half',
				options: {
					choices: [
						{ text: '$t:displays.datetime.long', value: 'long' },
						{ text: '$t:displays.datetime.short', value: 'short' },
					],
					allowOther: true,
				},
				note: '$t:displays.datetime.format_note',
			},
			schema: {
				default_value: 'long',
			},
		},
		{
			field: 'relative',
			name: '$t:displays.datetime.relative',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
				options: {
					label: '$t:displays.datetime.relative_label',
				},
			},
			schema: {
				default_value: false,
			},
		},
	],
	types: ['dateTime', 'date', 'time', 'timestamp'],
});
