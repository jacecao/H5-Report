// loading组件

var H5_loading = function( images , indexpage ) {
  $('.h5_loading').show();
  var id = this.id;

  if( this._images === undefined ) { // 第一次加载

    this._images = (images || []).length;
    this._loaded = 0;
    window[id] = this;
    for( var i = 0; i < images.length; i++ ) {
      var item = images[i];
      var img = new Image();
      img.onload = function() {
        window[id].loader();
      };
      img.src = item;
    }
    $('#loading_rate').text('0%');
    $('.h5_loading_process .process_bar').css('width', '0');
    return this;

  }else{

    this._loaded ++;
    $('#loading_rate').text( Math.floor( this._loaded / this._images * 100) + '%' );
    $('.h5_loading_process .process_bar').css('width', Math.floor( this._loaded / this._images * 100) + '%');
    if( this._loaded < this._images) {
      return this;
    }

  }

  window[id] = null;
  $('.h5_loading').hide();

  this.ele.fullpage({
    /* onLeave默认 index、nextIndex 和 direction 3个参数：
    ** index 是离开的“页面”的序号，从1开始计算；
    ** nextIndex 是滚动到的“页面”的序号，从1开始计算；
    ** direction 判断往上滚动还是往下滚动，值是 up 或 down
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
  // 加载指定的页面
  if( indexpage ) {
    $.fn.fullpage.moveTo( indexpage );
  }

};
