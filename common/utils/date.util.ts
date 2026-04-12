import moment from "moment-timezone";

export const utcDateTime = (date: Date = new Date()): Date => {
  date = new Date(date);
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds()
    )
  );
};

export const showDate = (
  date: Date,
  timeZone: string = "",
  format: string = "MMM DD YYYY hh:mm A"
): string => {
  let formattedDate = "N/A";
  //if this is invalid date
  if (utcDateTime(date).toString() !== "Invalid Date") {
    formattedDate = timeZone
      ? moment(date).tz(timeZone).format(format)
      : moment.utc(date).format(format);
  }
  return formattedDate;
};


export const dateTimeStartDay = (date) => {
  let dateTime = new Date(date);
  return dateTime;
};
export const dateTimeEndDay = (date) => {
  let dateTime = new Date(date);
  dateTime.setDate(dateTime.getDate() + 1);
  return dateTime;
};


export const getCurrentTimeStamp = (): number => {
  return Math.floor(Date.now() / 1000);
};


export const getExpiry = (
  duration: moment.DurationInputArg1,
  unit: moment.DurationInputArg2 = "minutes"
): Date => {
  const createdAt = new Date();
  return moment(createdAt).add(duration, unit).toDate();
};

export const getExpireTime = (minutes: number): Date => {
  const currentDateTime = new Date();
  return new Date(currentDateTime.getTime() + minutes * 60000);
};


export function generateTimeSlots(excludedDateArray: string[]): string[] {
  const timeSlots: string[] = [];
  let hour;
  let count = 0;

  for (let hour1 = 9; hour1 < 21; hour1++) {
    if (hour1 > 12) {
      count += 1;
      hour = count;
    } else {
      hour = hour1;
    }

    for (let minute = 0; minute < 60; minute += 30) {
      const startTime = `${hour}:${minute.toString().padStart(2, "0")}${hour1 < 12 ? "am" : "pm"}`;

      let endHour = hour;
      let endMinute = minute + 30;

      if (endMinute >= 60) {
        endHour += 1;
        if (endHour === 13) {
          endHour = 1;
        }
        endMinute -= 60;
      }

      const endTime = `${endHour}:${endMinute.toString().padStart(2, "0")}${hour1 < 12 ? "am" : "pm"}`;

      if (!excludedDateArray.includes(`${startTime} - ${endTime}`)) {
        timeSlots.push(`${startTime} - ${endTime}`);
      }
    }
  }

  return timeSlots;
}

export function mergeDateAndTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`);
}
