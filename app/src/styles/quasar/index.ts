import install from 'quasar/src/install-quasar';
import Dark from 'quasar/src/plugins/Dark';
import ClosePopup from 'quasar/src/directives/ClosePopup';
import QBtn from 'quasar/src/components/btn/QBtn';
import iconSet from 'quasar/icon-set/svg-material-icons-outlined';
import '@quasar/extras/roboto-font/roboto-font.css';
import '@quasar/extras/material-icons/material-icons.css';

// import 'quasar/src/css/index.sass';
/**
 * Override quasar style
 * src/css/core/size.sass - fix display block
 * src/css/core/visibility.sass - fix button disabled
 */
import './override/src/css/index.sass';

import './quasar-cmp/main.scss';
import './colors.scss';

const createQuasar = (options: any): any => {
	return {
		components: {
			QBtn,
		},
		directives: {
			ClosePopup,
		},
		plugins: {
			Dark,
		},
		...options,
		install,
	};
};

export const quasar = createQuasar({
	iconSet,
});
