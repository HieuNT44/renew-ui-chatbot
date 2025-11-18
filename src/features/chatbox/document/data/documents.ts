export type TrainingStatus = 'completed' | 'processing' | 'error'

export type DocumentType = 'file' | 'url' | 'text'

export type Document = {
  id: string
  name: string
  status: TrainingStatus
  lastTrainingDate: Date
  lastUpdatedBy: string
  documentType: DocumentType
  totalCharacterCount: number
}

export const documents: Document[] = [
  {
    id: '1',
    name: 'Customer Support Document',
    status: 'completed',
    lastTrainingDate: new Date('2024-01-15T10:30:00'),
    lastUpdatedBy: '田中太郎',
    documentType: 'file',
    totalCharacterCount: 17798,
  },
  {
    id: '2',
    name: 'Sales Assistant Document',
    status: 'processing',
    lastTrainingDate: new Date('2024-01-14T14:20:00'),
    lastUpdatedBy: '佐藤花子',
    documentType: 'text',
    totalCharacterCount: 12345,
  },
  {
    id: '3',
    name: 'FAQ Document',
    status: 'error',
    lastTrainingDate: new Date('2024-01-13T09:15:00'),
    lastUpdatedBy: '鈴木一郎',
    documentType: 'file',
    totalCharacterCount: 9876,
  },
  {
    id: '4',
    name: 'Product Inquiry Document',
    status: 'completed',
    lastTrainingDate: new Date('2024-01-12T16:45:00'),
    lastUpdatedBy: '山田美咲',
    documentType: 'url',
    totalCharacterCount: 23456,
  },
  {
    id: '5',
    name: 'Technical Support Document',
    status: 'completed',
    lastTrainingDate: new Date('2024-01-11T11:20:00'),
    lastUpdatedBy: '高橋健太',
    documentType: 'text',
    totalCharacterCount: 34567,
  },
  {
    id: '6',
    name: 'Order Status Document',
    status: 'processing',
    lastTrainingDate: new Date('2024-01-10T13:30:00'),
    lastUpdatedBy: '伊藤さくら',
    documentType: 'file',
    totalCharacterCount: 15678,
  },
]
