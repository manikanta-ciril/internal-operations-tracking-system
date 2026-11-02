import { useEmployeeWorkspace } from "../employee-workspace/context";
import PageHeader from "../../shared/workspace/PageHeader";
import Panel from "../../shared/workspace/Panel";
import Empty from "../../shared/workspace/Empty";
import AccountActivity from "./AccountActivity";

export default function ActivityPage() {
  const { data } = useEmployeeWorkspace();
  return (
    <>
      <PageHeader title="Activity & performance" />
      <Panel title="Account activity">
        <AccountActivity items={data.activity}/>

      </Panel>
      <Panel title="Performance">
        <Empty>
          Performance targets and task-effort records have not been configured.
        </Empty>
      </Panel>
    </>
  );
}
