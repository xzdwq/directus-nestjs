// req
import { ConditionLinkEntity } from '@src/orm/entities/req/condition_link.entity';
import { ConditionTypeEntity } from '@src/orm/entities/req/condition_type.entity';
import { TaskTypeEntity } from '@src/orm/entities/req/task_type.entity';
import { ProductRequestEntity } from '@src/orm/entities/req/product_request.entity';
import { PriorityEntity } from '@src/orm/entities/req/priority.entity';
import { StatusTypeEntity } from '@src/orm/entities/req/status_type.entity';
import { StatusLinkEntity } from '@src/orm/entities/req/status_link.entity';
import { ProductListEntity } from '@src/orm/entities/req/product_list.entity';
import { ProductRequestSelectedEntity } from '@src/orm/entities/req/product_request_selected.entity';
// pim
import { ProductAnalogListEntity } from '@src/orm/entities/pim/product_analog_list.entity';
import { NormativeDocEntity } from '@src/orm/entities/pim/normative_doc.entity';
import { PgEntity } from '@src/orm/entities/pim/pg.entity';
import { ClassifierTypeEntity } from '@src/orm/entities/pim/classifier_type.entity';
import { ClassifierEntity } from '@src/orm/entities/pim/classifier.entity';
import { PgContractorEntity } from '@src/orm/entities/pim/pg_contractor.entity';
import { ProductEntity } from '@src/orm/entities/pim/product.entity';
import { CodeTypeEntity } from '@src/orm/entities/pim/code_type.entity';
import { WarehouseControlCategoryEntity } from '@src/orm/entities/pim/warehouse_control_category.entity';
// hrm
import { EmployeeEntity } from '@src/orm/entities/hrm/employee.entity';
import { PersonEntity } from '@src/orm/entities/hrm/person.entity';
import { UnitPositionEntity } from '@src/orm/entities/hrm/unit_position.entity';
import { PositionEntity } from '@src/orm/entities/hrm/position.entity';
import { EmployeeRolesEntity } from '@src/orm/entities/hrm/employee_roles.entity';
import { RolesEntity } from '@src/orm/entities/hrm/roles.entity';
// contr
import { TrademarkEntity } from '@src/orm/entities/contr/trademark.entity';
import { ContractorEntity } from '@src/orm/entities/contr/contractor.entity';
import { SortamentEntity } from '@src/orm/entities/pim/sortament.entity';
// public
import { UomEntity } from '@src/orm/entities/public/uom.entity';
import { UomGroupEntity } from '@src/orm/entities/public/uom_group.entity';

export const entities = [
	ConditionLinkEntity,
	ConditionTypeEntity,
	TaskTypeEntity,
	ProductRequestEntity,
	StatusLinkEntity,
	ProductListEntity,
	ProductRequestSelectedEntity,
	StatusTypeEntity,
	PriorityEntity,
	EmployeeEntity,
	PersonEntity,
	UnitPositionEntity,
	PositionEntity,
	ProductAnalogListEntity,
	TrademarkEntity,
	ContractorEntity,
	SortamentEntity,
	NormativeDocEntity,
	PgEntity,
	UomEntity,
	UomGroupEntity,
	ClassifierTypeEntity,
	ClassifierEntity,
	PgContractorEntity,
	EmployeeRolesEntity,
	RolesEntity,
	ProductEntity,
	CodeTypeEntity,
	WarehouseControlCategoryEntity,
];

export {
	ConditionLinkEntity,
	ConditionTypeEntity,
	TaskTypeEntity,
	ProductRequestEntity,
	StatusLinkEntity,
	ProductListEntity,
	ProductRequestSelectedEntity,
	StatusTypeEntity,
	PriorityEntity,
	EmployeeEntity,
	PersonEntity,
	UnitPositionEntity,
	PositionEntity,
	ProductAnalogListEntity,
	TrademarkEntity,
	ContractorEntity,
	SortamentEntity,
	NormativeDocEntity,
	PgEntity,
	UomEntity,
	UomGroupEntity,
	ClassifierTypeEntity,
	ClassifierEntity,
	PgContractorEntity,
	EmployeeRolesEntity,
	RolesEntity,
	ProductEntity,
	CodeTypeEntity,
	WarehouseControlCategoryEntity,
};
