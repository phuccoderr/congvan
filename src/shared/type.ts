import { type DepartmentFormValues } from '../renderer/src/schemas/department'
import { type DocumentTypeFormValues } from '../renderer/src/schemas/document-type'
import { type UrgencyLevelsFormValues } from '../renderer/src/schemas/urgency-levels'
import { type ConfidentialityLevelsFormValues } from '../renderer/src/schemas/confidentiality-levels'
import { type DeliveryMethodsFormValues } from '../renderer/src/schemas/delivery-methods'
import { type PeopleFormValues } from '../renderer/src/schemas/people'
import { type PartnersFormValues } from '../renderer/src/schemas/partners'
import { type IncomingDocumentsFormValues } from '../renderer/src/schemas/incoming-documents'
import { type OutgoingDocumentsFormValues } from '../renderer/src/schemas/outgoing-documents'
import { type DocumentAssignmentsFormValues } from '../renderer/src/schemas/document-assignments'

export interface DepartmentData extends DepartmentFormValues {
  id?: number
  created_at?: string
  delete_at?: string | null
}

export interface DocumentTypeData extends DocumentTypeFormValues {
  id?: number
  created_at?: string
  delete_at?: string | null
}

export interface UrgencyLevelsData extends UrgencyLevelsFormValues {
  id?: number
  created_at?: string
  deleted_at?: string | null
}

export interface ConfidentialityLevelsData extends ConfidentialityLevelsFormValues {
  id?: number
  created_at?: string
  deleted_at?: string | null
}

export interface DeliveryMethodsData extends DeliveryMethodsFormValues {
  id?: number
  created_at?: string
  deleted_at?: string | null
}

export interface PeopleData extends Omit<PeopleFormValues, 'is_signer' | 'is_active'> {
  id?: number
  is_signer: boolean | number
  is_active: boolean | number
  created_at?: string
  deleted_at?: string | null
}

export interface PartnersData extends PartnersFormValues {
  id?: number
  created_at?: string
  deleted_at?: string | null
}

export interface IncomingDocumentsData extends IncomingDocumentsFormValues {
  id?: number
  created_at?: string
}

export interface OutgoingDocumentsData extends OutgoingDocumentsFormValues {
  id?: number
  created_at?: string
}

export interface DocumentAssignmentsData extends DocumentAssignmentsFormValues {
  id?: number
  incoming_so_den?: number
  incoming_nam?: number
  incoming_trich_yeu?: string
  person_ho_ten?: string
}
