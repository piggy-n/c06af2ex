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

export function analyzeAssociations(
  dataArray,
  targetNum,
  searchRangeStr,
  arrayLimit,
  analysisLevel = 2,
) {
  // 预处理数组: 截断和反转
  let processedArray = dataArray.slice(0, arrayLimit).reverse();

  // 解析搜索范围，例如“1-11”
  let [rangeStart, rangeEnd] = searchRangeStr.split('-').map(Number);
  // 必要时交换范围的开始和结束
  if (rangeStart > rangeEnd) {
    [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
  }
  let searchNumbers = [];
  // 生成搜索范围内的数字列表
  for (let num = rangeStart; num <= rangeEnd; num++) {
    if (num !== targetNum) {
      searchNumbers.push(num);
    }
  }

  // 将analysisLevel限制为最多5
  if (analysisLevel > 5) analysisLevel = 5;

  // 初始化searchRange中每个数字的计数
  let counts = {};
  for (let num of searchNumbers) {
    counts[num] = {
      totalOccurrences: 0,
      simultaneousOccurrences: 0,
    };
    // 初始化每个分析级别的计数
    for (let level = 1; level <= analysisLevel; level++) {
      counts[num][`next${level}Occurrences`] = 0;
    }
  }

  // 遍历处理后的数组
  for (let i = 0; i < processedArray.length; i++) {
    let currentValues = processedArray[i].value;

    // 更新每个数字的计数 totalOccurrences：总出现次数 simultaneousOccurrences：与目标数字同时出现的次数
    for (let num of currentValues) {
      if (searchNumbers.includes(num)) {
        counts[num].totalOccurrences++;

        // 如果当前数字与目标数字同时出现，则增加simultaneousOccurrences 计数
        if (currentValues.includes(targetNum)) {
          counts[num].simultaneousOccurrences++;
        }
      }
    }

    // 更新每个数字的计数 nextXOccurrences：下一个数字出现的次数 每个分析级别的更新计数
    for (let level = 1; level <= analysisLevel; level++) {
      if (i + level >= processedArray.length) break;

      let futureValues = processedArray[i + level].value;

      for (let num of currentValues) {
        if (searchNumbers.includes(num)) {
          if (futureValues.includes(targetNum)) {
            counts[num][`next${level}Occurrences`]++;
          }
        }
      }
    }
  }

  // 按顺序输出结果
  for (let num of searchNumbers) {
    let data = counts[num];
    let total = data.totalOccurrences;
    // 如果数字没有出现，则跳过
    if (total === 0) continue;

    console.log(`数字: ${num}`);
    console.log(`总出现次数: ${total}`);

    // Level 0: 与目标数字同时出现的比例
    let simultaneousRatio = data.simultaneousOccurrences / total;
    console.log(
      `Level 0 出现比例: ${data.simultaneousOccurrences}:${total} = ${(
        simultaneousRatio * 100
      ).toFixed(2)}%`,
    );

    // Levels 1 to analysisLevel: 下一个数字出现的比例
    for (let level = 1; level <= analysisLevel; level++) {
      let nextOccurrences = data[`next${level}Occurrences`];
      let ratio = nextOccurrences / total;
      console.log(
        `Level ${level} 出现比例: ${nextOccurrences}:${total} = ${(
          ratio * 100
        ).toFixed(2)}%`,
      );
    }
    console.log('------------------------------------');
  }
}

function generateTableData(
  dataArray,
  groupRangeStr,
  arrayLimit,
  analysisLevel = 2,
) {
  // Parse the groupRangeStr, e.g., '1-11'
  let [rangeStart, rangeEnd] = groupRangeStr.split('-').map(Number);
  if (rangeStart > rangeEnd) {
    [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
  }
  let groupNumbers = [];
  for (let num = rangeStart; num <= rangeEnd; num++) {
    groupNumbers.push(num);
  }

  // Preprocess the array: truncate and reverse
  let processedArray = dataArray.slice(0, arrayLimit).reverse();

  // Initialize counts for all targetNums and nums
  let counts = {};

  for (let targetNum of groupNumbers) {
    counts[targetNum] = {};

    // Initialize counts for nums (excluding targetNum)
    for (let num of groupNumbers) {
      if (num !== targetNum) {
        counts[targetNum][num] = {
          totalOccurrences: 0,
          simultaneousOccurrences: 0,
        };
        // Initialize counts for each analysis level
        for (let level = 1; level <= analysisLevel; level++) {
          counts[targetNum][num][`next${level}Occurrences`] = 0;
        }
      }
    }
  }

  // Process the dataArray
  for (let i = 0; i < processedArray.length; i++) {
    let currentValues = processedArray[i].value;

    // For each targetNum in groupNumbers
    for (let targetNum of groupNumbers) {
      // For nums in currentValues
      for (let num of currentValues) {
        if (groupNumbers.includes(num) && num !== targetNum) {
          // Update totalOccurrences for num in counts[targetNum][num]
          counts[targetNum][num].totalOccurrences++;

          // Check if targetNum is in currentValues
          if (currentValues.includes(targetNum)) {
            counts[targetNum][num].simultaneousOccurrences++;
          }
        }
      }

      // For analysis levels
      for (let level = 1; level <= analysisLevel; level++) {
        if (i + level >= processedArray.length) break;

        let futureValues = processedArray[i + level].value;

        // For nums in currentValues
        for (let num of currentValues) {
          if (groupNumbers.includes(num) && num !== targetNum) {
            if (futureValues.includes(targetNum)) {
              counts[targetNum][num][`next${level}Occurrences`]++;
            }
          }
        }
      }
    }
  }

  // Build the table data
  let data = [];

  for (let targetNum of groupNumbers) {
    let row = {
      key: targetNum.toString(),
    };

    for (let num of groupNumbers) {
      if (num === targetNum) {
        row[num] = null;
      } else {
        let countData = counts[targetNum][num];

        // Build the analysis result object
        let total = countData.totalOccurrences;
        if (total === 0) {
          row[num] = null;
        } else {
          let cellData = {
            totalOccurrences: total,
            levels: {},
          };

          // Level 0: simultaneousOccurrences
          cellData.levels['0'] = {
            rate: `${countData.simultaneousOccurrences}:${total}`,
            percentage:
              ((countData.simultaneousOccurrences / total) * 100).toFixed(2) +
              '%',
          };

          // Levels 1 to analysisLevel
          for (let level = 1; level <= analysisLevel; level++) {
            let nextOccurrences = countData[`next${level}Occurrences`];
            cellData.levels[level] = {
              rate: `${nextOccurrences}:${total}`,
              percentage: ((nextOccurrences / total) * 100).toFixed(2) + '%',
            };
          }

          row[num] = cellData;
        }
      }
    }

    data.push(row);
  }

  // Build columns
  let columns = [
    { title: '数字', dataIndex: 'key', key: 'key' },
    ...groupNumbers.map((num) => ({
      title: `${num.toString()} 👇`,
      dataIndex: num.toString(),
      key: num.toString(),
    })),
  ];

  return {
    title: `数字范围 ${groupRangeStr}`,
    key: `group_${groupRangeStr}`,
    columns: columns,
    dataSource: data,
  };
}

// Now, we will create a function to generate tables for the four groups
export function generateTables(dataArray, arrayLimit, analysisLevel = 2) {
  const groups = [
    { title: '第一组', range: '1-11' },
    { title: '第二组', range: '12-22' },
    { title: '第三组', range: '23-33' },
    { title: '第四组', range: '1-33' },
  ];

  let dataSource = [];

  for (let group of groups) {
    let tableData = generateTableData(
      dataArray,
      group.range,
      arrayLimit,
      analysisLevel,
    );

    dataSource.push({
      title: group.title,
      dataIndex: tableData.title,
      key: tableData.key,
      columns: tableData.columns,
      dataSource: tableData.dataSource,
    });
  }

  return dataSource;
}
