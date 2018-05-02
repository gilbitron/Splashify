import fetch from 'node-fetch';
import packageJson from '../../package.json';

export default {
    data() {
        return {
            apiOptions: {
                headers: {
                    'User-Agent': 'Splashify v' + packageJson.version
                }
            }
        }
    },

    computed: {
        apiBase() {
            if (process.env.NODE_ENV === 'development') {
                return 'http://api.splashify.loc';
            }

            return 'https://api.splashify.net';
        }
    },

    methods: {
        unsplashListPhotos(page, perPage, orderBy) {
            return fetch(this.apiBase + '/photos?page=' + page + '&per_page=' + perPage + '&order_by=' + orderBy, this.apiOptions);
        },
        unsplashListCuratedPhotos(page, perPage, orderBy) {
            return fetch(this.apiBase + '/photos/curated?page=' + page + '&per_page=' + perPage + '&order_by=' + orderBy, this.apiOptions);
        },
        unsplashSearchPhotos(query, page, perPage) {
            return fetch(this.apiBase + '/search/photos?query=' + query + '&page=' + page + '&per_page=' + perPage, this.apiOptions);
        },
        usplashDownloadEvent(photoId) {
            return fetch(this.apiBase + '/photos/' + photoId + '/download', this.apiOptions);
        }
    }
}
