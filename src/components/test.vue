<template>
  <div class="com-container">
    <div class="com-chart" ref="testRef"></div>
  </div>
</template>

<script>
export default {
  name: "test",
  data() {
    return {
      chartInstance: null,
      allData: null,
    };
  },
  mounted() {
    this.initChart();
    this.getData();
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
  },
  methods: {
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.testRef);
      const initOption = {};
      this.chartInstance.setOption(initOption);
    },
    getData() {
      // 获取数据
      this.updateChart();
    },
    updateChart() {
      // 处理图标需要的数据
      const dataOption = {};
      this.chartInstance.setOption(dataOption);
    },
    screenAdapter() {
      const adapterOption = {};
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    },
  },
};
</script>

<style lang="less" scoped>
</style>
