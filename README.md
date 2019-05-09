### Detail
swiper for quill



### start
```
npm i quill-swiper swiper quill --save

// import css
import SwiperCss from 'swiper/dist/css/swiper.min.css'
import Snow from 'quill/dist/quill.snow.css'
import Snow from 'quill-swiper/dist/index.css'

// import js
import SwpierBlot from 'quill-swiper'
import { SwiperHandler } from 'quill-swiper'
Quill.register(SwpierBlot)

// new Quill
let quill = new Quill('#editor', {
  modules: { 
    toolbar: {
      container: '#toolbar',
      handlers: {
        swiper: SwiperHandler({ 
          upload: false
        }),
      }
    }
  },
  theme: 'snow'
})
```



### tooltip swiper 图标

> 使用 option 配置

```
// options
  {
    modules: {
      toolbar: [
        ...
        ['image', 'swiper']
      ]
    }
  }
```

> 自定义

```
  <button class="ql-swiper">
```
两种方案都需引入 `quill-swiper.css`



### 添加上传地址
```
  // 默认是图片转换为 base64 格式
  // 如需上传图片
  new Quill('#editor', {
    modules: { 
      toolbar: {
        container: '#toolbar',
        handlers: {
          swiper: SwiperHandler({ 
            upload: true,
            url: '/upload', // 指定上传地址
            uploadResFormat: res => res
          }),
        }
      }
    }
  })
```
uploadResFormat为`上传图片接口`返回数据的`格式化`    
需求返回的数据格式为
```
  [
    { url: 'http://www.xx.xx.jpg' },
    { url: 'http://www.xx.xx.jpg' },
    ...
  ]
```


### run demo
```
git clone https://github.com/Bob2622/quill-swiper.git

npm i 

cd demo

npm i

npm run serve
```



### TIP
* `.swiper-container` 需要设置固定高度, 不然 swiper 无法正常运行, 但在 swiper 生成过程中会恢复为 `auto`
* Error: [Parchment] Cannot insert swiper into scroll
```
  // app.vue 中 quill 和 siperblot 中 quill 的引用源不同引起的, ex
  // app.vue
  import Quill from 'quill'
  ...

  // swiperBlot.js 
  import Quill from '../../quill'
  ...

  // 如果 quill-swiper 的目录下也有安装的 node_modules 会引起引用源不同的情况
  // 此时删掉该目录下的 node_modules 
  // 会自动向上寻找 node_modules 引用项目下的 quill
```



### feture
* 宽度支持百分比和px切换