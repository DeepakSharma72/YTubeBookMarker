
(() => {
    let youtubeRightContorls, youtubePlayer;
    let currentVideo = "", currentVideoBookMarks = [];

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;
        console.log('type: ', type, 'video id: ', videoId);
        if (type === "NEW") {
            // console.log('type: ', type, 'video id: ', videoId);
            currentVideo = videoId;
            newVideoLoaded();
        }
        else if(type === "PLAY")
        {
            youtubePlayer.currentTime = value;
        }
        else if(type === "DELETE")
        {
            console.log(currentVideoBookMarks);
            // console.log('delete time: ', value, currentVideo);
            currentVideoBookMarks = currentVideoBookMarks.filter((val) => (val.time != value));
            // console.log(currentVideoBookMarks);
            chrome.storage.sync.set({
                [currentVideo]: JSON.stringify(currentVideoBookMarks)   
            });
            response(currentVideoBookMarks);
        }
    });


    const newVideoLoaded =  () => {
        const bookmarBtnExists = document.getElementsByClassName('bookmark-btn')[0];
        if (!bookmarBtnExists) {
            const bookmarkBtn = document.createElement('img');
            bookmarkBtn.src = chrome.runtime.getURL('assets/bookmark.png');
            bookmarkBtn.className = 'ytp-button bookmark-btn';
            bookmarkBtn.title = 'Click to bookmark current timestamp';

            youtubeRightContorls = document.getElementsByClassName('ytp-right-controls')[0];
            youtubePlayer = document.getElementsByClassName('video-stream')[0];

            if (youtubeRightContorls)
            {
                youtubeRightContorls.appendChild(bookmarkBtn);
            }

            bookmarkBtn.addEventListener('click', addNewBookmarkEventHandler);
        }
    }

    const fetchBookMarks = () => {
        if(!currentVideo)
        {
            console.log('no video avialable');
            return;
        }
        return new Promise((resolve) => {
            chrome.storage.sync.get([currentVideo], (obj) => {
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
            })
        });
    }


    const addNewBookmarkEventHandler = () => {
        // console.log('click hua kia bhola');
        const currentTime = youtubePlayer.currentTime;
        const newBookmark = {
            time: currentTime,
            desc: 'Bookmark at ' + getTime(currentTime)
        };
        console.log(newBookmark);
        console.log('-> ', currentVideo);
        fetchBookMarks().then(existingBookmarks => {
            currentVideoBookMarks = [...existingBookmarks, newBookmark].sort((a, b) => (a.time - b.time));
    
            chrome.storage.sync.set({
                [currentVideo]: JSON.stringify(currentVideoBookMarks)   
            });
        });
    }

    const getTime = (t) => {
        let date = new Date(0);
        date.setSeconds(t);
        return date.toISOString().substr(11, 8);
    };



    newVideoLoaded();
})();