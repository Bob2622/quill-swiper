<template>
  <div id="app">
    <div id="toolbar">
      <button class="ql-swiper"></button>
    </div>

    <div id="editor" ref="editor"></div>
    <button @click="commit">commit</button>
  </div>
</template>

<script>
import SwiperCss from 'swiper/dist/css/swiper.min.css'
import Quill from 'quill'
import Snow from 'quill/dist/quill.snow.css'
import SwpierBlot from '../../src/swiperBlot'
import { SwiperHandler } from '../../src/swiperBlot'
Quill.register(SwpierBlot)

export default {
  name: 'app',
  data () {
    return {
      quill: null,
      file: null
    }
  },
  methods: {
    commit () {
      console.log(this.quill.getContents())
    }
  },
  mounted () {
    this.quill = new Quill('#editor', {
      modules: { 
        toolbar: {
          container: '#toolbar',
          handlers: {
            'swiper': SwiperHandler({ 
              upload: false
              // upload: true,
              // url: '/upload',
              // uploadResFormat: function (res) {
              //   return res.data.files
              // }
            }),
          }
        }
      },
      theme: 'snow'
    })
  }
}
</script>

<style lang="less">
@import '../../src/swiperBlot.less';

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.ql-editor {
  width: 100%;
  height: 600px;
  .swiper-container {
    width: 100%;
    height: 200px;
  }
}
</style>
