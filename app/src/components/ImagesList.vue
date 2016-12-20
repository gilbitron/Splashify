<template>
    <div class="page-images-list">
        <div class="padded-more">
            <div class="images-list" ref="imagesList">
                <a href="#" class="image" :style="{ backgroundColor: image.color }" @click="selectImage(image)" v-for="image in images">
                    <img :src="image.urls.small" alt="" class="loading">
                </a>
            </div>
            <infinite-loading :on-infinite="onInfinite" ref="infiniteLoading"></infinite-loading>
        </div>
    </div>
</template>

<style>
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
			}
		},

		computed: {
			cacheLabel() {
				return 'images-' + this.selectedType + '-' + this.perPage + '-' + this.page;
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
                this.unsplash.photos.listPhotos(this.page, this.perPage, this.selectedType)
                    .then(response => {
                        return response.json();
                    })
                    .then(data => {
                        this.setImages(data);
                        storage.set(this.cacheLabel, data);
                        this.refreshLayout();
                    });
            },
            setImages(data) {
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
			}
        },

		watch: {
			selectedType: function(newValue, oldValue) {
                this.images = [];
                this.page = 1;
                this.$parent.$refs.mainPane.scrollTop = 0;
                this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset');
                this.layoutEngine = null;

				this.getImages();
			}
		},

        components: {
            InfiniteLoading,
        }
	}
</script>
