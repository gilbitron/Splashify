<template>
	<div class="page-image-preview" v-if="selectedImage">
        <div class="image-preview">
			<div class="error-alert" v-if="error">
                There was an error setting the wallpaper. <button class="btn btn-positive" @click="closeError">Close</button>
            </div>

			<div class="padded-more">
				<div class="meta clearfix">
	                <div class="meta-right">
						<!--select class="form-control display-list" v-model="selectedDisplay">
							<option :value="display.id" v-for="(display, index) in displays">{{ index + 1 }}. {{ display.size.width }} x {{ display.size.height }}</option>
						</select-->
						<div class="btn-group">
							<button class="btn btn-large btn-default" :class="{ 'active': isCurrentWallpaper }" @click="setWallpaper">
								<span class="icon icon-monitor"></span>&nbsp;{{ setWallpaperButtonText }}
							</button>
							<button class="btn btn-large btn-default" @click="closeImage">
								<span class="icon icon-cancel-circled"></span>&nbsp;Close
							</button>
						</div>
	                </div>
	                <div class="meta-left">
	                    <a href="#" @click="openLink(selectedImage.user.links.html)">{{ selectedImage.user.name }}</a> /
	                    <a href="#" @click="openLink('https://unsplash.com/')">Unsplash</a>
						<span class="image-size">{{ imageSize }}</span>
						<span class="screen-size">
							(will be resized to {{ screenSize }})
						</span>
	                </div>
				</div>
			</div>

			<div class="is-loading" v-show="isLoadingImage">
    		    Loading...
    		</div>
			<div class="image-wrapper">
            	<img :src="selectedImage.urls.full" alt="" :class="{ 'loading': isLoadingImage }">
			</div>
        </div>
	</div>
</template>

<style>
	.page-image-preview {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background: #9aa0b0;
		overflow: auto;
	}

	.image-preview .padded-more { background: #f5f5f4; }
	.image-preview .image-wrapper {
		position: absolute;
		top: 70px;
		bottom: 0;
		width: 100%;
		box-shadow: inset 0 0 300px rgba(0,0,0,0.5);
	}
    .image-preview img {
		position: absolute;
		display: block;
		max-width: 100%;
		max-height: 100%;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		margin: auto;
		opacity: 1;
        transition: opacity 0.3s ease-out;
    }
	.image-preview img.loading { opacity: 0; }

	.image-preview .meta-left { line-height: 30px; }
	.image-preview .meta-right { float: right; }

	.image-preview .display-list {
		display: inline-block;
		width: auto;
	}
	.image-preview .image-size,
	.image-preview .screen-size { color: #999; }
	.image-preview .image-size { margin-left: 10px; }

	.image-preview .is-loading {
		text-align: center;
		padding: 20px;
	}
</style>

<script>
	import path from 'path';
	import electron from 'electron';
	import {ipcRenderer, shell} from 'electron';
    import imagesLoaded from 'imagesloaded';

	export default {
		props: ['selectedImage', 'currentWallpaper'],

        data() {
			return {
				displays: [],
				selectedDisplay: null,
                isLoadingImage: false,
                downloadingImage: false,
				processingStatus: '',
				screenSize: '',
				imageSize: '',
				error: null,
			}
		},

		computed: {
			isCurrentWallpaper() {
				if (!this.currentWallpaper || !this.selectedImage) {
					return false;
				}

				return path.basename(this.currentWallpaper, '.jpeg') == path.basename(this.selectedImage.urls.raw);
			},
			setWallpaperButtonText() {
				if (this.downloadingImage) {
					return this.processingStatus;
				}
				if (this.isCurrentWallpaper) {
					return 'Current Wallpaper';
				}

				return 'Set Wallpaper';
			}
		},

        created() {
			//this.displays = electron.screen.getAllDisplays();
			//this.selectedDisplay = this.displays[0].id;

			const display = electron.screen.getPrimaryDisplay();
			const {width, height} = display.size;
			this.screenSize = (width * display.scaleFactor) + 'x' + (height * display.scaleFactor);

            ipcRenderer.on('image-downloaded', (event, arg) => {
                this.imageDownloaded(arg);
            });
            ipcRenderer.on('wallpaper-updated', (event, arg) => {
                this.wallpaperUpdated(arg);
            });
			ipcRenderer.on('image-error', (event, arg) => {
				this.error = arg;
				this.processingStatus = '';
				this.downloadingImage = false;
                console.log(this.error);
            });
        },

        methods: {
            closeImage() {
                this.$emit('image-closed');
			},
			openLink(link) {
				shell.openExternal(link);
			},

			setWallpaper() {
				if (this.isCurrentWallpaper) {
					return false;
				}
                if (this.downloadingImage != false) {
                    return;
                }

                this.downloadingImage = true;
				this.processingStatus = 'Downloading...';
                ipcRenderer.send('download-image', this.selectedImage.urls.raw);
			},
            imageDownloaded(imagePath) {
				this.processingStatus = 'Processing...';
                ipcRenderer.send('set-wallpaper', imagePath, this.selectedDisplay);
            },
            wallpaperUpdated(imagePath) {
				this.processingStatus = '';
				this.$emit('wallpaper-updated', imagePath);
				this.downloadingImage = false;
            },

			closeError() {
				this.error = null;
			}
        },

        watch: {
			selectedImage: function(newValue, oldValue) {
				if (newValue) {
					this.imageSize = newValue.width + 'x' + newValue.height;
                    this.isLoadingImage = true;

                    this.$nextTick(() => {
    					imagesLoaded('.image-preview', () => {
    						this.isLoadingImage = false;
    					});
    				});
                }
			}
		}
	}
</script>
