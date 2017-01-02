<template>
    <div class="window">
        <div class="window-content">
            <div class="pane-sm sidebar">
                <Sidebar :selected-type="selectedType" v-on:type-updated="updateType"></Sidebar>
            </div>
            <div class="pane main-pane" ref="mainPane">
        		<ImagesList :selected-type="selectedType" :selected-image="selectedImage" v-on:image-selected="imageSelected"></ImagesList>
                <ImagePreview :selected-image="selectedImage" :current-wallpaper="currentWallpaper" v-on:wallpaper-updated="wallpaperUpdated" v-on:image-closed="imageClosed"></ImagePreview>
            </div>
        </div>
	</div>
</template>

<style>
    .main-pane { position: relative; }
</style>

<script>
    import electron from 'electron';
    import {ipcRenderer} from 'electron';
    import Sidebar from './components/Sidebar.vue';
    import ImagesList from './components/ImagesList.vue';
    import ImagePreview from './components/ImagePreview.vue';

	export default {
		data() {
			return {
                selectedType: 'curated',
                selectedImage: null,
                lastWallpaper: null,
                currentWallpaper: null,
			}
		},

        created() {
            ipcRenderer.send('get-wallpaper');
			ipcRenderer.on('current-wallpaper', (event, arg) => {
                this.currentWallpaper = arg;
            });
        },

        methods: {
            updateType(type) {
                this.selectedType = type;
                this.selectedImage = null;
            },
            imageSelected(image) {
                this.selectedImage = image;
            },
            imageClosed() {
                this.selectedImage = null;
            },
            wallpaperUpdated(imagePath) {
                this.lastWallpaper = this.currentWallpaper;
                this.currentWallpaper = imagePath;
            }
        },

        components: {
            Sidebar,
            ImagesList,
            ImagePreview
        }
	}
</script>
