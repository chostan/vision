<template>
  <div class="com-container">
    <div class="com-chart" ref="stockRef"></div>
  </div>
</template>

<script>
import { getStockData } from "@/api/stock";
import { mapState } from "vuex";

export default {
  name: "Stock",
  data() {
    return {
      chartInstance: null,
      allData: null,
      // 当前显示的数据
      currentIndex: 0,
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
    this.$socket.registerCallBack("stockData", this.getData);
  },
  mounted() {
    this.initChart();
    // this.getData();
    // 发送数据给服务器，告诉服务器我现在需要数据
    this.$socket.send({
      action: "getData",
      socketType: "stockData",
      chartName: "stock",
      value: "",
    });
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    clearInterval(this.timerId);
    // 进行回调函数的取消
    this.$socket.unregisterCallBack("stockData");
  },
  methods: {
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.stockRef, this.theme);
      const initOption = {
        title: {
          text: "▎库存和销量分析",
          left: 20,
          top: 20,
        },
      };
      this.chartInstance.setOption(initOption);
      this.chartInstance.on("mouseover", () => {
        clearInterval(this.timerId);
      });
      this.chartInstance.on("mouseout", () => {
        this.startInteval();
      });
    },
    async getData(ret) {
      // 获取数据
      // this.allData = await getStockData();
      this.allData = ret;
      console.log(this.allData);
      this.updateChart();
      this.startInteval();
    },
    updateChart() {
      const centerArr = [
        ["18%", "40%"],
        ["50%", "40%"],
        ["82%", "40%"],
        ["34%", "75%"],
        ["66%", "75%"],
      ];
      const colorArr = [
        ["#4FF778", "#0BA82C"],
        ["#E5DD45", "#E8B11C"],
        ["#E8821C", "#E55445"],
        ["#5052EE", "#AB6EE5"],
        ["#23E5E5", "#2E72BF"],
      ];
      // 处理图标需要的数据
      const start = this.currentIndex * 5;
      const end = (this.currentIndex + 1) * 5;
      const showData = this.allData.slice(start, end);
      const seriesArr = showData.map((item, index) => {
        return {
          type: "pie",
          center: centerArr[index],
          hoverAnimation: false,
          labelLine: {
            show: false,
          },
          label: {
            position: "center",
            color: colorArr[index][0],
          },
          data: [
            {
              name: item.name + "\n\n" + item.sales,
              value: item.sales,
              itemStyle: {
                color: new this.$echarts.graphic.LinearGradient(0, 1, 0, 0, [
                  {
                    offset: 0,
                    color: colorArr[index][0],
                  },
                  {
                    offset: 1,
                    color: colorArr[index][1],
                  },
                ]),
              },
            },
            {
              value: item.stock,
              itemStyle: {
                color: "#333843",
              },
            },
          ],
        };
      });
      const dataOption = {
        series: seriesArr,
      };
      this.chartInstance.setOption(dataOption);
    },
    screenAdapter() {
      const titleFontSize = (this.$refs.stockRef.offsetWidth / 100) * 3.6;
      const innerRadius = titleFontSize * 2.8;
      const outterRadius = innerRadius * 1.125;
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        series: [
          {
            type: "pie",
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 1.25,
            },
          },
          {
            type: "pie",
            radius: [innerRadius, outterRadius],
            label: {
              fontSize: titleFontSize / 1.25,
            },
          },
          {
            type: "pie",
            radius: [innerRadius, outterRadius],
            label: {
              fontSize: titleFontSize / 1.25,
            },
          },
          {
            type: "pie",
            radius: [innerRadius, outterRadius],
            label: {
              fontSize: titleFontSize / 1.25,
            },
          },
          {
            type: "pie",
            radius: [innerRadius, outterRadius],
            label: {
              fontSize: titleFontSize / 1.25,
            },
          },
        ],
      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    },
    startInteval() {
      if (this.timerId) {
        clearInterval(this.timerId);
      }
      this.timerId = setInterval(() => {
        this.currentIndex++;
        if (this.currentIndex > 1) {
          this.currentIndex = 0;
        }
        this.updateChart();
      }, 5000);
    },
  },
};
</script>

<style lang="less" scoped>
</style>