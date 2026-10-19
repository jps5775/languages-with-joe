import { Navigate } from 'react-router'
import Thanks from './Thanks.tsx'

function confirmed() {
  return document.cookie.split(';').some((part) => part.trim() === 'signed-up=1')
}

export default function ProtectedThanks() {
  if (!confirmed()) return <Navigate to="/" replace />
  return <Thanks />
}
