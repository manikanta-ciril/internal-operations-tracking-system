import { lazy, Suspense } from 'react';
import PageLoading from '../../../shared/feedback/PageLoading';
const TaskWorkspacePage = lazy(() => import('../../tasks/TaskWorkspacePage'));

export default function CreativeCommunicationAssociate() {
  return <Suspense fallback={<PageLoading />}><TaskWorkspacePage /></Suspense>;
}
