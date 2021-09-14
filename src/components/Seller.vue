<template>
  <!-- 商家销量统计的横向柱状图 -->
  <div class="com-container">
    <div class="com-chart" ref="sellerRef"></div>
  </div>
</template>

<script>
import { getSellerData } from "@/api/seller";
import { mapState } from "vuex";

export default {
  name: "Seller",
  data() {
    return {
      chartInstance: null,
      sellerData: [],
      // 当前页数
      currentPage: 1,
      // 一共有多少页
      totalPage: 0,
      // 定时器标识
      timeId: null,
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
    this.$socket.registerCallBack("sellerData", this.getSellerData);
  },
  mounted() {
    this.initChart();
    // this.getSellerData();
    // 发送数据给服务器，告诉服务器我现在需要数据
    this.$socket.send({
      action: "getData",
      socketType: "sellerData",
      chartName: "seller",
      value: "",
    });
    window.addEventListener("resize", this.screenAdapter);
    // 在页面加载完成时，主动完成屏幕的适配
    this.screenAdapter();
  },
  destroyed() {
    clearInterval(this.timeId);
    // 在组件销毁的时候将监听器取消掉
    window.removeEventListener("resize", this.screenAdapter);
    // 进行回调函数的取消
    this.$socket.unregisterCallBack("sellerData");
  },
  methods: {
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.sellerRef, this.theme);
      // 对图表初始化的配置
      const initOption = {
        title: {
          text: "▎商家销售统计",
          left: 20,
          top: 20,
        },
        grid: {
          top: "20%",
          left: "3%",
          right: "6%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "value",
        },
        yAxis: {
          type: "category",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "line",
            z: 0,
            lineStyle: {
              color: "#2D3443",
            },
          },
        },
        series: [
          {
            type: "bar",
            label: {
              show: true,
              position: "right",
              textStyle: {
                color: "white",
              },
            },
            itemStyle: {
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                {
                  offset: 0,
                  color: "#5052EE",
                },
                {
                  offset: 1,
                  color: "#AB6EE5",
                },
              ]),
            },
          },
        ],
      };
      this.chartInstance.setOption(initOption);
      // 对图表对象进行鼠标事件的监听
      this.chartInstance.on("mouseover", () => {
        clearInterval(this.timeId);
      });
      this.chartInstance.on("mouseout", () => {
        this.startInterval();
      });
    },
    async getSellerData(ret) {
      // this.sellerData = await getSellerData();
      this.sellerData = ret;
      // 对数据进行排序
      this.sellerData = this.sellerData.sort((a, b) => {
        return a.value - b.value;
      });
      // 每五个元素显示一页
      this.totalPage = Math.ceil(this.sellerData.length / 5);
      this.updateChart();
      // 启动定时器
      this.startInterval();
    },
    // 更新图表
    updateChart() {
      const start = (this.currentPage - 1) * 5;
      const end = this.currentPage * 5;
      const showData = this.sellerData.slice(start, end);
      const sellerNames = showData.map((item) => item.name);
      const sellerValue = showData.map((item) => item.value);
      const dataOption = {
        yAxis: {
          data: sellerNames,
        },
        series: [
          {
            data: sellerValue,
          },
        ],
      };
      this.chartInstance.setOption(dataOption);
    },
    startInterval() {
      if (this.timeId) {
        clearInterval(this.timeId);
      }
      this.timeId = setInterval(() => {
        this.currentPage++;
        if (this.currentPage > this.totalPage) {
          this.currentPage = 1;
        }
        this.updateChart();
      }, 3000);
    },
    // 当浏览器屏幕大小发生变化的时候调用的方法，来完成屏幕的适配
    screenAdapter() {
      // console.log(this.$refs.sellerRef.offsetWidth);
      const titleFontSize = (this.$refs.sellerRef.offsetWidth / 100) * 3.6;
      // 和分辨率大小相关的配置项
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        tooltip: {
          axisPointer: {
            lineStyle: {
              width: titleFontSize,
            },
          },
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0],
            },
          },
        ],
      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    },
  },
};
</script>

<style lang="less" scoped>
</style>
