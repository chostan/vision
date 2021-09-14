<template>
  <!-- 销量趋势 -->
  <div class="com-container">
    <div class="title" :style="comStyle">
      <div @click="showChoice = !showChoice">
        <span>{{ "▎ " + showTitle }}</span>
        <span class="iconfont icon-arrow-down" :style="comStyle"></span>
      </div>
      <div class="select-con" v-show="showChoice" :style="marginStyle">
        <div
          class="select-item"
          v-for="item in selectTypes"
          :key="item.key"
          @click="handleSelect(item.key)"
        >
          {{ item.text }}
        </div>
      </div>
    </div>
    <div class="com-chart" ref="trendRef"></div>
  </div>
</template>

<script>
import { getTrendData } from "@/api/trend";
import { mapState } from "vuex";
import { getThemeValue } from "@/utils/theme_utils";

export default {
  name: "Trend",
  data() {
    return {
      chartInstance: null,
      allData: null,
      // 是否显示下拉框可选项
      showChoice: false,
      // 显示的数据类型
      choiceType: "map",
      // 指明标题字体大小
      titleFontsize: 0,
    };
  },
  computed: {
    ...mapState(["theme"]),
    selectTypes() {
      if (!this.allData) {
        return [];
      } else {
        return this.allData.type.filter((item) => item.key !== this.choiceType);
      }
    },
    showTitle() {
      if (!this.allData) {
        return "";
      } else {
        return this.allData[this.choiceType].title;
      }
    },
    // 设置给标题的样式
    comStyle() {
      return {
        fontSize: this.titleFontsize + "px",
        color: getThemeValue(this.theme).titleColor,
      };
    },
    marginStyle() {
      return {
        marginLeft: this.titleFontsize + "px",
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
    this.$socket.registerCallBack("trendData", this.getTrendData);
  },
  mounted() {
    this.initChart();
    // this.getTrendData();
    // 发送数据给服务器，告诉服务器我现在需要数据
    this.$socket.send({
      action: "getData",
      socketType: "trendData",
      chartName: "trend",
      value: "",
    });
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    // 进行回调函数的取消
    this.$socket.unregisterCallBack("trendData");
  },
  methods: {
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.trendRef, this.theme);
      const initOption = {
        grid: {
          top: "35%",
          left: "3%",
          right: "4%",
          bottom: "1%",
          containLabel: true,
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          left: 20,
          top: "15%",
          icon: "circle",
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
        },
        yAxis: {
          type: "value",
        },
      };
      this.chartInstance.setOption(initOption);
    },
    // ret是服务端发给客户端的图标数据
    getTrendData(ret) {
      // this.allData = await getTrendData();
      this.allData = ret;
      console.log(this.allData);
      this.updateChart();
    },
    updateChart() {
      // 半透明的颜色值
      const colorArr1 = [
        "rgba(11, 168, 44, 0.5)",
        "rgba(44, 110, 255, 0.5)",
        "rgba(22, 242, 217, 0.5)",
        "rgba(254, 33, 30, 0.5)",
        "rgba(250, 105, 0, 0.5)",
      ];
      // 全透明的颜色值
      const colorArr2 = [
        "rgba(11, 168, 44, 0)",
        "rgba(44, 110, 255, 0)",
        "rgba(22, 242, 217, 0)",
        "rgba(254, 33, 30, 0)",
        "rgba(250, 105, 0, 0)",
      ];
      // 处理数据
      // 类目轴的数据
      const timeArr = this.allData.common.month;
      // y轴的数据
      const valueArr = this.allData[this.choiceType].data;
      const seriesArr = valueArr.map((item, index) => {
        return {
          name: item.name,
          type: "line",
          data: item.data,
          stack: this.choiceType,
          areaStyle: {
            color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: colorArr1[index],
              },
              {
                offset: 1,
                color: colorArr2[index],
              },
            ]),
          },
        };
      });
      // 图例的数据
      const legendArr = valueArr.map((item) => item.name);
      const dataOption = {
        xAxis: {
          data: timeArr,
        },
        legend: {
          data: legendArr,
        },
        series: seriesArr,
      };
      this.chartInstance.setOption(dataOption);
    },
    screenAdapter() {
      this.titleFontsize = (this.$refs.trendRef.offsetWidth / 100) * 3.6;
      const adapterOption = {
        legend: {
          itemWidth: this.titleFontsize,
          itemHeight: this.titleFontsize,
          itemGap: this.titleFontsize,
          textStyle: {
            fontSize: this.titleFontsize / 2,
          },
        },
      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    },
    handleSelect(currentType) {
      this.choiceType = currentType;
      this.updateChart();
      this.showChoice = false;
    },
  },
};
</script>

<style lang="less" scoped>
.title {
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 10;
  color: white;

  .icon-arrow-down {
    margin-left: 10px;
    cursor: pointer;
  }

  .select-con {
    // background-color: #222733;
  }
}
</style>
