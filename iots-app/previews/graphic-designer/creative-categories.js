// Categories follow the supplied creative communication scope of work.
export const creativeCategories = {
  social: [
    "Member Individual Deals",
    "Member-to-Member Deals",
    "Real Estate Trends (Zonal)",
    "Market Report Designing",
    "Festive Greetings",
    "Consolidated / Concluded Deals",
    "CIRIL Monthly Promotion Creatives",
    "Listing Website Promotion",
    "Monthly Newsletter",
    "Annual Conference Video",
    "Zonal Meeting Posts",
    "Blog Posts & Blog Creatives",
    "Marketing Material (Static)",
    "Additional Creative Inputs",
    "Website Content & Design Inputs",
  ],
  internal: [
    "Internal Documents & PPTs",
    "New Member Requirements",
    "Stationery Updation",
    "Zonal Conferences",
    "Annual General Meeting (AGM)",
  ],
};
// Explicit example classification. Production records supply vertical and scopeCategory.
const exampleCategories = {
  "DES-104": ["internal", "New Member Requirements"],
  "DES-102": ["social", "Festive Greetings"],
  "DES-106": ["internal", "Internal Documents & PPTs"],
  "DES-101": ["social", "Real Estate Trends (Zonal)"],
  "DES-098": ["internal", "Annual General Meeting (AGM)"],
  "DES-108": ["social", "Listing Website Promotion"],
  "DES-109": ["social", "Zonal Meeting Posts"],
  "DES-110": ["social", "Monthly Newsletter"],
};
export function classifyCreative(task) {
  const [vertical, category] = task.vertical
    ? [task.vertical, task.scopeCategory]
    : exampleCategories[task.id] || [];
  return {
    vertical:
      vertical === "social"
        ? "Social media"
        : vertical === "internal"
          ? "Non-social media / Internal communication"
          : "Vertical not specified",
    category: category || task.category || "Category not specified",
  };
}
