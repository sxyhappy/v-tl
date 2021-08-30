class Time {
  constructor(time, format = "HH:mm") {
    this.time = time;
    this._t = this.parse(time, format);
    if (typeof format !== "string") {
      throw new Error("invalid time format");
    }
  }

  timeToValue() {}

  parse(time, format) {}

  clone() {}
}

const time = (time, format) => {
  if (time instanceof Time) {
    return time.clone();
  }

  return new Time(time, format);
};

export default time;
