import { defineDisplay } from '@directus/shared/utils';
import DisplayJsonValue from './formatted-json-value.vue';

export default defineDisplay({
	id: 'formatted-json-value',
	name: '$t:displays.formatted-json-value.formatted-json-value',
	description: '$t:displays.formatted-json-value.description',
	types: ['json', 'geometry'],
	icon: 'settings_ethernet',
	component: DisplayJsonValue,
	options: [
		{
			field: 'format',
			name: '$t:display_template',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'input',
				options: {
					placeholder: '{{ field }}',
				},
			},
		},
	],
});
