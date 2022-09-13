# Asuna
觉得比较有意思或者有用的开源项目整理(Open source projects that you find interesting or useful)
供大家扩展知识面,技术选型,代码借鉴.


# 目录
- [工作](#工作)
    - [面试](#面试)
    - [算法](#算法)
- [Java开发框架](#Java开发框架)
    - [开发框架](#开发框架)
    - [操作业务log自动记录框架](#操作业务log自动记录框架)
    - [log框架](#log框架)
    - [多线程](#多线程)
    - [基础工具类](#基础工具类)
    - [ORM框架](#ORM框架)
    - [权限框架](#权限框架)
    - [序列化](#序列化)
    - [限流](#限流)
    - [iead插件](#iead插件)
    - [excel](#excel)
    - [数据库连接池](#数据库连接池)
    - [Spring、SpringBoot、SpringCloud学习](#Spring、SpringBoot、SpringCloud学习)
- [网关](#网关)
- [数据同步](#数据同步)
- [分布式事务](#分布式事务)
- [消息中间件](#消息中间件)
- [搜索引擎](#搜索引擎)
- [自建博客](#自建博客)
- [数据库](#数据库)
- [内存数据库](#内存数据库)
- [RPC框架](#RPC框架)
- [流程引擎](#流程引擎)
- [定时任务调度](#定时任务调度)
- [监控](#监控)
- [文档](#文档)
- [学习](#学习)
    - [英语学习](#英语学习)
- [常用工具](#常用工具)
- [健康](#健康)
- [项目推荐,科技周刊](#项目推荐,科技周刊)
## 工作

### 面试

 repositories | 简介  |
 :------------ |:---:|
 [`yifeikong/reverse-interview-zh` ![](https://img.shields.io/github/stars/yifeikong/reverse-interview-zh.svg?style=social&label=Star)](https://github.com/yifeikong/reverse-interview-zh)| 技术面试最后反问面试官的话  |
[`Snailclimb/JavaGuide` ![](https://img.shields.io/github/stars/Snailclimb/JavaGuide.svg?style=social&label=Star)](https://github.com/Snailclimb/JavaGuide)|一份涵盖大部分 Java 程序员所需要掌握的核心知识。准备 Java 面试
[`kdn251/interviews` ![](https://img.shields.io/github/stars/kdn251/interviews.svg?style=social&label=Star)](https://github.com/kdn251/interviews)|Everything you need to know to get the job.
[`doocs/advanced-java` ![](https://img.shields.io/github/stars/doocs/advanced-java.svg?style=social&label=Star)](https://github.com/doocs/advanced-java)|互联网 Java 工程师进阶知识完全扫盲
[`doocs/source-code-hunter` ![](https://img.shields.io/github/stars/doocs/source-code-hunter.svg?style=social&label=Star)](https://github.com/doocs/source-code-hunter)|从源码层面，剖析挖掘互联网行业主流技术的底层实现原理
[`996icu/996.ICU` ![](https://img.shields.io/github/stars/996icu/996.ICU.svg?style=social&label=Star)](https://github.com/996icu/996.ICU)|996公司名单
[`formulahendry/955.WLB` ![](https://img.shields.io/github/stars/formulahendry/955.WLB.svg?style=social&label=Star)](https://github.com/formulahendry/955.WLB)|955公司白名单
### 算法
 repositories |                                                      简介                                                      | 语言  |
 :------------ |:------------------------------------------------------------------------------------------------------------:|:---:|
[`doocs/leetcode` ![](https://img.shields.io/github/stars/doocs/leetcode.svg?style=social&label=Star)](https://github.com/doocs/leetcode)|                                              多种编程语言实现 LeetCode                                               |多语言
[`trekhleb/javascript-algorithms` ![](https://img.shields.io/github/stars/trekhleb/javascript-algorithms.svg?style=social&label=Star)](https://github.com/trekhleb/javascript-algorithms)|                                              JavaScript 算法与数据结构                                              |js
|[`labuladong/fucking-algorithm` ![](https://img.shields.io/github/stars/labuladong/fucking-algorithm.svg?style=social&label=Star)](https://github.com/labuladong/fucking-algorithm)|                                          刷算法全靠套路，认准 labuladong 就够了                                           |java
|[`SharingSource/LogicStack-LeetCode` ![](https://img.shields.io/github/stars/SharingSource/LogicStack-LeetCode.svg?style=social&label=Star)](https://github.com/SharingSource/LogicStack-LeetCode)|                                            宫叶三水刷穿 LeetCode 系列文章源码                                            |Java
[`youngyangyang04/leetcode-master` ![](https://img.shields.io/github/stars/youngyangyang04/leetcode-master.svg?style=social&label=Star)](https://github.com/youngyangyang04/leetcode-master)| 代码随想录》LeetCode 刷题攻略：200道经典题目刷题顺序，共60w字的详细图解，视频难点剖析，50余张思维导图，支持C++，Java，Python，Go，JavaScript等多语言版本，从此算法学习不再迷茫 |多语言
[`halfrost/LeetCode-Go` ![](https://img.shields.io/github/stars/halfrost/LeetCode-Go.svg?style=social&label=Star)](https://github.com/halfrost/LeetCode-Go)|LeetCode 题解|go

## Java开发框架

### 开发框架

 repositories | 简介  |
 :------------ |:---:|
[`spring-projects/spring-framework` ![](https://img.shields.io/github/stars/spring-projects/spring-framework.svg?style=social&label=Star)](https://github.com/spring-projects/spring-framework)|Spring 一统天下
 [`spring-projects/spring-boot` ![](https://img.shields.io/github/stars/spring-projects/spring-boot.svg?style=social&label=Star)](https://github.com/spring-projects/spring-boot)              |Srping Boot 一统天下
 [`quarkusio/quarkus` ![](https://img.shields.io/github/stars/quarkusio/quarkus.svg?style=social&label=Star)](https://github.com/quarkusio/quarkus)                                            |谷歌开源的轻量云原生框架
 [`google/guice` ![](https://img.shields.io/github/stars/google/guice.svg?style=social&label=Star)](https://github.com/google/guice)                                                           |google开源的轻量级依赖注入框架
 [`noear/solon` ![](https://img.shields.io/github/stars/noear/solon.svg?style=social&label=Star)](https://github.com/noear/solon)                                                              |国人开源的更现代感的应用开发框架。更快、更小、更自由！主框架0.1M
 [`nutzam/nutzboot` ![](https://img.shields.io/github/stars/nutzam/nutzboot.svg?style=social&label=Star)](https://github.com/nutzam/nutzboot)                                                  |企业级微服务框架，对各种主流三方框架整合
[`alibaba/COLA` ![](https://img.shields.io/github/stars/alibaba/COLA.svg?style=social&label=Star)](https://github.com/alibaba/COLA)                                                           |阿里开源的COLA架构

### 操作业务log自动记录框架
| 序号  | repositories | 简介  |
|:----| :------------ |:---:|
| 1   |[`qqxx6661/logRecord` ![](https://img.shields.io/github/stars/qqxx6661/logRecord.svg?style=social&label=Star)](https://github.com/qqxx6661/logRecord)| 业务记录log框架
| 2   |[`mouzt/mzt-biz-log` ![](https://img.shields.io/github/stars/mouzt/mzt-biz-log.svg?style=social&label=Star)](https://github.com/mouzt/mzt-biz-log)|美团个人开源的业务log记录框架

### log框架
| 序号  | repositories | 简介  |
|:----| :------------ |:---:|
| 1   |[`apache/logging-log4j1` ![](https://img.shields.io/github/stars/apache/logging-log4j1.svg?style=social&label=Star)](https://github.com/apache/logging-log4j1)|
| 2   |[`apache/logging-log4j2` ![](https://img.shields.io/github/stars/apache/logging-log4j2.svg?style=social&label=Star)](https://github.com/apache/logging-log4j2)|
| 3   |[`qos-ch/logback` ![](https://img.shields.io/github/stars/qos-ch/logback.svg?style=social&label=Star)](https://github.com/qos-ch/logback)|
| 4   |[`alibaba/ilogtail` ![](https://img.shields.io/github/stars/alibaba/ilogtail.svg?style=social&label=Star)](https://github.com/alibaba/ilogtail)|快速、轻量级的可观察性数据收集器


### 多线程
 repositories | 简介  |
 :------------ |:---:|
[`dromara/dynamic-tp` ![](https://img.shields.io/github/stars/dromara/dynamic-tp.svg?style=social&label=Star)](https://github.com/dromara/dynamic-tp)|动态线程池框架
[`opengoofy/hippo4j` ![](https://img.shields.io/github/stars/opengoofy/hippo4j.svg?style=social&label=Star)](https://github.com/opengoofy/hippo4j)|动态线程池框架
[`dromara/gobrs-async` ![](https://img.shields.io/github/stars/dromara/gobrs-async.svg?style=social&label=Star)](https://github.com/dromara/gobrs-async)|多线程异步任务 编排框架
[`alibaba/transmittable-thread-local` ![](https://img.shields.io/github/stars/alibaba/transmittable-thread-local.svg?style=social&label=Star)](https://github.com/alibaba/transmittable-thread-local)|阿里开源解决线程池上下文丢失sdk


### 基础工具类
 repositories | 简介  |
 :------------ |:---:|
[`apache/commons-lang` ![](https://img.shields.io/github/stars/apache/commons-lang.svg?style=social&label=Star)](https://github.com/apache/commons-lang)|apache开源的工具类
[`vipshop/vjtools` ![](https://img.shields.io/github/stars/vipshop/vjtools.svg?style=social&label=Star)](https://github.com/vipshop/vjtools)|唯品会java工具类
[`dromara/hutool` ![](https://img.shields.io/github/stars/dromara/hutool.svg?style=social&label=Star)](https://github.com/dromara/hutool)|Hutool是一个小而全的Java工具类库
[`google/guava` ![](https://img.shields.io/github/stars/google/guava.svg?style=social&label=Star)](https://github.com/google/guava)|google开源的工具类
[`oblac/jodd-util` ![](https://img.shields.io/github/stars/oblac/jodd-util.svg?style=social&label=Star)](https://github.com/oblac/jodd-util)|


### ORM框架
 repositories | 简介  |
 :------------ |:---:|
[`spring-projects/spring-data-jpa` ![](https://img.shields.io/github/stars/spring-projects/spring-data-jpa.svg?style=social&label=Star)](https://github.com/spring-projects/spring-data-jpa)|通过方法名方式映射sql
[`mybatis/mybatis-3` ![](https://img.shields.io/github/stars/mybatis/mybatis-3.svg?style=social&label=Star)](https://github.com/mybatis/mybatis-3)|
[`baomidou/mybatis-plus` ![](https://img.shields.io/github/stars/baomidou/mybatis-plus.svg?style=social&label=Star)](https://github.com/baomidou/mybatis-plus)|mybatis单表无需写sql
[`Dreamroute/mybatis-pro` ![](https://img.shields.io/github/stars/Dreamroute/mybatis-pro.svg?style=social&label=Star)](https://github.com/Dreamroute/mybatis-pro)|类似mybatis-plus
[`jOOQ/jOOQ` ![](https://img.shields.io/github/stars/jOOQ/jOOQ.svg?style=social&label=Star)](https://github.com/jOOQ/jOOQ)|
[`querydsl/querydsl` ![](https://img.shields.io/github/stars/querydsl/querydsl.svg?style=social&label=Star)](https://github.com/querydsl/querydsl)|告别常规SQL和CRUD，写的更少，性能更好
[`hibernate/hibernate-orm` ![](https://img.shields.io/github/stars/hibernate/hibernate-orm.svg?style=social&label=Star)](https://github.com/hibernate/hibernate-orm)|对象与数据库直接映射ORM框架
[`troyzhxu/bean-searcher` ![](https://img.shields.io/github/stars/troyzhxu/bean-searcher.svg?style=social&label=Star)](https://github.com/troyzhxu/bean-searcher)|专注于高级查询的只读 ORM，自然支持联接表，避免了 DTO/VO 转换
[`sagframe/sagacity-sqltoy` ![](https://img.shields.io/github/stars/sagframe/sagacity-sqltoy.svg?style=social&label=Star)](https://github.com/sagframe/sagacity-sqltoy)|ava真正智慧的ORM框架，支持mysql、oracle、postgresql、sqlserver、db2、dm、mongodb、elasticsearch、clickhouse、StarRocks、kudu、tidb、guassdb、kingbase、oceanbase、greenplum

### 权限框架
| 序号  | repositories | 简介  |
|:----| :------------ |:---:|
| 1   |[`dromara/Sa-Token` ![](https://img.shields.io/github/stars/dromara/Sa-Token.svg?style=social&label=Star)](https://github.com/dromara/Sa-Token)|轻量级 Java 权限认证框架，让鉴权变得简单、优雅
| 2   |[`spring-projects/spring-security` ![](https://img.shields.io/github/stars/spring-projects/spring-security.svg?style=social&label=Star)](https://github.com/spring-projects/spring-security)|

### excel
 repositories | 简介  |
 :------------ |:---:|
[`alibaba/easyexcel` ![](https://img.shields.io/github/stars/alibaba/easyexcel.svg?style=social&label=Star)](https://github.com/alibaba/easyexcel)|阿里开源快速、简洁、解决大文件内存溢出的java处理Excel工具
[`apache/poi` ![](https://img.shields.io/github/stars/apache/poi.svg?style=social&label=Star)](https://github.com/apache/poi)|
[`liaochong/myexcel` ![](https://img.shields.io/github/stars/liaochong/myexcel.svg?style=social&label=Star)](https://github.com/liaochong/myexcel)|集导入、导出、加密Excel等多项功能的工具包
[`pig-mesh/excel-spring-boot-starter` ![](https://img.shields.io/github/stars/pig-mesh/excel-spring-boot-starter.svg?style=social&label=Star)](https://github.com/pig-mesh/excel-spring-boot-starter)|alibaba easyexcel spring boot starter

### 数据库连接池
repositories |       简介        |
| :------------ |:---------------:|
[`alibaba/druid` ![](https://img.shields.io/github/stars/alibaba/druid.svg?style=social&label=Star)](https://github.com/alibaba/druid)|  为监控而生的数据库连接池   |
[`brettwooldridge/HikariCP` ![](https://img.shields.io/github/stars/brettwooldridge/HikariCP.svg?style=social&label=Star)](https://github.com/brettwooldridge/HikariCP)| Spring Boot 默认的高性能的 JDBC 连接池 |

### Spring、SpringBoot、SpringCloud学习
repositories | 简介  |
| :------------ |:---:|
[`smart-cloud/smart-cloud` ![](https://img.shields.io/github/stars/smart-cloud/smart-cloud.svg?style=social&label=Star)](https://github.com/smart-cloud/smart-cloud)   |基于springboot && springcloud的脚手架，支持服务合并部署与拆分部署、接口加解密签名、日志数据 脱敏、接口数据mock、接口文档自动生成、请求幂等校验、接口日志&&sql日志切面打印、分表分库分布式事务、国际化语言等|
[`DerekYRC/mini-spring-cloud` ![](https://img.shields.io/github/stars/DerekYRC/mini-spring-cloud.svg?style=social&label=Star)](https://github.com/DerekYRC/mini-spring-cloud)    |mini-spring-cloud是简化版的spring-cloud框架，能帮助你快速熟悉spring-cloud源码及掌握其核心原理。在保留spring cloud核心功能的的前提下尽量精简代码，核心功能包括服务注册、服务发现、负载均衡、集成Feign简化调用、流量控制、熔断降级、API网关等|
[`DerekYRC/mini-spring` ![](https://img.shields.io/github/stars/DerekYRC/mini-spring.svg?style=social&label=Star)](https://github.com/DerekYRC/mini-spring)|mini-spring是简化版的spring框架，能帮助你快速熟悉spring源码和掌握spring的核心原理。抽取了spring的核心逻辑，代码极度简化，保留spring的核心功能，如IoC和AOP、资源加载器、事件监听器、类型转换、容器扩展点、bean生命周期和作用域、应用上下文等核心功能|
[`xkcoding/spring-boot-demo` ![](https://img.shields.io/github/stars/xkcoding/spring-boot-demo.svg?style=social&label=Star)](https://github.com/xkcoding/spring-boot-demo)|该项目已成功集成 actuator(监控)、admin(可视化监控)、logback(日志)、aopLog(通过AOP记录web请求日志)、统一异常处理(json级别和页面级别)、freemarker(模板引擎)、thymeleaf(模板引擎)、Beetl(模板引擎)、Enjoy(模板引擎)、JdbcTemplate(通用JDBC操作数据库)、JPA(强大的ORM框架)、mybatis(强大的ORM框架)、通用Mapper(快速操作Mybatis)、PageHelper(通用的Mybatis分页插件)、mybatis-plus(快速操作Mybatis)、BeetlSQL(强大的ORM框架)、upload(本地文件上传和七牛云文件上传)、redis(缓存)、ehcache(缓存)、ema…|


### 实战项目

 repositories | 简介  |
 :------------ |:---:|
[`macrozheng/mall` ![](https://img.shields.io/github/stars/macrozheng/mall.svg?style=social&label=Star)](https://github.com/macrozheng/mall)|前后端微服务项目
[`elunez/eladmin` ![](https://img.shields.io/github/stars/elunez/eladmin.svg?style=social&label=Star)](https://github.com/elunez/eladmin)|EL-ADMIN 后台管理系统
[`qiurunze123/miaosha` ![](https://img.shields.io/github/stars/qiurunze123/miaosha.svg?style=social&label=Star)](https://github.com/qiurunze123/miaosha)|互联网秒杀系统架构设计
[`YunaiV/ruoyi-vue-pro` ![](https://img.shields.io/github/stars/YunaiV/ruoyi-vue-pro.svg?style=social&label=Star)](https://github.com/YunaiV/ruoyi-vue-pro)|
[`techa03/goodsKill` ![](https://img.shields.io/github/stars/techa03/goodsKill.svg?style=social&label=Star)](https://github.com/techa03/goodsKill)|springcloud +dubbo构建的模拟秒杀微服务项目


### 序列化
repositories                                                                                                                                                          | 简介  |
----------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-----------------:|
[`alibaba/fastjson` ![](https://img.shields.io/github/stars/alibaba/fastjson.svg?style=social&label=Star)](https://github.com/alibaba/fastjson)                       |阿里开源序列化框架           
[`alibaba/fastjson2` ![](https://img.shields.io/github/stars/alibaba/fastjson2.svg?style=social&label=Star)](https://github.com/alibaba/fastjson2)                    |FASTJSON2是FASTJSON项目的重要升级，目标是为下一个十年提供一个高性能的JSON库
[`FasterXML/jackson` ![](https://img.shields.io/github/stars/FasterXML/jackson.svg?style=social&label=Star)](https://github.com/FasterXML/jackson)                    |目前spring boot 默认json序列化框架
[`ejlchina/xjsonkit` ![](https://img.shields.io/github/stars/ejlchina/xjsonkit.svg?style=social&label=Star)](https://github.com/ejlchina/xjsonkit)                    |超轻量级 JSON / JSONB / XML / YAML 解析门面 API，用法简单，使业务代码不依赖具体实现
[`fangjinuo/easyjson` ![](https://img.shields.io/github/stars/fangjinuo/easyjson.svg?style=social&label=Star)](https://github.com/fangjinuo/easyjson)                 |提供了一个JSON门面库，就像slf4j一样。easyjson本身不做json的操作，完全依赖于底层实现库


### 限流
 repositories | 简介  |
 :------------ |:---:|
[`didi/sds` ![](https://img.shields.io/github/stars/didi/sds.svg?style=social&label=Star)](https://github.com/didi/sds)|简单、易用、高性能的服务降级系统，支持限流、熔断和降级等功能
[`taptap/ratelimiter-spring-boot-starter` ![](https://img.shields.io/github/stars/taptap/ratelimiter-spring-boot-starter.svg?style=social&label=Star)](https://github.com/taptap/ratelimiter-spring-boot-starter)|基于 redis 的偏业务应用的分布式限流组件，使得项目拥有分布式限流能力变得很简单
[`alibaba/Sentinel` ![](https://img.shields.io/github/stars/alibaba/Sentinel.svg?style=social&label=Star)](https://github.com/alibaba/Sentinel)|面向云原生微服务的高可用流控防护组件
[`Netflix/Hystrix` ![](https://img.shields.io/github/stars/Netflix/Hystrix.svg?style=social&label=Star)](https://github.com/Netflix/Hystrix)|

### iead插件
repositories | 简介  |
| :------------ |:---:|
|[`starcwang/easy_javadoc` ![](https://img.shields.io/github/stars/starcwang/easy_javadoc.svg?style=social&label=Star)](https://github.com/starcwang/easy_javadoc)|自动生成javadoc文档注释
|[`gejun123456/intellij-generateAllSetMethod` ![](https://img.shields.io/github/stars/gejun123456/intellij-generateAllSetMethod.svg?style=social&label=Star)](https://github.com/gejun123456/intellij-generateAllSetMethod)|自动生成set方法



## 网关
 repositories                                                                                                                           | 简介                                           | 开发语言 |
:---------------------------------------------------------------------------------------------------------------------------------------|:---------------------------------------------|:----:|
 [`apache/shenyu` ![](https://img.shields.io/github/stars/apache/shenyu.svg?style=social&label=Star)](https://github.com/apache/shenyu) | Java 原生API网关,用于服务代理、协议转换和API治理               | Java
 [`Netflix/zuul` ![](https://img.shields.io/github/stars/Netflix/zuul.svg?style=social&label=Star)](https://github.com/Netflix/zuul)    | Netflix开源的网关                                 |Java
[`spring-cloud/spring-cloud-gateway` ![](https://img.shields.io/github/stars/spring-cloud/spring-cloud-gateway.svg?style=social&label=Star)](https://github.com/spring-cloud/spring-cloud-gateway)| spring 开源的高性能网关                              |Java
[`polarismesh/polaris` ![](https://img.shields.io/github/stars/polarismesh/polaris.svg?style=social&label=Star)](https://github.com/polarismesh/polaris)| 腾讯百万级服务治理中心的开源版本，沉淀了腾讯多年的分布式服务治理经验.包含网关、配置中心 |go
[`apache/apisix` ![](https://img.shields.io/github/stars/apache/apisix.svg?style=social&label=Star)](https://github.com/apache/apisix)| 云原生网关                                        |go
[`Kong/kong` ![](https://img.shields.io/github/stars/Kong/kong.svg?style=social&label=Star)](https://github.com/Kong/kong)| 高性能云原生网关|Lua



## 数据同步
repositories |                            简介                            |
| :------------ |:--------------------------------------------------------:|
[`alibaba/canal` ![](https://img.shields.io/github/stars/alibaba/canal.svg?style=social&label=Star)](https://github.com/alibaba/canal)|               阿里巴巴 MySQL binlog 增量订阅&消费组件                |
[`alibaba/otter` ![](https://img.shields.io/github/stars/alibaba/otter.svg?style=social&label=Star)](https://github.com/alibaba/otter)| 基于数据库增量日志解析，准实时同步到本机房或异地机房的mysql/oracle数据库. 一个分布式数据库同步系统 |
[`alibaba/DataX` ![](https://img.shields.io/github/stars/alibaba/DataX.svg?style=social&label=Star)](https://github.com/alibaba/DataX)|               DataX是阿里云DataWorks数据集成的开源版本。               |
[`pentaho/pentaho-kettle` ![](https://img.shields.io/github/stars/pentaho/pentaho-kettle.svg?style=social&label=Star)](https://github.com/pentaho/pentaho-kettle)|                       通过图形化窗口同步数据                        |
[`DTStack/chunjun` ![](https://img.shields.io/github/stars/DTStack/chunjun.svg?style=social&label=Star)](https://github.com/DTStack/chunjun)|基于实时计算引擎Flink实现多种异构数据源之间的数据同步与计算|
[`apache/inlong` ![](https://img.shields.io/github/stars/apache/inlong.svg?style=social&label=Star)](https://github.com/apache/inlong)|一站式海量数据集成框架，提供自动、安全、可靠和高性能的数据传输能力，同时支持批和流，方便业务构建基于流式的数据分析、建模和应用|
[`apache/incubator-seatunnel` ![](https://img.shields.io/github/stars/apache/incubator-seatunnel.svg?style=social&label=Star)](https://github.com/apache/incubator-seatunnel)|一个分布式、高性能的数据集成平台，用于同步和转换海量数据(离线和实时)|
[`ghi/dbsyncer` ![](https://gitee.com/ghi/dbsyncer/badge/star.svg?theme=gray)](https://gitee.com/ghi/dbsyncer)    |提供MySQL、Oracle、SqlServer、PostgreSQL、Elasticsearch(ES)、Kafka、File、SQL等同步场景。支持上传插件自定义同步转换业务，提供监控全量和增量数据统计图、应用性能预警等|


## 分布式事务
 repositories | 简介  |开发语言 |
:---------------------------------------------------------------------------------------------------------------------------------------|:---------------------------------------------|:----:|
[`seata/seata` ![](https://img.shields.io/github/stars/seata/seata.svg?style=social&label=Star)](https://github.com/seata/seata)|阿里开源分布式事务框架|Java
[`changmingxie/tcc-transaction` ![](https://img.shields.io/github/stars/changmingxie/tcc-transaction.svg?style=social&label=Star)](https://github.com/changmingxie/tcc-transaction)|TCC型事务|Java
[`dtm-labs/dtf` ![](https://img.shields.io/github/stars/dtm-labs/dtf.svg?style=social&label=Star)](https://github.com/dtm-labs/dtf)|柔性分布式事务框架|Java
[`dromara/raincat` ![](https://img.shields.io/github/stars/dromara/raincat.svg?style=social&label=Star)](https://github.com/dromara/raincat)|强一致分布式事务框架|Java


## 消息中间件
 repositories | 简介               |开发语言 |
:---------------------------------------------------------------------------------------------------------------------------------------|:-----------------|:----:|
[`apache/rocketmq` ![](https://img.shields.io/github/stars/apache/rocketmq.svg?style=social&label=Star)](https://github.com/apache/rocketmq)| 阿里开源消息中间件|Java        
[`qunarcorp/qmq` ![](https://img.shields.io/github/stars/qunarcorp/qmq.svg?style=social&label=Star)](https://github.com/qunarcorp/qmq)| 去哪儿网内部广泛使用的消息中间件 |Java
[`apache/kafka` ![](https://img.shields.io/github/stars/apache/kafka.svg?style=social&label=Star)](https://github.com/apache/kafka)| apache开源高吞吐消息中间件 |Java
[`didi/KnowStreaming` ![](https://img.shields.io/github/stars/didi/KnowStreaming.svg?style=social&label=Star)](https://github.com/didi/KnowStreaming)|一站式云原生Kafka管控平台|Java
[`rabbitmq/rabbitmq-server` ![](https://img.shields.io/github/stars/rabbitmq/rabbitmq-server.svg?style=social&label=Star)](https://github.com/rabbitmq/rabbitmq-server)|
[`apache/pulsar` ![](https://img.shields.io/github/stars/apache/pulsar.svg?style=social&label=Star)](https://github.com/apache/pulsar)| apach开源云原生网关     |Java
[`apache/rocketmq-spring` ![](https://img.shields.io/github/stars/apache/rocketmq-spring.svg?style=social&label=Star)](https://github.com/apache/rocketmq-spring)|rocketmq 客户端使用sdk|Java
[`weihubeats/wh-mq-Idempotent` ![](https://img.shields.io/github/stars/weihubeats/wh-mq-Idempotent.svg?style=social&label=Star)](https://github.com/weihubeats/wh-mq-Idempotent)|通用MQ幂等框架|Java

## 搜索引擎

| 序号  | repositories |       简介        |开发语言|
|:----| :------------ |:---------------:|:---:|
| 1   |[`apache/lucene` ![](https://img.shields.io/github/stars/apache/lucene.svg?style=social&label=Star)](https://github.com/apache/lucene)|                | Java           
| 2   |[`elastic/elasticsearch` ![](https://img.shields.io/github/stars/elastic/elasticsearch.svg?style=social&label=Star)](https://github.com/elastic/elasticsearch)| 基于lucene开源的搜索引擎 |Java
| 3   |[`apache/solr` ![](https://img.shields.io/github/stars/apache/solr.svg?style=social&label=Star)](https://github.com/apache/solr)||      Java       



## 自建博客

| 序号  | repositories | 简介  |开发语言|
|:----| :------------ |:---:|:---:|
| 1   |[`halo-dev/halo` ![](https://img.shields.io/github/stars/halo-dev/halo.svg?style=social&label=Star)](https://github.com/halo-dev/halo)|一款现代化的开源博客|Java
| 2   |[`88250/solo` ![](https://img.shields.io/github/stars/88250/solo.svg?style=social&label=Star)](https://github.com/88250/solo)|小而美的开源博客系统|Java

## 数据库

 repositories |                       简介                       |开发语言|
 :------------ |:----------------------------------------------:|:---:|
[`mysql/mysql-server` ![](https://img.shields.io/github/stars/mysql/mysql-server.svg?style=social&label=Star)](https://github.com/mysql/mysql-server)|           MySQLServer 是世界上最流行的开源数据库            |C++
[`postgres/postgres` ![](https://img.shields.io/github/stars/postgres/postgres.svg?style=social&label=Star)](https://github.com/postgres/postgres)|                                                |C
[`pingcap/tidb` ![](https://img.shields.io/github/stars/pingcap/tidb.svg?style=social&label=Star)](https://github.com/pingcap/tidb)|     TiDB 是一个开源的、原生于云的、分布式的、与 MySQL 兼容的数据库      |Go
[`ClickHouse/ClickHouse` ![](https://img.shields.io/github/stars/ClickHouse/ClickHouse.svg?style=social&label=Star)](https://github.com/ClickHouse/ClickHouse)|                 俄罗斯开源列式数据库OLAP                 |C++


## 内存数据库
repositories |  简介   |开发语言|
 :------------ |:-----:|:---:|
[`mongodb/mongo` ![](https://img.shields.io/github/stars/mongodb/mongo.svg?style=social&label=Star)](https://github.com/mongodb/mongo)| 文档数据库 |C++
[`redis/redis` ![](https://img.shields.io/github/stars/redis/redis.svg?style=social&label=Star)](https://github.com/redis/redis)| reids |C
[`dragonflydb/dragonfly` ![](https://img.shields.io/github/stars/dragonflydb/dragonfly.svg?style=social&label=Star)](https://github.com/dragonflydb/dragonfly)|Redis 和 Memcached 的现代替代品|C++


## RPC框架

 repositories | 简介  |开发语言|
 :------------ |:---:|:---:|
[`apache/dubbo` ![](https://img.shields.io/github/stars/apache/dubbo.svg?style=social&label=Star)](https://github.com/apache/dubbo)|阿里开源tpc协议RPC框架|
[`OpenFeign/feign` ![](https://img.shields.io/github/stars/OpenFeign/feign.svg?style=social&label=Star)](https://github.com/OpenFeign/feign)|Netflix Http协议RPC框架|Java
[`grpc/grpc` ![](https://img.shields.io/github/stars/grpc/grpc.svg?style=social&label=Star)](https://github.com/grpc/grpc)|Google 开源的跨语言RPC框架|多语言
[`TarsCloud/Tars` ![](https://img.shields.io/github/stars/TarsCloud/Tars.svg?style=social&label=Star)](https://github.com/TarsCloud/Tars)|腾讯开源的rpc框架|
[`weibocom/motan` ![](https://img.shields.io/github/stars/weibocom/motan.svg?style=social&label=Star)](https://github.com/weibocom/motan)|微博开源rpc框架|多语言
[`sofastack/sofa-rpc` ![](https://img.shields.io/github/stars/sofastack/sofa-rpc.svg?style=social&label=Star)](https://github.com/sofastack/sofa-rpc)|蚂蚁开源rpc框架

## 流程引擎

 repositories |            简介             |开发语言|
 :------------ |:-------------------------:|:---:|
[`alibaba/bulbasaur` ![](https://img.shields.io/github/stars/alibaba/bulbasaur.svg?style=social&label=Star)](https://github.com/alibaba/bulbasaur)|      阿里开源可插拔的精简流程引擎       |Java
[`Activiti/Activiti` ![](https://img.shields.io/github/stars/Activiti/Activiti.svg?style=social&label=Star)](https://github.com/Activiti/Activiti)|                           |Java
[`kiegroup/jbpm` ![](https://img.shields.io/github/stars/kiegroup/jbpm.svg?style=social&label=Star)](https://github.com/kiegroup/jbpm)|                           |           Java            
[`dromara/liteflow` ![](https://img.shields.io/github/stars/dromara/liteflow.svg?style=social&label=Star)](https://github.com/dromara/liteflow)| 轻量，快速，稳定，可编排的组件式规则引擎/流程引擎 |Java
[`flowable/flowable-engine` ![](https://img.shields.io/github/stars/flowable/flowable-engine.svg?style=social&label=Star)](https://github.com/flowable/flowable-engine)|工作流和业务流程管理(BPM)平台|Java
[`alibaba/compileflow` ![](https://img.shields.io/github/stars/alibaba/compileflow.svg?style=social&label=Star)](https://github.com/alibaba/compileflow)|一个高性能流程编排引擎|Java
[`deliveredtechnologies/rulebook` ![](https://img.shields.io/github/stars/deliveredtechnologies/rulebook.svg?style=social&label=Star)](https://github.com/deliveredtechnologies/rulebook)|Lambda，轻量级规则引擎和简单直观的 DSL


## 定时任务调度

| 序号  | repositories | 简介  |开发语言|
|:----| :------------ |:---:|:---:|
| 1   |[`xuxueli/xxl-job` ![](https://img.shields.io/github/stars/xuxueli/xxl-job.svg?style=social&label=Star)](https://github.com/xuxueli/xxl-job)|分布式任务调度框架|Java
| 2   |[`quartz-scheduler/quartz` ![](https://img.shields.io/github/stars/quartz-scheduler/quartz.svg?style=social&label=Star)](https://github.com/quartz-scheduler/quartz)|轻量任务调度框架|Java
| 3   |[`apache/shardingsphere-elasticjob` ![](https://img.shields.io/github/stars/apache/shardingsphere-elasticjob.svg?style=social&label=Star)](https://github.com/apache/shardingsphere-elasticjob)|apache开源的分布式调度框架|Java


## 监控
repositories |                                                                          简介                                                                          |开发语言|
 :---------------- |:----------------------------------------------------------------------------------------------------------------------------------------------------:|:---:|
[`dromara/hertzbeat` ![](https://img.shields.io/github/stars/dromara/hertzbeat.svg?style=social&label=Star)](https://github.com/dromara/hertzbeat)|                                一个拥有强大自定义监控能力，无需Agent的实时监控系统。网站监测，PING连通性，端口可用性，数据库，操作系统，中间件，API监控，阈值告警，告警通知(邮件微信钉钉飞书)                                |Java
[`dianping/cat` ![](https://img.shields.io/github/stars/dianping/cat.svg?style=social&label=Star)](https://github.com/dianping/cat)|CAT 作为服务端项目基础组件，提供了 Java, C/C++, Node.js, Python, Go 等多语言客户端，已经在美团点评的基础架构中间件框架（MVC框架，RPC框架，数据库框架，缓存框架等，消息队列，配置系统等）深度集成，为美团点评各业务线提供系统丰富的性能指标、健康状况、实时告警等|Java
[`prometheus/prometheus` ![](https://img.shields.io/github/stars/prometheus/prometheus.svg?style=social&label=Star)](https://github.com/prometheus/prometheus)|                                                                  普罗米修斯监测系统及时间序列数据库                                                                   |GO


## 文档
repositories |    简介     |
| :------------ |:---------:|
[`facebook/docusaurus` ![](https://img.shields.io/github/stars/facebook/docusaurus.svg?style=social&label=Star)](https://github.com/facebook/docusaurus)| 让开源文档更好维护 |
[`sparanoid/chinese-copywriting-guidelines` ![](https://img.shields.io/github/stars/sparanoid/chinese-copywriting-guidelines.svg?style=social&label=Star)](https://github.com/sparanoid/chinese-copywriting-guidelines)|中文文案排版指北|
[`guodongxiaren/README` ![](https://img.shields.io/github/stars/guodongxiaren/README.svg?style=social&label=Star)](https://github.com/guodongxiaren/README)|GitHub markdown 语法教程|
[`slidevjs/slidev` ![](https://img.shields.io/github/stars/slidevjs/slidev.svg?style=social&label=Star)](https://github.com/slidevjs/slidev)|markdown语法写PPT

## 学习

### 英语学习

 repositories | 简介  |
 :------------ |:---:|
[`Kaiyiwing/qwerty-learner` ![](https://img.shields.io/github/stars/Kaiyiwing/qwerty-learner.svg?style=social&label=Star)](https://github.com/Kaiyiwing/qwerty-learner)|为键盘工作者设计的单词记忆与英语肌肉记忆锻炼软件
[`yujiangshui/A-Programmers-Guide-to-English` ![](https://img.shields.io/github/stars/yujiangshui/A-Programmers-Guide-to-English.svg?style=social&label=Star)](https://github.com/yujiangshui/A-Programmers-Guide-to-English)|专为程序员编写的英语学习指南
[`chinese-programmer-wrong-pronunciation` ![](https://img.shields.io/github/stars/chinese-programmer-wrong-pronunciation.svg?style=social&label=Star)](https://github.com/chinese-programmer-wrong-pronunciation)|中国程序员容易发音错误的单词



### 语言学习

 repositories |        简介        |    开发语言    |
 :------------ |:----------------:|:----------:|
[`zhisheng17/flink-learning` ![](https://img.shields.io/github/stars/zhisheng17/flink-learning.svg?style=social&label=Star)](https://github.com/zhisheng17/flink-learning)|       Java       |  Flink 学习  
[`Avik-Jain/100-Days-Of-ML-Code` ![](https://img.shields.io/github/stars/Avik-Jain/100-Days-Of-ML-Code.svg?style=social&label=Star)](https://github.com/Avik-Jain/100-Days-Of-ML-Code)|       机器学习       |
[`iluwatar/java-design-patterns` ![](https://img.shields.io/github/stars/iluwatar/java-design-patterns.svg?style=social&label=Star)](https://github.com/iluwatar/java-design-patterns)|       设计模式       |    Java    
[`seaswalker/spring-analysis` ![](https://img.shields.io/github/stars/seaswalker/spring-analysis.svg?style=social&label=Star)](https://github.com/seaswalker/spring-analysis)|    Spring源码阅读    |    Java    
[`DerekYRC/mini-spring` ![](https://img.shields.io/github/stars/DerekYRC/mini-spring.svg?style=social&label=Star)](https://github.com/DerekYRC/mini-spring)|简化版的spring框架,供我们学习|    Java    
[`fuzhengwei/itstack-demo-bytecode` ![](https://img.shields.io/github/stars/fuzhengwei/itstack-demo-bytecode.svg?style=social&label=Star)](https://github.com/fuzhengwei/itstack-demo-bytecode)|  java字节码编程相关学习   |    Java    
[`tuguangquan/mybatis` ![](https://img.shields.io/github/stars/tuguangquan/mybatis.svg?style=social&label=Star)](https://github.com/tuguangquan/mybatis)|  mybatis源码中文注释   |    Java    
[`xkcoding/spring-boot-demo` ![](https://img.shields.io/github/stars/xkcoding/spring-boot-demo.svg?style=social&label=Star)](https://github.com/xkcoding/spring-boot-demo)|spring boot 相关demo学习|    Java    
[`digoal/blog` ![](https://img.shields.io/github/stars/digoal/blog.svg?style=social&label=Star)](https://github.com/digoal/blog)|国内postgresql大神的一些pg分享|    SQL     
[`jackfrued/Python-100-Days` ![](https://img.shields.io/github/stars/jackfrued/Python-100-Days.svg?style=social&label=Star)](https://github.com/jackfrued/Python-100-Days)|Python - 100天从新手到大师|   python   
[`Asabeneh/30-Days-Of-JavaScript` ![](https://img.shields.io/github/stars/Asabeneh/30-Days-Of-JavaScript.svg?style=social&label=Star)](https://github.com/Asabeneh/30-Days-Of-JavaScript)|30天学js| javaScript 
[`MichaelCade/90DaysOfDevOps` ![](https://img.shields.io/github/stars/MichaelCade/90DaysOfDevOps.svg?style=social&label=Star)](https://github.com/MichaelCade/90DaysOfDevOps)|90天学DevOps|
[`awesome-java-books` ![](https://img.shields.io/github/stars/awesome-java-books.svg?style=social&label=Star)](https://github.com/awesome-java-books)|Java 技术书籍大全|    Java    |



## 常用工具
repositories |   简介    |
| :------------ |:-------:|
[`bestony/logoly` ![](https://img.shields.io/github/stars/bestony/logoly.svg?style=social&label=Star)](https://github.com/bestony/logoly)| 在线logo生成器 |
[`TransparentLC/WechatMomentScreenshot` ![](https://img.shields.io/github/stars/TransparentLC/WechatMomentScreenshot.svg?style=social&label=Star)](https://github.com/TransparentLC/WechatMomentScreenshot)|朋友圈转发截图生成工具
[`docmirror/dev-sidecar` ![](https://img.shields.io/github/stars/docmirror/dev-sidecar.svg?style=social&label=Star)](https://github.com/docmirror/dev-sidecar)|github加速|


## 健康

repositories |   简介    |
| :------------ |:-------:|
[`geekan/HowToLiveLonger` ![](https://img.shields.io/github/stars/geekan/HowToLiveLonger.svg?style=social&label=Star)](https://github.com/geekan/HowToLiveLonger)| 程序员延寿指南 |
[`Anduin2017/HowToCook` ![](https://img.shields.io/github/stars/Anduin2017/HowToCook.svg?style=social&label=Star)](https://github.com/Anduin2017/HowToCook)| 程序员做饭笔记 |


## 项目推荐,科技周刊

repositories |     简介      |
| :------------ |:-----------:|
[`ruanyf/weekly` ![](https://img.shields.io/github/stars/ruanyf/weekly.svg?style=social&label=Star)](https://github.com/ruanyf/weekly)|科技爱好者周刊，每周五发布|
[`GrowingGit/GitHub-Chinese-Top-Charts` ![](https://img.shields.io/github/stars/GrowingGit/GitHub-Chinese-Top-Charts.svg?style=social&label=Star)](https://github.com/GrowingGit/GitHub-Chinese-Top-Charts)|GitHub中文排行榜，各语言分设「软件 | 资料」榜单，精准定位中文好项目。各取所需，高效学习|
||
||


#### [layering-cache](https://github.com/xiaolyuh/layering-cache) 多级缓存框架

#### [redisson](https://github.com/redisson/redisson) 主流的Redis java sdk


#### [arthas](https://github.com/alibaba/arthas) Java诊断利器

#### [incubator-eventmesh](https://github.com/apache/incubator-eventmesh) Apache 动态的云原生事件驱动架构基础设施

#### [netty](https://github.com/netty/netty) 网络应用程序框架


#### [APIJSON](https://github.com/Tencent/APIJSON) 腾讯开源的零代码、全自动、强安全 ORM 库


#### [zookeeper](https://github.com/apache/zookeeper) Apache 分布式协调框架

#### [nacos](https://github.com/alibaba/nacos) 阿里开源注册中心、配置中心框架

#### [checkstyle](https://github.com/checkstyle/checkstyle) java代码规范插件

#### [Kubernetes Java Client](https://github.com/kubernetes-client/java) k8s java client
#### [hotkey](https://gitee.com/jd-platform-opensource/hotkey) 京东热点key缓存
#### [WxJava](https://github.com/Wechat-Group/WxJava) 微信开发 Java SDK
#### [mica](https://github.com/lets-mica/mica) Spring Cloud 微服务开发核心包
#### [spring-cloud-tencent](https://github.com/Tencent/spring-cloud-tencent) 腾讯开源spring cloud 全家桶







### 分库分表
#### [shardingsphere](https://github.com/apache/shardingsphere) 客户端级别分库分表

### 字节码框架
#### [javassist](https://github.com/jboss-javassist/javassist)

### 代码质量检测
#### [sonarqube](https://github.com/SonarSource/sonarqube) 代码检测



## 前端




#### [flash-linux0.11-talk](https://github.com/sunym1993/flash-linux0.11-talk) 像小说一样品读 Linux 0.11 核心代码

#### [system-design-primer](https://github.com/donnemartin/system-design-primer) 学习如何实际大型系统 

#### [ddia](https://github.com/Vonng/ddia) 《Designing Data-Intensive Application》DDIA中文翻译


#### [Go 语言学习资料索引](https://github.com/Unknwon/go-study-index) Go 语言学习资料索引




## 其他


#### [kubernetes](https://github.com/kubernetes/kubernetes) k8s不会有人不认识吧

#### [easy-yapi](https://github.com/tangcent/easy-yapi) Yapi idea接口自动同步

#### [proxy_pool](https://github.com/jhao104/proxy_pool) 爬虫代理IP池

#### [free](https://github.com/freefq/free) 翻墙、免费翻墙、免费科学上网、免费节点、免费梯子

#### [feedback](https://github.com/github/feedback) github官方产品讨论项目





---
## 安全

### [murphysec](https://github.com/murphysecurity/murphysec) 软件供应链安全，具备专业的软件成分分析（SCA）、漏洞检测、专业漏洞库

## 推荐相关

#### [HelloGitHub](https://github.com/521xueweihan/HelloGitHub) 分享 GitHub 上有趣、入门级的开源项目



 repositories | 简介  |
 :------------ |:---:|
[`apache/superset` ![](https://img.shields.io/github/stars/apache/superset.svg?style=social&label=Star)](https://github.com/apache/superset)|数据可视化和数据探索平台


## 贡献指南
[贡献指南](contribution-Asuna.md)