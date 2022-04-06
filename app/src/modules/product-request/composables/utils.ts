import { createToast, ToastType } from 'mosha-vue-toastify';
import 'mosha-vue-toastify/dist/style.css';

export default {
	date_format_ru: 'DD.MM.YYYY' as string,
	statusSerialize: (baseArray: any, cardStatus: any): Promise<any> => {
		const status = new Promise((res) => {
			const newStatusArray: any = [];
			baseArray.forEach((i: any) => {
				if (cardStatus.code === 'new') {
					if (i.code === 'completed_successfully') i.disable = true;
					if (i.code === 'partially_completed') i.disable = true;
					if (i.code === 'returned_revision_mvp2') i.disable = true;
				}
				if (cardStatus.code === 'performed') {
					if (i.code === 'returned_revision_mvp2') i.disable = true;
				}
				if (cardStatus.code === 'pending') {
					if (i.code === 'returned_revision_mvp2') i.disable = true;
				}
				if (cardStatus.code === 'completed_successfully') {
					if (i.code === 'new') i.disable = true;
					if (i.code === 'performed') i.disable = true;
					if (i.code === 'pending') i.disable = true;
					if (i.code === 'partially_completed') i.disable = true;
					if (i.code === 'canceled') i.disable = true;
				}
				if (cardStatus.code === 'partially_completed') {
					if (i.code === 'new') i.disable = true;
					if (i.code === 'performed') i.disable = true;
					if (i.code === 'pending') i.disable = true;
					if (i.code === 'completed_successfully') i.disable = true;
					if (i.code === 'canceled') i.disable = true;
				}
				if (cardStatus.code === 'canceled') {
					if (i.code === 'new') i.disable = true;
					if (i.code === 'performed') i.disable = true;
					if (i.code === 'pending') i.disable = true;
					if (i.code === 'completed_successfully') i.disable = true;
					if (i.code === 'partially_completed') i.disable = true;
				}
				if (cardStatus.code === 'returned_revision_mvp2') {
					if (i.code === 'new') i.disable = true;
					if (i.code === 'performed') i.disable = true;
					if (i.code === 'pending') i.disable = true;
				}
				newStatusArray.push(i);
			});
			res(newStatusArray);
		});
		return status;
	},
	onToast: (type: ToastType, title: string, description = '') => {
		createToast(
			{
				title: title,
				description: description,
			},
			{
				showCloseButton: false,
				swipeClose: true,
				hideProgressBar: true,
				position: 'bottom-left',
				type: type,
				showIcon: true,
				transition: 'bounce',
				timeout: 3500,
			}
		);
	},
};
