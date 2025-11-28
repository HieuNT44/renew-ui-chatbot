export type TrainingStatus = 'completed' | 'processing' | 'error'

export type DocumentType = 'file' | 'url' | 'text'

export type Bot = {
  id: string
  name: string
  status: TrainingStatus
  lastTrainingDate: Date
  lastUpdatedBy: string
  documentTypes: DocumentType[]
}

export const bots: Bot[] = [
  {
    id: '1',
    name: 'Customer Support Bot',
    status: 'completed',
    lastTrainingDate: new Date('2024-01-15T10:30:00'),
    lastUpdatedBy: '田中太郎',
    documentTypes: ['file', 'url'],
  },
  {
    id: '2',
    name: 'Sales Assistant Bot',
    status: 'processing',
    lastTrainingDate: new Date('2024-01-14T14:20:00'),
    lastUpdatedBy: '佐藤花子',
    documentTypes: ['text'],
  },
  {
    id: '3',
    name: 'FAQ Bot',
    status: 'error',
    lastTrainingDate: new Date('2024-01-13T09:15:00'),
    lastUpdatedBy: '鈴木一郎',
    documentTypes: ['file', 'text'],
  },
  {
    id: '4',
    name: 'Product Inquiry Bot',
    status: 'completed',
    lastTrainingDate: new Date('2024-01-12T16:45:00'),
    lastUpdatedBy: '山田美咲',
    documentTypes: ['url', 'text'],
  },
  {
    id: '5',
    name: 'Technical Support Bot',
    status: 'completed',
    lastTrainingDate: new Date('2024-01-11T11:20:00'),
    lastUpdatedBy: '高橋健太',
    documentTypes: ['file', 'url', 'text'],
  },
  {
    id: '6',
    name: 'Order Status Bot',
    status: 'processing',
    lastTrainingDate: new Date('2024-01-10T13:30:00'),
    lastUpdatedBy: '伊藤さくら',
    documentTypes: ['file'],
  },
]
