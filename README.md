# Asuna
觉得比较有意思或者有用的开源项目整理(Open source projects that you find interesting or useful)

# 目录

* [Java](##Java)
    * [spring-framework](###spring-framework)
    * [log-record](#log-record)

## Java

### [spring-framework](https://github.com/spring-projects/spring-framework) Spring 一统天下

---

### [spring-boot](https://github.com/spring-projects/spring-boot) Srping Boot 一统天下

---

### [layering-cache](https://github.com/xiaolyuh/layering-cache) 多级缓存框架

#### 简介
layering-cache是一个支持分布式环境的多级缓存框架，使用方式和spring-cache类似。它使用Caffeine作为一级本地缓存，redis作为二级集中式缓存。一级缓存和二级缓存的数据一致性是通过推和拉两种模式相结合的方式来保证。推主要是基于redis的pub/sub机制，拉主要是基于消息队列和记录消费消息的偏移量来实现的。

#### 支持
- 支持缓存命中率的监控统计，统计数据上报支持自定义扩展
- 内置dashboard，支持对缓存的管理和缓存命中率的查看
- 支持缓存过期时间在注解上直接配置
- 支持缓存的自动刷新（当缓存命中并发现二级缓存将要过期时，会开启一个异步线程刷新缓存）
- 缓存Key支持SpEL表达式
- Redis支持Kryo、FastJson、Jackson、Jdk和Protostuff序列化，默认使用Protostuff序列化，并支持自定义的序列化
- 支持同一个缓存名称设置不同的过期时间
- 支持只使用一级缓存或者只使用二级缓存

#### 优势
- 提供缓存命中率的监控统计，统计数据上报支持自定义扩展
- 支持本地缓存和集中式两级缓存
- 接入成本和使用成本都非常低
- 无缝集成Spring、Spring boot
- 内置dashboard使得缓存具备可运维性
- 通过缓存空值来解决缓存穿透问题、通过异步加载缓存的方式来解决缓存击穿和雪崩问题


---
### [log-record](https://github.com/qqxx6661/logRecord) 记录业务log sdk

使用注解优雅的记录系统日志，操作日志等，支持SpEL表达式，自定义上下文，自定义函数，并支持将日志消息传递至消息队列。

采用SpringBoot Starter的方式，只需要一个依赖，便可以让系统无缝支持操作日志的聚合和传递。

只需一句注解，日志轻松记录，不侵入业务逻辑：

```java
@OperationLog(bizType = "addressChange", bizId = "#request.orderId", msg = "'用户' + #queryUserName(#request.userId) + '修改了订单的配送地址：从' + #oldAddress + '修改到' + #queryOldAddress(#request.orderId)")
public Response<T> function(Request request) {
  // 业务执行逻辑
}
```

---

## 其他

### [HowToCook](https://github.com/Anduin2017/HowToCook)
最近在家隔离，出不了门。只能宅在家做饭了。作为程序员，我偶尔在网上找找菜谱和做法。但是这些菜谱往往写法千奇百怪，经常中间莫名出来一些材料。对于习惯了形式语言的程序员来说极其不友好。

所以，我计划自己搜寻菜谱和并结合实际做菜的经验，准备用更清晰精准的描述来整理常见菜的做法，以方便程序员在家做饭。

同样，我希望它是一个由社区驱动和维护的开源项目，使更多人能够一起做一个有趣的仓库。所以非常欢迎大家贡献它~

---