module.exports = {
	corePlugins: {
		preflight: false,
	},
	content: ['./index.html', './public/index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
	theme: {
		extend: {
			gridTemplateColumns: {
				'6-fix': '30px 30% 13% 19% 30% 40px',
				acc: '40px 20% 30px 1fr 1fr 40px minmax(24%, 1fr) 40px',
			},
			minWidth: {
				0: '0',
				'1/4': '25%',
				'1/2': '50%',
				'3/4': '75%',
				full: '100%',
				14: '3.5rem',
				28: '6rem',
				48: '12rem',
			},
			maxWidth: {
				14: '3.5rem',
				'11/12': '97%',
			},
			maxHeight: {
				'11/12': '97%',
			},
			fontFamily: {
				material: ['Material Icons Outline'],
			},
		},
		container: {
			screens: {},
		},
	},
	plugins: [],
};
