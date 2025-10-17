import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Rect, Circle, Path, G, Text as SvgText } from 'react-native-svg';

export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
}

export interface ChartConfig {
  backgroundColor: string;
  backgroundGradientFrom: string;
  backgroundGradientTo: string;
  decimalPlaces: number;
  color: (opacity: number) => string;
  labelColor: (opacity: number) => string;
  style: {
    borderRadius: number;
  };
  propsForDots: {
    r: string;
    strokeWidth: string;
    stroke: string;
  };
}

export interface ChartDesign {
  id: string;
  name: string;
  description: string;
  theme: 'light' | 'dark' | 'colorful' | 'minimal' | 'professional';
  config: ChartConfig;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    grid: string;
  };
}

// Custom Chart Components
const LineChart: React.FC<{
  data: ChartData;
  width: number;
  height: number;
  chartConfig: any;
  bezier?: boolean;
  style?: any;
  withInnerLines?: boolean;
  withOuterLines?: boolean;
  withVerticalLines?: boolean;
  withHorizontalLines?: boolean;
}> = ({ data, width, height, chartConfig, bezier: _bezier = false, style, withInnerLines: _withInnerLines = true, withOuterLines: _withOuterLines = true, withVerticalLines: _withVerticalLines = true, withHorizontalLines = true }) => {
  const maxValue = Math.max(...data.datasets[0]?.data || [0]);
  const minValue = Math.min(...data.datasets[0]?.data || [0]);
  const range = maxValue - minValue || 1;
  
  const points = data.datasets[0]?.data?.map((value, index) => {
    const dataLength = data.datasets[0]?.data?.length || 1;
    const x = (index / (dataLength - 1)) * (width - 40) + 20;
    const y = height - 40 - ((value - minValue) / range) * (height - 80);
    return { x, y, value };
  }) || [];

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  return (
    <Svg width={width} height={height} style={style}>
      {/* Grid lines */}
      {withHorizontalLines && Array.from({ length: 5 }).map((_, i) => {
        const y = 20 + (i * (height - 40) / 4);
        return (
          <Line
            key={i}
            x1={20}
            y1={y}
            x2={width - 20}
            y2={y}
            stroke={chartConfig.gridColor || '#e0e0e0'}
            strokeWidth={1}
            strokeDasharray="2,2"
          />
        );
      })}
      
      {/* Line path */}
      <Path
        d={pathData}
        stroke={chartConfig.color(1)}
        strokeWidth={chartConfig.strokeWidth || 2}
        fill="none"
      />
      
      {/* Data points */}
      {points.map((point, index) => (
        <Circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={chartConfig.propsForDots?.r || 4}
          fill={chartConfig.color(1)}
          stroke={chartConfig.propsForDots?.stroke || chartConfig.color(1)}
          strokeWidth={chartConfig.propsForDots?.strokeWidth || 2}
        />
      ))}
    </Svg>
  );
};

const BarChart: React.FC<{
  data: ChartData;
  width: number;
  height: number;
  chartConfig: any;
  style?: any;
  withInnerLines?: boolean;
  withVerticalLabels?: boolean;
  withHorizontalLabels?: boolean;
  yAxisLabel?: string;
  yAxisSuffix?: string;
}> = ({ data, width, height, chartConfig, style, withInnerLines = true, withVerticalLabels: _withVerticalLabels = true, withHorizontalLabels: _withHorizontalLabels = true, yAxisLabel: _yAxisLabel = '', yAxisSuffix: _yAxisSuffix = '' }) => {
  const maxValue = Math.max(...data.datasets[0]?.data || [0]);
  const barWidth = (width - 40) / (data.datasets[0]?.data?.length || 1) - 10;
  
  return (
    <Svg width={width} height={height} style={style}>
      {/* Grid lines */}
      {withInnerLines && Array.from({ length: 5 }).map((_, i) => {
        const y = 20 + (i * (height - 40) / 4);
        return (
          <Line
            key={i}
            x1={20}
            y1={y}
            x2={width - 20}
            y2={y}
            stroke={chartConfig.gridColor || '#e0e0e0'}
            strokeWidth={1}
            strokeDasharray="2,2"
          />
        );
      })}
      
      {/* Bars */}
      {data.datasets[0]?.data.map((value, index) => {
        const barHeight = (value / maxValue) * (height - 80);
        const x = 20 + index * (barWidth + 10);
        const y = height - 40 - barHeight;
        
        return (
          <Rect
            key={index}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            fill={chartConfig.color(0.8)}
            stroke={chartConfig.color(1)}
            strokeWidth={1}
          />
        );
      })}
    </Svg>
  );
};

const PieChart: React.FC<{
  data: Array<{
    name: string;
    population: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
  }>;
  width: number;
  height: number;
  chartConfig: any;
  accessor: string;
  backgroundColor: string;
  paddingLeft: string;
  style?: any;
}> = ({ data, width, height, chartConfig: _chartConfig, accessor: _accessor, backgroundColor: _backgroundColor, paddingLeft: _paddingLeft, style }) => {
  const total = data.reduce((sum, item) => sum + item.population, 0);
  let currentAngle = 0;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 20;
  
  return (
    <Svg width={width} height={height} style={style}>
      {data.map((item, index) => {
        const percentage = item.population / total;
        const angle = percentage * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle += angle;
        
        const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
        const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
        const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
        const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
        
        const largeArcFlag = angle > 180 ? 1 : 0;
        const pathData = [
          `M ${centerX} ${centerY}`,
          `L ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          'Z'
        ].join(' ');
        
        return (
          <G key={index}>
            <Path
              d={pathData}
              fill={item.color}
              stroke="#fff"
              strokeWidth={2}
            />
            <SvgText
              x={centerX + (radius * 0.7) * Math.cos(((startAngle + endAngle) / 2 * Math.PI) / 180)}
              y={centerY + (radius * 0.7) * Math.sin(((startAngle + endAngle) / 2 * Math.PI) / 180)}
              fontSize={12}
              fill={item.legendFontColor}
              textAnchor="middle"
            >
              {Math.round(percentage * 100)}%
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
};

export const CHART_DESIGNS: ChartDesign[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean, business-focused design with subtle colors',
    theme: 'professional',
    config: {
      backgroundColor: '#ffffff',
      backgroundGradientFrom: '#ffffff',
      backgroundGradientTo: '#f8f9fa',
      decimalPlaces: 2,
      color: (opacity = 1) => `rgba(52, 73, 94, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(52, 73, 94, ${opacity})`,
      style: {
        borderRadius: 8,
      },
      propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: '#34495e',
      },
    },
    colors: {
      primary: '#34495e',
      secondary: '#7f8c8d',
      accent: '#3498db',
      background: '#ffffff',
      text: '#2c3e50',
      grid: '#ecf0f1',
    },
  },
  {
    id: 'colorful',
    name: 'Colorful',
    description: 'Vibrant colors with modern gradients',
    theme: 'colorful',
    config: {
      backgroundColor: '#ffffff',
      backgroundGradientFrom: '#667eea',
      backgroundGradientTo: '#764ba2',
      decimalPlaces: 2,
      color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      style: {
        borderRadius: 16,
      },
      propsForDots: {
        r: '6',
        strokeWidth: '2',
        stroke: '#667eea',
      },
    },
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#f093fb',
      background: '#ffffff',
      text: '#2c3e50',
      grid: '#e8f4fd',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple, clean design with minimal elements',
    theme: 'minimal',
    config: {
      backgroundColor: '#ffffff',
      backgroundGradientFrom: '#ffffff',
      backgroundGradientTo: '#ffffff',
      decimalPlaces: 2,
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      style: {
        borderRadius: 0,
      },
      propsForDots: {
        r: '3',
        strokeWidth: '1',
        stroke: '#000000',
      },
    },
    colors: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#999999',
      background: '#ffffff',
      text: '#000000',
      grid: '#f5f5f5',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Dark theme with neon accents',
    theme: 'dark',
    config: {
      backgroundColor: '#1a1a1a',
      backgroundGradientFrom: '#1a1a1a',
      backgroundGradientTo: '#2d2d2d',
      decimalPlaces: 2,
      color: (opacity = 1) => `rgba(0, 255, 127, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      style: {
        borderRadius: 12,
      },
      propsForDots: {
        r: '5',
        strokeWidth: '2',
        stroke: '#00ff7f',
      },
    },
    colors: {
      primary: '#00ff7f',
      secondary: '#ff6b6b',
      accent: '#4ecdc4',
      background: '#1a1a1a',
      text: '#ffffff',
      grid: '#333333',
    },
  },
  {
    id: 'light',
    name: 'Light',
    description: 'Bright, airy design with soft colors',
    theme: 'light',
    config: {
      backgroundColor: '#ffffff',
      backgroundGradientFrom: '#f8f9fa',
      backgroundGradientTo: '#e9ecef',
      decimalPlaces: 2,
      color: (opacity = 1) => `rgba(108, 117, 125, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(73, 80, 87, ${opacity})`,
      style: {
        borderRadius: 8,
      },
      propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: '#6c757d',
      },
    },
    colors: {
      primary: '#6c757d',
      secondary: '#adb5bd',
      accent: '#17a2b8',
      background: '#ffffff',
      text: '#495057',
      grid: '#f1f3f4',
    },
  },
];

export interface ChartComponentProps {
  data: ChartData;
  design: ChartDesign;
  width?: number;
  height?: number;
  type: 'line' | 'bar' | 'pie' | 'area';
  showLegend?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
}

const screenWidth = Dimensions.get('window').width;

export const MarketChart: React.FC<ChartComponentProps> = ({
  data,
  design,
  width = screenWidth - 40,
  height = 220,
  type,
  showGrid = true,
  showLabels = true,
}) => {
  const chartConfig = {
    ...design.config,
    showGrid,
    showLabels,
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart
            data={data}
            width={width}
            height={height}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={showGrid}
            withOuterLines={showGrid}
            withVerticalLines={showGrid}
            withHorizontalLines={showGrid}
          />
        );
      
      case 'bar':
        return (
          <BarChart
            data={data}
            width={width}
            height={height}
            chartConfig={chartConfig}
            style={styles.chart}
            withInnerLines={showGrid}
            withVerticalLabels={showGrid}
            withHorizontalLabels={showGrid}
            yAxisLabel=""
            yAxisSuffix=""
          />
        );
      
      case 'pie':
        return (
          <PieChart
            data={data.datasets[0]?.data.map((value, index) => ({
              name: data.labels[index] || `Item ${index}`,
              population: value,
              color: data.datasets[0]?.color?.(1) || design.colors.primary,
              legendFontColor: design.colors.text,
              legendFontSize: 12,
            })) || []}
            width={width}
            height={height}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        );
      
      case 'area':
        // Fallback to LineChart for area charts since Victory components are not available
        return (
          <LineChart
            data={data}
            width={width}
            height={height}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={showGrid}
            withOuterLines={showGrid}
            withVerticalLines={showGrid}
            withHorizontalLines={showGrid}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: design.colors.background }]}>
      {renderChart()}
    </View>
  );
};

// VictoryChartWrapper removed - Victory components not available

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chart: {
    borderRadius: 8,
  },
});
