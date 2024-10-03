function currentDate() {
  let time = new Date();
  let indianTime = new Date(time.getTime() + 5.5 * 60 * 60 * 1000);
  return indianTime;
}
export default currentDate;
