import { getActiveTabURL } from './utils.js'


const addNewBookmark = (bookmarksElement, bookmark) => {
    const bookmarkTitleElement = document.createElement('div');
    const newBookmarkElement = document.createElement('div');
    const controlElement = document.createElement('div');

    bookmarkTitleElement.textContent = bookmark.desc;
    bookmarkTitleElement.className = 'bookmark-title';

    controlElement.className = 'bookmark-controls';

    newBookmarkElement.id = 'bookmark-' + bookmark.time;
    newBookmarkElement.className = 'bookmark';
    newBookmarkElement.setAttribute('timestamp', bookmark.time);

    setBookmarkAttributes("play", onPlay, controlElement);
    setBookmarkAttributes("delete", onDelete, controlElement);

    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlElement);
    bookmarksElement.appendChild(newBookmarkElement);
}

const onDelete = async (e) => {
    const activeTab = await getActiveTabURL();
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute('timestamp');
    const bookmarkElementToDelete = document.getElementById("bookmark-"+bookmarkTime);

    bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);
    chrome.tabs.sendMessage(activeTab.id, {
        type: "DELETE",
        value: bookmarkTime
    }, viewBookmarks);
}

const onPlay = async (e) => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute('timestamp');
    const activeTab = await getActiveTabURL();

    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        value: bookmarkTime
    })

}

const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
    const controlElement = document.createElement('img');
    controlElement.src = "assets/" + src + ".png";
    controlElement.title = src;
    controlElement.addEventListener('click', eventListener);
    controlParentElement.appendChild(controlElement);
}

const viewBookmarks = (currentBookmarks = []) => {
    const bookmarksElement = document.getElementById('bookmarks');
    bookmarksElement.innerHTML = "";

    if (currentBookmarks.length > 0) {
        for (let i = 0; i < currentBookmarks.length; i++) {
            const bookmark = currentBookmarks[i];
            addNewBookmark(bookmarksElement, bookmark);
        }
    }
    else {
        bookmarksElement.innerHTML = '<i class = "row">No bookmarks to show</i>';
    }
}


document.addEventListener("DOMContentLoaded", async () => {
    console.log('document loaded message');
    const activeTab = await getActiveTabURL();

    const queryParameters = activeTab.url.split('?')[1];
    // console.log('q: ->', queryParameters);

    if (!queryParameters) {
        const container = document.getElementsByClassName('container')[0];
        container.innerHTML = '<div class = "title">This is not a youtube video page.</div>'
        return;
    }

    const urlParameters = new URLSearchParams(queryParameters);
    const currentVideo = urlParameters.get('v');


    if (activeTab.url.includes('youtube.com/watch') && currentVideo) {
        chrome.storage.sync.get([currentVideo], (data) => {
            const currentVideoBookMarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];
            console.log('current video: ', currentVideo);
            console.log('bookmarks: ', currentVideoBookMarks);
            viewBookmarks(currentVideoBookMarks);
        })
    }
    else {
        // console.log('aya kia');
        const container = document.getElementsByClassName('container')[0];
        container.innerHTML = '<div class = "title">This is not a youtube video page.</div>'
    }
});