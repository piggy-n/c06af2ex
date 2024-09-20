import styles from './index.less';
import { data2022147 } from './data';
import { useEffect, useState } from 'react';
import { analyzeAssociations, generateTables } from '../utils/methods';
import { Button, Space, Table } from 'antd';
import { isObject } from 'lodash';

const initialData = [...data2022147];
initialData.shift();

export default () => {
  const [data] = useState(generateTables([...initialData], 55));
  const [data1, setData1] = useState();
  const [data2, setData2] = useState();
  const [data3, setData3] = useState();
  const [data4, setData4] = useState();

  useEffect(() => {
    // analyzeAssociations([...initialData], 1, '1-11', 55, 2);
    // console.log(data);
  }, []);

  const getColumns = (list, num = 0) => {
    const result = [];
    list.forEach((listElement, i) => {
      result.push({
        ...listElement,
        align: 'center',
        width: 50,
        render: (text, _, index) => {
          if (!text) return <div> \ </div>;
          if (!isObject(text)) return <div>{text}</div>;
          const { totalOccurrences, levels } = text;
          return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/*<span>总: {totalOccurrences}</span>*/}
              <span>
                {i + num} 👉 {index + num + 1}
              </span>
              {Object.values(levels).map((value, index) => {
                return (
                  <div key={`lv-${index}`} style={{ display: 'flex', gap: 16 }}>
                    <span style={{ minWidth: '30px', fontWeight: 600 }}>
                      V{index}:
                    </span>
                    <span>
                      {value.rate}, {value.percentage}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        },
      });
    });
    return result;
  };

  return (
    <div
      className={styles.container}
      style={{ flexDirection: 'column', gap: 16 }}
    >
      <Space>
        <Button type={'primary'} onClick={() => setData1(data[0])}>
          表1
        </Button>
        <Button type={'primary'} onClick={() => setData2(data[1])}>
          表2
        </Button>
        <Button type={'primary'} onClick={() => setData3(data[2])}>
          表3
        </Button>
        <Button type={'primary'} onClick={() => setData4(data[3])}>
          表4
        </Button>
      </Space>
      <Table
        columns={getColumns(data1?.columns || [])}
        rowKey={(record) => record.key}
        dataSource={data1?.dataSource || []}
        pagination={false}
      />
      <Table
        columns={getColumns(data2?.columns || [], 11)}
        rowKey={(record) => record.key}
        dataSource={data2?.dataSource || []}
        pagination={false}
      />
      <Table
        columns={getColumns(data3?.columns || [], 22)}
        rowKey={(record) => record.key}
        dataSource={data3?.dataSource || []}
        pagination={false}
      />
      <Table
        columns={getColumns(data4?.columns || [])}
        rowKey={(record) => record.key}
        dataSource={data4?.dataSource || []}
        pagination={false}
      />
    </div>
  );
};
