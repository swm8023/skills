# 重构候选项

完成 TDD 循环之后，寻找以下信号：

- **重复（Duplication）** → 提取函数/类
- **过长方法（Long methods）** → 拆分为私有辅助方法（测试仍保留在公共接口上）
- **浅模块（Shallow modules）** → 合并或加深
- **特性依恋（Feature envy）** → 把逻辑移到数据所在的位置
- **基本类型偏执（Primitive obsession）** → 引入值对象
- **现有代码（Existing code）** 因新代码而暴露出的问题
