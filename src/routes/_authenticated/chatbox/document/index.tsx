import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { TrainingDocument } from '@/features/chatbox/document'

const documentSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/chatbox/document/')({
  validateSearch: documentSearchSchema,
  component: TrainingDocument,
})
