<template>
  <div class="v-tl">
    <div class="v-tl__axis" ref="axis" :style="{ left: `${axisBothDis}px`, right: `${axisBothDis}px` }">
      <div
        class="v-tl__tick"
        :class="{ 'v-tl__tick--odd': oddTick(getTime(n - 1)) }"
        v-for="(n, i) in splits + 1"
        :key="n"
        v-show="showTick(getTime(n - 1))"
        :style="{ left: `${(100 / splits) * i}%` }"
      >
        <div class="v-tl__tick__inner"></div>
      </div>
      <div
        class="v-tl__label"
        v-for="(t, i) in timeLineLabels"
        :key="t"
        v-show="showLabel(t)"
        :style="{ left: `calc(${(100 / splits) * i}% - ${axisBothDis}px)` }"
      >
        {{ t }}
      </div>
    </div>

    <div class="v-tl__tip" @mousedown="handleTipClick" :style="{ left: `${tipLeft}px` }">
      <div class="v-tl__tip__inner">
        <div class="v-tl__tip__handler"></div>
        <div class="v-tl__tip__content">
          <template v-if="!$slots.default && !$scopedSlots.default">{{ showTime }}</template>
          <slot v-else :time="showTime"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "VTl",
  props: {
    step: {
      type: Number,
      default: 30,
    },
    value: {
      type: String,
      default: "00:00",
    },
    startTime: {
      type: String,
      default: "00:00",
    },
    endTime: {
      type: String,
      default: "24:00",
    },
    axisBothDis: {
      type: Number,
      default: 16,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    showLabel: {
      type: Function,
      default: (time) => {
        const [hour, minute] = time.split(":");
        return minute === "00" && parseInt(hour) % 2 === 0;
      },
    },
    showTick: {
      type: Function,
      default: (time) => {
        /* eslint-disable */
        const [hour, minute] = time.split(":");
        return minute === "00";
      },
    },
  },
  computed: {
    totalTime() {
      return this.timeToValue(this.endTime) - this.timeToValue(this.startTime);
    },
    splits() {
      return this.totalTime / (this.step || 1);
    },
    timeLineLabels() {
      if (!this.splits) return [];
      return Array.from(new Array(this.splits + 1)).map((_, i) => this.getTime(i));
    },
    showTime() {
      return this.getTime(this.current);
    },
  },
  data() {
    return {
      isDrag: false,
      tipLeft: this.axisBothDis,
      current: 0,
    };
  },
  watch: {
    value(val, oldVal) {
      if (val !== oldVal) {
        this.setPosition();
      }
    },
  },
  methods: {
    timeToValue(time) {
      const [hour, minute] = time.split(":");
      return parseInt(hour, 10) * 60 + parseInt(minute, 10);
    },
    getTime(n) {
      const total = n * this.step + this.timeToValue(this.startTime);
      return this.timeFormat(total);
    },
    timeFormat(time) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      return `${hour < 10 ? `0${hour}` : hour}:${minute < 10 ? `0${minute}` : minute}`;
    },
    handleTipClick() {
      if (this.disabled) return;
      this.isDrag = true;
      document.addEventListener("mousemove", this.mouseMoving);
    },
    mouseMoving(e) {
      if (!this.isDrag) return;

      const { axis, splitSize } = this.getSize();
      const dis = e.clientX - axis.left;

      if (dis < splitSize) {
        this.tipLeft = this.axisBothDis;
        this.current = 0;
      } else if (dis >= axis.width) {
        this.tipLeft = axis.width + this.axisBothDis;
        this.current = this.splits;
      } else {
        this.tipLeft = Math.round(dis / splitSize) * splitSize + this.axisBothDis;
        this.current = Math.round(dis / splitSize);
      }
    },
    mouseUp() {
      this.isDrag = false;
      document.removeEventListener("mousemove", this.mouseMoving);
      this.$emit("input", this.getTime(this.current));
    },
    getSize() {
      const axis = this.$refs.axis.getBoundingClientRect();
      const splitSize = axis.width / this.splits;
      return { axis, splitSize };
    },
    oddTick(time) {
      /* eslint-disable */
      const [hour, minute] = time.split(":");
      return minute === "00" && parseInt(hour, 10) % 2 === 1;
    },
    setPosition() {
      if (this.value && this.$refs.axis) {
        const { splitSize } = this.getSize();
        this.current = Math.round((this.timeToValue(this.value) - this.timeToValue(this.startTime)) / this.step);
        this.tipLeft = this.current * splitSize + this.axisBothDis;
      }
    },
  },
  mounted() {
    document.addEventListener("mouseup", this.mouseUp);

    this.$nextTick(() => {
      this.setPosition();
    });
  },
  beforeDestroy() {
    document.removeEventListener("mouseup", this.mouseUp);
  },
};
</script>

<style lang="scss">
@import "./index";
</style>
