export const generateNewArray = (arr) => {
  return arr.reverse().map((item) => {
    const { id, value } = item;
    const newObj = { id };

    for (let i = 1; i <= 33; i++) {
      newObj[`number${i}`] = value.includes(i.toString()) ? i : '-';
    }
    return newObj;
  });
};

export const generateNewArray2 = (arr, initMissingValues) => {
  let currentMissingValues = [...initMissingValues]; // 初始遗漏值

  return arr.reverse().map((item) => {
    const { id, value } = item;
    const newObj = { id };
    for (let i = 1; i <= 33; i++) {
      if (!value.length) {
        newObj[`number${i}`] = '-';
      } else if (value.includes(i.toString())) {
        newObj[`number${i}`] = i;
        currentMissingValues[i - 1] = 0; // 数字出现，遗漏值设为0
      } else {
        currentMissingValues[i - 1] += 1; // 没有出现的数字，遗漏值加1
        newObj[`number${i}`] = `-${currentMissingValues[i - 1]}`;
      }
    }

    return newObj;
  });
};

export const getColor = (number) => {
  switch (number) {
    case 0:
      return '#acd3ff';
    case 1:
      return '#cdffac';
    case 2:
      return '#FFFD6B';
    case 3:
      return '#FFC300';
    case 4:
      return '#fa7c7c';
    default:
      return '#fa7c7c';
  }
};
