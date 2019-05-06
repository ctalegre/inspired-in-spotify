import React from 'react';
import './loader.css';
import './player.css';



// return a RENDER of a GROUP/LIST of songs/playlists/artists/albums
function List(props) {
  return (
    <div className="section" style={{background:props.styles}}>
      <h1>{props.type}</h1>
      <ul>
      { props.list.map((item, index) =>
        // console.log(item.images[0].url)
          <li key={index} onClick={() => props.callbackSong(item)}>
              <div>
              <img src={item.images && item.images[0] ? item.images[0].url : item.album && item.album.images[0] ? item.album.images[0].url : "https://developer.spotify.com/assets/branding-guidelines/icon2@2x.png"} alt="" height="33" width="33"/>
              <div className="cut-text">{item.name}</div>
              </div>
          </li>
      )}                      
      </ul>
    </div>
  )
}


// return a RENDER of the Media player
function Player (props){
      return (
        <div className={'player' + (props.isPlayerActive ? ' active':'') + (props.isPlaying ? ' playing':'')}>
          <div id="info" className={'info' + (props.isPlaying ? ' active':'')}>
            <span className="artist">{props.trackInfo.name}</span>
            <span className="name">{props.trackInfo.name}</span>
            <div className="progress-bar">
              <div className="bar"></div>
            </div>
          </div>
          <div id="control-panel" className={'control-panel' + (props.isPlaying ? ' active':'')}>
            <div className="album-art">
              <img src={props.trackInfo.imgDisk || 'https://developer.spotify.com/assets/branding-guidelines/icon2@2x.png'} alt=""/>
            </div>
            <div className="controls">
              <div className="prev"></div>
              <div id="play" className={'play' + (props.isPlaying ? ' active':'')} onClick={props.play}></div>
              <div className="next"></div>
            </div>
          </div>
        </div>
      );
}




class App extends React.Component {
  constructor (props){
    super(props);
    this.state = {
      token: undefined,
      query:"",
      results: {},
      isPlayerActive: false,
      isPlaying: false,
      trackInfo: {},
      backgroundArrColors: [
        "linear-gradient(-50deg, rgb(255, 152, 0) 0%, rgb(251, 194, 235) 100%)", 
        "radial-gradient(circle at top right, rgb(255, 193, 7), rgb(251, 194, 235))", 
        "linear-gradient(to left, #a18cd1 0%, #fbc2eb 100%)", 
        "linear-gradient(to left bottom, #E91E63 0%, rgb(251, 194, 235) 100%)", 
        "linear-gradient(to left bottom, #e689de 0%, #520affde 100%)"],
      currentBackgroundColor:""
    } 
  }



  componentDidMount() {

	  let hashParams = {};
    let e, r = /([^&;=]+)=?([^&;]*)/g,
	    q = window.location.hash.substring(1);
	  // eslint-disable-next-line no-cond-assign
	  while (e = r.exec(q)) {
	    hashParams[e[1]] = decodeURIComponent(e[2]);
	  }
    // Get new token from url and set it in 
	  if(!hashParams.access_token) {
	    window.location.href = `https://accounts.spotify.com/authorize?client_id=edc96f4f8a5f477b91b6bb4e7c2efaad&response_type=token&redirect_uri=${window.location.href}callback`;
	  } else {
      this.setState({
        token: 'Bearer ' + hashParams.access_token
      });
    }

    // Set new color from arrColors to the UI.
    let randIndex = Math.floor(Math.random() * this.state.backgroundArrColors.length);
    this.setState({
      currentBackgroundColor: this.state.backgroundArrColors[randIndex]
    })
  }

  
  onChange = e => {
    // console.log(e.target.value);
    // Update state.query when input value has changed
    this.setState({
        query: e.target.value
    }, this.search);
  }


  // When the INPUT has changes, this function is called and it fetchs by state.QUERY  
  // Update data in state.RESULTS
  search = () => {
    if(this.state.query !==""){
      fetch(`https://api.spotify.com/v1/search?q=${this.state.query}&type=track,album,artist,playlist&limit=4`, {
          headers: {
            'Authorization': this.state.token,
          }
      })
        .then(response => response.json())
        .then(data => {
          console.log("SEARCH DATA", data)
          this.setState({
            results: data
          })
        }
        )
    }
  }

  setASong = (trackSong) => {
    let imgDisk = trackSong.images && trackSong.images[0] ? trackSong.images[0].url : trackSong.album && trackSong.album.images[0] ? trackSong.album.images[0].url : "";
    this.setState({
      isPlayerActive: true,
      isPlaying: true,
      trackInfo: {
        name: trackSong.name,
        imgDisk: imgDisk
      }
    })
    console.log("SET A SONG", this.state.trackInfo.name);
  }

  //Switch state.isPlaying
  play = () => {
    this.setState({
        isPlaying: !this.state.isPlaying
    })
  }

  render () {
    
    return (
        
          this.state.token ? 
            <div className="App">
              <header>
              {/*  wrapper content header */}
                <div className="wrapper">
                  <input type="text" onChange={this.onChange} value={this.state.query} name="search" placeholder="Search" />
                  <Player isPlaying={this.state.isPlaying} isPlayerActive={this.state.isPlayerActive} trackInfo={this.state.trackInfo} play={this.play} />
                </div>
              </header>
              <main>
              <div className="wrapper">
                  <div className="results"> {/* results */}
                    {/* <div className="mainResult">
                      <div>
                        
                        // Main Result -> by Popularity?
                        // check if it's track, album, artist, playlist finally render(this)

                      </div>
                    </div> */}
                    <div className="sections"> {/* sections */}
                            {
                              Object.keys(this.state.results).length > 0  ? 
                                  Object.keys(this.state.results).map((type, i) => 
                                  this.state.results[type].items && this.state.results[type].items.length ? <List key={i} styles={this.state.currentBackgroundColor} type={type} callbackSong={this.setASong} list={this.state.results[type].items} /> : ""
                              ) : ""
                            }
                    </div>
                  </div>
                </div>
              </main>
            </div>
            : 
            <div className="loader">Loading...</div>
          
    );
  }
}

export default App;
