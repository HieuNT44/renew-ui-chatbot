import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/chatbox/project/$id/recent'
)({
  component: () => <Outlet />,
})

