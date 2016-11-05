//h5载体组件

var H5 = function() {

  // 获取h5.js的加载路径
  var Root = null;
  var _index = null;
  $('script').each(function(i) {
    var _src = $(this).attr('src');
    if( _src ) {
      _index = _src.indexOf('h5.js');
    }
    if( _src && _index > 0 ) {
      Root = _src.slice(0, -8);
      return;
    }
  });
  // 首先加入H5基本样式表
    var _css = $('<link rel="stylesheet" href="'+Root+'css/h5Base.css">');
    _css.appendTo('head');
  // 加入基本组件JS到页面中
  // 这里就有意思了
  var baseJS = $('<script src="'+Root+'js/H5ComponentBase.js">');
  baseJS.appendTo('head');  
  // 检查组件是否加入
  this.checkComponent = function(type) {
    if(!this[type]) {
      this[type] = type;
      var addJS = $('<script src="'+Root+'js/H5Component'+type+'.js">');
      addJS.appendTo('body');
    }
  };



  //取得一个随机数来作为id取值，这里保留小数点后3位
  var _id = Math.round( ( Math.random()*1000 ) ) / 1000;
  //替换小数点位下划线
  this.id = ('h5_' + _id).replace('.','_'); 
  
  this.ele = $('<div class="h5" id="'+ this.id +'"></div>').hide();
  $('body').append(this.ele);

  this.page = [];

  return this;

};

H5.prototype = {

  //添加H5页面
  addPage: function(setClass, text) {

    

    var _page = $('<div class="h5_page section"></div>');

    setClass && _page.addClass(setClass);
    text && _page.text(text);
    //注意这里是this.ele里加入page
    this.ele.append(_page);
    
    //获取所有的h5_page
    this.page.push( _page );

    return this;

  },
  //添加每页的组件
  addComponent: function(setClass, cfg) {

    var config = cfg || {};
    config = $.extend({
      //添加默认配置
      type: 'base'
    },cfg);

    var component;
    switch( config.type.toLowerCase() ) {
      case 'base':
        component = new H5ComponentBase(setClass, config);
        break;
      case 'bar':
        // 是否加入了bar组件
        this.checkComponent('Bar');
        component = new H5ComponentBar(setClass, config);
        break;
    }

    //将组件添加到指定创建的页面
    //这里使用链式调用，所以指的是上一步刚创建的page页面
    //如何获取刚创建的page页面？这里就用到this.page
    //这里通过slice来取得最后一个h5_page对象
    var page = this.page.slice(-1)[0];
    page.append(component);

    return this;

  },
  //初始化页面加载
  loader: function() {

    this.ele.fullpage({
      /*接收 index、nextIndex 和 direction 3个参数：
      **index 是离开的“页面”的序号，从1开始计算；
      **nextIndex 是滚动到的“页面”的序号，从1开始计算；
      **direction 判断往上滚动还是往下滚动，值是 up 或 down
      */
      'onLeave': function(index, nextIndex, direction) {
        $(this).find('.h5_component').trigger('onLeave');
      },
      //anchorLink 是锚链接的名称，index 是序号，从1开始计算
      'afterLoad': function(anchorLink, index) 
      {
        $(this).find('.h5_component').trigger('onLoad');
      }

    });
    this.ele.show();

  }

};