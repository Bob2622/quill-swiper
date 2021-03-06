// TIP: IMPORTANT
// blotname 不能为 p 标签
// 不然会引起 delta 多次插入的情况

import Quill from 'quill'
import Swiper from 'swiper'
import Vdom from 'virtual-dom'
import hyperx from 'hyperx'
import Axios from 'axios'
const BlockEmbed = Quill.import('blots/block/embed')

class SwpierBlot extends BlockEmbed {
  static swiper
  static blotName = 'swiper'
  static tagName = 'div'
  static options = {
    width: '100%',
    height: 'auto',
    imgs: []
  }
  
  static create (options) {
    let node = super.create()
    this.options = options
    return this.renderSwiper(node, options)
  }

  constructor (nodeDom, options) {
    super(nodeDom, options)
  }

  // blot 代表着一次变更
  // delta 生成这次变更的 delta 描述
  delta () {
    // this: 当前 blot 实例
    // this.value: 用以生成 delta 描述详情, 具体实例类需要实现
    // this.attributes: 包含 blot 对应的 domNode, 和其 attributes
    return super.delta()
  }

  static renderSwiper (node, options) {
    // empty content
    node.innerHTML = ''

    // set swiper style
    const swiperDom = document.createElement('div')
    swiperDom.className = 'swiper-container'
    if (this.swiper !== undefined) {
      this.swiper.destroy()
    }
    if (options.imgs.length === 0) {
      return node
    }
    if (options.width !== undefined) {
      swiperDom.style.width = options.width
    }
    if (options.height !== undefined) {
      swiperDom.style.height = options.height
    }
    if (options.align !== undefined) {
      node.className = 'ql-align-' + options.align
    }
    
    // get swiper content
    const hx = hyperx(Vdom.h)
    let wrapper = hx`<div class="swiper-wrapper">
      ${options.imgs.map(function (img, index) {
        return  hx`<div class="swiper-slide"><img src="${img.url}" alt=""></div>`
      })}
    </div>`
    swiperDom.appendChild(Vdom.create(wrapper))

    let pagination = hx`
      <div class="swiper-pagination"></div>
    `
    let paginationDom = Vdom.create(pagination)
    swiperDom.appendChild(paginationDom)

    const _this = this
    swiperDom.addEventListener('dblclick', () => {
      this.showEditDialog.call(_this, node, options)
    })
    
    setTimeout(() => {
      this.swiper = new Swiper(swiperDom, {
        pagination: {
          el: paginationDom,
        } 
      })
      swiperDom.style.height = 'auto'
    }, 200)
    
    node.appendChild(swiperDom)
    return node
  }

  static showEditDialog (node, options) {
    let _this = this
    let dialogDom = node.querySelector('.swiper-edit-dialog')
    if (dialogDom === null) {
      const hx = hyperx(Vdom.h)
      dialogDom = hx`
        <div class="swiper-edit-dialog">
          <div class="swiper-edit-dialog-content">
            <h3>编辑轮播图样式</h3>
            <div><label for="">宽度</label><input type="number" class="swiper-width"></div>
            <div><label for="">高度</label><input type="number" class="swiper-height"></div>
            <div><label for="">对齐方式</label>
              <select class="swiper-align">
                <option value="">请选择对齐方式</option>
                <option value="left">靠左</option>
                <option value="center">居中</option>
                <option value="right">靠右</option>
              </select>
            </div>
            <button class="swiper-btn-style-edit">确定</button>
          </div>
        </div>
      `
      dialogDom = Vdom.create(dialogDom)
      dialogDom.style.display = 'block'
      node.appendChild(dialogDom)
      dialogDom = node.querySelector('.swiper-edit-dialog')
      // close dialog
      dialogDom.addEventListener('click', e => {
        dialogDom.style.display = 'none'
        e.stopPropagation()
      })
      dialogDom.querySelector('.swiper-edit-dialog-content').addEventListener('click', e => {
        e.stopPropagation()
      })
      // change swiper style
      // TODO: 宽高可支持 px 和 百分比 切换
      dialogDom.querySelector('.swiper-btn-style-edit').addEventListener('click', () => {
        _this.options.width = dialogDom.querySelector('.swiper-width').value
        _this.options.height = dialogDom.querySelector('.swiper-height').value
        _this.options.align = dialogDom.querySelector('.swiper-align').value
        _this.renderSwiper.call(_this, node, {
          width: _this.options.width + '%',
          height: _this.options.height + '%',
          align: _this.options.align,
          imgs: options.imgs
        })
        dialogDom.style.display = 'none'
      })
    } else {
      dialogDom.style.display = 'block'
    }

    // set defalut value
    dialogDom.querySelector('.swiper-width').value = this.options.width
    dialogDom.querySelector('.swiper-height').value = this.options.height
    dialogDom.querySelector('.swiper-align').value = this.options.align ? this.options.align.split('-')[2] : ''
  }

  optimize (context) {
    // console.log('this is optimize')
    // console.log(this.domNode)
  }

  static value(node) {
    return this.options
  }
}

// trigger swiper blot
const trigger = function (res, uploadResFormat, fileInput) {
  let range = this.quill.getSelection(true)
  this.quill.insertText(range.index, '\n', Quill.sources.API)
  let _res = uploadResFormat(res)
  this.quill.insertEmbed(range.index + 1, 'swiper', {
    imgs: _res
  }, Quill.sources.API)
  fileInput.value = ""
}

// parse img to data url
const parseDataUrl = function (fileInput, options) {
  let fileReadpromises = []
  Array.from(fileInput.files).forEach(file => {
    fileReadpromises.push(new Promise((resolve, reject) => {
      let reader = new FileReader()
      reader.onload = (e) => { 
        resolve(e.target.result)
      }
      reader.readAsDataURL(file)
    }))
  })
  Promise.all(fileReadpromises).then(res => {
    trigger.call(this, 
      res.map(file => ({ url: file })),
      options.uploadResFormat, 
      fileInput
    )
  })
}

// upload img
const upload = function (fileInput, options) {
  let formData = new FormData()
  Array.from(fileInput.files).forEach(file => {
    formData.append('files[]', file)
  })
  Axios.post(options.url, formData, {
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(res => {
    trigger.call(this, res, options.uploadResFormat, fileInput)
  })
}

const SwiperHandler = function (options) {
  const _options = Object.assign({
    upload: true,
    url: '/upload',
    // @return res structure
    // [
    //   { url: 'http://www.xx.xx.jpg' },
    //   { url: 'http://www.xx.xx.jpg' },
    // ]
    uploadResFormat: res => res,
  }, options)
  return function () {
    let fileInput = this.container.querySelector('.ql-swiper-upload')
    if (fileInput === null) {
      fileInput = document.createElement('input')
      fileInput.setAttribute('type', 'file')
      fileInput.setAttribute('multiple', true)
      fileInput.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon')
      fileInput.classList.add('ql-swiper-upload')
      fileInput.style.display = 'none'
      this.container.appendChild(fileInput)

      fileInput.addEventListener('change', () => {
        if (fileInput.files != null && fileInput.files[0] != null) {
          // upload
          if (_options.upload) {
            upload.call(this, fileInput, _options)
          } else {
            // parse img to data url
            parseDataUrl.call(this, fileInput, _options)
          }
        }
      })
    }
    fileInput.click()
  }
}


export { SwpierBlot as default, SwiperHandler }
