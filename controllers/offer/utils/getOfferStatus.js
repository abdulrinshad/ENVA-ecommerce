module.exports = (startDate, endDate) => {
  const now = new Date();

  if (now < startDate) return "Upcoming";
  if (now > endDate) return "Expired";

  return "Active";
};