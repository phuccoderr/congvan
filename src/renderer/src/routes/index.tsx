import { Layout } from '@/components/templates/layout'
import { Department } from '@/pages/category/department'
import { ConfidentialityLevels } from '@/pages/category/confidentiality-levels'
import { DocumentType } from '@/pages/category/document-type'
import { UrgencyLevels } from '@/pages/category/urgency-levels'
import { DeliveryMethods } from '@/pages/category/delivery-methods'
import { Home } from '@/pages/home'
import { People } from '@/pages/category/people'
import { Partners } from '@/pages/category/partners'
import { IncomingDocuments } from '@/pages/expertise/incoming-documents'
import { OutgoingDocuments } from '@/pages/expertise/outgoing-documents'
import { DocumentAssignments } from '@/pages/expertise/document-assignments'
import { Requirement } from '@/pages/category/requirement'
import { createHashRouter } from 'react-router-dom'

export const routes = createHashRouter([
  {
    element: <Layout />,
    children: [
      {
        element: <Home />,
        path: '/'
      },
      {
        element: <Department />,
        path: '/departments'
      },
      {
        element: <People />,
        path: '/people'
      },
      {
        element: <IncomingDocuments />,
        path: '/incoming-documents'
      },
      {
        element: <OutgoingDocuments />,
        path: '/outgoing-documents'
      },
      {
        element: <DocumentAssignments />,
        path: '/document-assignments'
      },
      {
        element: <Partners />,
        path: '/partners'
      },
      {
        element: <Requirement />,
        path: '/requirements'
      },
      {
        element: <ConfidentialityLevels />,
        path: '/confidentiality-levels'
      },
      {
        element: <DocumentType />,
        path: '/document-types'
      },
      {
        element: <UrgencyLevels />,
        path: '/urgency-levels'
      },
      {
        element: <DeliveryMethods />,
        path: '/delivery-methods'
      }
    ]
  }
])
