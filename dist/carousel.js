var Carousel = Class.create({
  initialize : function(element, options) {
    this.options = Object.extend({
      activeClassName: 'active',
      debug: false,
      displayDuration: 5,
      pagingItemHtml: '<a href="#{hash}" title="Skip to slide #{num}">#{num}</a>',
      pagingContainerClass: 'carousel-paging',
      randomiseFirstSlide: false,
      slideClass: 'carousel-slide',
      slideFadeDuration: 1
    }, options || {});

    this.isAnimating = false;
    this.slidesContainer = $(element);
    this.slides = this.slidesContainer.select('.'+this.options.slideClass);
    this.totalSlides = this.slides.size(); // grab the total number of slides

    // if required, randomise the first slide
    this.index = (this.options.randomiseFirstSlide) ? Math.floor(Math.random() * this.totalSlides) : 0;

    this.buildPagination();
    this.build();
    this.play();
  },
  activateSlide: function() {
    var activeSlide = this.slidesContainer.down('div.'+this.options.activeClassName);
    if(activeSlide) {
      activeSlide.removeClassName(this.options.activeClassName);
    }
    this.slides[this.index].addClassName(this.options.activeClassName);
    this.activatePagingLink();
  },
  activatePagingLink: function() {
    if(this.activePagingLink = this.pagination.down('li.'+this.options.activeClassName)) {
      this.activePagingLink.removeClassName(this.options.activeClassName);
    }
    this.pagination.select('li')[this.index].addClassName(this.options.activeClassName);
  },
  addListeners: function() {
    this.onClickListener = this.onClick.bindAsEventListener(this);
    this.slidesContainer.observe('click', this.onClickListener);
  },
  animate: function(){
    var slideToShow = this.slides[this.index];

    this.fx = new S2.FX.Morph(slideToShow, {
      after: function() {
        this.slidesContainer.down('div.'+this.options.activeClassName).hide();
        this.activateSlide();
        this.isAnimating = false;
      }.bind(this),
      before: function() {
        this.isAnimating = true;
        // move current slide back on in z index stack
        this.slidesContainer.down('div.'+this.options.activeClassName).setStyle({
          zIndex: 98
        });

        // bring next slide forward in z index stack, set initial opacity to 0 (transparent)
        // and then show it (although it won't be visible as it's see thru, innit)
        slideToShow.setStyle({
          opacity: 0,
          zIndex: 99
        }).show();

        this.activatePagingLink();
      }.bind(this),
      duration: this.options.slideFadeDuration,
      engine: 'javascript', // once the CSS3 opacity fade bug has been fixed in S2, this line can be removed
      style: 'opacity: 1'
    }).play();
  },
  build: function(){
    this.resetSlides();
    this.addListeners();
    this.slides[this.index].show();
    this.activateSlide();
  },
  buildPagination: function(){
    var ul = new Element('ul'),
        pagingItemTemplate = new Template(this.options.pagingItemHtml);

    this.pagination = new Element('div').addClassName(this.options.pagingContainerClass).update(ul);
    this.slides.each(function(slide, idx){
      ul.insert(new Element('li')
        .update(pagingItemTemplate.evaluate({
          hash: '#'+slide.id,
          num: idx+1
        }))
      );
    }.bind(this));

    this.slidesContainer.insert(this.pagination);
  },
  onClick: function(e){
    var clicked = false;

    if(clicked = e.findElement('.'+this.options.pagingContainerClass+' a')){
      e.stop();
      this.pe.stop();
      this.prev = this.index;
      this.index = this.slides.indexOf($(e.target.hash.substring(1)));
      this.show();
    }

    return clicked;
  },
  next : function() {
    // store current (soon to be previous) slide
    this.prev = this.index;

    // if we at the end of the slides, go back to the start, else move to next one
    this.index = (this.index == this.totalSlides-1) ? 0 : this.index+1;
    this.show();
  },
  play : function() {
    this.pe = new PeriodicalExecuter(this.next.bind(this), this.options.displayDuration);
  },
  resetSlides : function() {
    this.slides.each(function(el) {
      el.setStyle({
        left: 0,
        'position': 'absolute',
        top: 0,
        zIndex: 98
      }).hide();
    });
  },
  show : function() {
    if(!this.slides[this.index].hasClassName(this.options.activeClassName)){
      if(this.isAnimating){
        this.fx.cancel();
        this.isAnimating = false;
        this.resetSlides();
        this.slides[this.index].setStyle({
          zIndex: 99
        }).show();

        this.activateSlide();
      }else{
        this.animate();
      }
    }
  }
});