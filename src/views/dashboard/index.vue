<template>
  <div class="dashboard">
    <div class="charts">
      <div class="chart" id="hadoop-chart-1"></div>
      <div class="chart" id="hadoop-chart-2"></div>
    </div>
    <div class="stats">
      <ul>
        <li v-for="(value, name) in hadoopStats" :key="name">
          {{ name }}: {{ value }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
// 导入图表库
import ECharts from 'echarts';

export default {
  data() {
    return {
      hadoopStats: {
        '总容量': '10GB',
        '已使用': '416.61MB',
        // 更多数据...
      },
      // 图表数据...
    };
  },
  mounted() {
    this.createChart('hadoop-chart-1', /* 图表1的数据 */);
    this.createChart('hadoop-chart-2', /* 图表2的数据 */);
  },
  methods: {
    createChart(chartElementId, chartData) {
      // 使用 ECharts 创建图表
      let chart = ECharts.init(document.getElementById(chartElementId));
      chart.setOption({
        // 图表配置和数据
      });
    }
  }
}
</script>

<style>
.dashboard {
  display: flex;
  justify-content: space-around;
}

.chart {
  width: 400px;
  height: 400px;
}

.stats {
  display: flex;
  flex-direction: column;
}
</style>