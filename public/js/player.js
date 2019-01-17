window.onSpotifyWebPlaybackSDKReady = () => {
    const token = 'BQDg_yfV9CUxwhJulqjnvXYI3BUpzJ4riO05wrK53jENJjgo0Xm0Q8cBeP3p3tuyKS63Ndc1N3wt2JpIk7NyHulB4iri84q8rvPTln9bw0n9zg0iikQqmS43MRQdp7zdBP8rLPmdcRSW4hqyUB-Gx4pGSPXQ2pmPNeBXfqA8zn1WJw';
    const player = new Spotify.Player({
        name: 'Visualizer Player',
        getOAuthToken: cb => { cb(token); }
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });

    // Playback status updates
    player.addListener('player_state_changed', state => {
        console.log(state);
    });

    // Ready
    player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        play({
            spotify_uri: 'spotify:track:0GMAjrdGex5LHbLBzexcpa',
            playerInstance: (player),
        });
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player!
    player.connect();

    const play = ({
                      spotify_uri,
                      playerInstance: {
                          _options: {
                              getOAuthToken,
                              id
                          }
                      }
                  }) => {
        getOAuthToken(access_token => {
            fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
                method: 'PUT',
                body: JSON.stringify({ uris: [spotify_uri] }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                },
            });
        });
    };
};