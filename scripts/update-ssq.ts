import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type SsqRecord = {
  id: string;
  value: number[];
};

type ParsedRecord = SsqRecord & {
  raw: string;
};

type ParsedArray = {
  name: string;
  start: number;
  end: number;
  arrayText: string;
  records: ParsedRecord[];
};

type DrawResult = {
  id: string;
  redBalls: number[];
  nextId: string;
};

type ParsedTxtRow = DrawResult & {
  raw: string;
};

const SSQ_DESC_URL = 'https://data.17500.cn/ssq_desc.txt';
const REQUEST_HEADERS = {
  Accept: 'text/plain,*/*',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
};

const DATA_FILE = resolve(process.cwd(), 'src/pages/data.js');
const CURRENT_ID_FILE = resolve(process.cwd(), '.ssq-current-id');
const TARGET_ARRAYS = ['data2022147', 'data2014001'];

// 下载 17500 倒序 txt，解析第一条有效开奖数据。
async function fetchLatestDraw(): Promise<DrawResult> {
  console.log('开始下载 17500 双色球倒序 txt 数据');

  const response = await fetch(SSQ_DESC_URL, {
    headers: REQUEST_HEADERS,
  });

  if (!response.ok) {
    throw new Error(`下载失败：${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  const validRows = parseValidRows(text);

  console.log('下载成功');

  if (!validRows.length) {
    throw new Error('未解析到有效开奖数据');
  }

  console.log('前 3 条有效数据：');
  validRows.slice(0, 3).forEach((row) => {
    console.log(row.raw);
  });

  const latest = validRows[0];
  const nextId = generateNextId(latest.id);

  console.log(`解析最新期号：${latest.id}`);
  console.log(`解析红球：[${latest.redBalls.join(', ')}]`);
  console.log('校验通过');

  return {
    id: latest.id,
    redBalls: latest.redBalls,
    nextId,
  };
}

// 过滤空行、表头、异常行，并转换为可写入的开奖记录。
function parseValidRows(text: string): ParsedTxtRow[] {
  const rows: ParsedTxtRow[] = [];

  for (const line of text.split(/\r?\n/)) {
    const raw = line.trim();

    if (!raw || /^[^\d]/.test(raw)) {
      continue;
    }

    const columns = raw.split(/\s+/);

    if (columns.length < 8) {
      continue;
    }

    const code = columns[0];
    const redBalls = columns.slice(2, 8).map(Number);

    if (!isValidDraw(code, redBalls)) {
      continue;
    }

    rows.push({
      id: code,
      redBalls,
      nextId: generateNextId(code),
      raw,
    });
  }

  return rows;
}

// 校验 txt 解析出的期号和红球，失败行直接跳过。
function isValidDraw(code: string, redBalls: number[]): boolean {
  if (!/^\d{7}$/.test(code)) {
    return false;
  }

  if (redBalls.length !== 6) {
    return false;
  }

  for (const ball of redBalls) {
    if (!Number.isInteger(ball)) {
      return false;
    }

    if (ball < 1 || ball > 33) {
      return false;
    }
  }

  return new Set(redBalls).size === redBalls.length;
}

// 根据 txt 返回的真实期号生成下一期占位 id。
function generateNextId(code: string): string {
  if (!/^\d{7}$/.test(code)) {
    throw new Error(`期号格式必须是 YYYYNNN，当前值为 ${code}`);
  }

  const year = code.slice(0, 4);
  const issue = Number(code.slice(4));

  return `${year}${String(issue + 1).padStart(3, '0')}`;
}

// 从 data.js 中解析指定导出数组及其中记录。
function parseExportArray(content: string, name: string): ParsedArray {
  const marker = `export const ${name} =`;
  const markerIndex = content.indexOf(marker);

  if (markerIndex < 0) {
    throw new Error(`未找到导出数组：${name}`);
  }

  const start = content.indexOf('[', markerIndex);

  if (start < 0) {
    throw new Error(`未找到数组开始位置：${name}`);
  }

  const end = findMatchingToken(content, start, '[', ']') + 1;
  const arrayText = content.slice(start, end);

  return {
    name,
    start,
    end,
    arrayText,
    records: parseArrayRecords(arrayText, name),
  };
}

// 解析数组内每条对象记录，同时保留原始文本用于最小改动写回。
function parseArrayRecords(arrayText: string, name: string): ParsedRecord[] {
  const body = arrayText.slice(1, -1);
  const records: ParsedRecord[] = [];
  let index = 0;

  while (index < body.length) {
    const recordStart = index;

    while (index < body.length && /\s/.test(body[index])) {
      index += 1;
    }

    if (index >= body.length) {
      break;
    }

    if (body[index] !== '{') {
      throw new Error(`${name} 中存在无法解析的数组项`);
    }

    const objectStart = index;
    const objectEnd = findMatchingToken(body, objectStart, '{', '}') + 1;
    let recordEnd = objectEnd;

    while (recordEnd < body.length && /\s/.test(body[recordEnd])) {
      recordEnd += 1;
    }

    if (body[recordEnd] === ',') {
      recordEnd += 1;
    }

    const objectText = body.slice(objectStart, objectEnd);
    const raw = body.slice(recordStart, recordEnd);
    const parsed = Function(`return (${objectText});`)() as SsqRecord;

    if (!parsed?.id || !Array.isArray(parsed.value)) {
      throw new Error(`${name} 中存在无效数据项`);
    }

    records.push({
      id: String(parsed.id),
      value: parsed.value,
      raw,
    });

    index = recordEnd;
  }

  return records;
}

// 查找括号配对位置，避免 value 数组影响外层数组解析。
function findMatchingToken(
  content: string,
  start: number,
  openToken: string,
  closeToken: string,
): number {
  let depth = 0;
  let quote = '';
  let escaped = false;

  for (let index = start; index < content.length; index += 1) {
    const char = content[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = '';
      }

      continue;
    }

    if (char === "'" || char === '"' || char === '`') {
      quote = char;
      continue;
    }

    if (char === openToken) {
      depth += 1;
    }

    if (char === closeToken) {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  throw new Error(`未找到 ${openToken} 对应的 ${closeToken}`);
}

// 判断本地记录是否是空占位。
function isPlaceholder(record?: ParsedRecord): boolean {
  return Boolean(record && record.value.length === 0);
}

// 判断本地记录是否已有完整红球数据。
function isCompleteRecord(record?: ParsedRecord): boolean {
  return Boolean(record && record.value.length === 6);
}

// 生成一条标准格式的数据记录文本。
function createRecordRaw(record: SsqRecord): string {
  const valueText = record.value.length ? `[${record.value.join(', ')}]` : '[]';

  return `\n  {\n    id: '${record.id}',\n    value: ${valueText},\n  },`;
}

// 清理重复 id，保留靠前且有效的数据项。
function dedupeRecords(records: ParsedRecord[]): ParsedRecord[] {
  const result: ParsedRecord[] = [];
  const idIndexMap = new Map<string, number>();

  for (const record of records) {
    const existingIndex = idIndexMap.get(record.id);

    if (existingIndex === undefined) {
      idIndexMap.set(record.id, result.length);
      result.push(record);
      continue;
    }

    const existing = result[existingIndex];

    if (isPlaceholder(existing) && !isPlaceholder(record)) {
      result[existingIndex] = record;
    }
  }

  return result;
}

// 按 txt 期号更新单个目标数组，保持下一期占位在第一条。
function updateArray(parsedArray: ParsedArray, draw: DrawResult): string {
  const { name, records } = parsedArray;
  const firstRecord = records[0];
  const currentIndex = records.findIndex((record) => record.id === draw.id);
  const currentRecord = records[currentIndex];
  const hasNextPlaceholder = records.some(
    (record) => record.id === draw.nextId && isPlaceholder(record),
  );
  let currentRaw = '';

  if (currentRecord) {
    if (isCompleteRecord(currentRecord)) {
      currentRaw = currentRecord.raw;
      console.log(`${name}：当前期号已存在完整数据`);
    } else if (isPlaceholder(currentRecord)) {
      currentRaw = createRecordRaw({
        id: draw.id,
        value: draw.redBalls,
      });
      console.log(
        currentIndex === 0
          ? `${name}：期号一致，写入红球数据`
          : `${name}：找到当期空数据，写入红球数据`,
      );
    } else {
      throw new Error(
        `${name} 中期号 ${draw.id} 的 value 不是空数组或 6 个红球，终止执行`,
      );
    }
  } else if (isPlaceholder(firstRecord) && firstRecord?.id !== draw.id) {
    console.log(`${name}：检测到本地占位和 txt 期号不一致`);
    console.log(`${name}：修正本地占位 id 为：${draw.id}`);
    console.log(`${name}：写入当期红球数据`);
    currentRaw = createRecordRaw({
      id: draw.id,
      value: draw.redBalls,
    });
  } else {
    console.log(`${name}：本地不存在当期数据，新增当期数据`);
    currentRaw = createRecordRaw({
      id: draw.id,
      value: draw.redBalls,
    });
  }

  const remainingRecords = records.filter((record) => {
    if (record.id === draw.id || record.id === draw.nextId) {
      return false;
    }

    return !isPlaceholder(record);
  });
  const finalRecords = [
    createRecordRaw({
      id: draw.nextId,
      value: [],
    }),
    currentRaw,
    ...dedupeRecords(remainingRecords).map((record) => record.raw),
  ];

  console.log(
    hasNextPlaceholder
      ? `${name}：下一期占位已存在：${draw.nextId}`
      : `${name}：下一期占位已生成：${draw.nextId}`,
  );

  return `[${finalRecords.join('')}\n]`;
}

// 使用项目 prettier 配置格式化写回后的数据文件。
async function formatDataFile(content: string): Promise<string> {
  // @ts-ignore
  const prettierModule = await import('prettier');
  const prettier =
    ((prettierModule as unknown) as {
      // @ts-ignore
      default?: typeof import('prettier');
    }).default || prettierModule;
  const config = (await prettier.resolveConfig(DATA_FILE)) || {};

  return prettier.format(content, {
    ...config,
    filepath: DATA_FILE,
    parser: 'babel',
  });
}

// 主流程：校验、更新、格式化、写入。
async function main() {
  const draw = await fetchLatestDraw();
  const content = readFileSync(DATA_FILE, 'utf8');
  const parsedArrays = TARGET_ARRAYS.map((name) =>
    parseExportArray(content, name),
  );
  const localPlaceholderId = parsedArrays[0]?.records[0]?.id || '无';

  console.log(`本地占位期号：${localPlaceholderId}`);

  const allArraysAlreadyComplete = parsedArrays.every((parsedArray) =>
    parsedArray.records.some(
      (record) => record.id === draw.id && isCompleteRecord(record),
    ),
  );

  if (allArraysAlreadyComplete) {
    console.log(`当前期号 ${draw.id} 已存在完整数据，本次无需更新`);
    return;
  }

  let nextContent = content;

  for (const parsedArray of [...parsedArrays].sort(
    (a, b) => b.start - a.start,
  )) {
    const nextArrayText = updateArray(parsedArray, draw);
    nextContent =
      nextContent.slice(0, parsedArray.start) +
      nextArrayText +
      nextContent.slice(parsedArray.end);
  }

  if (nextContent === content) {
    console.log(`当前期号 ${draw.id} 已存在完整数据，本次无需更新`);
    return;
  }

  const formattedContent = await formatDataFile(nextContent);

  writeFileSync(DATA_FILE, formattedContent, 'utf8');
  writeFileSync(CURRENT_ID_FILE, `${draw.id}\n`, 'utf8');

  console.log(`写入当期数据：${draw.id}`);
  console.log(`生成下一期占位：${draw.nextId}`);
  console.log('数据文件更新完成');
}

main().catch((error) => {
  console.error('17500 数据下载或解析失败，本次不修改数据文件');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
