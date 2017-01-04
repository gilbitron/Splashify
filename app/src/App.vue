<template>
    <div class="window">
        <div class="window-content">
            <div class="pane-sm sidebar">
                <Sidebar :selected-type="selectedType" v-on:type-updated="updateType"></Sidebar>
                <div class="update-available" v-if="updateAvailable">
                    <strong>{{ updateAvailable }}</strong>
                    <button class="btn btn-positive" @click="installUpdate">Install &amp; Restart</button>
                </div>
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
    .update-available {
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 999;
        padding: 10px 15px;
        background: #fff;
        border-radius: 5px;
        box-shadow: 0 1px 10px rgba(0,0,0,0.2);
        line-height: 24px;
    }
    .update-available button { margin-left: 5px; }
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
                updateAvailable: false,
			}
		},

        created() {
            ipcRenderer.send('get-wallpaper');
			ipcRenderer.on('current-wallpaper', (event, arg) => {
                this.currentWallpaper = arg;
            });
            ipcRenderer.on('update-available', (event, message) => {
                this.updateAvailable = message;
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
            },
            installUpdate() {
                ipcRenderer.send('install-update');
            }
        },

        components: {
            Sidebar,
            ImagesList,
            ImagePreview
        }
	}
</script>
