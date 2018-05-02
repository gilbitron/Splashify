<template>
    <nav class="nav-group">
        <h5 class="nav-group-title">Unsplash</h5>
        <a href="#" class="nav-group-item" :class="{ 'active': selectedType == 'curated' }" @click="updateType('curated')">
            <span class="icon icon-thumbs-up"></span> Curated
        </a>
        <a href="#" class="nav-group-item" :class="{ 'active': selectedType == 'popular' }" @click="updateType('popular')">
            <span class="icon icon-star"></span> Popular
        </a>
        <a href="#" class="nav-group-item" :class="{ 'active': selectedType == 'latest' }" @click="updateType('latest')">
            <span class="icon icon-picture"></span> Latest
        </a>
        <a href="#" class="nav-group-item" :class="{ 'active': selectedType == 'search' }" @click="updateType('search')">
            <span class="icon icon-search"></span> Search
        </a>
    </nav>
</template>

<script>
    export default {
        props: ['selectedType'],

        methods: {
            updateType(type) {
                this.$emit('type-updated', type);
            }
        }
    }
</script>
