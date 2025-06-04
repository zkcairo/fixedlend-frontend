export function formatTime(hours: number): string {
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  let formattedTime = "";
  if (years > 0) {
    formattedTime += `${years} year${years > 1 ? "s" : ""}`;
  }
  if (remainingMonths > 0) {
    formattedTime += ` ${remainingMonths} month${remainingMonths > 1 ? "s" : ""}`;
  }
  if (remainingDays > 0) {
    formattedTime += ` ${remainingDays} day${remainingDays > 1 ? "s" : ""}`;
  }
  if (remainingHours > 0) {
    formattedTime += ` ${remainingHours} hour${remainingHours > 1 ? "s" : ""}`;
  }
  if (formattedTime === "") {
    formattedTime = "< 1 hour";
  }
  return formattedTime.trim();
}