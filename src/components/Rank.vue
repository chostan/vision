<template>
  <!-- 销量排行模块 -->
  <div class="com-container">
    <div class="com-chart" ref="rankRef"></div>
  </div>
</template>

<script>
import { getRankData } from "@/api/rank";
import { mapState } from "vuex";

export default {
  name: "Rank",
  data() {
    return {
      chartInstance: null,
      allData: null,
      // 区域缩放的起点值
      startValue: 0,
      // 区域缩放的终点值
      endValue: 9,
      // 定时器标识
      timerId: null,
    };
  },
  computed: {
    ...mapState(["theme"]),
  },
  watch: {
    theme() {
      // console.log("主题切换了");
      // 销毁当前的图表
      this.chartInstance.dispose();
      // 重新以新的主题初始化图标对象
      this.initChart();
      // 完成屏幕的适配
      this.screenAdapter();
      // 更新图表的展示
      this.updateChart();
    },
  },
  created() {
    // 进行回调函数的注册
    this.$socket.registerCallBack("rankData", this.getRankData);
  },
  mounted() {
    this.initChart();
    // this.getRankData();
    // 发送数据给服务器，告诉服务器我现在需要数据
    this.$socket.send({
      action: "getData",
      socketType: "rankData",
      chartName: "rank",
      value: "",
    });
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    clearInterval(this.timerId);
    // 进行回调函数的取消
    this.$socket.unregisterCallBack("trendData");
  },
  methods: {
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.rankRef, this.theme);
      const initOption = {
        title: {
          text: "▎地区销售排行",
          left: 20,
          top: 20,
        },
        grid: {
          top: "40%",
          left: "5%",
          right: "5%",
          bottom: "5%",
          containLabel: true,
        },
        tooltip: {
          show: true,
        },
        xAxis: {
          type: "category",
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            type: "bar",
          },
        ],
      };
      this.chartInstance.setOption(initOption);
      this.chartInstance.on("mouseover", () => {
        clearInterval(this.timerId);
      });
      this.chartInstance.on("mouseout", () => {
        this.startInterval();
      });
    },
    async getRankData(ret) {
      // 获取数据
      // this.allData = await getRankData();
      this.allData = ret;
      this.allData.sort((a, b) => {
        return b.value - a.value;
      });
      this.updateChart();
      this.startInterval();
    },
    updateChart() {
      const colorArr = [
        ["#0BA82C", "#4FF778"],
        ["#2E72BF", "#23E5E5"],
        ["#5052EE", "#AB6EE5"],
      ];
      // 处理图标需要的数据
      // 所有省份形成的数组
      const provinceArr = this.allData.map((item) => item.name);
      // 所有省份对应的销售金额
      const valueArr = this.allData.map((item) => item.value);

      const dataOption = {
        xAxis: {
          data: provinceArr,
        },
        dataZoom: {
          show: false,
          startValue: this.startValue,
          endValue: this.endValue,
        },
        series: [
          {
            data: valueArr,
            itemStyle: {
              color: (arg) => {
                let targetArr = null;
                if (arg.value > 300) {
                  targetArr = colorArr[0];
                } else if (arg.value > 200) {
                  targetArr = colorArr[1];
                } else {
                  targetArr = colorArr[2];
                }
                return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: targetArr[0],
                  },
                  {
                    offset: 1,
                    color: targetArr[1],
                  },
                ]);
              },
            },
          },
        ],
      };
      this.chartInstance.setOption(dataOption);
    },
    screenAdapter() {
      const titleFontSize = (this.$refs.rankRef.clientWidth / 100) * 3.6;
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              barBorderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0],
            },
          },
        ],
      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    },
    startInterval() {
      // if (this.timerId) {
      //   clearInterval(this.timerId);
      // }
      this.timerId && clearInterval(this.timerId);
      this.timerId = setInterval(() => {
        this.startValue++;
        this.endValue++;
        if (this.endValue > this.allData.length - 1) {
          this.startValue = 0;
          this.endValue = 9;
        }
        this.updateChart();
      }, 2000);
    },
  },
};
</script>

<style lang="less" scoped>
</style>