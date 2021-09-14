<template>
  <!-- 商家分布模块 -->
  <div class="com-container" @dblclick="revertMap">
    <div ref="mapRef" class="com-chart"></div>
  </div>
</template>

<script>
import { getMapData, getMapScatter, getProvinceData } from "@/api/map";
import { getProvinceMapInfo } from "@/utils/map_utils";
import { mapState } from "vuex";

export default {
  name: "Map",
  data() {
    return {
      chartInstance: null,
      allData: null,
      // 所获取的省份地图矢量数据
      mapData: {},
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
    this.$socket.registerCallBack("mapData", this.getMapData);
  },
  mounted() {
    this.initChart();
    // this.getMapData();
    // 发送数据给服务器，告诉服务器我现在需要数据
    this.$socket.send({
      action: "getData",
      socketType: "mapData",
      chartName: "map",
      value: "",
    });
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    // 进行回调函数的取消
    this.$socket.unregisterCallBack("mapData");
  },
  methods: {
    async initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.mapRef, this.theme);
      // 获取中国地图的矢量数据
      // http://localhost:8999/static/map/china.json
      // 由于我们现在获取的地图矢量数据并不是位于KOA2的后台,
      const res = await getMapData();
      console.log(res);
      this.$echarts.registerMap("china", res);
      const initOption = {
        title: {
          text: "▎商家分布",
          left: 20,
          top: 20,
        },
        geo: {
          type: "map",
          map: "china",
          top: "5%",
          bottom: "5%",
          itemStyle: {
            areaColor: "#2E72BF",
            borderColor: "#333",
          },
        },
        legend: {
          left: "3%",
          bottom: "5%",
          orient: "vertical",
        },
      };
      this.chartInstance.setOption(initOption);
      this.chartInstance.on("click", async (arg) => {
        const provinceInfo = getProvinceMapInfo(arg.name);

        if (arg.name === "南海诸岛") {
          return;
        } else if (!provinceInfo.key) {
          return;
        }

        // 判断当前所点击的这个省份的地图矢量数据在mapData中是否存在
        if (!this.mapData[provinceInfo.key]) {
          const res = await getProvinceData(provinceInfo.path);
          console.log(res);
          this.mapData[provinceInfo.key] = res;
          this.$echarts.registerMap(provinceInfo.key, res);
        }

        const changeOption = {
          geo: {
            map: provinceInfo.key,
          },
        };

        this.chartInstance.setOption(changeOption);
      });
    },
    async getMapData(ret) {
      // const res = await getMapScatter();
      // this.allData = res;
      this.allData = ret;
      // console.log(res);
      this.updateChart();
    },
    updateChart() {
      // 处理数据
      // 图例的数据
      const legendArr = this.allData.map((item) => item.name);
      const seriesArr = this.allData.map((item) => {
        // return的这个对象就代表的是一个类别下的所有散点数据
        // 如果想在地图中显示散点的数据, 我们需要给散点的图表增加一个配置, coordinateSystem:geo
        return {
          type: "effectScatter",
          rippleEffect: {
            scale: 5,
            brushType: "stroke",
          },
          name: item.name,
          data: item.children,
          coordinateSystem: "geo",
        };
      });
      const dataOption = {
        legend: {
          data: legendArr,
        },
        series: seriesArr,
      };
      this.chartInstance.setOption(dataOption);
    },
    screenAdapter() {
      const titleFontSize = (this.$refs.mapRef.offsetWidth / 100) * 3.6;
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        legend: {
          itemWidth: titleFontSize / 2,
          itemHeight: titleFontSize / 2,
          itemGap: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2,
          },
        },
      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    },
    // 回到中国地图
    revertMap() {
      const revertOption = {
        geo: {
          map: "china",
        },
      };
      this.chartInstance.setOption(revertOption);
    },
  },
};
</script>

<style lang="less" scoped>
</style>

