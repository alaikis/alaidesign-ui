<template>
  <view class="alu-button" :class="[variant, 'alu-btn-' + size]" @click="emitClick">
    <slot />
  </view>
</template>

<script>
// AlaiDesign uniapp-x (uvue) Button 组件
// 设计 token 与 src/theme.ts 同源；uniapp-x 用 CSS 变量 --alu-* 注入主题。
export default {
  name: 'AluButton',
  props: {
    variant: { type: String, default: 'default' },
    size: { type: String, default: 'default' },
    disabled: { type: Boolean, default: false },
    mode: { type: String, default: 'light' },
  },
  methods: {
    emitClick() {
      if (this.disabled) return;
      this.$emit('click');
    },
  },
};
</script>

<style>
.alu-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 10px;
  border-radius: var(--alu-radius, 6px);
  font-size: 14px;
  font-weight: 500;
  background: var(--alu-primary, #0052d9);
  color: var(--alu-primary-foreground, #ffffff);
}
.alu-button.disabled {
  opacity: 0.5;
  pointer-events: none;
}
.alu-button.outline {
  background: var(--alu-background, #f3f3f3);
  border: 1px solid var(--alu-border, #dcdde3);
  color: var(--alu-muted-foreground, #5a5e66);
}
.alu-button.secondary {
  background: var(--alu-muted, #f5f5f5);
  color: var(--alu-muted-foreground, #5a5e66);
}
.alu-button.ghost {
  background: transparent;
  color: var(--alu-muted-foreground, #5a5e66);
}
.alu-button.destructive {
  background: var(--alu-destructive, #e5484d);
  color: var(--alu-primary-foreground, #ffffff);
}
.alu-button.link {
  background: transparent;
  color: var(--alu-primary, #0052d9);
  text-decoration: underline;
}
.alu-btn-xs { height: 28px; font-size: 12px; }
.alu-btn-sm { height: 32px; font-size: 13px; }
.alu-btn-lg { height: 40px; font-size: 15px; }
</style>
