const daysInYear = year =>
  (new Date(year + 1, 0, 1) - new Date(year, 0, 1)) / (24 * 60 * 60 * 1000);

const firstSatDate = year => {
  const week_day = new Date(year, 0, 1).getDay();
  const satDate = new Date(year, 0, 7 - week_day);
  return satDate.getDate();
};

const getSaturdays = year => {
  const yearDays = daysInYear(year);
  const first = firstSatDate(year);
  const saturdays = [];
  for (let day = first; day <= yearDays; day = day + 7) {
    const date = new Date(year, 0, day);
    const day_str = String(date.getDate()).padStart(2, '0');
    const month_str = String(date.getMonth() + 1).padStart(2, '0');
    const date_str = `${date.getFullYear()}-${month_str}-${day_str}`;
    saturdays.push(date_str);
  }
  return saturdays;
};

console.log(getSaturdays(2020));
console.log(getSaturdays(2023));

var fruits = getSaturdays(2025)

for(var i = 0; i < fruits.length; i++) {
    fruits.splice(i+1,1);
}
console.log(fruits)