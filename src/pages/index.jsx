import styles from './index.less';
import { Table } from 'antd';
import { getColor, isMissing } from '../utils/methods';
import { useState } from 'react';
import classNames from 'classnames';
import { CaretDownOutlined } from '@ant-design/icons';
import { dataSource2022147, dataSource2014001 } from './data';

export default function IndexPage() {
  const [dataSource] = useState(dataSource2014001);
  const getNumberColumns = () => {
    const result = [];
    for (let i = 1; i <= 33; i++) {
      result.push({
        title: `${i}`,
        dataIndex: `number${i}`,
        key: `number${i}`,
        align: 'center',
        width: 50,
        render: (text, record, index) => {
          if (index < 11) {
            return (
              <div>
                <span>{record[`number${i}`]}</span>
              </div>
            );
          }
          const prev11 = dataSource
            .slice(index - 11, index)
            .map((item) => item[`number${i}`]);
          const appearCount = prev11.filter((item) => !isMissing(item)).length;

          const color = getColor(appearCount);
          const colorWillChange = !isMissing(prev11[0]) && appearCount <= 4;

          // debug
          // if (i === 1 && index === 200) {
          // }

          return (
            <div style={{ background: color }}>
              <div
                className={classNames(styles.text, {
                  [styles.bold_text]: text === i,
                  [styles.missing_text]: isMissing(text),
                })}
              >
                <span className={styles.number}>{record[`number${i}`]}</span>
                <span
                  className={classNames({
                    [styles.round]: !isMissing(text) && text !== '-',
                  })}
                />
                {colorWillChange && <CaretDownOutlined />}
              </div>
            </div>
          );
        },
      });
    }
    return result;
  };

  const renderRate = (text) => {
    if (!text?.length) return null;
    const [red, green, yellow, orange, blue] = text.split(':');
    return (
      <div>
        <span style={{ backgroundColor: 'rgba(250,124,124,0.5)' }}>{red}</span>:
        <span style={{ backgroundColor: 'rgba(205,255,172,0.5)' }}>
          {green}
        </span>
        :
        <span style={{ backgroundColor: 'rgba(255,253,107,0.5)' }}>
          {yellow}
        </span>
        :
        <span style={{ backgroundColor: 'rgba(255,195,0,0.5)' }}>{orange}</span>
        :
        <span style={{ backgroundColor: 'rgba(172,211,255,0.5)' }}>{blue}</span>
      </div>
    );
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      render: (text, record, index) => {
        if (index < 11) {
          return text;
        }
        let color = '';
        const [red, green, yellow, orange, blue] =
          record.currentRate.split(':');
        if (Number(blue) > 0) {
          color = 'rgba(173,173,255,0.8)';
        }
        if (Number(blue) === 0 && Number(red) > 0) {
          color = 'rgba(255,195,0,0.8)';
        }
        if (Number(blue) === 0 && Number(red) === 0) {
          color = 'rgba(16,232,239,0.8)';
        }
        if (
          Number(blue) === 0 &&
          Number(red) === 0 &&
          Number(yellow) === 0 &&
          Number(orange) === 0 &&
          Number(green) === 0
        ) {
          color = 'transparent';
        }
        return <div style={{ background: color }}>{text}</div>;
      },
    },
    ...getNumberColumns(),
    {
      title: 'RATE',
      dataIndex: 'rate',
      key: 'rate',
      align: 'center',
      render: (text) => {
        return renderRate(text);
      },
    },
    {
      title: 'Current Rate',
      dataIndex: 'currentRate',
      key: 'currentRate',
      align: 'center',
      render: (text) => {
        return renderRate(text);
      },
    },
  ];

  return (
    <div className={styles.container}>
      <Table
        columns={columns}
        rowKey={(record) => record.id}
        dataSource={dataSource}
        pagination={false}
      />
    </div>
  );
}
