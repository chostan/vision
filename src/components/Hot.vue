<template>
  <div class="com-container">
    <div class="com-chart" ref="hotRef"></div>
    <span
      class="iconfont icon-arrow-right"
      :style="comStyle"
      @click="toLeft"
    ></span>
    <span
      class="iconfont icon-arrow-lift"
      :style="comStyle"
      @click="toRight"
    ></span>
    <span class="cat-name" :style="comStyle">{{ catName }}</span>
  </div>
</template>

<script>
import { getHotData } from "@/api/hot";
import { mapState } from "vuex";
import { getThemeValue } from "@/utils/theme_utils";

export default {
  name: "Hot",
  data() {
    return {
      chartInstance: null,
      allData: null,
      // 当前所展示的一级分类数据
      currentIndex: 0,
      titleFontSize: 0,
    };
  },
  computed: {
    ...mapState(["theme"]),
    catName() {
      if (!this.allData) {
        return "";
      } else {
        return this.allData[this.currentIndex].name;
      }
    },
    comStyle() {
      return {
        fontSize: this.titleFontSize + "px",
        color: getThemeValue(this.theme).titleColor,
      };
    },
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
    this.$socket.registerCallBack("hotData", this.getData);
  },
  mounted() {
    this.initChart();
    // this.getData();
    // 发送数据给服务器，告诉服务器我现在需要数据
    this.$socket.send({
      action: "getData",
      socketType: "hotData",
      chartName: "hotproduct",
      value: "",
    });
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    // 进行回调函数的取消
    this.$socket.unregisterCallBack("hotData");
  },
  methods: {
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.hotRef, this.theme);
      const initOption = {
        title: {
          text: "▎热销商品的占比",
          left: 20,
          top: 20,
        },
        legend: {
          top: "15%",
          icon: "circle",
        },
        tooltip: {
          show: true,
          formatter: (arg) => {
            const thirdCategory = arg.data.children;
            // 计算所有三级分类的数值总和
            let total = 0;
            thirdCategory.forEach((item) => {
              total += item.value;
            });

            let retStr = "";
            thirdCategory.forEach((item) => {
              retStr += `
              ${item.name}: ${parseInt((item.value / total) * 100) + "%"}
              <br/>
              `;
            });
            return retStr;
          },
        },
        series: [
          {
            type: "pie",
            label: {
              show: false,
            },
            emphasis: {
              label: {
                show: true,
              },
              labelLine: {
                show: false,
              },
            },
          },
        ],
      };
      this.chartInstance.setOption(initOption);
    },
    async getData(ret) {
      // 获取数据
      // this.allData = await getHotData();
      this.allData = ret;
      console.log(this.allData);
      this.updateChart();
    },
    updateChart() {
      // 处理图标需要的数据
      const legendData = this.allData[this.currentIndex].children.map(
        (item) => item.name
      );
      const seriesData = this.allData[this.currentIndex].children.map(
        (item) => {
          return {
            name: item.name,
            value: item.value,
            children: item.children,
          };
        }
      );
      const dataOption = {
        legend: {
          data: legendData,
        },
        series: [
          {
            data: seriesData,
          },
        ],
      };
      this.chartInstance.setOption(dataOption);
    },
    screenAdapter() {
      this.titleFontSize = (this.$refs.hotRef.offsetWidth / 100) * 3.6;
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize,
          },
        },
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 2,
          },
        },
        series: [
          {
            radius: this.titleFontSize * 4.5,
            center: ["50%", "60%"],
          },
        ],
      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    },
    toLeft() {
      this.currentIndex--;
      if (this.currentIndex < 0) {
        this.currentIndex = this.allData.length - 1;
      }
      this.updateChart();
    },
    toRight() {
      this.currentIndex++;
      if (this.currentIndex > this.allData.length - 1) {
        this.currentIndex = 0;
      }
      this.updateChart();
    },
  },
};
</script>

<style lang="less" scoped>
.icon-arrow-lift {
  position: absolute;
  left: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
}

.icon-arrow-right {
  position: absolute;
  right: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
}

.cat-name {
  position: absolute;
  left: 80%;
  bottom: 20px;
  color: white;
}
</style>