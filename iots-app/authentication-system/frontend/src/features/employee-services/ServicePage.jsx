import PageHeader from "../../shared/workspace/PageHeader";
import Panel from "../../shared/workspace/Panel";
import Empty from "../../shared/workspace/Empty";

const services = {
  tasks: {
    title: "Tasks",
    empty: "Task assignments will appear here when task management is enabled.",
  },
  requests: {
    title: "Requests",
    empty:
      "Self-service requests are not available yet. Contact your manager or administrator for assistance.",
  },
  notifications: {
    title: "Notifications",
    empty:
      "Notifications and work messages will appear here when communication services are enabled.",
  },
};
export default function ServicePage({ service }) {
  const content = services[service];
  return (
    <>
      <PageHeader title={content.title} />
      <Panel title={content.title}>
        <Empty>{content.empty}</Empty>
      </Panel>
    </>
  );
}
