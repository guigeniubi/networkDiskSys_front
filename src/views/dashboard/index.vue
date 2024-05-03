<template>
  <div class="dashboard-container">
    <div class="dashboard-text">{{ name }} 欢迎使用JayChou网盘！</div>
    <div>
      <div ref="pieChart" class="pie-chart" style="width :400px ; height: 400px;"></div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import fileApi from '@/api/file';
import * as echarts from 'echarts';

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters(['name'])
  },
  methods: {
    drawPieChart(usedSpace) {
      const totalSpace = 1000; // 假设总空间为1000M
      const remainingSpace = totalSpace - usedSpace;

      const chart = echarts.init(this.$refs.pieChart);
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c}M ({d}%)'
        },
        series: [
          {
            name: '存储空间',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '30',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: usedSpace, name: '已使用空间' },
              { value: remainingSpace, name: '剩余空间' }
            ]
          }
        ]
      };
      chart.setOption(option);
    }
  },
  mounted() {
    fileApi.getHadoopInfo().then(response => {
      this.drawPieChart(response.data.usedSpace);
    }).catch(error => {
      console.error("Failed to fetch Hadoop info:", error);
    });
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }

  &-text {
    font-size: 30px;
    line-height: 46px;
  }

}
</style>

