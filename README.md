# Asuna
觉得比较有意思或者有用的开源项目整理(Open source projects that you find interesting or useful)


## Java

### [spring-framework](https://github.com/spring-projects/spring-framework)


### [spring-boot](https://github.com/spring-projects/spring-boot)


###[layering-cache](https://github.com/xiaolyuh/layering-cache)
layering-cache是一个支持分布式环境的多级缓存框架，使用方式和spring-cache类似。它使用Caffeine作为一级本地缓存，redis作为二级集中式缓存。一级缓存和二级缓存的数据一致性是通过推和拉两种模式相结合的方式来保证。推主要是基于redis的pub/sub机制，拉主要是基于消息队列和记录消费消息的偏移量来实现的
