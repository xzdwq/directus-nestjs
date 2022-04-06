/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrdersTestData1639553582937 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		// Роль "Управление заявками"
		// await queryRunner.query(`
		//   INSERT INTO hrm.role ("name") VALUES ('Order management')
		// `);
		// Первичная миграция
		await queryRunner.query(`
			-- Тип заявки
			INSERT INTO req.task_type ("name", "code") VALUES
				('Продукт', 'product');

			-- Состояние заявки (перечень для всех типов заявок)
			INSERT INTO req.condition_type ("name", "code") VALUES
				('Активная', 'active'),
				('Архивная', 'archive');

			-- Статус заявки (перечень для всех типов заявок)
			INSERT INTO req.status_type  ("name", "code") VALUES
				('Новая', 'new'),
				('Исполняется', 'performed'),
				('В ожидании', 'pending'),
				('Завершена успешно', 'completed_successfully'),
				('Завершена частично', 'partially_completed'),
				('Отменена', 'canceled'),
				('Возвращена на доработку (в mvp2)', 'returned_revision_mvp2');

			-- Состояние заявки (для конкретного типа) PS: Какие состояния заявки доступны для конкретного типа
			INSERT INTO req.condition_link ("condition_type_id", "task_type_id") VALUES
				(
					(SELECT id FROM req.condition_type WHERE code = 'active'),
					(SELECT id FROM req.task_type WHERE code = 'product')
				),
				(
					(SELECT id FROM req.condition_type WHERE code = 'archive'),
					(SELECT id FROM req.task_type WHERE code = 'product')
				);

			-- Статус заявки (для конкретного типа) PS: Какие статусы заявки доступны для конкретного типа
			INSERT INTO req.status_link ("status_type_id", "task_type_id") VALUES
				(
					(SELECT id FROM req.status_type WHERE code = 'new'),
					(SELECT id FROM req.task_type WHERE code = 'product')
				),
				(
					(SELECT id FROM req.status_type WHERE code = 'performed'),
					(SELECT id FROM req.task_type WHERE code = 'product')
				),
				(
					(SELECT id FROM req.status_type WHERE code = 'pending'),
					(SELECT id FROM req.task_type WHERE code = 'product')
				),
				(
					(SELECT id FROM req.status_type WHERE code = 'completed_successfully'),
					(SELECT id FROM req.task_type WHERE code = 'product')
				),
				(
					(SELECT id FROM req.status_type WHERE code = 'partially_completed'),
					(SELECT id FROM req.task_type WHERE code = 'product')
				),
				(
					(SELECT id FROM req.status_type WHERE code = 'canceled'),
					(SELECT id FROM req.task_type WHERE code = 'product')
				),
				(
					(SELECT id FROM req.status_type WHERE code = 'returned_revision_mvp2'),
					(SELECT id FROM req.task_type WHERE code = 'product')
				);

			-- Приоритет заявки
			INSERT INTO req.priority ("name", "weight", "code") VALUES
				('Низкий', 10, 'low'),
				('Средний', 20, 'middle'),
				('Высокий', 30, 'high');

			-- Заявки (тестовый набор данных)
			INSERT INTO req.product_request ("status_link_id", "priority_id", "theme", "initiator_id", "executor_id", "condition_link_id") VALUES
				(
					(
						SELECT sl.id AS status_link_id
						FROM req.status_link sl
						LEFT JOIN req.status_type st ON sl.status_type_id = st.id
						LEFT JOIN req.task_type tt ON sl.task_type_id = tt.id
						WHERE st.code = 'new' AND tt.code = 'product'
					),
					(SELECT id AS priority_id FROM req.priority WHERE code = 'low'),
					('СМ: CRM: 1'),
					(
						SELECT p.id initiator_id FROM hrm.employee e
						LEFT JOIN hrm.person p ON e.person_id = p.id
						WHERE e.domain_name = 'lomovkr'
					),
					(
						SELECT p.id executor_id FROM hrm.employee e
						LEFT JOIN hrm.person p ON e.person_id = p.id
						WHERE e.domain_name = 'fetisni'
					),
					(
						SELECT cl.id AS condition_link_id
						FROM req.condition_link cl
						LEFT JOIN req.condition_type ct ON cl.condition_type_id = ct.id
						LEFT JOIN req.task_type tt ON cl.task_type_id = tt.id
						WHERE ct.code = 'active' AND tt.code = 'product'
					)
				),
				(
					(
						SELECT sl.id AS status_link_id
						FROM req.status_link sl
						LEFT JOIN req.status_type st ON sl.status_type_id = st.id
						LEFT JOIN req.task_type tt ON sl.task_type_id = tt.id
						WHERE st.code = 'performed' AND tt.code = 'product'
					),
					(SELECT id AS priority_id FROM req.priority WHERE code = 'middle'),
					('СМ: CRM: 2'),
					(
						SELECT p.id initiator_id FROM hrm.employee e
						LEFT JOIN hrm.person p ON e.person_id = p.id
						WHERE e.domain_name = 'khromro'
					),
					(
						SELECT p.id executor_id FROM hrm.employee e
						LEFT JOIN hrm.person p ON e.person_id = p.id
						WHERE e.domain_name = 'nurmagnu'
					),
					(
						SELECT cl.id AS condition_link_id
						FROM req.condition_link cl
						LEFT JOIN req.condition_type ct ON cl.condition_type_id = ct.id
						LEFT JOIN req.task_type tt ON cl.task_type_id = tt.id
						WHERE ct.code = 'active' AND tt.code = 'product'
					)
				),
				(
					(
						SELECT sl.id AS status_link_id
						FROM req.status_link sl
						LEFT JOIN req.status_type st ON sl.status_type_id = st.id
						LEFT JOIN req.task_type tt ON sl.task_type_id = tt.id
						WHERE st.code = 'new' AND tt.code = 'product'
					),
					(SELECT id AS priority_id FROM req.priority WHERE code = 'high'),
					('СМ: CRM: 3'),
					(
						SELECT p.id initiator_id FROM hrm.employee e
						LEFT JOIN hrm.person p ON e.person_id = p.id
						WHERE e.domain_name = 'grinemi'
					),
					(
						SELECT p.id executor_id FROM hrm.employee e
						LEFT JOIN hrm.person p ON e.person_id = p.id
						WHERE e.domain_name = 'smirniv'
					),
					(
						SELECT cl.id AS condition_link_id
						FROM req.condition_link cl
						LEFT JOIN req.condition_type ct ON cl.condition_type_id = ct.id
						LEFT JOIN req.task_type tt ON cl.task_type_id = tt.id
						WHERE ct.code = 'active' AND tt.code = 'product'
					)
				),
				(
					(
						SELECT sl.id AS status_link_id
						FROM req.status_link sl
						LEFT JOIN req.status_type st ON sl.status_type_id = st.id
						LEFT JOIN req.task_type tt ON sl.task_type_id = tt.id
						WHERE st.code = 'performed' AND tt.code = 'product'
					),
					(SELECT id AS priority_id FROM req.priority WHERE code = 'high'),
					('СМ: CRM: 4'),
					(
						SELECT p.id initiator_id FROM hrm.employee e
						LEFT JOIN hrm.person p ON e.person_id = p.id
						WHERE e.domain_name = 'asteran'
					),
					(
						SELECT p.id executor_id FROM hrm.employee e
						LEFT JOIN hrm.person p ON e.person_id = p.id
						WHERE e.domain_name = 'smirniv'
					),
					(
						SELECT cl.id AS condition_link_id
						FROM req.condition_link cl
						LEFT JOIN req.condition_type ct ON cl.condition_type_id = ct.id
						LEFT JOIN req.task_type tt ON cl.task_type_id = tt.id
						WHERE ct.code = 'active' AND tt.code = 'product'
					)
				),
				(
					(
						SELECT sl.id AS status_link_id
						FROM req.status_link sl
						LEFT JOIN req.status_type st ON sl.status_type_id = st.id
						LEFT JOIN req.task_type tt ON sl.task_type_id = tt.id
						WHERE st.code = 'new' AND tt.code = 'product'
					),
					(SELECT id AS priority_id FROM req.priority WHERE code = 'high'),
					('СМ: CRM: 5'),
					(
						SELECT p.id initiator_id FROM hrm.employee e
						LEFT JOIN hrm.person p ON e.person_id = p.id
						WHERE e.domain_name = 'guschial'
					),
					(NULL),
					(
						SELECT cl.id AS condition_link_id
						FROM req.condition_link cl
						LEFT JOIN req.condition_type ct ON cl.condition_type_id = ct.id
						LEFT JOIN req.task_type tt ON cl.task_type_id = tt.id
						WHERE ct.code = 'active' AND tt.code = 'product'
					)
				),
				(
					(
						SELECT sl.id AS status_link_id
						FROM req.status_link sl
						LEFT JOIN req.status_type st ON sl.status_type_id = st.id
						LEFT JOIN req.task_type tt ON sl.task_type_id = tt.id
						WHERE st.code = 'completed_successfully' AND tt.code = 'product'
					),
					(SELECT id AS priority_id FROM req.priority WHERE code = 'high'),
					('СМ: CRM: 6'),
					(
						SELECT p.id initiator_id FROM hrm.employee e
						LEFT JOIN hrm.person p ON e.person_id = p.id
						WHERE e.domain_name = 'polyaks'
					),
					(
						SELECT p.id executor_id FROM hrm.employee e
						LEFT JOIN hrm.person p ON e.person_id = p.id
						WHERE e.domain_name = 'smirniv'
					),
					(
						SELECT cl.id AS condition_link_id
						FROM req.condition_link cl
						LEFT JOIN req.condition_type ct ON cl.condition_type_id = ct.id
						LEFT JOIN req.task_type tt ON cl.task_type_id = tt.id
						WHERE ct.code = 'archive' AND tt.code = 'product'
					)
				),
				(
					(
						SELECT sl.id AS status_link_id
						FROM req.status_link sl
						LEFT JOIN req.status_type st ON sl.status_type_id = st.id
						LEFT JOIN req.task_type tt ON sl.task_type_id = tt.id
						WHERE st.code = 'partially_completed' AND tt.code = 'product'
					),
					(SELECT id AS priority_id FROM req.priority WHERE code = 'middle'),
					('СМ: CRM: 7'),
					(
						SELECT p.id initiator_id FROM hrm.employee e
						LEFT JOIN hrm.person p ON e.person_id = p.id
						WHERE e.domain_name = 'polyaks'
					),
					(
						SELECT p.id executor_id FROM hrm.employee e
						LEFT JOIN hrm.person p ON e.person_id = p.id
						WHERE e.domain_name = 'smirniv'
					),
					(
						SELECT cl.id AS condition_link_id
						FROM req.condition_link cl
						LEFT JOIN req.condition_type ct ON cl.condition_type_id = ct.id
						LEFT JOIN req.task_type tt ON cl.task_type_id = tt.id
						WHERE ct.code = 'archive' AND tt.code = 'product'
					)
				),
				(
					(
						SELECT sl.id AS status_link_id
						FROM req.status_link sl
						LEFT JOIN req.status_type st ON sl.status_type_id = st.id
						LEFT JOIN req.task_type tt ON sl.task_type_id = tt.id
						WHERE st.code = 'canceled' AND tt.code = 'product'
					),
					(SELECT id AS priority_id FROM req.priority WHERE code = 'middle'),
					('СМ: CRM: 8'),
					(
						SELECT p.id initiator_id FROM hrm.employee e
						LEFT JOIN hrm.person p ON e.person_id = p.id
						WHERE e.domain_name = 'yukhnoar'
					),
					(
						SELECT p.id executor_id FROM hrm.employee e
						LEFT JOIN hrm.person p ON e.person_id = p.id
						WHERE e.domain_name = 'smirniv'
					),
					(
						SELECT cl.id AS condition_link_id
						FROM req.condition_link cl
						LEFT JOIN req.condition_type ct ON cl.condition_type_id = ct.id
						LEFT JOIN req.task_type tt ON cl.task_type_id = tt.id
						WHERE ct.code = 'archive' AND tt.code = 'product'
					)
				);

			-- Продукты в составе заявки
			INSERT INTO req.product_list ("name", "article", "quantity", "unit", "product_group", "request_id") VALUES
				(
					('Предохранитель плавкий'),
					('1904529904'),
					(125),
					('Штука'),
					('pg_id'),
					(SELECT id AS request_id FROM req.product_request WHERE theme = 'СМ: CRM: 1' LIMIT 1)
				),
				(
					('DIN 127 B Шайба пружинная Гровер M16 Цинк'),
					('707301405250'),
					(500),
					('Штука'),
					('pg_id'),
					(SELECT id AS request_id FROM req.product_request WHERE theme = 'СМ: CRM: 1' LIMIT 1)
				),
				(
					('Уплотнитель кабельных проходов УКПт-140/42'),
					('7030000879'),
					(23),
					('Метр'),
					('pg_id'),
					(SELECT id AS request_id FROM req.product_request WHERE theme = 'СМ: CRM: 1' LIMIT 1)
				),
				(
					('Кабельный ввод М 88х2 латунный УТ1,5 IP66/IP67/IP68 (d кабеля 65-70 мм)'),
					('5433RT11'),
					(55),
					('Метр'),
					('pg_id'),
					(SELECT id AS request_id FROM req.product_request WHERE theme = 'СМ: CRM: 2' LIMIT 1)
				),
				(
					('Насосная установка 17-107-560-001 Element'),
					('ERT34'),
					(1),
					('Штука'),
					('pg_id'),
					(SELECT id AS request_id FROM req.product_request WHERE theme = 'СМ: CRM: 3' LIMIT 1)
				),
				(
					('Шланг в сборе SN940921 SEVER MINERALS SEVER'),
					('SN443344'),
					(1),
					('Метр'),
					('pg_id'),
					(SELECT id AS request_id FROM req.product_request WHERE theme = 'СМ: CRM: 4' LIMIT 1)
				),
				(
					('ВТУЛКА КОНИЧЕСКАЯ 4545X85'),
					('SN443344'),
					(1),
					('Штука'),
					('pg_id'),
					(SELECT id AS request_id FROM req.product_request WHERE theme = 'СМ: CRM: 5' LIMIT 1)
				);
		`);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	public async down(queryRunner: QueryRunner): Promise<void> {}
}
