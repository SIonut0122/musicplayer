import React      from 'react';
import slidecard  from '../js/slidecard.js';
import M          from 'materialize-css';
import WheelReact from 'wheel-react';
import '../css/Main.css';
import 'materialize-css'; 
import 'materialize-css/dist/css/materialize.min.css';
 



class Main extends React.Component {
  constructor() {
    super()
    this.state = {
          loading:         true,
          slidecard:       slidecard,
          audio:           new Audio(),
          progressBar:     0,
          seeking:         false,
          volSeeking:      false,
          prepareNextSong: false,
          playPrevSong:    false,
          playNextSong:    false,
          enterKeyPlay:    false,
          data:            undefined,
    }
  }


componentDidMount() {
  let elems       = document.querySelectorAll('.carousel'),
      progressBar = document.querySelector('.progress_ul'),
      progressVol = document.querySelector('.progress_volume'),
      loadingText = document.querySelector('.loading_text'),
      body        = document.querySelector('body'),
      audio       = this.state.audio;
      // Initiate Materialize carousel
      M.Carousel.init(elems, {shift: 20, onCycleTo: (e) => this.carSlide(e)});

      body.addEventListener        ('click'     , (e) => this.handleBodyEventClick(e), false);
      progressBar.addEventListener ('mousedown' , (e) => this.handleProgressBar(e),    false);
      progressBar.addEventListener ('mousemove' , (e) => this.handleSeekProgress(e),   false);
      progressVol.addEventListener ('mousedown' , (e) => this.handleVolBar(e),         false);
      progressVol.addEventListener ('mousemove' , (e) => this.handleVolProgress(e),    false);
      document.addEventListener    ('mouseup'   , (e) => this.handleVolFalse(e),       false);
      document.addEventListener    ('mouseup'   , (e) => this.handleSeekFalse(e),      false);
      document.addEventListener    ('keydown'   , (e) => this.handleBodyKey(e),        false);
      window.addEventListener      ('resize'    , (e) => this.handleWindResize(e),     false);
      audio.addEventListener       ('timeupdate', (e) => this.timeUpdate(audio),       false);
      audio.volume = 0.7;
      
      // Create li childs inside ul progress bar to handle range slider progress
      this.createLi();
      this.carouselStyle();

      // Loading container texts
      if(this.state.loading) {
        setTimeout(() => {
          loadingText.innerHTML = 'Loading player...';
        },3000);
        setTimeout(() => {
          loadingText.innerHTML = 'Loading playlist...';
        },5000);
          // Hide loading div / Increase wrap-container opacity
        setTimeout(() => {
          this.setState({ loading: false })
           document.querySelector('.wrap_wrapper').style.opacity = '1';
        },6500)
      }

      document.title = 'Music Player';
}

carouselStyle() {
    // On normal size, set full width of carousel
 if(window.innerWidth > 1250) {
  document.querySelector('.carousel').setAttribute('style', 'overflow:visible !important');
 } else {
  document.querySelector('.carousel').removeAttribute('style');
 }
}

controlSlider(e)  {
    // Slider controls for mobile
  if(e.target.className === 'm_left') {
    M.Carousel.getInstance(document.querySelector('.carousel')).prev();
  } else {
    M.Carousel.getInstance(document.querySelector('.carousel')).next();
  }
}

handleWindResize(e) {
  // On normal size, set full width of carousel
  if(window.innerWidth > 1250) {
  document.querySelector('.carousel').setAttribute('style', 'overflow:visible !important');
 } else {
  document.querySelector('.carousel').removeAttribute('style');
 }
}

handleBodyKey(e) {

  switch(e.keyCode) {
    case 32:
    // Handle space key
    this.playPauseSong();
    break;
    case 37:
    // Move slide to left
    M.Carousel.getInstance(document.querySelector('.carousel')).prev();
    break;
    case 39:
    // Move slide to right
    M.Carousel.getInstance(document.querySelector('.carousel')).next();
    break;
    case 13:
    // On enter, play slide
    this.state.data.querySelector('.sc_play_button').click(); 
    break;
    default:
    return false;
  }
}

handleHoverProgress() {
    // If song is playing, display thumb seeker when hovering over progress seek
  if(this.state.audio.readyState !== 0) {
    document.querySelector('.thumb').style.opacity = '1';
  }
}

handleHoverOutProgress() {
  // Hide thumb seeker when hovering out
  document.querySelector('.thumb').style.opacity = '0';
}

handleProgressBar(e) {
   this.setState({  seeking: true })
   this.handleSeekProgress(e);
}

handleSeekProgress(e) {
  e.preventDefault();
  let audio      = this.state.audio,
    // Convert li elements intro array to get every index of li
      nodes      = Array.prototype.slice.call( document.getElementById('progress_ul').children ),
    // Get index of hovered li
      getPercent = parseFloat(nodes.indexOf(e.target));

    // If seeking and song is playing
  if(this.state.seeking && audio.readyState !== 0 && e.buttons === 1) {
    let audioCurrentTime  = audio.duration * (getPercent / 100);
        audio.currentTime = audioCurrentTime;
    this.setState({ progressBar: getPercent})
      // Increase size for thumb when seeking
      document.querySelector('.thumb').setAttribute('style','transform:scale(1.3)');
  }
}

handleSeekFalse(e) {
  let audio = this.state.audio;

 if(this.state.seeking && audio.readyState !== 0) {
    // Seek to current audio position according to progressBar clicked percent
  let audioCurrentTime  = audio.duration * (this.state.progressBar / 100);
      audio.currentTime = audioCurrentTime;
    // Set default size to thumb seeker
  document.querySelector('.thumb').removeAttribute('style');
  this.setState({ seeking: false })
  }
}

handleVolBar(e) {
  this.setState({  volSeeking: true })
  this.handleVolProgress(e);
}

handleVolProgress(e) {
   e.preventDefault();
        // Convert li elements intro array to get every index of li
  let nodes          = Array.prototype.slice.call( document.querySelector('.progress_volume').children ),
        // Get index of hovered li
      getPercent     = parseFloat(nodes.indexOf(e.target)),
      volProgressBar = document.querySelector('.vol_progress_wrap_perc'),
      audio          = this.state.audio;

  if(this.state.volSeeking && e.buttons === 1 && getPercent >= 0) {
       this.setState({ draggingVolumeDown: true })
      // Because progress volume bar height is '120px', every percent will be multiplied with 12 (10 x 12 = 120px)
      volProgressBar.style.height = getPercent * 12+'px';
      // Set volume due to percentVolume. (1.0 - default, 0.0 - mute)
    if(getPercent === 10) {
          audio.volume = 1.0;
          audio.muted  = false;
    } else if(getPercent === 0) { 
          audio.muted  = true;
    } else {
      let volPerc      = 0+'.'+getPercent;
          audio.muted  = false;
          audio.volume = parseFloat(volPerc);
    }
  }
}

handleVolFalse(e) {
  this.setState({  volSeeking: false, draggingVolumeDown: false })
}

timeUpdate(e) {
  let curTime     = document.getElementById('timer'),
      songTime    = document.getElementById('song_duration'),
      barlength   = Math.round(e.currentTime * (100 / e.duration)),
      curMins     = Math.floor(e.currentTime / 60),
      curSecs     = Math.floor(e.currentTime - curMins * 60),
      mins        = Math.floor(e.duration / 60),
      secs        = Math.floor(e.duration - mins * 60);
      (curSecs < 10) && (curSecs = '0' + curSecs);
      (secs    < 10) && (secs    = '0' + secs   );
        // Set innerHTML display time when song is playing.
      curTime.innerHTML  = curMins + ':' + curSecs;

        // Handle NaN:NaN timer song error
      if(isNaN(parseFloat(mins)) && isNaN(parseFloat(secs))) {
         songTime.innerHTML = '0:00';
      } else {
         songTime.innerHTML = mins + ':' + secs;}

      this.setState({ audio: e, progressBar: barlength})
        // Call function when song ends
      if(e.ended) {
        this.audioEneded();
      }
       // Handle progress fill style width at the beginning of the song
      if(barlength > 2) {
        document.querySelector('.fill_progress').classList.remove('fill_progress_style');
      } else {
        document.querySelector('.fill_progress').classList.add('fill_progress_style');
      }
  }

playThisSong(e,card) {
 let playPauseButton     = document.querySelector('.pp_button'),
     wave                = document.querySelector('.wave'),
     cardPlayButtonIcon  = document.querySelectorAll('.i_play_butt'),
     cardPlayButton      = document.querySelectorAll('.sc_play_button'),
     progressSongTitle   = document.querySelector('.progress_song_title'),
     audio               = this.state.audio;

      // Toggle play / pause icon button for slider item
   if(playPauseButton.classList.contains('play_pause_active')) {
      playPauseButton.classList.remove('play_pause_active');
      wave.setAttribute('style', 'height:300px !important;opacity:0 !important');
   } else {
      playPauseButton.classList.add('play_pause_active');
      wave.setAttribute('style', 'height:800px !important;opacity:1 !important');
   }

    // Toggle play / pause icon for player
      // If clicked card is not playing, proceed
  if(e.target.querySelector('.i_play_butt').classList.contains('fa-play')) {
      
        // Reset all slidecard play buttons (play/stop icon)
      for(let i=0; i<cardPlayButtonIcon.length;i++) {
        cardPlayButtonIcon[i].classList.remove('fa-stop');
        cardPlayButtonIcon[i].classList.add('fa-play');
      }
      // Reset all slidecard play button icon (button style)
      for(let i=0; i<cardPlayButton.length;i++) {
        cardPlayButton[i].classList.remove('sc_stop_button');
      }
        // Romove 'play icon' and add 'stop icon'
       e.target.querySelector('.i_play_butt').classList.remove('fa-play');
       e.target.querySelector('.i_play_butt').classList.add('fa-stop');
       e.target.classList.add('sc_stop_button');
        // Change url song, load it and play it
         audio.src = card.url;
         audio.load();
         audio.play();
         wave.setAttribute('style', 'height:800px !important;opacity:1 !important');
         playPauseButton.classList.add('play_pause_active');
         progressSongTitle.innerHTML = card.artist+" - "+card.title;
         document.title = card.artist+" - "+card.title;
  } else {
        // Reset slidecard play button (play/stop icon)
      for(let i=0; i<cardPlayButtonIcon.length;i++) {
        cardPlayButtonIcon[i].classList.remove('fa-stop');
        cardPlayButtonIcon[i].classList.add('fa-play');
      }
        // Reset slidecard play button icon (button style)
      for(let i=0; i<cardPlayButton.length;i++) {
        cardPlayButton[i].classList.remove('sc_stop_button');
      }
         // Restore default to play/pause button
       playPauseButton.classList.remove('play_pause_active');  
        // Reset player
       audio.pause();
       audio.currentTime = 0;
       audio.src = '';
       document.querySelector('.fill_progress').style.width = 0;
       document.getElementById('song_duration').innerHTML = '0:00';
       document.getElementById('timer').innerHTML = '0:00';
       wave.setAttribute('style', 'height:300px !important;opacity:0 !important');
       progressSongTitle.innerHTML = '---';
       document.title = 'Music Player';
  }
}


repeatSong(e) {
  let audio = this.state.audio;
    // Toggle loop
  if(audio.loop) {
    e.target.classList.remove('repeat_div_active')
    audio.loop = false;  
  } else {
    e.target.classList.add('repeat_div_active')
    audio.loop = true;
  }
}

playerNextPrev(e) {
  let prevButton = document.querySelector('.prev_button');
  let nextButton = document.querySelector('.next_button');
 
 if(e.target.classList.contains('prev_button')) {
        // Disable pointer events to give delay
       prevButton.style.pointerEvents = 'none';
       setTimeout(function() {
        prevButton.style.pointerEvents = 'visible';
       },1000);
      // If song ends, set next slide and prepare nextSong
    M.Carousel.getInstance(document.querySelector('.carousel')).prev();
    this.setState({ playPrevSong: true })
 } else {
        // Disable pointer events to give delay
       nextButton.style.pointerEvents = 'none';
       setTimeout(function() {
        nextButton.style.pointerEvents = 'visible';
       },1000);
       // If song ends, set next slide and prepare nextSong
    M.Carousel.getInstance(document.querySelector('.carousel')).next();
    this.setState({ playNextSong: true })
  }
}

carSlide(data) { 
     this.setState({ data: data })
      // Prepare next song / Play prev / next song
  if(this.state.prepareNextSong) {
      // If song ends, play next song
    data.querySelector('.sc_play_button').click();
    this.setState({ prepareNextSong: false })
  } else if(this.state.playPrevSong) {
      // If prev button is clicked
    data.querySelector('.sc_play_button').click();
    this.setState({ playPrevSong: false })
  } else if(this.state.playNextSong) {
    data.querySelector('.sc_play_button').click();   
    this.setState({ playNextSong: false })
  } 
}


playPauseSong() {
  let audio           = this.state.audio,
      playPauseButton = document.querySelector('.pp_button'),
      wave            = document.querySelector('.wave');
    // If song is loaded, continue.
  if(audio.readyState !== 0) {
     playPauseButton.classList.toggle('play_pause_active');
  if(audio.paused) {
      audio.play()
      wave.setAttribute('style', 'height:800px !important;opacity:1 !important');
  } else {
      audio.pause();
      wave.setAttribute('style', 'height:300px !important;opacity:0 !important');
  }
 }
}


handleWheel(e) {
  let elems    = document.querySelector('.carousel'),
      instance = M.Carousel.getInstance(elems);

  WheelReact.config({
    up: () => {
      instance.next();
    },
    down: () => {
      instance.prev();
    }
  });
}

createLi() {
    // Create 100 li elements to handle progress range seek
  let ul = document.getElementById('progress_ul');
  for(let i=0;i<100;i++){
    let li = document.createElement('li');
    ul.appendChild(li); 
  }
 }

openVolContainer(e) {
    e.stopPropagation();
    // If !mousedown & dragging volume !== true
    if(!this.state.draggingVolumeDown) {
      document.querySelector('.volume_container').classList.toggle('active_volcont');
    }
}

handleHoverVolCont() {
  // Set delay to avoid oppening the volume container when passing over the volume icon
  window.hoverTimeout = setTimeout(function() {
    if(!document.querySelector('.volume_container').classList.contains('active_volcont')) {
        document.querySelector('.volume_container').classList.add('active_volcont');
    }
  },200);
}

handleHoverOutVolCont() {
    // Clear timeout if cursor exits from Volume icon   
  clearTimeout(window.hoverTimeout);
}

handleBodyEventClick(e) {
      // If e.target.parentNode is not Volume container, close it
  if(e.target.parentNode.classList.contains('volume_container') ||
     e.target.parentNode.classList.contains('progress_volume')  ||
     e.target.parentNode.classList.contains('vol_progress_bar')) {
    return false;
  } else {
    document.querySelector('.volume_container').classList.remove('active_volcont');
  }
}

audioEneded() {
  let audio = this.state.audio;

  if(!audio.loop) {
    audio.load();
    audio.currentTime = 0;
    document.querySelector('.pp_button').classList.remove('play_pause_active');
    document.getElementById('song_duration').innerHTML = '0:00';
    this.setState({ progressBar: 0 })
    document.querySelector('.wave').setAttribute('style', 'height:300px !important;opacity:0 !important');

      // If song ends, set next slide and prepare nextSong
     M.Carousel.getInstance(document.querySelector('.carousel')).next();
     this.setState({ prepareNextSong: true })
  }
}



render() {
  return (
    <div>
      <div className='row center'>
       <div className='body_submodal'></div>
        <div className='wrap-container col s11 l9' tabIndex='0'>
          
            {/* Loading container */}
            {this.state.loading && (
            <div className='loading_container center'>
              <div className='row center'>
                <div className='col load_cont_wrap'>
                  <span className='col loading_image'></span>
                  <span className='col spining_load'>
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                  <span className='diagonal_load'><span></span></span>
                  <span className='loading_text'>Loading...</span>
                </div>
              </div>         
            </div>
            )}

          <div className='wrap_wrapper'>
            {/* Social media box */}
            <div className='wrap_social_media'>
              <a href='https://www.linkedin.com/in/stan-ionut-1193a0159/'>
                <span><i className='fab fa-linkedin-in'></i></span>
              </a>
              <a href='https://github.com/SIonut0122'>
                <span><i className='fab fa-github'></i></span>
              </a>
            </div>
            <div className='row'>
              <div className='container' {...WheelReact.events}>

                <div className='carousel col s12'  onWheel={(e) => this.handleWheel(e)}>
                 {this.state.slidecard.map((card,ind) =>
                  <span key={ind} id={card.id} className="carousel-item" href="#one!" draggable='false'>
                    <span style ={ { backgroundImage: "url("+card.image+")" } } className='slidecard_wrap'> </span>
                    <span className='slidercard_wrap_wrapper'><img alt='' src={require('../images/1.png')}/></span>
                    <img className='slidecard_cover_img' alt='' src={card.image}/>

                    <span className='row'>
                      <span className='row'>
                        <ul>
                          {/* Artist title / song */}
                          <li className='sc_song_title'>{card.title}</li>
                          <li className='sc_song_artist'>{card.artist}</li>
                          
                          <li className='sc_action_div col'>
                            {/* Left info genre / year song */}
                            <span className='sc_descr_box'>
                               <ul>
                                <li>{card.genre}</li>
                                <li>{card.year}</li>
                               </ul>
                            </span>

                            {/* Slidecard play button */}
                            <span className='sc_wrap_play_button'>
                              <span className='sc_play_button' onClick={(e) => this.playThisSong(e,card)}>
                                <i className='fas fa-play i_play_butt'></i>
                              </span>
                            </span>
                            {/* Right info track no / duration */}
                            <span className='sc_util'>
                              <ul>
                                <li>#{card.id}</li>
                                <li>{card.length}</li>
                               </ul>
                            </span>
                          
                          </li>
                        </ul>
                      </span>
                    </span>
                  </span>
                  )}
                </div>
                {/* Mobile carousel controls */}
                <div className='wrap_control_carousel'>
                  <span className='m_left' onClick={(e) => this.controlSlider(e)}></span>
                  <span className='m_right' onClick={(e) => this.controlSlider(e)}></span>
                </div>
              </div>
            </div>

            {/* Player action buttons */}
            <div className='row'>
              <div className='player_actions_div col s11 m8 l7'>
                <div className='row'>
                  {this.state.audio !== undefined && (
                    <div>
                      <div className='repeat_div' onClick={(e) => this.repeatSong(e)}></div>
                           
                      <div className='player_action_button prev_button' onClick={(e) => this.playerNextPrev(e)}></div>
                      <div className='player_action_button play_pause_button pp_button'onClick={() => this.playPauseSong()}></div>
                      <div className='player_action_button next_button' onClick={(e) => this.playerNextPrev(e)}></div>
                    </div>
                  )}
                  {/* Volume container */}
                  <div className='volume_container'>
                      <div className='volume_wrap_progress'>
                        <div className='col vol_progress_bar'>
                          <div className='vol_progress_wrap'><span className='vol_progress_wrap_perc'></span></div>
                          <ul className='progress_volume'>
                            <li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li>                          
                          </ul>
                        </div>
                      </div>
                      <div className='volume_icon' 
                           onClick     = {(e) => this.openVolContainer(e)} 
                           onMouseOver = {() => this.handleHoverVolCont()}
                           onMouseOut = {() => this.handleHoverOutVolCont()}>
                           {this.state.audio !== undefined && (
                            <div>
                             {this.state.audio.muted ? (
                              <img src={require('../images/player/volume_off.png')} alt=''/>
                              ):(
                              <img src={require('../images/player/volume_up.png')} alt=''/>
                              )}
                            </div>
                           )}
                      </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Song progress seeker */}
            <div className='col s12 m8 l7 progress_container'>
              <div className='row'>
                <div className='col s8 wrap_song_details'>
                  <span className='progress_song_title'>---</span>
                </div>

                <div className='wrap_song_timer'>
                  <div className='timer_wrap'>
                    <span id='timer'>0:00</span>
                  </div>
                  /
                  <div className='song_duration_wrap'>              
                        <span id='song_duration'>0:00</span>
                  </div>
                </div>
              </div> 

              <div className='fill_progress' style={{width: this.state.progressBar+'%'}}>
                <span className='thumb'></span>
              </div>
            
              <ul id='progress_ul' className='progress_ul' 
                  onMouseOver={() => this.handleHoverProgress()}
                  onMouseOut={() => this.handleHoverOutProgress()}>
              </ul>
            </div>

            {/* Wave animation */}
            <div className='wrap_cont_modal'>
              <div className='wrapper_wave'>
                <div className='wave'></div>
              </div>
            </div>
          </div>

        </div>
      </div>
      {/* Footer text */}
      <div className='col s12 center'>
        <span className='footer_txt'>&#x000A9;2020 - ionutdev.com</span>
      </div>
    </div>
    ) 
  }
}

export default Main;