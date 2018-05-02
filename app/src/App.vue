<template>
    <div class="window">
        <div class="window-content">
            <div class="pane-sm sidebar">
                <Sidebar :selected-type="selectedType" v-on:type-updated="updateType"></Sidebar>
                <div class="update-available" v-if="updateAvailable">
                    <strong>{{ updateAvailable }}</strong>
                    <button class="btn btn-positive" @click="installUpdate">Install &amp; Restart</button>
                </div>
                <transition name="fade">
                    <div class="is-offline" v-if="isOffline">
                        <div>
                            <i class="fa fa-wifi" aria-hidden="true"></i>
                            <p>
                                Splashify requires an internet connection to work.<br>
                                Please connect to the internet.
                            </p>
                        </div>
                    </div>
                </transition>
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

    .is-offline {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 9999;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .is-offline div { text-align: center; }
    .is-offline p { margin: 0; }
    .is-offline .fa {
        font-size: 100px;
        margin-bottom: 20px;
    }

    .fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease-out; }
    .fade-enter, .fade-leave-to { opacity: 0; }
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
                isOffline: false,
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
            ipcRenderer.send('get-connection-status');
            ipcRenderer.on('connection-status', (event, status) => {
                if (status == 'offline') {
                    this.isOffline = true;
                } else {
                    this.isOffline = false;
                }
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
