export const generateNewArray = (arr) => {
  return arr.reverse().map((item) => {
    const { id, value } = item;
    // 将value每一项转换成string
    let stringsArray = value.map(String);
    const newObj = { id };

    for (let i = 1; i <= 33; i++) {
      newObj[`number${i}`] = stringsArray.includes(i.toString()) ? i : '-';
    }
    return newObj;
  });
};

export const generateNewArray2 = (arr, initMissingValues) => {
  let currentMissingValues = [...initMissingValues]; // 初始遗漏值

  return arr.reverse().map((item) => {
    const { id, value } = item;
    let stringsArray = value.map(String);
    const newObj = { id };
    for (let i = 1; i <= 33; i++) {
      if (!stringsArray.length) {
        newObj[`number${i}`] = '-';
      } else if (stringsArray.includes(i.toString())) {
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

export const generateNewArray3 = (arr) => {
  return arr.map((item, index) => {
    if (index < 11) return item;
    let blueCount = 0;
    let greenCount = 0;
    let yellowCount = 0;
    let orangeCount = 0;
    let redCount = 0;

    let currentBlueCount = 0;
    let currentGreenCount = 0;
    let currentYellowCount = 0;
    let currentOrangeCount = 0;
    let currentRedCount = 0;

    const prev11 = arr.slice(index - 11, index);
    for (let i = 1; i <= 33; i++) {
      const length = prev11.filter(
        (item) => !isMissing(item[`number${i}`]),
      ).length;
      const itemNumberAppear =
        item[`number${i}`] !== '-' && !isMissing(item[`number${i}`]);
      switch (length) {
        case 0:
          blueCount += 1;
          if (itemNumberAppear) {
            currentBlueCount += 1;
          }
          break;
        case 1:
          greenCount += 1;
          if (itemNumberAppear) {
            currentGreenCount += 1;
          }
          break;
        case 2:
          yellowCount += 1;
          if (itemNumberAppear) {
            currentYellowCount += 1;
          }
          break;
        case 3:
          orangeCount += 1;
          if (itemNumberAppear) {
            currentOrangeCount += 1;
          }
          break;
        case 4:
          redCount += 1;
          if (itemNumberAppear) {
            currentRedCount += 1;
          }
          break;
        default:
          redCount += 1;
          if (itemNumberAppear) {
            currentRedCount += 1;
          }
          break;
      }
    }
    item.rate = `${redCount}:${greenCount}:${yellowCount}:${orangeCount}:${blueCount}`;
    item.currentRate = `${currentRedCount}:${currentGreenCount}:${currentYellowCount}:${currentOrangeCount}:${currentBlueCount}`;
    return item;
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

export const isMissing = (text) => /^-\d+$/.test(text);

// for (let i = 1; i <= 33; i++) {
//   const prev11 = arr.slice(index - 11, index).map((item) => item[`number${i}`]);
//   const appearCount = prev11.filter((item) => !isMissing(item)).length;
//   const color = getColor(appearCount);
//   const colorWillChange = !isMissing(prev11[0]) && appearCount <= 4;
//   if (appearCount === 0) {
//     currentBlueCount += 1;
//   } else if (appearCount === 1) {
//     currentGreenCount += 1;
//   } else if (appearCount === 2) {
//     currentYellowCount += 1;
//   } else if (appearCount === 3) {
//     currentOrangeCount += 1;
//   } else if (appearCount === 4) {
//     currentRedCount += 1;
//   }
//   item[`number${i}`] = {
//     number: item[`number${i}`],
//     color,
//     colorWillChange,
//   };
// }
