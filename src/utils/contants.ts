export const formatVideoTime = (seconds: number) => {
  try {
    const date = new Date(0);
    date.setSeconds(seconds);
    const time = date.toISOString().slice(11, 19);
    const result = time.startsWith("00:0")
      ? time.slice(4)
      : time.startsWith("00")
        ? time.slice(3)
        : time.length === 8 && time.startsWith("0")
          ? time.slice(1)
          : time;
    return result;
  } catch (error) {
    return "0:00";
  }
};

export const playSpeedOptions = [
  {
    label: "0.25x",
    value: 0.25,
  },
  {
    label: "0.5x",
    value: 0.5,
  },
  {
    label: "0.75x",
    value: 0.75,
  },
  {
    label: "1x",
    value: 1,
  },
  {
    label: "1.25x",
    value: 1.25,
  },
  {
    label: "1.5x",
    value: 1.5,
  },
  {
    label: "2x",
    value: 2,
  },
];
