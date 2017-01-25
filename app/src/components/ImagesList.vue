<template>
    <div class="page-images-list">
        <div class="padded-more">
            <div class="error-alert" v-if="error">
                There was an error fetching images. <button class="btn btn-positive" @click="retry">Retry</button>
            </div>
            <div v-if="selectedType == 'search'">
                <div class="form-group">
                    <input type="text" class="form-control" placeholder="Enter search query and hit enter to search..." v-model.lazy.trim="searchQuery" :disabled="isSearching">
                </div>
            </div>
            <div class="no-images-found" v-if="showNoImagesFound">
                No images found
            </div>
            <div class="images-list" ref="imagesList">
                <div class="overlay" v-show="showLoader">
                    <i class="fa fa-spinner fa-spin fa-2x fa-fw"></i>
                </div>
                <a href="#" class="image" :style="{ backgroundColor: image.color }" @click="selectImage(image)" v-for="image in images" v-if="image">
                    <img :src="image.urls.small" alt="" class="loading">
                </a>
            </div>
            <infinite-loading :on-infinite="onInfinite" ref="infiniteLoading"></infinite-loading>
        </div>
    </div>
</template>

<style>
    .images-list {
        position: relative;
        min-height: 250px;
    }
	.images-list .image {
		display: block;
		text-decoration: none;
        width: calc(20% - 5px);
		margin: 0 5px 5px 0;
	}

	.images-list .image img {
		display: block;
		width: 100%;
		height: auto;
        opacity: 1;
        transition: opacity 0.3s ease-out;
	}
    .images-list .image img.loading { opacity: 0; }

    @media screen and (max-width: 1800px) {
        .images-list .image { width: calc(25% - 5px); }
    }
    @media screen and (max-width: 1400px) {
        .images-list .image { width: calc(33.333% - 5px); }
    }
    @media screen and (max-width: 1000px) {
        .images-list .image { width: calc(50% - 5px); }
    }
    @media screen and (max-width: 600px) {
        .images-list .image { width: calc(100% - 5px); }
    }

    .images-list .overlay {
        position: absolute;
        top: 0;
		right: 0;
		bottom: 0;
		left: 0;
        background: #fff;
        z-index: 2;
        text-align: center;
        padding: 100px 0;
    }

    .error-alert {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 999;
        padding: 10px 15px;
        background: #fc605b;
        color: #fff;
        border-radius: 5px;
        box-shadow: 0 1px 10px rgba(0,0,0,0.2);
        line-height: 24px;
    }
    .error-alert button { margin-left: 5px; }
</style>

<script>
    import util from '../mixins/util';
    import unsplash from '../mixins/unsplash';
    import storage from 'electron-json-storage';
    import Masonry from 'masonry-layout';
	import imagesLoaded from 'imagesloaded';
    import InfiniteLoading from 'vue-infinite-loading';

	export default {
		props: ['selectedType', 'selectedImage'],
        mixins: [util, unsplash],

		data() {
			return {
                images: [],
                page: 1,
				perPage: 20,
                isLoading: false,
                isRefreshingLayout: false,
				layoutEngine: null,
                searchQuery: '',
                searchImagesFound: 0,
                isSearching: false,
                error: null,
			}
		},

		computed: {
			cacheLabel() {
                var label = 'images-' + this.selectedType + '-' + this.perPage + '-' + this.page;

                if (this.selectedType == 'search' && this.searchQuery) {
                    label += '-' + encodeURIComponent(this.searchQuery);
                }

				return label;
			},
            showLoader() {
                return (this.isLoading || this.isSearching || this.isRefreshingLayout) && this.page == 1;
            },
            showNoImagesFound() {
                return this.selectedType == 'search' && this.searchQuery && this.searchImagesFound < 1;
            }
		},

        created() {
            this.getImages();
        },

        methods: {
			getImages() {
				this.isLoading = true;
				storage.get(this.cacheLabel, function(error, data) {
	                if (error) throw error;

	                if (this.objectIsEmpty(data)) {
	                    this.fetchImages();
	                } else {
                        this.setImages(data);
						this.refreshLayout();
	                }
	            }.bind(this));
			},
            fetchImages() {
                let promise = null;

                if (this.selectedType == 'curated') {
                    promise = this.unsplashListCuratedPhotos(this.page, this.perPage, 'latest');
                } else if (this.selectedType == 'search' && this.searchQuery) {
                    promise = this.unsplashSearchPhotos(this.searchQuery, this.page, this.perPage);
                    this.isSearching = true;
                } else {
                    promise = this.unsplashListPhotos(this.page, this.perPage, this.selectedType);
                }

                if (!promise) {
                    return;
                }

                promise.then(response => {
                            return response.json();
                        })
                        .then(data => {
                            if (data.errors) {
                                throw data.errors;
                            }

                            if (this.selectedType == 'search') {
                                this.isSearching = false;
                            }

                            this.setImages(data);
                            storage.set(this.cacheLabel, data);
                            this.refreshLayout();
                        })
                        .catch(error => {
                            this.$refs.infiniteLoading.$emit('$InfiniteLoading:loaded');
                            this.error = error;
                            console.log(this.error);
                        });
            },
            setImages(data) {
                if (this.selectedType == 'search') {
                    this.searchImagesFound = data.total ? data.total : 0;
                    data = data.results;
                }

                data = this.images.concat(data);
                this.images = data;
            },
            onInfinite() {
                if (this.isLoading || this.isRefreshingLayout) {
                    this.$refs.infiniteLoading.$emit('$InfiniteLoading:loaded');
                    return;
                }

                this.page++;
                this.getImages();
            },
            retry() {
                this.error = null;
                this.getImages();
            },

			refreshLayout() {
                this.isRefreshingLayout = true;
                this.isLoading = false;

				this.$nextTick(() => {
                    if (!this.layoutEngine) {
                        this.layoutEngine = new Masonry(this.$refs.imagesList, {
                            itemSelector: '.image',
                            percentPosition: true,
                            transitionDuration: 0,
                            initLayout: false,
                        });

                        this.layoutEngine.on('layoutComplete', () => {
                            this.isRefreshingLayout = false;
                        });
                    }

                    this.layoutEngine.reloadItems();

					imagesLoaded('.images-list', () => {
                        this.layoutEngine.layout();
					}).on('progress', (instance, image) => {
                        if(image.isLoaded) {
                            image.img.className = '';
                        }
                    });

                    this.$refs.infiniteLoading.$emit('$InfiniteLoading:loaded');
				});
			},

			selectImage(image) {
                this.$emit('image-selected', image);
			},
            resetData() {
                this.images = [];
                this.page = 1;
                this.$parent.$refs.mainPane.scrollTop = 0;
                this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset');
                this.layoutEngine = null;
            }
        },

		watch: {
			selectedType: function(newValue, oldValue) {
                this.searchQuery = '';
                this.searchImagesFound = 0;

                this.resetData();
				this.getImages();
			},
            searchQuery: function(newValue, oldValue) {
                this.resetData();
				this.getImages();
            }
		},

        components: {
            InfiniteLoading,
        }
	}
</script>
