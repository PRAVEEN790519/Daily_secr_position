export const calculateDuration = (startTime: string, endTime: string): string => {
  if (!startTime || !endTime) return "";
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";
  
  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return "RT is earlier than Failure Time";
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const hrs = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  
  return `${hrs} Hrs ${mins} Min`;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hour = String(d.getHours()).padStart(2, "0");
  const minute = String(d.getMinutes()).padStart(2, "0");
  return `${day}-${month}-${year} ${hour}:${minute}`;
};
