import { ArrowLeft } from "lucide-react";
import { Button } from "../../../shared/work-ui/button.jsx";
export default function PageHeading({
  title,
  description,
  onBack,
  backLabel = "Back to workspace",
  children,
  afterTitle,
  besideTitle,
  afterDescription,
}) {
  return (
    <header className="detail-page-heading">
      <Button variant="ghost" className="page-back" onClick={onBack}>
        <ArrowLeft size={16} />
        {backLabel}
      </Button>
      {children}
      <div className="page-title-row">
        <h1>{title}</h1>
        {besideTitle}
      </div>
      {afterTitle}
      {description && <p>{description}</p>}
      {afterDescription}
    </header>
  );
}
