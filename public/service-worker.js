// service-worker.js

const PIC_CATCH = 'pic_catch';
const VERSION_CATCH = '1';

/**
 * TODO: 做静态资源的缓存，用于手动更新游戏
 * 
 * 1、每次更新游戏提供版本
 * 2、提供接口列出所有资源地址
 * 3、挨个请求资源地址，缓存到本地
 * 4、缓存版本号
 * 5、再APP.vue里，做版本对比，使用 message 事件通知是否更新
 * 6、如果需要更新，则在 service-worker.js 里调用 self.skipWaiting()，强制更新
 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PIC_CATCH)
      .then(cache => cache.addAll([
        '/image/bg_1.webp'
      ]))
  );
});

self.addEventListener('activate', event =>{
  const cacheWhitelist = [PIC_CATCH];
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(keyList.map(key => {
        if (!cacheWhitelist.includes(key)) {
          return caches.delete(key);
        }
      }))
  ))
})


self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
