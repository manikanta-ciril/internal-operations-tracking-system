import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import EmployeeWorkspace from '../../src/features/employee-workspace/EmployeeWorkspace';
import '../../src/features/workspace/dashboards/dashboard.css';

export function NativeWorkspaceFixture() {
  const query = new URLSearchParams(location.search);
  const [role, setRole] = useState(query.get('role') || 'creative-communication-associate');
  const user = { id: 99, name: 'Test employee', email: 'test@example.test', username: 'test', activeRole: role, roles: [{ code: 'creative-communication-associate', label: 'Graphic Designer' }, { code: 'coordinator', label: 'Coordinator' }, { code: 'executive', label: 'Executive' }, { code: 'chairman', label: 'Chairman' }], location: { status: 'onsite', distanceMeters: 0 } };
  return <EmployeeWorkspace user={user} onChangeRole={setRole} onLogout={() => {}} onSessionEnded={() => {}} />;
}
createRoot(document.getElementById('root')).render(<NativeWorkspaceFixture />);
