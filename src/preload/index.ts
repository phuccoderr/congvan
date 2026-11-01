import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IPC_CHANNELS } from '../shared/constants'
import {
  ConfidentialityLevelsData,
  DeliveryMethodsData,
  DepartmentData,
  DocumentTypeData,
  PeopleData,
  PartnersData,
  UrgencyLevelsData,
  IncomingDocumentsData,
  OutgoingDocumentsData,
  DocumentAssignmentsData,
  RequirementData
} from '../shared/type'

// Custom APIs for renderer
const api = {
  confidentialityLevels: {
    getAll: (params?: {
      page?: number
      limit?: number
      filters?: Array<{ field: string; value: string }>
    }) => ipcRenderer.invoke(IPC_CHANNELS.CONFIDENTIALITY_LEVELS.GET_ALL, params),

    getOne: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.CONFIDENTIALITY_LEVELS.GET_ONE, id),

    create: (data: Omit<ConfidentialityLevelsData, 'id' | 'created_at' | 'deleted_at'>) =>
      ipcRenderer.invoke(IPC_CHANNELS.CONFIDENTIALITY_LEVELS.CREATE, data),

    update: (
      id: number,
      data: Partial<Omit<ConfidentialityLevelsData, 'id' | 'created_at' | 'deleted_at'>>
    ) => ipcRenderer.invoke(IPC_CHANNELS.CONFIDENTIALITY_LEVELS.UPDATE, { id, data }),

    deleteOne: (id: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.CONFIDENTIALITY_LEVELS.DELETE_ONE, id),

    deleteMany: (ids: number[]) =>
      ipcRenderer.invoke(IPC_CHANNELS.CONFIDENTIALITY_LEVELS.DELETE_MANY, ids)
  },
  deliveryMethods: {
    getAll: (params?: {
      page?: number
      limit?: number
      filters?: Array<{ field: string; value: string }>
    }) => ipcRenderer.invoke(IPC_CHANNELS.DELIVERY_METHODS.GET_ALL, params),

    getOne: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.DELIVERY_METHODS.GET_ONE, id),

    create: (data: Omit<DeliveryMethodsData, 'id' | 'created_at' | 'deleted_at'>) =>
      ipcRenderer.invoke(IPC_CHANNELS.DELIVERY_METHODS.CREATE, data),

    update: (
      id: number,
      data: Partial<Omit<DeliveryMethodsData, 'id' | 'created_at' | 'deleted_at'>>
    ) => ipcRenderer.invoke(IPC_CHANNELS.DELIVERY_METHODS.UPDATE, { id, data }),

    deleteOne: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.DELIVERY_METHODS.DELETE_ONE, id),

    deleteMany: (ids: number[]) =>
      ipcRenderer.invoke(IPC_CHANNELS.DELIVERY_METHODS.DELETE_MANY, ids)
  },
  departments: {
    getAll: (params?: {
      page?: number
      limit?: number
      search?: string
      filters?: Array<{ field: string; value: string }>
    }) => ipcRenderer.invoke(IPC_CHANNELS.DEPARTMENTS.GET_ALL, params),

    getOne: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.DEPARTMENTS.GET_ONE, id),

    create: (data: Omit<DepartmentData, 'id' | 'created_at' | 'delete_at'>) =>
      ipcRenderer.invoke(IPC_CHANNELS.DEPARTMENTS.CREATE, data),

    update: (id: number, data: Partial<Omit<DepartmentData, 'id' | 'created_at' | 'delete_at'>>) =>
      ipcRenderer.invoke(IPC_CHANNELS.DEPARTMENTS.UPDATE, { id, data }),

    deleteOne: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.DEPARTMENTS.DELETE_ONE, id),

    deleteMany: (ids: number[]) => ipcRenderer.invoke(IPC_CHANNELS.DEPARTMENTS.DELETE_MANY, ids)
  },
  partners: {
    getAll: (params?: {
      page?: number
      limit?: number
      filters?: Array<{ field: string; value: string }>
    }) => ipcRenderer.invoke(IPC_CHANNELS.PARTNERS.GET_ALL, params),

    getOne: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.PARTNERS.GET_ONE, id),

    create: (data: Omit<PartnersData, 'id' | 'created_at' | 'deleted_at'>) =>
      ipcRenderer.invoke(IPC_CHANNELS.PARTNERS.CREATE, data),

    update: (id: number, data: Partial<Omit<PartnersData, 'id' | 'created_at' | 'deleted_at'>>) =>
      ipcRenderer.invoke(IPC_CHANNELS.PARTNERS.UPDATE, { id, data }),

    deleteOne: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.PARTNERS.DELETE_ONE, id),

    deleteMany: (ids: number[]) => ipcRenderer.invoke(IPC_CHANNELS.PARTNERS.DELETE_MANY, ids)
  },
  requirements: {
    getAll: (params?: {
      page?: number
      limit?: number
      filters?: Array<{ field: string; value: string }>
    }) => ipcRenderer.invoke(IPC_CHANNELS.REQUIREMENTS.GET_ALL, params),

    getOne: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.REQUIREMENTS.GET_ONE, id),

    create: (data: Omit<RequirementData, 'id' | 'created_at' | 'deleted_at'>) =>
      ipcRenderer.invoke(IPC_CHANNELS.REQUIREMENTS.CREATE, data),

    update: (
      id: number,
      data: Partial<Omit<RequirementData, 'id' | 'created_at' | 'deleted_at'>>
    ) => ipcRenderer.invoke(IPC_CHANNELS.REQUIREMENTS.UPDATE, { id, data }),

    deleteOne: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.REQUIREMENTS.DELETE_ONE, id),

    deleteMany: (ids: number[]) =>
      ipcRenderer.invoke(IPC_CHANNELS.REQUIREMENTS.DELETE_MANY, ids)
  },
  people: {
    getAll: (params?: {
      page?: number
      limit?: number
      filters?: Array<{ field: string; value: string }>
    }) => ipcRenderer.invoke(IPC_CHANNELS.PEOPLE.GET_ALL, params),

    getOne: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.PEOPLE.GET_ONE, id),

    create: (data: Omit<PeopleData, 'id' | 'created_at' | 'deleted_at'>) =>
      ipcRenderer.invoke(IPC_CHANNELS.PEOPLE.CREATE, data),

    update: (id: number, data: Partial<Omit<PeopleData, 'id' | 'created_at' | 'deleted_at'>>) =>
      ipcRenderer.invoke(IPC_CHANNELS.PEOPLE.UPDATE, { id, data }),

    deleteOne: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.PEOPLE.DELETE_ONE, id),

    deleteMany: (ids: number[]) => ipcRenderer.invoke(IPC_CHANNELS.PEOPLE.DELETE_MANY, ids)
  },
  documentTypes: {
    getAll: (params?: {
      page?: number
      limit?: number
      filters?: Array<{ field: string; value: string }>
    }) => ipcRenderer.invoke(IPC_CHANNELS.DOCUMENT_TYPES.GET_ALL, params),

    getOne: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.DOCUMENT_TYPES.GET_ONE, id),

    create: (data: Omit<DocumentTypeData, 'id' | 'created_at' | 'deleted_at'>) =>
      ipcRenderer.invoke(IPC_CHANNELS.DOCUMENT_TYPES.CREATE, data),

    update: (
      id: number,
      data: Partial<Omit<DocumentTypeData, 'id' | 'created_at' | 'deleted_at'>>
    ) => ipcRenderer.invoke(IPC_CHANNELS.DOCUMENT_TYPES.UPDATE, { id, data }),

    deleteOne: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.DOCUMENT_TYPES.DELETE_ONE, id),

    deleteMany: (ids: number[]) => ipcRenderer.invoke(IPC_CHANNELS.DOCUMENT_TYPES.DELETE_MANY, ids)
  },
  urgencyLevels: {
    getAll: (params?: {
      page?: number
      limit?: number
      filters?: Array<{ field: string; value: string }>
    }) => ipcRenderer.invoke(IPC_CHANNELS.URGENCY_LEVELS.GET_ALL, params),

    getOne: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.URGENCY_LEVELS.GET_ONE, id),

    create: (data: Omit<UrgencyLevelsData, 'id' | 'created_at' | 'deleted_at'>) =>
      ipcRenderer.invoke(IPC_CHANNELS.URGENCY_LEVELS.CREATE, data),

    update: (
      id: number,
      data: Partial<Omit<UrgencyLevelsData, 'id' | 'created_at' | 'deleted_at'>>
    ) => ipcRenderer.invoke(IPC_CHANNELS.URGENCY_LEVELS.UPDATE, { id, data }),

    deleteOne: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.URGENCY_LEVELS.DELETE_ONE, id),

    deleteMany: (ids: number[]) => ipcRenderer.invoke(IPC_CHANNELS.URGENCY_LEVELS.DELETE_MANY, ids)
  },
  incomingDocuments: {
    getAll: (params?: {
      page?: number
      limit?: number
      filters?: Array<{ field: string; value: string }>
    }) => ipcRenderer.invoke(IPC_CHANNELS.INCOMING_DOCUMENTS.GET_ALL, params),

    getOne: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.INCOMING_DOCUMENTS.GET_ONE, id),

    create: (
      data: Omit<IncomingDocumentsData, 'id' | 'created_at'>
    ) => ipcRenderer.invoke(IPC_CHANNELS.INCOMING_DOCUMENTS.CREATE, data),

    update: (
      id: number,
      data: Partial<Omit<IncomingDocumentsData, 'id' | 'created_at'>>
    ) => ipcRenderer.invoke(IPC_CHANNELS.INCOMING_DOCUMENTS.UPDATE, { id, data }),

    deleteOne: (id: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.INCOMING_DOCUMENTS.DELETE_ONE, id),

    deleteMany: (ids: number[]) =>
      ipcRenderer.invoke(IPC_CHANNELS.INCOMING_DOCUMENTS.DELETE_MANY, ids)
  },
  outgoingDocuments: {
    getAll: (params?: {
      page?: number
      limit?: number
      filters?: Array<{ field: string; value: string }>
    }) => ipcRenderer.invoke(IPC_CHANNELS.OUTGOING_DOCUMENTS.GET_ALL, params),

    getOne: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.OUTGOING_DOCUMENTS.GET_ONE, id),

    create: (data: Omit<OutgoingDocumentsData, 'id' | 'created_at'>) =>
      ipcRenderer.invoke(IPC_CHANNELS.OUTGOING_DOCUMENTS.CREATE, data),

    update: (id: number, data: Partial<Omit<OutgoingDocumentsData, 'id' | 'created_at'>>) =>
      ipcRenderer.invoke(IPC_CHANNELS.OUTGOING_DOCUMENTS.UPDATE, { id, data }),

    deleteOne: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.OUTGOING_DOCUMENTS.DELETE_ONE, id),

    deleteMany: (ids: number[]) =>
      ipcRenderer.invoke(IPC_CHANNELS.OUTGOING_DOCUMENTS.DELETE_MANY, ids)
  },
  documentAssignments: {
    getAll: (params?: {
      page?: number
      limit?: number
      filters?: Array<{ field: string; value: string }>
    }) => ipcRenderer.invoke(IPC_CHANNELS.DOCUMENT_ASSIGNMENTS.GET_ALL, params),

    getOne: (id: number) => ipcRenderer.invoke(IPC_CHANNELS.DOCUMENT_ASSIGNMENTS.GET_ONE, id),

    create: (
      data: Omit<
        DocumentAssignmentsData,
        | 'id'
        | 'incoming_so_den'
        | 'incoming_nam'
        | 'incoming_trich_yeu'
        | 'person_ho_ten'
      >
    ) => ipcRenderer.invoke(IPC_CHANNELS.DOCUMENT_ASSIGNMENTS.CREATE, data),

    update: (
      id: number,
      data: Partial<
        Omit<
          DocumentAssignmentsData,
          | 'id'
          | 'incoming_so_den'
          | 'incoming_nam'
          | 'incoming_trich_yeu'
          | 'person_ho_ten'
        >
      >
    ) => ipcRenderer.invoke(IPC_CHANNELS.DOCUMENT_ASSIGNMENTS.UPDATE, { id, data }),

    deleteOne: (id: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.DOCUMENT_ASSIGNMENTS.DELETE_ONE, id),

    deleteMany: (ids: number[]) =>
      ipcRenderer.invoke(IPC_CHANNELS.DOCUMENT_ASSIGNMENTS.DELETE_MANY, ids)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
